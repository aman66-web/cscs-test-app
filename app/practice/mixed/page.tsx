import { redirect } from "next/navigation";
import { sanitizeTopics } from "@/lib/onboarding/types";

// Legacy route — mixed quizzes now start from the session setup screen.
export default function MixedPracticePage({
  searchParams,
}: {
  searchParams?: { topics?: string };
}) {
  const topics = sanitizeTopics((searchParams?.topics ?? "").split(","));
  redirect(
    topics.length > 0
      ? `/practice/session?topics=${topics.join(",")}`
      : "/practice"
  );
}
