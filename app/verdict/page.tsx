import Link from "next/link";
import { publicCases } from "@/lib/verdict/cases";
import { CareerStrip } from "@/components/verdict/career-strip";

// =============================================================================
// The docket.
//
// The premise is the hook, so the premise gets the biggest type on the card.
// "The wedding photographer who deleted everything" sells a trial; "contract
// dispute" does not.
// =============================================================================

export default function DocketPage() {
  const cases = publicCases();

  return (
    <main className="vd-wrap pb-4 pt-safe">
      <header className="pt-6">
        <p className="vd-eyebrow">Hallam &amp; Ashmount circuit</p>
        <h1 className="vd-display mt-2 text-[2.6rem]">Verdict</h1>
        <p className="vd-muted mt-3 max-w-[46ch] text-[15px] leading-relaxed">
          You are the lawyer. The witnesses lie, and every one of them has one
          buried inconsistency. Find it, put it to them, and see whether the jury
          agrees.
        </p>
      </header>

      <div className="mt-6">
        <CareerStrip />
      </div>

      <hr className="vd-rule my-7" />

      <p className="vd-eyebrow mb-4">Today&apos;s docket</p>

      <ul className="flex flex-col gap-3">
        {cases.map((c) => (
          <li key={c.id}>
            <Link href={`/verdict/case/${c.id}`} className="vd-docket-item">
              <div className="flex items-start justify-between gap-4">
                <h2 className="vd-display text-[1.35rem] leading-tight">
                  {c.title}
                </h2>
                <span
                  className="vd-pips mt-1.5"
                  title={`Difficulty ${c.difficulty} of 5`}
                  aria-label={`Difficulty ${c.difficulty} of 5`}
                >
                  {[1, 2, 3, 4, 5].map((pip) => (
                    <span
                      key={pip}
                      className="vd-pip"
                      data-on={pip <= c.difficulty}
                      aria-hidden
                    />
                  ))}
                </span>
              </div>

              <p className="vd-muted mt-2 text-[15px] leading-relaxed">
                {c.premise}
              </p>

              <p className="vd-faint mt-3 text-[12px]">
                {c.court} · {c.witnesses.length} witness
                {c.witnesses.length === 1 ? "" : "es"} · {c.stake}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <p className="vd-faint mt-6 text-center text-[12px] leading-relaxed">
        Milestone 1: one witness, no objections, five jurors. Objections, ranked
        play and seasons come next.
      </p>
    </main>
  );
}
