import type { SupabaseClient, User } from "@supabase/supabase-js";

// A brand-new OAuth sign-up hasn't "confirmed" they want an account — OAuth
// authenticates and creates the Supabase user in one step, so we can only ask
// AFTER the fact. isFreshOAuthSignup detects that case (Google/Apple, account
// created moments ago, onboarding not completed) so the callback can route
// them to the /auth/confirm-account interstitial instead of straight into
// onboarding. A returning user (old created_at) skips it entirely.

/** How recently the account must have been created to count as "just now". */
const FRESH_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

export async function isFreshOAuthSignup(
  supabase: SupabaseClient,
  user: User | null
): Promise<boolean> {
  if (!user) return false;

  // Only the social providers (email OTP has its own explicit sign-up flow).
  const provider = String(user.app_metadata?.provider ?? "");
  if (provider !== "google" && provider !== "apple") return false;

  // Created just now ⇒ this sign-in created the account. An existing user has
  // an old created_at and never reaches the interstitial.
  const createdMs = Date.parse(user.created_at ?? "");
  if (!Number.isFinite(createdMs) || Date.now() - createdMs > FRESH_WINDOW_MS) {
    return false;
  }

  // Already onboarded ⇒ not a fresh signup needing confirmation.
  const { data } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .maybeSingle<{ onboarding_completed: boolean | null }>();
  return data?.onboarding_completed !== true;
}

/** Human label for the provider, for the interstitial copy. */
export function providerLabel(user: User | null): string {
  const p = String(user?.app_metadata?.provider ?? "");
  if (p === "apple") return "Apple";
  if (p === "google") return "Google";
  return "this";
}
