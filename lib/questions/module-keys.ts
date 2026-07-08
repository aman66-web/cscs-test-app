import type { ModuleKey } from "@/lib/questions/types";

/** The five module keys, as a runtime array. */
export const MODULE_KEYS: ModuleKey[] = [
  "working_environment",
  "occupational_health",
  "safety",
  "high_risk_activities",
  "specialist_topics",
];

/** Type guard: is this string one of the five module keys? */
export function isModuleKey(value: string): value is ModuleKey {
  return (MODULE_KEYS as string[]).includes(value);
}
