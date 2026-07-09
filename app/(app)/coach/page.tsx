import { redirect } from "next/navigation";
import { getCachedProfile, getCachedUser } from "@/lib/supabase/cached";
import { CoachChat } from "@/components/coach/coach-chat";

export default async function CoachPage() {
  // Request-cached — shared with the (app) layout's guard, no extra calls.
  const user = await getCachedUser();
  if (!user) redirect("/sign-in");
  const profile = await getCachedProfile(user.id);

  return <CoachChat greetingName={profile?.first_name?.trim() || "there"} />;
}
