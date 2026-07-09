"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { modulesPool } from "@/lib/question-bank";
import { moduleTitle } from "@/lib/question-bank/modules";
import { sanitizeTopics } from "@/lib/onboarding/types";
import { LEARN_MODULES } from "@/lib/learn/modules";
import type { Question } from "@/lib/questions/types";
import { pickSession } from "@/lib/questions/select";
import { getProgress } from "@/lib/progress/local-progress";
import { srsOrder } from "@/lib/progress/srs";
import { PracticeSession } from "@/components/quiz/practice-session";
import { MOCK_CONFIG } from "@/lib/mock/config";

// Cloned from the My Life in the UK Test app's app/practice/session/page.tsx,
// minus i18n. Session setup → quiz, in one client route. This page
// deliberately imports the question bank client-side (like /practice/mistakes)
// because the mistakes-only filter and the spaced-repetition "smart order"
// both live in localStorage. Local-data-only, so no server auth guard is needed.

const COUNT_CHOICES = [5, 10, 30] as const;
type CountChoice = number | "all" | "custom";

// Final-test paper: exam-style length + the CSCS pass bar (90%).
const FINAL_EXAM_LEN = MOCK_CONFIG.questionCount; // 50
const FINAL_PASS_RATIO = MOCK_CONFIG.passPercentage / 100; // 0.9

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`ms-auto flex h-7 w-12 flex-none items-center rounded-full p-1 transition ${
        on ? "bg-purple" : "bg-ink/15"
      }`}
    >
      <span
        className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-5" : ""
        }`}
      />
    </span>
  );
}

function SessionBuilder() {
  const router = useRouter();
  const params = useSearchParams();

  const topics = useMemo(
    () => sanitizeTopics((params.get("topics") ?? "").split(",")),
    [params]
  );

  const pool = useMemo(() => modulesPool(topics), [topics]);
  const [mistakeSet, setMistakeSet] = useState<Set<string>>(new Set());
  // The module "final test" (Learn tab) links here with ?final=1 — it gets a
  // briefing screen (pass mark, no-timer note, paper-length choice) instead
  // of the regular session builder. ?count=all is still honoured for the
  // regular builder.
  const isFinal = params.get("final") === "1" && topics.length === 1;
  const [choice, setChoice] = useState<CountChoice>(
    isFinal || params.get("count") === "all" ? "all" : 10
  );
  // Final-test paper length: exam-style 50 or the whole module.
  const [finalLen, setFinalLen] = useState<number | "all">(FINAL_EXAM_LEN);
  const [customText, setCustomText] = useState("");
  const [shuffleOn, setShuffleOn] = useState(true);
  const [mistakesOnly, setMistakesOnly] = useState(false);
  const [questions, setQuestions] = useState<Question[] | null>(null);

  useEffect(() => {
    if (topics.length === 0) router.replace("/practice");
  }, [topics, router]);

  useEffect(() => {
    setMistakeSet(new Set(Object.keys(getProgress().mistakes)));
  }, []);

  const mistakesAvailable = useMemo(
    () => pool.filter((q) => mistakeSet.has(q.id)).length,
    [pool, mistakeSet]
  );
  const effectivePool = useMemo(
    () => (mistakesOnly ? pool.filter((q) => mistakeSet.has(q.id)) : pool),
    [pool, mistakesOnly, mistakeSet]
  );
  const total = effectivePool.length;

  const customCount = parseInt(customText, 10);
  const resolved =
    choice === "all"
      ? total
      : choice === "custom"
        ? Number.isFinite(customCount)
          ? Math.max(1, Math.min(customCount, total))
          : 0
        : Math.min(choice, total);

  const canStart = total > 0 && resolved > 0;

  function start() {
    if (!canStart) return;
    const ordered = shuffleOn
      ? pickSession(effectivePool, resolved)
      : srsOrder(effectivePool).slice(0, resolved);
    setQuestions(ordered);
  }

  if (questions) {
    const single = topics.length === 1;
    return (
      <PracticeSession
        questions={questions}
        topic={single ? topics[0] : "mixed"}
        title={single ? moduleTitle(topics[0]) : "Mixed practice"}
        doneHref={isFinal ? "/learn" : undefined}
      />
    );
  }

  const pickedModules = LEARN_MODULES.filter((m) => topics.includes(m.key));

  // ----- Final module test: briefing screen (pass mark, timing, length) -----
  if (isFinal) {
    const finalCount = finalLen === "all" ? total : Math.min(FINAL_EXAM_LEN, total);
    const passNeeded = Math.ceil(finalCount * FINAL_PASS_RATIO);
    const infoRow = (emoji: string, title: string, sub: string) => (
      <div className="flex items-start gap-3 border-b border-ink/5 py-3 last:border-b-0">
        <span className="flex-none text-[20px]" aria-hidden="true">
          {emoji}
        </span>
        <div className="min-w-0">
          <p className="text-[14px] font-extrabold text-ink">{title}</p>
          <p className="mt-0.5 text-[12px] font-semibold leading-snug text-ink-soft">
            {sub}
          </p>
        </div>
      </div>
    );
    const lenCard = (on: boolean, title: string, sub: string, onPick: () => void) => (
      <button
        type="button"
        onClick={onPick}
        aria-pressed={on}
        className={`flex w-full items-center gap-3 rounded-[16px] border-2 px-4 py-3.5 text-start transition ${
          on
            ? "border-purple bg-lilac"
            : "border-ink/10 bg-white hover:border-purple/40"
        }`}
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[14.5px] font-extrabold text-ink">
            {title}
          </span>
          <span className="mt-0.5 block text-[11.5px] font-semibold text-ink-soft">
            {sub}
          </span>
        </span>
        <span
          aria-hidden="true"
          className={`flex h-[24px] w-[24px] flex-none items-center justify-center rounded-full border-2 text-[12px] font-extrabold transition ${
            on
              ? "border-purple bg-purple text-white"
              : "border-ink/15 bg-white text-transparent"
          }`}
        >
          ✓
        </span>
      </button>
    );

    return (
      <main className="screen-bg flex min-h-dvh flex-col">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-safe pt-safe">
          {/* Top bar */}
          <div className="flex items-center gap-3">
            <Link
              href="/learn"
              aria-label="Back"
              className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full border border-ink/10 bg-white/85 font-extrabold text-ink-soft transition hover:bg-white"
            >
              ✕
            </Link>
            <h1 className="text-[17px] font-extrabold tracking-[-0.4px] text-ink">
              🏁 Final module test
            </h1>
          </div>

          {/* Module chip */}
          <div className="mt-5 flex flex-wrap gap-2">
            {pickedModules.map((m) => (
              <span
                key={m.key}
                className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12.5px] font-bold text-ink shadow-[0_8px_18px_-12px_rgba(28, 25, 23,0.35)]"
              >
                <span aria-hidden="true">{m.icon}</span> {m.title}
              </span>
            ))}
          </div>

          {/* The briefing: what to expect */}
          <section className="mt-5 rounded-[18px] bg-white px-4 py-1 shadow-[0_12px_26px_-16px_rgba(28, 25, 23,0.28)]">
            {infoRow(
              "🎯",
              `Pass mark: ${MOCK_CONFIG.passPercentage}%`,
              `Score ${passNeeded} or more to pass — same bar as the real test.`
            )}
            {infoRow(
              "⏱️",
              "No time limit",
              `Take your time. (The real test gives ${MOCK_CONFIG.durationMinutes} minutes for ${MOCK_CONFIG.questionCount} questions.)`
            )}
            {infoRow(
              "📊",
              "Score at the end",
              "You'll see your result and XP when you finish."
            )}
          </section>

          {/* Paper length choice */}
          <h2 className="mt-5 px-1 text-[14.5px] font-extrabold tracking-[-0.2px] text-ink">
            Choose your paper
          </h2>
          <div className="mt-2.5 space-y-2.5">
            {lenCard(
              finalLen === FINAL_EXAM_LEN,
              `${Math.min(FINAL_EXAM_LEN, total)} questions`,
              "Exam-style paper — just like the real test",
              () => setFinalLen(FINAL_EXAM_LEN)
            )}
            {lenCard(
              finalLen === "all",
              `All ${total} questions`,
              "The complete module, every question",
              () => setFinalLen("all")
            )}
          </div>

          {/* Start */}
          <div className="mt-auto pt-6">
            <button
              type="button"
              onClick={() => {
                if (total === 0) return;
                setQuestions(pickSession(pool, finalCount));
              }}
              disabled={total === 0}
              className="btn-primary"
            >
              Start the test <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </main>
    );
  }

  const pill = (on: boolean) =>
    `rounded-full border-2 px-4 py-2.5 text-sm font-bold transition ${
      on
        ? "border-purple bg-lilac text-purple-deep"
        : "border-ink/10 bg-white text-ink hover:border-purple/40"
    }`;

  return (
    <main className="screen-bg flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-safe pt-safe">
        {/* Top bar */}
        <div className="flex items-center gap-3">
          <Link
            href="/practice"
            aria-label="Back to practice"
            className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full border border-ink/10 bg-white/85 font-extrabold text-ink-soft transition hover:bg-white"
          >
            ✕
          </Link>
          <h1 className="text-[17px] font-extrabold tracking-[-0.4px] text-ink">
            Set up your session
          </h1>
        </div>

        {/* Selected modules */}
        <div className="mt-5 flex flex-wrap gap-2">
          {pickedModules.map((m) => (
            <span
              key={m.key}
              className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12.5px] font-bold text-ink shadow-[0_8px_18px_-12px_rgba(28, 25, 23,0.35)]"
            >
              <span aria-hidden="true">{m.icon}</span> {m.title}
            </span>
          ))}
        </div>

        {/* How many questions */}
        <section className="mt-5 rounded-[18px] bg-white p-4 shadow-[0_12px_26px_-16px_rgba(28, 25, 23,0.28)]">
          <h2 className="text-[14.5px] font-extrabold tracking-[-0.2px] text-ink">
            How many questions?
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {COUNT_CHOICES.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setChoice(n)}
                className={pill(choice === n)}
                disabled={total === 0}
              >
                {Math.min(n, Math.max(total, 1))}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setChoice("all")}
              className={pill(choice === "all")}
              disabled={total === 0}
            >
              All ({total})
            </button>
            <button
              type="button"
              onClick={() => setChoice("custom")}
              className={pill(choice === "custom")}
              disabled={total === 0}
            >
              Custom
            </button>
          </div>
          {choice === "custom" ? (
            <div className="mt-3 flex items-center gap-3">
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={total}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="20"
                aria-label="How many questions?"
                className="input-boxed !h-12 !w-24 text-center text-base font-extrabold"
              />
              <span className="text-[13px] font-semibold text-ink-soft">
                of {total} questions
              </span>
            </div>
          ) : null}
        </section>

        {/* Shuffle */}
        <button
          type="button"
          onClick={() => setShuffleOn((s) => !s)}
          role="switch"
          aria-checked={shuffleOn}
          className="mt-3 flex w-full items-center gap-3 rounded-[18px] bg-white px-4 py-[15px] text-start shadow-[0_12px_26px_-16px_rgba(28, 25, 23,0.28)]"
        >
          <span className="flex-none text-lg" aria-hidden="true">🔀</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-extrabold text-ink">
              Shuffle questions
            </span>
            <span className="mt-0.5 block text-[11.5px] font-semibold leading-snug text-ink-soft">
              Off = smart order: questions due for review come first (spaced
              repetition).
            </span>
          </span>
          <Toggle on={shuffleOn} />
        </button>

        {/* Mistakes only */}
        <button
          type="button"
          onClick={() => mistakesAvailable > 0 && setMistakesOnly((m) => !m)}
          role="switch"
          aria-checked={mistakesOnly}
          disabled={mistakesAvailable === 0}
          className="mt-3 flex w-full items-center gap-3 rounded-[18px] bg-white px-4 py-[15px] text-start shadow-[0_12px_26px_-16px_rgba(28, 25, 23,0.28)] disabled:opacity-50"
        >
          <span className="flex-none text-lg" aria-hidden="true">🔁</span>
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-extrabold text-ink">
              Only questions I got wrong
            </span>
            <span className="mt-0.5 block text-[11.5px] font-semibold text-ink-soft">
              {mistakesAvailable} available
            </span>
          </span>
          <Toggle on={mistakesOnly} />
        </button>

        {/* Start */}
        <div className="mt-auto pt-6">
          {!canStart ? (
            <p className="mb-2 text-center text-[12.5px] font-bold text-bad">
              No questions match — turn a filter off.
            </p>
          ) : null}
          <button
            type="button"
            onClick={start}
            disabled={!canStart}
            className="btn-primary"
          >
            Start · {canStart ? resolved : 0} questions{" "}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </main>
  );
}

export default function SessionPage() {
  return (
    <Suspense
      fallback={
        <main className="screen-bg flex min-h-dvh items-center justify-center">
          <p className="text-sm font-bold text-ink-soft">Loading…</p>
        </main>
      }
    >
      <SessionBuilder />
    </Suspense>
  );
}
