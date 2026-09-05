"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SpeakOrType } from "./speak-or-type";
import { Transcript, WitnessStand } from "./witness-stand";
import { ScorecardView } from "./scorecard-view";
import { TRIAL_LIMITS } from "@/lib/verdict/engine";
import type { CrossState } from "@/lib/verdict/engine";
import { primeVoices, speak, stopSpeaking } from "@/lib/verdict/voice";
import {
  clearInProgress,
  loadInProgress,
  recordTrial,
  saveInProgress,
} from "@/lib/verdict/storage";
import type {
  Exchange,
  Juror,
  PublicCase,
  Scorecard,
  TrialPhase,
} from "@/lib/verdict/types";

// =============================================================================
// The trial.
//
// One page, five phases, eight to twelve minutes. Opening, cross-examination,
// closing, deliberation, verdict — and the cross is four to six minutes of it,
// because the cross is the product and everything else is framing.
//
// The engine state (which buried conditions have landed, whether the witness
// has broken) round-trips through here on its way back to the server, which
// re-validates it every single call. See lib/verdict/engine.ts → reconcile().
// =============================================================================

type Snapshot = {
  phase: TrialPhase;
  opening: string;
  closing: string;
  exchanges: Exchange[];
  state: CrossState;
  pressure: number;
};

