// =============================================================
// Local progress store (client-side, localStorage).
//
// Ported from the My Life in the UK Test app's lib/progress/local-progress.ts
// and adapted for CSCS: a SINGLE storage key (no per-user namespacing yet), and
// answers are grouped by `module` (one of the 5 CSCS modules) instead of the
// handbook chapter. All XP, streaks, mock history and readiness are derived
// purely from this store — no backend needed, so everything is testable in the
// browser immediately.
//
// Every read defensively coerces each field back to its type, so a corrupt blob
// falls back to empty per-field and never white-screens. Every write is
// best-effort (try/catch) — storage being unavailable must never break a quiz.
// =============================================================

const KEY = "cscs-progress-v1";

/** XP awarded per correct answer (practice + mock). Mock submit = score × this. */
export const XP_PER_CORRECT = 10;

const ANSWER_LOG_CAP = 1000;
const MOCK_HISTORY_CAP = 20;

export type AnswerEntry = {
  qid: string;
  module: string;
  correct: boolean;
  isMock: boolean;
  at: number;
};

/** An SM-2 spaced-repetition card (used by flashcards). */
export type SrsCard = {
  ease: number; // ×100, starts 250, floor 130
  ivl: number; // interval in minutes
  due: number; // epoch ms when next due
  reps: number;
  lapses: number;
};

export type LocalProgress = {
  v: 1;
  xp: number;
  /** Per local-day activity, keyed "YYYY-MM-DD". */
  practiceDays: Record<string, { minutes: number; answered: number }>;
  /** Best % per module (end-of-module tests). */
  bestScores: Record<string, number>;
  mocksTaken: number;
  /** Best result per mock number. */
  mockBests: Record<number, { score: number; total: number; at: number }>;
  /** Rolling history of mock percentages (newest last, capped). */
  mockHistory: { pct: number; at: number }[];
  /** Lessons opened per module (unlocks the final module test). */
  submodulesOpened: Record<string, string[]>;
  /** Per-question mistake tracking. */
  mistakes: Record<string, { wrong: number; correctStreak: number }>;
  /** Full answer log (newest last, capped). */
  answerLog: AnswerEntry[];
  /** Spaced-repetition state per question (flashcards). */
  srs: Record<string, SrsCard>;
};

const EMPTY: LocalProgress = {
  v: 1,
  xp: 0,
  practiceDays: {},
  bestScores: {},
  mocksTaken: 0,
  mockBests: {},
  mockHistory: [],
  submodulesOpened: {},
  mistakes: {},
  answerLog: [],
  srs: {},
};

// ---- day key (LOCAL time, not UTC) ------------------------------------------
export function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

// ---- read / write -----------------------------------------------------------
function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

/** The current progress, always a fully-formed object (never throws). */
export function getProgress(): LocalProgress {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const p = JSON.parse(raw) as unknown;
    if (!isObj(p)) return { ...EMPTY };
    return {
      v: 1,
      xp: typeof p.xp === "number" ? p.xp : 0,
      practiceDays: isObj(p.practiceDays) ? (p.practiceDays as LocalProgress["practiceDays"]) : {},
      bestScores: isObj(p.bestScores) ? (p.bestScores as Record<string, number>) : {},
      mocksTaken: typeof p.mocksTaken === "number" ? p.mocksTaken : 0,
      mockBests: isObj(p.mockBests) ? (p.mockBests as LocalProgress["mockBests"]) : {},
      mockHistory: Array.isArray(p.mockHistory)
        ? (p.mockHistory as unknown[]).filter(
            (m): m is { pct: number; at: number } => isObj(m) && typeof (m as { pct: unknown }).pct === "number"
          )
        : [],
      submodulesOpened: isObj(p.submodulesOpened)
        ? (p.submodulesOpened as Record<string, string[]>)
        : {},
      mistakes: isObj(p.mistakes) ? (p.mistakes as LocalProgress["mistakes"]) : {},
      answerLog: Array.isArray(p.answerLog)
        ? (p.answerLog as unknown[]).filter(
            (a): a is AnswerEntry => isObj(a) && typeof (a as AnswerEntry).qid === "string"
          )
        : [],
      srs: isObj(p.srs) ? (p.srs as Record<string, SrsCard>) : {},
    };
  } catch {
    return { ...EMPTY };
  }
}

function save(p: LocalProgress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(p));
    // Let same-tab listeners (widgets) know progress changed.
    window.dispatchEvent(new Event("cscs-progress"));
  } catch {
    /* storage full / unavailable — ignore */
  }
}

/** Read-modify-write helper. */
export function updateProgress(fn: (p: LocalProgress) => LocalProgress): void {
  save(fn(getProgress()));
}

// ---- mutators ---------------------------------------------------------------
export function addXp(amount: number): void {
  if (amount <= 0) return;
  updateProgress((p) => ({ ...p, xp: p.xp + amount }));
}

export function logActivity(minutes: number, answered: number): void {
  updateProgress((p) => {
    const key = todayKey();
    const day = p.practiceDays[key] ?? { minutes: 0, answered: 0 };
    return {
      ...p,
      practiceDays: {
        ...p.practiceDays,
        [key]: { minutes: day.minutes + minutes, answered: day.answered + answered },
      },
    };
  });
}

/** Record a batch of answers (used by the mock runner and quizzes). */
export function logAnswers(
  entries: { qid: string; module: string; correct: boolean }[],
  isMock: boolean
): void {
  if (entries.length === 0) return;
  const at = Date.now();
  updateProgress((p) => {
    const answerLog = [
      ...p.answerLog,
      ...entries.map((e) => ({ qid: e.qid, module: e.module, correct: e.correct, isMock, at })),
    ].slice(-ANSWER_LOG_CAP);
    const mistakes = { ...p.mistakes };
    for (const e of entries) {
      const m = mistakes[e.qid] ?? { wrong: 0, correctStreak: 0 };
      mistakes[e.qid] = e.correct
        ? { wrong: m.wrong, correctStreak: m.correctStreak + 1 }
        : { wrong: m.wrong + 1, correctStreak: 0 };
    }
    return { ...p, answerLog, mistakes };
  });
}

