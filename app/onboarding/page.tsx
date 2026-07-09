import { redirect } from "next/navigation";
import { getCachedProfile, getCachedUser } from "@/lib/supabase/cached";
import {
  mapRowToInitialAnswers,
  type ProfileRow,
} from "@/lib/onboarding/types";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { AuthToast } from "@/components/app/auth-toast";
import { ProgressScope } from "@/components/app/progress-scope";

export default async function OnboardingPage() {
  const user = await getCachedUser();
  if (!user) {
    redirect("/sign-in");
  }

  const profile = await getCachedProfile(user.id);

  // Already onboarded? Straight to the dashboard.
  if (profile?.onboarding_completed) {
    redirect("/dashboard");
  }

  return (
    <>
      <ProgressScope userId={user.id} />
      {/* One-shot OAuth arrival note (?auth=setup — signed-in-but-new user) */}
      <AuthToast />
      <OnboardingFlow
        initial={mapRowToInitialAnswers((profile as ProfileRow) ?? null)}
        accountEmail={user.email ?? ""}
      />
    </>
  );
}
