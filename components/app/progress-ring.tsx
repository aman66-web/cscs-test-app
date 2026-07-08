"use client";

import { useEffect, useState } from "react";

/**
 * Generic circular progress ring. Animates the fill from 0 on mount via a
 * stroke-dashoffset transition. Used by the results screen and module cards.
 */
export function ProgressRing({
  percent,
  size = 72,
  strokeWidth = 8,
  ringClassName = "text-purple",
  trackClassName = "text-[#E4DFF2]",
  children,
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
  ringClassName?: string;
  trackClassName?: string;
  children?: React.ReactNode;
}) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(Math.max(0, Math.min(100, percent))));
    return () => cancelAnimationFrame(id);
  }, [percent]);

  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={strokeWidth}
          className={trackClassName}
          stroke="currentColor"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={ringClassName}
          stroke="currentColor"
          strokeDasharray={c}
          strokeDashoffset={c - (shown / 100) * c}
          style={{ transition: "stroke-dashoffset 700ms ease-out" }}
        />
      </svg>
      {children ? <div className="absolute inset-0 flex items-center justify-center">{children}</div> : null}
    </div>
  );
}
