// =============================================================================
// VERDICT — fairness checks.   Run with:  npm run verify:verdict
//
// The two things most likely to kill this game are "verdicts feel arbitrary"
// and "the witness improvises and breaks fairness". Both are prevented by
// invariants rather than by care, so both are asserted here rather than
// trusted. Nothing in this file calls a model: every property below holds
// offline, deterministically, or it is not a property.
//
// What it guards:
//   1. The crack is engine-owned — earned in any order, never by luck, never
//      by an invented condition id, never re-hardened, never forgeable from
//      the browser.
//   2. Evidence and conduct are counted, not judged — same words, same numbers.
//   3. The verdict is arithmetic — stable across runs, immune to model jitter,
//      seeded per juror, and shaped so that breaking the witness is what wins.
//   4. Every authored case is playable and gives nothing away.
//
// Add a case, change a weight, or touch a threshold, and run this.
// =============================================================================

import {
  applyTurn,
  reconcile,
  allConditionsMet,
  pressure,
  exhibitsCitedIn,
  badgering,
  bestExchange,
  EMPTY_CROSS_STATE,
  type CrossState,
} from "../engine";
import {
  assembleScores,
  tally,
  thresholdFor,
  quantise,
  evidenceScore,
} from "../scoring";
import { panelFor } from "../jurors";
import { theDog } from "../cases/the-dog";
import { weddingPhotographer } from "../cases/wedding-photographer";
import { theGuitar } from "../cases/the-guitar";
import { theDeposit } from "../cases/the-deposit";
import { theReference } from "../cases/the-reference";
import type { Exchange } from "../types";

