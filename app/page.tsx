import { redirect } from "next/navigation";
import { getCachedProfile, getCachedUser } from "@/lib/supabase/cached";
import { LanguageGate } from "@/components/landing/language-gate";

// Root route. Signed-in users skip straight to onboarding or the dashboard;
// signed-out visitors get the language chooser → landing carousel → sign-in /
// sign-up (mirroring the My Life in the UK Test app's app/page.tsx).
export default async function LandingPage() {
  const user = await getCachedUser();
  if (user) {
    const profile = await getCachedProfile(user.id);
    redirect(profile?.onboarding_completed ? "/dashboard" : "/onboarding");
  }

  return <LanguageGate />;
}
