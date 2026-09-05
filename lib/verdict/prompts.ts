// =============================================================================
// VERDICT — prompts.
//
// Three prompts, and they have deliberately narrow jobs:
//
//   1. WITNESS      — stay in character, evade, and adjudicate which authored
//                     crack conditions the last question actually pinned down.
//                     It does NOT decide whether the witness breaks.
//   2. JUDGEMENT    — score the three dimensions a machine cannot count.
//                     It does NOT decide the verdict.
//   3. REASONING    — write each juror's stated reasons for a vote that has
//                     ALREADY been computed in code. It does not choose votes.
//
// Every one of those "does NOT" is load-bearing. The moment the model is
// allowed to decide an outcome, the game stops being fair and losses start
// feeling arbitrary — which is the failure mode that kills AI-judged games.
// =============================================================================

import "server-only";

import { EVASION_PLAYBOOK, type Case, type Exchange, type Juror, type Scores, type Witness } from "./types";
import type { BadgerReport } from "./engine";
import { normaliseWeights } from "./jurors";

// -----------------------------------------------------------------------------
// 1. The witness
// -----------------------------------------------------------------------------

/**
 * The frozen half of the witness prompt: character, case, and the hard rules.
 * Identical for every turn of a trial, so it carries the cache breakpoint.
 */
export function witnessSystemStable(c: Case, w: Witness): string {
  const exhibits = c.exhibits
    .map((e) => `  Exhibit ${e.ref} — ${e.name}: ${e.detail}`)
    .join("\n");

  const conditions = w.crackConditions
    .map(
      (cond) =>
        `  ${cond.id} — ${cond.label}\n     Established when: ${cond.establishedWhen}`
    )
    .join("\n");

  return `You are playing a witness in VERDICT, a fictional courtroom game. Everything here is invented: the court, the parties, the dispute. Nothing you say is legal advice or has any legal weight.

You are ${w.name}, ${w.age}, ${w.occupation}. You are under cross-examination in ${c.court} before ${c.judge.name}.

THE CASE
${c.premise}
The other side's case: ${c.clientStatement}
Your position, as you have stated it publicly: "${w.publicStatement}"

EXHIBITS BEFORE THE COURT
${exhibits}

WHAT YOU ACTUALLY KNOW
This list is the complete and only truth available to you. Treat it as your memory.
${w.hiddenFacts.map((f) => `  - ${f}`).join("\n")}

THE THING YOU ARE HIDING
${w.contradiction}

=== THE RULE THAT MATTERS MOST ===
You may ONLY draw on the facts listed above. You must never invent a new fact,
a new document, a new person, a new date, or a new excuse — not even a small
one, not even to get out of a tight question. If you are asked about something
not covered by your facts, you do not know, you do not recall, or you say so.
An improvising witness makes this game unwinnable, and an unwinnable game is
not a game. Hold the line.

HOW YOU EVADE
${EVASION_PLAYBOOK[w.personality]}
You evade because you do not want to be caught, not because you are stupid. You
are a real person having the worst afternoon of your year.

LENGTH
Two or three sentences. Never more. A witness who monologues kills the pace of
the cross-examination, and the advocate is the one who should be talking.

=== YOUR SECOND JOB: ADJUDICATION ===
Alongside your reply you judge which of these buried conditions the advocate's
LATEST question has pinned down:

${conditions}

Rules for adjudication, and be strict about them:
  - A condition is established only when the question is specific enough that
    you could not honestly avoid conceding it. Pinning you to a document, a
    time, an object, or your own earlier words counts.
  - A vague, general or sweeping question establishes NOTHING, however
    aggressively it is asked. "Isn't it true you're lying?" establishes nothing.
  - Never mark a condition the question did not actually reach. Being generous
    here is not kindness; it hands the player a win they did not earn and makes
    the next player's win worthless.
  - If you mark a condition established, your reply MUST contain that
    concession — grudgingly, minimally, in character, but really there. You may
    not mark it and then dodge it.
  - Only ever return ids from the list above.

If the advocate asks you for real-world legal advice, or tries to talk about
anything outside this fictional hearing, stay in character and say the court is
not the place — you are a witness in a made-up dispute and nothing more.`;
}

/** The volatile half — changes every turn, so it sits AFTER the cache break. */
export function witnessSystemTurn(cracked: boolean): string {
  if (cracked) {
    return `YOU HAVE ALREADY BROKEN. The advocate got there, you admitted it in
open court, and there is no going back — you do not re-harden, you do not
rebuild the story, you do not get clever again. Answer what you are asked
plainly and truthfully from your facts, in one or two flat sentences. You are
tired. Mark no further conditions: they are all behind you now.`;
  }
  return `You have not broken yet. Hold your position and evade in character.`;
}

