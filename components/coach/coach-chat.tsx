"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CoachAvatar } from "@/components/coach/coach-avatar";
import { coachSummary } from "@/lib/progress/local-progress";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "What should I revise today?",
  "Quiz me on working at height",
  "Am I ready to book my HS&E test?",
  "Explain safe manual handling",
];

/**
 * Full-screen AI coach chat ("David"). Ported from the My Life in the UK Test
 * app, de-internationalised and re-themed for CSCS. Posts to /api/coach with
 * the conversation + an on-device progress summary for personalisation.
 */
export function CoachChat({ greetingName }: { greetingName: string }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, pending]);

  async function callApi(history: Msg[]) {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, progress: coachSummary() }),
      });
      const data = (await res.json()) as { reply?: string; error?: string; code?: string };
      if (!res.ok || !data.reply) {
        if (data.code === "daily_limit") {
          setLimitReached(true);
          setError("You've used your coach messages for today — check back tomorrow!");
        } else {
          setError(data.error ?? "Something went wrong — please try again.");
        }
      } else {
        setMessages((m) => [...m, { role: "assistant", content: data.reply as string }]);
      }
    } catch {
      setError("Couldn't reach the coach. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  function send(text: string) {
    const content = text.trim();
    if (!content || pending || limitReached) return;
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    void callApi(next);
  }

  function retry() {
    if (pending || limitReached) return;
    void callApi(messages);
  }

  const empty = messages.length === 0;

  return (
    <main className="relative flex h-dvh flex-col bg-[#F6F4FC]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[190px] bg-[radial-gradient(120%_100%_at_50%_0%,rgba(139,75,245,0.14)_0%,rgba(139,75,245,0)_70%)]" />

      {/* Header */}
      <div className="relative z-10 mx-auto flex w-full max-w-md shrink-0 items-center gap-3 px-6 pt-safe">
        <Link href="/" aria-label="Back" className="text-lg font-bold text-ink-soft">
          ←
        </Link>
        <CoachAvatar size={46} />
        <div>
          <h1 className="text-[19px] font-extrabold tracking-[-0.3px] text-ink">David</h1>
          <p className="mt-0.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-ink-soft">
            <span className="inline-block h-2 w-2 rounded-full bg-good" /> Your CSCS coach
          </p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="mx-auto w-full max-w-md flex-1 overflow-y-auto px-6 py-4">
        {empty ? (
          <div className="flex min-h-full flex-col justify-center pb-6">
            <div className="flex flex-col items-center text-center">
              <CoachAvatar size={72} />
              <h2 className="mt-4 text-[22px] font-extrabold tracking-[-0.4px] text-ink">Hi {greetingName} 👋</h2>
              <p className="mt-1.5 max-w-[280px] text-sm font-medium text-ink-soft">
                Ask me anything about your CSCS Health, Safety &amp; Environment revision.
              </p>
              <p className="mt-7 text-[12px] font-extrabold uppercase tracking-[0.6px] text-ink-soft">Try asking:</p>
              <div className="mt-2 w-full space-y-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="flex w-full items-center justify-between rounded-full border border-ink/10 bg-white py-3 pe-4 ps-5 text-start text-sm font-bold text-ink shadow-[0_10px_22px_-18px_rgba(33,27,78,0.4)] transition hover:border-purple/40"
                  >
                    {s}
                    <span className="inline-block text-purple-deep">→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[85%] whitespace-pre-wrap break-words rounded-[18px] rounded-ee-[6px] bg-[linear-gradient(135deg,#8B4BF5,#6D28D9)] px-4 py-3 text-sm leading-relaxed text-white shadow-[0_10px_20px_-12px_rgba(124,58,237,0.7)]">
                    {m.content}
                  </div>
                </div>
              ) : (
                <div key={i} className="flex items-end justify-start gap-2">
                  <CoachAvatar size={26} className="mb-0.5" />
                  <div className="max-w-[82%] whitespace-pre-wrap break-words rounded-[18px] rounded-es-[6px] border border-ink/[0.06] bg-white px-4 py-3 text-sm leading-relaxed text-ink shadow-[0_10px_22px_-18px_rgba(33,27,78,0.35)]">
                    {m.content}
                  </div>
                </div>
              )
            )}

            {pending ? (
              <div className="flex items-end justify-start gap-2">
                <CoachAvatar size={26} className="mb-0.5" />
                <div className="flex items-center gap-1 rounded-[18px] rounded-es-[6px] border border-ink/[0.06] bg-white px-4 py-3">
                  <Dot delay="0ms" />
                  <Dot delay="150ms" />
                  <Dot delay="300ms" />
                </div>
              </div>
            ) : null}

            {error ? (
              <div className="flex flex-col items-start gap-2">
                <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
                {!limitReached ? (
                  <button type="button" onClick={retry} className="text-sm font-semibold text-purple-deep hover:underline">
                    Try again
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="mx-auto w-full max-w-md shrink-0 px-6 pb-[calc(16px+env(safe-area-inset-bottom))] pt-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={limitReached}
            placeholder="Ask your coach anything…"
            className="h-12 flex-1 rounded-full border border-ink/10 bg-white px-5 text-[16px] text-ink shadow-[0_10px_22px_-18px_rgba(33,27,78,0.4)] outline-none transition focus:border-purple focus:ring-2 focus:ring-purple/30 disabled:opacity-60"
          />
          <button
            type="submit"
            aria-label="Send"
            disabled={pending || limitReached || input.trim() === ""}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#8B4BF5,#6D28D9)] text-white shadow-[0_10px_20px_-8px_rgba(124,58,237,0.7)] transition hover:brightness-110 active:scale-[0.97] disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
              <path d="M5 12h13M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </form>
      </div>
    </main>
  );
}

function Dot({ delay }: { delay: string }) {
  return <span className="h-2 w-2 animate-bounce rounded-full bg-ink-soft" style={{ animationDelay: delay }} />;
}
