import { redirect } from "next/navigation";

// Legacy route — flashcards live inside Learn now (/learn/<module>/flashcards),
// matching the My Life in the UK Test app.
export default function FlashcardsIndex() {
  redirect("/learn");
}
