// =============================================================================
// VERDICT — the jury pool.
//
// Every juror states their bias UP FRONT, before the trial starts. The player
// is supposed to read the room and play to it. A jury whose reasoning is a
// black box makes losses feel arbitrary, and arbitrary losses are what kill
// AI-judged games.
//
// `weights` is what that bias actually MEANS in scoring — the numbers are the
// bias, not decoration next to it. They are relative; normaliseWeights() turns
// them into a distribution that sums to 1. So a bookkeeper who wants documents
// weights `evidence` at 40 and `narrative` at 5, and a novelist does the
// reverse, and the same closing argument genuinely lands differently on them.
// =============================================================================

import type { Juror, Scores } from "./types";

/** Raw (unnormalised) weights, written for readability. */
function w(
  evidence: number,
  contradictions: number,
  clarity: number,
  credibility: number,
  narrative: number
): Scores {
  return { evidence, contradictions, clarity, credibility, narrative };
}

export const JUROR_POOL: Juror[] = [
  {
    id: "j-nurse",
    name: "Margaret Okonjo",
    age: 62,
    occupation: "Retired nurse",
    bias: "Trusts records and people who know their own field. Impatient with vagueness.",
    weights: w(30, 20, 25, 15, 10),
  },
  {
    id: "j-bookkeeper",
    name: "Alan Prewitt",
    age: 55,
    occupation: "Bookkeeper",
    bias: "Wants documents, not stories. If it isn't written down it didn't happen.",
    weights: w(40, 25, 15, 15, 5),
  },
  {
    id: "j-owner",
    name: "Dee Ferraday",
    age: 47,
    occupation: "Owns a hair salon",
    bias: "Runs a small business and hates being lectured. Punishes advocates who bully.",
    weights: w(15, 20, 20, 35, 10),
  },
  {
    id: "j-barista",
    name: "Kai Southerly",
    age: 22,
    occupation: "Barista, part-time student",
    bias: "Assumes the person with money is hiding something. Loves a caught liar.",
    weights: w(15, 40, 15, 10, 20),
  },
  {
    id: "j-teacher",
    name: "Rosalind Hare",
    age: 39,
    occupation: "Secondary school teacher",
    bias: "Marks you on whether she could explain your argument to someone else afterwards.",
    weights: w(15, 15, 40, 15, 15),
  },
  {
    id: "j-sergeant",
    name: "Dev Ramanathan",
    age: 58,
    occupation: "Retired police sergeant",
    bias: "Watches for people overstating their case. Notices when you claim more than you proved.",
    weights: w(20, 25, 10, 35, 10),
  },
  {
    id: "j-novelist",
    name: "Beatrix Lyle",
    age: 44,
    occupation: "Novelist",
    bias: "Needs it to add up as a story. A pile of true facts with no shape does not move her.",
    weights: w(10, 15, 15, 15, 45),
  },
  {
    id: "j-plumber",
    name: "Stefan Bracka",
    age: 36,
    occupation: "Self-employed plumber",
    bias: "Plain speech only. Distrusts anyone who uses ten words where three would do.",
    weights: w(25, 20, 30, 15, 10),
  },
  {
    id: "j-admin",
    name: "Priya Nandra",
    age: 31,
    occupation: "Hospital administrator",
    bias: "Cares about process. Notices when someone skipped a step they were supposed to take.",
    weights: w(30, 25, 20, 20, 5),
  },
  {
    id: "j-vicar",
    name: "Thomas Elms",
    age: 67,
    occupation: "Parish vicar",
    bias: "Will not reward cruelty, even to a witness who is lying. Watches how you treat people.",
    weights: w(10, 15, 15, 45, 15),
  },
  {
    id: "j-tester",
    name: "Nkem Adigwe",
    age: 29,
    occupation: "Software tester",
    bias: "Hunts for the one input that breaks the story. Everything else is noise to her.",
    weights: w(15, 45, 15, 10, 15),
  },
  {
    id: "j-fundraiser",
    name: "Lorna Fitch",
    age: 41,
    occupation: "Charity fundraiser",
    bias: "Votes with whoever she believes was actually wronged. Persuaded by people, not paperwork.",
    weights: w(10, 15, 20, 20, 35),
  },
  {
    id: "j-driver",
    name: "Roy Ashkettle",
    age: 52,
    occupation: "Taxi driver",
    bias: "Thinks paperwork can be made to say anything. Judges whether someone sounds straight.",
    weights: w(10, 20, 25, 30, 15),
  },
  {
    id: "j-pharmacist",
    name: "Hana Vosloo",
    age: 34,
    occupation: "Pharmacist",
    bias: "Checks the detail against the claim. Will spot the number that doesn't match.",
    weights: w(35, 30, 15, 15, 5),
  },
];

const BY_ID = new Map(JUROR_POOL.map((j) => [j.id, j]));

export function getJuror(id: string): Juror | undefined {
  return BY_ID.get(id);
}

/** Resolve a case's juror ids, dropping any that don't exist. */
export function panelFor(jurorIds: string[]): Juror[] {
  return jurorIds
    .map((id) => BY_ID.get(id))
    .filter((j): j is Juror => j !== undefined);
}

/**
 * Turn raw weights into a distribution summing to 1, so a juror who happens to
 * have larger numbers written down isn't accidentally more influential.
 */
export function normaliseWeights(weights: Scores): Scores {
  const total =
    weights.evidence +
    weights.contradictions +
    weights.clarity +
    weights.credibility +
    weights.narrative;
  if (total <= 0) {
    // Degenerate input — fall back to an even split rather than dividing by 0.
    return {
      evidence: 0.2,
      contradictions: 0.2,
      clarity: 0.2,
      credibility: 0.2,
      narrative: 0.2,
    };
  }
  return {
    evidence: weights.evidence / total,
    contradictions: weights.contradictions / total,
    clarity: weights.clarity / total,
    credibility: weights.credibility / total,
    narrative: weights.narrative / total,
  };
}
