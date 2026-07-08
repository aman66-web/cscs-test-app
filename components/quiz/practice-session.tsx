"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { ModuleKey, Question } from "@/lib/questions/types";
import { isChoiceCorrect, isHotspotCorrect } from "@/lib/questions/types";
import {
  addXp,
  logActivity,
  logAnswer,
  noteBestScore,
  XP_PER_CORRECT,
} from "@/lib/progress/local-progress";
import { ProgressRing } from "@/components/app/progress-ring";
import { QuestionCard } from "@/components/quiz/question-card";

/**
 * A short quiz with per-question feedback (reveal correct/wrong + explanation
 * after each answer). Used by learn-mode lesson checks and end-of-module tests.
 * Mirrors the My Life in the UK Test app's PracticeSession. Awards XP per
 * correct answer and records everything in the local progress store.
 */
export function PracticeSession({
  questions,
  title,
  doneHref,
  scoreKey,
  passPercentage,
}: {
  questions: Question[];
  title: string;
  doneHref: string;
  /** Where the best % is stored (e.g. a module key or "sub:module:subId"). */
  scoreKey?: string;
  /** If set, the done screen shows pass/fail against this %. */
  passPercentage?: number;
}) {
  const [index, setIndex] = useState(0);
  const [choiceSel, setChoiceSel] = useState<number[]>([]);
  const [hotspotPoint, setHotspotPoint] = useState<{ x: number; y: number } | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [xp, setXp] = useState(0);
  const [xpPop, setXpPop] = useState(false);
  const [done, setDone] = useState(false);
  const startRef = useRef(Date.now());
  const loggedRef = useRef(false);

  const total = questions.length;
  const q = questions[index];

  const hasAnswer = q.question_type === "hotspot" ? hotspotPoint != null : choiceSel.length > 0;

  function toggleChoice(i: number) {
    if (revealed) return;
    if (q.question_type === "multiple_answer") {
      setChoiceSel((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]));
    } else {
      setChoiceSel([i]);
    }
  }

  function check() {
    if (revealed || !hasAnswer) return;
    const correct =
      q.question_type === "hotspot"
        ? isHotspotCorrect(hotspotPoint, q.hotspot_zones)
        : isChoiceCorrect(choiceSel, q.correct_answer);
    setRevealed(true);
    logAnswer(q.id, q.module, correct, false);
    if (correct) {
      setCorrectCount((c) => c + 1);
      setXp((x) => x + XP_PER_CORRECT);
      setXpPop(true);
      addXp(XP_PER_CORRECT);
    }
  }

  function next() {
    if (index + 1 >= total) {
      finish();
      return;
    }
    setIndex((i) => i + 1);
    setChoiceSel([]);
    setHotspotPoint(null);
    setRevealed(false);
    setXpPop(false);
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }

  function finish() {
    if (!loggedRef.current) {
      loggedRef.current = true;
      const pct = Math.round((correctCount / total) * 100);
      if (scoreKey) noteBestScore(scoreKey, pct);
      const minutes = Math.max(1, Math.round((Date.now() - startRef.current) / 60000));
      logActivity(minutes, total);
    }
    setDone(true);
  }

  if (done) {
    const pct = Math.round((correctCount / total) * 100);
    const passed = passPercentage != null ? pct >= passPercentage : undefined;
    return (
      <main className="screen-bg flex min-h-dvh flex-col">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 pb-safe pt-safe text-center">
          <ProgressRing
            percent={pct}
            size={140}
            strokeWidth={13}
            ringClassName={passed === false ? "text-bad" : "text-good"}
          >
            <div className="text-[30px] font-extrabold leading-none text-ink">
              {correctCount}
              <span className="text-base text-ink-soft">/{total}</span>
            </div>
          </ProgressRing>
          <h1 className="display-l mt-5 text-ink">
            {passed === undefined ? "Nice work!" : passed ? "Passed 🎉" : "Keep going"}
          </h1>
          <p className="body-text mt-1 text-ink-soft">
            You scored {pct}%{passPercentage != null ? ` (pass mark ${passPercentage}%)` : ""} and earned {xp} XP.
          </p>
          <div className="mt-8 w-full space-y-3">
            <Link href={doneHref} className="btn-primary">
              Done
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="screen-bg flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-safe pt-safe">
        {/* Top bar */}
        <div className="flex items-center gap-3">
          <Link
            href={doneHref}
            aria-label="Leave"
            className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full border border-ink/10 bg-white/85 font-extrabold text-ink-soft transition hover:bg-white"
          >
            ✕
          </Link>
          <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#8B4BF5,#6D28D9)] transition-[width] duration-300"
              style={{ width: `${(index / total) * 100}%` }}
            />
          </div>
          <span className="flex-none text-[12.5px] font-extrabold text-purple-deep">⚡ {xp} XP</span>
        </div>

        {/* +XP pop */}
        <div className="relative">
          <span
            className={`pointer-events-none absolute right-0 top-1 z-10 rounded-[14px] bg-white px-[13px] py-[9px] text-[13px] font-extrabold text-purple-deep shadow-[0_14px_30px_-12px_rgba(33,27,78,0.4)] transition-all duration-300 ${
              xpPop ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0"
            }`}
          >
            +{XP_PER_CORRECT} XP ⚡
          </span>
        </div>

        <QuestionCard
          key={q.id}
          question={q}
          eyebrow={title}
          choiceSelected={choiceSel}
          onToggleChoice={toggleChoice}
          hotspotPoint={hotspotPoint}
          onHotspotTap={(pt) => !revealed && setHotspotPoint(pt)}
          revealed={revealed}
        />

        {revealed ? (
          <div className="surface-card mt-3">
            <p className="text-[13px] leading-relaxed text-ink-soft">
              <span className="font-bold text-ink">Explanation. </span>
              {q.explanation}
            </p>
          </div>
        ) : null}

        <div className="mt-auto pt-4">
          {!revealed ? (
            <button type="button" className="btn-primary" disabled={!hasAnswer} onClick={check}>
              Check answer
            </button>
          ) : (
            <button type="button" className="btn-primary" onClick={next}>
              {index + 1 >= total ? "See results →" : "Next question →"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
