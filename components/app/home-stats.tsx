"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HomeCarousel } from "@/components/app/home-carousel";
import { computeReadinessV2 } from "@/lib/readiness/readiness";
import { minutesLeft, TARGET } from "@/lib/study-plan/study-plan";
import {
  distinctAttempted,
  getProgress,
  moduleAccuracyPct,
  readinessSamples,
  recentMockPercents,
  type LocalProgress,
} from "@/lib/progress/local-progress";
import { TOPICS, type TopicKey } from "@/lib/onboarding/types";

// Cloned from the My Life in the UK Test app's home-stats.tsx, minus i18n.
// The "topics" here are the five CSCS modules; the safe zone is 95%.

/** "Weakest area" unlocks once ~5% of the bank has been attempted. */
const UNLOCK_COVERAGE = 0.05;

const TOPIC_LABEL = new Map(TOPICS.map((t) => [t.key, t.label]));

function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[80dvh] w-full max-w-md overflow-y-auto rounded-t-[28px] bg-white px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-3"
      >
        <div className="mx-auto h-1.5 w-12 rounded-full bg-ink/15" aria-hidden="true" />
        <h3 className="mt-4 text-lg font-extrabold tracking-[-0.4px] text-ink">
          {title}
        </h3>
        {children}
        <button type="button" onClick={onClose} className="btn-primary mt-5">
          Got it
        </button>
      </div>
    </div>
  );
}

/**
 * Home stats: swipeable gauge/graph carousel + the three stat chips
 * ("Days to ready" → estimate sheet; "Weakest area" → locked until 5%
 * coverage, then a ranking sheet; "Days till exam" → countdown or set-a-date).
 * Everything is computed client-side from the local answer log.
 */
