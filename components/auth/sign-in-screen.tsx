"use client";

import type { FloatingChip, FloatingDot } from "@/components/auth/auth-shell";
import { EmailOtp } from "@/components/auth/email-otp";

const CHIPS: FloatingChip[] = [
  { top: 78, left: 26, size: 46, fontSize: 23, bg: "#FFF0D6", duration: 6, emoji: "👷" },
  { top: 70, right: 26, size: 48, fontSize: 24, bg: "#FFE1E1", duration: 7, emoji: "⛑️" },
  { top: 178, left: 14, size: 40, fontSize: 20, bg: "#DDEEFF", duration: 5.6, emoji: "🦺" },
  { top: 186, right: 16, size: 42, fontSize: 21, bg: "#EFE3FF", duration: 6.6, emoji: "🚧" },
];

const DOTS: FloatingDot[] = [
  { top: 150, left: 64, size: 9, bg: "#FFC24B" },
  { top: 96, right: 88, size: 8, bg: "#4ADE80" },
  { top: 210, right: 74, size: 7, bg: "#F472B6" },
];

/** Passwordless sign-in: email → 6-digit code → into the app. */
export function SignInScreen({ calloutError = false }: { calloutError?: boolean }) {
  return <EmailOtp mode="signin" chips={CHIPS} dots={DOTS} authError={calloutError} />;
}
