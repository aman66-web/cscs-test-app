/** Dashboard greeting (h1 + subtitle). Cloned from the My Life in the UK
    Test app's home-header.tsx, minus i18n (plain English, so no client
    component needed). */
export function HomeHeader({ name }: { name: string | null }) {
  return (
    <>
      <h1 className="break-words text-[26px] font-extrabold tracking-[-0.7px] text-ink">
        Hello, {name || "there"} <span aria-hidden="true">👋</span>
      </h1>
      <p className="mt-0.5 text-[13.5px] font-medium text-ink-soft">
        Here&apos;s your test readiness
      </p>
    </>
  );
}
