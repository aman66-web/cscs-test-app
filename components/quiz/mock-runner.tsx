"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ModuleKey, Question } from "@/lib/questions/types";
import { isChoiceCorrect, isHotspotCorrect } from "@/lib/questions/types";
import { MOCK_CONFIG, MOCK_DURATION_SECONDS } from "@/lib/mock/config";
import { moduleTitle } from "@/lib/question-bank/modules";
import { TOPICS, type TopicKey } from "@/lib/onboarding/types";
import { QuestionCard } from "@/components/quiz/question-card";
import {
  addXp,
  logActivity,
  logAnswers,
  noteMockResult,
  XP_PER_CORRECT,
} from "@/lib/progress/local-progress";
import { srsGradeAnswers } from "@/lib/progress/srs";
import { recordAnswersServer } from "@/lib/progress/server-log";
import { notePositiveMoment } from "@/lib/review/review-prompt";

// Cloned from the My Life in the UK Test app's components/practice/mock-runner.tsx,
// minus i18n and extended for the CSCS question types (multiple-answer beyond
// two picks, image questions, hotspot taps).

const DURATION_MS = MOCK_DURATION_SECONDS * 1000;
const MOCK_PASS_MARK = MOCK_CONFIG.passMark;

type ModuleScore = { correct: number; total: number };
type Result = {
  score: number;
  byModule: Partial<Record<TopicKey, ModuleScore>>;
  wrong: { q: Question; selected: number[]; point: { x: number; y: number } | null }[];
  timeTakenMs: number;
};

/**
 * Full exam simulation: 50 exam-weighted questions, visible 45-minute
 * countdown, free prev/next navigation with changeable answers and NO
 * feedback until submission. Results feed the readiness score via the
 * local answer log (isMock answers carry extra weight).
 */
