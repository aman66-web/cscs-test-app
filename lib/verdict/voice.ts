// =============================================================================
// VERDICT — voice.
//
// Voice is the headline feature and it is NOT the only way to play. Text mode
// is at full parity from day one, because a large share of sessions happen on a
// train, in an office, or next to a sleeping baby, and because some players
// cannot speak aloud at all. Every code path below degrades to text silently:
// nothing here throws, and nothing here is required for a complete trial.
//
// Milestone 1 uses the browser's own Web Speech API for both directions —
// no API key, no per-minute cost, and the witness starts talking instantly
// instead of waiting on an audio round-trip. Hosted TTS is a Milestone 2
// upgrade for voice quality, not a prerequisite for the game working.
// =============================================================================

import type { Personality } from "./types";

// The Web Speech API is not in TypeScript's DOM lib, so declare the sliver
// of it we actually touch rather than pulling in a types package.
type SpeechRecognitionAlternative = { transcript: string; confidence: number };
type SpeechRecognitionResult = {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
};
type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: { length: number; [index: number]: SpeechRecognitionResult };
};
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function recognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function dictationSupported(): boolean {
  return recognitionCtor() !== null;
}

export function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

// -----------------------------------------------------------------------------
// Dictation (player -> app)
// -----------------------------------------------------------------------------

export type Dictation = {
  start(): void;
  stop(): void;
};

/**
 * Continuous dictation with interim results, so the player can watch their
 * question appear as they ask it. `onText` receives the full text every time —
 * final segments plus whatever is currently being said — so the caller can just
 * render it without stitching anything together.
 */
export function createDictation(handlers: {
  onText: (text: string, isFinal: boolean) => void;
  onError?: (message: string) => void;
  onEnd?: () => void;
}): Dictation | null {
  const Ctor = recognitionCtor();
  if (!Ctor) return null;

  const recognition = new Ctor();
  recognition.lang = "en-GB";
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  let settled = "";
  let running = false;

  recognition.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const result = event.results[i];
      const text = result[0]?.transcript ?? "";
      if (result.isFinal) settled += text;
      else interim += text;
    }
    const combined = `${settled}${interim}`.replace(/\s+/g, " ").trim();
    handlers.onText(combined, interim === "");
  };

  recognition.onerror = (event) => {
    // "no-speech" and "aborted" are ordinary in a courtroom where the player is
    // thinking. Only surface things that actually block them.
    if (event.error === "no-speech" || event.error === "aborted") return;
    const message =
      event.error === "not-allowed" || event.error === "service-not-allowed"
        ? "Microphone blocked. Allow access, or switch to typing."
        : "Dictation stopped. You can type instead.";
    handlers.onError?.(message);
  };

  recognition.onend = () => {
    running = false;
    handlers.onEnd?.();
  };

  return {
    start() {
      if (running) return;
      settled = "";
      try {
        recognition.start();
        running = true;
      } catch {
        // start() throws if called while already starting. Harmless.
      }
    },
    stop() {
      try {
        recognition.stop();
      } catch {
        /* already stopped */
      }
    },
  };
}

// -----------------------------------------------------------------------------
// Witness voice (app -> player)
// -----------------------------------------------------------------------------

/**
 * Per-personality delivery. The nervous witness rushes, the smug one takes his
 * time, the rehearsed one is flat and even. It is a cheap effect and it makes
 * five witnesses sound like five people.
 */
const DELIVERY: Record<Personality, { rate: number; pitch: number }> = {
  nervous: { rate: 1.14, pitch: 1.12 },
  hostile: { rate: 1.04, pitch: 0.88 },
  smug: { rate: 0.92, pitch: 0.96 },
  rehearsed: { rate: 0.99, pitch: 1.0 },
  sympathetic: { rate: 0.94, pitch: 1.06 },
};

/** Prefer a British English voice so the fictional court sounds like one. */
function pickVoice(): SpeechSynthesisVoice | null {
  if (!speechSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;
  return (
    voices.find((v) => v.lang === "en-GB" && !v.localService) ??
    voices.find((v) => v.lang === "en-GB") ??
    voices.find((v) => v.lang.startsWith("en")) ??
    voices[0]
  );
}

export function stopSpeaking(): void {
  if (speechSupported()) window.speechSynthesis.cancel();
}

/**
 * Speak the witness's answer. Resolves when the audio finishes, or immediately
 * if speech is unavailable — callers must never block the trial on this.
 */
export function speak(text: string, personality: Personality): Promise<void> {
  if (!speechSupported() || !text.trim()) return Promise.resolve();

  return new Promise((resolve) => {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const delivery = DELIVERY[personality];
    utterance.rate = delivery.rate;
    utterance.pitch = delivery.pitch;
    utterance.lang = "en-GB";

    const voice = pickVoice();
    if (voice) utterance.voice = voice;

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };

    utterance.onend = finish;
    utterance.onerror = finish;

    // Some browsers silently drop long utterances. Never leave the UI waiting
    // on a promise that will not settle.
    const guard = window.setTimeout(finish, 2000 + text.length * 90);
    void guard;

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Voice lists load asynchronously in most browsers. Calling this early means
 * the first witness answer is not stuck with the default robot.
 */
export function primeVoices(): void {
  if (!speechSupported()) return;
  window.speechSynthesis.getVoices();
}
