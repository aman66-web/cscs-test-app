"use client";

import { useState } from "react";
import { filterLanguages, type LanguageCode } from "@/lib/i18n";
import { useI18n } from "@/components/i18n/language-provider";
import { BrandLogo } from "@/components/brand/logo";
import { BrandSplash } from "@/components/brand/brand-splash";
import { LandingCarousel } from "@/components/landing/landing-carousel";

const SPLASH_MS = 2300;

/**
 * The signed-out entry screen. On first visit it shows the language chooser
 * (every language in its own script + a search box); choosing plays the brand
 * splash, then the landing carousel → sign-in / sign-up. After the first
 * choice it opens straight on the carousel, with a "change language" button
 * that returns here. Cloned from the My Life in the UK Test app's language-gate.
 */
export function LanguageGate() {
  const { t, setLang, chosen, markChosen } = useI18n();
  const [phase, setPhase] = useState<"initial" | "choose" | "splash" | "landing">(
    "initial"
  );
  const [query, setQuery] = useState("");

  // `chosen` resolves after mount (localStorage). Until then show nothing to
  // avoid a flash of the chooser for returning users.
  const view = phase === "initial" ? (chosen ? "landing" : "choose") : phase;

  function choose(code: LanguageCode) {
    setLang(code);
    markChosen();
    setPhase("splash");
    setTimeout(() => setPhase("landing"), SPLASH_MS);
  }

  if (view === "splash") {
    return <BrandSplash label={t("lang.welcome")} sublabel={t("lang.welcomeSub")} />;
  }

  if (view === "landing") {
    return <LandingCarousel onChangeLanguage={() => setPhase("choose")} />;
  }

  const results = filterLanguages(query);

  return (
    <main className="screen-bg flex min-h-dvh flex-col">
      <div
        className="mx-auto flex w-full max-w-md flex-1 flex-col px-6 pb-6"
        style={{ paddingTop: "max(46px, env(safe-area-inset-top))" }}
      >
        {/* Brand + title */}
        <div className="mt-4 flex flex-col items-center text-center">
          <BrandLogo className="h-16 w-16" />
          <h1 className="mt-4 text-[24px] font-extrabold tracking-[-0.6px] text-ink">
            🌍 {t("lang.title")}
          </h1>
          <p className="mt-1.5 max-w-[300px] text-[13px] font-medium leading-relaxed text-ink-soft">
            {t("lang.sub")}
          </p>
        </div>

        {/* Search */}
        <div className="relative mt-5 flex-none">
          <span
            className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-ink-soft"
            aria-hidden="true"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.8" />
              <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("lang.search")}
            aria-label={t("lang.search")}
            className="w-full rounded-[14px] border border-ink/10 bg-white py-3 ps-10 pe-4 text-[16px] font-medium text-ink shadow-[0_10px_22px_-18px_rgba(28,25,23,0.3)] outline-none transition placeholder:text-ink-soft focus:border-purple focus:ring-2 focus:ring-purple/20"
          />
        </div>

        {/* Language list */}
        <div className="mt-3 flex-1 space-y-2 overflow-y-auto pb-2">
          {results.length === 0 ? (
            <p className="px-1 py-8 text-center text-sm font-medium text-ink-soft">
              {t("lang.searchNone")}
            </p>
          ) : (
            results.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => choose(l.code)}
                className="flex w-full items-center gap-3 rounded-[16px] bg-white px-4 py-3 text-start shadow-[0_10px_22px_-16px_rgba(28,25,23,0.3)] transition hover:bg-[#FDFBF7] active:scale-[0.99]"
              >
                <span className="flex-none text-[22px]" aria-hidden="true">
                  {l.flag}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-extrabold leading-tight text-ink">
                    {l.name}
                  </span>
                  {l.english !== l.name ? (
                    <span className="block text-[11.5px] font-semibold text-ink-soft">
                      {l.english}
                    </span>
                  ) : null}
                </span>
                <span
                  className="ms-auto flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full bg-lilac font-extrabold text-purple-deep"
                  aria-hidden="true"
                >
                  →
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
