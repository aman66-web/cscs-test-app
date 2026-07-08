import Link from "next/link";

// Placeholder Terms page — replace with your real terms before launch.
export default function TermsPage() {
  return (
    <main className="mx-auto min-h-screen max-w-md px-5 pb-16 pt-safe">
      <div className="pt-10">
        <Link href="/sign-up" className="text-sm font-bold text-purple-deep">
          ← Back
        </Link>
        <h1 className="title mt-4 text-ink">Terms of Service</h1>
        <p className="body-text mt-3 text-ink-soft">
          Placeholder — your Terms of Service will go here before launch.
        </p>
      </div>
    </main>
  );
}
