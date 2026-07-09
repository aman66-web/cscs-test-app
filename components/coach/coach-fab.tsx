"use client";

import { useEffect, useRef, useState } from "react";
import { CoachAvatar } from "@/components/coach/coach-avatar";
import { coachSummary } from "@/lib/progress/local-progress";

// Cloned from the My Life in the UK Test app's coach-fab.tsx, minus i18n.

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Explain this more simply",
  "Why is that the right answer?",
  "Quiz me on this topic",
];

/**
 * Floating AI-coach button (bottom-right) that opens a chat sheet. Lives on
 * the Learn and Practice surfaces so help is always one tap away. The
 * optional `context` (current lesson / question) is prepended invisibly to
 * the first message so the coach knows what the user is looking at.
 */
export function CoachFab({
  context,
  aboveTabBar = false,
}: {
  /** What the user is currently looking at, e.g. a lesson title. */
  context?: string;
  /** Raise the button above the floating tab bar / quiz buttons. */
  aboveTabBar?: boolean;
}) {
  const [open, setOpen] = useState(false);
  // Expanded = the sheet takes the whole screen (little ⤢ in the header).
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, pending, open]);

  async function callApi(history: Msg[]) {
    setPending(true);
    setError(null);
    try {
      // Context rides along invisibly on the wire, not in the visible thread.
      const wire =
        context && history.length > 0
          ? [
              {
                ...history[0],
                content: `[I'm currently looking at: ${context}]\n${history[0].content}`,
              },
              ...history.slice(1),
            ]
          : history;
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Study progress lives on-device; send a compact summary so the
        // coach can personalise (readiness, weakest modules).
        body: JSON.stringify({ messages: wire, progress: coachSummary() }),
      });
      const data = (await res.json()) as {
        reply?: string;
        error?: string;
        code?: string;
      };
      if (!res.ok || !data.reply) {
        if (data.code === "daily_limit") {
          // Daily cost cap reached — sending disabled until tomorrow
          // (the server re-enforces regardless).
          setLimitReached(true);
          setError("You've used your coach messages for today — check back tomorrow!");
        } else {
          setError(data.error ?? "Something went wrong — please try again.");
        }
      } else {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: data.reply as string },
        ]);
      }
    } catch {
      setError("Something went wrong — please try again.");
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

  const bottom = aboveTabBar
    ? "max(100px, calc(env(safe-area-inset-bottom) + 88px))"
    : "max(20px, env(safe-area-inset-bottom))";

  return (
    <>
      {/* The floating button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Ask the AI coach"
        className="fixed right-4 z-40 flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#F97316,#C2410C)] text-[24px] shadow-[0_14px_26px_-8px_rgba(249, 115, 22,0.75)] transition hover:scale-105 active:scale-95"
        style={{ bottom }}
      >
        <span aria-hidden="true">🎓</span>
        <span
          aria-hidden="true"
          className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-[#FACC15] text-[9px]"
        >
          ✨
        </span>
      </button>

      {/* Chat sheet */}
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-label="AI coach"
            onClick={(e) => e.stopPropagation()}
            className={`flex w-full max-w-md flex-col bg-white px-5 pb-[max(16px,env(safe-area-inset-bottom))] ${
              expanded
                ? "h-dvh max-h-none rounded-none pt-[max(14px,env(safe-area-inset-top))]"
                : "max-h-[82dvh] rounded-t-[28px] pt-3"
            }`}
          >
            {expanded ? null : (
              <div className="mx-auto h-1.5 w-12 flex-none rounded-full bg-ink/15" aria-hidden="true" />
            )}
            <div className="mt-3 flex flex-none items-center gap-2.5">
              <CoachAvatar size={38} />
              <div className="min-w-0 flex-1">
                <h3 className="text-[15px] font-extrabold tracking-[-0.3px] text-ink">
                  David
                </h3>
                <p className="truncate text-[11px] font-semibold text-ink-soft">
                  {context ?? "Your AI coach"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                aria-label={expanded ? "Shrink chat" : "Expand chat"}
                className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-ink/5 text-ink-soft transition hover:bg-ink/10"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  {expanded ? (
                    // Collapse: arrows pointing inwards
                    <path d="M5.5 1v3.5H2M8.5 13V9.5H12M2 8.5h3.5V12M12 5.5H8.5V2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  ) : (
                    // Expand: arrows pointing outwards
                    <path d="M8.5 1H13v4.5M5.5 13H1V8.5M13 1 8 6M1 13l5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                </svg>
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setExpanded(false);
                }}
                aria-label="Close"
                className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-ink/5 font-extrabold text-ink-soft"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="min-h-[200px] flex-1 overflow-y-auto py-3">
              {messages.length === 0 ? (
                <div>
                  <p className="text-[13px] font-semibold leading-relaxed text-ink-soft">
                    Stuck on something? Ask me anything — I know the HS&amp;E
                    material and your progress.
                  </p>
                  <div className="mt-3 space-y-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => send(s)}
                        className="flex w-full items-center justify-between rounded-2xl border-[1.5px] border-ink/10 bg-white px-4 py-3 text-start text-[13.5px] font-bold text-ink transition hover:border-purple/40"
                      >
                        {s}
                        <span className="inline-block text-purple-deep" aria-hidden="true">
                          →
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {messages.map((m, i) => (
                    <div
                      key={i}
                      className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-[13.5px] font-medium leading-relaxed ${
                          m.role === "user"
                            ? "bg-purple text-white"
                            : "bg-[#F7F1E9] text-ink"
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {pending ? (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-1 rounded-2xl bg-[#F7F1E9] px-4 py-3">
                        {["0ms", "150ms", "300ms"].map((d) => (
                          <span
                            key={d}
                            className="h-2 w-2 animate-bounce rounded-full bg-ink-soft"
                            style={{ animationDelay: d }}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {error ? (
                    <p className="text-[12.5px] font-bold text-bad">{error}</p>
                  ) : null}
                </div>
              )}
            </div>

            {/* Input */}
            <form
              className="flex flex-none items-center gap-2 pt-1"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
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
                disabled={pending || limitReached || input.trim() === ""}
                aria-label="Send"
                className="flex h-12 w-12 flex-none items-center justify-center rounded-full bg-[linear-gradient(180deg,#F97316,#C2410C)] text-white shadow-[0_10px_20px_-8px_rgba(249, 115, 22,0.7)] transition active:scale-95 disabled:opacity-40"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path
                    d="M5 12h13M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
