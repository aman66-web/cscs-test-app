"use client";

import { useRouter } from "next/navigation";

/** Browser-back button for the legal pages (reached from sign-up, Profile, or
    a direct link), so it returns wherever the user came from. Falls back to
    the landing page if there's no history (e.g. opened via a shared URL). */
export function LegalBack() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push("/");
      }}
      aria-label="Back"
      className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full text-ink transition hover:bg-ink/5"
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
        <path
          d="M15 6l-6 6 6 6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
