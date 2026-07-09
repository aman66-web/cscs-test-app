import { notFound, redirect } from "next/navigation";
import { getCachedUser } from "@/lib/supabase/cached";
import { MOCK_COUNT } from "@/lib/mock/config";
import { mockQuestions } from "@/lib/mock/mocks";
import { MockRunner } from "@/components/quiz/mock-runner";
import { ProgressScope } from "@/components/app/progress-scope";

// Cloned from the My Life in the UK Test app's app/mock/[n]/page.tsx.
// Lives OUTSIDE the (app) group so it stays full-screen without the tab bar.
export default async function MockNPage({
  params,
}: {
  params: { n: string };
}) {
  const n = parseInt(params.n, 10);
  if (!Number.isInteger(n) || n < 1 || n > MOCK_COUNT) notFound();

  const user = await getCachedUser();
  if (!user) redirect("/sign-in");

  // Deterministic paper for this mock number (seeded selection).
  return (
    <>
      <ProgressScope userId={user.id} />
      <MockRunner questions={mockQuestions(n)} mockNumber={n} />
    </>
  );
}
