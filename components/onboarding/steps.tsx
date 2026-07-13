"use client";

import { useEffect, useState } from "react";
import { TOPICS, type TopicKey } from "@/lib/onboarding/types";
import {
  CoachConsentNotice,
  useCoachConsent,
} from "@/components/coach/coach-consent";
import { hasCoachConsent } from "@/lib/coach/consent";

// Cloned from the My Life in the UK Test app's components/onboarding/steps.tsx.
// Adaptations: i18n t() calls replaced with English literals (this app is
// English-only), topic chips are the five HS&E modules, and the previous
// score is out of 50 (not 24).

// Boxed brand input (prototype .field): white, 1.5px hairline border, 15px
// radius, purple focus glow. Defined in globals.css.
const fieldClass = "input-boxed";

export function StepHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6">
      <h1 className="text-[26px] font-extrabold leading-[1.15] tracking-[-0.7px] text-ink">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-2 text-sm font-medium leading-relaxed text-ink-soft">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

export function TextStep({
  value,
  placeholder,
  autoComplete,
  type = "text",
  inputMode,
  onChange,
  onEnter,
}: {
  value: string;
  placeholder: string;
  autoComplete: string;
  type?: "text" | "email";
  inputMode?: "text" | "email";
  onChange: (value: string) => void;
  onEnter: () => void;
}) {
  return (
    <input
      type={type}
      inputMode={inputMode}
      autoComplete={autoComplete}
      value={value}
      placeholder={placeholder}
      autoFocus
      autoCapitalize={type === "email" ? "none" : "words"}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          onEnter();
        }
      }}
      className={fieldClass}
    />
  );
}

