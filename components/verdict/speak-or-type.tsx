"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createDictation, dictationSupported, type Dictation } from "@/lib/verdict/voice";

// =============================================================================
// The one input control the whole game uses — opening, every question, closing.
//
// Voice and text are the SAME control, not two modes with different features.
// The mic writes into the same box the keyboard does, so a player can start a
// question out loud, stop, and finish it by typing. Dictation is additive; if
// the browser has no speech recognition the mic simply isn't offered and
// nothing else changes.
// =============================================================================

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  submitLabel: string;
  disabled?: boolean;
  busy?: boolean;
  /** Optional countdown, in seconds. Opening and closing are timed; Q&A isn't. */
  seconds?: number;
  onExpire?: () => void;
  autoFocus?: boolean;
};

export function SpeakOrType({
  value,
  onChange,
  onSubmit,
  placeholder,
  submitLabel,
  disabled = false,
  busy = false,
  seconds,
  onExpire,
  autoFocus = false,
}: Props) {
  const [listening, setListening] = useState(false);
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [left, setLeft] = useState(seconds ?? 0);

  const dictation = useRef<Dictation | null>(null);
  const textarea = useRef<HTMLTextAreaElement | null>(null);

  // Text already typed when the mic starts, so dictation appends rather than
  // wiping what the player has written.
  const prefix = useRef("");

  useEffect(() => {
    setVoiceAvailable(dictationSupported());
  }, []);

  // ---- countdown ----------------------------------------------------------
  const expired = useRef(false);
  useEffect(() => {
    if (seconds === undefined) return;
    setLeft(seconds);
    expired.current = false;

    const id = window.setInterval(() => {
      setLeft((remaining) => {
        if (remaining <= 1) {
          window.clearInterval(id);
          if (!expired.current) {
            expired.current = true;
            onExpire?.();
          }
          return 0;
        }
        return remaining - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
    // onExpire is intentionally excluded — a new identity each render would
    // restart the clock on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds]);

  // ---- dictation ----------------------------------------------------------
  const stopListening = useCallback(() => {
    dictation.current?.stop();
    setListening(false);
  }, []);

  useEffect(() => () => dictation.current?.stop(), []);

  const toggleMic = () => {
    if (listening) {
      stopListening();
      return;
    }

    setNotice(null);
    prefix.current = value.trim() ? `${value.trim()} ` : "";

    const session = createDictation({
      onText: (text) => onChange(`${prefix.current}${text}`),
      onError: (message) => {
        setNotice(message);
        setListening(false);
      },
      onEnd: () => setListening(false),
    });

    if (!session) {
      setNotice("This browser can't hear you — type instead.");
      setVoiceAvailable(false);
      return;
    }

    dictation.current = session;
    session.start();
    setListening(true);
  };

  const submit = () => {
    if (listening) stopListening();
    onSubmit();
  };

  const ready = value.trim().length > 0 && !disabled && !busy;

  return (
    <div className="flex flex-col gap-3">
      {seconds !== undefined && (
        <div className="flex items-center justify-between">
          <span className="vd-eyebrow">You have the floor</span>
          <span className="vd-clock text-sm" data-low={left <= 15}>
            {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
          </span>
        </div>
      )}

      <textarea
        ref={textarea}
        className="vd-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled || busy}
        autoFocus={autoFocus}
        rows={3}
        onKeyDown={(e) => {
          // Enter sends, Shift+Enter breaks the line. Cross-examination is a
          // fast back-and-forth and reaching for a button breaks the rhythm.
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (ready) submit();
          }
        }}
      />

      {notice && <p className="text-[13px] text-[color:var(--vd-lost)]">{notice}</p>}

      <div className="flex flex-wrap items-center gap-3">
        {voiceAvailable && (
          <button
            type="button"
            className="vd-mic"
            data-live={listening}
            onClick={toggleMic}
            disabled={disabled || busy}
            aria-pressed={listening}
          >
            <span className="vd-mic-dot" aria-hidden />
            {listening ? "Stop" : "Speak"}
          </button>
        )}

        <button
          type="button"
          className="vd-btn vd-btn-primary flex-1"
          onClick={submit}
          disabled={!ready}
        >
          {busy ? (
            <span className="vd-beat" aria-label="Working">
              <span />
              <span />
              <span />
            </span>
          ) : (
            submitLabel
          )}
        </button>
      </div>

      {!voiceAvailable && (
        <p className="vd-faint text-[12px]">
          Voice isn&apos;t available in this browser — typing works exactly the same.
        </p>
      )}
    </div>
  );
}
