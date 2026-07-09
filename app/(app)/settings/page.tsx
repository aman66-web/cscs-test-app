import { redirect } from "next/navigation";
import { getCachedProfile, getCachedUser } from "@/lib/supabase/cached";
import { SettingsScreen } from "@/components/settings/settings-screen";

// Cloned from the My Life in the UK Test app's app/(app)/settings/page.tsx.

export default async function SettingsPage() {
  // Request-cached — shared with the (app) layout's guard, no extra calls.
  const user = await getCachedUser();
  if (!user) redirect("/sign-in");
  const profile = await getCachedProfile(user.id);

  return (
    <SettingsScreen
      initialFirstName={profile?.first_name?.trim() ?? ""}
      email={user.email ?? ""}
    />
  );
}