export function TrialRoom({
  publicCase,
  panel,
}: {
  publicCase: PublicCase;
  panel: Juror[];
}) {
  const witness = publicCase.witnesses[0];

  const [phase, setPhase] = useState<TrialPhase>("opening");
  const [opening, setOpening] = useState("");
  const [closing, setClosing] = useState("");
  const [question, setQuestion] = useState("");
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [state, setState] = useState<CrossState>({
    established: [],
    cracked: false,
  });
  const [pressure, setPressure] = useState(0);
  const [demeanour, setDemeanour] = useState(witness.demeanour);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scorecard, setScorecard] = useState<Scorecard | null>(null);
  const [voiceOn, setVoiceOn] = useState(true);
  const [fileOpen, setFileOpen] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const [judgeSays, setJudgeSays] = useState<string | null>(null);

  const bottom = useRef<HTMLDivElement | null>(null);
  const restored = useRef(false);

  // ---- resilience ---------------------------------------------------------
  // Losing eight minutes of cross to an accidental refresh is the kind of thing
  // a player does not come back from.
  useEffect(() => {
    primeVoices();
    const saved = loadInProgress<Snapshot>(publicCase.id);
    if (saved && saved.phase !== "verdict") {
      setPhase(saved.phase === "deliberation" ? "closing" : saved.phase);
      setOpening(saved.opening);
      setClosing(saved.closing);
      setExchanges(saved.exchanges);
      setState(saved.state);
      setPressure(saved.pressure);
    }
    restored.current = true;
  }, [publicCase.id]);

  useEffect(() => {
    if (!restored.current || phase === "verdict") return;
    saveInProgress(publicCase.id, {
      phase,
      opening,
      closing,
      exchanges,
      state,
      pressure,
    } satisfies Snapshot);
  }, [publicCase.id, phase, opening, closing, exchanges, state, pressure]);

  useEffect(() => () => stopSpeaking(), []);

  useEffect(() => {
    if (phase === "cross") {
      bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [exchanges.length, phase]);

  // ---- cross-examination --------------------------------------------------

  const askQuestion = useCallback(async () => {
    const asked = question.trim();
    if (!asked || busy) return;

    setBusy(true);
    setError(null);
    stopSpeaking();

    try {
      const response = await fetch("/api/verdict/witness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: publicCase.id,
          witnessId: witness.id,
          question: asked,
          exchanges,
          state,
        }),
      });

      const data = (await response.json()) as {
        exchange?: Exchange;
        demeanour?: string;
        state?: CrossState;
        pressure?: number;
        questionsLeft?: number;
        error?: string;
      };

      if (!response.ok || !data.exchange) {
        // Keep the question in the box — retyping a lost question is worse
        // than the error itself.
        setError(data.error ?? "The witness didn't answer. Try that again.");
        return;
      }

      setExchanges((prior) => [...prior, data.exchange!]);
      setState(data.state ?? state);
      setPressure(data.pressure ?? pressure);
      setDemeanour(data.demeanour ?? witness.demeanour);
      setQuestion("");

      const used = exchanges.length + 1;
      setJudgeSays(judgeLine(publicCase.judge.name, used));

      if (voiceOn) void speak(data.exchange.answer, witness.personality);
    } catch {
      setError("The connection dropped. Ask again.");
    } finally {
      setBusy(false);
    }
  }, [
    question,
    busy,
    publicCase.id,
    publicCase.judge.name,
    witness.id,
    witness.demeanour,
    witness.personality,
    exchanges,
    state,
    pressure,
    voiceOn,
  ]);

  // ---- deliberation -------------------------------------------------------

  const deliberate = useCallback(
    async (finalClosing: string) => {
      setPhase("deliberation");
      setRevealed(0);
      stopSpeaking();

      // A visible, tense beat. The jury is not allowed to answer instantly even
      // if the model does — the pause is the drama.
      const minimumBeat = new Promise<void>((resolve) =>
        setTimeout(resolve, TRIAL_LIMITS.deliberationSeconds * 1000)
      );

      type VerdictResponse = { scorecard?: Scorecard; error?: string };

      const request: Promise<VerdictResponse> = fetch("/api/verdict/verdict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: publicCase.id,
          witnessId: witness.id,
          opening,
          closing: finalClosing,
          exchanges,
          state,
        }),
      })
        .then(async (r) => (await r.json()) as VerdictResponse)
        .catch(() => ({ error: "The connection dropped." }));

      const [data] = await Promise.all([request, minimumBeat]);

      if (!data.scorecard) {
        setError(data.error ?? "The jury couldn't reach a verdict. Try again.");
        setPhase("closing");
        return;
      }

      const result = data.scorecard;

      // Reveal the room one juror at a time before showing the result.
      for (let i = 1; i <= result.jurors.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, 420));
        setRevealed(i);
      }
      await new Promise((resolve) => setTimeout(resolve, 700));

      setScorecard(result);
      setPhase("verdict");
      clearInProgress();
      recordTrial({
        caseId: publicCase.id,
        caseTitle: publicCase.title,
        won: result.won,
        cracked: result.cracked,
        votesFor: result.votesFor,
        votesAgainst: result.votesAgainst,
      });
    },
    [publicCase.id, publicCase.title, witness.id, opening, exchanges, state]
  );

  const replay = () => {
    stopSpeaking();
    clearInProgress();
    setPhase("opening");
    setOpening("");
    setClosing("");
    setQuestion("");
    setExchanges([]);
    setState({ established: [], cracked: false });
    setPressure(0);
    setDemeanour(witness.demeanour);
    setScorecard(null);
    setError(null);
    setJudgeSays(null);
  };

  const questionsLeft = TRIAL_LIMITS.maxQuestions - exchanges.length;

  // ---------------------------------------------------------------- render --

  if (phase === "verdict" && scorecard) {
    return (
      <div className="vd-wrap pb-10 pt-safe">
        <ScorecardView
          scorecard={scorecard}
          exchanges={exchanges}
          caseTitle={publicCase.title}
          onReplay={replay}
        />
      </div>
    );
  }

  if (phase === "deliberation") {
    return (
      <div className="vd-wrap flex min-h-[80dvh] flex-col justify-center pb-10 pt-safe">
        <p className="vd-eyebrow text-center">The jury retires</p>
        <h1 className="vd-display mt-2 text-center text-3xl">
          They are deciding.
        </h1>
        <div className="mt-8 flex flex-col gap-2">
          {panel.map((juror, i) => (
            <div key={juror.id} className="vd-juror-chip">
              <span
                className="vd-lean"
                data-lean={i < revealed ? "considering" : "thinking"}
              />
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold">{juror.name}</p>
                <p className="vd-faint truncate text-[12px]">{juror.bias}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="vd-faint mt-6 text-center text-[13px]">
          Every one of them will tell you why.
        </p>
      </div>
    );
  }

  return (
    <div className="vd-wrap pb-12 pt-safe">
      {/* ---- header ---------------------------------------------------- */}
      <header className="pt-4">
        <div className="flex items-center justify-between gap-3">
          <Link href="/verdict" className="vd-faint text-[13px] hover:underline">
            ← Leave court
          </Link>
          <button
            type="button"
            className="vd-faint text-[13px] hover:underline"
            onClick={() => {
              if (voiceOn) stopSpeaking();
              setVoiceOn((on) => !on);
            }}
          >
            Witness voice: {voiceOn ? "on" : "off"}
          </button>
        </div>
        <p className="vd-eyebrow mt-4">{publicCase.court}</p>
        <h1 className="vd-display mt-1 text-2xl">{publicCase.title}</h1>
        <p className="vd-muted mt-1 text-[13px]">{publicCase.side}</p>
      </header>

      <hr className="vd-rule my-5" />

      {/* ---- opening ---------------------------------------------------- */}
      {phase === "opening" && (
        <section className="flex flex-col gap-5">
          <div>
            <p className="vd-eyebrow">Opening statement</p>
            <p className="vd-muted mt-2 text-[15px] leading-relaxed">
              Ninety seconds to tell the jury what this case is about and what
              you are going to prove. This sets which way they lean before a
              single question is asked.
            </p>
          </div>

          <div className="vd-card">
            <p className="vd-eyebrow mb-2">Your client says</p>
            <p className="text-[15px] leading-relaxed">
              {publicCase.clientStatement}
            </p>
          </div>

          <SpeakOrType
            value={opening}
            onChange={setOpening}
            onSubmit={() => setPhase("cross")}
            onExpire={() => setPhase("cross")}
            seconds={TRIAL_LIMITS.openingSeconds}
            placeholder="Members of the jury…"
            submitLabel="Deliver opening"
            autoFocus
          />

          <button
            type="button"
            className="vd-faint text-[13px] hover:underline"
            onClick={() => setPhase("cross")}
          >
            Waive the opening and go straight to the witness
          </button>
        </section>
      )}

      {/* ---- cross-examination ------------------------------------------ */}
      {phase === "cross" && (
        <section className="flex flex-col gap-5">
          <WitnessStand
            witness={witness}
            demeanour={demeanour}
            pressure={pressure}
            cracked={state.cracked}
            thinking={busy}
          />

          <details
            className="vd-card"
            open={fileOpen}
            onToggle={(e) => setFileOpen((e.target as HTMLDetailsElement).open)}
          >
            <summary className="vd-eyebrow cursor-pointer list-none">
              Case file — statement, exhibits, jury
            </summary>

            <div className="mt-4 flex flex-col gap-4">
              <div>
                <p className="vd-eyebrow mb-1.5">
                  {witness.name} said, before trial
                </p>
                <p className="text-[14px] italic leading-relaxed">
                  &ldquo;{witness.publicStatement}&rdquo;
                </p>
              </div>

              <hr className="vd-rule" />

              <div>
                <p className="vd-eyebrow mb-2">Exhibits</p>
                <ul className="flex flex-col gap-2.5">
                  {publicCase.exhibits.map((exhibit) => (
                    <li key={exhibit.ref} className="text-[14px] leading-relaxed">
                      <span className="font-bold">
                        {exhibit.ref} — {exhibit.name}.
                      </span>{" "}
                      <span className="vd-muted">{exhibit.detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <hr className="vd-rule" />

              <div>
                <p className="vd-eyebrow mb-2">The jury</p>
                <ul className="flex flex-col gap-1.5">
                  {panel.map((juror) => (
                    <li key={juror.id} className="text-[13px] leading-relaxed">
                      <span className="font-semibold">{juror.name}</span>{" "}
                      <span className="vd-faint">({juror.occupation})</span>{" "}
                      <span className="vd-muted">{juror.bias}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </details>

          <div className="max-h-[46vh] overflow-y-auto pr-1">
            <Transcript exchanges={exchanges} witnessName={witness.name} />
            <div ref={bottom} />
          </div>

          {judgeSays && (
            <p className="vd-faint text-center text-[13px] italic">{judgeSays}</p>
          )}

          {error && (
            <p className="text-center text-[13px]" style={{ color: "var(--vd-lost)" }}>
              {error}
            </p>
          )}

          {questionsLeft > 0 ? (
            <SpeakOrType
              value={question}
              onChange={setQuestion}
              onSubmit={askQuestion}
              placeholder="Put it to the witness…"
              submitLabel="Put the question"
              busy={busy}
            />
          ) : (
            <p className="vd-muted text-center text-[14px]">
              You are out of questions. Rest your case.
            </p>
          )}

          <div className="flex items-center justify-between gap-3">
            <span className="vd-faint text-[12px]">
              {questionsLeft} question{questionsLeft === 1 ? "" : "s"} left
            </span>
            <button
              type="button"
              className="vd-btn vd-btn-ghost"
              onClick={() => {
                stopSpeaking();
                setPhase("closing");
              }}
              disabled={busy}
            >
              Rest your case
            </button>
          </div>
        </section>
      )}

      {/* ---- closing ---------------------------------------------------- */}
      {phase === "closing" && (
        <section className="flex flex-col gap-5">
          <div>
            <p className="vd-eyebrow">Closing argument</p>
            <p className="vd-muted mt-2 text-[15px] leading-relaxed">
              Ninety seconds. Tie it into one story a juror could repeat to
              somebody in the car park.
            </p>
          </div>

          {state.cracked && (
            <div
              className="vd-card"
              style={{ borderColor: "rgba(196,81,79,0.4)" }}
            >
              <p className="vd-eyebrow" style={{ color: "var(--vd-lost)" }}>
                You broke the witness
              </p>
              <p className="mt-2 text-[14px] leading-relaxed">
                Use it. A jury that watched someone admit it wants to be told
                what it meant.
              </p>
            </div>
          )}

          {error && (
            <p className="text-center text-[13px]" style={{ color: "var(--vd-lost)" }}>
              {error}
            </p>
          )}

          <SpeakOrType
            value={closing}
            onChange={setClosing}
            onSubmit={() => void deliberate(closing)}
            onExpire={() => void deliberate(closing)}
            seconds={TRIAL_LIMITS.closingSeconds}
            placeholder="Members of the jury, this case comes down to…"
            submitLabel="Send them out"
            autoFocus
          />
        </section>
      )}
    </div>
  );
}

/** Scripted, not generated — a time warning has to be instant to land. */
function judgeLine(judgeName: string, questionsUsed: number): string | null {
  const left = TRIAL_LIMITS.maxQuestions - questionsUsed;
  if (left === 6) {
    return `${judgeName}: "A few more, and then I shall want your closing."`;
  }
  if (left === 2) return `${judgeName}: "Two more, please."`;
  if (left <= 0) return `${judgeName}: "That will do. Closing argument."`;
  return null;
}
