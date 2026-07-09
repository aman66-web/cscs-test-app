"use client";

import { useEffect } from "react";
import { getSettings } from "@/lib/settings/local-settings";
import {
  attachDailyReminder,
  REMINDER_BODY,
  REMINDER_TITLE,
} from "@/lib/notifications/local-notifications";

/**
 * Invisible app-level effect (mounted once in the root layout): inside the
 * native shell, re-attach the daily 18:00 reminder whenever the user's
 * preference is ON and notification permission is already granted. Never
 * prompts. This covers the journeys a toggle alone misses: onboarding done
 * on the web before installing the app, permission granted later in the
 * device Settings, and any schedule the OS dropped. On the plain web it is
 * a no-op.
 */
export function NativeReminderSync() {
  useEffect(() => {
    if (!getSettings().remindersEnabled) return;
    void attachDailyReminder(REMINDER_TITLE, REMINDER_BODY);
  }, []);

  return null;
}
