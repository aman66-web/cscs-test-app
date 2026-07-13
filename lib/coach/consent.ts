// Device-local record that the user has seen and accepted the one-time notice
// explaining that AI-coach messages are sent to Anthropic to generate replies.
// Kept separate from settings/progress so it survives a progress reset but is
// wiped on account deletion (see clearCoachConsent). Purely device-local — a
// disclosure acknowledgement, never sent anywhere.

const KEY = "cscs-coach-consent-v1";

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

/** Has the user accepted the AI-coach data-sharing notice on this device? */
export function hasCoachConsent(): boolean {
  if (!hasStorage()) return false;
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

/** Record acceptance of the AI-coach notice. */
export function grantCoachConsent(): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {
    // best-effort
  }
}

/** Forget the acknowledgement (account deletion — leaves no trace on-device). */
export function clearCoachConsent(): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // best-effort
  }
}
