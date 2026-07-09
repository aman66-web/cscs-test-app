"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  AuthShell,
  INK,
  INK_SOFT,
  PURPLE_DEEP,
  type FloatingChip,
  type FloatingDot,
} from "@/components/auth/auth-shell";
import { ErrorBanner, PrimaryButton, TextField } from "@/components/auth/ui";
import { SocialButtons } from "@/components/auth/social-buttons";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_SECONDS = 30;

/**
 * Passwordless email sign-in / sign-up with a 6-digit one-time passcode.
 *
 * Phase 1 (email): the user enters their email; we send a code via
 * `signInWithOtp`. Both entry screens use the SAME method — there is no
 * `signUp()` call and no magic-link path here.
 *
 * IMPORTANT — Supabase email templates. Supabase chooses which template to
 * send SERVER-SIDE, based on whether the account already exists:
 *   - returning user (sign-in)  → the "Magic Link" template
 *   - brand-new email (sign-up) → the "Confirm signup" template
 * BOTH templates must be edited (Authentication → Email Templates) to show
 * `{{ .Token }}` (the 6-digit code) instead of `{{ .ConfirmationURL }}` (a
 * link). If only one is updated, that flow shows a code while the other still
 * emails a link — this is a Supabase config gap, not a code bug.
 *
 * Phase 2 (code): the user types the 6-digit code; `verifyOtp` signs them in
 * and we route into the app. A returning user's code verifies as type
 * "email"; a new sign-up's first code verifies as type "signup" — verify()
 * tries "email" then falls back to "signup" so both work. Includes a resend
 * control with a cooldown and clear inline errors.
 *
 * OTP is passwordless, so signing in and signing up are the same action —
 * `shouldCreateUser: true` creates the account on first code. The two entry
 * screens differ only in their heading/CTA copy.
 */
