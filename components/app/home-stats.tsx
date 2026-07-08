"use client";

import { useEffect, useState } from "react";
import { Gauge, GaugeLegend } from "@/components/app/gauge";
import {
  computeReadinessV2,
  READINESS_COPY,
  type Readiness,
} from "@/lib/readiness/readiness";
import {
  getProgress,
  readinessSamples,
  recentMockPercents,
  distinctAttempted,
  currentStreak,
} from "@/lib/progress/local-progress";

/**
 * The home hero: the readiness gauge + streak / XP / mocks stats. All computed
 * client-side from localStorage after mount (SSR renders a neutral state to
 * avoid a hydration mismatch on clock-dependent values). Mirrors the My Life
 * in the UK Test app's HomeStats.
 */
export function HomeStats({ bankTotal }: { bankTotal: number }) {
  const [ready, setReady] = useState(false);
  const [readiness, setReadiness] = useState<Readiness>({ band: "empty", score: null, sampleSize: 0 });
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [mocks, setMocks] = useState(0);

  useEffect(() => {
    function refresh() {
      const p = getProgress();
      setReadiness(
        computeReadinessV2({
          samples: readinessSamples(p),
          mockPercents: recentMockPercents(p),
          distinctAttempted: distinctAttempted(p),
          bankTotal,
        })
      );
      setStreak(currentStreak(p));
      setXp(p.xp);
      setMocks(p.mocksTaken);
      setReady(true);
    }
    refresh();
    window.addEventListener("cscs-progress", refresh);
    return () => window.removeEventListener("cscs-progress", refresh);
  }, [bankTotal]);

  const copy = READINESS_COPY[readiness.band];

  return (
    <div className="surface-card mt-4">
      <Gauge score={ready ? readiness.score : null} />
      <GaugeLegend />

      <div className="mt-3 text-center">
        <p className="text-sm font-extrabold text-ink">{copy.label}</p>
        <p className="mt-0.5 text-[12.5px] font-medium leading-snug text-ink-soft">{copy.hint}</p>
      </div>

      <div className="mt-4 flex gap-2.5">
        <StatTile emoji="🔥" value={streak} label="DAY STREAK" />
        <StatTile emoji="⚡" value={xp.toLocaleString("en-GB")} label="TOTAL XP" />
        <StatTile emoji="🏆" value={mocks} label="MOCK TESTS" />
      </div>
    </div>
  );
}

function StatTile({ emoji, value, label }: { emoji: string; value: number | string; label: string }) {
  return (
    <div className="min-w-0 flex-1 rounded-2xl bg-[#FAF9FF] px-2.5 py-3.5 text-center">
      <div className="text-xl" aria-hidden="true">
        {emoji}
      </div>
      <div className="mt-1 text-[17px] font-extrabold text-ink">{value}</div>
      <div className="mt-0.5 text-[10.5px] font-bold text-ink-soft">{label}</div>
    </div>
  );
}