export function HomeStats({
  seedHardest,
  goalMinutes,
  testDate,
  bankTotal,
}: {
  seedHardest: TopicKey[];
  goalMinutes: number;
  testDate: string | null;
  bankTotal: number;
}) {
  const [progress, setProgress] = useState<LocalProgress | null>(null);
  const [sheet, setSheet] = useState<null | "ready" | "weakest">(null);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  // Readiness v2: weighted mocks + recency-weighted accuracy + coverage
  // (formula documented in lib/readiness/readiness.ts).
  const attempted = progress ? distinctAttempted(progress) : 0;
  const readiness = progress
    ? computeReadinessV2({
        samples: readinessSamples(progress),
        mockPercents: recentMockPercents(progress),
        distinctAttempted: attempted,
        bankTotal,
      })
    : null;
  const empty = !readiness || readiness.band === "empty";
  const score = readiness?.score ?? null;
  const coverage = bankTotal > 0 ? attempted / bankTotal : 0;
  const weakestUnlocked = coverage >= UNLOCK_COVERAGE;

  // Module ranking (weakest first) from the local log.
  const acc = progress ? moduleAccuracyPct(progress) : {};
  const ranked = TOPICS.map(({ key }) => ({ key, pct: acc[key] }))
    .filter((c): c is { key: TopicKey; pct: number } => c.pct != null)
    .sort((a, b) => a.pct - b.pct);
  const weakest = ranked[0]?.key ?? seedHardest[0] ?? "safety";

  const minsLeft = empty || score == null ? null : minutesLeft(score);
  const daysToReady =
    minsLeft == null
      ? null
      : score! >= TARGET
        ? 0
        : Math.ceil(minsLeft / goalMinutes);

  // Days till exam. The chip vs "set a date" choice keys off `testDate` (a
  // stable prop, identical on server + client), but the NUMBER reads the clock,
  // so it's deferred to after mount (progress != null) — otherwise the SSR
  // number (server clock) and the hydration number (device clock) can differ
  // across midnight/timezone and trigger a hydration mismatch.
  const hasTestDate = !!testDate;
  const daysTillExam =
    progress == null || !testDate
      ? null
      : (() => {
          const d = new Date(`${testDate}T00:00:00`);
          if (Number.isNaN(d.getTime())) return null;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return Math.round((d.getTime() - today.getTime()) / 86400000);
        })();

  const chip =
    "min-w-0 flex-1 rounded-2xl bg-white p-3 text-start shadow-[0_10px_24px_-14px_rgba(33,27,78,0.3)] transition active:scale-[0.99]";

  return (
    <>
      <div id="tour-carousel">
        <HomeCarousel score={empty ? null : score} progress={progress} />
        {progress && empty ? (
          <p className="mt-2 text-center text-[12.5px] font-semibold text-ink-soft">
            Answer a few questions and your readiness score will appear here.
          </p>
        ) : null}
      </div>

      <Link href={`/practice/${weakest}`} className="btn-primary mt-4">
        Start practice <span aria-hidden="true">→</span>
      </Link>

      {/* Stat chips */}
      <div className="mt-[18px] flex gap-2.5" id="tour-chips">
        <button type="button" onClick={() => setSheet("ready")} className={chip}>
          <div className="flex min-h-[2.4em] items-start text-[11px] font-bold leading-tight text-ink-soft">
            Days to ready
          </div>
          <div className="mt-1 text-[17px] font-extrabold tracking-[-0.3px] text-ink">
            {daysToReady == null
              ? "—"
              : daysToReady === 0
                ? "Ready!"
                : `~${daysToReady}`}
          </div>
        </button>

        {weakestUnlocked ? (
          <button
            type="button"
            onClick={() => setSheet("weakest")}
            className={chip}
          >
            <div className="flex min-h-[2.4em] items-start text-[11px] font-bold leading-tight text-ink-soft">
              Weakest area
            </div>
            <div className="mt-1 text-[13.5px] font-extrabold leading-tight text-purple-deep">
              {ranked[0] ? TOPIC_LABEL.get(ranked[0].key) : "—"}
            </div>
          </button>
        ) : (
          <div className={`${chip} opacity-80`} aria-disabled="true">
            <div className="flex min-h-[2.4em] items-start text-[11px] font-bold leading-tight text-ink-soft">
              Weakest area 🔒
            </div>
            <div className="mt-1 text-[11.5px] font-bold leading-tight text-ink-soft">
              Keep practising to unlock
            </div>
          </div>
        )}

        {hasTestDate ? (
          <div className={chip}>
            <div className="flex min-h-[2.4em] items-start text-[11px] font-bold leading-tight text-ink-soft">
              Days till exam
            </div>
            <div
              className={`mt-1 text-[17px] font-extrabold tracking-[-0.3px] ${
                daysTillExam != null && daysTillExam < 0 ? "text-ink-soft" : "text-ink"
              }`}
            >
              {daysTillExam == null ? "—" : daysTillExam < 0 ? "Past" : daysTillExam}
            </div>
          </div>
        ) : (
          <Link href="/profile" className={chip}>
            <div className="flex min-h-[2.4em] items-start text-[11px] font-bold leading-tight text-ink-soft">
              Days till exam
            </div>
            <div className="mt-1 text-[13.5px] font-extrabold leading-tight text-purple-deep">
              Set a date →
            </div>
          </Link>
        )}
      </div>

      {/* Days-to-ready detail sheet */}
      {sheet === "ready" ? (
        <Sheet title="Days to ready" onClose={() => setSheet(null)}>
          <div className="mt-2 space-y-2.5 text-sm font-medium leading-relaxed text-ink-soft">
            {score == null ? (
              <p>
                Answer at least 10 questions and we&apos;ll estimate how many
                days of study you need to reach the {TARGET}% safe zone.
              </p>
            ) : (
              <>
                <p>
                  Your readiness is {score}%. The safe-to-book zone is {TARGET}%.
                  Each point below that takes roughly 12 minutes of focused
                  study — about {minsLeft ?? 0} min (
                  {Math.round((minsLeft ?? 0) / 6) / 10} h) left.
                </p>
                <p>
                  At your daily goal of {goalMinutes} min/day that&apos;s{" "}
                  {daysToReady === 0
                    ? "0 days — you're there"
                    : `~${daysToReady ?? 0} days`}
                  .
                </p>
                {daysTillExam != null && daysTillExam >= 0 && daysToReady != null ? (
                  <p>
                    Your test is in {daysTillExam} days.{" "}
                    {daysToReady <= daysTillExam
                      ? "This pace has you covered. 💪"
                      : "Consider a few more minutes per day to be safe. ⏰"}
                  </p>
                ) : null}
              </>
            )}
          </div>
        </Sheet>
      ) : null}

      {/* Weakest-areas detail sheet */}
      {sheet === "weakest" ? (
        <Sheet title="Your weakest areas" onClose={() => setSheet(null)}>
          <p className="mt-1 text-[12.5px] font-medium text-ink-soft">
            Ranked by your accuracy so far — focus here for the fastest gains.
          </p>
          {ranked.slice(0, 3).map((c, i) => (
            <div key={c.key} className="mt-3 rounded-2xl bg-[#F7F5FC] p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[13.5px] font-extrabold text-ink">
                  {i + 1}. {TOPIC_LABEL.get(c.key)}
                </span>
                <span
                  className={`text-[13px] font-extrabold ${
                    c.pct >= 75 ? "text-[#137A3B]" : c.pct >= 40 ? "text-[#B07A18]" : "text-[#B93B3B]"
                  }`}
                >
                  {c.pct}%
                </span>
              </div>
              <div className="mt-2 flex gap-2">
                <Link
                  href="/learn"
                  onClick={() => setSheet(null)}
                  className="flex-1 rounded-full bg-white px-3 py-1.5 text-center text-xs font-extrabold text-purple-deep"
                >
                  📖 Study
                </Link>
                <Link
                  href={`/practice/${c.key}`}
                  onClick={() => setSheet(null)}
                  className="flex-1 rounded-full bg-white px-3 py-1.5 text-center text-xs font-extrabold text-purple-deep"
                >
                  🎯 Practise
                </Link>
              </div>
            </div>
          ))}
        </Sheet>
      ) : null}
    </>
  );
}
