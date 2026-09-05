import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import "./verdict.css";

// Display serif for case titles, witness names and the verdict itself. The
// body face is inherited from the root layout, so Verdict reads as its own
// product without loading a second UI font.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Verdict",
  description:
    "Argue fictional cases against witnesses who lie and a jury that explains itself.",
};

export default function VerdictLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`vd ${fraunces.variable}`}>
      {children}
      {/* Persistent, on every screen, not tucked in a settings page. Verdict is
          a game — nothing decided here is legal advice or has legal weight. */}
      <footer className="vd-wrap pb-safe pt-10">
        <hr className="vd-rule" />
        <p className="vd-faint pt-4 text-[11px] leading-relaxed">
          Verdict is a game. Every court, judge, juror, party and dispute in it
          is fictional, and no resemblance to real people or real cases is
          intended. Nothing here is legal advice and no verdict here has any
          legal weight. If you have a real dispute, speak to a qualified lawyer.
        </p>
      </footer>
    </div>
  );
}
