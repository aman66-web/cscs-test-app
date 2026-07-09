import { redirect } from "next/navigation";
import { getCachedProfile, getCachedUser } from "@/lib/supabase/cached";
import { ProfileScreen } from "@/components/app/profile-screen";

// Cloned from the My Life in the UK Test app's app/(app)/profile/page.tsx.

const DEFAULT_GOAL_MINUTES = 15;

export default async function ProfilePage() {
  // Request-cached — shared with the (app) layout's guard, no extra calls.
  const user = await getCachedUser();
  if (!user) redirect("/sign-in");
  const profile = await getCachedProfile(user.id);

  const parsedGoal = parseInt(profile?.goal ?? "", 10);
  const goalMinutes =
    Number.isFinite(parsedGoal) && parsedGoal > 0
      ? parsedGoal
      : DEFAULT_GOAL_MINUTES;

  return (
    <ProfileScreen
      name={profile?.first_name?.trim() ?? ""}
      testDate={profile?.test_date ?? null}
      goalMinutes={goalMinutes}
    />
  );
}
