// =============================================================
// In-app review prompt — the Apple-COMPLIANT "how are you enjoying it?" gate.
// Cloned from the My Life in the UK Test app's lib/review/review-prompt.ts.
//
// At a genuine positive moment (passing a mock, a strong practice run, a
// streak milestone) we show a soft pre-prompt: 👍 Loving it / 👎 Not really.
//   👍  → Apple's OFFICIAL StoreKit prompt (SKStoreReviewController) via
//         @capacitor-community/in-app-review. We NEVER build a custom star UI
//         or submit a rating ourselves — Apple owns that dialog.
//   👎  → a private feedback email, so unhappy users are heard but NOT sent
//         to the store.
//
// We throttle hard so we never nag, and stay well inside App Store etiquette:
//   • NATIVE only — StoreKit's prompt doesn't exist on the web, so we never
//     ask there.
//   • Never on first launch / the first positive moment (min events + a
//     min install age).
//   • A long cool-down between asks and a small lifetime cap.
//   • Once we've shown Apple's prompt we treat it as done and stop asking —
//     Apple itself only surfaces its dialog ~3×/year per user, so backing off
//     is the correct behaviour.
//
// State is DEVICE-global (a review decision follows the device / Apple ID, not
// whichever account is signed in) in its own localStorage key, separate from
// study progress so a progress reset or account switch never re-arms it.
// =============================================================

const KEY = "cscs-review-v1";

/** Never ask on the very first happy moment — wait for a track record. */
const MIN_POSITIVE_EVENTS = 2;
/** Give a fresh install time before the first ask (not on day one). */
const MIN_INSTALL_AGE_MS = 2 * 24 * 60 * 60 * 1000; // 2 days
/** Long gap between asks so we never nag. */
const COOLDOWN_MS = 60 * 24 * 60 * 60 * 1000; // ~2 months
/** Hard lifetime cap on how many times we'll ever show the pre-prompt. */
const MAX_ASKS = 4;

export type ReviewStatus = "none" | "reviewed" | "declined";

type ReviewState = {
  status: ReviewStatus;
  /** Positive moments seen (gates the very first ask). */
  positiveEvents: number;
  /** How many times we've shown the pre-prompt (lifetime cap). */
  timesAsked: number;
  /** Epoch ms of the last time we showed it (cool-down). */
  lastAskedAt: number;
  /** Epoch ms first seen on this device (min-install-age clock). */
  firstSeenAt: number;
};

const DEFAULTS: ReviewState = {
  status: "none",
  positiveEvents: 0,
  timesAsked: 0,
  lastAskedAt: 0,
  firstSeenAt: 0,
};

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

function read(): ReviewState {
  if (!hasStorage()) return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<ReviewState>) };
  } catch {
    return DEFAULTS;
  }
}

function write(patch: Partial<ReviewState>): ReviewState {
  const next = { ...read(), ...patch };
  if (hasStorage()) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // best-effort
    }
  }
  return next;
}

/** Are we running inside the native iOS/Android shell (where StoreKit's
 *  review prompt exists)? Reads the Capacitor global the shell injects. */
function isNative(): boolean {
  try {
    const cap =
      typeof window !== "undefined"
        ? (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor
        : undefined;
    return !!cap?.isNativePlatform?.();
  } catch {
    return false;
  }
}

function eligible(s: ReviewState, now: number): boolean {
  if (!isNative()) return false; // StoreKit prompt is native-only
  if (s.status === "reviewed") return false; // already sent to the store — done
  if (s.timesAsked >= MAX_ASKS) return false; // lifetime cap
  if (s.positiveEvents < MIN_POSITIVE_EVENTS) return false; // not on the first moment
  if (!s.firstSeenAt || now - s.firstSeenAt < MIN_INSTALL_AGE_MS) return false;
  if (s.lastAskedAt && now - s.lastAskedAt < COOLDOWN_MS) return false; // cool-down
  return true;
}

// ---- Imperative bridge to the mounted <ReviewGate/> --------------------------
type Listener = () => void;
const listeners = new Set<Listener>();

/** The mounted gate subscribes; returns an unsubscribe. */
export function onReviewRequest(cb: Listener): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function emit(): void {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch {
      // a broken listener must not break the others
    }
  });
}

/** Start the min-install-age clock the first time the app runs. Safe to call
 *  on every mount (no-op once set); harmless on the web. */
export function initReviewState(): void {
  if (!hasStorage()) return;
  const s = read();
  if (!s.firstSeenAt) write({ firstSeenAt: Date.now() });
}

/**
 * Call at a genuine positive moment (mock pass, strong practice run, streak
 * milestone). Increments the counter and, IF we're now within all the
 * throttle rules, asks the gate to show (after a short beat so the happy
 * screen registers first). Safe to call from anywhere and as often as you
 * like — the throttle guarantees we only actually ask occasionally, and never
 * on the web.
 */
export function notePositiveMoment(): void {
  if (!isNative()) return; // no prompt on the web; don't bother tracking
  const now = Date.now();
  const s = read();
  const next = write({
    positiveEvents: s.positiveEvents + 1,
    firstSeenAt: s.firstSeenAt || now,
  });
  if (eligible(next, now)) {
    // Let the celebratory screen paint before the ask slides in.
    setTimeout(emit, 900);
  }
}

/** The gate calls this the moment it becomes visible (counts the ask + starts
 *  the cool-down), so even a dismissed prompt won't nag. */
export function markShown(): void {
  const s = read();
  write({ timesAsked: s.timesAsked + 1, lastAskedAt: Date.now() });
}

/** They chose 👍 and we handed off to Apple's prompt — never ask again. */
export function markReviewed(): void {
  write({ status: "reviewed" });
}

/** They chose 👎 — record it (the cool-down + cap keep us from nagging). */
export function markDeclined(): void {
  write({ status: "declined" });
}

/**
 * Fire Apple's OFFICIAL review prompt (SKStoreReviewController on iOS, Play
 * In-App Review on Android) via the Capacitor plugin. Returns false on the web
 * or if the plugin/native call is unavailable. We deliberately do not — and
 * cannot — read whether the user actually submitted; Apple never tells us.
 */
export async function triggerNativeReview(): Promise<boolean> {
  if (!isNative()) return false;
  try {
    const { InAppReview } = await import("@capacitor-community/in-app-review");
    await InAppReview.requestReview();
    return true;
  } catch {
    return false;
  }
}

/** Open a pre-filled private feedback email (the 👎 path — never the store). */
export function openFeedbackEmail(subject: string, body: string): void {
  const href = `mailto:support@cscstestapp.com?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
  try {
    window.location.href = href;
  } catch {
    // best-effort
  }
}
