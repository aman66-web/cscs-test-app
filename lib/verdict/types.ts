// =============================================================================
// VERDICT — domain model.
//
// Every case is a DATA OBJECT, not a script. That is what makes cases
// repeatable, comparable between players, and (later) generatable.
//
// THE ONE RULE THAT MAKES THE GAME FAIR:
//   A witness may only ever draw on their authored `hiddenFacts`. They never
//   invent a new fact mid-trial. An improvising witness makes the game
//   unwinnable, and an unwinnable game is not a game.
//
// Server/client split — read this before touching the types:
//   `Witness` contains the buried truth (hiddenFacts, crackConditions,
//   crackResponse). It NEVER leaves the server. The client only ever sees
//   `PublicWitness`. Everything the player is allowed to know is on the
//   public types; everything else is behind `lib/verdict/cases/`, which is
//   imported exclusively from route handlers.
// =============================================================================

// -----------------------------------------------------------------------------
// Scoring dimensions — the five axes every juror weighs.
// -----------------------------------------------------------------------------

export const DIMENSIONS = [
  "evidence",
  "contradictions",
  "clarity",
  "credibility",
  "narrative",
] as const;

export type Dimension = (typeof DIMENSIONS)[number];

/** 0–100 on each axis. */
export type Scores = Record<Dimension, number>;

export const DIMENSION_LABELS: Record<Dimension, string> = {
  evidence: "Evidence handled",
  contradictions: "Contradictions exposed",
  clarity: "Clarity",
  credibility: "Credibility",
  narrative: "Narrative",
};

export const DIMENSION_BLURBS: Record<Dimension, string> = {
  evidence: "Did you actually use the exhibits you were given?",
  contradictions: "Did you surface the buried inconsistency?",
  clarity: "Could a normal person follow the argument?",
  credibility: "Did you overreach, badger, or claim things not in evidence?",
  narrative: "Did the closing tie it into one coherent story?",
};

// -----------------------------------------------------------------------------
// Witness personalities — how they evade BEFORE they crack.
// -----------------------------------------------------------------------------

export type Personality =
  | "nervous"
  | "hostile"
  | "smug"
  | "rehearsed"
  | "sympathetic";

export const PERSONALITY_LABELS: Record<Personality, string> = {
  nervous: "Nervous",
  hostile: "Hostile",
  smug: "Smug",
  rehearsed: "Rehearsed",
  sympathetic: "Sympathetic",
};

/**
 * How each personality dodges. This is the single most important piece of
 * flavour in the game — it is the texture the player is reading for.
 * Written as direct instruction because it is pasted into the system prompt.
 */
export const EVASION_PLAYBOOK: Record<Personality, string> = {
  nervous:
    "You over-explain. You answer a question with three sentences when one would do, and the third one usually gives away more than you meant. You apologise. When cornered you retreat into 'I don't remember exactly' and 'it was all very quick'.",
  hostile:
    "You attack the question rather than answer it. You query its relevance, correct its wording, and imply the advocate is wasting the court's time. You answer eventually, but only the narrowest possible version of what was asked.",
  smug:
    "You condescend. You explain your industry to the advocate as though to a child, use jargon you then define unprompted, and treat the whole hearing as beneath you. You are never rude — you are patronising, which is worse.",
  rehearsed:
    "You have a prepared line and you return to it VERBATIM, word for word, whenever you are pressed — the same sentence, not a paraphrase. Outside that line your answers are thin and cautious. The repetition is a tell and you do not notice it.",
  sympathetic:
    "You are warm, apologetic and eager to be helpful. You concede small things instantly and gracefully, which makes the big thing harder to reach. You never fight. If the advocate is harsh with you, you become quietly wounded rather than defensive — and the jury notices.",
};

// -----------------------------------------------------------------------------
// The buried inconsistency the whole trial turns on.
// -----------------------------------------------------------------------------

/**
 * One fact the player must PIN DOWN before the witness can break.
 *
 * `id` is deliberately opaque ("c1", "c2", "c3") because it is sent to the
 * browser to drive the pressure meter. A descriptive id would leak the answer.
 * `label` and `establishedWhen` stay server-side.
 */
export type CrackCondition = {
  id: string;
  /** Server-side only. What this condition actually is, for the adjudicator. */
  label: string;
  /** Server-side only. What counts as the player having established it. */
  establishedWhen: string;
};