let failures = 0;
function check(name: string, ok: boolean, detail = "") {
  if (!ok) failures += 1;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

const w = theDog.witnesses[0];
const ids = w.crackConditions.map((c) => c.id);
console.log(`\nWITNESS: ${w.name} — conditions ${ids.join(", ")}\n`);

// ---- 1. The crack ----------------------------------------------------------
console.log("1. THE CRACK IS ENGINE-OWNED");

// Every permutation of the conditions must crack, and only on the last one.
function permute<T>(xs: T[]): T[][] {
  if (xs.length <= 1) return [xs];
  return xs.flatMap((x, i) =>
    permute([...xs.slice(0, i), ...xs.slice(i + 1)]).map((rest) => [x, ...rest])
  );
}

let allOrdersCrack = true;
let crackedEarly = false;
for (const order of permute(ids)) {
  let state: CrossState = EMPTY_CROSS_STATE;
  order.forEach((id, i) => {
    const r = applyTurn(w, state, [id]);
    state = r.next;
    const isLast = i === order.length - 1;
    if (!isLast && r.mode === "crack") crackedEarly = true;
    if (isLast && r.mode !== "crack") allOrdersCrack = false;
  });
}
check("cracks on every ordering of the conditions", allOrdersCrack);
check("never cracks before the last condition lands", !crackedEarly);

// Two at once, then the third.
{
  let s = applyTurn(w, EMPTY_CROSS_STATE, [ids[0], ids[1]]);
  check("two conditions in one question → rattled, not cracked", s.mode === "rattled");
  const s2 = applyTurn(w, s.next, [ids[2]]);
  check("third condition then cracks", s2.mode === "crack");
}

// A model that invents ids or claims everything at once cannot force a crack.
{
  const r = applyTurn(w, EMPTY_CROSS_STATE, ["c99", "totally-made-up", ""]);
  check("invented condition ids are ignored", r.landed.length === 0 && r.mode === "evade");
}

// Once cracked, stays cracked.
{
  let s: CrossState = { established: ids, cracked: true };
  const r = applyTurn(w, s, []);
  check("a cracked witness never re-hardens", r.mode === "cracked" && r.next.cracked);
}

// A tampered client payload cannot fake a crack.
{
  const forged = reconcile(w, { established: ["c1", "c99", "c1"], cracked: true });
  check(
    "forged `cracked: true` is discarded",
    forged.cracked === false && forged.established.length === 1,
    `established=${JSON.stringify(forged.established)}`
  );
  const honest = reconcile(w, { established: ids, cracked: false });
  check("earned crack is re-derived from state", honest.cracked === true);
}

check(
  "pressure tracks conditions only",
  pressure(w, EMPTY_CROSS_STATE) === 0 &&
    pressure(w, { established: [ids[0]], cracked: false }) === 33 &&
    pressure(w, { established: ids, cracked: true }) === 100
);

// ---- 2. Exhibit detection --------------------------------------------------
console.log("\n2. EVIDENCE IS COUNTED, NOT JUDGED");

const spoken =
  "Mr Threadgold, look at the photograph of the fence please. And the vet invoice from Marchgate. Exhibit A shows 19:40.";
const cited = exhibitsCitedIn(spoken, theDog.exhibits);
check("matches names, aliases and exhibit refs", cited.length >= 3, cited.join(","));
check(
  "identical text always gives identical result",
  JSON.stringify(exhibitsCitedIn(spoken, theDog.exhibits)) === JSON.stringify(cited)
);
check(
  "punctuation and case are ignored",
  exhibitsCitedIn("THE VET INVOICE!!!", theDog.exhibits).includes("B")
);
check("unrelated text cites nothing", exhibitsCitedIn("Good afternoon.", theDog.exhibits).length === 0);
check(
  "pivotal exhibits are worth more",
  evidenceScore(theDog.exhibits, ["A"]) > evidenceScore(theDog.exhibits, ["D"])
);

// ---- 3. Badgering ----------------------------------------------------------
console.log("\n3. CONDUCT IS COUNTED TOO");
const rough: Exchange[] = [
  { question: "Where were you standing at the fence that afternoon?", answer: "By the gate.", mode: "evade", landed: [], exhibitsCited: [] },
  { question: "Where were you standing at the fence that afternoon?", answer: "By the gate.", mode: "evade", landed: [], exhibitsCited: [] },
  { question: "You are lying to this court.", answer: "I am not.", mode: "evade", landed: [], exhibitsCited: [] },
];
const b = badgering(rough);
check("repeated questions are detected", b.repeats === 1, `repeats=${b.repeats}`);
check("bare accusation is detected", b.abusive >= 1, `abusive=${b.abusive}`);

// ---- 4. The verdict --------------------------------------------------------
console.log("\n4. THE VERDICT IS ARITHMETIC");

const panel = panelFor(theDog.jurorIds);
check("five jurors empanelled", panel.length === 5);

const judgement = { clarity: 68, credibility: 74, narrative: 71, overreach: [], highlights: [] };
const facts = {
  exhibitsUsed: ["A", "B", "C"],
  conditionsLanded: 3,
  conditionsTotal: 3,
  badger: { repeats: 0, abusive: 0, pileOn: 0 },
};

const first = tally(theDog, panel, assembleScores(theDog, judgement, facts));
let stable = true;
for (let i = 0; i < 500; i += 1) {
  const again = tally(theDog, panel, assembleScores(theDog, judgement, facts));
  if (again.won !== first.won || again.votesFor !== first.votesFor) stable = false;
}
check("same performance → same verdict, 500 runs", stable, `${first.votesFor}-${5 - first.votesFor} ${first.won ? "WON" : "LOST"}`);

// Model jitter of ±2 must not move anything.
let jitterStable = true;
for (const d of [-2, -1, 0, 1, 2]) {
  const jittered = tally(
    theDog,
    panel,
    assembleScores(theDog, { ...judgement, clarity: 68 + d, credibility: 74 + d, narrative: 71 + d }, facts)
  );
  if (jittered.won !== first.won || jittered.votesFor !== first.votesFor) jitterStable = false;
}
check("±2 model jitter cannot flip a juror", jitterStable);
check("quantise rounds to fives", quantise(68) === 70 && quantise(71) === 70 && quantise(103) === 100 && quantise(-5) === 0);

// Thresholds are seeded, not random.
const t1 = panel.map((j) => thresholdFor(theDog, j));
const t2 = panel.map((j) => thresholdFor(theDog, j));
check("thresholds are stable across calls", JSON.stringify(t1) === JSON.stringify(t2), t1.join(","));
check("thresholds differ per juror", new Set(t1).size > 1);
check(
  "harder cases raise the whole room's scepticism",
  thresholdFor({ ...theDog, difficulty: 5 }, panel[0]) >
    thresholdFor({ ...theDog, difficulty: 1 }, panel[0])
);

// Cracking must be the difference between winning and losing — on every case,
// not just the one that happened to be convenient.
const shape: string[] = [];
let crackAlwaysWins = true;
let weakAlwaysLoses = true;
let passiveAlwaysLoses = true;

for (const c of [theDog, weddingPhotographer, theGuitar, theDeposit, theReference]) {
  const p = panelFor(c.jurorIds);
  const total = c.witnesses[0].crackConditions.length;
  const pivotal = c.exhibits.filter((e) => e.pivotal).map((e) => e.ref);
  const clean = { repeats: 0, abusive: 0, pileOn: 0 };

  // Did the work: broke the witness, used the pivotal exhibits.
  const cracked = tally(
    c,
    p,
    assembleScores(c, judgement, {
      exhibitsUsed: pivotal,
      conditionsLanded: total,
      conditionsTotal: total,
      badger: clean,
    })
  );

  // Found one thing, named one exhibit, otherwise behaved impeccably.
  const weak = tally(
    c,
    p,
    assembleScores(c, judgement, {
      exhibitsUsed: pivotal.slice(0, 1),
      conditionsLanded: 1,
      conditionsTotal: total,
      badger: clean,
    })
  );

  // Barely turned up. Nothing to criticise, because nothing was attempted.
  const passive = tally(
    c,
    p,
    assembleScores(c, { clarity: 12, credibility: 78, narrative: 10, overreach: [], highlights: [] }, {
      exhibitsUsed: [],
      conditionsLanded: 0,
      conditionsTotal: total,
      badger: clean,
    })
  );

  if (!cracked.won) crackAlwaysWins = false;
  if (weak.won) weakAlwaysLoses = false;
  if (passive.won) passiveAlwaysLoses = false;

  shape.push(
    `${c.id}(d${c.difficulty}) crack ${cracked.votesFor}-${5 - cracked.votesFor} / weak ${weak.votesFor}-${5 - weak.votesFor} / passive ${passive.votesFor}-${5 - passive.votesFor}`
  );
}

shape.forEach((line) => console.log(`      ${line}`));
check("breaking the witness wins — every case", crackAlwaysWins);
check("a cross that found one fact loses — every case", weakAlwaysLoses);
check("a passive advocate cannot coast on good behaviour", passiveAlwaysLoses);

// Badgering a cracked witness must be able to cost you the room.
const brutal = tally(
  theDog,
  panel,
  assembleScores(theDog, { ...judgement, credibility: 40 }, {
    ...facts,
    badger: { repeats: 3, abusive: 2, pileOn: 2 },
  })
);
check(
  "cruelty costs votes even after a crack",
  brutal.votesFor < first.votesFor,
  `${brutal.votesFor}-${5 - brutal.votesFor}`
);

// A different case must empanel a different room.
const panel2 = panelFor(weddingPhotographer.jurorIds);
check(
  "each case has its own jury",
  JSON.stringify(panel.map((j) => j.id)) !== JSON.stringify(panel2.map((j) => j.id))
);

// ---- 5. Clip selection -----------------------------------------------------
console.log("\n5. THE CLIP FINDS THE MOMENT");
const withCrack: Exchange[] = [
  { question: "Good afternoon.", answer: "Afternoon.", mode: "evade", landed: [], exhibitsCited: [] },
  { question: "You had the cane in your hand, didn't you?", answer: "…All right — yes.", mode: "crack", landed: ["c3"], exhibitsCited: ["C"] },
  { question: "Thank you.", answer: "Mm.", mode: "cracked", landed: [], exhibitsCited: [] },
];
check("picks the crack as the best exchange", bestExchange(withCrack) === 1);
check("no exchanges → no clip", bestExchange([]) === null);

// ---- 6. Every case is well-formed -----------------------------------------
console.log("\n6. EVERY CASE IS PLAYABLE");

const all = [theDog, weddingPhotographer, theGuitar, theDeposit, theReference];
const personalities = new Set(all.map((c) => c.witnesses[0].personality));
check("five cases", all.length === 5);
check("all five personalities represented", personalities.size === 5, [...personalities].join(","));
check(
  "every case: one witness, 2-3 conditions, 5 jurors, pivotal exhibits",
  all.every(
    (c) =>
      c.witnesses.length === 1 &&
      c.witnesses[0].crackConditions.length >= 2 &&
      c.witnesses[0].crackConditions.length <= 3 &&
      panelFor(c.jurorIds).length === 5 &&
      c.exhibits.some((e) => e.pivotal) &&
      c.winningThreads.length >= 2 &&
      c.trapThreads.length >= 2 &&
      c.witnesses[0].crackResponse.length > 80
  )
);
check(
  "every case is winnable: all conditions land → crack",
  all.every((c) => allConditionsMet(c.witnesses[0], c.witnesses[0].crackConditions.map((x) => x.id)))
);
check(
  "condition ids are opaque (leak nothing)",
  all.every((c) => c.witnesses[0].crackConditions.every((x) => /^c\d+$/.test(x.id)))
);

console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`}\n`);
process.exit(failures === 0 ? 0 : 1);
