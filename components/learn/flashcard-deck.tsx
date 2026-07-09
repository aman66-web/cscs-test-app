"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Question } from "@/lib/questions/types";
import { addXp, logActivity } from "@/lib/progress/local-progress";
import { dueCount, srsGrade, srsOrder, type SrsGrade } from "@/lib/progress/srs";
import { CoachFab } from "@/components/coach/coach-fab";

// Cloned from the My Life in the UK Test app's flashcard-deck.tsx, minus the
// content-translation layer. Callers filter out hotspot questions (they have
// no textual answer to reveal).

const SESSION_SIZE = 20;
const XP_BY_GRADE: Record<SrsGrade, number> = {
  again: 0,
  hard: 2,
  good: 5,
  easy: 5,
};

/**
 * Anki-style flashcard review for one module: front = the question,
 * back = the answer + explanation, graded Again/Hard/Good/Easy into the
 * shared SM-2 scheduler. Cards are served in smart order (overdue first,
 * then new). Reviewing counts towards the daily goal and streak.
 */
export function FlashcardDeck({
  questions,
  moduleTitle,
}: {
  questions: Question[];
  moduleTitle: string;
}) {
  const [cards, setCards] = useState<Question[] | null>(null);
  const [due, setDue] = useState(0);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const reviewedRef = useRef(0);
  const startRef = useRef(Date.now());
  const loggedRef = useRef(false);

  function buildSession() {
    // Smart order reads localStorage — client-only, hence the effect.
    setCards(srsOrder(questions).slice(0, SESSION_SIZE));
    setDue(dueCount(questions.map((q) => q.id)));
    setIndex(0);
    setFlipped(false);
    setDone(false);
    startRef.current = Date.now();
    loggedRef.current = false;
  }

  useEffect(() => {
    buildSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

  if (!cards) {
    return (
      <main className="screen-bg flex min-h-dvh items-center justify-center">
        <p className="text-sm font-bold text-ink-soft">Loading…</p>
      </main>
    );
  }

  const q = cards[index];

  function grade(g: SrsGrade) {
    if (!q) return;
    srsGrade(q.id, g);
    const xp = XP_BY_GRADE[g];
    if (xp > 0) addXp(xp);
    reviewedRef.current += 1;
    if (index + 1 >= cards!.length) {
      if (!loggedRef.current) {
        loggedRef.current = true;
        const minutes = Math.max(
          1,
          Math.round((Date.now() - startRef.current) / 60000)
        );
        logActivity(minutes, reviewedRef.current);
      }
      setDone(true);
      return;
    }
    setFlipped(false);
    setIndex((i) => i + 1);
  }

  if (done || cards.length === 0) {
    return (
      <main className="screen-bg flex min-h-dvh flex-col">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 pb-safe pt-safe text-center">
          <div className="text-[52px]" aria-hidden="true">
            🃏
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.5px] text-ink">
            Deck done! 🎉
          </h1>
          <p className="mt-1.5 max-w-[300px] text-sm font-semibold text-ink-soft">
            You reviewed {reviewedRef.current} cards — spaced repetition will
            bring the tricky ones back at the perfect time.
          </p>
          <div className="mt-8 w-full space-y-3">
            <button type="button" onClick={buildSession} className="btn-primary">
              Review more cards
            </button>
            <Link href="/learn" className="btn-secondary">
              Back to Learn
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const answer = q.correct_answer.map((i) => q.options[i]).join(" + ");
  const gradeBtn =
    "flex h-[52px] min-w-0 flex-1 flex-col items-center justify-center rounded-[16px] text-[13.5px] font-extrabold transition active:scale-95";

  return (
    <main className="screen-bg flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-safe pt-safe">
        {/* Top bar: close + progress + due */}
        <div className="flex items-center gap-3">
          <Link
            href="/learn"
            aria-label="Back to Learn"
            className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full border border-ink/10 bg-white/85 font-extrabold text-ink-soft transition hover:bg-white"
          >
            ✕
          </Link>
          <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#F97316,#C2410C)] transition-[width] duration-300"
              style={{ width: `${(index / cards.length) * 100}%` }}
            />
          </div>
          <span className="flex-none text-[12px] font-extrabold text-purple-deep">
            {index + 1}/{cards.length}
          </span>
        </div>

        <p className="mt-3 text-center text-[11.5px] font-bold text-ink-soft">
          🃏 {moduleTitle} · {due} due for review
        </p>

        {/* The card */}
        <div className="flip-scene mt-4 flex-1">
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            aria-label={flipped ? "Answer" : "Tap the card to see the answer"}
            className={`flip-card relative block h-full min-h-[340px] w-full text-start ${
              flipped ? "flipped" : ""
            }`}
          >
            {/* Front */}
            <span className="flip-face absolute inset-0 flex flex-col rounded-[22px] bg-white p-6 shadow-[0_18px_40px_-18px_rgba(28, 25, 23,0.35)]">
              <span className="text-[11.5px] font-extrabold uppercase tracking-[0.6px] text-purple">
                ⛑️ Flashcards
              </span>
              <span className="mt-4 flex-1">
                <span className="block text-start text-[19px] font-extrabold leading-[1.35] tracking-[-0.3px] text-ink">
                  {q.question_text}
                </span>
              </span>
              <span className="mt-4 text-center text-[12.5px] font-bold text-ink-soft">
                👆 Tap the card to see the answer
              </span>
            </span>
            {/* Back */}
            <span className="flip-face flip-back absolute inset-0 flex flex-col overflow-y-auto rounded-[22px] bg-white p-6 shadow-[0_18px_40px_-18px_rgba(28, 25, 23,0.35)]">
              <span className="text-[11.5px] font-extrabold uppercase tracking-[0.6px] text-[#137A3B]">
                ✓ Answer
              </span>
              <span className="mt-3 rounded-[14px] bg-[#E3F8EA] p-3.5 text-[16px] font-extrabold leading-snug text-[#137A3B]">
                {answer}
              </span>
              <span className="mt-3">
                <span className="block text-start text-[13.5px] font-medium leading-relaxed text-[#4A4570]">
                  💡 {q.explanation}
                </span>
              </span>
            </span>
          </button>
        </div>

        {/* Grades (after flip) — Anki's four buttons */}
        <div className="mt-5">
          {flipped ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => grade("again")}
                className={`${gradeBtn} bg-[#FDEAEA] text-[#B93B3B]`}
              >
                Again
              </button>
              <button
                type="button"
                onClick={() => grade("hard")}
                className={`${gradeBtn} bg-[#FFF0D6] text-[#A16207]`}
              >
                Hard
              </button>
              <button
                type="button"
                onClick={() => grade("good")}
                className={`${gradeBtn} bg-[#E3F8EA] text-[#137A3B]`}
              >
                Good
              </button>
              <button
                type="button"
                onClick={() => grade("easy")}
                className={`${gradeBtn} bg-lilac text-purple-deep`}
              >
                Easy
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setFlipped(true)}
              className="btn-primary"
            >
              Show answer
            </button>
          )}
        </div>
      </div>
      <CoachFab
        aboveTabBar
        context={`Flashcard: "${q.question_text}" (module: ${moduleTitle})`}
      />
    </main>
  );
}