export function MockRunner({
  questions,
  mockNumber,
}: {
  questions: Question[];
  mockNumber: number;
}) {
  const total = questions.length;
  const [index, setIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, number[]>>({});
  const [hotspots, setHotspots] = useState<Record<string, { x: number; y: number }>>({});
  const [result, setResult] = useState<Result | null>(null);
  const endsAtRef = useRef<number>(Date.now() + DURATION_MS);
  const [remaining, setRemaining] = useState(DURATION_MS);
  const submittedRef = useRef(false);
  // Live mirrors of the answer state so the timer's auto-submit (registered
  // once on mount) grades the user's REAL answers, not the empty initial
  // state its closure captured.
  const selectionsRef = useRef(selections);
  selectionsRef.current = selections;
  const hotspotsRef = useRef(hotspots);
  hotspotsRef.current = hotspots;

  function handleSubmit() {
    if (submittedRef.current) return;
    submittedRef.current = true;

    const answers = selectionsRef.current;
    const taps = hotspotsRef.current;
    let score = 0;
    const byModule: Partial<Record<TopicKey, ModuleScore>> = {};
    const wrong: Result["wrong"] = [];
    const logBatch: {
      qid: string;
      module: string;
      correct: boolean;
    }[] = [];

    for (const q of questions) {
      const sel = answers[q.id] ?? [];
      const point = taps[q.id] ?? null;
      const right =
        q.question_type === "hotspot"
          ? isHotspotCorrect(point, q.hotspot_zones)
          : isChoiceCorrect(sel, q.correct_answer);
      const c = byModule[q.module] ?? { correct: 0, total: 0 };
      c.total += 1;
      if (right) {
        score += 1;
        c.correct += 1;
      } else {
        wrong.push({ q, selected: sel, point });
      }
      byModule[q.module] = c;
      logBatch.push({ qid: q.id, module: q.module, correct: right });
    }

    const timeTakenMs = DURATION_MS - Math.max(0, endsAtRef.current - Date.now());
    logAnswers(logBatch, true);
    recordAnswersServer(logBatch, true);
    srsGradeAnswers(logBatch);
    addXp(score * XP_PER_CORRECT);
    noteMockResult(mockNumber, score, total);
    logActivity(Math.max(1, Math.round(timeTakenMs / 60000)), total);
    setResult({ score, byModule, wrong, timeTakenMs });
    if (typeof window !== "undefined") window.scrollTo(0, 0);

    // Passing a mock is a strong positive moment — maybe ask for a review
    // (the throttle in lib/review decides if/when it actually shows).
    if (score >= MOCK_PASS_MARK) notePositiveMoment();
  }

  // Bumping `attempt` re-registers the countdown (used by Retake, since
  // navigating to the same URL would not remount this client component).
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      // Stop ticking once submitted (manual submit shows results but left the
      // interval running for the rest of the 45 min, re-rendering every second).
      if (submittedRef.current) {
        clearInterval(id);
        return;
      }
      const rem = endsAtRef.current - Date.now();
      setRemaining(rem);
      if (rem <= 0) {
        clearInterval(id);
        handleSubmit();
      }
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  /** Full in-place reset for "Retake this mock" (same deterministic paper). */
  function retake() {
    submittedRef.current = false;
    endsAtRef.current = Date.now() + DURATION_MS;
    setSelections({});
    setHotspots({});
    setIndex(0);
    setRemaining(DURATION_MS);
    setResult(null);
    setAttempt((a) => a + 1);
  }

  if (result) {
    return (
      <MockResults
        result={result}
        total={total}
        mockNumber={mockNumber}
        onRetake={retake}
      />
    );
  }

  const q = questions[index];

  function toggle(i: number) {
    setSelections((prev) => {
      const cur = prev[q.id] ?? [];
      if (q.question_type === "multiple_answer") {
        const next = cur.includes(i)
          ? cur.filter((x) => x !== i)
          : [...cur, i];
        return { ...prev, [q.id]: next };
      }
      return { ...prev, [q.id]: [i] };
    });
  }

  function tapHotspot(pt: { x: number; y: number }) {
    setHotspots((prev) => ({ ...prev, [q.id]: pt }));
  }

  function isAnswered(question: Question): boolean {
    if (question.question_type === "hotspot") return !!hotspots[question.id];
    return (selections[question.id] ?? []).length > 0;
  }

  const answeredCount = questions.filter(isAnswered).length;
  const mins = Math.max(0, Math.floor(remaining / 60_000));
  const secs = Math.max(0, Math.floor((remaining % 60_000) / 1000));
  const low = remaining <= 5 * 60_000;

  return (
    <main className="screen-bg flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-safe pt-safe">
        {/* Top: leave + countdown + progress */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            aria-label="Leave mock test"
            className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full border border-ink/10 bg-white/85 font-extrabold text-ink-soft transition hover:bg-white"
          >
            ✕
          </Link>
          <span
            className={`rounded-full px-3.5 py-1.5 text-sm font-extrabold tabular-nums ${
              low ? "bg-[#FDEAEA] text-[#B93B3B]" : "bg-lilac text-purple-deep"
            }`}
            aria-label={`Time remaining ${mins} minutes ${secs} seconds`}
          >
            ⏱ {mins}:{secs.toString().padStart(2, "0")}
          </span>
          <span className="ms-auto text-[12.5px] font-extrabold text-ink-soft">
            {index + 1}/{total}
          </span>
        </div>

        {/* Question card — no feedback until the end */}
        <QuestionCard
          key={q.id}
          question={q}
          eyebrow={`Mock ${mockNumber} · Question ${index + 1} of ${total}`}
          choiceSelected={selections[q.id] ?? []}
          onToggleChoice={toggle}
          hotspotPoint={hotspots[q.id] ?? null}
          onHotspotTap={tapHotspot}
          revealed={false}
        />

        {/* Navigation + submit */}
        <div className="mt-auto space-y-3 pt-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={index === 0}
              className="btn-secondary !h-12 flex-1 !text-sm disabled:opacity-40"
            >
              <span aria-hidden="true">←</span> Previous
            </button>
            <button
              type="button"
              onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
              disabled={index === total - 1}
              className="btn-secondary !h-12 flex-1 !text-sm disabled:opacity-40"
            >
              Next <span aria-hidden="true">→</span>
            </button>
          </div>

          {/* Question navigator: jump to any question at any point */}
          <div className="rounded-[18px] bg-white/85 p-3 shadow-[0_10px_24px_-16px_rgba(28, 25, 23,0.25)]">
            <div className="grid grid-cols-8 gap-1.5">
              {questions.map((qq, i) => {
                const isCurrent = i === index;
                const answered = isAnswered(qq);
                return (
                  <button
                    key={qq.id}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Go to question ${i + 1}${
                      answered ? " (answered)" : " (not answered)"
                    }`}
                    aria-current={isCurrent ? "true" : undefined}
                    className={`flex h-9 items-center justify-center rounded-[10px] text-[12.5px] font-extrabold transition active:scale-95 ${
                      isCurrent
                        ? "bg-[linear-gradient(180deg,#F97316,#C2410C)] text-white shadow-[0_6px_14px_-6px_rgba(249, 115, 22,0.7)]"
                        : answered
                          ? "bg-lilac text-purple-deep"
                          : "border-[1.5px] border-ink/10 bg-white text-ink-soft"
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-center text-[10.5px] font-bold text-ink-soft">
              <span className="me-3 inline-flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-[3px] bg-lilac ring-1 ring-purple/30" aria-hidden="true" />{" "}
                Answered
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-[3px] border border-ink/15 bg-white" aria-hidden="true" />{" "}
                Not yet
              </span>
            </p>
          </div>

          <button type="button" onClick={handleSubmit} className="btn-primary">
            Submit test ({answeredCount}/{total} answered)
          </button>
        </div>
      </div>
    </main>
  );
}

function MockResults({
  result,
  total,
  mockNumber,
  onRetake,
}: {
  result: Result;
  total: number;
  mockNumber: number;
  onRetake: () => void;
}) {
  const passed = result.score >= MOCK_PASS_MARK;
  const pct = Math.round((result.score / total) * 100);
  const mins = Math.floor(result.timeTakenMs / 60_000);
  const secs = Math.floor((result.timeTakenMs % 60_000) / 1000);

  // Weakest modules in this mock → actionable guidance.
  const modules = TOPICS.map(({ key }) => ({
    key,
    ...(result.byModule[key] ?? { correct: 0, total: 0 }),
  })).filter((c) => c.total > 0);
  const weakest = [...modules]
    .sort((a, b) => a.correct / a.total - b.correct / b.total)
    .filter((c) => c.correct < c.total)
    .slice(0, 2);

  return (
    <main className="screen-bg flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-10 pt-10">
        {/* Headline */}
        <div className="text-center">
          <div className="text-[52px]" aria-hidden="true">
            {passed ? "🎉" : "📚"}
          </div>
          <h1 className="mt-1 text-2xl font-extrabold tracking-[-0.5px] text-ink">
            {passed ? "That's a pass!" : "Not quite this time"}
          </h1>
          <p className="mt-1.5 text-sm font-semibold text-ink-soft">
            Mock {mockNumber}: {result.score}/{total} ({pct}%) · pass mark{" "}
            {MOCK_PASS_MARK}/{total} · time {mins}:
            {secs.toString().padStart(2, "0")}
          </p>
          <span
            className={`mt-3 inline-flex items-center rounded-full px-4 py-1.5 text-sm font-extrabold ${
              passed ? "bg-[#E3F8EA] text-[#137A3B]" : "bg-[#FDEAEA] text-[#B93B3B]"
            }`}
          >
            {passed ? "Pass ✓" : "Below pass mark"}
          </span>
        </div>

        {/* Per-module breakdown */}
        <section className="surface-card mt-6">
          <h2 className="text-base font-extrabold tracking-[-0.3px] text-ink">
            Module breakdown
          </h2>
          {modules.map((c) => {
            const p = Math.round((c.correct / c.total) * 100);
            return (
              <div key={c.key} className="mt-3">
                <div className="flex items-center justify-between text-[12.5px] font-bold text-ink">
                  <span className="min-w-0 truncate pe-2">
                    {moduleTitle(c.key as ModuleKey)}
                  </span>
                  <span className="flex-none text-ink-soft">
                    {c.correct}/{c.total}
                  </span>
                </div>
                <div className="mt-1 flex h-2 overflow-hidden rounded-[5px] bg-[#F0EDF8]">
                  <i
                    className="block h-full rounded-[5px]"
                    style={{
                      width: `${p}%`,
                      background: p >= 90 ? "#22B268" : p >= 40 ? "#E5A93C" : "#E05555",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </section>

        {/* Actionable guidance */}
        {weakest.length > 0 ? (
          <section className="surface-card mt-4">
            <h2 className="text-base font-extrabold tracking-[-0.3px] text-ink">
              Where to focus next
            </h2>
            {weakest.map((c) => (
              <div key={c.key} className="mt-3 border-t border-ink/5 pt-3 first:mt-2 first:border-t-0 first:pt-0">
                <p className="text-[13px] font-bold text-ink">
                  {moduleTitle(c.key as ModuleKey)}{" "}
                  <span className="font-semibold text-ink-soft">
                    — {c.correct}/{c.total} in this mock
                  </span>
                </p>
                <div className="mt-2 flex gap-2.5">
                  <Link
                    href="/learn"
                    className="flex-1 rounded-full bg-lilac px-3 py-2 text-center text-[12.5px] font-extrabold text-purple-deep transition hover:bg-[#FBE4CC]"
                  >
                    📖 Revisit in Learn
                  </Link>
                  <Link
                    href={`/practice/${c.key}`}
                    className="flex-1 rounded-full bg-lilac px-3 py-2 text-center text-[12.5px] font-extrabold text-purple-deep transition hover:bg-[#FBE4CC]"
                  >
                    🎯 Drill in Practice
                  </Link>
                </div>
              </div>
            ))}
          </section>
        ) : null}

        {/* Review every wrong answer */}
        {result.wrong.length > 0 ? (
          <section className="mt-4">
            <h2 className="px-1 text-base font-extrabold tracking-[-0.3px] text-ink">
              Review your {result.wrong.length} wrong answer
              {result.wrong.length === 1 ? "" : "s"}
            </h2>
            {result.wrong.map(({ q, selected }) => (
              <div key={q.id} className="surface-card mt-3">
                <p className="text-start text-[14px] font-extrabold leading-snug text-ink">
                  {q.question_text}
                </p>
                {q.question_type === "hotspot" ? (
                  <p className="mt-2 text-[12.5px] font-bold text-[#B93B3B]">
                    ✕ Your answer: tapped the wrong area of the image
                  </p>
                ) : (
                  <>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[12.5px] font-bold text-[#B93B3B]">
                      <span>✕ Your answer:</span>
                      {selected.length > 0 ? (
                        <AnswerOptions q={q} idxs={selected} />
                      ) : (
                        <span>not answered</span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[12.5px] font-bold text-[#137A3B]">
                      <span>✓ Correct:</span>
                      <AnswerOptions q={q} idxs={q.correct_answer} />
                    </div>
                  </>
                )}
                <div className="mt-2.5 rounded-[14px] bg-lilac p-3 text-[12.5px] font-semibold leading-[1.45] text-ink">
                  <span className="block text-start">💡 {q.explanation}</span>
                </div>
              </div>
            ))}
          </section>
        ) : (
          <p className="mt-4 text-center text-sm font-bold text-[#137A3B]">
            Perfect score — nothing to review. Outstanding!
          </p>
        )}

        {/* CTAs */}
        <div className="mt-6 space-y-3">
          <Link href="/dashboard" className="btn-primary">
            Back to home
          </Link>
          <button type="button" onClick={onRetake} className="btn-secondary">
            Retake this mock
          </button>
        </div>
      </div>
    </main>
  );
}

/**
 * Renders a set of answer options in the wrong-answers review — either the
 * option text joined with " + ", or, for "click the correct sign" questions
 * (image-path options), small sign thumbnails.
 */
function AnswerOptions({ q, idxs }: { q: Question; idxs: number[] }) {
  const isImage =
    q.options.length > 0 && q.options.every((o) => o.startsWith("/signs/"));
  if (!isImage) {
    return <span>{idxs.map((i) => q.options[i]).join(" + ")}</span>;
  }
  return (
    <>
      {idxs.map((i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={q.options[i]}
          alt="Safety sign"
          className="inline-block h-9 w-9 rounded border border-ink/10 bg-white object-contain p-0.5 align-middle"
        />
      ))}
    </>
  );
}
