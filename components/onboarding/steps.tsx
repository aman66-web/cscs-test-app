"use client";

import { useEffect, useRef, useState } from "react";
import { TOPICS, type TopicKey } from "@/lib/onboarding/types";

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

/** Local Date → ISO "YYYY-MM-DD" (no timezone shift, unlike toISOString). */
function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const MIN_AGE = 13;
const MAX_AGE = 110;
const DOB_INVALID = "Please enter a valid date, like 15/03/1994.";

/** Split an ISO "YYYY-MM-DD" into DD / MM / YYYY parts (to seed the inputs). */
function partsFromIso(value: string | null): { d: string; m: string; y: string } {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split("-");
    return { d, m, y };
  }
  return { d: "", m: "", y: "" };
}

/** Validate the three typed parts. Returns the ISO date when valid, plus an
    error message to show (only once enough has been typed to judge). */
function evaluateDob(
  dd: string,
  mm: string,
  yy: string
): { iso: string | null; error: string | null } {
  // Nothing (or not enough) entered yet — neither valid nor an error.
  if (dd === "" && mm === "" && yy === "") return { iso: null, error: null };
  if (dd === "" || mm === "" || yy.length < 4) return { iso: null, error: null };

  const day = parseInt(dd, 10);
  const month = parseInt(mm, 10);
  const year = parseInt(yy, 10);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return { iso: null, error: DOB_INVALID };
  }
  // Real calendar date? Constructing it and checking the parts round-trip
  // rejects impossible dates like 31/02 (which would roll over to March).
  const dt = new Date(year, month - 1, day);
  if (
    dt.getFullYear() !== year ||
    dt.getMonth() !== month - 1 ||
    dt.getDate() !== day
  ) {
    return { iso: null, error: DOB_INVALID };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (dt.getTime() > today.getTime()) {
    return { iso: null, error: "That date is in the future." };
  }
  // Age gate — same 365.25-day formula the server uses (onboarding actions),
  // so client and server always agree.
  const ageYears = (today.getTime() - dt.getTime()) / (365.25 * 86400000);
  if (ageYears < MIN_AGE) {
    return { iso: null, error: `You must be at least ${MIN_AGE} to use the app.` };
  }
  if (ageYears > MAX_AGE) {
    return { iso: null, error: DOB_INVALID };
  }
  return { iso: toISODate(dt), error: null };
}

/**
 * Date of birth as three typed inputs (DD / MM / YYYY) with auto-advance and a
 * numeric keypad — no OS date picker. Validates a real calendar date that is
 * in the past and within the sensible age range, then hands the parent an ISO
 * "YYYY-MM-DD" string (or "" while incomplete/invalid), matching the previous
 * contract. The server (onboarding actions) re-checks as defence in depth.
 */
export function DobStep({
  value,
  onChange,
}: {
  value: string | null;
  /** Receives the ISO date when valid, "" while empty/invalid. */
  onChange: (value: string) => void;
}) {
  const seed = partsFromIso(value);
  const [d, setD] = useState(seed.d);
  const [m, setM] = useState(seed.m);
  const [y, setY] = useState(seed.y);
  const [error, setError] = useState<string | null>(null);

  const dRef = useRef<HTMLInputElement>(null);
  const mRef = useRef<HTMLInputElement>(null);
  const yRef = useRef<HTMLInputElement>(null);

  function apply(dd: string, mm: string, yy: string) {
    setD(dd);
    setM(mm);
    setY(yy);
    const res = evaluateDob(dd, mm, yy);
    setError(res.error);
    onChange(res.iso ?? "");
  }

  const box = `${fieldClass} text-center`;
  const sep = "flex-none text-[15px] font-bold text-ink-soft";

  return (
    <div>
      <div className="flex items-center gap-2">
        <input
          ref={dRef}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="bday-day"
          maxLength={2}
          placeholder="DD"
          aria-label="Day"
          aria-invalid={!!error}
          autoFocus
          value={d}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 2);
            apply(v, m, y);
            if (v.length === 2) mRef.current?.focus();
          }}
          className={`${box} !w-16 flex-none`}
        />
        <span className={sep} aria-hidden="true">
          /
        </span>
        <input
          ref={mRef}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="bday-month"
          maxLength={2}
          placeholder="MM"
          aria-label="Month"
          aria-invalid={!!error}
          value={m}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 2);
            apply(d, v, y);
            if (v.length === 2) yRef.current?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && m === "") dRef.current?.focus();
          }}
          className={`${box} !w-16 flex-none`}
        />
        <span className={sep} aria-hidden="true">
          /
        </span>
        <input
          ref={yRef}
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete="bday-year"
          maxLength={4}
          placeholder="YYYY"
          aria-label="Year"
          aria-invalid={!!error}
          value={y}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 4);
            apply(d, m, v);
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && y === "") mRef.current?.focus();
          }}
          className={`${box} !w-auto flex-1`}
        />
      </div>
      {error ? (
        <p role="alert" className="mt-3 text-xs font-bold text-bad">
          {error}
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

  // A short "typing…" beat before the greeting appears, so it feels like
  // David is really saying hello rather than a wall of text popping in.
  useEffect(() => {
    const id = setTimeout(() => setGreeted(true), 900);
    return () => clearTimeout(id);
  }, []);

  async function send() {
    const content = input.trim();
    if (!content || pending) return;
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

      {/* Ask David something (optional) */}
      {greeted ? (
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
