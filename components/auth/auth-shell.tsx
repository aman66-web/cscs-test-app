"use client";

import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";

// The auth screens share a self-contained look (purple + warm gradient +
// Plus Jakarta Sans), mirroring the My Life in the UK Test app's auth shell.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Palette shared by all auth screens (raw values so they stay exact).
export const INK = "#1C1917";
export const INK_SOFT = "#57534E";
export const PURPLE_DEEP = "#C2410C";

const SCREEN_BG =
  "radial-gradient(90% 40% at 12% 8%, #FFE6D0 0%, rgba(255,230,208,0) 52%)," +
  "radial-gradient(90% 50% at 100% 22%, #FDEAD3 0%, rgba(232,222,255,0) 58%)," +
  "linear-gradient(180deg,#FBF5F0 0%,#FBF3EA 48%,#FBF3EA 100%)";

export type FloatingChip = {
  top: number;
  left?: number;
  right?: number;
  size: number;
  fontSize: number;
  bg: string;
  duration: number;
  emoji: string;
};

export type FloatingDot = {
  top: number;
  left?: number;
  right?: number;
  size: number;
  bg: string;
};

// ---- App logo: brand-purple rounded square with a safety check -------------
function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 44" className={className} aria-hidden="true">
      <rect width="44" height="44" rx="13" fill="url(#lgAuth)" />
      <path
        d="M14 23l5.5 5.5L31 16"
        stroke="#fff"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id="lgAuth"
          x1="0"
          y1="0"
          x2="44"
          y2="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F97316" />
          <stop offset="1" stopColor="#C2410C" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/**
 * Full-screen scaffold for the auth pages: warm gradient background, floating
 * emoji chips + orbit arcs behind the header, back button, logo + headline,
 * and a frosted white bottom sheet that holds the form (children).
 */
export function AuthShell({
  title,
  subtitle,
  chips,
  dots,
  children,
}: {
  title: React.ReactNode;
  subtitle: string;
  chips: FloatingChip[];
  dots: FloatingDot[];
  children: React.ReactNode;
}) {
  return (
    <main
      // overflow-x-hidden on the OUTERMOST auth wrapper is the definitive
      // backstop: whatever the decorative layer does, this screen can never
      // scroll or drag sideways (hidden is honoured by iOS WebKit; clip is not).
      className={`${jakarta.className} relative flex min-h-dvh w-full max-w-[100vw] flex-col overflow-x-hidden`}
      style={{ background: SCREEN_BG, color: INK }}
    >
      <style>{`
        @keyframes authBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
        @keyframes authPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
      `}</style>

      <div className="relative mx-auto flex w-full max-w-[420px] flex-1 flex-col overflow-x-hidden">
        {/* Floating decor behind the header. overflow-hidden clips the
            oversized orbit rings so they can't push the page wider. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[270px] overflow-hidden"
        >
          <span className="absolute left-1/2 top-[-140px] h-[420px] w-[420px] -translate-x-1/2 rounded-full border-[1.5px] border-[rgba(249, 115, 22,0.13)]" />
          <span className="absolute left-1/2 top-[-60px] h-[260px] w-[260px] -translate-x-1/2 rounded-full border-[1.5px] border-[rgba(249, 115, 22,0.13)]" />
          {chips.map((c, i) => (
            <span
              key={i}
              className="absolute flex items-center justify-center rounded-full border-[3px] border-white shadow-[0_10px_22px_-8px_rgba(28, 25, 23,0.35)]"
              style={{
                top: c.top,
                left: c.left,
                right: c.right,
                width: c.size,
                height: c.size,
                fontSize: c.fontSize,
                background: c.bg,
                animation: `authBob ${c.duration}s ease-in-out infinite`,
              }}
            >
              <span className="leading-none">{c.emoji}</span>
            </span>
          ))}
          {dots.map((d, i) => (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                top: d.top,
                left: d.left,
                right: d.right,
                width: d.size,
                height: d.size,
                background: d.bg,
              }}
            />
          ))}
        </div>

        {/* Top bar */}
        <div
          className="relative z-[7] flex items-center px-[22px]"
          style={{ paddingTop: "max(46px, env(safe-area-inset-top))" }}
        >
          <Link
            href="/"
            aria-label="Back"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[rgba(28, 25, 23,0.08)] bg-white/80 backdrop-blur-[6px] transition hover:bg-white"
          >
            <svg width="9" height="16" viewBox="0 0 9 16" fill="none" aria-hidden="true">
              <path
                d="M8 1 1 8l7 7"
                stroke={INK}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>

        {/* Header */}
        <div className="relative z-[5] px-[26px] text-center">
          <span
            className="mx-auto mt-0.5 block h-[62px] w-[62px]"
            style={{
              animation: "authPulse 5s ease-in-out infinite",
              filter: "drop-shadow(0 12px 24px rgba(249, 115, 22,.4))",
            }}
          >
            <Logo className="h-[62px] w-[62px]" />
          </span>
          <h1 className="mt-3.5 text-[27px] font-extrabold tracking-[-0.8px]">
            {title}
          </h1>
          <p
            className="mt-[7px] break-words text-sm font-medium"
            style={{ color: INK_SOFT }}
          >
            {subtitle}
          </p>
        </div>

        {/* Frosted bottom sheet with the form */}
        <div
          className="relative z-[6] mx-4 mt-5 flex flex-1 flex-col rounded-t-[28px] border border-white/90 bg-white/85 px-[22px] pt-6 shadow-[0_-18px_44px_-22px_rgba(28, 25, 23,0.35)] backdrop-blur-[10px]"
          style={{ paddingBottom: "max(20px, env(safe-area-inset-bottom))" }}
        >
          {children}
        </div>
      </div>
    </main>
  );
}
