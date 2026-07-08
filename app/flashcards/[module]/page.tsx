import { notFound } from "next/navigation";
import { FlashcardDeck } from "@/components/learn/flashcard-deck";
import { modulePool } from "@/lib/question-bank";
import { moduleTitle } from "@/lib/question-bank/modules";
import { isModuleKey } from "@/lib/questions/module-keys";

export default function ModuleFlashcards({ params }: { params: { module: string } }) {
  if (!isModuleKey(params.module)) notFound();
  const questions = modulePool(params.module);
  if (questions.length === 0) notFound();
  return <FlashcardDeck questions={questions} moduleTitle={moduleTitle(params.module)} />;
}
