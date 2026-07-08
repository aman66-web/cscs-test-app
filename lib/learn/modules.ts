import type { ModuleKey } from "@/lib/questions/types";

// =============================================================
// Learn-mode structure: the 5 CSCS modules, each with study lessons
// (subtopics). Ported from the My Life in the UK Test app's
// lib/learn/modules.ts and re-populated with CSCS content.
// The subtopic `id`s here match the LessonNotes keys in lib/learn/notes.
// =============================================================

export type LearnSub = { id: string; title: string };
export type LearnModule = {
  key: ModuleKey;
  icon: string;
  bg: string;
  title: string;
  subs: LearnSub[];
};

export const LEARN_MODULES: LearnModule[] = [
  {
    key: "working_environment",
    icon: "🏗️",
    bg: "#E3F8EA",
    title: "Working Environment",
    subs: [
      { id: "responsibilities", title: "Your responsibilities & the law" },
      { id: "site_induction", title: "Site induction & signing in" },
      { id: "safety_signs", title: "Safety signs & signals" },
      { id: "emergencies", title: "Emergencies, fire & first aid" },
    ],
  },
  {
    key: "occupational_health",
    icon: "🩺",
    bg: "#DDEEFF",
    title: "Occupational Health",
    subs: [
      { id: "dust_and_asbestos", title: "Dust, silica & asbestos" },
      { id: "noise_and_vibration", title: "Noise & hand-arm vibration" },
      { id: "hazardous_substances", title: "Hazardous substances (COSHH)" },
      { id: "health_and_welfare", title: "Manual handling, welfare & wellbeing" },
    ],
  },
  {
    key: "safety",
    icon: "🦺",
    bg: "#EFE3FF",
    title: "Safety",
    subs: [
      { id: "ppe", title: "Personal protective equipment (PPE)" },
      { id: "slips_trips_falls", title: "Slips, trips & falls" },
      { id: "housekeeping_storage", title: "Housekeeping & storage" },
      { id: "tools", title: "Hand & power tools" },
    ],
  },
  {
    key: "high_risk_activities",
    icon: "⚠️",
    bg: "#FFF0D6",
    title: "High Risk Activities",
    subs: [
      { id: "working_at_height", title: "Working at height" },
      { id: "excavations_confined", title: "Excavations & confined spaces" },
      { id: "plant_and_traffic", title: "Plant, vehicles & traffic" },
      { id: "electricity_fire", title: "Electricity, fire & hot works" },
    ],
  },
  {
    key: "specialist_topics",
    icon: "🎯",
    bg: "#FFE1E1",
    title: "Specialist Topics",
    subs: [
      { id: "road_works", title: "Highway & road works" },
      { id: "gas_and_plumbing", title: "Gas & plumbing awareness" },
      { id: "demolition", title: "Demolition & refurbishment" },
      { id: "water_and_tunnelling", title: "Working near water & tunnelling" },
    ],
  },
];

const MODULE_BY_KEY = new Map(LEARN_MODULES.map((m) => [m.key, m]));
export function learnModule(key: ModuleKey): LearnModule | undefined {
  return MODULE_BY_KEY.get(key);
}

/** The first lesson id for a module (so /learn/{module}/{sub} links resolve). */
export function moduleFirstLesson(key: ModuleKey): string {
  return MODULE_BY_KEY.get(key)?.subs[0]?.id ?? "";
}

/** Status-dot colour for a subtopic's progress %. */
export function subDotColor(pct: number): string {
  if (pct >= 75) return "#22B268";
  if (pct >= 40) return "#E5A93C";
  return "#C9C4DC";
}