export type Witness = {
  id: string;
  name: string;
  age: number;
  occupation: string;
  personality: Personality;
  /** One line of stage direction for the courtroom UI. */
  demeanour: string;

  /** What they said before trial. The player CAN see this. */
  publicStatement: string;

  /**
   * What they actually know. NEVER shown to the player, and the witness may
   * not go beyond it. If it isn't in here, it did not happen.
   */
  hiddenFacts: string[];

  /** THE buried inconsistency between the public statement and the truth. */
  contradiction: string;

  /**
   * Two or three specific facts the player must establish, IN ANY ORDER,
   * before the witness breaks. Not a keyword. Not luck.
   */
  crackConditions: CrackCondition[];

  /**
   * Played verbatim by the engine the moment the last condition lands. Authored,
   * not generated, so the payoff is identical for every player who earns it.
   */
  crackResponse: string;

  /** Stage direction rendered alongside the crack. */
  crackDemeanour: string;
};

/** Everything about a witness the player is allowed to see. */
export type PublicWitness = {
  id: string;
  name: string;
  age: number;
  occupation: string;
  personality: Personality;
  demeanour: string;
  publicStatement: string;
};

// -----------------------------------------------------------------------------
// Evidence
// -----------------------------------------------------------------------------

export type Exhibit = {
  /** Short reference the player can say out loud: "Exhibit C". */
  ref: string;
  name: string;
  /** What it shows. Visible to the player in the case notes and in court. */
  detail: string;
  /**
   * Other ways a player might name this exhibit out loud. Used for the
   * deterministic "evidence handled" score — no model call needed.
   */
  aliases: string[];
  /**
   * Pivotal exhibits are the ones the case actually turns on. Using them is
   * worth more than name-checking the wallpaper.
   */
  pivotal: boolean;
};

// -----------------------------------------------------------------------------
// The case
// -----------------------------------------------------------------------------

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type Case = {
  id: string;
  title: string;
  /** One line. Must be intriguing entirely on its own. */
  premise: string;
  /** Fictional, always. */
  court: string;
  /** Fictional judge, with a personality — cheap flavour, big effect. */
  judge: { name: string; temperament: string };

  /** Who the player argues for, and against what. */
  side: string;
  clientStatement: string;
  opposingClaim: string;
  /** What is actually at stake, in money. */
  stake: string;

  exhibits: Exhibit[];
  witnesses: Witness[];

  difficulty: Difficulty;

  /** The 2–4 argument paths that should work. Used to brief the jury judge. */
  winningThreads: string[];
  /** Paths that feel good and lose the jury. Also briefed to the judge. */
  trapThreads: string[];

  /** Ids from lib/verdict/jurors.ts. Five for Milestone 1. */
  jurorIds: string[];
};

/** The case as the browser sees it — no hidden facts, no crack conditions. */
export type PublicCase = Omit<Case, "witnesses"> & {
  witnesses: PublicWitness[];
};

// -----------------------------------------------------------------------------
// Jury
// -----------------------------------------------------------------------------

export type Juror = {
  id: string;
  name: string;
  age: number;
  occupation: string;
  /** Stated up front, before the trial. The player gets to know the room. */
  bias: string;
  /** Weights over the five dimensions. Normalised at load; must be positive. */
  weights: Scores;
};

export type JurorVerdict = {
  jurorId: string;
  name: string;
  occupation: string;
  bias: string;
  /** True = voted for the player's side. */
  forPlayer: boolean;
  /** The weighted score this juror gave, 0–100. */
  score: number;
  /** What it took to convince this particular juror, 0–100. */
  threshold: number;
  /** Two or three sentences, in the juror's own voice. Published every time. */
  reasoning: string;
};

// -----------------------------------------------------------------------------
// Trial transcript
// -----------------------------------------------------------------------------

export type TrialPhase =
  | "opening"
  | "cross"
  | "closing"
  | "deliberation"
  | "verdict";

/** What the witness is doing on any given answer. */
export type WitnessMode = "evade" | "rattled" | "crack" | "cracked";

export type Exchange = {
  question: string;
  answer: string;
  mode: WitnessMode;
  /** Condition ids newly established by THIS exchange. Opaque ids only. */
  landed: string[];
  /** Exhibit refs the player named in the question. */
  exhibitsCited: string[];
};

export type Transcript = {
  caseId: string;
  witnessId: string;
  opening: string;
  exchanges: Exchange[];
  closing: string;
};

// -----------------------------------------------------------------------------
// Result
// -----------------------------------------------------------------------------

export type Scorecard = {
  won: boolean;
  votesFor: number;
  votesAgainst: number;
  scores: Scores;
  jurors: JurorVerdict[];
  /** Did the witness break? The thing the whole product exists for. */
  cracked: boolean;
  /** How many of the buried conditions the player pinned down. */
  conditionsLanded: number;
  conditionsTotal: number;
  /** The exchange the game thinks was the best moment. Index into exchanges. */
  bestExchange: number | null;
  /** One line from the judge as the court rises. */
  judgeRemark: string;
};
