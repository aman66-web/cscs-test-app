"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n/language-provider";

// Signed-out landing carousel. Cloned in structure from the My Life in the UK
// Test app's landing-carousel.tsx and re-themed for CSCS (construction palette,
// hard-hat logo, HS&E slides). UI strings are translated via t(); the sample
// question stays English (it represents real test content).

const N = 4;

// ---- Hard-hat logo (matches the app icon) ----------------------------------
function Logo({ className, big }: { className?: string; big?: boolean }) {
  const id = big ? "lgBig" : "lgSmall";
  return (
    <svg viewBox="0 0 44 44" className={className} aria-hidden="true">
      <rect width="44" height="44" rx="13" fill={`url(#${id})`} />
      <rect x="7.5" y="27.5" width="29" height="5" rx="2.5" fill="#F97316" />
      <path d="M12.5 28a9.5 9.5 0 0 1 19 0z" fill="#F97316" />
      <rect x="14" y="21" width="16" height="3.4" rx="1.7" fill="#FACC15" />
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#292524" />
          <stop offset="1" stopColor="#1C1917" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const CHIPS = [
  { top: "10%", left: "50%", size: 58, fs: 30, bg: "#fff", d: 6, e: "👷" },
  { top: "22%", left: "78%", size: 52, fs: 26, bg: "#FFE1E1", d: 7, e: "⛑️" },
  { top: "50%", left: "90%", size: 48, fs: 23, bg: "#FEF3E2", d: 6.4, e: "🦺" },
  { top: "78%", left: "78%", size: 54, fs: 27, bg: "#FFF0D6", d: 6.8, e: "🚧" },
  { top: "90%", left: "50%", size: 48, fs: 23, bg: "#E1F6E7", d: 6.2, e: "🏗️" },
  { top: "78%", left: "22%", size: 52, fs: 26, bg: "#FFF0D6", d: 5.8, e: "🔨" },
  { top: "50%", left: "10%", size: 50, fs: 25, bg: "#FDEAD3", d: 7.2, e: "🧱" },
  { top: "22%", left: "22%", size: 50, fs: 25, bg: "#FBEAD2", d: 5.6, e: "⚠️" },
];

const ORBIT_DOTS = [
  { top: "16%", left: "70%", s: 11, bg: "#FACC15" },
  { top: "80%", left: "32%", s: 9, bg: "#4ADE80" },
  { top: "34%", left: "20%", s: 8, bg: "#F97316" },
  { top: "66%", left: "80%", s: 10, bg: "#FDBA74" },
];

function SlideCopy({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="pb-2 text-center">
      <h2
        className="text-[29px] font-extrabold leading-[1.08] tracking-[-1px]"
        style={{ color: "#1C1917" }}
      >
        {title}
      </h2>
      <p
        className="mx-auto mt-[11px] max-w-[300px] text-[14.5px] font-medium leading-[1.5]"
        style={{ color: "#57534E" }}
      >
        {sub}
      </p>
    </div>
  );
}

export function LandingCarousel({
  onChangeLanguage,
}: {
  onChangeLanguage?: () => void;
} = {}) {
  const { t } = useI18n();
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const pausedRef = useRef(false);
  const resumeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function currentIndex() {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return 0;
    return Math.round(el.scrollLeft / el.clientWidth);
  }

  function pause() {
    pausedRef.current = true;
    if (resumeRef.current) clearTimeout(resumeRef.current);
    resumeRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, 6000);
  }

  function goTo(i: number) {
    pause();
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }

  useEffect(() => {
    const id = setInterval(() => {
      if (pausedRef.current) return;
      const el = trackRef.current;
      if (!el) return;
      const next = (currentIndex() + 1) % N;
      el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    }, 3800);
    return () => clearInterval(id);
  }, []);

  return (
    <main
      className="screen-bg relative flex min-h-dvh w-full max-w-[100vw] flex-col overflow-x-hidden"
      style={{ color: "#1C1917" }}
    >
      <style>{`
        .landing-track::-webkit-scrollbar{display:none}
        @keyframes landingBob{0%,100%{transform:translate(-50%,-50%) translateY(0)}50%{transform:translate(-50%,-50%) translateY(-8px)}}
        @keyframes landingPulse{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.05)}}
      `}</style>

      <div className="flex flex-1 flex-col" style={{ paddingTop: "max(46px, env(safe-area-inset-top))" }}>
        {/* Top bar: brand + Help */}
        <div className="flex items-center justify-between px-6 pt-3">
          <div className="flex min-w-0 items-center gap-2">
            {onChangeLanguage ? (
              <button
                type="button"
                onClick={onChangeLanguage}
                aria-label={t("lang.change")}
                className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-white/75 shadow-[0_8px_18px_-12px_rgba(28,25,23,0.45)] transition hover:bg-white active:scale-[0.97]"
                style={{ color: "#1C1917" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </button>
            ) : null}
            <Logo className="h-[26px] w-[26px] flex-none" />
            <span
              className="min-w-0 truncate text-[15px] font-extrabold tracking-[-0.3px]"
              style={{ color: "#1C1917" }}
            >
              {t("landing.appName")}
            </span>
          </div>
          <a
            href="mailto:support@cscstestapp.com"
            className="ms-2 flex-none text-[15px] font-bold"
            style={{ color: "#1C1917" }}
          >
            {t("landing.help")}
          </a>
        </div>

        {/* Progress segments */}
        <div className="flex gap-[7px] px-6 pb-1 pt-4">
          {Array.from({ length: N }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="h-[5px] flex-1 rounded-[3px] transition-colors"
              style={{ background: i === index ? "#F97316" : "rgba(28,25,23,.12)" }}
            />
          ))}
        </div>

        {/* Slides */}
        <div
          ref={trackRef}
          onScroll={() => setIndex(currentIndex())}
          onPointerDown={pause}
          onTouchStart={pause}
          onWheel={pause}
          className="landing-track flex flex-1 snap-x snap-mandatory overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {/* SLIDE 1 — Welcome / orbit */}
          <section className="flex flex-[0_0_100%] snap-start flex-col px-7 pb-1 pt-1.5">
            <div className="relative flex min-h-0 flex-1 items-center justify-center">
              <div className="relative h-[302px] w-[302px]">
                <div
                  className="absolute left-1/2 top-1/2 h-[210px] w-[210px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ background: "radial-gradient(circle,rgba(249,115,22,.16) 0%,rgba(249,115,22,0) 65%)" }}
                />
                <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-[rgba(249,115,22,.16)]" />
                <div className="absolute left-1/2 top-1/2 h-[196px] w-[196px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-[rgba(249,115,22,.16)]" />

                {ORBIT_DOTS.map((d, i) => (
                  <span
                    key={i}
                    className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{ top: d.top, left: d.left, width: d.s, height: d.s, background: d.bg }}
                  />
                ))}

                <span
                  className="absolute left-1/2 top-1/2 h-[78px] w-[78px] -translate-x-1/2 -translate-y-1/2"
                  style={{
                    animation: "landingPulse 5s ease-in-out infinite",
                    filter: "drop-shadow(0 12px 24px rgba(249,115,22,.4))",
                  }}
                >
                  <Logo big className="h-[78px] w-[78px]" />
                </span>

                {CHIPS.map((c, i) => (
                  <span
                    key={i}
                    className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-white"
                    style={{
                      top: c.top,
                      left: c.left,
                      width: c.size,
                      height: c.size,
                      fontSize: c.fs,
                      background: c.bg,
                      boxShadow: "0 12px 24px -10px rgba(28,25,23,.4)",
                      animation: `landingBob ${c.d}s ease-in-out infinite`,
                    }}
                  >
                    <span className="leading-none">{c.e}</span>
                  </span>
                ))}
              </div>
            </div>
            <SlideCopy title={t("landing.s1t")} sub={t("landing.s1s")} />
          </section>

          {/* SLIDE 2 — Practise (sample question stays English = test content) */}
          <section className="flex flex-[0_0_100%] snap-start flex-col px-7 pb-1 pt-1.5">
            <div className="flex min-h-0 flex-1 items-center justify-center">
              <div className="relative w-[280px]">
                <div
                  className="rounded-[22px] bg-white p-[18px]"
                  style={{ transform: "rotate(-2deg)", boxShadow: "0 18px 40px -18px rgba(28,25,23,.35)" }}
                >
                  <div
                    className="mb-2 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[.4px]"
                    style={{ color: "#F97316" }}
                  >
                    ⛑️ Sample question
                  </div>
                  <div className="mb-3.5 text-[16px] font-bold leading-[1.3]" style={{ color: "#1C1917" }}>
                    What does a red and white sign on site usually tell you?
                  </div>
                  <Opt correct>Something is prohibited</Opt>
                  <Opt>Where the canteen is</Opt>
                  <Opt>Safe to enter freely</Opt>
                </div>
                <div
                  className="absolute -right-1.5 -top-3.5 flex items-center gap-1.5 rounded-[14px] bg-white px-3 py-2 text-[13px] font-bold"
                  style={{ color: "#F97316", boxShadow: "0 14px 30px -12px rgba(28,25,23,.4)" }}
                >
                  +10 XP ⚡
                </div>
              </div>
            </div>
            <SlideCopy title={t("landing.s2t")} sub={t("landing.s2s")} />
          </section>

          {/* SLIDE 3 — Learn */}
          <section className="flex flex-[0_0_100%] snap-start flex-col px-7 pb-1 pt-1.5">
            <div className="flex min-h-0 flex-1 items-center justify-center">
              <div className="w-[296px]">
                <Chapter ic="🏗️" bg="#E3F8EA" state="Done ✓" done>
                  Working environment
                </Chapter>
                <Chapter ic="🩺" bg="#FEF3E2" state="60%">
                  Occupational health
                </Chapter>
                <Chapter ic="🦺" bg="#FFF0D6" state="Next">
                  Safety on site
                </Chapter>
                <div className="mt-3.5 text-center text-[13px] font-bold" style={{ color: "#F97316" }}>
                  🪧 5 modules · bite-sized lessons
                </div>
              </div>
            </div>
            <SlideCopy title={t("landing.s3t")} sub={t("landing.s3s")} />
          </section>

          {/* SLIDE 4 — Pass */}
          <section className="flex flex-[0_0_100%] snap-start flex-col px-7 pb-1 pt-1.5">
            <div className="flex min-h-0 flex-1 items-center justify-center">
              <div className="relative">
                <div
                  className="w-[230px] rounded-[22px] bg-white px-[22px] py-[26px] text-center"
                  style={{ boxShadow: "0 18px 40px -18px rgba(28,25,23,.35)" }}
                >
                  <div className="text-[44px]">🏆</div>
                  <div className="mt-1.5 text-[30px] font-extrabold tracking-[-.5px]" style={{ color: "#137A3B" }}>
                    You passed!
                  </div>
                  <div className="mt-1 text-[13px] font-semibold" style={{ color: "#57534E" }}>
                    47 / 50 correct — above the 45 pass mark
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-[5px]" style={{ background: "#EAF6EE" }}>
                    <i className="block h-full w-[94%] rounded-[5px]" style={{ background: "#22B268" }} />
                  </div>
                </div>
                {(
                  [
                    { top: "-6px", left: "6px", s: 10, bg: "#FACC15" },
                    { top: "14px", right: "-4px", s: 9, bg: "#F97316" },
                    { bottom: "20px", left: "-6px", s: 8, bg: "#4ADE80" },
                  ] as {
                    top?: string;
                    left?: string;
                    right?: string;
                    bottom?: string;
                    s: number;
                    bg: string;
                  }[]
                ).map((d, i) => (
                  <span
                    key={i}
                    className="absolute rounded-full"
                    style={{ top: d.top, left: d.left, right: d.right, bottom: d.bottom, width: d.s, height: d.s, background: d.bg }}
                  />
                ))}
              </div>
            </div>
            <SlideCopy title={t("landing.s4t")} sub={t("landing.s4s")} />
          </section>
        </div>

        {/* Footer buttons */}
        <div
          className="flex gap-3 px-6 pt-2.5"
          style={{ paddingBottom: "max(26px, env(safe-area-inset-bottom))" }}
        >
          <Link
            href="/sign-in"
            className="flex h-14 min-w-[116px] flex-none items-center justify-center rounded-full px-5 text-base font-bold transition active:scale-[0.99]"
            style={{ background: "#FEF3E2", color: "#C2410C" }}
          >
            {t("landing.signIn")}
          </Link>
          <Link
            href="/sign-up"
            className="flex h-14 flex-1 items-center justify-center gap-2.5 rounded-full text-base font-bold text-white transition active:scale-[0.99]"
            style={{
              background: "linear-gradient(180deg,#F97316,#C2410C)",
              boxShadow: "0 14px 26px -12px rgba(249,115,22,.75)",
            }}
          >
            {t("landing.createAccount")} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}

function Opt({ children, correct }: { children: React.ReactNode; correct?: boolean }) {
  return (
    <div
      className="mt-2 flex items-center gap-2.5 rounded-[13px] px-3.5 py-3 text-[14.5px] font-semibold"
      style={correct ? { background: "#E3F8EA", color: "#137A3B" } : { background: "#F7F1E9", color: "#1C1917" }}
    >
      {children}
      {correct ? <span className="ms-auto text-[15px]">✓</span> : null}
    </div>
  );
}

function Chapter({
  ic,
  bg,
  state,
  done,
  children,
}: {
  ic: string;
  bg: string;
  state: string;
  done?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="mt-[11px] flex items-center gap-3 rounded-2xl bg-white px-[15px] py-[13px]"
      style={{ boxShadow: "0 14px 30px -16px rgba(28,25,23,.32)" }}
    >
      <span
        className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-[11px] text-[19px]"
        style={{ background: bg }}
      >
        {ic}
      </span>
      <span className="text-[14px] font-bold leading-[1.25]" style={{ color: "#1C1917" }}>
        {children}
      </span>
      <span className="ms-auto flex-none text-[12px] font-bold" style={{ color: done ? "#137A3B" : "#F97316" }}>
        {state}
      </span>
    </div>
  );
}
