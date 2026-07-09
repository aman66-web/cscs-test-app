// =============================================================
// Daily study-streak reminder — native local notifications.
//
// On the iOS/Android shells this schedules a real daily notification via
// Capacitor LocalNotifications (no APNs certificate needed — LOCAL
// notifications are entirely on-device; only remote push needs certs).
// On the web it degrades to requesting browser Notification permission.
// The persisted preference is reconciled on every native launch by
// <NativeReminderSync/> (mounted in the root layout), which calls
// attachDailyReminder() — so a preference set on the web, or a permission
// granted later in iOS Settings, still produces a real schedule.
//
// One notification id is used so re-enabling always replaces rather than
// stacks. Wired from the onboarding "reminders" stage (and later the
// Profile toggle). Cloned from the My Life in the UK Test app; without
// i18n the strings live here as exported constants.
// =============================================================

import { Capacitor } from "@capacitor/core";

/** Default daily-reminder copy (the app is English-only). */
export const REMINDER_TITLE = "Keep your streak alive! 🔥";
export const REMINDER_BODY =
  "5 minutes of practice today keeps you on track for your CITB HS&E test.";

const DAILY_ID = 1001;
/** 18:00 local — early evening, the classic revision slot. */
const REMINDER_HOUR = 18;

function isNative(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

async function scheduleNative(title: string, body: string): Promise<void> {
  const { LocalNotifications } = await import(
    "@capacitor/local-notifications"
  );
  // Replace any previous schedule (same id) rather than stacking.
  await LocalNotifications.cancel({
    notifications: [{ id: DAILY_ID }],
  }).catch(() => {});
  await LocalNotifications.schedule({
    notifications: [
      {
        id: DAILY_ID,
        title,
        body,
        schedule: {
          on: { hour: REMINDER_HOUR, minute: 0 },
          allowWhileIdle: true,
        },
      },
    ],
  });
}

/**
 * Re-attach the native schedule WITHOUT prompting: no-op unless we're in the
 * shell AND permission is already granted. Called at every native launch (via
 * NativeReminderSync) when the user's reminder preference is ON — this is what
 * makes a web-set preference, a fresh install, or a permission granted later
 * in the device Settings actually produce the 18:00 reminder.
 */
export async function attachDailyReminder(
  title: string,
  body: string
): Promise<void> {
  if (!isNative()) return;
  try {
    const { LocalNotifications } = await import(
      "@capacitor/local-notifications"
    );
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== "granted") return;
    await scheduleNative(title, body);
  } catch {
    // best-effort
  }
}

/**
 * Turn the daily reminder ON. Returns true if a schedule (or web permission)
 * was actually established, false when permission was declined — callers
 * still persist the preference (NativeReminderSync attaches the schedule
 * automatically once permission exists) but should surface a "blocked" hint.
 */
export async function enableDailyReminder(
  title: string,
  body: string
): Promise<boolean> {
  if (isNative()) {
    try {
      const { LocalNotifications } = await import(
        "@capacitor/local-notifications"
      );
      // NB: after a one-time denial iOS never re-prompts — this resolves
      // display:"denied" silently, so we return false and the caller shows
      // the "allow in Settings" hint.
      const perm = await LocalNotifications.requestPermissions();
      if (perm.display !== "granted") return false;
      await scheduleNative(title, body);
      return true;
    } catch {
      return false;
    }
  }

  // Web fallback: permission only (no reliable scheduling outside the shell).
  try {
    if ("Notification" in window && Notification.permission === "default") {
      const res = await Notification.requestPermission();
      return res === "granted";
    }
    return "Notification" in window && Notification.permission === "granted";
  } catch {
    return false;
  }
}

/** Turn the daily reminder OFF (cancels the native schedule; no-op on web). */
export async function disableDailyReminder(): Promise<void> {
  if (!isNative()) return;
  try {
    const { LocalNotifications } = await import(
      "@capacitor/local-notifications"
    );
    await LocalNotifications.cancel({ notifications: [{ id: DAILY_ID }] });
  } catch {
    // best-effort
  }
}
