import { redirect } from "next/navigation";
import { getCachedProfile, getCachedUser } from "@/lib/supabase/cached";
import { TabBar } from "@/components/app/tab-bar";
import { AuthToast } from "@/components/app/auth-toast";
import { ProgressScope } from "@/components/app/progress-scope";

/**
 * Shared layout for the tabbed app (Home / Learn / Practice / Profile).
 * Runs the auth + onboarding guard once for all tabs, paints the brand
 * gradient wash, and renders the floating bottom nav. Quiz/mock routes live
 * outside this group so they stay full-screen without the nav.
 *
 * Uses the request-cached reads so pages below don't repeat the same
 * Supabase roundtrips (see lib/supabase/cached.ts).
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCachedUser();
  if (!user) redirect("/sign-in");

  const profile = await getCachedProfile(user.id);
  if (profile?.onboarding_completed !== true) redirect("/onboarding");

  return (
    <div className="screen-bg min-h-dvh">
      {/* Bind device-local progress to this account (per-user namespacing) */}
      <ProgressScope userId={user.id} />
      {/* One-shot OAuth arrival note (?auth=welcomeBack) */}
      <AuthToast />
      {children}
      <TabBar />
    </div>
  );
}
