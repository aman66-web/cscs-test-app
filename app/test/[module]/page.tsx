import { notFound, redirect } from "next/navigation";
import { sanitizeTopics } from "@/lib/onboarding/types";

// Legacy route — end-of-module tests now run through the final-test briefing
// on the session screen (matching the My Life in the UK Test app).
export default function ModuleTestPage({
  params,
}: {
  params: { module: string };
}) {
  const valid = sanitizeTopics([params.module]);
  if (valid.length !== 1) notFound();
  redirect(`/practice/session?topics=${valid[0]}&final=1`);
}
