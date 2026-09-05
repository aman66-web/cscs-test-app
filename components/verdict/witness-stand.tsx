"use client";

import { PERSONALITY_LABELS, type Exchange, type PublicWitness } from "@/lib/verdict/types";

// =============================================================================
// The witness stand and the transcript.
//
// This is the screen the product is for, so two things get special treatment:
//
//   THE PRESSURE METER tells the player they have landed something without
//   telling them what. It is driven by the engine's condition count, never by
//   sentiment — so it cannot lie, and it cannot be nudged by an aggressive
//   question that established nothing.
//
//   THE CRACK gets an entrance. The answer arrives with a flash, the stand
//   changes state, and the moment is labelled — because a player who cannot
//   tell the witness just broke will describe this as "the AI game" instead
//   of describing the moment, which is the one test that matters.
// =============================================================================

export function WitnessStand({
  witness,
  demeanour,
  pressure,
  cracked,
  thinking,
}: {
  witness: PublicWitness;
  demeanour: string;
  pressure: number;
  cracked: boolean;
  thinking: boolean;
}) {
  return (
    <div className="vd-stand">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="vd-eyebrow">In the box</p>
          <h2 className="vd-display mt-1 text-2xl">{witness.name}</h2>
          <p className="vd-muted mt-0.5 text-sm">
            {witness.age} · {witness.occupation}
          </p>
        </div>
        <span
          className="vd-faint shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold"
          style={{ borderColor: "var(--vd-hair)" }}
        >
          {PERSONALITY_LABELS[witness.personality]}
        </span>
      </div>

      <p className="vd-muted mt-3 min-h-[2.5rem] text-[13px] italic leading-relaxed">
        {thinking ? (
          <span className="inline-flex items-center gap-2">
            <span className="vd-beat" aria-hidden>
              <span />
              <span />
              <span />
            </span>
            {/* The filler beat covers generation time. A frozen room kills the
                tension faster than a slow answer does. */}
            <span>
              {witness.name.split(" ")[0]} shifts in the chair and glances at the
              bench.
            </span>
          </span>
        ) : (
          demeanour
        )}
      </p>

      <div className="mt-4">
        <div className="mb-1.5 flex items-center justify-between">
          <span className="vd-eyebrow">
            {cracked ? "Broken" : "Under pressure"}
          </span>
          <span className="vd-faint text-[11px] font-semibold">{pressure}%</span>
        </div>
        <div className="vd-pressure">
          <div
            className="vd-pressure-fill"
            data-cracked={cracked}
            style={{ width: `${Math.max(2, pressure)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function Transcript({
  exchanges,
  witnessName,
}: {
  exchanges: Exchange[];
  witnessName: string;
}) {
  if (exchanges.length === 0) {
    return (
      <p className="vd-faint py-6 text-center text-sm">
        Your witness. Ask your first question.
      </p>
    );
  }

  const surname = witnessName.split(" ").slice(-1)[0].toUpperCase();

  return (
    <ol className="flex flex-col gap-5">
      {exchanges.map((ex, i) => {
        const isCrack = ex.mode === "crack";
        return (
          <li key={i} className="flex flex-col gap-2">
            <div className="vd-q">
              <p className="vd-eyebrow mb-1">You</p>
              <p className="text-[15px] leading-relaxed">{ex.question}</p>
            </div>

            <div
              className={`vd-a ${isCrack ? "vd-crack-flash rounded-r-lg py-3 pr-3" : ""}`}
              data-mode={ex.mode}
              style={
                isCrack
                  ? { background: "rgba(196, 81, 79, 0.09)" }
                  : undefined
              }
            >
              <p className="vd-eyebrow mb-1" style={isCrack ? { color: "var(--vd-lost)" } : undefined}>
                {surname}
                {isCrack && " · breaks"}
              </p>
              <p className="text-[15px] leading-relaxed">{ex.answer}</p>
            </div>

            {ex.mode === "rattled" && (
              <p className="vd-faint pl-4 text-[11px] font-semibold uppercase tracking-wider">
                Something landed.
              </p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
