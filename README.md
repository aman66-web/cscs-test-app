# CSCS Test App

Practice app for the UK **CITB Health, Safety & Environment (HS&E) test** — the
exam you take to get a **CSCS card** to work on construction sites.

Built to share one architecture and visual language with the *My Life in the UK
Test* app: **Next.js 14.2 + Capacitor** (native iOS/Android shell), **Supabase**
(auth), **Anthropic** (AI study coach), deployed on **Vercel**.

## Getting started

```bash
npm install        # install dependencies (one time)
npm run dev        # start the app at http://localhost:3000
```

Open http://localhost:3000 in your browser to see the home screen.

## Where things live

| What | File(s) |
| --- | --- |
| Brand colours & fonts | `tailwind.config.ts`, `app/globals.css`, `app/layout.tsx` |
| Question schema (the shape of a question) | `lib/questions/types.ts` |
| Mock test rules (50 Q / 45 min / 45 to pass) | `lib/mock/config.ts` |
| The 5 modules | `lib/question-bank/modules.ts` |
| Questions (add them here) | `lib/question-bank/working-environment.ts`, etc. |
| Supabase database table for questions | `supabase/questions-schema.sql` |
| AI study coach | `app/api/coach/route.ts` |
| iOS/Android shell config | `capacitor.config.ts` |
| Secret keys & config | `.env.local` |

## Brand colours

| Token | Hex | Tailwind utility |
| --- | --- | --- |
| ink | `#211B4E` | `text-ink` |
| ink-soft | `#6B6690` | `text-ink-soft` |
| purple | `#7C3AED` | `bg-purple` |
| purple-deep | `#6D28D9` | `bg-purple-deep` |
| lilac | `#F1EAFE` | `bg-lilac` |

Font: **Plus Jakarta Sans** (loaded automatically, no setup needed).

## Mock test

50 questions · 45 minutes · pass mark **45/50 (90%)** — see `lib/mock/config.ts`.

## Adding questions

Open any file in `lib/question-bank/` and follow the template at the top of
`working-environment.ts`. Three question types are supported:
`multiple_choice`, `multiple_answer`, and `hotspot` (tap-the-image).

## iOS bundle ID

`com.cscstestapp.app` — set in `capacitor.config.ts`.

## Still to do (fill in the blanks)

- Paste your `ANTHROPIC_API_KEY` and `RESEND_API_KEY` into `.env.local`.
- Run `supabase/questions-schema.sql` in your Supabase project.
- Write questions into the five module files.
- Add the native iOS project when ready: `npx cap add ios`.
