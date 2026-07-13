"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  grantCoachConsent,
  hasCoachConsent,
} from "@/lib/coach/consent";

/**
 * One-time consent state for the AI coach. `ready` is false until the effect
 * has read the stored value post-mount (avoids an SSR/hydration mismatch on
 * the localStorage read); gates should only act once ready.
 */
export function useCoachConsent() {
  const [consented, setConsented] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setConsented(hasCoachConsent());
    setReady(true);
  }, []);

  function accept() {
    grantCoachConsent();
    setConsented(true);
  }

  return { consented, ready, accept };
}

/**
 * The disclosure shown before the very first message can be sent to the coach.
 * States plainly that messages go to Anthropic to generate replies, and that no
 * name/contact details are shared (matches the coach route + privacy policy).
 */
export function CoachConsentNotice({
  onAccept,
  className = "",
}: {
  onAccept: () => void;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-ink/10 bg-white p-4 shadow-[0_12px_26px_-18px_rgba(28,25,23,0.3)] ${className}`}
    >
      <p className="text-[14px] font-extrabold tracking-[-0.2px] text-ink">
        Before you chat with David
      </p>
      <p className="mt-1.5 text-[12.5px] font-medium leading-relaxed text-ink-soft">
        Your messages and a short summary of your study progress are sent to{" "}
        <span className="font-semibold text-ink">Anthropic</span>, our AI
        provider, to generate David&rsquo;s replies. We don&rsquo;t share your
        name or contact details. See our{" "}
        <Link href="/privacy" className="font-semibold text-purple-deep underline">
          Privacy Policy
        </Link>
        .
      </p>
      <button
        type="button"
        onClick={onAccept}
        className="mt-3 flex h-11 w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#F97316,#C2410C)] text-[14px] font-extrabold text-white shadow-[0_10px_20px_-8px_rgba(249,115,22,0.7)] transition active:scale-[0.98]"
      >
        Got it — start chatting
      </button>
    </div>
  );
}
