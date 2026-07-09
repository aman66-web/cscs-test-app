"use client";

import { useEffect } from "react";
import { setProgressUser } from "@/lib/progress/local-progress";

/**
 * Binds device-local study progress to the signed-in user. Rendered (as
 * nothing) by every authed server page/layout with the user's id, so XP,
 * streaks, mistakes and spaced repetition are per-account on a shared
 * device rather than leaking between users. Also performs the one-time
 * migration of pre-namespacing data to the first account that signs in.
 */
export function ProgressScope({ userId }: { userId: string }) {
  useEffect(() => {
    setProgressUser(userId);
  }, [userId]);
  return null;
}
