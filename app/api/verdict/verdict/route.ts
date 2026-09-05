// =============================================================================
// POST /api/verdict/verdict — deliberation and the scorecard.
//
// Two model calls, and neither of them decides anything:
//
//   1. JUDGEMENT — scores clarity, credibility and narrative, the three
//      dimensions a machine cannot count. Evidence and contradictions are
//      computed here from exhibit matching and the engine's condition state.
//   2. Code counts the votes. Weighted score against a seeded per-juror
//      threshold. This is the verdict, and it is arithmetic.
//   3. REASONING — writes each juror's stated reasons for the vote they have
//      ALREADY been given.
//
// Splitting it this way is what makes a loss feel earned. The player can read
// twelve sentences explaining exactly which juror wanted what, and none of it
// was made up after the fact to justify a result the model preferred.
// =============================================================================

import { NextResponse } from "next/server";
import { getCase } from "@/lib/verdict/cases";
import { panelFor } from "@/lib/verdict/jurors";
import {
  badgering,
  bestExchange,
  exhibitsCitedIn,
  reconcile,
  TRIAL_LIMITS,
  type CrossState,
} from "@/lib/verdict/engine";
import { generateJSON, MODELS, modelErrorResponse } from "@/lib/verdict/model";
import {
  JUDGEMENT_SCHEMA,
  judgementInput,
  judgementSystem,
  REASONING_SCHEMA,
  reasoningInput,
  reasoningSystem,
  type Judgement,
  type ReasoningOutput,
} from "@/lib/verdict/prompts";
import {
  assembleScores,
  fullPlayerText,
  tally,
  toJurorVerdicts,
} from "@/lib/verdict/scoring";
import type { Exchange, Scorecard } from "@/lib/verdict/types";

export const runtime = "nodejs";

const MAX_STATEMENT_CHARS = 3000;

type Body = {
  caseId?: string;
  witnessId?: string;
  opening?: string;
  closing?: string;
  exchanges?: Exchange[];
  state?: CrossState;
};

export async function POST(req: Request) {
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

  const panel = panelFor(trialCase.jurorIds);
  if (panel.length === 0) {
    return NextResponse.json({ error: "No jury empanelled." }, { status: 500 });
  }

  const opening = (body.opening ?? "").trim().slice(0, MAX_STATEMENT_CHARS);
  const closing = (body.closing ?? "").trim().slice(0, MAX_STATEMENT_CHARS);
  const exchanges = (Array.isArray(body.exchanges) ? body.exchanges : [])
    .filter(
      (ex): ex is Exchange =>
        !!ex && typeof ex.question === "string" && typeof ex.answer === "string"
    )
    .slice(0, TRIAL_LIMITS.maxQuestions);

  // Re-derive rather than trusting the client's summary of its own trial.
  const state = reconcile(witness, body.state);
  const conditionsTotal = witness.crackConditions.length;
  const conditionsLanded = state.established.length;

  // Deterministic, no model: which exhibits did the player actually name?
  const exhibitsUsed = exhibitsCitedIn(
    fullPlayerText(opening, exchanges, closing),
    trialCase.exhibits
  );
  const badger = badgering(exchanges);

  try {
    // ---- 1. Score the three dimensions that need reading --------------------
    const judgement = await generateJSON<Judgement>({
      model: MODELS.strong,
      system: [{ text: judgementSystem(trialCase), cache: true }],
      messages: [
        {
          role: "user",
          content: judgementInput(
            { opening, exchanges, closing },
            {
              cracked: state.cracked,
              conditionsLanded,
              conditionsTotal,
              exhibitsUsed,
              badger,
            }
          ),
        },
      ],
      schema: JUDGEMENT_SCHEMA,
      maxTokens: 1500,
      // Quality is the product here, and this runs once per trial rather than
      // once per question — so it can afford to think.
      effort: "medium",
    });

    // ---- 2. Count the votes. Code only. -------------------------------------
    const scores = assembleScores(trialCase, judgement, {
      exhibitsUsed,
      conditionsLanded,
      conditionsTotal,
      badger,
    });

    const { votes, votesFor, won } = tally(trialCase, panel, scores);

    // ---- 3. Publish the reasoning -------------------------------------------
    const voteMap = new Map(votes.map((v) => [v.juror.id, v.forPlayer]));

    const reasoning = await generateJSON<ReasoningOutput>({
      model: MODELS.strong,
      system: [{ text: reasoningSystem(trialCase), cache: true }],
      messages: [
        {
          role: "user",
          content: reasoningInput(panel, voteMap, scores, judgement, {
            cracked: state.cracked,
            witnessName: witness.name,
            won,
          }),
        },
      ],
      schema: REASONING_SCHEMA,
      maxTokens: 2000,
      effort: "medium",
    });

    const scorecard: Scorecard = {
      won,
      votesFor,
      votesAgainst: panel.length - votesFor,
      scores,
      jurors: toJurorVerdicts(votes, reasoning.jurors ?? []),
      cracked: state.cracked,
      conditionsLanded,
      conditionsTotal,
      bestExchange: bestExchange(exchanges),
      judgeRemark:
        reasoning.judgeRemark?.trim() || "That concludes this matter. The court will rise.",
    };

    return NextResponse.json({ scorecard, overreach: judgement.overreach ?? [] });
  } catch (err) {
    const { status, error, log } = modelErrorResponse(err);
    if (log) console.error("[verdict/verdict]", err);
    return NextResponse.json({ error }, { status });
  }
}
