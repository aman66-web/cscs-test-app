import { LegalBack } from "@/components/legal/legal-back";

// Shared shell for the legal screens (Terms & Privacy). Cloned from the
// My Life in the UK Test app's legal-page.tsx.
export function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="screen-bg flex min-h-dvh flex-col">
      <div className="mx-auto w-full max-w-md flex-1 px-6 pb-safe pt-safe">
        <LegalBack />

        <h1 className="text-3xl font-extrabold tracking-tight text-ink">{title}</h1>
        <p className="mt-1 text-xs text-ink-soft">Last updated: {updated}</p>

        <div className="mt-6 space-y-5">{children}</div>
      </div>
    </main>
  );
}

export function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-base font-bold text-ink">{heading}</h2>
      <div className="mt-1.5 space-y-2 text-sm leading-relaxed text-ink-soft">
        {children}
      </div>
    </section>
  );
}
