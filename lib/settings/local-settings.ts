// Device-local app settings (separate from study progress so a progress
// reset keeps preferences). Ported from the My Life in the UK Test app,
// minus the language fields (this app is English-only).

export type LocalSettings = {
  v: 1;
  /** Daily reminder toggle — scheduling is wired to the Capacitor
      LocalNotifications plugin (see lib/notifications/local-notifications.ts). */
  remindersEnabled: boolean;
};

const KEY = "cscs-settings-v1";

const DEFAULTS: LocalSettings = {
  v: 1,
  remindersEnabled: false,
};

function hasStorage(): boolean {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function getSettings(): LocalSettings {
  if (!hasStorage()) return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<LocalSettings>), v: 1 };
  } catch {
    return DEFAULTS;
  }
}

export function updateSettings(patch: Partial<LocalSettings>): LocalSettings {
  const next = { ...getSettings(), ...patch, v: 1 as const };
  if (hasStorage()) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // best-effort
    }
  }
  return next;
}

/** Clear device settings (account deletion — leaves no preference trace). */
export function clearSettings() {
  if (!hasStorage()) return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // best-effort
  }
}
