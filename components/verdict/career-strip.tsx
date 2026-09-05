"use client";

import { useEffect, useState } from "react";
import { careerStats, type CareerStats } from "@/lib/verdict/storage";

// =============================================================================
// The record, such as it is in Milestone 1.
//
// No accounts, no rating, no ranks — those arrive with Milestone 2. What is
// here is the smallest thing that makes a second trial feel like it counts:
// trials argued, win rate, witnesses broken, and the streak. "Cracks forced" is
// deliberately given equal billing to wins, because that is the number this
// game actually wants players chasing.
//
// Reads localStorage on mount only, so the server render and the first client
// render agree and React never has to reconcile a hydration mismatch.
// =============================================================================

export function CareerStrip() {
  const [stats, setStats] = useState<CareerStats | null>(null);

  useEffect(() => {
    setStats(careerStats());
  }, []);

  if (!stats || stats.trials === 0) return null;

  const items: [string, string][] = [
    ["Trials", String(stats.trials)],
    ["Won", `${stats.winRate}%`],
    ["Cracked", String(stats.cracks)],
    ["Streak", stats.streak > 0 ? `${stats.streak}d` : "—"],
  ];

  return (
    <div className="vd-card vd-card-brass">
      <div className="grid grid-cols-4 gap-2">
        {items.map(([label, value]) => (
          <div key={label} className="text-center">
            <p className="vd-display text-2xl">{value}</p>
            <p className="vd-faint mt-0.5 text-[11px] font-semibold uppercase tracking-wider">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
