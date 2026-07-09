// Study-plan estimates: hours of revision left, "ready by" dates at two paces,
// and per-module accuracy for the weakest-first list. Pure module — no
// "use client" / "use server" and no server-only imports.
// Cloned from the My Life in the UK Test app; TARGET tracks the CSCS
// safe-to-book zone (95%).

import { TOPICS, type TopicKey } from "@/lib/onboarding/types";
import { BOOK_READY_PERCENT } from "@/lib/readiness/readiness";

export const TARGET = BOOK_READY_PERCENT; // aim for 95% before booking
export const RELAXED_MIN_PER_DAY = 30;
export const INTENSIVE_MIN_PER_DAY = 60;

// Each readiness point below the target is assumed to need this much focused
// study. Single tunable constant; defensible and monotonic.
const MINUTES_PER_POINT = 12;

export function minutesLeft(readinessScore: number | null): number {
  const start = readinessScore ?? 0; // empty state → full gap from 0
  const gap = Math.max(0, TARGET - start);
  return gap * MINUTES_PER_POINT;
}

export function hoursLeft(readinessScore: number | null): number {
  return Math.round((minutesLeft(readinessScore) / 60) * 10) / 10; // 1 dp
}

export function readyByDate(
  readinessScore: number | null,
  minutesPerDay: number,
  from: Date = new Date()
): Date {
  const days = Math.ceil(minutesLeft(readinessScore) / minutesPerDay);
  const d = new Date(from);
  d.setDate(d.getDate() + Math.max(1, days));
  return d;
}

export function readyByBoth(readinessScore: number | null, from: Date = new Date()) {
  return {
    relaxed: readyByDate(readinessScore, RELAXED_MIN_PER_DAY, from),
    intensive: readyByDate(readinessScore, INTENSIVE_MIN_PER_DAY, from),
  };
}

export type TopicCount = { answered: number; correct: number };

export type TopicStat = {
  topic: TopicKey;
  answered: number;
  accuracy: number | null; // 0–100, null if never answered
  seeded: boolean; // true ⇒ from onboarding, not real data yet
};

/**
 * Per-module accuracy. Uses real answers where they exist; otherwise seeds
 * weakness from the onboarding "hardest topics" so the plan is useful on day
 * one (hard modules get a low pseudo-accuracy so they sort to the top).
 */
export function topicStats(
  counts: Partial<Record<TopicKey, TopicCount>>,
  seedHardest: TopicKey[]
): TopicStat[] {
  const hard = new Set(seedHardest);
  return TOPICS.map(({ key }) => {
    const c = counts[key];
    if (c && c.answered > 0) {
      return {
        topic: key,
        answered: c.answered,
        accuracy: Math.round((c.correct / c.answered) * 100),
        seeded: false,
      };
    }
    return {
      topic: key,
      answered: 0,
      accuracy: hard.has(key) ? 30 : 55,
      seeded: true,
    };
  });
}

/** Weakest first: lowest accuracy, then most-answered as a tiebreak. */
export function weakestFirst(stats: TopicStat[]): TopicStat[] {
  return [...stats].sort(
    (a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0) || b.answered - a.answered
  );
}

export function weakestTopic(stats: TopicStat[]): TopicKey {
  return weakestFirst(stats)[0].topic;
}

export function formatReadyBy(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
