"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ModuleKey, Question } from "@/lib/questions/types";
import type { LessonNotes, LessonFigure } from "@/lib/learn/notes/types";
import { markSubmoduleOpened } from "@/lib/progress/local-progress";
import { PracticeSession } from "@/components/quiz/practice-session";

const BULLETS_PER_PAGE = 4;

/** Render **bold** markers as <strong>. */
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
      <span className="flex h-[74px] w-[74px] flex-none items-center justify-center rounded-[18px] bg-[linear-gradient(135deg,#F1EAFE,#E8DEFF)] text-[38px]">
        {figure.emoji}
      </span>
      <span>
        <span className="block text-[15px] font-extrabold tracking-[-0.2px] text-ink">{figure.title}</span>
        <span className="mt-1 block text-[12.5px] font-medium leading-snug text-ink-soft">{figure.caption}</span>
      </span>
    </div>
  );
}

/**
 * A paginated study lesson (4 facts per page) with a reading progress bar and
 * an end-of-lesson check quiz. Ported from the My Life in the UK Test app.
 */
export function LessonScreen({
  module,
  subId,
  moduleTitle,
  notes,
  checkQuestions,
}: {
  module: ModuleKey;
  subId: string;
  moduleTitle: string;
  notes: LessonNotes;
  checkQuestions: Question[];
}) {
  const [checking, setChecking] = useState(false);
  const [page, setPage] = useState(0);

  const pages: string[][] = [];
  for (let i = 0; i < notes.bullets.length; i += BULLETS_PER_PAGE) {
    pages.push(notes.bullets.slice(i, i + BULLETS_PER_PAGE));
  }
  const totalPages = Math.max(pages.length, 1);
  const isLast = page >= totalPages - 1;
  const figures = notes.figures ?? [];
  const pageFigures = figures.filter((_, fi) => fi % totalPages === Math.min(page, totalPages - 1));

  // Record the lesson as opened (unlocks the final test + bumps to 40%).
  useEffect(() => {
    markSubmoduleOpened(module, subId);
  }, [module, subId]);

  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, [page]);

  if (checking && checkQuestions.length > 0) {
    return (
      <PracticeSession
        questions={checkQuestions}
        title={`${notes.title} · check`}
        doneHref="/learn"
        scoreKey={`sub:${module}:${subId}`}
      />
    );
  }

  return (
    <main className="screen-bg flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-safe pt-safe">
        {/* Top bar */}
        <div className="flex items-center gap-3">
          {page > 0 ? (
            <button
              type="button"
              aria-label="Previous page"
              onClick={() => setPage((p) => p - 1)}
              className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-ink/10 bg-white/80 transition hover:bg-white"
            >
              ←
            </button>
          ) : (
            <Link
              href="/learn"
              aria-label="Back to Learn"
              className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-ink/10 bg-white/80 transition hover:bg-white"
            >
              ←
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

        {/* Title + intro on page 0 */}
        {page === 0 ? (
          <>
            <h1 className="mt-5 break-words text-start text-[26px] font-extrabold leading-[1.15] tracking-[-0.7px] text-ink">
              {notes.title}
            </h1>
            <p className="mt-2 text-start text-sm font-medium leading-relaxed text-ink-soft">{notes.intro}</p>
          </>
        ) : (
          <h2 className="mt-5 break-words text-start text-[19px] font-extrabold leading-[1.2] tracking-[-0.4px] text-ink">
            {notes.title}
          </h2>
        )}

        {/* Facts */}
        <div className="mt-4 rounded-[22px] bg-white p-[18px] shadow-[0_14px_30px_-18px_rgba(33,27,78,0.3)]">
          <ul className="space-y-3.5">
            {(pages[page] ?? []).map((b, i) => (
              <li key={i} className="flex gap-2.5 text-[14px] font-medium leading-relaxed text-[#4A4570]">
                <span className="mt-[7px] h-1.5 w-1.5 flex-none rounded-full bg-purple/50" />
                <span>
                  <RichText text={b} />
                </span>
              </li>
            ))}
          </ul>
        </div>

        {pageFigures.map((f, i) => (
          <FigureCard key={i} figure={f} />
        ))}

        {/* Page dots */}
        {totalPages > 1 ? (
          <div className="mt-4 flex justify-center gap-1.5">
            {pages.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${i === page ? "w-5 bg-purple" : "w-1.5 bg-ink/15"}`}
              />
            ))}
          </div>
        ) : null}

        {/* Footer CTA */}
        <div className="mt-auto pt-5">
          {!isLast ? (
            <button type="button" className="btn-primary" onClick={() => setPage((p) => p + 1)}>
              Continue reading →
            </button>
          ) : checkQuestions.length > 0 ? (
            <button type="button" className="btn-primary" onClick={() => setChecking(true)}>
              Check yourself ({checkQuestions.length}) →
            </button>
          ) : (
            <Link href="/learn" className="btn-primary">
              Back to Learn
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