export function logAnswer(qid: string, module: string, correct: boolean, isMock: boolean): void {
  logAnswers([{ qid, module, correct }], isMock);
}

/** Record a completed mock (feeds the readiness MOCK term + best scores). */
export function noteMockResult(mockNumber: number, score: number, total: number): void {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const at = Date.now();
  updateProgress((p) => {
    const prevBest = p.mockBests[mockNumber];
    const mockBests = { ...p.mockBests };
    if (!prevBest || score > prevBest.score) mockBests[mockNumber] = { score, total, at };
    return {
      ...p,
      mocksTaken: p.mocksTaken + 1,
      mockBests,
      mockHistory: [...p.mockHistory, { pct, at }].slice(-MOCK_HISTORY_CAP),
    };
  });
}

/** Record a best % for an end-of-module test. */
export function noteBestScore(module: string, pct: number): void {
  updateProgress((p) => ({
    ...p,
    bestScores: { ...p.bestScores, [module]: Math.max(p.bestScores[module] ?? 0, pct) },
  }));
}

export function updateSrs(qid: string, card: SrsCard): void {
  updateProgress((p) => ({ ...p, srs: { ...p.srs, [qid]: card } }));
}

/** Mark a lesson as opened (append-only; unlocks the final module test). */
export function markSubmoduleOpened(module: string, subId: string): void {
  updateProgress((p) => {
    const opened = p.submodulesOpened[module] ?? [];
    if (opened.includes(subId)) return p;
    return { ...p, submodulesOpened: { ...p.submodulesOpened, [module]: [...opened, subId] } };
  });
}

export function resetProgress(): void {
  save({ ...EMPTY });
}

// ---- selectors --------------------------------------------------------------
export function minutesToday(p = getProgress()): number {
  return p.practiceDays[todayKey()]?.minutes ?? 0;
}

/** Consecutive-day streak: counts today, or falls back to yesterday if today is
    empty (so an unpractised today doesn't zero a live streak). DST-safe. */
export function currentStreak(p = getProgress()): number {
  const days = p.practiceDays;
  const back = (d: Date) => {
    const prev = new Date(d);
    prev.setDate(prev.getDate() - 1);
    return prev;
  };
  let cursor = new Date();
  if (!days[todayKey(cursor)]) {
    cursor = back(cursor);
    if (!days[todayKey(cursor)]) return 0;
  }
  let streak = 0;
  while (days[todayKey(cursor)]) {
    streak += 1;
    cursor = back(cursor);
  }
  return streak;
}

export function distinctAttempted(p = getProgress()): number {
  return new Set(p.answerLog.map((a) => a.qid)).size;
}

/** Answer samples newest-first, for the readiness engine. */
export function readinessSamples(p = getProgress()): { correct: boolean; isMock: boolean }[] {
  return [...p.answerLog].reverse().map((a) => ({ correct: a.correct, isMock: a.isMock }));
}

/** Mock percentages newest-first. */
export function recentMockPercents(p = getProgress()): number[] {
  return [...p.mockHistory].reverse().map((m) => m.pct);
}

/** Accuracy (0–1) per module, from the answer log. */
export function moduleAccuracy(p = getProgress()): Record<string, { correct: number; total: number }> {
  const acc: Record<string, { correct: number; total: number }> = {};
  for (const a of p.answerLog) {
    const m = acc[a.module] ?? { correct: 0, total: 0 };
    m.total += 1;
    if (a.correct) m.correct += 1;
    acc[a.module] = m;
  }
  return acc;
}

/** Compact progress summary sent to the AI coach for personalisation. */
export function coachSummary(p = getProgress()): {
  samples: { correct: boolean; isMock: boolean }[];
  byModule: Record<string, { answered: number; correct: number }>;
  mocksTaken: number;
} {
  const byModule: Record<string, { answered: number; correct: number }> = {};
  for (const a of p.answerLog) {
    const c = byModule[a.module] ?? { answered: 0, correct: 0 };
    c.answered += 1;
    if (a.correct) c.correct += 1;
    byModule[a.module] = c;
  }
  return {
    samples: [...p.answerLog].reverse().slice(0, 100).map((a) => ({ correct: a.correct, isMock: a.isMock })),
    byModule,
    mocksTaken: p.mocksTaken,
  };
}

/** Per-module accuracy as a whole %, or null if that module has no answers. */
export function moduleAccuracyPct(p = getProgress()): Record<string, number | null> {
  const acc = moduleAccuracy(p);
  const out: Record<string, number | null> = {};
  for (const [k, v] of Object.entries(acc)) {
    out[k] = v.total > 0 ? Math.round((v.correct / v.total) * 100) : null;
  }
  return out;
}

/** Daily accuracy points over the last `n` active days (for the progress graph). */
export function dailyAccuracy(n = 14, p = getProgress()): { day: string; pct: number }[] {
  const byDay: Record<string, { correct: number; total: number }> = {};
  for (const a of p.answerLog) {
    const key = todayKey(new Date(a.at));
    const d = byDay[key] ?? { correct: 0, total: 0 };
    d.total += 1;
    if (a.correct) d.correct += 1;
    byDay[key] = d;
  }
  return Object.keys(byDay)
    .sort()
    .slice(-n)
    .map((day) => ({ day, pct: Math.round((byDay[day].correct / byDay[day].total) * 100) }));
}
