import type { ModuleKey, Question } from "@/lib/questions/types";
import { WORKING_ENVIRONMENT_QUESTIONS } from "./working-environment";
import { OCCUPATIONAL_HEALTH_QUESTIONS } from "./occupational-health";
import { SAFETY_QUESTIONS } from "./safety";
import { HIGH_RISK_ACTIVITIES_QUESTIONS } from "./high-risk-activities";
import { SPECIALIST_TOPICS_QUESTIONS } from "./specialist-topics";

// =============================================================
// The full question bank. Data files are authored per module; this index is
// the only import surface the app uses. Re-export module metadata too so
// callers have one place to import from.
// =============================================================

export { MODULES, moduleTitle, moduleDescription } from "./modules";
export type { ModuleInfo } from "./modules";

export const QUESTION_BANK: Question[] = [
  ...WORKING_ENVIRONMENT_QUESTIONS,
  ...OCCUPATIONAL_HEALTH_QUESTIONS,
  ...SAFETY_QUESTIONS,
  ...HIGH_RISK_ACTIVITIES_QUESTIONS,
  ...SPECIALIST_TOPICS_QUESTIONS,
];

/** Every question. */
export function allQuestions(): Question[] {
  return QUESTION_BANK;
}

/** Questions for one module. */
export function modulePool(module: ModuleKey): Question[] {
  return QUESTION_BANK.filter((q) => q.module === module);
}

/** Questions for one topic within a module. */
export function topicPool(module: ModuleKey, topic: string): Question[] {
  return QUESTION_BANK.filter((q) => q.module === module && q.topic === topic);
}

/** Question count per module. */
export function moduleCounts(): Record<ModuleKey, number> {
  const counts: Record<ModuleKey, number> = {
    working_environment: 0,
    occupational_health: 0,
    safety: 0,
    high_risk_activities: 0,
    specialist_topics: 0,
  };
  for (const q of QUESTION_BANK) counts[q.module] += 1;
  return counts;
}

const byId = new Map<string, Question>();
export function questionById(id: string): Question | undefined {
  if (byId.size === 0) for (const q of QUESTION_BANK) byId.set(q.id, q);
  return byId.get(id);
}