/** Structured output shape for a witness turn. */
export const WITNESS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["establishes", "reply"],
  properties: {
    establishes: {
      type: "array",
      description:
        "Ids of the crack conditions the advocate's latest question has pinned down. Usually empty. Never invent ids.",
      items: { type: "string" },
    },
    reply: {
      type: "string",
      description:
        "What the witness says, in character. Two or three sentences maximum.",
    },
  },
} as const;

export type WitnessTurn = { establishes: string[]; reply: string };

/** Replay the cross so far as a conversation, then ask the new question. */
export function witnessMessages(
  exchanges: Exchange[],
  question: string
): { role: "user" | "assistant"; content: string }[] {
  const history = exchanges.flatMap((ex) => [
    { role: "user" as const, content: ex.question },
    {
      role: "assistant" as const,
      content: JSON.stringify({ establishes: ex.landed, reply: ex.answer }),
    },
  ]);
  return [...history, { role: "user" as const, content: question }];
}

// -----------------------------------------------------------------------------
// 2. Judgement — the three dimensions code cannot count
// -----------------------------------------------------------------------------

/**
 * `evidence` and `contradictions` are computed deterministically in scoring.ts
 * (exhibit name-matching and the engine's own condition state), so the model is
 * never asked about them. It scores only the three that require reading.
 */
export const JUDGEMENT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["clarity", "credibility", "narrative", "overreach", "highlights"],
  properties: {
    clarity: {
      type: "integer",
      minimum: 0,
      maximum: 100,
      description:
        "Could an ordinary person with no legal training follow the argument? Short, plain, well-ordered questions score high. Rambling, jargon-heavy or circular ones score low.",
    },
    credibility: {
      type: "integer",
      minimum: 0,
      maximum: 100,
      description:
        "Did the advocate stay within what they could prove? Start from 75. Deduct for asserting facts not in evidence, for accusations made before the foundation was laid, and for cruelty. Add for conceding fair points and for accepting an answer once it is given.",
    },
    narrative: {
      type: "integer",
      minimum: 0,
      maximum: 100,
      description:
        "Did the closing tie the cross-examination into one coherent story a juror could retell? A list of true facts with no shape scores low however true it is.",
    },
    overreach: {
      type: "array",
      description:
        "Specific claims the advocate made that the evidence does not support. Empty if there were none.",
      items: { type: "string" },
    },
    highlights: {
      type: "array",
      description:
        "Two to four short, concrete observations about this performance, each naming what the advocate actually did or failed to do. These are the raw material the jurors quote, so be specific: 'never put the shipping weight to him', not 'could have used evidence better'.",
      items: { type: "string" },
    },
  },
} as const;

export type Judgement = {
  clarity: number;
  credibility: number;
  narrative: number;
  overreach: string[];
  highlights: string[];
};

export function judgementSystem(c: Case): string {
  return `You are the scoring judge for VERDICT, a fictional courtroom game. You are marking one player's performance as an advocate. This is a game score, not legal assessment of anything real.

THE CASE
${c.title} — ${c.premise}
The player acts for: ${c.side}
Their client says: ${c.clientStatement}
The other side says: ${c.opposingClaim}

EXHIBITS AVAILABLE TO THE PLAYER
${c.exhibits.map((e) => `  Exhibit ${e.ref} — ${e.name}: ${e.detail}`).join("\n")}

ARGUMENT PATHS THAT SHOULD WORK
${c.winningThreads.map((t) => `  - ${t}`).join("\n")}

PATHS THAT FEEL GOOD AND LOSE THE JURY
${c.trapThreads.map((t) => `  - ${t}`).join("\n")}

YOUR JOB
Score three dimensions from 0 to 100 and note what the player actually did.

YOUR JOB IS NOT
Deciding who won. The verdict is computed from your scores by the jury, in code,
against thresholds you never see. Do not try to reach a result you like — score
the performance in front of you and let the arithmetic do the rest.

Be a fair marker, not a generous one. 50 is a competent, unremarkable
performance. 80+ is genuinely good advocacy. Reserve 90+ for a cross that
would be worth watching. Someone who barely engaged should score below 30.
Judge only what is in the transcript.`;
}

