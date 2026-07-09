// Immediate feedback while a full-screen practice route (session, module,
// mixed, mistakes) loads — these sit outside the (app) tab group.
export default function PracticeRouteLoading() {
  return (
    <main className="screen-bg flex min-h-dvh flex-col">
      <div className="mx-auto w-full max-w-md flex-1 px-5 pt-safe">
        <div className="flex items-center gap-3">
          <div className="h-[38px] w-[38px] animate-pulse rounded-full bg-white/70" />
          <div className="h-1.5 flex-1 animate-pulse rounded-full bg-white/60" />
          <div className="h-4 w-12 animate-pulse rounded bg-white/60" />
        </div>
        <div className="mt-6 h-64 animate-pulse rounded-[22px] bg-white/70" />
      </div>
    </main>
  );
}
