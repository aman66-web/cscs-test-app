import { notFound, redirect } from "next/navigation";
import { getCachedUser } from "@/lib/supabase/cached";
import { sanitizeTopics } from "@/lib/onboarding/types";
import { LEARN_MODULES } from "@/lib/learn/modules";
import { modulePool } from "@/lib/question-bank";
import { FlashcardDeck } from "@/components/learn/flashcard-deck";
import { ProgressScope } from "@/components/app/progress-scope";

/** Module flashcards: the whole module pool, scheduled by spaced repetition
    client-side. Questions are picked server-side so the bank stays out of
    the client bundle. Hotspot questions are excluded — they have no textual
    answer to reveal. Cloned from the My Life in the UK Test app's
    app/learn/[topic]/flashcards/page.tsx. */
export default async function FlashcardsPage({
  params,
}: {
  params: { module: string };
}) {
  const valid = sanitizeTopics([params.module]);
  if (valid.length !== 1) notFound();
  const topic = valid[0];

  const module_ = LEARN_MODULES.find((m) => m.key === topic);
  if (!module_) notFound();

  const user = await getCachedUser();
  if (!user) redirect("/sign-in");

  const questions = modulePool(topic).filter(
    (q) => q.question_type !== "hotspot"
  );

  return (
    <>
      <ProgressScope userId={user.id} />
      <FlashcardDeck questions={questions} moduleTitle={module_.title} />
    </>
  );
}
