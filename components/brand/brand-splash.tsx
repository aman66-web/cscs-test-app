"use client";

import { BrandLogo } from "@/components/brand/logo";

// Cloned from the My Life in the UK Test app's brand-splash.tsx; the floating
// chips swap the UK emojis (🇬🇧 👑 📖 ☕) for the construction set used on the
// auth screens.
const CHIPS = [
  { top: "22%", left: "24%", e: "👷", d: "5.6s", delay: "0.2s" },
  { top: "18%", left: "72%", e: "⛑️", d: "6.2s", delay: "0.5s" },
  { top: "72%", left: "20%", e: "🦺", d: "5.9s", delay: "0.35s" },
  { top: "76%", left: "74%", e: "🚧", d: "6.5s", delay: "0.1s" },
];

/**
 * Full-screen brand moment: the logo pops in inside a slowly rotating
 * orbit ring with floating emoji chips, a label fades up and a progress
 * bar sweeps. Used after finishing setup ("Personalising your
 * dashboard…"). Purely decorative — the caller decides how long it stays
 * on screen.
 */
export function BrandSplash({
  label,
  sublabel,
}: {
  label: string;
  sublabel?: string;
}) {
  return (
    <main className="screen-bg fixed inset-0 z-[80] flex flex-col items-center justify-center overflow-hidden px-8">
      <div className="relative h-[280px] w-[280px]">
        {/* Rotating orbit ring + dots */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full border-2 border-dashed border-[rgba(124,58,237,0.25)]"
          style={{ animation: "splashSpin 14s linear infinite" }}
        >
          <span className="absolute -top-1.5 left-1/2 h-3 w-3 rounded-full bg-[#FFC24B]" />
          <span className="absolute -bottom-1 left-[18%] h-2.5 w-2.5 rounded-full bg-[#4ADE80]" />
          <span className="absolute right-[6%] top-[24%] h-2 w-2 rounded-full bg-[#F472B6]" />
        </div>

        {/* Soft glow */}
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 h-[190px] w-[190px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(124,58,237,0.18) 0%, rgba(124,58,237,0) 65%)",
          }}
        />

        {/* Floating chips */}
        {CHIPS.map((c) => (
          <span
            key={c.e}
            aria-hidden="true"
            className="absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-white bg-white text-[22px]"
            style={{
              top: c.top,
              left: c.left,
              boxShadow: "0 12px 24px -10px rgba(33,27,78,0.4)",
              animation: `splashBob ${c.d} ease-in-out infinite`,
              animationDelay: c.delay,
            }}
          >
            {c.e}
          </span>
        ))}

        {/* Logo pop */}
        <span
          className="absolute left-1/2 top-1/2 h-[92px] w-[92px] -translate-x-1/2 -translate-y-1/2"
          style={{ filter: "drop-shadow(0 16px 28px rgba(124,58,237,0.45))" }}
        >
          <span
            className="block h-full w-full"
            style={{ animation: "splashPop 700ms cubic-bezier(0.2, 0.9, 0.3, 1.2) both" }}
          >
            <BrandLogo className="h-full w-full" />
          </span>
        </span>
      </div>

      {/* Label + progress sweep */}
      <div
        className="mt-8 w-full max-w-[280px] text-center"
        style={{ animation: "splashFadeUp 600ms ease-out 250ms both" }}
      >
        <p className="text-[17px] font-extrabold tracking-[-0.3px] text-ink">
          {label}
        </p>
        {sublabel ? (
          <p className="mt-1 text-[13px] font-semibold text-ink-soft">{sublabel}</p>
        ) : null}
        <div className="mx-auto mt-5 h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,#8B4BF5,#6D28D9)]"
            style={{ animation: "splashBar 2.1s ease-in-out both" }}
          />
        </div>
      </div>
    </main>
  );
}
