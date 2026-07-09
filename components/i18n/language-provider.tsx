"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DEFAULT_LANG, isLanguageCode, type LanguageCode } from "@/lib/i18n/languages";
import { getDict } from "@/lib/i18n";
import type { DictKey } from "@/lib/i18n/en";

// App-wide interface-language context. The chosen language persists in
// localStorage and drives t() lookups; content (questions/lessons) stays
// English. Missing keys in a translation fall back to English (see getDict).

const STORAGE_KEY = "cscs-lang";
const CHOSEN_KEY = "cscs-lang-chosen";

type I18nValue = {
  lang: LanguageCode;
  setLang: (code: LanguageCode) => void;
  /** True once the user has explicitly picked a language on the first-run gate. */
  chosen: boolean;
  markChosen: () => void;
  t: (key: DictKey, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LanguageCode>(DEFAULT_LANG);
  const [chosen, setChosen] = useState(false);

  // Read the saved preference after mount (client-only; SSR renders English).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (isLanguageCode(saved)) setLangState(saved);
      setChosen(window.localStorage.getItem(CHOSEN_KEY) === "1");
    } catch {
      // storage unavailable — stay on English defaults
    }
  }, []);

  const setLang = useCallback((code: LanguageCode) => {
    setLangState(code);
    try {
      window.localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // best-effort
    }
  }, []);

  const markChosen = useCallback(() => {
    setChosen(true);
    try {
      window.localStorage.setItem(CHOSEN_KEY, "1");
    } catch {
      // best-effort
    }
  }, []);

  const t = useCallback(
    (key: DictKey, vars?: Record<string, string | number>) => {
      const dict = getDict(lang);
      let s: string = dict[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }
      return s;
    },
    [lang]
  );

  const value = useMemo(
    () => ({ lang, setLang, chosen, markChosen, t }),
    [lang, setLang, chosen, markChosen, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within a <LanguageProvider>");
  }
  return ctx;
}
