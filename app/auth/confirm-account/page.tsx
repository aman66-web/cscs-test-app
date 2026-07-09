import { redirect } from "next/navigation";
import { getCachedProfile, getCachedUser } from "@/lib/supabase/cached";
import { providerLabel } from "@/lib/auth/new-account";
import { ConfirmAccountScreen } from "@/components/auth/confirm-account-screen";

// The new-account interstitial: the OAuth callback routes a brand-new
// Google/Apple sign-up here to confirm before we keep the account.
export default async function ConfirmAccountPage() {
  const user = await getCachedUser();
  if (!user) redirect("/sign-in");

  // An already-onboarded account never needs confirming.
  const profile = await getCachedProfile(user.id);
  if (profile?.onboarding_completed) redirect("/dashboard");

  return (
    <ConfirmAccountScreen
      providerLabel={providerLabel(user)}
      email={user.email ?? ""}
    />
  );
}
