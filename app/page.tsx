import Link from "next/link";
import { MODULES, moduleCounts } from "@/lib/question-bank";
import { MOCK_CONFIG } from "@/lib/mock/config";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { HomeStats } from "@/components/app/home-stats";
import { moduleFirstLesson } from "@/lib/learn/modules";

// Home dashboard: readiness hero, quick actions, and module overview.
export default async function Home() {
  const counts = moduleCounts();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="mx-auto min-h-screen max-w-md px-5 pb-16 pt-safe">
      {/* Auth status bar */}
      <div className="flex items-center justify-between pt-8">
        {user ? (
          <>
            <p className="label truncate">
              Signed in as <span className="font-bold text-ink">{user.email}</span>
            </p>
            <SignOutButton />
          </>
        ) : (
          <>
            <p className="label">Not signed in</p>
            <Link href="/sign-in" className="text-sm font-bold text-purple-deep">
              Sign in →
            </Link>
          </>
        )}
      </div>

      <div className="pt-5">
        <p className="micro">CITB HS&amp;E · CSCS card prep</p>
        <h1 className="display-l mt-1 text-ink">CSCS Test App</h1>
      </div>

      {/* Readiness + streak + XP */}
      {total > 0 ? <HomeStats bankTotal={total} /> : null}

      {/* Primary CTA */}
      {total > 0 ? (
        <Link href="/mock" className="btn-primary mt-4">
          Start mock test →
        </Link>
      ) : (
        <button className="btn-primary mt-4" disabled>
          Start mock test (add questions first)
        </button>
      )}
      <p className="label mt-2 text-center">
        {MOCK_CONFIG.questionCount} questions · {MOCK_CONFIG.durationMinutes} min · pass{" "}
        {MOCK_CONFIG.passMark}/{MOCK_CONFIG.questionCount} ({MOCK_CONFIG.passPercentage}%)
      </p>

      {/* Quick actions */}
      <div className="mt-5 grid grid-cols-3 gap-3">
        <QuickAction href="/learn" emoji="📖" label="Learn" />
        <QuickAction href="/flashcards" emoji="🃏" label="Flashcards" />
        <QuickAction href="/coach" emoji="💬" label="AI Coach" />
      </div>

      {/* Modules */}
      <h2 className="title mt-8 text-ink">Modules</h2>
      <div className="mt-3 space-y-3">
        {MODULES.map((m) => (
          <Link key={m.key} href={`/learn/${m.key}/${moduleFirstLesson(m.key)}`} className="surface-card block">
            <div className="flex items-center justify-between">
              <span className="font-bold text-ink">{m.title}</span>
              <span className="rounded-full bg-lilac px-3 py-1 text-xs font-semibold text-purple-deep">
                {counts[m.key]} questions
              </span>
            </div>
            <p className="body-text mt-1 text-ink-soft">{m.description}</p>
          </Link>
        ))}
      </div>

      <p className="label mt-8 text-center">{total} questions in the bank.</p>
    </main>
  );
}

function QuickAction({ href, emoji, label }: { href: string; emoji: string; label: string }) {
  return (
    <Link href={href} className="surface-card flex flex-col items-center gap-1 !p-3.5 text-center">
      <span className="text-2xl" aria-hidden="true">
        {emoji}
      </span>
      <span className="text-[12.5px] font-bold text-ink">{label}</span>
    </Link>
  );
}
