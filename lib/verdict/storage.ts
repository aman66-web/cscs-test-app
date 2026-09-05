// =============================================================================
// VERDICT — the on-device record.
//
// Milestone 1 has no accounts, no payments and no server-side profile, so the
// player's history lives in localStorage. It exists for one reason: a player
// who wins a case should be able to see that they won it, and a player on a
// streak should be able to see the streak. That is the whole of the career
// layer until Milestone 2 puts it behind a login.
//
// Everything here is defensive. Private browsing, cleared site data, a quota
// error mid-write — none of them may break a trial. Reads degrade to empty,
// writes degrade to silence.
// =============================================================================

const KEY = "verdict.record.v1";
const MAX_ENTRIES = 200;

export type TrialRecord = {
  caseId: string;
  caseTitle: string;
  won: boolean;
  cracked: boolean;
  votesFor: number;
  votesAgainst: number;
  /** ISO date (YYYY-MM-DD), local time — streaks are a human-day concept. */
  day: string;
  at: number;
};

export type Record = {
  trials: TrialRecord[];
};

const EMPTY: Record = { trials: [] };

function localDay(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function readRecord(): Record {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<Record>;
    if (!parsed || !Array.isArray(parsed.trials)) return EMPTY;

    const trials = parsed.trials.filter(
      (t): t is TrialRecord =>
        !!t &&
        typeof t.caseId === "string" &&
        typeof t.won === "boolean" &&
        typeof t.day === "string"
    );
    return { trials };
  } catch {
    return EMPTY;
  }
}

export function recordTrial(entry: Omit<TrialRecord, "day" | "at">): void {
  if (typeof window === "undefined") return;
  try {
    const current = readRecord();
    const trials = [
      ...current.trials,
      { ...entry, day: localDay(), at: Date.now() },
    ].slice(-MAX_ENTRIES);
    window.localStorage.setItem(KEY, JSON.stringify({ trials }));
  } catch {
    // Quota, private mode, or storage disabled. The trial still counts on
    // screen; it just isn't remembered. Never let this break the game.
  }
}

export type CareerStats = {
  trials: number;
  wins: number;
  winRate: number;
  cracks: number;
  /** Consecutive days, ending today or yesterday, with at least one trial. */
  streak: number;
};

export function careerStats(record: Record = readRecord()): CareerStats {
  const trials = record.trials.length;
  const wins = record.trials.filter((t) => t.won).length;
  const cracks = record.trials.filter((t) => t.cracked).length;

  return {
    trials,
    wins,
    winRate: trials === 0 ? 0 : Math.round((wins / trials) * 100),
    cracks,
    streak: streakFrom(record.trials),
  };
}

/**
 * Count back from today. A streak survives "haven't played yet today" — it only
 * breaks once a full day has passed with nothing in it, which is the version
 * players expect and the version that doesn't punish someone at 9am.
 */
function streakFrom(trials: TrialRecord[]): number {
  if (trials.length === 0) return 0;

  const days = new Set(trials.map((t) => t.day));
  const cursor = new Date();

  if (!days.has(localDay(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!days.has(localDay(cursor))) return 0;
  }

  let streak = 0;
  while (days.has(localDay(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function hasPlayed(caseId: string, record: Record = readRecord()): boolean {
  return record.trials.some((t) => t.caseId === caseId);
}

export function bestResult(
  caseId: string,
  record: Record = readRecord()
): TrialRecord | null {
  const played = record.trials.filter((t) => t.caseId === caseId);
  if (played.length === 0) return null;
  // A win beats a loss; among wins, the one where the witness broke.
  return (
    played.find((t) => t.won && t.cracked) ??
    played.find((t) => t.won) ??
    played[played.length - 1]
  );
}

// -----------------------------------------------------------------------------
// Mid-trial resilience
// -----------------------------------------------------------------------------

const TRIAL_KEY = "verdict.trial-in-progress.v1";

/**
 * Losing eight minutes of cross-examination to an accidental refresh is the
 * kind of thing a player never comes back from, so the live trial is mirrored
 * into sessionStorage. Best-effort: if it isn't there, the trial simply starts
 * from the top.
 */
export function saveInProgress(caseId: string, snapshot: unknown): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(
      TRIAL_KEY,
      JSON.stringify({ caseId, snapshot, at: Date.now() })
    );
  } catch {
    /* not fatal */
  }
}

export function loadInProgress<T>(caseId: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(TRIAL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      caseId?: string;
      snapshot?: T;
      at?: number;
    };
    if (parsed.caseId !== caseId || !parsed.snapshot) return null;
    // Stale trials are worse than no trial — an hour is generous for a
    // 10-minute session.
    if (typeof parsed.at === "number" && Date.now() - parsed.at > 3_600_000) {
      return null;
    }
    return parsed.snapshot;
  } catch {
    return null;
  }
}

export function clearInProgress(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(TRIAL_KEY);
  } catch {
    /* not fatal */
  }
}
