// =============================================================================
// VERDICT — scoring and the jury vote.
//
// THE FAIRNESS RULE: the same performance must produce the same verdict. A
// player must not be able to reroll their way to a win, and two players who
// argue the same case the same way must be comparable.
//
// So the verdict is arithmetic, not opinion. Four things make that true:
//
//   1. Two of the five dimensions are computed here with no model involvement
//      at all. "Evidence handled" is exhibit name-matching; "contradictions
//      exposed" is the engine's own condition state. Same words in, same
//      numbers out, forever.
//   2. The three dimensions that genuinely need reading are scored by the
//      model, then QUANTISED to the nearest 5. A model that says 71 one run
//      and 73 the next produces 70 both times, so ordinary jitter cannot flip
//      a juror.
//   3. Each juror's threshold is seeded from (caseId, jurorId) — a fixed hash,
//      not a random number. The same juror is exactly as hard to convince on
//      Tuesday as on Monday.
//   4. The model never sees a threshold and is never asked who won. It scores
//      the performance; this file counts the votes.
// =============================================================================

import type {
  Case,
  Dimension,
  Exchange,
  Exhibit,
  Juror,
  JurorVerdict,
  Scores,
} from "./types";
import { normaliseWeights } from "./jurors";
import type { BadgerReport } from "./engine";
import type { Judgement } from "./prompts";

// -----------------------------------------------------------------------------
// Deterministic dimensions
// -----------------------------------------------------------------------------

/**
 * Evidence handled — pure name-matching over the transcript.
 * Pivotal exhibits (the ones the case actually turns on) count triple, so
 * name-checking the wallpaper does not score the same as putting the shipping
 * receipt to the witness.
 */
export function evidenceScore(
  exhibits: Exhibit[],
  usedRefs: string[]
): number {
  if (exhibits.length === 0) return 0;
  const used = new Set(usedRefs);

  let earned = 0;
  let available = 0;
  for (const exhibit of exhibits) {
    const weight = exhibit.pivotal ? 3 : 1;
    available += weight;
    if (used.has(exhibit.ref)) earned += weight;
  }

  return available === 0 ? 0 : Math.round((earned / available) * 100);
}

/**
 * Contradictions exposed — straight off the engine's condition state.
 * Landing every condition means the witness cracked, which means 100. There is
 * no partial credit for nearly getting there, because nearly is not the moment
 * this product exists for.
 */
export function contradictionScore(landed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((landed / total) * 100);
}

// -----------------------------------------------------------------------------
// Quantisation — the anti-jitter guard
// -----------------------------------------------------------------------------

/** Round to the nearest 5 and clamp to 0–100. */
export function quantise(value: number): number {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return Math.round(clamped / 5) * 5;
}

// -----------------------------------------------------------------------------
// Assembling the five dimensions
// -----------------------------------------------------------------------------

export function assembleScores(
  c: Case,
  judgement: Judgement,
  facts: {
    exhibitsUsed: string[];
    conditionsLanded: number;
    conditionsTotal: number;
    badger: BadgerReport;
  }
): Scores {
  // Badgering penalties are applied here, deterministically, on top of whatever
  // the model thought of the advocate's conduct. Repeating a question the
  // witness already answered, abusing them, or piling on after they have
  // conceded are all countable, so they are counted rather than guessed at.
  const conductPenalty =
    facts.badger.repeats * 5 +
    facts.badger.abusive * 12 +
    facts.badger.pileOn * 8;

  return {
    evidence: quantise(evidenceScore(c.exhibits, facts.exhibitsUsed)),
    contradictions: quantise(
      contradictionScore(facts.conditionsLanded, facts.conditionsTotal)
    ),
    clarity: quantise(judgement.clarity),
    credibility: quantise(judgement.credibility - conductPenalty),
    narrative: quantise(judgement.narrative),
  };
}

// -----------------------------------------------------------------------------
// Seeded thresholds
// -----------------------------------------------------------------------------

