import { notFound, redirect } from "next/navigation";
import { getCachedUser } from "@/lib/supabase/cached";
import { sanitizeTopics } from "@/lib/onboarding/types";
import { LEARN_MODULES } from "@/lib/learn/modules";
import { lessonNotes } from "@/lib/learn/notes";
import { subtopicPool } from "@/lib/question-bank";
import { pickSession } from "@/lib/questions/select";
import { LessonScreen } from "@/components/learn/lesson-screen";
import { ProgressScope } from "@/components/app/progress-scope";

// Cloned from the My Life in the UK Test app's app/learn/[topic]/[sub]/page.tsx.

const CHECK_QUIZ_SIZE = 4;

export default async function LessonPage({
  params,
}: {
  params: { module: string; sub: string };
}) {
  const valid = sanitizeTopics([params.module]);
  if (valid.length !== 1) notFound();
  const topic = valid[0];

  const module_ = LEARN_MODULES.find((m) => m.key === topic);
  const sub = module_?.subs.find((s) => s.id === params.sub);
  const notes = lessonNotes(topic, params.sub);
  if (!module_ || !sub || !notes) notFound();

  const user = await getCachedUser();
  if (!user) redirect("/sign-in");

  const checkQuestions = pickSession(
    subtopicPool(topic, params.sub),
    CHECK_QUIZ_SIZE
  );

  return (
    <>
      <ProgressScope userId={user.id} />
      <LessonScreen
        topic={topic}
        subId={params.sub}
        moduleTitle={module_.title}
        notes={notes}
        checkQuestions={checkQuestions}
      />
    </>
  );
}
