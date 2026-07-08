import Link from "next/link";
import { LearnModules } from "@/components/learn/learn-modules";

// Learn tab: the HS&E revision guide, module by module.
export default function LearnPage() {
  return (
    <main className="mx-auto min-h-screen max-w-md px-5 pb-16 pt-safe">
      <div className="flex items-center gap-3 pt-8">
        <Link href="/" aria-label="Back" className="text-lg font-bold text-ink-soft">
          ←
        </Link>
        <div>
          <h1 className="text-[26px] font-extrabold tracking-[-0.7px] text-ink">Learn</h1>
          <p className="mt-0.5 text-[13.5px] font-medium text-ink-soft">
            The HS&amp;E revision guide, topic by topic.
          </p>
        </div>
      </div>

      <div className="mt-4">
        <LearnModules />
      </div>
    </main>
  );
}
