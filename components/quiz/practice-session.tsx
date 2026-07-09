"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { Question } from "@/lib/questions/types";
import { isChoiceCorrect, isHotspotCorrect } from "@/lib/questions/types";
import { shuffle } from "@/lib/questions/select";
import { QuestionCard } from "@/components/quiz/question-card";
import { CoachFab } from "@/components/coach/coach-fab";
import {
  addXp,
  currentStreak,
  logActivity,
  logAnswer,
  noteBestScore,
  XP_PER_CORRECT,
} from "@/lib/progress/local-progress";
import { srsGradeAnswer } from "@/lib/progress/srs";
import { recordAnswersServer } from "@/lib/progress/server-log";
import { notePositiveMoment } from "@/lib/review/review-prompt";
import type { TopicKey } from "@/lib/onboarding/types";

// Cloned from the My Life in the UK Test app's components/practice/
// practice-session.tsx, minus i18n and extended for the CSCS question types
// (image + hotspot questions; multi-answer can be more than two picks).
// The pass bar is the CSCS one: 90% (the real HS&E pass mark).

const PASS_PERCENT = 90;

/**
 * Practice quiz in the prototype's overlay style: progress bar + XP counter
 * on top, white question card with the module eyebrow, locking answer
 * pills, +10 XP pop, 💡 explanation, and a results screen (pass at 90%).
 */
