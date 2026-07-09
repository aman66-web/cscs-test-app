"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MOCK_CONFIG, MOCK_COUNT } from "@/lib/mock/config";
import { getProgress } from "@/lib/progress/local-progress";

/**
 * "Mock tests" section on the Home screen: one card per numbered mock,
 * showing the best score once attempted. Real exam conditions inside.
 * Cloned from the My Life in the UK Test app's mock-section.tsx; the copy
 * reflects the CITB HS&E format (50 questions, pass at 45/50).
 */
export function MockSection() {
  const [bests, setBests] = useState<
    Record<string, { score: number; total: number }>
  >({});

  useEffect(() => {
    setBests(getProgress().mockBests);
  }, []);

  return (
    <section className="mt-6" id="mocks">
      <h2 className="px-1 text-base font-extrabold tracking-[-0.3px] text-ink">
        Mock tests
      </h2>
      <p className="mt-0.5 px-1 text-[12.5px] font-medium text-ink-soft">
        Real exam conditions: {MOCK_CONFIG.questionCount} questions,{" "}
        {MOCK_CONFIG.durationMinutes} minutes, pass at {MOCK_CONFIG.passMark}/
        {MOCK_CONFIG.questionCount}.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2.5">
        {Array.from({ length: MOCK_COUNT }, (_, i) => i + 1).map((n) => {
          const best = bests[String(n)];
          const passed = best && best.score >= MOCK_CONFIG.passMark;
          return (
            <Link
              key={n}
              href={`/mock/${n}`}
              className="rounded-2xl bg-white p-3.5 shadow-[0_10px_24px_-14px_rgba(33,27,78,0.3)] transition hover:bg-[#FDFCFF] active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <span className="text-[14.5px] font-extrabold text-ink">
                  Mock {n}
                </span>
                <span aria-hidden="true">{passed ? "🏆" : "📝"}</span>
              </div>
              <p
                className={`mt-1 text-[11.5px] font-bold ${
                  best
                    ? passed
                      ? "text-[#137A3B]"
                      : "text-[#B93B3B]"
                    : "text-ink-soft"
                }`}
              >
                {best
                  ? `Best ${best.score}/${best.total}${passed ? " ✓" : ""}`
                  : "Not attempted"}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
