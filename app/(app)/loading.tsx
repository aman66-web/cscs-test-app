// Tab-switch feedback: keeps the shell (gradient + tab bar from the layout)
// while the incoming tab's server data loads.
export default function TabLoading() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-32 pt-safe">
      <div className="h-8 w-44 animate-pulse rounded-lg bg-white/70" />
      <div className="mt-2 h-4 w-56 animate-pulse rounded-md bg-white/60" />
      <div className="mt-6 h-44 animate-pulse rounded-[22px] bg-white/70" />
      <div className="mt-4 h-24 animate-pulse rounded-[18px] bg-white/60" />
      <div className="mt-3 h-24 animate-pulse rounded-[18px] bg-white/60" />
    </main>
  );
}
