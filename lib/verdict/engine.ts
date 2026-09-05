// =============================================================================
// VERDICT — the cross-examination engine.
//
// THIS IS THE PRODUCT. Everything else in the app exists to set up, reward and
// make visible the moment a witness breaks.
//
// The architecture that makes the moment FAIR:
//
//   The model does not decide when the witness cracks. It never has that power.
//   Each turn the model does exactly two jobs — (1) judge which of the authored
//   crack conditions the player has just pinned down, and (2) write an in-
//   character evasion. This engine holds the cumulative state and decides,
//   deterministically, whether the last condition has landed. When it has, the
//   engine plays the AUTHORED `crackResponse` verbatim.
//
// Three properties fall out of that, and all three matter:
//
//   * The crack cannot happen by luck, by a magic keyword, or because the model
//     felt generous. It happens when the player has done the work.
//   * Every player who earns it sees the identical payoff, which is what makes
//     a clip of it worth posting.
//   * The witness cannot improvise a way out, because the only thing standing
//     between the player and the crack is a set of booleans this file owns.
//
// Once cracked, a witness stays cracked. No re-hardening, ever.
// =============================================================================

import type {
  Case,
  Exchange,
  Exhibit,
  Witness,
  WitnessMode,
} from "./types";

// -----------------------------------------------------------------------------
// Condition state
// -----------------------------------------------------------------------------

/**
 * Cumulative state of one witness's cross-examination.
 *
 * MILESTONE 1 NOTE: this state round-trips through the browser because there
 * are no accounts yet and nowhere server-side to keep it. `reconcile()` below
 * validates whatever comes back, so a tampered payload can only ever let a
 * player cheat themselves out of their own game — nothing here is used for
 * authorisation, ranking or payment. When accounts land in Milestone 2 this
 * moves into the trials table and the client stops being trusted with it.
 */
export type CrossState = {
  /** Opaque condition ids ("c1", "c2"…) the player has established so far. */
  established: string[];
  cracked: boolean;
};

export const EMPTY_CROSS_STATE: CrossState = { established: [], cracked: false };

/**
 * Validate client-supplied state against the case's real conditions.
 * Unknown ids are dropped; `cracked` can only be true if it is actually earned.
 */
export function reconcile(witness: Witness, incoming: unknown): CrossState {
  const valid = new Set(witness.crackConditions.map((c) => c.id));
  const raw = (incoming ?? {}) as Partial<CrossState>;

  const established = Array.isArray(raw.established)
    ? Array.from(
        new Set(
          raw.established.filter(
            (id): id is string => typeof id === "string" && valid.has(id)
          )
        )
      )
    : [];

  // `cracked` is derived, never taken on trust.
  return { established, cracked: allConditionsMet(witness, established) };
}

export function allConditionsMet(
  witness: Witness,
  established: string[]
): boolean {
  const set = new Set(established);
  return witness.crackConditions.every((c) => set.has(c.id));
}

/**
 * Apply one adjudicated turn.
 *
 * `claimed` is the model's judgement of which conditions this question pinned
 * down. It is filtered against the authored ids — the model cannot invent a
 * condition, and it cannot un-establish one that already landed.
 */
export function applyTurn(
  witness: Witness,
  prior: CrossState,
  claimed: string[]
): { next: CrossState; landed: string[]; mode: WitnessMode } {
  // A cracked witness has nothing left to establish. Stay cracked.
  if (prior.cracked) {
    return { next: prior, landed: [], mode: "cracked" };
  }

  const valid = new Set(witness.crackConditions.map((c) => c.id));
  const already = new Set(prior.established);

  const landed = Array.from(new Set(claimed)).filter(
    (id) => valid.has(id) && !already.has(id)
  );

  const established = [...prior.established, ...landed];
  const cracked = allConditionsMet(witness, established);
  const next: CrossState = { established, cracked };

  // The engine, not the model, chooses the mode — and therefore chooses
  // whether the authored crack response is played.
  const mode: WitnessMode = cracked
    ? "crack"
    : landed.length > 0
      ? "rattled"
      : "evade";

  return { next, landed, mode };
}

/**
 * How rattled the witness looks, 0–100.
 *
 * Deliberately derived from conditions landed and nothing else. It tells the
 * player they are onto something without telling them what — the conditions
 * themselves are never named, and the ids are opaque for the same reason.
 */
export function pressure(witness: Witness, state: CrossState): number {
  const total = witness.crackConditions.length;
  if (total === 0) return 0;
  return Math.round((state.established.length / total) * 100);
}

// -----------------------------------------------------------------------------
// Exhibit detection — deterministic, no model call.
// -----------------------------------------------------------------------------

