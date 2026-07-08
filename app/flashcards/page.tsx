import Link from "next/link";
import { MODULES, modulePool } from "@/lib/question-bank";

// Flashcards home: pick a module to review. Counts exclude hotspot questions,
// which the deck skips (they aren't read/reveal cards).
export default function FlashcardsIndex() {
  return (
    <main className="mx-auto min-h-screen max-w-md px-5 pb-16 pt-safe">
      <div className="flex items-center gap-3 pt-8">
        <Link href="/" aria-label="Back" className="text-lg font-bold text-ink-soft">
          ←
        </Link>
        <div>
          <h1 className="title text-ink">Flashcards</h1>
          <p className="label">Spaced repetition — review the tricky ones at the right time.</p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {MODULES.map((m) => {
          const cards = modulePool(m.key).filter((q) => q.question_type !== "hotspot").length;
          return (
            <Link key={m.key} href={`/flashcards/${m.key}`} className="surface-card flex items-center justify-between">
              <span className="font-bold text-ink">{m.title}</span>
              <span className="rounded-full bg-lilac px-3 py-1 text-xs font-semibold text-purple-deep">
                {cards} cards →
              </span>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
