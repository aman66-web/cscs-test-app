"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { saveOnboarding, signOut } from "@/app/onboarding/actions";
import {
  firstUnansweredIndex,
  getSteps,
  type Answers,
  type SaveOnboardingInput,
  type StepId,
  type TopicKey,
} from "@/lib/onboarding/types";
import {
  HardestStep,
  MeetCoachStep,
  ScoreStep,
  StepHeader,
  TakenBeforeStep,
  TextStep,
} from "@/components/onboarding/steps";
import { BrandSplash } from "@/components/brand/brand-splash";
import { BrandLogo } from "@/components/brand/logo";
import { updateSettings } from "@/lib/settings/local-settings";
import {
  enableDailyReminder,
  REMINDER_BODY,
  REMINDER_TITLE,
} from "@/lib/notifications/local-notifications";

// Cloned from the My Life in the UK Test app's onboarding-flow.tsx.
// Adaptations: i18n + the language picker removed (English-only), and the
// copy swapped for the CITB HS&E test (score out of 50, HS&E reminders).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SPLASH_MS = 2400;

// Per-step emoji, shown in a rounded white tile (prototype .emoji-badge).
const STEP_EMOJI: Record<StepId, string> = {
  firstName: "👋",
  email: "✉️",
  takenBefore: "📚",
  hardest: "🧠",
  notifications: "🔔",
  meetCoach: "🎓",
};

/** iOS-style example notification card (what a daily nudge looks like). */
function NotificationPreview({ body, time }: { body: string; time: string }) {
  return (
    <div className="mt-2.5 flex items-start gap-3 rounded-[18px] border border-white/70 bg-white/90 p-3.5 shadow-[0_12px_26px_-14px_rgba(28, 25, 23,0.35)] backdrop-blur">
      <BrandLogo className="h-[38px] w-[38px] flex-none rounded-[10px]" />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[13px] font-extrabold text-ink">
            CSCS Test App
          </span>
          <span className="flex-none text-[11px] font-semibold text-ink-soft">
            {time}
          </span>
        </div>
        <p className="mt-0.5 text-[12.5px] font-medium leading-snug text-[#4A4570]">
          {body}
        </p>
      </div>
    </div>
  );
}

function EmojiBadge({ emoji }: { emoji: string }) {
  return (
    <div
      aria-hidden="true"
      className="mb-4 flex h-16 w-16 flex-none items-center justify-center rounded-[20px] bg-white text-[32px] shadow-[0_12px_26px_-12px_rgba(28, 25, 23,0.35)]"
    >
      {emoji}
    </div>
  );
}