/** Strip punctuation and collapse whitespace so speech and typing match alike. */
function normalise(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Which exhibits did the player actually name?
 *
 * Runs over the whole transcript with no model involvement, which is what lets
 * "evidence handled" be a genuinely deterministic score: the same words always
 * produce the same number.
 */
export function exhibitsCitedIn(text: string, exhibits: Exhibit[]): string[] {
  const haystack = ` ${normalise(text)} `;
  const found: string[] = [];

  for (const exhibit of exhibits) {
    const needles = [
      exhibit.name,
      `exhibit ${exhibit.ref}`,
      ...exhibit.aliases,
    ].map((n) => ` ${normalise(n)} `);

    if (needles.some((n) => n.trim().length > 2 && haystack.includes(n))) {
      found.push(exhibit.ref);
    }
  }

  return found;
}

// -----------------------------------------------------------------------------
// Badgering — also deterministic.
// -----------------------------------------------------------------------------

/** Word-overlap similarity, 0–1. Cheap, and good enough to spot a repeat. */
function similarity(a: string, b: string): number {
  const wa = new Set(normalise(a).split(" ").filter((w) => w.length > 3));
  const wb = new Set(normalise(b).split(" ").filter((w) => w.length > 3));
  if (wa.size === 0 || wb.size === 0) return 0;

  let shared = 0;
  wa.forEach((w) => {
    if (wb.has(w)) shared += 1;
  });
  return shared / Math.min(wa.size, wb.size);
}

const ABUSIVE = [
  "liar",
  "lying",
  "shut up",
  "idiot",
  "stupid",
  "pathetic",
  "disgusting",
  "scum",
  "fraud",
  "crook",
  "answer the question",
];

export type BadgerReport = {
  /** Questions that repeat an earlier one the witness already answered. */
  repeats: number;
  /** Questions containing abuse or bare accusation. */
  abusive: number;
  /**
   * Questions asked AFTER the witness cracked and conceded. Piling on a broken
   * witness reads badly to a jury, and this panel notices.
   */
  pileOn: number;
};

export function badgering(exchanges: Exchange[]): BadgerReport {
  let repeats = 0;
  let abusive = 0;
  let pileOn = 0;
  let crackedAt: number | null = null;

  exchanges.forEach((ex, i) => {
    const q = normalise(ex.question);

    for (let j = 0; j < i; j += 1) {
      if (similarity(ex.question, exchanges[j].question) >= 0.8) {
        repeats += 1;
        break;
      }
    }

    if (ABUSIVE.some((word) => q.includes(word))) abusive += 1;

    if (ex.mode === "crack" && crackedAt === null) crackedAt = i;
    if (crackedAt !== null && i > crackedAt + 1) pileOn += 1;
  });

  return { repeats, abusive, pileOn };
}

// -----------------------------------------------------------------------------
// Drama scoring — picks the clip.
// -----------------------------------------------------------------------------

/**
 * Score every exchange for drama and return the index of the best one.
 * Milestone 2 turns this into the auto-cut clip; for now it is the moment the
 * scorecard replays back to the player.
 */
export function bestExchange(exchanges: Exchange[]): number | null {
  if (exchanges.length === 0) return null;

  let bestIndex = 0;
  let bestScore = -Infinity;

  exchanges.forEach((ex, i) => {
    let score = 0;
    if (ex.mode === "crack") score += 100;
    score += ex.landed.length * 30;
    score += ex.exhibitsCited.length * 8;
    // A tight question landing a condition is more watchable than a rambling one.
    const words = ex.question.trim().split(/\s+/).length;
    if (words <= 25 && ex.landed.length > 0) score += 10;

    if (score > bestScore) {
      bestScore = score;
      bestIndex = i;
    }
  });

  return bestScore <= 0 ? null : bestIndex;
}

// -----------------------------------------------------------------------------
// Trial shape
// -----------------------------------------------------------------------------

export const TRIAL_LIMITS = {
  /** Case notes countdown. Pressure, and it stops people over-preparing. */
  caseNotesSeconds: 60,
  openingSeconds: 90,
  closingSeconds: 90,
  /** The judge starts making noises about time after this many questions. */
  softQuestionLimit: 14,
  /** Hard stop. Keeps a trial inside the 8–12 minute window. */
  maxQuestions: 20,
  deliberationSeconds: 24,
} as const;

/** The judge's time warnings. Scripted, not generated — they must be instant. */
export function judgeTimeWarning(
  c: Case,
  questionCount: number
): string | null {
  const remaining = TRIAL_LIMITS.maxQuestions - questionCount;
  if (remaining === 6) {
    return `${c.judge.name}: "You have a few more questions, and then I shall want to hear your closing."`;
  }
  if (remaining === 2) {
    return `${c.judge.name}: "Two more, please."`;
  }
  if (remaining <= 0) {
    return `${c.judge.name}: "That will do. Closing argument, when you're ready."`;
  }
  return null;
}
