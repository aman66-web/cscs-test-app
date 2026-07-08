import Link from "next/link";
import { MockRunner } from "@/components/quiz/mock-runner";
import { mockQuestions } from "@/lib/mock/mocks";
import { MOCK_CONFIG } from "@/lib/mock/config";

// Full mock test. Builds the deterministic 50-question paper and hands it to
// the client runner. (Numbered mocks like /mock/2 can be added later as the
// bank grows — mockQuestions(n) already supports it.)
export default function MockPage() {
  const questions = mockQuestions(1);

  // Not enough questions in the bank yet to fill a paper.
  if (questions.length === 0) {
    return (
      <main className="mx-auto min-h-screen max-w-md px-5 pt-safe">
        <div className="pt-16 text-center">
          <h1 className="title text-ink">No questions yet</h1>
          <p className="body-text mt-2 text-ink-soft">
            Add questions to the bank to run a mock test.
          </p>
          <Link href="/" className="mt-6 inline-block text-sm font-bold text-purple-deep">
            ← Back to home
          </Link>
        </div>
      </main>
    );
  }

  return <MockRunner questions={questions} mockNumber={1} />;
}

export const metadata = {
  title: `Mock test — ${MOCK_CONFIG.questionCount} questions`,
};