export function OnboardingFlow({
  initial,
  accountEmail,
}: {
  initial: Answers;
  accountEmail: string;
}) {
  const router = useRouter();

  // Everything we already know at sign-in: the profile row (which carries a
  // provider name when Apple/Google returned one) plus the account email
  // (Apple "Hide My Email" relay addresses included).
  const seed: Answers = { ...initial, email: initial.email || accountEmail };

  const [answers, setAnswers] = useState<Answers>(seed);
  // Decide the step list ONCE, from what we knew at sign-in — so filling a step
  // that IS shown (e.g. the name on email sign-up) can't drop it from the list
  // mid-flow and jump the user forward. getSteps skips the name step when a
  // provider gave a name, and the email step whenever we already have an email.
  const [steps] = useState<StepId[]>(() => getSteps(seed));
  const [stepIndex, setStepIndex] = useState(() => firstUnansweredIndex(seed));
  const [direction, setDirection] = useState<1 | -1>(1);
  const [entered, setEntered] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const safeIndex = Math.min(stepIndex, steps.length - 1);
  const stepId = steps[safeIndex];
  const isLast = safeIndex === steps.length - 1;

  useEffect(() => {
    setEntered(false);
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setEntered(true))
    );
    return () => cancelAnimationFrame(id);
  }, [safeIndex]);

  async function persist(input: SaveOnboardingInput): Promise<boolean> {
    setPending(true);
    setError(null);
    try {
      const res = await saveOnboarding(input);
      if (!res.ok) {
        setError(res.error);
        return false;
      }
      return true;
    } catch {
      // Network failure mid-action — surface it instead of leaving the
      // button stuck in "Saving…" forever.
      setError("Something went wrong — please try again.");
      return false;
    } finally {
      setPending(false);
    }
  }

  function inputForStep(id: StepId): SaveOnboardingInput | null {
    switch (id) {
      case "firstName":
        return { step: "firstName", firstName: answers.firstName };
      case "meetCoach":
        // Client-only stage (David's hello) — nothing to persist.
        return null;
      case "email":
        return { step: "email", email: answers.email };
      case "takenBefore":
        return { step: "takenBefore", takenBefore: answers.takenBefore === true };
      case "hardest":
        return {
          step: "hardest",
          hardestTopics: answers.hardestTopics,
          hardestNotes: answers.hardestNotes,
        };
      case "notifications":
        // Reminders are device-local — nothing extra to persist server-side.
        return { step: "finish" };
    }
  }

  function canProceed(id: StepId): boolean {
    switch (id) {
      case "firstName":
        return answers.firstName.trim() !== "";
      case "meetCoach":
        return true;
      case "email":
        return EMAIL_RE.test(answers.email.trim());
      case "takenBefore":
        return answers.takenBefore !== null;
      case "hardest":
        return true;
      case "notifications":
        return true;
    }
  }

  function goTo(nextIndex: number, dir: 1 | -1) {
    setDirection(dir);
    setError(null);
    setStepIndex(nextIndex);
  }

  async function finish() {
    // Show the brand splash IMMEDIATELY — the save happens behind it, so a
    // slow network never leaves the last step looking dead after the tap.
    setFinishing(true);
    const started = Date.now();
    const ok = await persist({ step: "finish" });
    if (!ok) {
      // Save failed — come back to the step and show the error.
      setFinishing(false);
      return;
    }
    const remaining = Math.max(0, SPLASH_MS - (Date.now() - started));
    setTimeout(() => {
      router.replace("/dashboard");
      router.refresh();
    }, remaining);
  }

  function enableReminders() {
    // Persist the preference and schedule the real daily reminder: a native
    // local notification inside the iOS/Android shell, a browser-permission
    // request on the web (see lib/notifications/local-notifications.ts).
    updateSettings({ remindersEnabled: true });
    void enableDailyReminder(REMINDER_TITLE, REMINDER_BODY);
    // Reminders are no longer the final step — advance to "meet your coach"
    // (the last step), which finishes onboarding.
    goTo(safeIndex + 1, 1);
  }

  async function handleNext() {
    if (!canProceed(stepId) || pending) return;

    // The notifications stage finishes via its own two buttons.
    if (stepId === "notifications") return;

    const input = inputForStep(stepId);
    if (input) {
      const ok = await persist(input);
      if (!ok) return;
    }

    // The score lives inline in the "takenBefore" step — save it alongside.
    if (stepId === "takenBefore") {
      const score = answers.takenBefore === true ? answers.previousScore : null;
      const ok2 = await persist({ step: "score", previousScore: score });
      if (!ok2) return;
    }

    if (isLast) {
      await finish();
      return;
    }
    goTo(safeIndex + 1, 1);
  }

  async function handleSkipHardest() {
    const input = inputForStep("hardest");
    if (input) {
      const ok = await persist(input);
      if (!ok) return;
    }
    goTo(safeIndex + 1, 1);
  }

  async function handleBack() {
    if (pending) return;
    // Steps after the first return to the previous step (answers + progress
    // are preserved — they live in state, not reset). From the FIRST step,
    // history is a trap: every public route bounces a signed-in un-onboarded
    // user straight back here, so "back" means "use a different account" —
    // sign out and return to the start.
    if (safeIndex > 0) {
      goTo(safeIndex - 1, -1);
      return;
    }
    try {
      setPending(true);
      await signOut();
    } catch {
      // signOut redirects on success; a throw here is the redirect itself
      // in some runtimes — fall through to a hard navigation either way.
    } finally {
      window.location.assign("/");
    }
  }

  function setTakenBefore(value: boolean) {
    setAnswers((a) => ({
      ...a,
      takenBefore: value,
      previousScore: value ? a.previousScore : null,
    }));
  }

  function toggleTopic(key: TopicKey) {
    setAnswers((a) => ({
      ...a,
      hardestTopics: a.hardestTopics.includes(key)
        ? a.hardestTopics.filter((k) => k !== key)
        : [...a.hardestTopics, key],
    }));
  }

  const emailError =
    answers.email.trim() !== "" && !EMAIL_RE.test(answers.email.trim());

  const enterFrom =
    direction === 1 ? "translate-x-6 opacity-0" : "-translate-x-6 opacity-0";
  const slideClass = `motion-safe:transition motion-safe:duration-300 ease-out ${
    entered ? "translate-x-0 opacity-100" : enterFrom
  }`;

  if (finishing) {
    return (
      <BrandSplash
        label="Personalising your dashboard…"
        sublabel="Building your study plan around your answers"
      />
    );
  }

  return (
    <main className="screen-bg flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-safe pt-safe">
        {/* Top bar: back circle + purple progress bar (prototype .topbar/.pbar) */}
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Back"
            disabled={pending}
            className="flex h-10 w-10 flex-none items-center justify-center rounded-full border border-ink/10 bg-white/80 transition hover:bg-white disabled:opacity-50"
          >
            <svg width="9" height="16" viewBox="0 0 9 16" fill="none" aria-hidden="true">
              <path d="M8 1 1 8l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div
            className="flex h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={steps.length - 1}
            aria-valuenow={safeIndex}
            aria-label="Setup progress"
          >
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#F97316,#C2410C)] transition-[width] duration-300 ease-out"
              style={{ width: `${(safeIndex / (steps.length - 1)) * 100}%` }}
            />
          </div>
          <button
            type="button"
            onClick={() => setShowHelp(true)}
            className="flex-none text-sm font-bold text-ink-soft transition hover:text-ink"
          >
            Help
          </button>
        </div>

        {/* Step content */}
        <div className="relative flex-1 overflow-hidden pt-7">
          <div key={stepId} className={slideClass}>
            <EmojiBadge emoji={STEP_EMOJI[stepId]} />
            {renderStep()}
            {error ? (
              <p className="mt-4 text-xs font-bold text-bad">{error}</p>
            ) : null}
          </div>
        </div>

        {/* Footer */}
        <div className="space-y-3">
          {stepId === "hardest" ? (
            <button
              type="button"
              onClick={handleSkipHardest}
              disabled={pending}
              className="flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold text-ink-soft transition hover:text-ink disabled:opacity-50"
            >
              Skip — I&apos;m new to the test
            </button>
          ) : null}
          {stepId === "notifications" ? (
            <>
              <button
                type="button"
                onClick={() => goTo(safeIndex + 1, 1)}
                disabled={pending}
                className="flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold text-ink-soft transition hover:text-ink disabled:opacity-50"
              >
                Not now
              </button>
              <button
                type="button"
                onClick={enableReminders}
                disabled={pending}
                className="btn-primary"
              >
                {pending ? "Saving…" : <>🔔 Turn on reminders</>}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed(stepId) || pending}
              className="btn-primary"
            >
              {pending ? (
                "Saving…"
              ) : (
                <>
                  Continue <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {showHelp ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold tracking-tight text-ink">Need help?</h2>
            <p className="mt-2 text-base leading-relaxed text-ink-soft">
              Answer each question and tap Continue. Your answers are saved as
              you go, and you can change them later in your Profile. There are
              no wrong answers here.
            </p>
            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="mt-6 flex h-12 w-full items-center justify-center rounded-full bg-purple text-sm font-semibold text-white transition hover:bg-purple-deep"
            >
              Got it
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );

  function renderStep() {
    switch (stepId) {
      case "firstName":
        return (
          <>
            <StepHeader
              title="What's your name?"
              subtitle="We'll use this to personalise your experience."
            />
            <TextStep
              value={answers.firstName}
              placeholder="First name"
              autoComplete="given-name"
              onChange={(v) => setAnswers((a) => ({ ...a, firstName: v }))}
              onEnter={handleNext}
            />
          </>
        );
      case "meetCoach":
        return (
          <>
            <StepHeader title="Meet your coach" />
            <MeetCoachStep name={answers.firstName.trim()} />
          </>
        );
      case "email":
        return (
          <>
            <StepHeader
              title="What's your email address?"
              subtitle="This will be associated with your account."
            />
            <TextStep
              value={answers.email}
              placeholder="you@example.com"
              autoComplete="email"
              type="email"
              inputMode="email"
              onChange={(v) => setAnswers((a) => ({ ...a, email: v }))}
              onEnter={handleNext}
            />
            {emailError ? (
              <p className="mt-3 text-sm text-ink-soft">
                That doesn&apos;t look like a valid email.
              </p>
            ) : null}
          </>
        );
      case "takenBefore":
        return (
          <>
            <StepHeader
              title="Have you taken the CITB HS&E test before?"
              subtitle="This helps us understand where you're starting from."
            />
            <TakenBeforeStep
              value={answers.takenBefore}
              onChange={setTakenBefore}
            />
            {answers.takenBefore === true ? (
              <div className="mt-6 motion-safe:animate-[fadein_300ms_ease-out]">
                <label className="text-sm font-semibold text-ink">
                  What score did you get? (out of 50)
                </label>
                <p className="mb-3 mt-1 text-sm text-ink-soft">Optional.</p>
                <ScoreStep
                  value={answers.previousScore}
                  onChange={(v) =>
                    setAnswers((a) => ({ ...a, previousScore: v }))
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    setAnswers((a) => ({ ...a, previousScore: null }))
                  }
                  className="mt-3 text-sm font-semibold text-ink-soft transition hover:text-ink"
                >
                  Skip
                </button>
              </div>
            ) : null}
          </>
        );
      case "hardest":
        return (
          <>
            <StepHeader
              title="Which topics did you struggle with?"
              subtitle="If you've taken the test before, tell us what tripped you up — we'll focus your plan there. New to the test? You can skip this."
            />
            <HardestStep
              topics={answers.hardestTopics}
              notes={answers.hardestNotes}
              onToggleTopic={toggleTopic}
              onNotesChange={(v) =>
                setAnswers((a) => ({ ...a, hardestNotes: v }))
              }
            />
          </>
        );
      case "notifications":
        return (
          <>
            <StepHeader
              title="Stay on track"
              subtitle="Learners with a daily reminder are far more likely to pass first time. Here's the kind of nudge you'd get:"
            />
            <div className="mt-5">
              <NotificationPreview time="09:00" body="🎯 Time for today's 15 minutes — keep your streak alive!" />
              <NotificationPreview time="18:30" body="📝 Mock Monday: you're getting close. Try Mock 3 tonight." />
              <NotificationPreview time="20:00" body="🔥 6-day streak! One quick quiz keeps it going." />
            </div>
          </>
        );
    }
  }
}
