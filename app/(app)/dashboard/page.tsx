import Link from "next/link";
import { redirect } from "next/navigation";
import { getCachedProfile, getCachedUser } from "@/lib/supabase/cached";
import { sanitizeTopics } from "@/lib/onboarding/types";
import { HomeHeader } from "@/components/app/home-header";
import { HomeCoachLink } from "@/components/app/home-coach-link";
import { HomeStats } from "@/components/app/home-stats";
import { GoalPanel } from "@/components/app/goal-panel";
import { MockSection } from "@/components/app/mock-section";
import { DashboardTour } from "@/components/app/dashboard-tour";
import { QUESTION_BANK } from "@/lib/question-bank";

const DEFAULT_GOAL_MINUTES = 15;

export default async function DashboardPage() {
  // Both reads are request-cached — the (app) layout already made them,
  // so this page adds zero extra Supabase roundtrips.
  const user = await getCachedUser();
  if (!user) redirect("/sign-in");
  const profile = await getCachedProfile(user.id);

  const seedHardest = sanitizeTopics(profile?.hardest_topics);
  const parsedGoal = parseInt(profile?.goal ?? "", 10);
  const goalMinutes =
    Number.isFinite(parsedGoal) && parsedGoal > 0
      ? parsedGoal
      : DEFAULT_GOAL_MINUTES;

  const greetingName = profile?.first_name?.trim();
  const initial = (greetingName || user.email || "?").charAt(0).toUpperCase();
  // Server-side count so the client bundle doesn't carry the bank data.
  const bankTotal = QUESTION_BANK.length;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-32 pt-safe">
      {/* Header row */}
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <HomeHeader name={greetingName || null} />
        </div>
        <Link
          href="/profile"
          aria-label="Profile"
          className="flex h-[42px] w-[42px] flex-none items-center justify-center rounded-full bg-[linear-gradient(135deg,#8B4BF5,#6D28D9)] text-base font-extrabold text-white"
        >
          {initial}
        </Link>
      </header>

      {/* Carousel (gauge/graph) + CTA + chips (client, from the local log) */}
      <HomeStats
        seedHardest={seedHardest}
        goalMinutes={goalMinutes}
        testDate={profile?.test_date ?? null}
        bankTotal={bankTotal}
      />

      {/* Today's goal (local progress) */}
      <GoalPanel goalMinutes={goalMinutes} />

      {/* Mock tests — real exam conditions */}
      <MockSection />

      {/* AI coach entry */}
      <HomeCoachLink />

      {/* First-run spotlight walkthrough (shows once; replay from Profile) */}
      <DashboardTour />
    </main>
  );
}
