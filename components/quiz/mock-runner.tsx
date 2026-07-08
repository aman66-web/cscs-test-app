"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Question } from "@/lib/questions/types";
import { isChoiceCorrect, isHotspotCorrect } from "@/lib/questions/types";
import { MOCK_CONFIG, MOCK_DURATION_SECONDS, isPass } from "@/lib/mock/config";
import { moduleTitle } from "@/lib/question-bank/modules";
import { moduleFirstLesson } from "@/lib/learn/modules";
import type { ModuleKey } from "@/lib/questions/types";
import {
  addXp,
  logActivity,
  logAnswers,
  noteMockResult,
  XP_PER_CORRECT,
} from "@/lib/progress/local-progress";
import { QuestionCard } from "@/components/quiz/question-card";
import { ProgressRing } from "@/components/app/progress-ring";

type Graded = {
  q: Question;
  correct: boolean;
  selected: number[];
  point: { x: number; y: number } | null;
};

type MockResult = {
  graded: Graded[];
  score: number;
  total: number;
  passed: boolean;
  byModule: Record<string, { correct: number; total: number }>;
};

const LOW_TIME_SECONDS = 5 * 60; // countdown turns red in the last 5 minutes

/**
 * The timed full mock: 50 questions, 45 minutes, pass at 45/50 (90%). One
 * question at a time, free navigation, changeable answers, NO per-question
 * feedback until submit — then it swaps to the results view (MockResults).
 * Mirrors the My Life in the UK Test app's mock runner.
 */
