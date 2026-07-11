// =============================================================
// Readiness engine — ported from the My Life in the UK Test app and re-tuned
// for the CSCS exam bar (pass 90%, advise ~95% before booking).
//
// This is an *exam prediction*, not a running accuracy. It answers: "if you
// sat the real CITB HS&E test right now, drawn from the WHOLE bank, what would
// you score?" So it has to be earned across the entire bank — acing a handful
// of questions cannot move it. Telling someone "95%" who then fails the real
// test is on us, so the estimate is deliberately conservative and hard to game.
//
//   predicted = (Σ mastery_q over the WHOLE bank) ÷ bankTotal · 100
//     mastery_q ∈ [0,1]: unseen or last-wrong → 0; right once → 0.8;
//                        right ≥2 in a row → 1.0; shaky recovery → 0.5.
//   MOCK CORRECTION: recent mocks nudge the estimate (weight 0.2, recency
//     decayed) but a 50-question mock cannot manufacture whole-bank mastery.
// Pure functions — no React, no storage. Fed by lib/progress/local-progress.ts.
// =============================================================

export const REAL_PASS_PERCENT = 90; // the actual CITB HS&E pass mark
export const BOOK_READY_PERCENT = 95; // advise booking once consistently here
const MIN_SAMPLE = 10;
const WINDOW = 60;
const HALF_LIFE = 20;
const MOCK_BONUS = 1.3;
const MOCK_DECAY = 0.75;
const MOCK_WEIGHT = 0.2; // how much recent mocks nudge the prediction

export type AnswerSample = { correct: boolean; isMock: boolean };
export type Band = "empty" | "not-ready" | "getting-there" | "ready";
export type Readiness = { band: Band; score: number | null; sampleSize: number };

export function toBand(score: number): Band {
  if (score >= BOOK_READY_PERCENT) return "ready";
  if (score >= REAL_PASS_PERCENT - 15) return "getting-there"; // ~75%+
  return "not-ready";
}

/** Recency-weighted accuracy over recent answers (newest first). */
export function computeReadiness(recentNewestFirst: AnswerSample[]): Readiness {
  if (recentNewestFirst.length < MIN_SAMPLE)
    return { band: "empty", score: null, sampleSize: recentNewestFirst.length };
  const sample = recentNewestFirst.slice(0, WINDOW);
  let weightedCorrect = 0;
  let weightTotal = 0;
  sample.forEach((a, i) => {
    const recency = Math.pow(0.5, i / HALF_LIFE);
    const w = recency * (a.isMock ? MOCK_BONUS : 1);
    weightTotal += w;
    if (a.correct) weightedCorrect += w;
  });
  const score = weightTotal === 0 ? 0 : Math.round((weightedCorrect / weightTotal) * 100);
  return { band: toBand(score), score, sampleSize: sample.length };
}

export type ReadinessInputs = {
  samples: AnswerSample[]; // newest first (gates the empty state)
  mockPercents: number[]; // newest first
  /** Per-question mastery in [0,1], one per distinct question attempted. */
  masteryByQuestion: number[];
  bankTotal: number;
};

/** The gauge score: whole-bank mastery, refined by recent mocks. */
export function computeReadinessV2(inputs: ReadinessInputs): Readiness {
  const base = computeReadiness(inputs.samples);
  if (base.band === "empty" || base.score == null) return base;

  // Whole-bank expected score: mastery summed over every attempted question,
  // divided by the ENTIRE bank (unseen questions count as 0).
  const masterySum = inputs.masteryByQuestion.reduce((s, m) => s + m, 0);
  const expected =
    inputs.bankTotal > 0 ? (masterySum / inputs.bankTotal) * 100 : 0;

  // Recent mocks refine, but cannot inflate past the coverage-earned base.
  const mocks = inputs.mockPercents.slice(0, 5);
  let score = expected;
  if (mocks.length > 0) {
    let wSum = 0;
    let vSum = 0;
    mocks.forEach((pct, i) => {
      const w = Math.pow(MOCK_DECAY, i);
      wSum += w;
      vSum += pct * w;
    });
    const mockScore = vSum / wSum;
    score = (1 - MOCK_WEIGHT) * expected + MOCK_WEIGHT * mockScore;
  }

  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  return { band: toBand(clamped), score: clamped, sampleSize: base.sampleSize };
}

export const READINESS_COPY: Record<Band, { label: string; hint: string }> = {
  empty: {
    label: "Not enough data yet",
    hint: "Answer your first few questions to unlock your readiness score.",
  },
  "not-ready": {
    label: "Not ready",
    hint: "Keep practising — focus on your weakest modules first.",
  },
  "getting-there": {
    label: "Getting there",
    hint: "You'd likely pass (the real mark is 90%), but aim for 95%+ before you book.",
  },
  ready: {
    label: "Ready to book",
    hint: "You're consistently above the safe mark. Book your test with confidence.",
  },
};