export function PracticeSession({
  questions,
  topic,
  title,
  scoreKey,
  doneHref,
}: {
  questions: Question[];
  /** A module key, or "mixed" / "mistakes" for the special decks. */
  topic: TopicKey | "mixed" | "mistakes";
  title: string;
  /** Best-score storage key (defaults to `topic`; lessons use sub:… keys). */
  scoreKey?: string;
  /** Where the primary results CTA goes (defaults to /practice). */
  doneHref?: string;
}) {
  // Kept in state so "Practise again" can reshuffle and restart in place —
  // navigating to the same URL would not remount this client component.
  const [sessionQuestions, setSessionQuestions] = useState(questions);
  const total = sessionQuestions.length;
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [hotspotPoint, setHotspotPoint] = useState<{ x: number; y: number } | null>(null);
  const [answered, setAnswered] = useState(false);
  const [wasRight, setWasRight] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [xp, setXp] = useState(0);
  const [xpPop, setXpPop] = useState(false);
  const [finished, setFinished] = useState(false);
  const startRef = useRef(Date.now());
  const loggedRef = useRef(false);

  const q = sessionQuestions[index];

  // Defensive: callers guard against an empty pool (mistakes deck / lesson
  // check both require questions), but never render with 0 — a missing `q`
  // would crash and the results screen would divide by zero.
  if (total === 0 || !q) {
    return (
      <main className="screen-bg flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <p className="text-sm font-semibold text-ink-soft">Nice work!</p>
        <Link
          href={doneHref ?? "/practice"}
          className="btn-primary mt-4 !w-auto px-8"
        >
          Back to practice
        </Link>
      </main>
    );
  }

  /** Full in-place restart with the same pool, freshly shuffled. */
  function restart() {
    setSessionQuestions(shuffle(questions));
    setIndex(0);
    setSelected([]);
    setHotspotPoint(null);
    setAnswered(false);
    setWasRight(false);
    setCorrectCount(0);
    setXp(0);
    setXpPop(false);
    setFinished(false);
    loggedRef.current = false;
    startRef.current = Date.now();
  }

  function toggle(i: number) {
    if (answered) return;
    if (q.question_type === "multiple_answer") {
      setSelected((prev) =>
        prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
      );
    } else {
      submit([i], null);
    }
  }

  function tapHotspot(pt: { x: number; y: number }) {
    if (answered) return;
    setHotspotPoint(pt);
  }

  function submit(sel: number[], point: { x: number; y: number } | null) {
    if (answered) return;
    const isHotspot = q.question_type === "hotspot";
    if (isHotspot ? !point : sel.length === 0) return;
    setSelected(sel);
    setAnswered(true);
    const right = isHotspot
      ? isHotspotCorrect(point, q.hotspot_zones)
      : isChoiceCorrect(sel, q.correct_answer);
    setWasRight(right);
    if (right) {
      setCorrectCount((c) => c + 1);
      setXp((x) => x + XP_PER_CORRECT);
      setXpPop(true);
      addXp(XP_PER_CORRECT);
    }
    // Local answer log — powers readiness, accuracy and the Mistakes deck.
    // Logged under the QUESTION's module (sessions can mix modules).
    logAnswer(q.id, q.module, right, false);
    // Authoritative server copy (user_answers) — fire-and-forget.
    recordAnswersServer([{ qid: q.id, module: q.module, correct: right }], false);
    // Spaced repetition: quizzes grade implicitly (right → good, wrong → again).
    srsGradeAnswer(q.id, right);
  }

  function next() {
    if (index + 1 >= total) {
      if (!loggedRef.current) {
        loggedRef.current = true;
        const minutes = Math.max(
          1,
          Math.round((Date.now() - startRef.current) / 60000)
        );
        logActivity(minutes, total);
        const finishPct =
          total > 0 ? Math.round((correctCount / total) * 100) : 0;
        noteBestScore(scoreKey ?? topic, finishPct);
        // A passing run or a nice streak milestone is a positive moment —
        // maybe ask for a review (lib/review's throttle gates if/when).
        if (finishPct >= PASS_PERCENT || [3, 7, 14, 30].includes(currentStreak())) {
          notePositiveMoment();
        }
      }
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected([]);
    setHotspotPoint(null);
    setAnswered(false);
    setWasRight(false);
    setXpPop(false);
  }

  // ----- Results screen (prototype .qdone) -----
  if (finished) {
    const pct = Math.round((correctCount / total) * 100);
    const pass = pct >= PASS_PERCENT;
    return (
      <main className="screen-bg flex min-h-dvh flex-col">
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-5 pb-safe pt-safe text-center">
          <div className="text-[52px]" aria-hidden="true">
            🎉
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.5px] text-ink">
            {pass ? "That's a pass! 🎉" : "Nice work!"}
          </h1>
          <p className="mt-1.5 text-sm font-semibold text-ink-soft">
            You scored {correctCount}/{total} ({pct}%) · +{xp} XP earned
          </p>
          <div className="mt-8 w-full space-y-3">
            <Link href={doneHref ?? "/practice"} className="btn-primary">
              {doneHref ? "Continue" : "Back to practice"}
            </Link>
            <button type="button" onClick={restart} className="btn-secondary">
              Practise again
            </button>
          </div>
        </div>
      </main>
    );
  }

  const needsCheckButton =
    q.question_type === "multiple_answer" || q.question_type === "hotspot";
  const hasAnswer =
    q.question_type === "hotspot" ? hotspotPoint != null : selected.length > 0;
  const progress = ((index + (answered ? 1 : 0)) / total) * 100;

  return (
    <main className="screen-bg flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-safe pt-safe">
        {/* Top: close + progress + XP (prototype .qtop) */}
        <div className="flex items-center gap-3">
          <Link
            href={doneHref ?? "/practice"}
            aria-label="Close quiz"
            className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full border border-ink/10 bg-white/85 font-extrabold text-ink-soft transition hover:bg-white"
          >
            ✕
          </Link>
          <div className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#F97316,#C2410C)] transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="flex-none text-[12.5px] font-extrabold text-purple-deep">
            ⚡ {xp} XP
          </span>
        </div>

        {/* Question card (prototype .qcard) — the XP pop floats over its corner */}
        <div className="relative">
          <div
            aria-hidden="true"
            className={`absolute -top-3.5 right-0 z-10 rounded-[14px] bg-white px-[13px] py-[9px] text-[13px] font-extrabold text-purple-deep shadow-[0_14px_30px_-12px_rgba(28, 25, 23,0.4)] transition-all duration-300 ${
              xpPop ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0"
            }`}
          >
            +{XP_PER_CORRECT} XP ⚡
          </div>
          <QuestionCard
            key={q.id}
            question={q}
            eyebrow={`${title} · Question ${index + 1} of ${total}`}
            choiceSelected={selected}
            onToggleChoice={toggle}
            hotspotPoint={hotspotPoint}
            onHotspotTap={tapHotspot}
            revealed={answered}
          />
          {answered ? (
            <div className="mt-3.5 rounded-[14px] bg-lilac p-[13px] text-[13px] font-semibold leading-[1.45] text-ink">
              <span className="block text-start">
                {wasRight ? "✓" : "💡"} {q.explanation}
              </span>
            </div>
          ) : null}
        </div>

        {/* Bottom action */}
        <div className="mt-auto space-y-3 pt-4">
          {needsCheckButton && !answered ? (
            <button
              type="button"
              onClick={() => submit(selected, hotspotPoint)}
              disabled={!hasAnswer}
              className="btn-primary"
            >
              Check answer
            </button>
          ) : null}
          {answered ? (
            <button type="button" onClick={next} className="btn-primary">
              {index + 1 >= total ? "See results →" : "Next question →"}
            </button>
          ) : null}
        </div>
      </div>
      <CoachFab
        aboveTabBar
        context={`Practice question: "${q.question_text}" (module: ${title})`}
      />
    </main>
  );
}
