import { notFound } from "next/navigation";
import { LessonScreen } from "@/components/learn/lesson-screen";
import { learnModule } from "@/lib/learn/modules";
import { lessonNotes } from "@/lib/learn/notes";
import { modulePool } from "@/lib/question-bank";
import { pickSession } from "@/lib/questions/select";
import { isModuleKey } from "@/lib/questions/module-keys";

const CHECK_QUIZ_SIZE = 4;

export default function LessonPage({ params }: { params: { module: string; sub: string } }) {
  if (!isModuleKey(params.module)) notFound();
  const mod = learnModule(params.module);
  const sub = mod?.subs.find((s) => s.id === params.sub);
  const notes = lessonNotes(params.module, params.sub);
  if (!mod || !sub || !notes) notFound();

  const checkQuestions = pickSession(modulePool(params.module), CHECK_QUIZ_SIZE);

  return (
    <LessonScreen
      module={params.module}
      subId={params.sub}
      moduleTitle={mod.title}
      notes={notes}
      checkQuestions={checkQuestions}
    />
  );
}
