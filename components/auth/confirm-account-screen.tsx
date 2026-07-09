"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { discardNewAccount } from "@/app/auth/confirm-account/actions";
import { BrandLogo } from "@/components/brand/logo";

/**
 * Interstitial shown after a brand-new Google/Apple sign-in: "No account found
 * — would you like to create one?". Continue keeps the just-created account and
 * proceeds to onboarding; Cancel deletes it and returns to sign-in, so tapping
 * a social button by mistake never leaves an unwanted account behind.
 */
export function ConfirmAccountScreen({
  providerLabel,
  email,
}: {
  providerLabel: string;
  email: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<null | "continue" | "cancel">(null);

  function keepAndContinue() {
    setPending("continue");
    router.replace("/onboarding");
    router.refresh();
  }

  async function cancel() {
    setPending("cancel");
    try {
      await discardNewAccount();
    } catch {
      // Even if the delete failed, we've asked to leave — sign-in is the safe
      // destination (the server also signed out).
    }
    router.replace("/sign-in");
    router.refresh();
  }

  const idLabel =
    providerLabel === "Apple"
      ? "Apple ID"
      : providerLabel === "Google"
        ? "Google account"
        : "login";

  return (
    <main className="screen-bg flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 pb-safe pt-safe text-center">
        <BrandLogo className="h-16 w-16" />

        <h1 className="mt-6 text-[24px] font-extrabold leading-[1.15] tracking-[-0.6px] text-ink">
          No account found
        </h1>
        <p className="mt-2 max-w-[320px] text-sm font-medium leading-relaxed text-ink-soft">
          We couldn&apos;t find an existing account for this {idLabel}
          {email ? (
            <>
              {" "}
              (<span className="font-bold text-ink">{email}</span>)
            </>
          ) : null}
          . Would you like to create one and start preparing for your CSCS test?
        </p>

        <div className="mt-8 w-full max-w-[340px] space-y-3">
          <button
            type="button"
            onClick={keepAndContinue}
            disabled={pending !== null}
            className="btn-primary"
          >
            {pending === "continue" ? "One moment…" : (
              <>
                Create my account <span aria-hidden="true">→</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => void cancel()}
            disabled={pending !== null}
            className="btn-secondary"
          >
            {pending === "cancel" ? "Cancelling…" : "Cancel"}
          </button>
        </div>

        <p className="mt-6 max-w-[300px] text-[11.5px] font-medium leading-relaxed text-ink-soft">
          Cancelling won&apos;t keep any account or data — you&apos;ll go back to
          the sign-in screen.
        </p>
      </div>
    </main>
  );
}
