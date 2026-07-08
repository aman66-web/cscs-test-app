import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Where an authenticated visitor to a public/auth page should be sent.
 *
 * For now everyone lands on the home screen. When onboarding + a dashboard
 * exist, branch here on a `profiles.onboarding_completed` flag (new users →
 * /onboarding, returning → /dashboard) — see the My Life in the UK Test app's
 * redirect-target.ts for that pattern.
 */
export async function authedRedirectTarget(
  // Kept in the signature so callers don't change when the branch above lands.
  _supabase: SupabaseClient
): Promise<string> {
  return "/";
}
