// Public i18n surface. Dictionaries are tiny, so all are bundled (no dynamic
// import). getDict merges a language over English so any missing key falls
// back to English text rather than showing a raw key.

import { en, type Dict, type DictKey } from "./en";
import { TRANSLATIONS } from "./translations";
import { type LanguageCode } from "./languages";

export * from "./languages";
export { en };
export type { Dict, DictKey };

export function getDict(lang: LanguageCode): Dict {
  if (lang === "en") return en;
  const overrides = TRANSLATIONS[lang];
  return overrides ? { ...en, ...overrides } : en;
}
