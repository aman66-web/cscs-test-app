import type { ModuleKey } from "@/lib/questions/types";
import type { LessonNotes } from "./types";
import { WORKING_ENVIRONMENT_NOTES } from "./working-environment";
import { OCCUPATIONAL_HEALTH_NOTES } from "./occupational-health";
import { SAFETY_NOTES } from "./safety";
import { HIGH_RISK_ACTIVITIES_NOTES } from "./high-risk-activities";
import { SPECIALIST_TOPICS_NOTES } from "./specialist-topics";

// All lesson notes, keyed by module then subtopic id.
export const NOTES_BY_MODULE: Record<ModuleKey, Record<string, LessonNotes>> = {
  working_environment: WORKING_ENVIRONMENT_NOTES,
  occupational_health: OCCUPATIONAL_HEALTH_NOTES,
  safety: SAFETY_NOTES,
  high_risk_activities: HIGH_RISK_ACTIVITIES_NOTES,
  specialist_topics: SPECIALIST_TOPICS_NOTES,
};

export function lessonNotes(module: ModuleKey, subId: string): LessonNotes | undefined {
  return NOTES_BY_MODULE[module]?.[subId];
}
