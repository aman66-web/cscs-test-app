// =============================================================================
// VERDICT — model routing.
//
// Model routing is where the business lives or dies, so the policy is written
// down in one place rather than scattered across route handlers.
//
//   STRONG  — witness responses and jury deliberation. These two are the only
//             places where quality IS the product, so they get the good model.
//   FAST    — everything decorative. Court TV headlines, commentary feed,
//             client messages, rival banter. None of that ships in Milestone 1;
//             the routing is here so Milestone 3 has nowhere to go wrong.
//
// Cost control, in the order it matters:
//   1. Witness replies are capped at two or three sentences. Long witness
//      monologues cost money and kill pace at the same time — the constraint
//      is doing double duty.
//   2. Case context and the witness persona are FIXED for the whole trial, so
//      they sit in a cached system block and are not re-sent at full price on
//      every question.
//   3. Structured output everywhere. We parse and render the scorecard
//      ourselves; the model never free-writes it.
// =============================================================================

import "server-only";

import Anthropic from "@anthropic-ai/sdk";

/** Model IDs are env-overridable so routing can be tuned without a deploy. */
export const MODELS = {
  strong: process.env.VERDICT_STRONG_MODEL || "claude-opus-5",
  fast: process.env.VERDICT_FAST_MODEL || "claude-haiku-4-5",
} as const;

/**
 * Fast mode runs the same Opus model at up to ~2.5x output tokens/sec for a
 * premium rate. Cross-examination lives or dies on the witness answering
 * quickly, so this is the first dial to turn if replies feel slow — but it is
 * off by default because it is genuinely more expensive per trial.
 * Set VERDICT_FAST_MODE=1 to enable.
 */
const FAST_MODE = process.env.VERDICT_FAST_MODE === "1";

export class ModelNotConfiguredError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY is not set.");
    this.name = "ModelNotConfiguredError";
  }
}

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) throw new ModelNotConfiguredError();
  if (!client) client = new Anthropic();
  return client;
}

export type JsonSchema = Record<string, unknown>;

type GenerateArgs = {
  model: string;
  /**
   * System blocks in stable-first order. Anything marked `cache: true` gets a
   * cache breakpoint — put the frozen case context there and the volatile
   * per-turn text after it, or the cache is invalidated every single turn.
   */
  system: { text: string; cache?: boolean }[];
  messages: Anthropic.MessageParam[];
  schema: JsonSchema;
  maxTokens: number;
  /** Lower effort = faster and cheaper. The witness runs at "low" on purpose. */
  effort?: "low" | "medium" | "high";
};

export class ModelRefusedError extends Error {
  constructor(category: string | null | undefined) {
    super(`The model declined this request${category ? ` (${category})` : ""}.`);
    this.name = "ModelRefusedError";
  }
}

export class ModelShapeError extends Error {
  constructor(detail: string) {
    super(`Model returned an unusable response: ${detail}`);
    this.name = "ModelShapeError";
  }
}

/**
 * One structured-output call. Returns parsed JSON matching `schema`.
 *
 * Structured outputs guarantee the response is schema-valid JSON, so this
 * parses rather than repairing. A parse failure here means something genuinely
 * went wrong (truncation, refusal) and should surface, not be papered over.
 */
export async function generateJSON<T>(args: GenerateArgs): Promise<T> {
  const anthropic = getClient();

  const system: Anthropic.TextBlockParam[] = args.system.map((block) => ({
    type: "text",
    text: block.text,
    ...(block.cache ? { cache_control: { type: "ephemeral" as const } } : {}),
  }));

  const params: Anthropic.MessageCreateParamsNonStreaming = {
    model: args.model,
    max_tokens: args.maxTokens,
    system,
    messages: args.messages,
    output_config: {
      effort: args.effort ?? "low",
      format: { type: "json_schema", schema: args.schema },
    },
  };

  const response = FAST_MODE
    ? await anthropic.beta.messages.create({
        ...params,
        betas: ["fast-mode-2026-02-01"],
        speed: "fast",
      })
    : await anthropic.messages.create(params);

  if (response.stop_reason === "refusal") {
    throw new ModelRefusedError(response.stop_details?.category);
  }
  if (response.stop_reason === "max_tokens") {
    throw new ModelShapeError("response was truncated before the JSON closed");
  }

  const text = response.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("")
    .trim();

  if (!text) throw new ModelShapeError("empty response");

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ModelShapeError("response was not valid JSON");
  }
}

/** Map an SDK error to a status code and a line the player should actually see. */
export function modelErrorResponse(err: unknown): {
  status: number;
  error: string;
} {
  if (err instanceof ModelNotConfiguredError) {
    return {
      status: 503,
      error:
        "The court isn't in session — this build has no ANTHROPIC_API_KEY configured.",
    };
  }
  if (err instanceof Anthropic.RateLimitError) {
    return {
      status: 429,
      error: "The court is busy. Give it a moment and ask again.",
    };
  }
  if (err instanceof Anthropic.AuthenticationError) {
    return { status: 503, error: "The court isn't in session — bad API key." };
  }
  if (err instanceof ModelRefusedError || err instanceof ModelShapeError) {
    return { status: 502, error: "The witness didn't answer. Try that again." };
  }
  if (err instanceof Anthropic.APIError) {
    return { status: 502, error: "The witness didn't answer. Try that again." };
  }
  return { status: 500, error: "Something went wrong in there. Try again." };
}
