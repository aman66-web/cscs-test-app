"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/app/onboarding/actions";
import { updateDailyGoal, updateTestDate } from "@/app/settings/actions";
import {
  clearTourSeen,
  currentStreak,
  exportProgressJson,
  getProgress,
  resetProgress,
  todayKey,
} from "@/lib/progress/local-progress";
import { getSettings, updateSettings } from "@/lib/settings/local-settings";
import {
  disableDailyReminder,
  enableDailyReminder,
  REMINDER_BODY,
  REMINDER_TITLE,
} from "@/lib/notifications/local-notifications";

// Cloned from the My Life in the UK Test app's profile-screen.tsx, minus
// i18n and the app-language picker (this app is English-only).

const GOAL_OPTIONS = [5, 15, 30, 45, 60];

function formatTestDate(iso: string | null): string | null {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Profile tab (prototype view-profile): gradient avatar, name, test date +
 * daily goal, streak/XP/mocks stats, settings rows and sign out. Streak/XP/
 * mock stats come from the local progress store; test date + goal live in
 * the Supabase profile.
 */
export function ProfileScreen({
  name,
  testDate,
  goalMinutes,
}: {
  name: string;
  testDate: string | null;
  goalMinutes: number;
}) {
  const router = useRouter();
  const [stats, setStats] = useState({ streak: 0, xp: 0, mocks: 0 });
  const [editing, setEditing] = useState<null | "date" | "goal">(null);
  const [dateDraft, setDateDraft] = useState(testDate ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reminders, setReminders] = useState(false);
  const [notifBlocked, setNotifBlocked] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    const p = getProgress();
    setStats({ streak: currentStreak(p), xp: p.xp, mocks: p.mocksTaken });
    setReminders(getSettings().remindersEnabled);
  }, []);

  async function toggleReminders() {
    // Persists the preference AND (un)schedules the real daily reminder —
    // a native local notification in the iOS/Android shell, browser
    // permission on the web (lib/notifications/local-notifications.ts).
    // Side effects stay OUTSIDE the state updater (React updaters must be
    // pure — StrictMode double-invokes them).
    const next = !reminders;
    setReminders(next);
    setNotifBlocked(false);
    updateSettings({ remindersEnabled: next });
    if (next) {
      const ok = await enableDailyReminder(REMINDER_TITLE, REMINDER_BODY);
      // Permission denied (iOS never re-prompts after a one-time denial):
      // keep the preference ON — NativeReminderSync self-heals the schedule
      // if the user later allows notifications in Settings — but tell them
      // why nothing will arrive yet.
      if (!ok) setNotifBlocked(true);
    } else {
      void disableDailyReminder();
    }
  }

  async function handleExport() {
    const json = exportProgressJson();
    const filename = "cscs-test-app-data.json";

    // Native shell: the WKWebView ignores the anchor `download` attribute and
    // blob URLs, so write a real file and open the OS share sheet instead.
    const { Capacitor } = await import("@capacitor/core");
    if (Capacitor.isNativePlatform()) {
      try {
        const { Filesystem, Directory, Encoding } = await import(
          "@capacitor/filesystem"
        );
        const { Share } = await import("@capacitor/share");
        await Filesystem.writeFile({
          path: filename,
          data: json,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        });
        const { uri } = await Filesystem.getUri({
          path: filename,
          directory: Directory.Cache,
        });
        await Share.share({ title: "CSCS Test App data", url: uri });
      } catch {
        // User dismissed the share sheet, or a plugin isn't available — no-op.
      }
      return;
    }

    // Web: standard blob download.
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleReset() {
    resetProgress();
    setConfirmReset(false);
    setStats({ streak: 0, xp: 0, mocks: 0 });
    router.refresh();
  }

  async function saveDate() {
    setSaving(true);
    setError(null);
    try {
      const res = await updateTestDate(dateDraft || null);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setEditing(null);
      router.refresh();
    } catch {
      // Offline / network failure — recover instead of a stuck button.
      setError("Something went wrong — please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function saveGoal(minutes: number) {
    setSaving(true);
    setError(null);
    try {
      const res = await updateDailyGoal(minutes);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setEditing(null);
      router.refresh();
    } catch {
      setError("Something went wrong — please try again.");
    } finally {
      setSaving(false);
    }
  }

  const initial = (name || "?").charAt(0).toUpperCase();
  const dateLabel = formatTestDate(testDate);

  const row =
    "mt-2.5 flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-[15px] text-start text-sm font-bold text-ink shadow-[0_10px_24px_-16px_rgba(33,27,78,0.25)] transition hover:bg-[#FDFCFF]";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-32 pt-safe">
      {/* Head */}
      <div className="mt-2 flex flex-col items-center text-center">
        <div className="flex h-[84px] w-[84px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#8B4BF5,#6D28D9)] text-[32px] font-extrabold text-white shadow-[0_16px_32px_-14px_rgba(124,58,237,0.6)]">
          {initial}
        </div>
        <div className="mt-3 flex max-w-full items-center justify-center gap-1.5">
          <h1 className="min-w-0 break-words text-[21px] font-extrabold tracking-[-0.4px] text-ink">
            {name || "Your profile"}
          </h1>
          {/* Edit name → the Settings name editor (validates + saves to the
              profile, so the greeting + avatar initial update everywhere). */}
          <Link
            href="/settings"
            aria-label="Edit name"
            title="Edit name"
            className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-ink/5 text-[13px] transition hover:bg-lilac"
          >
            ✏️
          </Link>
        </div>
        <p className="mt-0.5 text-[13px] font-semibold text-ink-soft">
          {dateLabel ? `Test date: ${dateLabel}` : "No test date yet"} ·{" "}
          {goalMinutes} min/day
        </p>
      </div>

      {/* Stats (local progress store) */}
      <div className="mt-[18px] flex gap-2.5">
        {[
          { emoji: "🔥", value: String(stats.streak), label: "DAY STREAK" },
          { emoji: "⚡", value: stats.xp.toLocaleString("en-GB"), label: "TOTAL XP" },
          { emoji: "🏆", value: String(stats.mocks), label: "MOCK TESTS" },
        ].map((s) => (
          <div
            key={s.label}
            className="min-w-0 flex-1 rounded-2xl bg-white px-2.5 py-3.5 text-center shadow-[0_10px_24px_-14px_rgba(33,27,78,0.3)]"
          >
            <div className="text-xl" aria-hidden="true">
              {s.emoji}
            </div>
            <div className="mt-1 text-[17px] font-extrabold text-ink">{s.value}</div>
            <div className="mt-0.5 text-[10.5px] font-bold text-ink-soft">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Settings rows */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setEditing(editing === "date" ? null : "date")}
          className={row}
        >
          <span className="flex-none text-lg" aria-hidden="true">📅</span>
          My test date
          <span className="ms-auto text-ink-soft" aria-hidden="true">
            {dateLabel ?? "Set"} ›
          </span>
        </button>
        {editing === "date" ? (
          <div className="mt-2 rounded-2xl bg-white p-4 shadow-[0_10px_24px_-16px_rgba(33,27,78,0.25)]">
            <label className="text-[12.5px] font-bold text-ink" htmlFor="test-date">
              When is your test?
            </label>
            <input
              id="test-date"
              type="date"
              value={dateDraft}
              min={todayKey()}
              onChange={(e) => setDateDraft(e.target.value)}
              className="input-boxed mt-2"
            />
            <div className="mt-3 flex gap-2.5">
              <button
                type="button"
                onClick={saveDate}
                disabled={saving}
                className="btn-primary !h-11 flex-1 !text-sm"
              >
                {saving ? "Saving…" : "Save"}
              </button>
              {testDate ? (
                <button
                  type="button"
                  onClick={async () => {
                    // Honour the server result like Save does — don't silently
                    // close the editor if clearing failed (session/RLS error).
                    setSaving(true);
                    setError(null);
                    try {
                      const res = await updateTestDate(null);
                      if (!res.ok) {
                        setError(res.error);
                        return;
                      }
                      setDateDraft("");
                      setEditing(null);
                      router.refresh();
                    } catch {
                      setError("Something went wrong — please try again.");
                    } finally {
                      setSaving(false);
                    }
                  }}
                  className="btn-secondary !h-11 flex-1 !text-sm"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setEditing(editing === "goal" ? null : "goal")}
          className={row}
        >
          <span className="flex-none text-lg" aria-hidden="true">⏱️</span>
          Daily goal
          <span className="ms-auto text-ink-soft" aria-hidden="true">
            {goalMinutes} min ›
          </span>
        </button>
        {editing === "goal" ? (
          <div className="mt-2 rounded-2xl bg-white p-4 shadow-[0_10px_24px_-16px_rgba(33,27,78,0.25)]">
            <p className="text-[12.5px] font-bold text-ink">Minutes per day</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {GOAL_OPTIONS.map((m) => (
                <button
                  key={m}
                  type="button"
                  disabled={saving}
                  onClick={() => void saveGoal(m)}
                  className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition ${
                    m === goalMinutes
                      ? "border-purple bg-lilac text-purple-deep"
                      : "border-ink/10 bg-white text-ink hover:border-purple/40"
                  }`}
                >
                  {m} min
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {error ? (
          <p className="mt-2 text-xs font-bold text-bad">{error}</p>
        ) : null}

        {/* Daily reminder */}
        <button type="button" onClick={() => void toggleReminders()} className={row}>
          <span className="flex-none text-lg" aria-hidden="true">🔔</span>
          Daily reminder
          <span
            className={`ms-auto flex h-7 w-12 flex-none items-center rounded-full p-1 transition ${
              reminders ? "bg-purple" : "bg-ink/15"
            }`}
            role="switch"
            aria-checked={reminders}
          >
            <span
              className={`h-5 w-5 rounded-full bg-white shadow transition-transform ${
                reminders ? "translate-x-5" : ""
              }`}
            />
          </span>
        </button>
        {notifBlocked ? (
          <p className="mt-1.5 px-1 text-xs font-semibold leading-snug text-ink-soft">
            Notifications are blocked for this app — allow them in your device
            Settings to get the daily reminder.
          </p>
        ) : null}

        <Link href="/settings" className={row}>
          <span className="flex-none text-lg" aria-hidden="true">💬</span>
          Help &amp; support
          <span className="ms-auto inline-block text-ink-soft" aria-hidden="true">›</span>
        </Link>

        {/* Legal (public pages, also reachable without signing in) */}
        <Link href="/privacy" className={row}>
          <span className="flex-none text-lg" aria-hidden="true">🔒</span>
          Privacy Policy
          <span className="ms-auto inline-block text-ink-soft" aria-hidden="true">›</span>
        </Link>
        <Link href="/terms" className={row}>
          <span className="flex-none text-lg" aria-hidden="true">📄</span>
          Terms
          <span className="ms-auto inline-block text-ink-soft" aria-hidden="true">›</span>
        </Link>

        {/* Replay the first-run dashboard walkthrough */}
        <button
          type="button"
          onClick={() => {
            clearTourSeen();
            router.push("/dashboard");
          }}
          className={row}
        >
          <span className="flex-none text-lg" aria-hidden="true">🧭</span>
          Replay app walkthrough
          <span className="ms-auto inline-block text-ink-soft" aria-hidden="true">›</span>
        </button>

        {/* Data controls (App Store requirement: export + delete) */}
        <button type="button" onClick={handleExport} className={row}>
          <span className="flex-none text-lg" aria-hidden="true">📦</span>
          Export my data
          <span className="ms-auto inline-block text-ink-soft" aria-hidden="true">›</span>
        </button>

        <button
          type="button"
          onClick={() => setConfirmReset(true)}
          className={`${row} text-[#B93B3B]`}
        >
          <span className="flex-none text-lg" aria-hidden="true">🧹</span>
          Reset my progress
          <span className="ms-auto inline-block text-ink-soft" aria-hidden="true">›</span>
        </button>

        <Link href="/settings" className={`${row} text-[#B93B3B]`}>
          <span className="flex-none text-lg" aria-hidden="true">🗑️</span>
          Delete account &amp; data
          <span className="ms-auto inline-block text-ink-soft" aria-hidden="true">›</span>
        </Link>

        <form action={signOut}>
          <button type="submit" className={`${row} text-[#B93B3B]`}>
            <span className="flex-none text-lg" aria-hidden="true">🚪</span>
            Sign out
          </button>
        </form>
      </div>

      {/* Reset confirmation */}
      {confirmReset ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 backdrop-blur-sm"
          onClick={() => setConfirmReset(false)}
        >
          <div
            role="dialog"
            aria-label="Reset my progress"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-[28px] bg-white px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-3"
          >
            <div className="mx-auto h-1.5 w-12 rounded-full bg-ink/15" aria-hidden="true" />
            <h3 className="mt-4 text-lg font-extrabold tracking-[-0.4px] text-ink">
              Reset my progress?
            </h3>
            <p className="mt-2 text-sm font-medium leading-relaxed text-ink-soft">
              This wipes your XP, streak, scores and mistakes on this device.
              It cannot be undone.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-5 flex h-[54px] w-full items-center justify-center rounded-full bg-[#E05555] text-base font-bold text-white transition hover:bg-[#C94A4A]"
            >
              Reset my progress
            </button>
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="btn-secondary mt-3"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
