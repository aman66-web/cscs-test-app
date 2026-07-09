"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * "Cancel" on the new-account interstitial. OAuth already created the Supabase
 * user during authentication, so cancelling means DELETING that just-created
 * account and signing out — leaving no trace, as if they never signed up.
 *
 * Guarded to only ever delete a still-un-onboarded account (never an
 * established one). Needs supabase/settings.sql (the delete_account RPC); if
 * that isn't installed we still sign out so we never keep someone signed in
 * against their wish (the empty account can be cleaned up later).
 */
export async function discardNewAccount(): Promise<{ ok: boolean }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: true };

  const { data } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .maybeSingle<{ onboarding_completed: boolean | null }>();
  // Safety: never delete an account that has completed onboarding.
  if (data?.onboarding_completed === true) return { ok: false };

  const { error } = await supabase.rpc("delete_account");
  if (error) {
    console.warn(
      "[confirm-account] delete_account RPC unavailable (run supabase/settings.sql); signing out only:",
      error.message
    );
  }
  await supabase.auth.signOut();
  return { ok: true };
}
