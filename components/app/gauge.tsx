"use client";

import { useEffect, useState } from "react";

// Readiness gauge — a 220° open arc. Ported from the My Life in the UK Test
// app and re-tuned to the CSCS exam bar: gold tick at the 90% pass mark, green
// tick at the 95% "safe zone".
export const PASS_MARK = 90;
export const SAFE_ZONE = 95;

const CX = 140;
const CY = 140;
const R = 112;
const START = 200;
const END = -20;

function pt(deg: number): [number, number] {
  const r = (deg * Math.PI) / 180;
  return [CX + R * Math.cos(r), CY - R * Math.sin(r)];
}
function arcPath(from: number, to: number): string {
  const [x1, y1] = pt(from);
  const [x2, y2] = pt(to);
  const large = from - to > 180 ? 1 : 0;
  return `M${x1} ${y1} A${R} ${R} 0 ${large} 1 ${x2} ${y2}`;
}
function deg(pct: number): number {
  return START - (START - END) * (pct / 100);
}

function Tick({ pct, color }: { pct: number; color: string }) {
  const a = deg(pct);
  const r = (a * Math.PI) / 180;
  const inner = R - 13;
  const outer = R + 13;
  const x1 = CX + inner * Math.cos(r);
  const y1 = CY - inner * Math.sin(r);
  const x2 = CX + outer * Math.cos(r);
  const y2 = CY - outer * Math.sin(r);
  const lx = CX + (R + 26) * Math.cos(r);
  const ly = CY - (R + 26) * Math.sin(r);
  return (
    <>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={4} strokeLinecap="round" />
      <text x={lx} y={ly} textAnchor="middle" fontSize={11} fontWeight={800} fill={color}>
        {pct}
      </text>
    </>
  );
}

export function Gauge({ score }: { score: number | null }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(score ?? 0));
    return () => cancelAnimationFrame(id);
  }, [score]);

  const full = arcPath(START, END);

  return (
    <div className="relative mx-auto mt-2 w-[280px] max-w-full">
      <svg viewBox="0 0 280 200" className="overflow-visible">
        <defs>
          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="280" y2="0" gradientUnits="userSpaceOnUse">
            <stop stopColor="#8B4BF5" />
            <stop offset="1" stopColor="#6D28D9" />
          </linearGradient>
        </defs>
        <path d={full} fill="none" stroke="#E4DFF2" strokeWidth={18} strokeLinecap="round" />
        {score != null ? (
          <path
            d={full}
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth={18}
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={100}
            strokeDashoffset={100 - shown}
            style={{ transition: "stroke-dashoffset 900ms ease-out" }}
          />
        ) : null}
        <Tick pct={PASS_MARK} color="#E5A93C" />
        <Tick pct={SAFE_ZONE} color="#22B268" />
      </svg>

      <div className="pointer-events-none absolute inset-x-0 top-[52%] text-center">
        <span className="text-[44px] font-extrabold leading-none tracking-[-1.5px] text-ink">
          {score == null ? "—" : score}
          {score != null ? <span className="text-xl font-extrabold text-ink-soft">%</span> : null}
        </span>
        <div className="mt-1 text-[12.5px] font-bold text-ink-soft">readiness</div>
      </div>
    </div>
  );
}

export function GaugeLegend() {
  return (
    <div className="mt-1 flex justify-center gap-4 text-[11.5px] font-bold text-ink-soft">
      <span className="flex items-center gap-1.5">
        <span className="h-[9px] w-[9px] rounded-full bg-gold" /> Pass mark {PASS_MARK}%
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-[9px] w-[9px] rounded-full bg-good" /> Safe zone {SAFE_ZONE}%
      </span>
    </div>
  );
}
