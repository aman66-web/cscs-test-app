"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { ModuleKey } from "@/lib/questions/types";
import { LEARN_MODULES, subDotColor } from "@/lib/learn/modules";
import { getProgress, moduleAccuracyPct, type LocalProgress } from "@/lib/progress/local-progress";

/**
 * The Learn accordion: one expandable card per module, listing its lessons,
 * a flashcards row, and a final module test (locked until all lessons opened).
 * Progress (accuracy %, opened lessons, best scores) is read from localStorage
 * after mount. Ported from the My Life in the UK Test app's learn-modules.
 */
export function LearnModules() {
  const [open, setOpen] = useState<ModuleKey | null>(null);
  const [progress, setProgress] = useState<LocalProgress | null>(null);
  const [accuracy, setAccuracy] = useState<Record<string, number | null>>({});

  useEffect(() => {
    const p = getProgress();
    setProgress(p);
    setAccuracy(moduleAccuracyPct(p));
  }, []);

  return (
    <div>
      {LEARN_MODULES.map((m, mi) => {
        const isOpen = open === m.key;
        const pct = accuracy[m.key];
        const opened = new Set(progress?.submodulesOpened[m.key] ?? []);
        const allOpened = m.subs.every((s) => opened.has(s.id));

        return (
          <section
            key={m.key}
            className="mt-3 overflow-hidden rounded-[18px] bg-white shadow-[0_12px_26px_-16px_rgba(33,27,78,0.28)]"
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : m.key)}
              className="flex w-full items-center gap-3 px-4 py-[15px] text-start"
            >
              <span
                className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-[13px] text-[21px]"
                style={{ background: m.bg }}
              >
                {m.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14.5px] font-extrabold leading-[1.25] tracking-[-0.2px] text-ink">
                  {mi + 1}. {m.title}
                </span>
                <span className="mt-0.5 block text-[11.5px] font-semibold text-ink-soft">
                  {m.subs.length} lessons · 2 tests
                </span>
              </span>
              <span className="flex-none text-[13px] font-extrabold text-purple-deep">
                {pct == null ? "–" : `${pct}%`}
              </span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className={`flex-none text-ink-soft transition-transform ${isOpen ? "rotate-180" : ""}`}
              >
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {isOpen ? (
              <div className="border-t border-ink/5 px-4 pb-3 pt-1.5">
                {m.subs.map((s, si) => {
                  const best = progress?.bestScores[`sub:${m.key}:${s.id}`];
                  const subPct = best ?? (opened.has(s.id) ? 40 : 0);
                  const midCheckAfter = si === Math.ceil(m.subs.length / 2) - 1;
                  return (
                    <div key={s.id}>
                      <Link
                        href={`/learn/${m.key}/${s.id}`}
                        className="flex items-center gap-2.5 border-b border-ink/5 py-[11px] text-[13.5px] font-semibold text-ink transition hover:text-purple-deep"
                      >
                        <span className="h-2 w-2 flex-none rounded-full" style={{ background: subDotColor(subPct) }} />
                        {s.title}
                        <span className="ms-auto text-xs font-extrabold text-ink-soft">
                          {subPct > 0 ? `${subPct}%` : ""}
                        </span>
                      </Link>
                      {midCheckAfter ? (
                        <Link
                          href={`/test/${m.key}`}
                          className="flex items-center gap-2.5 border-b border-ink/5 py-[11px] text-[13.5px] font-extrabold text-purple-deep"
                        >
                          🎯 Mid-module check
                        </Link>
                      ) : null}
                    </div>
                  );
                })}

                <Link
                  href={`/flashcards/${m.key}`}
                  className="flex items-center gap-2.5 border-b border-ink/5 py-[11px] text-[13.5px] font-extrabold text-purple-deep"
                >
                  🃏 Module flashcards
                </Link>

                {allOpened ? (
                  <Link
                    href={`/test/${m.key}`}
                    className="flex items-center gap-2.5 py-[11px] text-[13.5px] font-extrabold text-purple-deep"
                  >
                    ✅ Final module test
                  </Link>
                ) : (
                  <div
                    aria-disabled="true"
                    className="flex items-center gap-2.5 py-[11px] text-[13.5px] font-extrabold text-ink-soft"
                  >
                    🔒 Final module test — open all lessons to unlock
                  </div>
                )}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