export function EmailOtp({
  mode,
  chips,
  dots,
  authError = false,
  authErrorMessage,
}: {
  mode: "signin" | "signup";
  chips: FloatingChip[];
  dots: FloatingDot[];
  /** Set when returning from a failed OAuth callback (?error=auth). */
  authError?: boolean;
  /** Readable failure message (already mapped from the callback's reason
      code — see lib/auth/oauth-error.ts). Overrides the generic line. */
  authErrorMessage?: string;
}) {
  const supabase = createClient();
  const router = useRouter();

  const [phase, setPhase] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(
    authErrorMessage ??
      (authError ? "We couldn't finish that sign-in. Please try again." : null)
  );
  // An optional CTA rendered under the error (e.g. "Create an account").
  const [errorLink, setErrorLink] = useState<{ href: string; label: string } | null>(
    null
  );
  // Informational (non-error) note on the code screen.
  const [notice, setNotice] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);

  // Resend cooldown tick.
  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [resendIn]);

  // Focus the code box when we reach the code phase.
  useEffect(() => {
    if (phase === "code") codeRef.current?.focus();
  }, [phase]);

  const cleanEmail = email.trim().toLowerCase();
  const emailValid = EMAIL_RE.test(cleanEmail);

  /** A Supabase "this email has no account" signal (shouldCreateUser:false). */
  function isNoAccountError(message: string): boolean {
    return /signups? not allowed|otp_disabled|user not found|not found|no account/i.test(
      message
    );
  }

  function toCodePhase() {
    setCode("");
    setError(null);
    setErrorLink(null);
    setPhase("code");
    setResendIn(RESEND_SECONDS);
  }

  async function sendCode() {
    if (!emailValid || pending) return;
    setError(null);
    setErrorLink(null);
    setPending(true);

    if (mode === "signin") {
      // Sign-in must NOT create an account (shouldCreateUser:false). If the
      // email has no account, Supabase errors and we steer them to sign up.
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: { shouldCreateUser: false },
      });
      setPending(false);
      if (error) {
        if (isNoAccountError(error.message)) {
          setError("We couldn't find an account with that email.");
          setErrorLink({ href: "/sign-up", label: "Create an account" });
        } else if (/rate|limit|too many/i.test(error.message)) {
          setError("Too many attempts. Please wait a moment and try again.");
        } else {
          setError("We couldn't send your code. Please try again.");
        }
        return;
      }
      toCodePhase();
      return;
    }

    // Sign-up: first probe WITHOUT creating, so we can tell an existing account
    // apart from a new one. A new email errors here (no email sent); an existing
    // email succeeds — and Supabase has ALREADY emailed them a sign-in code, so
    // proceed straight to the code phase with a friendly note.
    const probe = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: { shouldCreateUser: false },
    });
    if (!probe.error) {
      setPending(false);
      setNotice("You already have an account — we've emailed you a sign-in code.");
      toCodePhase();
      return;
    }
    if (/rate|limit|too many/i.test(probe.error.message)) {
      setPending(false);
      setError("Too many attempts. Please wait a moment and try again.");
      return;
    }
    if (!isNoAccountError(probe.error.message)) {
      setPending(false);
      setError("We couldn't send your code. Please try again.");
      return;
    }
    // Genuinely new email → create the account and send the signup code.
    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: { shouldCreateUser: true },
    });
    setPending(false);
    if (error) {
      setError(
        /rate|limit|too many/i.test(error.message)
          ? "Too many attempts. Please wait a moment and try again."
          : "We couldn't send your code. Please try again."
      );
      return;
    }
    toCodePhase();
  }

  /** Resend from the code phase — just re-send, no existing-account probe. */
  async function resendCode() {
    if (pending || resendIn > 0) return;
    setError(null);
    setPending(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: cleanEmail,
      options: { shouldCreateUser: mode === "signup" },
    });
    setPending(false);
    if (error) {
      setError(
        /rate|limit|too many/i.test(error.message)
          ? "Too many attempts. Please wait a moment and try again."
          : "We couldn't send your code. Please try again."
      );
      return;
    }
    setResendIn(RESEND_SECONDS);
  }

  /** Verify a code. `raw` lets callers pass the freshest value (the input's
      onChange auto-submit fires before React state has re-rendered). */
  async function verify(raw?: string) {
    const token = (raw ?? code).replace(/\D/g, "");
    if (token.length !== 6 || pending) return;
    setError(null);
    setPending(true);

    // Existing-user sign-in tokens verify as type "email"; a brand-new
    // sign-up's first code can be type "signup". Try "email" first, then fall
    // back to "signup" so both cases work regardless of which template fired.
    let { error } = await supabase.auth.verifyOtp({
      email: cleanEmail,
      token,
      type: "email",
    });
    if (error) {
      const retry = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token,
        type: "signup",
      });
      error = retry.error;
    }

    if (error) {
      setPending(false);
      setError(
        /expired/i.test(error.message)
          ? "That code has expired. Please request a new one."
          : "That code isn't right. Please check and try again."
      );
      return;
    }
    // /onboarding self-routes: finished users go to the dashboard, others resume.
    router.replace("/onboarding");
    router.refresh();
  }

  // ---------- Phase 2: enter the 6-digit code ----------
  if (phase === "code") {
    return (
      <AuthShell
        title="Enter your code"
        subtitle={`We sent a 6-digit code to ${cleanEmail}`}
        chips={chips}
        dots={dots}
      >
        {notice ? (
          <p
            className="mb-3 rounded-[14px] bg-[#FEF3E2] px-4 py-3 text-[13px] font-bold leading-snug"
            style={{ color: PURPLE_DEEP }}
          >
            {notice}
          </p>
        ) : null}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void verify();
          }}
          className="flex flex-col gap-3"
        >
          <label
            htmlFor="otp-code"
            className="ps-1 text-[12.5px] font-bold"
            style={{ color: INK }}
          >
            6-digit code
          </label>
          <input
            id="otp-code"
            ref={codeRef}
            value={code}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 6);
              setCode(v);
              setError(null);
              if (v.length === 6) {
                // Auto-submit once six digits are entered — pass the fresh
                // value; state hasn't re-rendered yet.
                void verify(v);
              }
            }}
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            aria-label="6-digit code"
            placeholder="——————"
            className="h-[62px] w-full rounded-[15px] border-[1.5px] border-transparent bg-[#FBF5EE] text-center text-[28px] font-extrabold tracking-[0.5em] text-ink outline-none transition placeholder:text-[#C9C4DC] placeholder:tracking-[0.3em] focus:border-[#F97316] focus:bg-white focus:shadow-[0_0_0_3px_rgba(249, 115, 22,0.12)]"
          />

          {error ? <ErrorBanner message={error} /> : null}

          <PrimaryButton pending={pending} disabled={code.replace(/\D/g, "").length !== 6}>
            Verify <span aria-hidden="true">→</span>
          </PrimaryButton>
        </form>

        {/* Spam / junk folder hint. */}
        <div className="mt-4 flex items-center gap-2.5 rounded-[14px] border border-[rgba(249, 115, 22,0.16)] bg-[#FEF3E2] px-3.5 py-2.5">
          <span aria-hidden="true" className="flex-none text-[17px] leading-none">
            📩
          </span>
          <p
            className="text-start text-[12.5px] font-semibold leading-snug"
            style={{ color: PURPLE_DEEP }}
          >
            Can&apos;t see it? Check your spam or junk folder.
          </p>
        </div>

        <div className="mt-4 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => void resendCode()}
            disabled={resendIn > 0 || pending}
            className="text-[13px] font-bold disabled:opacity-50"
            style={{ color: PURPLE_DEEP }}
          >
            {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
          </button>
          <button
            type="button"
            onClick={() => {
              setPhase("email");
              setError(null);
              setNotice(null);
            }}
            className="text-[13px] font-semibold"
            style={{ color: INK_SOFT }}
          >
            Use a different email
          </button>
        </div>
      </AuthShell>
    );
  }

  // ---------- Phase 1: enter email ----------
  return (
    <AuthShell
      title={mode === "signup" ? "Create your account" : "Welcome back"}
      subtitle={
        mode === "signup"
          ? "Start practising for your CSCS test"
          : "Sign in to keep your progress"
      }
      chips={chips}
      dots={dots}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void sendCode();
        }}
        className="flex flex-col gap-3"
      >
        <TextField
          label="Email"
          icon="mail"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
            setErrorLink(null);
          }}
          placeholder="you@example.com"
        />
        <p className="-mt-1 ps-1 text-[11.5px] font-semibold" style={{ color: INK_SOFT }}>
          We&apos;ll email you a 6-digit code — no password needed.
        </p>

        {error ? <ErrorBanner message={error} /> : null}
        {errorLink ? (
          <Link
            href={errorLink.href}
            className="-mt-1 text-center text-[13px] font-extrabold"
            style={{ color: PURPLE_DEEP }}
          >
            {errorLink.label} <span aria-hidden="true">→</span>
          </Link>
        ) : null}

        <PrimaryButton pending={pending} disabled={!emailValid}>
          Send code <span aria-hidden="true">→</span>
        </PrimaryButton>
      </form>

      <SocialButtons
        dividerText={mode === "signup" ? "or sign up with" : "or continue with"}
        mode={mode}
      />

      {mode === "signup" ? (
        <p
          className="mt-2.5 text-center text-[11px] font-medium leading-normal"
          style={{ color: INK_SOFT }}
        >
          By continuing you agree to our{" "}
          <Link
            href="/terms"
            className="border-b border-[rgba(28, 25, 23,0.25)]"
            style={{ color: INK }}
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="border-b border-[rgba(28, 25, 23,0.25)]"
            style={{ color: INK }}
          >
            Privacy Policy
          </Link>
          .
        </p>
      ) : null}

      <p className="mt-auto pt-4 text-center text-sm font-medium" style={{ color: INK_SOFT }}>
        {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
        <Link
          href={mode === "signup" ? "/sign-in" : "/sign-up"}
          className="font-bold"
          style={{ color: PURPLE_DEEP }}
        >
          {mode === "signup" ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </AuthShell>
  );
}
