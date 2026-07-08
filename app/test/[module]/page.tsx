import { notFound } from "next/navigation";
import { PracticeSession } from "@/components/quiz/practice-session";
import { modulePool } from "@/lib/question-bank";
import { moduleTitle } from "@/lib/question-bank/modules";
import { pickSession } from "@/lib/questions/select";
import { isModuleKey } from "@/lib/questions/module-keys";
import { MOCK_CONFIG } from "@/lib/mock/config";

const MODULE_TEST_SIZE = 12;

// End-of-module test: a per-module quiz with per-question feedback and the
// same 90% pass mark as the real exam.
export default function ModuleTestPage({ params }: { params: { module: string } }) {
  if (!isModuleKey(params.module)) notFound();
  const questions = pickSession(modulePool(params.module), MODULE_TEST_SIZE);
  if (questions.length === 0) notFound();

  return (
    <PracticeSession
      questions={questions}
      title={`${moduleTitle(params.module)} test`}
      doneHref="/learn"
      scoreKey={params.module}
      passPercentage={MOCK_CONFIG.passPercentage}
    />
  );
}
