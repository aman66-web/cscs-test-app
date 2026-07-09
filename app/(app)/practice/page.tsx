import { moduleCounts, QUESTION_BANK } from "@/lib/question-bank";
import { PracticeList } from "@/components/app/practice-list";
import { CoachFab } from "@/components/coach/coach-fab";

export default function PracticePage() {
  // Counts come from the built-in question bank — no network needed. Both are
  // computed server-side so the client bundle doesn't carry the bank data.
  const questionCounts = moduleCounts();
  const bankTotal = QUESTION_BANK.length;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-32 pt-safe">
      <h1 className="text-[26px] font-extrabold tracking-[-0.7px] text-ink">
        Practice
      </h1>
      <p className="mt-0.5 text-[13.5px] font-medium text-ink-soft">
        Real exam-style questions per module.
      </p>
      <PracticeList questionCounts={questionCounts} bankTotal={bankTotal} />
      <CoachFab aboveTabBar context="The Practice tab (module selection)" />
    </main>
  );
}
