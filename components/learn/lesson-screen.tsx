"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { LessonFigure, LessonNotes } from "@/lib/learn/notes/types";
import type { Question } from "@/lib/questions/types";
import type { TopicKey } from "@/lib/onboarding/types";
import { markSubmoduleOpened } from "@/lib/progress/local-progress";
import { PracticeSession } from "@/components/quiz/practice-session";
import { CoachFab } from "@/components/coach/coach-fab";

// Cloned from the My Life in the UK Test app's lesson-screen.tsx, minus the
// content-translation layer (this app is English-only).

const BULLETS_PER_PAGE = 4;

/** Render **bold** markers in note bullets as <strong>. */
function RichText({ text }: { text: string }) {
  const parts = text.split("**");
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-extrabold text-ink">
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

function FigureCard({ figure }: { figure: LessonFigure }) {
  return (
    <div className="mt-4 flex items-center gap-4 overflow-hidden rounded-[22px] bg-white p-4 shadow-[0_14px_30px_-18px_rgba(33,27,78,0.3)]">
      <span
        className="flex h-[74px] w-[74px] flex-none items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#F1EAFE,#E8DEFF)] text-[38px]"
        aria-hidden="true"
      >
        {figure.emoji}
      </span>
      <span className="min-w-0 flex-1 text-start">
        <span className="block text-[15px] font-extrabold tracking-[-0.2px] text-ink">
          {figure.title}
        </span>
        <span className="mt-1 block text-[12.5px] font-medium leading-snug text-ink-soft">
          {figure.caption}
        </span>
      </span>
    </div>
  );
}

/**
 * A Learn submodule lesson, paginated into short parts (~4 facts each) so
 * no single screen overwhelms, with illustrated figure cards spread across
 * the pages. Ends in a short check quiz from this submodule's pool.
 */
export function LessonScreen({
  topic,
  subId,
  moduleTitle,
  notes,
  checkQuestions,
}: {
  topic: TopicKey;
  subId: string;
  moduleTitle: string;
  notes: LessonNotes;
  checkQuestions: Question[];
}) {
  const [checking, setChecking] = useState(false);
  const [page, setPage] = useState(0);

  useEffect(() => {
    markSubmoduleOpened(topic, subId);
  }, [topic, subId]);

  // Chunk the facts into short pages.
  const pages: string[][] = [];
  for (let i = 0; i < notes.bullets.length; i += BULLETS_PER_PAGE) {
    pages.push(notes.bullets.slice(i, i + BULLETS_PER_PAGE));
  }
  const totalPages = Math.max(pages.length, 1);
  const isLast = page >= totalPages - 1;
  const figures = notes.figures ?? [];
  // Spread figures across pages: page i shows every figure whose index
  // maps onto it (figures cycle through pages in order).
  const pageFigures = figures.filter(
    (_, fi) => fi % totalPages === Math.min(page, totalPages - 1)
  );

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [page]);

  if (checking && checkQuestions.length > 0) {
    return (
      <PracticeSession
        questions={checkQuestions}
        topic={topic}
        title={`${notes.title} · check`}
        scoreKey={`sub:${topic}:${subId}`}
        doneHref="/learn"
      />
    );
  }

  return (
    <main className="screen-bg flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-safe pt-safe">
        {/* Top bar: back steps through pages first, then leaves */}
        <div className="flex items-center gap-3">
          {page > 0 ? (
            <button
              type="button"
              onClick={() => setPage((p) => p - 1)}
              aria-label="Previous part"
              className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-ink/10 bg-white/80 transition hover:bg-white"
            >
              <svg width="9" height="16" viewBox="0 0 9 16" fill="none" aria-hidden="true">
                <path d="M8 1 1 8l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : (
            <Link
              href="/learn"
              aria-label="Back to Learn"
              className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-ink/10 bg-white/80 transition hover:bg-white"
            >
              <svg width="9" height="16" viewBox="0 0 9 16" fill="none" aria-hidden="true">
                <path d="M8 1 1 8l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          )}
          <span className="min-w-0 truncate text-[12.5px] font-extrabold uppercase tracking-[0.6px] text-purple">
            📖 {moduleTitle}
          </span>
          <span className="ms-auto flex-none text-[11.5px] font-extrabold text-ink-soft">
            Part {page + 1} of {totalPages}
          </span>
        </div>

        {/* Reading progress */}
        <div className="mt-3 flex h-1.5 overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#8B4BF5,#6D28D9)] transition-[width] duration-300"
            style={{ width: `${((page + 1) / totalPages) * 100}%` }}
          />
        </div>

        {/* Lesson head (first page only) */}
        {page === 0 ? (
          <>
            <h1 className="mt-5 break-words text-start text-[26px] font-extrabold leading-[1.15] tracking-[-0.7px] text-ink">
              {notes.title}
            </h1>
            <p className="mt-2 text-start text-sm font-medium leading-relaxed text-ink-soft">
              {notes.intro}
            </p>
          </>
        ) : (
          <h1 className="mt-5 break-words text-start text-[19px] font-extrabold leading-[1.2] tracking-[-0.4px] text-ink">
            {notes.title}
          </h1>
        )}

        {/* Figure cards for this page */}
        {pageFigures.map((f) => (
          <FigureCard key={f.title} figure={f} />
        ))}

        {/* This page's facts */}
        <div className="mt-4 rounded-[22px] bg-white p-[18px] shadow-[0_14px_30px_-18px_rgba(33,27,78,0.3)]">
          <ul className="space-y-3.5">
            {(pages[page] ?? []).map((b, i) => (
              <li
                key={i}
                className="flex gap-2.5 text-[14px] font-medium leading-relaxed text-[#4A4570]"
              >
                <span className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full bg-purple/50" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block text-start">
                    <RichText text={b} />
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Page dots */}
        {totalPages > 1 ? (
          <div className="mt-4 flex justify-center gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => (
              <span
                key={i}
                aria-hidden="true"
                className={`h-1.5 rounded-full transition-all ${
                  i === page ? "w-5 bg-purple" : "w-1.5 bg-ink/15"
                }`}
              />
            ))}
          </div>
        ) : null}

        {/* Footer CTA */}
        <div className="mt-auto pt-5">
          {!isLast ? (
            <button
              type="button"
              onClick={() => setPage((p) => p + 1)}
              className="btn-primary"
            >
              Continue reading <span aria-hidden="true">→</span>
            </button>
          ) : checkQuestions.length > 0 ? (
            <button
              type="button"
              onClick={() => setChecking(true)}
              className="btn-primary"
            >
              Check yourself ({checkQuestions.length}){" "}
              <span aria-hidden="true">→</span>
            </button>
          ) : (
            <Link href="/learn" className="btn-primary">
              Back to Learn
            </Link>
          )}
        </div>
      </div>
      <CoachFab aboveTabBar context={`Lesson: ${notes.title} (${moduleTitle})`} />
    </main>
  );
}
