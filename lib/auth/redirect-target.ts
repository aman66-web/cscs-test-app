import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Reads only the onboarding flag for a user. A missing row (e.g. the signup
 * trigger has not fired yet) is treated as "not completed".
 */
export async function getProfileOnboarding(
  supabase: SupabaseClient,
  userId: string
): Promise<{ completed: boolean }> {
  const { data } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", userId)
    .maybeSingle();

  return { completed: data?.onboarding_completed === true };
}

/**
 * Where an authenticated visitor to a public/auth page should be sent:
 * - not signed in        → /sign-in
 * - signed in, onboarded → /dashboard
 * - signed in, not yet   → /onboarding
 */
export async function authedRedirectTarget(
  supabase: SupabaseClient
): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return "/sign-in";

  const { completed } = await getProfileOnboarding(supabase, user.id);
  return completed ? "/dashboard" : "/onboarding";
}
