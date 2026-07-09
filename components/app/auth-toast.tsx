"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Cloned from the My Life in the UK Test app's auth-toast.tsx, minus i18n
// (English literals instead of t() keys).

const SHOW_MS = 5000;

// ?auth=<key> values the OAuth callback can attach to its destination.
const TOAST_MESSAGES: Record<string, string> = {
  welcomeBack:
    "Welcome back — you already have an account, so we've signed you in.",
  setup:
    "We couldn't find an account with this login — let's get you set up.",
};

function AuthToastInner() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [message, setMessage] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);

  const authParam = params.get("auth");

  useEffect(() => {
    if (!authParam || !(authParam in TOAST_MESSAGES)) return;
    setMessage(TOAST_MESSAGES[authParam]);

    // Strip ?auth= from the URL so a refresh doesn't re-show the toast,
    // preserving any other query params.
    const rest = new URLSearchParams(params.toString());
    rest.delete("auth");
    const qs = rest.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });

    const fade = setTimeout(() => setLeaving(true), SHOW_MS - 400);
    const clear = setTimeout(() => setMessage(null), SHOW_MS);
    return () => {
      clearTimeout(fade);
      clearTimeout(clear);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authParam]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed inset-x-0 z-[90] flex justify-center px-4 transition-all duration-400 ${
        leaving ? "-translate-y-3 opacity-0" : "translate-y-0 opacity-100"
      }`}
      style={{ top: "max(46px, env(safe-area-inset-top))" }}
    >
      <button
        type="button"
        onClick={() => setMessage(null)}
        className="flex max-w-md items-start gap-2.5 rounded-2xl border border-white/80 bg-white/95 px-4 py-3 text-start shadow-[0_18px_40px_-14px_rgba(28, 25, 23,0.45)] backdrop-blur"
      >
        <span aria-hidden="true" className="mt-0.5 flex-none text-[16px]">
          👋
        </span>
        <span className="text-[13.5px] font-bold leading-snug text-ink">
          {message}
        </span>
      </button>
    </div>
  );
}

/**
 * One-shot toast shown when the OAuth callback appends `?auth=` to the
 * destination (e.g. an existing user tapped "Create account" — we sign them
 * in and explain). Auto-dismisses, tap to dismiss.
 */
export function AuthToast() {
  // useSearchParams needs a Suspense boundary when prerendered.
  return (
    <Suspense fallback={null}>
      <AuthToastInner />
    </Suspense>
  );
}
