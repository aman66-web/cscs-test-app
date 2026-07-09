"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { questionById } from "@/lib/question-bank";
import { mistakeIds } from "@/lib/progress/local-progress";
import { pickSession } from "@/lib/questions/select";
import type { Question } from "@/lib/questions/types";
import { PracticeSession } from "@/components/quiz/practice-session";

/**
 * The Mistakes deck: every wrongly-answered question, re-served until it has
 * been answered correctly twice in a row (tracking lives in the local
 * progress store). Client page — the deck only exists in localStorage.
 * Cloned from the My Life in the UK Test app's app/practice/mistakes/page.tsx.
 */
export default function MistakesPage() {
  const [questions, setQuestions] = useState<Question[] | null>(null);

  useEffect(() => {
    const qs = mistakeIds()
      .map((id) => questionById(id))
      .filter((q): q is Question => !!q);
    setQuestions(pickSession(qs, 10));
  }, []);

  if (questions === null) {
    return (
      <main className="screen-bg flex min-h-dvh items-center justify-center">
        <p className="text-sm font-bold text-ink-soft">Loading…</p>
      </main>
    );
  }

  if (questions.length === 0) {
    return (
      <main className="screen-bg flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <div className="text-[52px]" aria-hidden="true">
          🧹
        </div>
        <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.5px] text-ink">
          No mistakes to review!
        </h1>
        <p className="mt-1.5 max-w-[260px] text-sm font-semibold text-ink-soft">
          Wrong answers land here and stay until you get them right twice.
        </p>
        <Link href="/practice" className="btn-primary mt-6 max-w-[280px]">
          Back to practice
        </Link>
      </main>
    );
  }

  return (
    <PracticeSession
      questions={questions}
      topic="mistakes"
      title="Mistakes deck"
    />
  );
}
