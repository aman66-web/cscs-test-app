"use client";

import { useEffect, useState } from "react";
import {
  initReviewState,
  markDeclined,
  markReviewed,
  markShown,
  onReviewRequest,
  openFeedbackEmail,
  triggerNativeReview,
} from "@/lib/review/review-prompt";

type Step = "ask" | "positive" | "negative";

/**
 * Global, self-contained review prompt. Mounted once in the root layout; stays
 * invisible until lib/review fires a request at a positive moment (and only
 * when all the throttle rules pass — native, not first launch, cool-down, cap).
 * Cloned from the My Life in the UK Test app's review-gate.tsx, minus i18n.
 *
 * Flow (App Store compliant):
 *   ask      →  "Enjoying it?"  👍 / 👎
 *   positive →  warm framing, then Apple's OFFICIAL StoreKit prompt
 *   negative →  a private feedback email (never the store)
 */
export function ReviewGate() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("ask");

  useEffect(() => {
    initReviewState();
    return onReviewRequest(() => {
      setStep("ask");
      setOpen(true);
      markShown(); // count the ask + start the cool-down immediately
    });
  }, []);

  if (!open) return null;

  function close() {
    setOpen(false);
  }

  async function leaveReview() {
    markReviewed(); // once we hand off to Apple's prompt, never ask again
    close();
    await triggerNativeReview(); // SKStoreReviewController — the official dialog
  }

  function sendFeedback() {
    markDeclined();
    close();
    openFeedbackEmail(
      "CSCS Test App — feedback",
      "Hi team, here's what I think could be better:"
    );
  }

  return (
    <div
      className="fixed inset-0 z-[95] flex items-end justify-center bg-ink/50 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={close}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-t-[26px] bg-white px-6 pb-[max(1.75rem,env(safe-area-inset-bottom))] pt-7 text-center shadow-[0_-18px_44px_-20px_rgba(33,27,78,0.45)] sm:rounded-[26px] sm:pb-7"
        onClick={(e) => e.stopPropagation()}
      >
        {step === "ask" ? (
          <>
            <div className="text-[46px] leading-none" aria-hidden="true">
              💜
            </div>
            <h2 className="mt-3 text-[20px] font-extrabold tracking-[-0.4px] text-ink">
              Enjoying CSCS Test App?
            </h2>
            <p className="mx-auto mt-1.5 max-w-[300px] text-[13.5px] font-medium leading-relaxed text-ink-soft">
              You&apos;re making brilliant progress 🎉
            </p>
            <div className="mt-6 space-y-2.5">
              <button
                type="button"
                onClick={() => setStep("positive")}
                className="btn-primary"
              >
                👍 Loving it
              </button>
              <button
                type="button"
                onClick={() => setStep("negative")}
                className="btn-secondary"
              >
                👎 Not really
              </button>
            </div>
          </>
        ) : null}

        {step === "positive" ? (
          <>
            <div className="text-[46px] leading-none" aria-hidden="true">
              🌟
            </div>
            <h2 className="mt-3 text-[20px] font-extrabold tracking-[-0.4px] text-ink">
              That means a lot! 💜
            </h2>
            <p className="mx-auto mt-1.5 max-w-[300px] text-[13.5px] font-medium leading-relaxed text-ink-soft">
              A quick review helps other learners find us — it only takes a
              moment.
            </p>
            <div className="mt-6 space-y-2.5">
              <button
                type="button"
                onClick={() => void leaveReview()}
                className="btn-primary"
              >
                Leave a review
              </button>
              <button type="button" onClick={close} className="btn-secondary">
                Maybe later
              </button>
            </div>
          </>
        ) : null}

        {step === "negative" ? (
          <>
            <div className="text-[46px] leading-none" aria-hidden="true">
              💛
            </div>
            <h2 className="mt-3 text-[20px] font-extrabold tracking-[-0.4px] text-ink">
              Thanks for your honesty 💛
            </h2>
            <p className="mx-auto mt-1.5 max-w-[300px] text-[13.5px] font-medium leading-relaxed text-ink-soft">
              We&apos;d love to know what we could do better. Tell us and
              we&apos;ll read every word.
            </p>
            <div className="mt-6 space-y-2.5">
              <button
                type="button"
                onClick={sendFeedback}
                className="btn-primary"
              >
                Share feedback
              </button>
              <button type="button" onClick={close} className="btn-secondary">
                No thanks
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
