import { notFound, redirect } from "next/navigation";
import { sanitizeTopics } from "@/lib/onboarding/types";

// Legacy route — flashcards live inside Learn now, matching the
// My Life in the UK Test app.
export default function ModuleFlashcards({
  params,
}: {
  params: { module: string };
}) {
  const valid = sanitizeTopics([params.module]);
  if (valid.length !== 1) notFound();
  redirect(`/learn/${valid[0]}/flashcards`);
}
