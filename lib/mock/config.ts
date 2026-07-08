import type { ModuleKey } from "@/lib/questions/types";

// =============================================================
// Mock test configuration.
//
// The real CITB Health, Safety & Environment (HS&E) operatives test is
// 50 questions in 45 minutes, and you must get 45/50 (90%) to pass. These
// constants are the single source of truth — change them here only.
// =============================================================

export const MOCK_CONFIG = {
  /** Number of questions in a full mock test. */
  questionCount: 50,
  /** Time limit, in minutes. */
  durationMinutes: 45,
  /** Questions you must get right to pass (45 of 50). */
  passMark: 45,
  /** Pass mark as a percentage (for display). */
  passPercentage: 90,
} as const;

/**
 * How the 50 questions are split across the five modules. Even 10/10/10/10/10
 * split by default — adjust the weights to mirror the real exam's balance as
 * your question bank grows. Must sum to MOCK_CONFIG.questionCount.
 */
export const MOCK_MODULE_WEIGHTS: Record<ModuleKey, number> = {
  working_environment: 10,
  occupational_health: 10,
  safety: 10,
  high_risk_activities: 10,
  specialist_topics: 10,
};

/** Did this score pass? (>= 45 correct.) */
export function isPass(correctCount: number): boolean {
  return correctCount >= MOCK_CONFIG.passMark;
}

/** Duration in whole seconds — handy for the countdown timer. */
export const MOCK_DURATION_SECONDS = MOCK_CONFIG.durationMinutes * 60;
