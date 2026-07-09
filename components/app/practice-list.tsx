"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LEARN_MODULES } from "@/lib/learn/modules";
import { getProgress } from "@/lib/progress/local-progress";
import { ProgressRing } from "@/components/app/progress-ring";
import type { TopicKey } from "@/lib/onboarding/types";

// Cloned from the My Life in the UK Test app's practice-list.tsx, minus i18n.

/** Module key from a bank question id ("safety-042" → "safety"). */
function moduleOf(qid: string): string {
  return qid.slice(0, qid.lastIndexOf("-"));
}

/**
 * Practice tab: pick any set of modules (whole-card toggles with check
 * circles), then Continue → the session setup screen (question count,
 * shuffle, mistakes-only). The summary card up top shows two clearly
 * separate stats: ACCURACY (correct out of attempted answers) and COVERAGE
 * (distinct questions practised out of the whole bank). Each module card
 * shows "done of total · N wrong".
 */
export function PracticeList({
  questionCounts,
  bankTotal,
}: {
  questionCounts: Partial<Record<TopicKey, number>>;
  bankTotal: number;
}) {
  const router = useRouter();
  const [mistakes, setMistakes] = useState(0);
  const [picked, setPicked] = useState<Set<TopicKey>>(new Set());
  const [totals, setTotals] = useState({ answered: 0, correct: 0, practised: 0 });
  // Per module: distinct questions practised + current wrong (to-review) count.
  const [byModule, setByModule] = useState<
    Record<string, { done: number; wrong: number }>
  >({});

  useEffect(() => {
    const p = getProgress();
    setMistakes(Object.keys(p.mistakes).length);

    // Accuracy comes from the answer log (attempts; rolling window).
    // Coverage comes from the SRS record: one entry per DISTINCT question
    // ever practised (quiz, mock or flashcard) — never capped, never shrinks.
    const perModule: Record<string, { done: number; wrong: number }> = {};
    for (const qid of Object.keys(p.srs)) {
      const m = moduleOf(qid);
      (perModule[m] ??= { done: 0, wrong: 0 }).done += 1;
    }
    for (const qid of Object.keys(p.mistakes)) {
      const m = moduleOf(qid);
      (perModule[m] ??= { done: 0, wrong: 0 }).wrong += 1;
    }
    setByModule(perModule);
    setTotals({
      answered: p.answerLog.length,
      correct: p.answerLog.filter((a) => a.correct).length,
      practised: Object.keys(p.srs).length,
    });
  }, []);

  function togglePick(key: TopicKey) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  const pct =
    totals.answered > 0
      ? Math.round((totals.correct / totals.answered) * 100)
      : null;

  const card =
    "mt-3 flex w-full items-center gap-3 rounded-[18px] bg-white px-4 py-[15px] text-start shadow-[0_12px_26px_-16px_rgba(28, 25, 23,0.28)] transition hover:bg-[#FDFCFF] active:scale-[0.99]";

  return (
    <div className="mt-1">
      {/* Summary card: ACCURACY (ring + correct/attempted) and COVERAGE
          (practised/whole bank) as two clearly-labelled, separate stats. */}
      <section className="mt-2 flex items-center gap-4 rounded-[18px] bg-white p-4 shadow-[0_12px_26px_-16px_rgba(28, 25, 23,0.28)]">
        <ProgressRing
          percent={pct ?? 0}
          size={72}
          strokeWidth={7}
          ringClassName="text-good"
        >
          <span className="text-[15px] font-extrabold text-ink">
            {pct == null ? "–" : `${pct}%`}
          </span>
        </ProgressRing>
        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] font-extrabold uppercase tracking-[0.7px] text-[#22B268]">
            Accuracy
          </p>
          <p className="mt-0.5 text-[12.5px] font-bold leading-snug text-ink">
            {totals.answered > 0
              ? `${totals.correct.toLocaleString("en-GB")} correct of ${totals.answered.toLocaleString("en-GB")} attempted`
              : "Answer some questions and your stats appear here."}
          </p>
          <div className="mt-2 border-t border-ink/[0.06] pt-2">
            <p className="text-[10.5px] font-extrabold uppercase tracking-[0.7px] text-purple">
              Coverage
            </p>
            <p className="mt-0.5 text-[12.5px] font-bold leading-snug text-ink">
              {Math.min(totals.practised, bankTotal).toLocaleString("en-GB")} of{" "}
              {bankTotal.toLocaleString("en-GB")} questions practised
            </p>
          </div>
        </div>
      </section>

      {/* Selection instruction */}
      <h2 className="mt-5 px-1 text-[15px] font-extrabold tracking-[-0.3px] text-ink">
        Select all the modules you&apos;d like to review
      </h2>
      <p className="mt-0.5 px-1 text-[12px] font-semibold text-ink-soft">
        Tap to select — then choose how many questions.
      </p>

      {/* Module toggle cards */}
      {LEARN_MODULES.map((m) => {
        const on = picked.has(m.key);
        const count = questionCounts[m.key] ?? 0;
        const stats = byModule[m.key];
        // Clamp: SRS may hold entries for questions since removed from the bank.
        const done = Math.min(stats?.done ?? 0, count);
        const wrong = stats?.wrong ?? 0;
        return (
          <button
            key={m.key}
            type="button"
            onClick={() => togglePick(m.key)}
            aria-pressed={on}
            className={`${card} ${
              on ? "ring-2 ring-purple ring-offset-0" : "ring-0"
            }`}
          >
            <span
              className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-[13px] text-[21px]"
              style={{ background: m.bg }}
              aria-hidden="true"
            >
              {m.icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14.5px] font-extrabold leading-[1.25] tracking-[-0.2px] text-ink">
                {m.title}
              </span>
              <span className="mt-0.5 block text-[11.5px] font-semibold text-ink-soft">
                {done > 0 ? (
                  <>
                    {done} of {count} done
                    {wrong > 0 ? (
                      <>
                        {" · "}
                        <span className="font-bold text-[#E05555]">
                          {wrong} wrong
                        </span>
                      </>
                    ) : null}
                  </>
                ) : (
                  "not tried yet"
                )}
              </span>
            </span>
            <span
              aria-hidden="true"
              className={`ms-auto flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full border-2 text-[13px] font-extrabold transition ${
                on
                  ? "border-purple bg-purple text-white"
                  : "border-ink/15 bg-white text-transparent"
              }`}
            >
              ✓
            </span>
          </button>
        );
      })}

      {/* Mistakes deck (quick launch) */}
      <Link href="/practice/mistakes" className={card}>
        <span
          className="relative flex h-[42px] w-[42px] flex-none items-center justify-center rounded-[13px] bg-[#FDEAEA] text-[21px]"
          aria-hidden="true"
        >
          🔁
          {mistakes > 0 ? (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#E05555] px-1 text-[10.5px] font-extrabold text-white">
              {mistakes > 99 ? "99+" : mistakes}
            </span>
          ) : null}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14.5px] font-extrabold leading-[1.25] tracking-[-0.2px] text-ink">
            Mistakes
          </span>
          <span className="mt-0.5 block text-[11.5px] font-semibold text-ink-soft">
            {mistakes > 0
              ? `${mistakes} to clear — answer each right twice`
              : "Wrong answers collect here automatically"}
          </span>
        </span>
        <span className="ms-auto flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full bg-lilac font-extrabold text-purple-deep">
          →
        </span>
      </Link>

      {/* Sticky Continue → session setup (floats above the tab bar) */}
      {picked.size > 0 ? (
        <div
          className="sticky z-20 mt-4"
          style={{ bottom: "max(96px, calc(env(safe-area-inset-bottom) + 80px))" }}
        >
          <button
            type="button"
            onClick={() =>
              router.push(
                `/practice/session?topics=${Array.from(picked).join(",")}`
              )
            }
            className="btn-primary shadow-[0_18px_36px_-12px_rgba(249, 115, 22,0.85)]"
          >
            Continue with {picked.size} module{picked.size === 1 ? "" : "s"}{" "}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
