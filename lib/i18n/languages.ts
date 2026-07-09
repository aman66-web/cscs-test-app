// The interface languages the app offers — CITB's officially supported
// languages for the real HS&E test. English is the default; exam content
// stays English throughout regardless of the chosen interface language.
// (None of these are right-to-left, so no RTL handling is needed.)

export type LanguageCode =
  | "en"
  | "bg"
  | "cs"
  | "fr"
  | "de"
  | "hu"
  | "lt"
  | "pl"
  | "pt"
  | "pa"
  | "ro"
  | "ru"
  | "es";

export type LanguageMeta = {
  code: LanguageCode;
  /** Endonym — the language's name in its own script. */
  name: string;
  /** English name (shown beneath the endonym). */
  english: string;
  flag: string;
};

export const DEFAULT_LANG: LanguageCode = "en";

export const LANGUAGES: LanguageMeta[] = [
  { code: "en", name: "English", english: "English", flag: "🇬🇧" },
  { code: "bg", name: "Български", english: "Bulgarian", flag: "🇧🇬" },
  { code: "cs", name: "Čeština", english: "Czech", flag: "🇨🇿" },
  { code: "fr", name: "Français", english: "French", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", english: "German", flag: "🇩🇪" },
  { code: "hu", name: "Magyar", english: "Hungarian", flag: "🇭🇺" },
  { code: "lt", name: "Lietuvių", english: "Lithuanian", flag: "🇱🇹" },
  { code: "pl", name: "Polski", english: "Polish", flag: "🇵🇱" },
  { code: "pt", name: "Português", english: "Portuguese", flag: "🇵🇹" },
  { code: "pa", name: "ਪੰਜਾਬੀ", english: "Punjabi", flag: "🇮🇳" },
  { code: "ro", name: "Română", english: "Romanian", flag: "🇷🇴" },
  { code: "ru", name: "Русский", english: "Russian", flag: "🇷🇺" },
  { code: "es", name: "Español", english: "Spanish", flag: "🇪🇸" },
];

const CODES = new Set(LANGUAGES.map((l) => l.code));

export function isLanguageCode(v: unknown): v is LanguageCode {
  return typeof v === "string" && CODES.has(v as LanguageCode);
}

/** Filter the language list by a search query (matches endonym or English). */
export function filterLanguages(query: string): LanguageMeta[] {
  const q = query.trim().toLowerCase();
  if (!q) return LANGUAGES;
  return LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(q) || l.english.toLowerCase().includes(q)
  );
}
