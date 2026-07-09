import { notFound, redirect } from "next/navigation";
import { sanitizeTopics } from "@/lib/onboarding/types";

// Single-module practice goes through the session setup screen
// (question count / shuffle / mistakes-only) like every other quiz.
// Cloned from the My Life in the UK Test app's app/practice/[topic]/page.tsx.
export default function PracticeModulePage({
  params,
}: {
  params: { module: string };
}) {
  const valid = sanitizeTopics([params.module]);
  if (valid.length !== 1) notFound();
  redirect(`/practice/session?topics=${valid[0]}`);
}
