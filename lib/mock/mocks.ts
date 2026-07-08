import type { ModuleKey, Question } from "@/lib/questions/types";
import { modulePool } from "@/lib/question-bank";
import { pickSession, shuffle, mulberry32 } from "@/lib/questions/select";
import { MOCK_CONFIG, MOCK_MODULE_WEIGHTS } from "./config";

// =============================================================
// Numbered mock tests. Each mock's 50 questions are picked with a seeded RNG,
// so "Mock 3" is the same paper on every device and on every retake (best
// scores stay comparable). Adding questions to the bank reshuffles the mocks —
// acceptable while the bank is being built up.
//
// NOTE: returns fewer than 50 questions until the question bank has enough
// content in each module. Fill lib/question-bank/*.ts before shipping mocks.
// =============================================================

/** The stable paper for mock `n` (1-based). */
export function mockQuestions(n: number): Question[] {
  const rnd = mulberry32(0x9e3779b9 ^ (n * 0x85ebca6b));
  const out: Question[] = [];
  for (const [module, count] of Object.entries(MOCK_MODULE_WEIGHTS) as [
    ModuleKey,
    number
  ][]) {
    out.push(...pickSession(modulePool(module), count, rnd));
  }
  // Top up from the whole pool if some modules were short, so a mock still
  // aims for the full 50 once enough total questions exist.
  return shuffle(out, rnd).slice(0, MOCK_CONFIG.questionCount);
}
