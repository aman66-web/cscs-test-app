"use client";

import Link from "next/link";
import {
  DIMENSION_BLURBS,
  DIMENSION_LABELS,
  DIMENSIONS,
  type Exchange,
  type Scorecard,
} from "@/lib/verdict/types";

// =============================================================================
// The scorecard.
//
// Every juror's reasoning is published, win or lose, every single time. That is
// not a nice-to-have: it is what makes a loss feel earned instead of arbitrary,
// it is where players actually learn to argue, and it is the thing that stops
// the rage-quit spiral that kills games judged by a machine.
//
// So the reasoning comes FIRST on this screen, above the numbers. The numbers
// are the receipt; the reasoning is the product.
// =============================================================================

export function ScorecardView({
  scorecard,
  exchanges,
  caseTitle,
  onReplay,
}: {
  scorecard: Scorecard;
  exchanges: Exchange[];
  caseTitle: string;
  onReplay: () => void;
}) {
  const { won, votesFor, votesAgainst, jurors, scores } = scorecard;
  const moment =
    scorecard.bestExchange !== null ? exchanges[scorecard.bestExchange] : null;

  return (
    <div className="flex flex-col gap-8">
      {/* ---- the result ---------------------------------------------------- */}
      <section className="text-center">
        <p className="vd-eyebrow">The jury finds</p>
        <p
          className="vd-verdict-word mt-2"
          style={{ color: won ? "var(--vd-won)" : "var(--vd-lost)" }}
        >
          {won ? "FOR YOU" : "AGAINST YOU"}
        </p>
        <p className="vd-muted mt-3 text-sm">
          {votesFor}–{votesAgainst} · {caseTitle}
        </p>
        <p className="vd-faint mt-4 text-[13px] italic">
          &ldquo;{scorecard.judgeRemark}&rdquo;
        </p>
      </section>

      {/* ---- did the witness break? ---------------------------------------- */}
      <section
        className="vd-card vd-card-brass text-center"
        style={
          scorecard.cracked
            ? { borderColor: "rgba(196,81,79,0.45)" }
            : undefined
        }
      >
        {scorecard.cracked ? (
          <>
            <p className="vd-eyebrow" style={{ color: "var(--vd-lost)" }}>
              You broke the witness
            </p>
            <p className="mt-2 text-[15px] leading-relaxed">
              All {scorecard.conditionsTotal} of the buried facts, pinned down in
              open court.
            </p>
          </>
        ) : (
          <>
            <p className="vd-eyebrow">The witness held</p>
            <p className="mt-2 text-[15px] leading-relaxed">
              You pinned down {scorecard.conditionsLanded} of{" "}
              {scorecard.conditionsTotal} buried facts. There was more in there.
            </p>
          </>
        )}
      </section>

      {/* ---- the moment ---------------------------------------------------- */}
      {moment && (
        <section>
          <p className="vd-eyebrow mb-3">The exchange that mattered</p>
          <div className="vd-card">
            <p className="vd-muted text-[11px] font-bold uppercase tracking-wider">
              You
            </p>
            <p className="mt-1 text-[15px] leading-relaxed">{moment.question}</p>
            <hr className="vd-rule my-3" />
            <p className="vd-muted text-[11px] font-bold uppercase tracking-wider">
              The witness
            </p>
            <p className="mt-1 text-[15px] leading-relaxed">{moment.answer}</p>
          </div>
          <p className="vd-faint mt-2 text-[12px]">
            Clip export arrives with ranked play — for now, this is the cut.
          </p>
        </section>
      )}

      {/* ---- the jury explains itself -------------------------------------- */}
      <section>
        <p className="vd-eyebrow mb-3">What the jury said</p>
        <div className="flex flex-col gap-3">
          {jurors.map((juror) => (
            <article key={juror.jurorId} className="vd-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="vd-display text-[17px]">{juror.name}</p>
                  <p className="vd-faint text-[12px]">{juror.occupation}</p>
                </div>
                <span
                  className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider"
                  style={{
                    color: juror.forPlayer ? "var(--vd-won)" : "var(--vd-lost)",
                    background: juror.forPlayer
                      ? "rgba(79,169,108,0.12)"
                      : "rgba(196,81,79,0.12)",
                  }}
                >
                  {juror.forPlayer ? "For you" : "Against"}
                </span>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed">{juror.reasoning}</p>
              <p className="vd-faint mt-2 text-[12px] italic">{juror.bias}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ---- the numbers --------------------------------------------------- */}
      <section>
        <p className="vd-eyebrow mb-3">How you scored</p>
        <div className="vd-card flex flex-col gap-4">
          {DIMENSIONS.map((dimension) => (
            <div key={dimension}>
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="text-[14px] font-semibold">
                  {DIMENSION_LABELS[dimension]}
                </span>
                <span className="vd-muted text-[13px] font-bold tabular-nums">
                  {scores[dimension]}
                </span>
              </div>
              <div className="vd-bar">
                <div
                  className="vd-bar-fill"
                  style={{ width: `${Math.max(2, scores[dimension])}%` }}
                />
              </div>
              <p className="vd-faint mt-1 text-[12px]">
                {DIMENSION_BLURBS[dimension]}
              </p>
            </div>
          ))}
        </div>
        <p className="vd-faint mt-3 text-[12px] leading-relaxed">
          Evidence and contradictions are counted, not judged — the same words
          always produce the same numbers. Each juror&apos;s threshold is fixed
          for this case, so replaying it cannot buy you an easier room.
        </p>
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" className="vd-btn vd-btn-ghost flex-1" onClick={onReplay}>
          Argue it again
        </button>
        <Link href="/verdict" className="vd-btn vd-btn-primary flex-1">
          Back to the docket
        </Link>
      </div>
    </div>
  );
}
