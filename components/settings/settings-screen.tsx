"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/app/onboarding/actions";
import { deleteAccount, updateFirstName } from "@/app/settings/actions";
import { wipeAllLocalData } from "@/lib/progress/local-progress";
import { clearSettings } from "@/lib/settings/local-settings";
import { disableDailyReminder } from "@/lib/notifications/local-notifications";

// Cloned from the My Life in the UK Test app's settings-screen.tsx, minus
// i18n and dark-mode classes (this app is light-only). The "book the real
// test" link points at the CITB HS&E booking page.

const CITB_BOOKING = "https://www.citb.co.uk/courses-and-qualifications/hse-test-and-cards/health-safety-and-environment-hse-test/";

export function SettingsScreen({
  initialFirstName,
  email,
}: {
  initialFirstName: string;
  email: string;
}) {
  const router = useRouter();

  // Name -----------------------------------------------------------------
  const [name, setName] = useState(initialFirstName);
  const [savingName, setSavingName] = useState(false);
  const [nameStatus, setNameStatus] = useState<string | null>(null);

  async function saveName() {
    setSavingName(true);
    setNameStatus(null);
    try {
      const res = await updateFirstName(name);
      setNameStatus(res.ok ? "Saved" : res.error);
      if (res.ok) router.refresh();
    } catch {
      // Offline / network failure — recover instead of a stuck button.
      setNameStatus("Something went wrong — please try again.");
    } finally {
      setSavingName(false);
    }
  }

  // Delete ---------------------------------------------------------------
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function confirmDelete() {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await deleteAccount();
      if (res.ok) {
        // App Store delete-my-data: leave NOTHING of the account on-device —
        // progress buckets + recorded user id, device settings (reminders),
        // and the scheduled native reminder.
        wipeAllLocalData();
        clearSettings();
        void disableDailyReminder();
        router.replace("/");
        router.refresh();
        return;
      }
      setDeleteError(res.error);
    } catch {
      setDeleteError("Something went wrong — please try again.");
    }
    setDeleting(false);
  }

  return (
    <main className="flex min-h-dvh flex-col bg-canvas">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-28 pt-safe">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          Settings
        </h1>

        {/* Profile */}
        <Section title="Profile">
          <label className="text-xs font-medium text-ink-soft">
            First name
          </label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setNameStatus(null);
            }}
            className="mt-1 h-12 w-full rounded-2xl border border-ink/10 bg-canvas px-4 text-[16px] text-ink outline-none transition focus:border-purple focus:ring-2 focus:ring-purple/30"
          />
          <button
            type="button"
            onClick={saveName}
            disabled={savingName || name.trim() === "" || name === initialFirstName}
            className="mt-3 flex h-11 items-center justify-center rounded-2xl bg-purple px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-deep active:scale-[0.99] disabled:opacity-40"
          >
            {savingName ? "Saving…" : "Save name"}
          </button>
          {nameStatus ? (
            <p className="mt-2 text-xs text-ink-soft">{nameStatus}</p>
          ) : null}

          <div className="mt-5">
            <p className="text-xs font-medium text-ink-soft">Email</p>
            <p className="mt-1 break-words text-sm text-ink">{email}</p>
          </div>
        </Section>

        {/* About */}
        <Section title="About">
          <p className="text-sm leading-relaxed text-ink-soft">
            A calm, focused way to prepare for the CITB Health, Safety &amp;
            Environment (HS&amp;E) test. Practice questions and mock tests are
            original study material and are not the official CITB questions.
          </p>
          <a
            href={CITB_BOOKING}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 flex items-center justify-between rounded-2xl border border-purple/30 bg-lilac px-4 py-3 text-sm font-semibold text-purple-deep transition hover:border-purple"
          >
            Book the real test with CITB
            <span aria-hidden="true">↗</span>
          </a>
        </Section>

        {/* Account */}
        <Section title="Account">
          <form action={signOut}>
            <button
              type="submit"
              className="flex h-12 w-full items-center justify-center rounded-2xl border border-purple bg-white text-sm font-semibold text-purple transition hover:bg-lilac"
            >
              Sign out
            </button>
          </form>

          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="mt-3 flex h-12 w-full items-center justify-center rounded-2xl text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            Delete account
          </button>
        </Section>
      </div>

      {confirming ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-md rounded-2xl bg-canvas p-6 shadow-xl">
            <h2 className="text-lg font-semibold tracking-tight text-ink">
              Delete your account?
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-soft">
              This permanently removes your account and all your progress.
              This can&apos;t be undone.
            </p>
            {deleteError ? (
              <p className="mt-3 text-sm text-red-600">{deleteError}</p>
            ) : null}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={deleting}
                className="flex h-12 flex-1 items-center justify-center rounded-2xl border border-ink/15 bg-canvas text-sm font-semibold text-ink transition hover:bg-lilac"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleting}
                className="flex h-12 flex-1 items-center justify-center rounded-2xl bg-red-600 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-[0.99] disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">
        {title}
      </h2>
      <div className="rounded-2xl border border-ink/10 bg-canvas p-5 shadow-sm">
        {children}
      </div>
    </section>
  );
}
