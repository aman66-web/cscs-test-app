// =============================================================================
// POST /api/verdict/witness — one question, one answer.
//
// The order of operations here is the whole game, so it is worth spelling out:
//
//   1. The model adjudicates which authored crack conditions the question
//      pinned down, and writes an in-character evasion.
//   2. THE ENGINE — not the model — folds that into cumulative state and
//      decides whether the last condition just landed.
//   3. If it did, the model's evasion is thrown away and the AUTHORED
//      crackResponse is played verbatim.
//
// Step 3 is why every player who earns the crack sees the same payoff, and why
// a witness can never talk their way out of one. Nothing this route returns
// contains a hidden fact, a condition label, or the crack response before it
// has been earned.
// =============================================================================

import { NextResponse } from "next/server";
import { getCase } from "@/lib/verdict/cases";
import {
  applyTurn,
  exhibitsCitedIn,
  pressure,
  reconcile,
  TRIAL_LIMITS,
  type CrossState,
} from "@/lib/verdict/engine";
import { generateJSON, MODELS, modelErrorResponse } from "@/lib/verdict/model";
import {
  WITNESS_SCHEMA,
  witnessMessages,
  witnessSystemStable,
  witnessSystemTurn,
  type WitnessTurn,
} from "@/lib/verdict/prompts";
import type { Exchange } from "@/lib/verdict/types";

export const runtime = "nodejs";

/** A witness answer is two or three sentences. Cap it and the cost caps too. */
const MAX_TOKENS = 400;
const MAX_QUESTION_CHARS = 600;

type Body = {
  caseId?: string;
  witnessId?: string;
  question?: string;
  exchanges?: Exchange[];
  state?: CrossState;
};

// Best-effort burst limit. Real per-user cost control arrives with accounts in
// Milestone 2 (free tier: two trials a day); this just blunts scripted abuse
// of a paid endpoint that sits behind no login.
const RATE_LIMIT = 40;
const RATE_WINDOW_MS = 60_000;
const recent = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const hits = (recent.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_LIMIT) {
    recent.set(key, hits);
    return true;
  }
  hits.push(now);
  recent.set(key, hits);
  if (recent.size > 5000) recent.clear();
  return false;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: "The court is busy. Give it a moment." },
      { status: 429 }
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const trialCase = body.caseId ? getCase(body.caseId) : undefined;
  if (!trialCase) {
    return NextResponse.json({ error: "No such case." }, { status: 404 });
  }

  const witness =
    trialCase.witnesses.find((w) => w.id === body.witnessId) ??
    trialCase.witnesses[0];
  if (!witness) {
    return NextResponse.json({ error: "No such witness." }, { status: 404 });
  }

  const question = (body.question ?? "").trim().slice(0, MAX_QUESTION_CHARS);
  if (!question) {
    return NextResponse.json({ error: "Ask a question first." }, { status: 400 });
  }

  // Replay the cross so far. Trimmed to the limit so a tampered payload can't
  // grow the context (and the bill) without bound.
  const exchanges = (Array.isArray(body.exchanges) ? body.exchanges : [])
    .filter(
      (ex): ex is Exchange =>
        !!ex && typeof ex.question === "string" && typeof ex.answer === "string"
    )
    .slice(-TRIAL_LIMITS.maxQuestions);

  if (exchanges.length >= TRIAL_LIMITS.maxQuestions) {
    return NextResponse.json(
      {
        error: `${trialCase.judge.name}: "That will do. Closing argument, when you're ready."`,
        code: "out_of_questions",
      },
      { status: 409 }
    );
  }

  // Never trust the browser's word for what has been established.
  const prior = reconcile(witness, body.state);

  try {
    const turn = await generateJSON<WitnessTurn>({
      model: MODELS.strong,
      system: [
        // Frozen for the whole trial — carries the cache breakpoint so the
        // case, the persona and the hidden facts are not re-billed every turn.
        { text: witnessSystemStable(trialCase, witness), cache: true },
        // Volatile, so it must sit AFTER the breakpoint.
        { text: witnessSystemTurn(prior.cracked) },
      ],
      messages: witnessMessages(exchanges, question),
      schema: WITNESS_SCHEMA,
      maxTokens: MAX_TOKENS,
      // The witness is doing a short in-character reply plus a narrow
      // classification. Low effort keeps the answer inside the window where
      // cross-examination still feels like a conversation.
      effort: "low",
    });

    const claimed = Array.isArray(turn.establishes) ? turn.establishes : [];
    const { next, landed, mode } = applyTurn(witness, prior, claimed);

    // THE MOMENT. Authored, identical for everyone who earns it, and chosen
    // here by the engine rather than by the model that just wrote the evasion.
    const answer =
      mode === "crack" ? witness.crackResponse : (turn.reply ?? "").trim();

    const demeanour =
      mode === "crack" ? witness.crackDemeanour : witness.demeanour;

    const exchange: Exchange = {
      question,
      answer,
      mode,
      landed,
      exhibitsCited: exhibitsCitedIn(question, trialCase.exhibits),
    };

    return NextResponse.json({
      exchange,
      demeanour,
      state: next,
      pressure: pressure(witness, next),
      questionsUsed: exchanges.length + 1,
      questionsLeft: TRIAL_LIMITS.maxQuestions - (exchanges.length + 1),
    });
  } catch (err) {
    const { status, error } = modelErrorResponse(err);
    if (status >= 500) console.error("[verdict/witness]", err);
    return NextResponse.json({ error }, { status });
  }
}
