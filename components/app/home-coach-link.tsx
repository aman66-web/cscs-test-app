import Link from "next/link";

/** Dashboard "Ask your AI coach" entry. Keeps the walkthrough anchor id.
    Cloned from the My Life in the UK Test app's home-coach-link.tsx (no
    i18n, so no client component needed). */
export function HomeCoachLink() {
  return (
    <Link
      href="/coach"
      id="tour-coach"
      className="mt-4 flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-[0_10px_24px_-16px_rgba(33,27,78,0.25)] transition hover:bg-[#FAF9FF] active:scale-[0.99]"
    >
      <span className="flex-none text-lg" aria-hidden="true">
        💬
      </span>
      <span className="min-w-0 flex-1 text-sm font-bold text-ink">
        Ask your AI coach
      </span>
      <span className="text-ink-soft" aria-hidden="true">
        ›
      </span>
    </Link>
  );
}
