"use client";

import { useRef, useState } from "react";
import { Gauge, GaugeLegend, PASS_MARK, SAFE_ZONE } from "@/components/app/gauge";
import { todayKey, type LocalProgress } from "@/lib/progress/local-progress";

// Cloned from the My Life in the UK Test app's home-carousel.tsx. The graph's
// reference lines sit at the CSCS marks (90% pass / 95% safe) instead of 75/85.

type DayPoint = { label: string; pct: number };

/** Per-active-day accuracy (last 14 active days) + mock scores, by date. */
function buildPoints(p: LocalProgress): DayPoint[] {
  const byDay = new Map<string, { total: number; correct: number; t: number }>();
  for (const a of p.answerLog) {
    const d = new Date(a.at);
    if (Number.isNaN(d.getTime())) continue;
    // Local-time day key — matches todayKey/streak/minutesToday everywhere
    // else (toISOString would bucket by UTC and misalign for non-UTC users).
    const key = todayKey(d);
    const e = byDay.get(key) ?? { total: 0, correct: 0, t: a.at };
    e.total += 1;
    if (a.correct) e.correct += 1;
    byDay.set(key, e);
  }
  return Array.from(byDay.values())
    .sort((a, b) => a.t - b.t)
    .slice(-14)
    .map((v) => ({
      label: formatDay(v.t),
      pct: Math.round((v.correct / v.total) * 100),
    }));
}

/** Short day label, e.g. "4 Jul". */
function formatDay(t: number): string {
  return new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function ProgressGraph({ points }: { points: DayPoint[] }) {
  const W = 300;
  const H = 170;
  const PAD = { l: 8, r: 8, t: 14, b: 24 };
  const iw = W - PAD.l - PAD.r;
  const ih = H - PAD.t - PAD.b;

  const y = (pct: number) => PAD.t + ih - (pct / 100) * ih;
  const x = (i: number) =>
    PAD.l + (points.length <= 1 ? iw / 2 : (i / (points.length - 1)) * iw);

  const path = points
    .map((pt, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(pt.pct).toFixed(1)}`)
    .join(" ");

  return (
    <div className="mx-auto w-full max-w-[320px]">
      {points.length < 2 ? (
        <div className="flex h-[170px] flex-col items-center justify-center text-center">
          <span className="text-3xl" aria-hidden="true">
            📈
          </span>
          <p className="mt-2 max-w-[220px] text-[12.5px] font-semibold text-ink-soft">
            Practise on a few different days and your progress line will appear
            here.
          </p>
        </div>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Progress over time">
          {/* Pass / safe reference lines */}
          {[
            { pct: PASS_MARK, color: "#E5A93C" },
            { pct: SAFE_ZONE, color: "#22B268" },
          ].map((r) => (
            <g key={r.pct}>
              <line
                x1={PAD.l}
                x2={W - PAD.r}
                y1={y(r.pct)}
                y2={y(r.pct)}
                stroke={r.color}
                strokeOpacity="0.5"
                strokeWidth="1.5"
                strokeDasharray="4 4"
              />
              <text
                x={W - PAD.r}
                y={y(r.pct) - 3}
                textAnchor="end"
                fontSize="9"
                fontWeight="800"
                fill={r.color}
              >
                {r.pct}%
              </text>
            </g>
          ))}
          <path d={path} fill="none" stroke="url(#plGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((pt, i) => (
            <circle key={i} cx={x(i)} cy={y(pt.pct)} r="3.5" fill="#C2410C" stroke="#fff" strokeWidth="1.5" />
          ))}
          {/* First/last date labels */}
          <text x={PAD.l} y={H - 8} fontSize="9.5" fontWeight="700" fill="#57534E">
            {points[0].label}
          </text>
          <text x={W - PAD.r} y={H - 8} textAnchor="end" fontSize="9.5" fontWeight="700" fill="#57534E">
            {points[points.length - 1].label}
          </text>
          <defs>
            <linearGradient id="plGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#F97316" />
              <stop offset="1" stopColor="#C2410C" />
            </linearGradient>
          </defs>
        </svg>
      )}
      <p className="mt-1 text-center text-[12.5px] font-bold text-ink-soft">
        Your scores over time
      </p>
    </div>
  );
}

/**
 * Swipeable Home carousel with dots: slide 1 = readiness gauge, slide 2 =
 * progress-over-time graph (daily practice + mock scores from the local log).
 */
export function HomeCarousel({
  score,
  progress,
}: {
  score: number | null;
  progress: LocalProgress | null;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const points = progress ? buildPoints(progress) : [];

  function onScroll() {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    setIndex(Math.round(Math.abs(el.scrollLeft) / el.clientWidth));
  }

  function goTo(i: number) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div>
      <div
        ref={trackRef}
        onScroll={onScroll}
        className="flex snap-x snap-mandatory overflow-x-auto"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="w-full flex-none snap-start">
          <Gauge score={score} />
          <GaugeLegend />
        </div>
        <div className="flex w-full flex-none snap-start items-center justify-center pt-2">
          <ProgressGraph points={points} />
        </div>
      </div>
      {/* Dots */}
      <div className="mt-2.5 flex justify-center gap-1.5">
        {[0, 1].map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={i === 0 ? "Show readiness gauge" : "Show progress graph"}
            aria-current={index === i}
            className={`h-[7px] rounded-full transition-all ${
              index === i ? "w-[18px] bg-purple" : "w-[7px] bg-ink/15"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
