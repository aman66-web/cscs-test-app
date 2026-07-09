import { redirect } from "next/navigation";
import { getCachedProfile, getCachedUser } from "@/lib/supabase/cached";

// Root route, mirroring the My Life in the UK Test app's app/page.tsx:
// signed-in users skip straight to onboarding or the dashboard. (That app
// shows a marketing landing carousel to signed-out visitors — deliberately
// not cloned yet; signed-out users go to sign-in for now.)
export default async function LandingPage() {
  const user = await getCachedUser();
  if (user) {
    const profile = await getCachedProfile(user.id);
    redirect(profile?.onboarding_completed ? "/dashboard" : "/onboarding");
  }

  redirect("/sign-in");
}
