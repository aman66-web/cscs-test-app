// Immediate feedback while a full-screen lesson/flashcard route loads (these
// sit outside the (app) tab group, so the tab loading.tsx doesn't cover them).
export default function LearnRouteLoading() {
  return (
    <main className="screen-bg flex min-h-dvh flex-col">
      <div className="mx-auto w-full max-w-md flex-1 px-5 pt-safe">
        <div className="h-10 w-10 animate-pulse rounded-full bg-white/70" />
        <div className="mt-6 h-7 w-3/4 animate-pulse rounded-lg bg-white/70" />
        <div className="mt-3 h-4 w-5/6 animate-pulse rounded-md bg-white/60" />
        <div className="mt-6 h-48 animate-pulse rounded-[22px] bg-white/70" />
      </div>
    </main>
  );
}
