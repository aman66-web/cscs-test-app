// =============================================================
// Readiness engine — ported from the My Life in the UK Test app and re-tuned
// for the CSCS exam bar (pass 90%, advise ~95% before booking).
//
// readiness = 0.45·MOCK + 0.40·ACCURACY + 0.15·COVERAGE·100
//   ACCURACY = recency-weighted mean of recent answers (mock answers weigh more)
//   MOCK     = decay-weighted mean of the last 5 mock percentages
//   COVERAGE = distinct questions attempted ÷ (30% of the bank), capped at 1
// Pure functions — no React, no storage. Fed by lib/progress/local-progress.ts.
// =============================================================

export const REAL_PASS_PERCENT = 90; // the actual CITB HS&E pass mark
export const BOOK_READY_PERCENT = 95; // advise booking once consistently here
const MIN_SAMPLE = 10;
const WINDOW = 60;
const HALF_LIFE = 20;
const MOCK_BONUS = 1.3;
const MOCK_DECAY = 0.75;
const COVERAGE_FULL_AT = 0.3;

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
  samples: AnswerSample[]; // newest first
  mockPercents: number[]; // newest first
  distinctAttempted: number;
  bankTotal: number;
};

/** The gauge score: blends accuracy, mock performance and coverage. */
export function computeReadinessV2(inputs: ReadinessInputs): Readiness {
  const base = computeReadiness(inputs.samples);
  if (base.band === "empty" || base.score == null) return base;

  const accuracy = base.score;
  const mocks = inputs.mockPercents.slice(0, 5);
  let mock = accuracy;
  if (mocks.length > 0) {
    let wSum = 0;
    let vSum = 0;
    mocks.forEach((pct, i) => {
      const w = Math.pow(MOCK_DECAY, i);
      wSum += w;
      vSum += pct * w;
    });
    mock = vSum / wSum;
  }

  const coverage =
    inputs.bankTotal > 0
      ? Math.min(1, inputs.distinctAttempted / (inputs.bankTotal * COVERAGE_FULL_AT))
      : 0;

  let score = Math.round(0.45 * mock + 0.4 * accuracy + 0.15 * coverage * 100);
  // Don't declare "ready" on thin evidence (no mocks + low coverage).
  if (score >= BOOK_READY_PERCENT && inputs.mockPercents.length === 0 && coverage < 0.5) {
    score = BOOK_READY_PERCENT - 1;
  }
  const clamped = Math.max(0, Math.min(100, score));
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
