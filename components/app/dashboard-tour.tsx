"use client";

import { useCallback, useEffect, useState } from "react";
import { hasSeenTour, markTourSeen } from "@/lib/progress/local-progress";

// Cloned from the My Life in the UK Test app's dashboard-tour.tsx, minus i18n.
// The step copy reflects the CSCS numbers (90% pass, 95% safe, 50-question mocks).

type Step = { target: string; title: string; body: string };

const STEPS: Step[] = [
  {
    target: "tour-carousel",
    title: "Your readiness score",
    body: "This gauge estimates how ready you are for the real test. Swipe it to see your progress over time — 90% is the pass mark, 95%+ is the safe zone.",
  },
  {
    target: "tour-chips",
    title: "Smart stats",
    body: "Days to ready, your weakest area and your exam countdown live here. Tap any card for the detail behind the number.",
  },
  {
    target: "tour-goal",
    title: "Today's goal",
    body: "A few minutes a day builds a streak — daily practice is the fastest way to pass.",
  },
  {
    target: "mocks",
    title: "Mock tests",
    body: "Ten mocks under real exam conditions: 50 questions, 45 minutes, pass at 45. Your best score is saved on each card.",
  },
  {
    target: "tour-coach",
    title: "Meet David — your AI coach",
    body: "Stuck on anything? David knows the whole HS&E syllabus — and your progress. He's one tap away on the Learn and Practice tabs.",
  },
  {
    target: "tour-tabs",
    title: "Get around",
    body: "Learn the material, practise questions and manage your profile from these tabs. Good luck — you've got this!",
  },
];

const PAD = 8;

/**
 * First-run guided walkthrough of the dashboard: everything darkens except
 * the highlighted element (spotlight cut-out), with a small explainer card
 * per step. Shows ONCE per user (tourSeen in the per-user progress bucket,
 * persisted the moment it starts); Profile → "Replay app walkthrough"
 * re-arms it on demand.
 */
export function DashboardTour() {
  const [step, setStep] = useState<number | null>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    // Give the dashboard a beat to paint before spotlighting. The seen-check
    // runs inside the delay so ProgressScope has set the per-user namespace.
    const id = setTimeout(() => {
      if (hasSeenTour()) return;
      // Persist the moment it STARTS — not just on finish — so leaving
      // mid-tour (swipe-back, app killed) can never make it auto-show again.
      markTourSeen();
      setStep(0);
    }, 600);
    return () => clearTimeout(id);
  }, []);

  const measure = useCallback(() => {
    if (step == null) return;
    const el = document.getElementById(STEPS[step].target);
    setRect(el ? el.getBoundingClientRect() : null);
  }, [step]);

  useEffect(() => {
    if (step == null) return;
    const el = document.getElementById(STEPS[step].target);
    if (!el) {
      // Anchor missing (e.g. layout change) — skip ahead, or finish if it
      // was the last step (the seen flag was already persisted at start).
      if (step + 1 < STEPS.length) setStep(step + 1);
      else finish();
      return;
    }
    // Instant (not smooth) scroll: a smooth scroll made the spotlight box —
    // which used to animate its position — visibly fly across the screen
    // before catching up. Jump the target into view, then measure and let the
    // box fade in on the spot.
    el.scrollIntoView({ block: "center" });
    const id = setTimeout(measure, 160);
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      clearTimeout(id);
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
    };
  }, [step, measure]);

  if (step == null) return null;

  function finish() {
    markTourSeen(); // already set at start; kept as an idempotent safety net
    setStep(null);
  }

  function next() {
    if (step != null && step + 1 < STEPS.length) {
      setRect(null);
      setStep(step + 1);
    } else {
      finish();
    }
  }

  const s = STEPS[step];
  const last = step === STEPS.length - 1;

  // Tooltip placement: below the spotlight when there's room, else above.
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const vw = typeof window !== "undefined" ? window.innerWidth : 360;
  const below = rect ? rect.bottom + PAD + 12 : vh / 2;
  const placeBelow = rect ? below + 220 < vh : true;

  // Clamp the spotlight box to the viewport. The last step targets the tab bar
  // (fixed inset-x-0 = full width), so rect.left-PAD would be -8px and the box
  // 16px wider than the screen. It's position:fixed, which the global
  // overflow-x:hidden can't clip — so it would create real horizontal drag.
  const spot = rect
    ? {
        left: Math.max(0, rect.left - PAD),
        top: rect.top - PAD,
        right: Math.min(vw, rect.right + PAD),
        height: rect.height + PAD * 2,
      }
    : null;

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-label={s.title}>
      {/* Dimmer + spotlight cut-out */}
      {spot ? (
        <div
          // key by step so the reveal replays per step. NO position transition:
          // the box is placed instantly at the measured rect and simply fades +
          // settles in, so it never flies from the previous step's position.
          key={step}
          aria-hidden="true"
          className="pointer-events-none fixed rounded-[22px] border-2 border-white/70 motion-safe:animate-[tourReveal_0.28s_cubic-bezier(0.2,0.7,0.3,1)]"
          style={{
            top: spot.top,
            left: spot.left,
            width: spot.right - spot.left,
            height: spot.height,
            boxShadow: "0 0 0 9999px rgba(20, 15, 50, 0.62)",
          }}
        />
      ) : (
        <div aria-hidden="true" className="fixed inset-0 bg-[rgba(20,15,50,0.62)]" />
      )}

      {/* Click-catcher so taps advance rather than hit the page */}
      <button
        type="button"
        onClick={next}
        aria-label="Next"
        className="fixed inset-0 h-full w-full cursor-default opacity-0"
      />

      {/* Explainer card */}
      <div
        className="fixed left-1/2 w-[min(340px,calc(100vw-32px))] -translate-x-1/2 rounded-[22px] bg-white p-5 shadow-[0_24px_50px_-16px_rgba(20,15,50,0.6)]"
        style={
          placeBelow
            ? { top: Math.min(below, vh - 240) }
            : { bottom: vh - (rect ? rect.top - PAD : vh / 2) + 12 }
        }
      >
        <div className="flex gap-1.5">
          {STEPS.map((_, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={`h-1.5 rounded-full transition-all ${
                i === step ? "w-5 bg-purple" : "w-1.5 bg-ink/15"
              }`}
            />
          ))}
        </div>
        <h3 className="mt-3 text-[16px] font-extrabold tracking-[-0.3px] text-ink">
          {s.title}
        </h3>
        <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-ink-soft">
          {s.body}
        </p>
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={finish}
            className="text-[13px] font-bold text-ink-soft transition hover:text-ink"
          >
            Skip tour
          </button>
          <button
            type="button"
            onClick={next}
            className="btn-primary ms-auto !h-11 !w-auto px-6 !text-sm"
          >
            {last ? "Let's go!" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
