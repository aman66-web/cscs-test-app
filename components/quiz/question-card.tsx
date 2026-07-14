"use client";

import { useRef } from "react";
import type { Question } from "@/lib/questions/types";
import { isHotspotCorrect } from "@/lib/questions/types";

/**
 * Renders one question of any type:
 *  - multiple_choice  → tap one option (optionally with an image above)
 *  - multiple_answer  → tick two or more options (checkbox squares)
 *  - hotspot          → tap the correct region of the image
 *
 * The parent owns the answer state and grading. `revealed` shows correctness
 * (used by per-question practice/module tests; the mock passes revealed=false).
 */
export function QuestionCard({
  question,
  eyebrow,
  choiceSelected,
  onToggleChoice,
  hotspotPoint,
  onHotspotTap,
  revealed = false,
}: {
  question: Question;
  eyebrow?: string;
  choiceSelected: number[];
  onToggleChoice: (i: number) => void;
  hotspotPoint?: { x: number; y: number } | null;
  onHotspotTap?: (pt: { x: number; y: number }) => void;
  revealed?: boolean;
}) {
  const isMulti = question.question_type === "multiple_answer";
  const isHotspot = question.question_type === "hotspot";
  // "Click the correct sign" questions: the options are sign-image paths
  // (all under /signs). Render them as a grid of tappable images rather than
  // text. Grading is unchanged — still by option index.
  const imageOptions =
    !isHotspot &&
    question.options.length > 0 &&
    question.options.every((o) => o.startsWith("/signs/"));

  return (
    <div className="relative mt-[22px] rounded-[22px] bg-white p-[18px] pt-5 shadow-[0_18px_40px_-18px_rgba(28, 25, 23,0.35)]">
      {eyebrow ? (
        <div className="flex items-center gap-1.5 text-[11.5px] font-extrabold uppercase tracking-[0.6px] text-purple">
          <span aria-hidden="true">⛑️</span> {eyebrow}
        </div>
      ) : null}

      <p className="mt-2.5 text-start text-lg font-extrabold leading-[1.3] tracking-[-0.3px] text-ink">
        {question.question_text}
      </p>

      {isMulti ? (
        <p className="mt-1.5 text-[11.5px] font-extrabold uppercase tracking-[0.6px] text-purple">
          Select all that apply
        </p>
      ) : null}

      {/* Image for image-based multiple-choice questions (ISO 7010 safety
          signs). These are static SVGs in /public/signs. We use a plain <img>,
          NOT next/image: the Next image optimizer rejects SVG sources with a
          400 unless `dangerouslyAllowSVG` is set, which silently blanked every
          sign question. SVGs are vectors, so the optimizer adds nothing anyway. */}
      {question.image_url && !isHotspot ? (
        <div className="mt-4 flex items-center justify-center overflow-hidden rounded-[14px] border border-ink/10 bg-[#FBF3EA] p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={question.image_url}
            alt="Safety sign"
            className="h-40 w-auto max-w-full object-contain"
          />
        </div>
      ) : null}

      {isHotspot ? (
        <HotspotImage
          question={question}
          point={hotspotPoint ?? null}
          onTap={onHotspotTap}
          revealed={revealed}
        />
      ) : imageOptions ? (
        <div className="mt-4 grid grid-cols-2 gap-[10px]">
          {question.options.map((opt, i) => {
            const selected = choiceSelected.includes(i);
            const isRight = question.correct_answer.includes(i);
            let cls = "border-transparent bg-[#FBF3EA] hover:border-purple/30";
            if (revealed) {
              if (isRight) cls = "border-[rgba(34,178,104,0.55)] bg-[#E3F8EA]";
              else if (selected) cls = "border-[rgba(224,85,85,0.55)] bg-[#FDEAEA]";
              else cls = "border-transparent bg-[#FBF3EA] opacity-60";
            } else if (selected) {
              cls = "border-purple bg-white";
            }
            return (
              <button
                key={i}
                type="button"
                disabled={revealed}
                onClick={() => onToggleChoice(i)}
                aria-label={`Sign option ${i + 1}`}
                className={`relative flex aspect-square items-center justify-center rounded-[14px] border-2 p-3 transition ${cls}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={opt} alt={`Safety sign option ${i + 1}`} className="h-full w-full object-contain" />
                {revealed && isRight ? (
                  <span className="absolute right-1.5 top-1.5 text-[#137A3B]" aria-hidden="true">✓</span>
                ) : null}
                {revealed && !isRight && selected ? (
                  <span className="absolute right-1.5 top-1.5 text-[#B93B3B]" aria-hidden="true">✕</span>
                ) : null}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-[9px]">
          {question.options.map((opt, i) => {
            const selected = choiceSelected.includes(i);
            const isRight = question.correct_answer.includes(i);
            let cls = "border-transparent bg-[#F7F1E9] text-ink hover:border-purple/30";
            if (revealed) {
              if (isRight) cls = "border-[rgba(34,178,104,0.35)] bg-[#E3F8EA] text-[#137A3B]";
              else if (selected) cls = "border-[rgba(224,85,85,0.35)] bg-[#FDEAEA] text-[#B93B3B]";
              else cls = "border-transparent bg-[#F7F1E9] text-ink-soft";
            } else if (selected) {
              cls = "border-purple bg-white text-ink";
            }
            return (
              <button
                key={i}
                type="button"
                disabled={revealed}
                onClick={() => onToggleChoice(i)}
                className={`flex w-full items-center gap-2.5 rounded-[14px] border-2 px-[15px] py-3.5 text-start text-[15px] font-bold transition ${cls}`}
              >
                {isMulti ? (
                  <span
                    className={`flex h-5 w-5 flex-none items-center justify-center rounded-md border-2 ${
                      selected ? "border-purple bg-purple text-white" : "border-ink/20 bg-white"
                    }`}
                  >
                    {selected ? (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : null}
                  </span>
                ) : null}
                <span className="min-w-0 flex-1 break-words text-start">{opt}</span>
                {revealed && isRight ? <span aria-hidden="true">✓</span> : null}
                {revealed && !isRight && selected ? <span aria-hidden="true">✕</span> : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** The tappable image for a hotspot question. */
function HotspotImage({
  question,
  point,
  onTap,
  revealed,
}: {
  question: Question;
  point: { x: number; y: number } | null;
  onTap?: (pt: { x: number; y: number }) => void;
  revealed: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const correct = point ? isHotspotCorrect(point, question.hotspot_zones) : false;

  function handleTap(e: React.MouseEvent) {
    if (revealed || !onTap || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    onTap({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) });
  }

  return (
    <div className="mt-4">
      <button
        ref={ref}
        type="button"
        onClick={handleTap}
        className="relative block w-full overflow-hidden rounded-[14px] border border-ink/10 bg-[#FBF3EA]"
      >
        {question.image_url ? (
          // Plain <img> (not next/image) — see the note on the multiple-choice
          // image above: the optimizer blocks SVG sources.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={question.image_url}
            alt="Tap the hazard"
            className="pointer-events-none h-auto w-full"
          />
        ) : null}

        {/* Reveal the correct zone(s) after answering */}
        {revealed
          ? (question.hotspot_zones ?? [])
              .filter((z) => z.correct)
              .map((z) => (
                <span
                  key={z.id}
                  className="pointer-events-none absolute rounded-md border-2 border-good bg-good/20"
                  style={{
                    left: `${z.x * 100}%`,
                    top: `${z.y * 100}%`,
                    width: `${z.width * 100}%`,
                    height: `${z.height * 100}%`,
                  }}
                />
              ))
          : null}

        {/* The user's tap marker */}
        {point ? (
          <span
            className={`pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] ${
              revealed ? (correct ? "border-good bg-good/30" : "border-bad bg-bad/30") : "border-purple bg-purple/30"
            }`}
            style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }}
          />
        ) : null}
      </button>
      <p className="mt-2 text-center text-[12.5px] font-semibold text-ink-soft">
        {point ? "Tap again to change your answer" : "Tap the image to answer"}
      </p>
    </div>
  );
}
