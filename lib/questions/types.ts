// =============================================================
// CSCS Test App — question schema (single source of truth).
//
// Field names are snake_case so they map 1:1 to the Supabase `questions`
// table (see supabase/questions-schema.sql). The same shape is used both for
// authoring the local question bank (lib/question-bank/*) and for rows loaded
// from the database at runtime.
//
// This file is free of "use client" / "use server" and of any server-only
// imports, so it is safe to import from both server and client components.
// =============================================================

/** The five CSCS knowledge modules. Keys are stable — never renumber. */
export type ModuleKey =
  | "working_environment"
  | "occupational_health"
  | "safety"
  | "high_risk_activities"
  | "specialist_topics";

/**
 * Question format:
 *  - "multiple_choice"  → 4 options, exactly ONE correct answer.
 *  - "multiple_answer"  → 4 options, TWO OR MORE correct answers ("select X").
 *  - "hotspot"          → tap the correct region of `image_url`; the answer
 *                          lives in `hotspot_zones`, not in `options`.
 */
export type QuestionType = "multiple_choice" | "multiple_answer" | "hotspot";

/**
 * A clickable region for a hotspot question. Coordinates are normalised
 * (0–1 fractions of the image width/height) so a zone lines up on any screen
 * size. A tap counts as correct if it falls inside a zone with correct: true.
 */
export type HotspotZone = {
  /** Stable id within the question, e.g. "zone-1". */
  id: string;
  /** Optional human label (for accessibility / the explanation reveal). */
  label?: string;
  /** Left edge, as a fraction of image width (0–1). */
  x: number;
  /** Top edge, as a fraction of image height (0–1). */
  y: number;
  /** Width, as a fraction of image width (0–1). */
  width: number;
  /** Height, as a fraction of image height (0–1). */
  height: number;
  /** Whether tapping inside this zone is the correct answer. */
  correct: boolean;
};

/**
 * A single question. This is the shape stored in the question bank and
 * returned from the database.
 */
export type Question = {
  /** Stable id, e.g. "safety-001" — never renumber existing ids. */
  id: string;
  /** Which of the five CSCS modules this belongs to. */
  module: ModuleKey;
  /** Finer-grained topic within the module, e.g. "manual_handling". */
  topic: string;
  /** The question, in original wording. */
  question_text: string;
  /**
   * Answer options. Exactly 4 for multiple_choice / multiple_answer.
   * Empty ([]) for hotspot questions (the answer is a tapped zone).
   */
  options: string[];
  /**
   * Indices into `options` that are correct.
   *  - multiple_choice → one index, e.g. [2]
   *  - multiple_answer → two or more indices, e.g. [0, 3]
   *  - hotspot         → [] (correctness lives in hotspot_zones)
   */
  correct_answer: number[];
  /** One or two sentences teaching the underlying fact (shown after answering). */
  explanation: string;
  /** Optional illustration. REQUIRED for hotspot questions. */
  image_url?: string;
  /** The question format (drives which UI the runner renders). */
  question_type: QuestionType;
  /** Clickable regions — hotspot questions only, omitted otherwise. */
  hotspot_zones?: HotspotZone[];
};

/** What the practice / mock runner sends back to be recorded. */
export type RecordAnswerInput = {
  questionId: string;
  /** Selected option indices (choice questions) or tapped zone ids (hotspot). */
  selected: number[] | string[];
  isMock: boolean;
};

// -------------------------------------------------------------
// Pure grading + narrowing helpers.
// -------------------------------------------------------------

/** Narrow a jsonb `options` column to string[]. */
export function parseOptions(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input.filter((v): v is string => typeof v === "string");
}

/** Narrow a jsonb `correct_answer` column to number[] (option indices). */
export function parseIndices(input: unknown): number[] {
  if (!Array.isArray(input)) return [];
  return input.filter(
    (v): v is number => typeof v === "number" && Number.isInteger(v)
  );
}

/**
 * Grade a multiple_choice / multiple_answer question: the selected option
 * indices must match the correct indices EXACTLY (set-equality), so a
 * "select two" question is only right when both correct options are chosen
 * and nothing extra.
 */
export function isChoiceCorrect(
  selected: number[],
  correct: number[]
): boolean {
  if (selected.length !== correct.length || selected.length === 0) return false;
  const a = [...selected].sort((x, y) => x - y);
  const b = [...correct].sort((x, y) => x - y);
  return a.every((v, i) => v === b[i]);
}

/**
 * Grade a hotspot question: the tapped point (normalised 0–1 coordinates)
 * must land inside a zone marked correct.
 */
export function isHotspotCorrect(
  point: { x: number; y: number } | null | undefined,
  zones: HotspotZone[] | undefined
): boolean {
  if (!point || !zones) return false;
  return zones.some(
    (z) =>
      z.correct &&
      point.x >= z.x &&
      point.x <= z.x + z.width &&
      point.y >= z.y &&
      point.y <= z.y + z.height
  );
}

/** A raw row as it comes back from the `questions` table (jsonb un-narrowed). */
export type QuestionRow = {
  id: string;
  module: string;
  topic: string;
  question_text: string;
  options: unknown;
  correct_answer: unknown;
  explanation: string;
  image_url: string | null;
  question_type: string;
  hotspot_zones: unknown;
};

const QUESTION_TYPES: QuestionType[] = [
  "multiple_choice",
  "multiple_answer",
  "hotspot",
];

/** Narrow a DB row into a typed Question for the runner. */
export function rowToQuestion(r: QuestionRow): Question {
  const question_type = (
    QUESTION_TYPES.includes(r.question_type as QuestionType)
      ? r.question_type
      : "multiple_choice"
  ) as QuestionType;
  return {
    id: r.id,
    module: r.module as ModuleKey,
    topic: r.topic,
    question_text: r.question_text,
    options: parseOptions(r.options),
    correct_answer: parseIndices(r.correct_answer),
    explanation: r.explanation,
    image_url: r.image_url ?? undefined,
    question_type,
    hotspot_zones: Array.isArray(r.hotspot_zones)
      ? (r.hotspot_zones as HotspotZone[])
      : undefined,
  };
}
