// =============================================================================
// VERDICT — the case registry.
//
// SERVER-SIDE ONLY. This module pulls in every witness's hidden facts, crack
// conditions and authored crack response. It must only ever be imported from
// route handlers and server components — never from a "use client" file, or
// the buried truth ships to the browser inside the JS bundle and the game
// stops being a game.
//
// The browser gets `toPublicCase()` output and nothing else.
// =============================================================================

import "server-only";

import type { Case, PublicCase, PublicWitness, Witness } from "../types";
import { weddingPhotographer } from "./wedding-photographer";
import { theDog } from "./the-dog";
import { theGuitar } from "./the-guitar";
import { theDeposit } from "./the-deposit";
import { theReference } from "./the-reference";

/** Docket order — difficulty ascending, so a new player meets the dog first. */
export const CASES: Case[] = [
  theDog,
  weddingPhotographer,
  theGuitar,
  theDeposit,
  theReference,
];

const BY_ID = new Map(CASES.map((c) => [c.id, c]));

export function getCase(id: string): Case | undefined {
  return BY_ID.get(id);
}

/** Strip a witness down to what the player is allowed to know. */
function toPublicWitness(witness: Witness): PublicWitness {
  return {
    id: witness.id,
    name: witness.name,
    age: witness.age,
    occupation: witness.occupation,
    personality: witness.personality,
    demeanour: witness.demeanour,
    publicStatement: witness.publicStatement,
  };
}

/**
 * The only shape of a case that may cross to the client.
 *
 * Note what survives: `winningThreads` and `trapThreads` do NOT leave here —
 * they brief the jury judge server-side, and handing them to the player would
 * be handing over the answer sheet.
 */
export function toPublicCase(c: Case): PublicCase {
  return {
    id: c.id,
    title: c.title,
    premise: c.premise,
    court: c.court,
    judge: c.judge,
    side: c.side,
    clientStatement: c.clientStatement,
    opposingClaim: c.opposingClaim,
    stake: c.stake,
    exhibits: c.exhibits,
    witnesses: c.witnesses.map(toPublicWitness),
    difficulty: c.difficulty,
    winningThreads: [],
    trapThreads: [],
    jurorIds: c.jurorIds,
  };
}

export function publicCases(): PublicCase[] {
  return CASES.map(toPublicCase);
}
