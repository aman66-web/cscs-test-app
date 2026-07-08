import type { ModuleKey } from "@/lib/questions/types";

// =============================================================
// The five CSCS knowledge modules, in display order. Titles + descriptions
// are shown on the home screen and module selectors.
// =============================================================

export type ModuleInfo = {
  key: ModuleKey;
  title: string;
  description: string;
};

export const MODULES: ModuleInfo[] = [
  {
    key: "working_environment",
    title: "Working Environment",
    description:
      "General responsibilities, site set-up, signs, emergencies and keeping the workplace safe.",
  },
  {
    key: "occupational_health",
    title: "Occupational Health",
    description:
      "Health risks on site — dust, noise, vibration, hazardous substances and your wellbeing.",
  },
  {
    key: "safety",
    title: "Safety",
    description:
      "Everyday site safety — PPE, manual handling, slips and trips, and safe working practices.",
  },
  {
    key: "high_risk_activities",
    title: "High Risk Activities",
    description:
      "Working at height, excavations, confined spaces, plant, electricity and fire.",
  },
  {
    key: "specialist_topics",
    title: "Specialist Topics",
    description:
      "Activity-specific knowledge for particular trades and specialist site work.",
  },
];

const MODULE_BY_KEY = new Map(MODULES.map((m) => [m.key, m]));

export function moduleTitle(key: ModuleKey): string {
  return MODULE_BY_KEY.get(key)?.title ?? key;
}

export function moduleDescription(key: ModuleKey): string {
  return MODULE_BY_KEY.get(key)?.description ?? "";
}
