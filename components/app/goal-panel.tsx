"use client";

import { useEffect, useState } from "react";
import { currentStreak, minutesToday } from "@/lib/progress/local-progress";

/**
 * "Today's goal" card (prototype .panel): minutes studied today against the
 * daily goal, plus the streak row. Reads the local progress store on mount
 * (localStorage — see lib/progress/local-progress.ts for the backend plan).
 * Cloned from the My Life in the UK Test app's goal-panel.tsx.
 */
export function GoalPanel({ goalMinutes }: { goalMinutes: number }) {
  const [minutes, setMinutes] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setMinutes(minutesToday());
    setStreak(currentStreak());
  }, []);

  const pct = Math.min(100, Math.round((minutes / Math.max(1, goalMinutes)) * 100));

  return (
    <section className="surface-card mt-4" id="tour-goal">
      <h3 className="text-base font-extrabold tracking-[-0.3px] text-ink">
        Today&apos;s goal
      </h3>
      <p className="mt-0.5 text-[12.5px] font-medium text-ink-soft">
        {goalMinutes} min a day keeps your plan on track.
      </p>
      <div className="mt-3 flex items-center gap-3 text-[13.5px] font-semibold text-ink">
        <span className="flex-none text-xl" aria-hidden="true">
          ⏱️
        </span>
        <div className="flex h-2 flex-1 overflow-hidden rounded-[5px] bg-[#F0EDF8]">
          <i
            className="block h-full rounded-[5px] bg-[linear-gradient(90deg,#F97316,#C2410C)]"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span>
          {minutes}/{goalMinutes} min
        </span>
      </div>
      <div className="mt-3 flex items-center gap-3 text-[13.5px] font-semibold text-ink">
        <span className="flex-none text-xl" aria-hidden="true">
          🔥
        </span>
        <span>
          {streak > 0
            ? `${streak}-day streak — don't break it!`
            : "Practise today to start a streak!"}
        </span>
      </div>
    </section>
  );
}