export function MockRunner({ questions, mockNumber }: { questions: Question[]; mockNumber: number }) {
  const [index, setIndex] = useState(0);
  const [choiceSel, setChoiceSel] = useState<Record<string, number[]>>({});
  const [hotspotSel, setHotspotSel] = useState<Record<string, { x: number; y: number }>>({});
  const [remaining, setRemaining] = useState(MOCK_DURATION_SECONDS);
  const [result, setResult] = useState<MockResult | null>(null);
  const [confirming, setConfirming] = useState(false);
  const startRef = useRef<number>(Date.now());
  // Wall-clock end time so backgrounding the tab can't pause/drift the clock.
  const endRef = useRef<number>(Date.now() + MOCK_DURATION_SECONDS * 1000);

  const total = questions.length;
  const q = questions[index];

  function isAnswered(question: Question): boolean {
    if (question.question_type === "hotspot") return !!hotspotSel[question.id];
    return (choiceSel[question.id]?.length ?? 0) > 0;
  }
  const answeredCount = questions.filter(isAnswered).length;

  function toggleChoice(i: number) {
    if (result) return;
    setChoiceSel((prev) => {
      const cur = prev[q.id] ?? [];
      if (q.question_type === "multiple_answer") {
        const next = cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i];
        return { ...prev, [q.id]: next };
      }
      return { ...prev, [q.id]: [i] };
    });
  }

  function tapHotspot(pt: { x: number; y: number }) {
    if (result) return;
    setHotspotSel((prev) => ({ ...prev, [q.id]: pt }));
  }

  function grade(): MockResult {
    const graded: Graded[] = questions.map((question) => {
      const correct =
        question.question_type === "hotspot"
          ? isHotspotCorrect(hotspotSel[question.id], question.hotspot_zones)
          : isChoiceCorrect(choiceSel[question.id] ?? [], question.correct_answer);
      return {
        q: question,
        correct,
        selected: choiceSel[question.id] ?? [],
        point: hotspotSel[question.id] ?? null,
      };
    });
    const score = graded.filter((g) => g.correct).length;
    const byModule: Record<string, { correct: number; total: number }> = {};
    for (const g of graded) {
      const m = byModule[g.q.module] ?? { correct: 0, total: 0 };
      m.total += 1;
      if (g.correct) m.correct += 1;
      byModule[g.q.module] = m;
    }
    return { graded, score, total: graded.length, passed: isPass(score), byModule };
  }

  function submit() {
    if (result) return;
    const r = grade();
    setResult(r);
    setConfirming(false);
    // Persist to the local progress store.
    logAnswers(
      r.graded.map((g) => ({ qid: g.q.id, module: g.q.module, correct: g.correct })),
      true
    );
    addXp(r.score * XP_PER_CORRECT);
    noteMockResult(mockNumber, r.score, r.total);
    const minutes = Math.max(1, Math.round((Date.now() - startRef.current) / 60000));
    logActivity(minutes, r.total);
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }

  // Countdown driven from the wall clock (recomputed each tick from Date.now),
  // so a backgrounded/throttled tab resumes at the correct time instead of
  // drifting. Runs once per test; restarts on retake (result → null).
  useEffect(() => {
    if (result) return;
    const tick = () => setRemaining(Math.max(0, Math.round((endRef.current - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [result]);

  // Auto-submit when the clock hits 0 (fresh closure captures current answers).
  useEffect(() => {
    if (!result && remaining <= 0) submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, result]);

  function retake() {
    setResult(null);
    setChoiceSel({});
    setHotspotSel({});
    setIndex(0);
    setRemaining(MOCK_DURATION_SECONDS);
    startRef.current = Date.now();
    endRef.current = Date.now() + MOCK_DURATION_SECONDS * 1000;
  }

  if (result) {
    return <MockResults result={result} mockNumber={mockNumber} onRetake={retake} />;
  }

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const lowTime = remaining <= LOW_TIME_SECONDS;

  return (
    <main className="flex min-h-dvh flex-col bg-[#F6F4FC]">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-safe pt-safe">
        {/* Top bar: leave, timer, counter */}
        <div className="flex items-center gap-3 pt-4">
          <Link
            href="/"
            aria-label="Leave mock test"
            className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full border border-ink/10 bg-white/85 font-extrabold text-ink-soft transition hover:bg-white"
          >
            ✕
          </Link>
          <span
            className={`rounded-full px-3.5 py-1.5 text-sm font-extrabold tabular-nums ${
              lowTime ? "bg-[#FDEAEA] text-[#B93B3B]" : "bg-lilac text-purple-deep"
            }`}
          >
            ⏱ {mins}:{secs.toString().padStart(2, "0")}
          </span>
          <span className="ms-auto text-[12.5px] font-extrabold text-ink-soft">
            {index + 1}/{total}
          </span>
        </div>

        {/* Question */}
        <QuestionCard
          key={q.id}
          question={q}
          eyebrow={`Mock ${mockNumber} · Question ${index + 1} of ${total}`}
          choiceSelected={choiceSel[q.id] ?? []}
          onToggleChoice={toggleChoice}
          hotspotPoint={hotspotSel[q.id] ?? null}
          onHotspotTap={tapHotspot}
          revealed={false}
        />

        <div className="mt-auto space-y-3 pt-4">
          {/* Prev / Next */}
          <div className="flex gap-3">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border-[1.5px] border-ink/12 bg-white text-sm font-bold text-ink transition disabled:opacity-40"
            >
              <span aria-hidden="true">←</span> Back
            </button>
            <button
              type="button"
              disabled={index === total - 1}
              onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border-[1.5px] border-ink/12 bg-white text-sm font-bold text-ink transition disabled:opacity-40"
            >
              Next <span aria-hidden="true">→</span>
            </button>
          </div>

          {/* Question navigator */}
          <div className="rounded-[18px] bg-white/85 p-3 shadow-[0_10px_24px_-16px_rgba(33,27,78,0.25)]">
            <div className="grid grid-cols-8 gap-1.5">
              {questions.map((question, i) => {
                const cls =
                  i === index
                    ? "bg-[linear-gradient(180deg,#8B4BF5,#6D28D9)] text-white shadow-[0_6px_14px_-6px_rgba(124,58,237,0.7)]"
                    : isAnswered(question)
                    ? "bg-lilac text-purple-deep"
                    : "border-[1.5px] border-ink/10 bg-white text-ink-soft";
                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`flex h-9 items-center justify-center rounded-[10px] text-[12.5px] font-extrabold transition active:scale-95 ${cls}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-center text-[10.5px] font-bold text-ink-soft">
              <span className="me-1 inline-block h-2 w-2 rounded-[3px] bg-lilac ring-1 ring-purple/30" /> answered
              <span className="ms-3 me-1 inline-block h-2 w-2 rounded-[3px] border border-ink/15 bg-white" /> not yet
            </p>
          </div>

          {/* Submit */}
          <button type="button" className="btn-primary" onClick={() => (answeredCount < total ? setConfirming(true) : submit())}>
            Submit test ({answeredCount}/{total} answered)
          </button>
        </div>
      </div>

      {/* Confirm-submit sheet when questions remain unanswered */}
      {confirming ? (
        <div
          className="fixed inset-0 z-50 flex items-end bg-ink/50 backdrop-blur-sm"
          onClick={() => setConfirming(false)}
        >
          <div
            className="w-full rounded-t-[28px] bg-white px-6 pb-8 pt-4"
            style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom))" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto h-1.5 w-12 rounded-full bg-ink/15" />
            <h2 className="title mt-4 text-ink">Submit now?</h2>
            <p className="body-text mt-1 text-ink-soft">
              You have {total - answeredCount} unanswered question
              {total - answeredCount === 1 ? "" : "s"}. Unanswered questions are marked wrong.
            </p>
            <button type="button" className="btn-primary mt-5" onClick={submit}>
              Submit test
            </button>
            <button
              type="button"
              className="mt-3 w-full text-center text-sm font-bold text-ink-soft"
              onClick={() => setConfirming(false)}
            >
              Keep going
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}

// =============================================================
// Results view — swapped in when the mock is submitted.
// =============================================================
function MockResults({
  result,
  mockNumber,
  onRetake,
}: {
  result: MockResult;
  mockNumber: number;
  onRetake: () => void;
}) {
  const [openReview, setOpenReview] = useState(false);
  const pct = Math.round((result.score / result.total) * 100);
  const wrong = result.graded.filter((g) => !g.correct);

  const moduleRows = Object.entries(result.byModule)
    .map(([key, v]) => ({ key, ...v, pct: Math.round((v.correct / v.total) * 100) }))
    .sort((a, b) => a.pct - b.pct);
  const weakest = moduleRows.filter((m) => m.pct < 100).slice(0, 2);

  return (
    <main className="min-h-dvh bg-[#F6F4FC]">
      <div className="mx-auto w-full max-w-md px-5 pb-16 pt-safe">
        {/* Headline */}
        <div className="pt-10 text-center">
          <ProgressRing
            percent={pct}
            size={150}
            strokeWidth={14}
            ringClassName={result.passed ? "text-good" : "text-bad"}
          >
            <div>
              <div className="text-[34px] font-extrabold leading-none text-ink">
                {result.score}
                <span className="text-lg text-ink-soft">/{result.total}</span>
              </div>
              <div className="mt-0.5 text-[12.5px] font-bold text-ink-soft">{pct}%</div>
            </div>
          </ProgressRing>

          <h1
            className="display-l mt-5"
            style={{ color: result.passed ? "#137A3B" : "#B93B3B" }}
          >
            {result.passed ? "Pass 🎉" : "Not this time"}
          </h1>
          <p className="body-text mt-1 text-ink-soft">
            {result.passed
              ? `You beat the ${MOCK_CONFIG.passMark}/${MOCK_CONFIG.questionCount} pass mark. Keep it up!`
              : `You need ${MOCK_CONFIG.passMark}/${MOCK_CONFIG.questionCount} to pass. You'll get there.`}
          </p>
        </div>

        {/* Per-module breakdown */}
        <h2 className="title mt-8 text-ink">By module</h2>
        <div className="surface-card mt-3 space-y-3.5">
          {moduleRows.map((m) => {
            const barColor = m.pct >= MOCK_CONFIG.passPercentage ? "#22B268" : m.pct >= 60 ? "#E5A93C" : "#E05555";
            return (
              <div key={m.key}>
                <div className="flex items-center justify-between text-[13px] font-bold text-ink">
                  <span>{moduleTitle(m.key as ModuleKey)}</span>
                  <span className="text-ink-soft">
                    {m.correct}/{m.total}
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#F0EDF8]">
                  <span className="block h-full rounded-full" style={{ width: `${m.pct}%`, background: barColor }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Weakest → CTAs */}
        {weakest.length > 0 ? (
          <div className="surface-card mt-4">
            <p className="micro text-purple-deep">Focus next on</p>
            {weakest.map((m) => (
              <div key={m.key} className="mt-2 flex items-center justify-between gap-3">
                <span className="text-sm font-bold text-ink">{moduleTitle(m.key as ModuleKey)}</span>
                <div className="flex flex-none gap-2">
                  <Link
                    href={`/learn/${m.key}/${moduleFirstLesson(m.key as ModuleKey)}`}
                    className="rounded-full bg-lilac px-3 py-1.5 text-xs font-bold text-purple-deep"
                  >
                    Learn
                  </Link>
                  <Link
                    href={`/test/${m.key}`}
                    className="rounded-full bg-lilac px-3 py-1.5 text-xs font-bold text-purple-deep"
                  >
                    Practice
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Review wrong answers */}
        {wrong.length > 0 ? (
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setOpenReview((o) => !o)}
              className="flex w-full items-center justify-between rounded-card bg-white p-[18px] shadow-glow"
            >
              <span className="font-bold text-ink">
                Review {wrong.length} wrong answer{wrong.length === 1 ? "" : "s"}
              </span>
              <span aria-hidden="true" className="text-ink-soft">
                {openReview ? "▲" : "▼"}
              </span>
            </button>
            {openReview ? (
              <div className="mt-3 space-y-3">
                {wrong.map((g) => (
                  <div key={g.q.id} className="surface-card">
                    <p className="text-[15px] font-bold leading-snug text-ink">{g.q.question_text}</p>
                    {g.q.question_type === "hotspot" ? (
                      <p className="mt-2 text-[13px] font-semibold text-[#B93B3B]">You tapped the wrong area.</p>
                    ) : (
                      <>
                        <p className="mt-2 text-[13px] font-semibold text-[#B93B3B]">
                          Your answer:{" "}
                          {g.selected.length ? g.selected.map((i) => g.q.options[i]).join(", ") : "— (skipped)"}
                        </p>
                        <p className="mt-1 text-[13px] font-semibold text-[#137A3B]">
                          Correct: {g.q.correct_answer.map((i) => g.q.options[i]).join(", ")}
                        </p>
                      </>
                    )}
                    <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{g.q.explanation}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {/* CTAs */}
        <div className="mt-6 space-y-3">
          <button type="button" className="btn-primary" onClick={onRetake}>
            Retake this mock
          </button>
          <Link href="/" className="block text-center text-sm font-bold text-ink-soft">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
