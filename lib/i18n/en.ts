// English UI dictionary — the source of truth for interface text and the key
// list. Exam CONTENT (questions, lessons, explanations) is NOT translated and
// lives in the question bank / notes; only interface strings live here.
//
// This starter set covers the signed-out entry surface (landing carousel +
// language picker). More screens can be added key-by-key and translated over
// time; every non-English dictionary falls back to English for missing keys.

export const en = {
  // Language picker (first-run gate)
  "lang.title": "Choose your language",
  "lang.sub":
    "You can change this any time. Test questions stay in English, just like the real test.",
  "lang.search": "Search languages…",
  "lang.searchNone": "No languages match your search.",
  "lang.welcome": "Welcome!",
  "lang.welcomeSub": "Let's get you ready to pass.",
  "lang.change": "Change language",

  // Landing carousel
  "landing.appName": "CSCS Test App",
  "landing.help": "Help",
  "landing.signIn": "Sign in",
  "landing.createAccount": "Create account",
  "landing.s1t": "Pass your CSCS test with confidence",
  "landing.s1s":
    "Everything you need to prepare for the CITB Health, Safety & Environment test, in one place.",
  "landing.s2t": "Practise real exam questions",
  "landing.s2s":
    "Hundreds of HS&E questions with instant feedback and XP to keep you motivated.",
  "landing.s3t": "Learn every module",
  "landing.s3s":
    "Bite-sized lessons across all five HS&E modules, from site safety to occupational health.",
  "landing.s4t": "Walk in ready to pass",
  "landing.s4s":
    "Track your readiness so you know you're ready before you book the real test.",
} as const;

export type DictKey = keyof typeof en;
export type Dict = Record<DictKey, string>;