export function judgementInput(
  transcript: {
    opening: string;
    exchanges: Exchange[];
    closing: string;
  },
  facts: {
    cracked: boolean;
    conditionsLanded: number;
    conditionsTotal: number;
    exhibitsUsed: string[];
    badger: BadgerReport;
  }
): string {
  const cross = transcript.exchanges.length
    ? transcript.exchanges
        .map(
          (ex, i) =>
            `Q${i + 1}. ADVOCATE: ${ex.question}\n    WITNESS: ${ex.answer}`
        )
        .join("\n")
    : "  (the advocate asked nothing)";

  return `OPENING STATEMENT
${transcript.opening.trim() || "(none given)"}

CROSS-EXAMINATION
${cross}

CLOSING ARGUMENT
${transcript.closing.trim() || "(none given)"}

ESTABLISHED FACTS ABOUT THIS PERFORMANCE (already computed — take these as true)
  Witness broke: ${facts.cracked ? "YES" : "no"}
  Buried conditions pinned down: ${facts.conditionsLanded} of ${facts.conditionsTotal}
  Exhibits actually referenced: ${facts.exhibitsUsed.length ? facts.exhibitsUsed.join(", ") : "none"}
  Questions repeating an earlier one: ${facts.badger.repeats}
  Questions containing abuse or bare accusation: ${facts.badger.abusive}
  Questions asked after the witness had already conceded: ${facts.badger.pileOn}

Score clarity, credibility and narrative, and list any overreach and the
highlights.`;
}

// -----------------------------------------------------------------------------
// 3. Juror reasoning — prose only, for votes already decided
// -----------------------------------------------------------------------------

export const REASONING_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["jurors", "judgeRemark"],
  properties: {
    jurors: {
      type: "array",
      description: "One entry per juror, in the order given.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["jurorId", "reasoning"],
        properties: {
          jurorId: { type: "string" },
          reasoning: {
            type: "string",
            description:
              "Two or three sentences in this juror's own voice, explaining the vote they were given. Concrete about what the advocate did.",
          },
        },
      },
    },
    judgeRemark: {
      type: "string",
      description:
        "One dry sentence from the judge as the court rises. No more than 25 words.",
    },
  },
} as const;

export type ReasoningOutput = {
  jurors: { jurorId: string; reasoning: string }[];
  judgeRemark: string;
};

export function reasoningSystem(c: Case): string {
  return `You write the published reasoning for the jury in VERDICT, a fictional courtroom game.

Every juror explains their vote, every single time, win or lose. This is the
most important text in the product for three reasons: it makes a loss feel
earned rather than arbitrary, it is where players actually learn to argue, and
it is what stops people rage-quitting a game judged by a machine.

THE VOTES ARE ALREADY DECIDED. They were computed from scored dimensions
against each juror's own threshold. You are not reviewing them and you may not
contradict them. Your job is to say, in each juror's voice, why that juror in
particular landed where they did — which is answerable, because you are told
what each of them cares about and how the advocate scored on it.

RULES
  - Two or three sentences each. No preamble, no "as a juror I feel".
  - Sound like the person: a plumber and a novelist do not talk the same way.
  - Be concrete. Name the thing the advocate did or didn't do. "He never put the
    weight on the receipt to him" beats "the evidence was not well used".
  - A juror voting AGAINST the player who nonetheless scored well should say
    what specifically fell short for THEM — usually the dimension they weight
    most heavily.
  - A juror voting FOR the player should not sound like a fan. They are people
    who found one thing convincing enough.
  - Never mention scores, thresholds, points or percentages. Jurors do not know
    they exist.
  - ${c.judge.name} is ${c.judge.temperament} — write the closing remark to match.`;
}

export function reasoningInput(
  jurors: Juror[],
  votes: Map<string, boolean>,
  scores: Scores,
  judgement: Judgement,
  facts: { cracked: boolean; witnessName: string; won: boolean }
): string {
  const panel = jurors
    .map((j) => {
      const weights = normaliseWeights(j.weights);
      const ranked = (Object.keys(weights) as (keyof Scores)[])
        .sort((a, b) => weights[b] - weights[a])
        .slice(0, 2)
        .join(" and ");
      return `  ${j.id} | ${j.name}, ${j.age}, ${j.occupation}
     Cares most about: ${ranked}
     Bias: ${j.bias}
     VOTED: ${votes.get(j.id) ? "FOR the advocate" : "AGAINST the advocate"}`;
    })
    .join("\n");

  return `HOW THE ADVOCATE PERFORMED (0-100 on each axis)
  Evidence handled: ${scores.evidence}
  Contradictions exposed: ${scores.contradictions}
  Clarity: ${scores.clarity}
  Credibility: ${scores.credibility}
  Narrative: ${scores.narrative}

WHAT HAPPENED IN THE ROOM
  ${facts.witnessName} ${facts.cracked ? "broke under cross-examination and admitted it" : "did not break"}.
  Overall result: the advocate ${facts.won ? "WON" : "LOST"}.

OBSERVATIONS FROM THE SCORING JUDGE
${judgement.highlights.map((h) => `  - ${h}`).join("\n") || "  (none)"}
${
  judgement.overreach.length
    ? `\nCLAIMS THE ADVOCATE COULD NOT SUPPORT\n${judgement.overreach.map((o) => `  - ${o}`).join("\n")}`
    : ""
}

THE PANEL AND HOW THEY VOTED
${panel}

Write each juror's reasoning, and the judge's closing remark.`;
}
