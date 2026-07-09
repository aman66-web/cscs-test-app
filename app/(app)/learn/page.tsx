import { LearnModules } from "@/components/learn/learn-modules";

// Learn tab (inside the tabbed (app) group so it gets the bottom nav).
// Full parity with the reference app's Learn tab lands with the Learn-mode
// clone step; the header matches its TabHeader layout.
export default function LearnPage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-32 pt-safe">
      <h1 className="text-[26px] font-extrabold tracking-[-0.7px] text-ink">
        Learn
      </h1>
      <p className="mt-0.5 text-[13.5px] font-medium text-ink-soft">
        The HS&amp;E revision guide, module by module.
      </p>
      <div className="mt-4">
        <LearnModules />
      </div>
    </main>
  );
}
