// =============================================================
// SM-2 (Anki-family) spaced-repetition scheduler for flashcards.
// Ported from the My Life in the UK Test app. Pure + localStorage only —
// schedules live in the progress store's `srs` field. No backend.
// =============================================================

import { getProgress, updateProgress, type SrsCard } from "@/lib/progress/local-progress";

export type SrsGrade = "again" | "hard" | "good" | "easy";

const DAY = 1440; // minutes
const MAX_IVL = 180 * DAY;

/** Compute the next schedule for a card given a grade. */
function schedule(card: SrsCard | undefined, grade: SrsGrade, now: number): SrsCard {
  const c = card ?? { ease: 250, ivl: 0, due: 0, reps: 0, lapses: 0 };
  let { ease, ivl, reps, lapses } = c;
  switch (grade) {
    case "again":
      ease = Math.max(130, ease - 20);
      if (reps > 0) lapses += 1;
      reps = 0;
      ivl = 10;
      break;
    case "hard":
      ease = Math.max(130, ease - 15);
      // First exposure → 12h; thereafter grow the interval by 1.2× (min 10m).
      ivl = reps === 0 ? 12 * 60 : Math.max(10, Math.round(ivl * 1.2));
      reps += 1;
      break;
    case "good":
      ivl = reps === 0 ? DAY : Math.round((ivl * ease) / 100);
      reps += 1;
      break;
    case "easy":
      ease += 15;
      ivl = reps === 0 ? 4 * DAY : Math.round((ivl * ease * 1.3) / 100);
      reps += 1;
      break;
  }
  ivl = Math.min(ivl, MAX_IVL);
  return { ease, ivl, due: now + ivl * 60_000, reps, lapses };
}

/** Grade a card and persist its new schedule. */
export function srsGrade(qid: string, grade: SrsGrade): void {
  const now = Date.now();
  updateProgress((p) => ({ ...p, srs: { ...p.srs, [qid]: schedule(p.srs[qid], grade, now) } }));
}

/** Is a card due (never seen, or past its due time)? */
export function isDue(card: SrsCard | undefined, now = Date.now()): boolean {
  return !card || card.due <= now;
}

/** "Smart" review order: overdue (oldest first) → new → ahead (soonest first). */
export function srsOrder<T extends { id: string }>(pool: T[], p = getProgress(), now = Date.now()): T[] {
  const rank = (item: T): [number, number] => {
    const card = p.srs[item.id];
    if (!card) return [1, 0]; // new
    if (card.due <= now) return [0, card.due]; // overdue, oldest first
    return [2, card.due]; // ahead, soonest first
  };
  return [...pool]
    .map((item, i) => ({ item, i, r: rank(item) }))
    .sort((a, b) => a.r[0] - b.r[0] || a.r[1] - b.r[1] || a.i - b.i)
    .map((x) => x.item);
}

/** How many of these question ids are due for review right now. */
export function dueCount(ids: string[], p = getProgress()): number {
  const now = Date.now();
  return ids.filter((id) => isDue(p.srs[id], now)).length;
}
