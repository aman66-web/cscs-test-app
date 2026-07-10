// Shared onboarding types, topic catalogue, and pure helpers.
// Imported by both the client flow component and the server action,
// so this file must stay free of "use client" / "use server" and of any
// server-only imports.
//
// Ported from the My Life in the UK Test app's lib/onboarding/types.ts.
// CSCS adaptation: the "hardest topics" are the five HS&E test modules
// (single source of truth: lib/question-bank/modules.ts), and the previous
// score is out of 50 (the CITB mock has 50 questions, not 24).

import { MODULES } from "@/lib/question-bank/modules";
import type { ModuleKey } from "@/lib/questions/types";

export type TopicKey = ModuleKey;

export const TOPICS: { key: TopicKey; label: string }[] = MODULES.map((m) => ({
  key: m.key,
  label: m.title,
}));

const TOPIC_KEYS = new Set<TopicKey>(TOPICS.map((t) => t.key));

/** Keep only recognised topic keys (defends the jsonb column from junk). */
export function sanitizeTopics(input: unknown): TopicKey[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<TopicKey>();
  for (const value of input) {
    if (typeof value === "string" && TOPIC_KEYS.has(value as TopicKey)) {
      seen.add(value as TopicKey);
    }
  }
  return Array.from(seen);
}

/** In-memory answer shape held by the client flow component. */
export type Answers = {
  firstName: string;
  dateOfBirth: string | null; // ISO "YYYY-MM-DD"
  email: string;
  takenBefore: boolean | null;
  previousScore: number | null;
  hardestTopics: TopicKey[];
  hardestNotes: string;
};

/** The shape of the relevant columns as they come back from Supabase. */
export type ProfileRow = {
  first_name: string | null;
  date_of_birth: string | null;
  email: string | null;
  taken_before: boolean | null;
  previous_score: number | null;
  hardest_topics: unknown;
  hardest_notes: string | null;
  onboarding_completed: boolean | null;
};

/** Columns the onboarding page selects to seed the flow. */
export const ONBOARDING_SELECT =
  "first_name, date_of_birth, email, taken_before, previous_score, hardest_topics, hardest_notes, onboarding_completed";

/** Convert a DB row (snake_case, nullable) into the client Answers shape. */
export function mapRowToInitialAnswers(row: ProfileRow | null): Answers {
  return {
    firstName: row?.first_name ?? "",
    dateOfBirth: row?.date_of_birth ?? null,
    email: row?.email ?? "",
    takenBefore: row?.taken_before ?? null,
    previousScore: row?.previous_score ?? null,
    hardestTopics: sanitizeTopics(row?.hardest_topics),
    hardestNotes: row?.hardest_notes ?? "",
  };
}

// ----- Step list -------------------------------------------------------------

export type StepId =
  | "firstName"
  | "email"
  | "takenBefore"
  | "hardest"
  | "notifications"
  | "meetCoach";

/**
 * The ordered list of steps. The previous-score question is an inline reveal
 * within the "takenBefore" step (when the user answers Yes), not a separate
 * step. "notifications" (turn on study reminders, with example notifications)
 * is device-local and "meetCoach" (say hello to David, the AI coach) is
 * client-only — neither saves anything server-side. "meetCoach" is
 * intentionally the FINAL step, so the user meets their coach right before
 * landing on the dashboard.
 */
export function getSteps(_answers: Answers): StepId[] {
  return [
    "firstName",
    "email",
    "takenBefore",
    "hardest",
    "notifications",
    "meetCoach",
  ];
}

/** Required (non-skippable) steps, used to resume at the first unanswered one. */
export function firstUnansweredIndex(answers: Answers): number {
  const steps = getSteps(answers);
  const isAnswered: Record<StepId, boolean> = {
    firstName: answers.firstName.trim() !== "",
    email: answers.email.trim() !== "",
    takenBefore: answers.takenBefore !== null,
    hardest: true, // optional — never blocks resume
    notifications: true, // optional — never blocks resume
    meetCoach: true, // optional — never blocks resume
  };
  const idx = steps.findIndex((step) => !isAnswered[step]);
  return idx === -1 ? steps.length - 1 : idx;
}

// ----- Server action payload -------------------------------------------------

/** Discriminated union so each step only carries its own fields. */
export type SaveOnboardingInput =
  | { step: "firstName"; firstName: string }
  | { step: "email"; email: string }
  | { step: "takenBefore"; takenBefore: boolean }
  | { step: "score"; previousScore: number | null }
  | { step: "hardest"; hardestTopics: TopicKey[]; hardestNotes: string }
  | { step: "finish" };

export type SaveOnboardingResult = { ok: true } | { ok: false; error: string };
