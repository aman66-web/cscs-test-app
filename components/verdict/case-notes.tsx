"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TRIAL_LIMITS } from "@/lib/verdict/engine";
import type { Juror, PublicCase } from "@/lib/verdict/types";

// =============================================================================
// Case notes — sixty seconds.
//
// The countdown is not decoration. It does two jobs: it puts the player under
// pressure before the trial has even started, and it stops the kind of
// over-preparation that turns an eight-minute game into a twenty-minute one.
//
// It never traps anyone: the clock running out takes you into court, which is
// where you wanted to go anyway, and you can go early at any point.
// =============================================================================

export function CaseNotes({
  publicCase,
  panel,
}: {
  publicCase: PublicCase;
  panel: Juror[];
}) {
  const router = useRouter();
  const [left, setLeft] = useState<number>(TRIAL_LIMITS.caseNotesSeconds);
  const witness = publicCase.witnesses[0];

  useEffect(() => {
    const id = window.setInterval(() => {
      setLeft((remaining) => {
        if (remaining <= 1) {
          window.clearInterval(id);
          router.push(`/verdict/trial/${publicCase.id}`);
          return 0;
        }
        return remaining - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [router, publicCase.id]);

  return (
    <main className="vd-wrap pb-10 pt-safe">
      <header className="pt-4">
        <div className="flex items-center justify-between gap-3">
          <span className="vd-eyebrow">Case notes</span>
          <span className="vd-clock text-lg" data-low={left <= 15}>
            0:{String(left).padStart(2, "0")}
          </span>
        </div>
        <h1 className="vd-display mt-3 text-[2rem] leading-tight">
          {publicCase.title}
        </h1>
        <p className="vd-muted mt-2 text-[14px]">
          {publicCase.court} · before {publicCase.judge.name}
        </p>
        <p className="vd-faint mt-1 text-[13px] italic">
          {publicCase.judge.temperament}
        </p>
      </header>

      <hr className="vd-rule my-5" />

      <div className="flex flex-col gap-4">
        <section className="vd-card">
          <p className="vd-eyebrow mb-2">You act for</p>
          <p className="text-[15px] font-semibold leading-relaxed">
            {publicCase.side}
          </p>
          <p className="mt-3 text-[15px] leading-relaxed">
            {publicCase.clientStatement}
          </p>
          <hr className="vd-rule my-3" />
          <p className="vd-eyebrow mb-2">The other side says</p>
          <p className="vd-muted text-[15px] leading-relaxed">
            {publicCase.opposingClaim}
          </p>
          <p className="vd-faint mt-3 text-[13px]">At stake: {publicCase.stake}</p>
        </section>

        <section className="vd-card">
          <p className="vd-eyebrow mb-2">Exhibits</p>
          <ul className="flex flex-col gap-3">
            {publicCase.exhibits.map((exhibit) => (
              <li key={exhibit.ref} className="text-[14px] leading-relaxed">
                <span className="font-bold">
                  {exhibit.ref} — {exhibit.name}.
                </span>{" "}
                <span className="vd-muted">{exhibit.detail}</span>
              </li>
            ))}
          </ul>
          <p className="vd-faint mt-3 text-[12px]">
            Name them out loud in court. The jury counts which ones you actually
            used.
          </p>
        </section>

        <section className="vd-card vd-card-brass">
          <p className="vd-eyebrow mb-2">Testifying against you</p>
          <p className="vd-display text-xl">{witness.name}</p>
          <p className="vd-muted text-[13px]">
            {witness.age} · {witness.occupation}
          </p>
          <p className="mt-3 text-[15px] italic leading-relaxed">
            &ldquo;{witness.publicStatement}&rdquo;
          </p>
          <p className="vd-faint mt-3 text-[12px]">
            Somewhere between that statement and the truth there is exactly one
            inconsistency. It is in there.
          </p>
        </section>

        <section className="vd-card">
          <p className="vd-eyebrow mb-3">Your jury</p>
          <ul className="flex flex-col gap-2.5">
            {panel.map((juror) => (
              <li key={juror.id} className="text-[14px] leading-relaxed">
                <span className="font-semibold">{juror.name}</span>
                <span className="vd-faint"> · {juror.occupation}</span>
                <br />
                <span className="vd-muted text-[13px]">{juror.bias}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <button
          type="button"
          className="vd-btn vd-btn-primary w-full"
          onClick={() => router.push(`/verdict/trial/${publicCase.id}`)}
        >
          Enter court
        </button>
        <p className="vd-faint text-center text-[12px]">
          You go in when the clock runs out either way.
        </p>
      </div>
    </main>
  );
}