/** FNV-1a. Small, fast, and stable across runtimes — which is the whole point. */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/**
 * Not 50, and the reason matters.
 *
 * Credibility is a NEGATIVE dimension — it measures not overreaching, not
 * badgering, not claiming more than you proved. A player who barely engages
 * therefore banks a high credibility score for free, simply by never having
 * had the chance to misbehave. At a midpoint threshold that was enough to win:
 * a cross that pinned down one buried fact out of three and named a single
 * exhibit still carried the room 3–2, because two jurors weight credibility
 * heavily and it cost that player nothing to look well-behaved.
 *
 * Rewarding a cross that did nothing is the one outcome this game cannot
 * afford, so the bar sits above the score a passive advocate can reach without
 * working for it. At 58, on the easiest case, a witness broken open wins 5–0
 * and a cross that found one fact loses 2–3 — and on the hardest cases,
 * nothing short of the crack gets there at all.
 */
const BASE_THRESHOLD = 58;

/**
 * What it takes to convince this particular juror on this particular case.
 *
 * Seeded, so it never changes between runs; a player cannot replay the same
 * case hoping for an easier room. Difficulty raises the whole panel's
 * scepticism, which is what a difficulty rating should actually mean.
 */
export function thresholdFor(c: Case, juror: Juror): number {
  const jitter = (hash(`${c.id}:${juror.id}`) % 13) - 6; // -6 … +6
  const scepticism = (c.difficulty - 1) * 3; // 0 … +12
  return BASE_THRESHOLD + scepticism + jitter;
}

/** One juror's weighted read of the performance, 0–100. */
export function jurorScore(juror: Juror, scores: Scores): number {
  const weights = normaliseWeights(juror.weights);
  const total = (Object.keys(weights) as Dimension[]).reduce(
    (sum, dimension) => sum + weights[dimension] * scores[dimension],
    0
  );
  return Math.round(total);
}

export type Vote = {
  juror: Juror;
  score: number;
  threshold: number;
  forPlayer: boolean;
};

/** Count the room. No model involved, and no randomness. */
export function tally(
  c: Case,
  panel: Juror[],
  scores: Scores
): { votes: Vote[]; votesFor: number; won: boolean } {
  const votes: Vote[] = panel.map((juror) => {
    const score = jurorScore(juror, scores);
    const threshold = thresholdFor(c, juror);
    return { juror, score, threshold, forPlayer: score >= threshold };
  });

  const votesFor = votes.filter((v) => v.forPlayer).length;
  // Simple majority. With an odd panel there are no hung juries.
  const won = votesFor > panel.length / 2;

  return { votes, votesFor, won };
}

/** Stitch computed votes together with the model's written reasoning. */
export function toJurorVerdicts(
  votes: Vote[],
  reasoning: { jurorId: string; reasoning: string }[]
): JurorVerdict[] {
  const byId = new Map(reasoning.map((r) => [r.jurorId, r.reasoning]));

  return votes.map((v) => ({
    jurorId: v.juror.id,
    name: v.juror.name,
    occupation: v.juror.occupation,
    bias: v.juror.bias,
    forPlayer: v.forPlayer,
    score: v.score,
    threshold: v.threshold,
    // Publish the reasoning every single time — a juror who cannot say why is
    // exactly the arbitrary-feeling verdict this whole file exists to prevent.
    reasoning:
      byId.get(v.juror.id)?.trim() ||
      (v.forPlayer
        ? "Found the advocate's account the more convincing of the two."
        : "Was not persuaded that the advocate made their case."),
  }));
}

// -----------------------------------------------------------------------------
// Transcript helpers
// -----------------------------------------------------------------------------

/** Everything the player said, for exhibit detection across the whole trial. */
export function fullPlayerText(
  opening: string,
  exchanges: Exchange[],
  closing: string
): string {
  return [opening, ...exchanges.map((e) => e.question), closing].join("\n");
}