export function TakenBeforeStep({
  value,
  onChange,
}: {
  value: boolean | null;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {[
        { label: "No, this is my first time", emoji: "🌱", val: false },
        { label: "Yes, I've taken it before", emoji: "🔁", val: true },
      ].map(({ label, emoji, val }) => {
        const selected = value === val;
        return (
          <button
            key={label}
            type="button"
            onClick={() => onChange(val)}
            aria-pressed={selected}
            className={`flex items-center gap-3 rounded-2xl border-2 bg-white p-4 text-start text-[15px] font-bold text-ink transition active:scale-[0.99] ${
              selected
                ? "border-purple bg-[#FDFBF7]"
                : "border-ink/10 hover:border-purple/40"
            }`}
          >
            <span className="flex-none text-[22px]" aria-hidden="true">
              {emoji}
            </span>
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function ScoreStep({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  return (
    <input
      inputMode="numeric"
      pattern="[0-9]*"
      value={value === null ? "" : String(value)}
      placeholder="e.g. 38"
      autoFocus
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, "").slice(0, 2);
        if (digits === "") {
          onChange(null);
          return;
        }
        const n = Math.min(50, parseInt(digits, 10));
        onChange(n);
      }}
      className={`${fieldClass} text-center`}
    />
  );
}

export function HardestStep({
  topics,
  notes,
  onToggleTopic,
  onNotesChange,
}: {
  topics: TopicKey[];
  notes: string;
  onToggleTopic: (key: TopicKey) => void;
  onNotesChange: (value: string) => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {TOPICS.map(({ key, label }) => {
          const selected = topics.includes(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => onToggleTopic(key)}
              aria-pressed={selected}
              className={`rounded-full border px-4 py-2.5 text-sm font-medium transition active:scale-[0.99] ${
                selected
                  ? "border-purple bg-lilac text-purple-deep"
                  : "border-ink/10 bg-white text-ink hover:border-purple/40"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <textarea
        value={notes}
        placeholder="Anything specific you found hard? (optional)"
        rows={4}
        maxLength={1000}
        onChange={(e) => onNotesChange(e.target.value)}
        className="w-full resize-none rounded-[15px] border-[1.5px] border-ink/10 bg-white px-[15px] py-3 text-base font-semibold text-ink outline-none transition placeholder:font-medium placeholder:text-[#A7A2BE] focus:border-purple focus:shadow-[0_0_0_3px_rgba(249, 115, 22,0.12)]"
      />
    </div>
  );
}

// ----- Meet David (the AI coach) ---------------------------------------------

type CoachMsg = { role: "user" | "assistant"; content: string };

const COACH_OFFLINE =
  "I couldn't connect just now — but I'll be right there on the Learn and Practice tabs once you're set up. Ask me anything about the HS&E test!";

/**
 * Onboarding "meet your coach" stage: David greets the user by the name they
 * just gave and they can ask him a real question right here (same /api/coach
 * endpoint the rest of the app uses). Entirely optional — the flow's Continue
 * button is always available, and a failed request degrades to a friendly
 * canned reply so onboarding can never get stuck on this step.
 */
export function MeetCoachStep({ name }: { name: string }) {
  const [greeted, setGreeted] = useState(false);
  const [messages, setMessages] = useState<CoachMsg[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const { consented, ready, accept } = useCoachConsent();

  // A short "typing…" beat before the greeting appears, so it feels like
  // David is really saying hello rather than a wall of text popping in.
  useEffect(() => {
    const id = setTimeout(() => setGreeted(true), 900);
    return () => clearTimeout(id);
  }, []);

  async function send() {
    const content = input.trim();
    if (!content || pending) return;
    // Hard gate: no message may reach Anthropic before the data-sharing notice
    // is accepted (the input only appears after acceptance; this is a guard).
    if (!hasCoachConsent()) return;
    const next: CoachMsg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setPending(true);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            {
              ...next[0],
              content: `[The user just met you during onboarding — keep it to 2–3 warm sentences.]\n${next[0].content}`,
            },
            ...next.slice(1),
          ],
        }),
      });
      const data = (await res.json()) as { reply?: string };
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: res.ok && data.reply ? data.reply : COACH_OFFLINE,
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: COACH_OFFLINE },
      ]);
    } finally {
      setPending(false);
    }
  }

  const bubbleIn =
    "motion-safe:animate-[tourReveal_0.3s_cubic-bezier(0.2,0.7,0.3,1)]";

  return (
    <div>
      {/* Greeting bubble (typing dots → the hello) */}
      <div className="rounded-[18px] rounded-es-[6px] border border-ink/[0.06] bg-white px-4 py-3.5 shadow-[0_12px_26px_-16px_rgba(28, 25, 23,0.3)]">
        {greeted ? (
          <p className={`text-[14px] font-medium leading-relaxed text-ink ${bubbleIn}`}>
            Hi, nice to meet you, {name}! 👋 I&apos;m David, your AI coach — I
            know the official HS&amp;E revision material inside out. How can I
            help?
          </p>
        ) : (
          <span className="flex items-center gap-1 py-1" aria-hidden="true">
            {["0ms", "150ms", "300ms"].map((d) => (
              <span
                key={d}
                className="h-2 w-2 animate-bounce rounded-full bg-ink-soft"
                style={{ animationDelay: d }}
              />
            ))}
          </span>
        )}
      </div>

      {/* The mini conversation */}
      {messages.length > 0 ? (
        <div className="mt-2.5 space-y-2.5">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] whitespace-pre-wrap break-words px-3.5 py-2.5 text-[13.5px] font-medium leading-relaxed ${bubbleIn} ${
                  m.role === "user"
                    ? "rounded-[16px] rounded-ee-[6px] bg-[linear-gradient(135deg,#F97316,#C2410C)] text-white"
                    : "rounded-[16px] rounded-es-[6px] bg-[#F7F1E9] text-ink"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {pending ? (
            <div className="flex justify-start">
              <span className="flex items-center gap-1 rounded-[16px] bg-[#F7F1E9] px-4 py-3" aria-hidden="true">
                {["0ms", "150ms", "300ms"].map((d) => (
                  <span
                    key={d}
                    className="h-2 w-2 animate-bounce rounded-full bg-ink-soft"
                    style={{ animationDelay: d }}
                  />
                ))}
              </span>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* Ask David something (optional) — gated by the one-time data notice, so
          nothing is sent to Anthropic until it's accepted. */}
      {greeted && ready && !consented ? (
        <CoachConsentNotice onAccept={accept} className="mt-3" />
      ) : null}
      {greeted && consented ? (
        <form
          className="mt-3 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void send();
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question…"
            className="input-boxed !h-12 flex-1"
          />
          <button
            type="submit"
            disabled={pending || input.trim() === ""}
            aria-label="Send"
            className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-[linear-gradient(180deg,#F97316,#C2410C)] text-white shadow-[0_10px_20px_-8px_rgba(249, 115, 22,0.7)] transition active:scale-95 disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
              <path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
      ) : null}

      <p className="mt-3 text-[12px] font-semibold leading-relaxed text-ink-soft">
        Ask David anything — or continue and find him any time on the Learn and
        Practice tabs.
      </p>
    </div>
  );
}
