# Verdict — Milestone 1

**You are the lawyer. The witness lies. The jury explains itself.**

A second app living in this repo, at `/verdict`. It shares the Next.js +
Capacitor + Anthropic scaffolding and shares nothing else — its own routes, its
own data layer, its own visual language.

> Verdict is a game. Every court, judge, juror, party and dispute is fictional.
> Nothing in it is legal advice and no verdict in it has legal weight.

---

## What's built

Milestone 1 from the brief, and only Milestone 1:

- One case type — small claims, **single witness, no objections**
- **Five hand-written cases** with fully authored witness fact sheets
- **Voice input and voice output**, with **text mode at full parity from day one**
- **Five-juror panel, published reasoning, simple win/lose**
- No accounts, no payments, no world layer

Deliberately **not** built: objections and the judge ruling on them, twelve
jurors, rating and ranks, clip export, accounts, the living-world layer,
seasons, subscriptions, and the Docket. Those are Milestones 2–4.

## The success test

> Hand it to ten people. If at least seven describe the moment the witness
> broke, unprompted, continue. If they describe "the AI game", stop and fix the
> witness engine.

Everything below exists to make that moment land.

---

## Run it

```bash
npm install
npm run dev          # http://localhost:3000/verdict
```

Add `ANTHROPIC_API_KEY` to `.env.local` first. Without it the app still renders
and the docket, case notes and case data all work — the witness simply tells you
the court isn't in session.

```bash
npm run verify:verdict   # fairness invariants (no API key needed, no cost)
npm run typecheck
npm run build
```

---

## How the crack works

This is the whole product, so it is worth reading before changing anything.

**The model never decides when a witness breaks.** Each turn it does exactly two
jobs: judge which of the authored crack conditions the player's question just
pinned down, and write an in-character evasion. `lib/verdict/engine.ts` holds the
cumulative state and decides — deterministically — whether the last condition has
landed. When it has, the engine throws away the evasion and plays the **authored
`crackResponse` verbatim**.

Three things follow, and all three matter:

- The crack cannot happen by luck, by a magic keyword, or because the model felt
  generous. It happens when the player has done the work.
- Every player who earns it sees the identical payoff — which is what makes a
  clip of it worth posting.
- The witness cannot improvise a way out, because the only thing between the
  player and the crack is a set of booleans the engine owns.

Once cracked, a witness stays cracked.

**Witnesses may only draw on their authored `hiddenFacts`.** This is the single
most important constraint in the codebase. An improvising witness makes the game
unwinnable, and an unwinnable game is not a game.

## How the verdict works

The fairness rule from the brief is *the same performance must produce the same
verdict*. So the verdict is arithmetic, not opinion:

| Dimension | Where the score comes from |
| --- | --- |
| Evidence handled | **Counted.** Exhibit name/alias matching over the transcript. Pivotal exhibits count triple. |
| Contradictions exposed | **Counted.** Straight off the engine's condition state. |
| Clarity | Model-scored, then quantised to the nearest 5 |
| Credibility | Model-scored, minus counted conduct penalties (repeats, abuse, piling on) |
| Narrative | Model-scored, then quantised to the nearest 5 |

Each juror weights those five axes according to their stated bias, and votes if
their weighted score clears a threshold **seeded from `(caseId, jurorId)`** — so
replaying a case can never buy you an easier room. Quantising to fives means
ordinary model jitter (71 one run, 73 the next) cannot flip a juror.

The model then writes each juror's reasoning **for a vote that has already been
decided**. It never free-writes the scorecard.

`npm run verify:verdict` asserts all of this, including the shape the game is
supposed to have:

```
the-dog(d1)              crack 5-0 / weak 2-3 / passive 0-5
wedding-photographer(d2) crack 5-0 / weak 0-5 / passive 0-5
the-guitar(d3)           crack 5-0 / weak 0-5 / passive 0-5
the-deposit(d4)          crack 5-0 / weak 1-4 / passive 0-5
the-reference(d5)        crack 5-0 / weak 0-5 / passive 0-5
```

Breaking the witness wins. A cross that found one fact out of three loses.

---

## The cases

| Case | Difficulty | Witness | Personality |
| --- | --- | --- | --- |
| The Dog That Bit First | 1 | Colin Threadgold, 61 | Nervous |
| The Wedding Photographer Who Deleted Everything | 2 | Marcus Vane, 34 | Smug |
| The Guitar That Was Already Cracked | 3 | Dermot Falk, 47 | Rehearsed |
| The Deposit and the Ghost Tenant | 4 | Iris Bellhaven, 58 | Hostile |
| The Reference That Cost Her the Job | 5 | Gwen Marchetti, 63 | Sympathetic |

Difficulty 5 is hardest for a reason that has nothing to do with the facts: the
witness is warm, apologetic and likeable, she concedes almost everything you ask
for, and that panel weights credibility heavily. Being right and being
persuasive are separate skills, and that case is where the game says so.

---

## Where things live

| What | File |
| --- | --- |
| Domain model | `lib/verdict/types.ts` |
| The cases | `lib/verdict/cases/*.ts` — **server-only** |
| Jury pool and biases | `lib/verdict/jurors.ts` |
| **The cross-examination engine** | `lib/verdict/engine.ts` |
| Scoring and the vote | `lib/verdict/scoring.ts` |
| Prompts | `lib/verdict/prompts.ts` |
| Model routing and caching | `lib/verdict/model.ts` |
| Fairness checks | `lib/verdict/checks/fairness.ts` |
| Witness turn | `app/api/verdict/witness/route.ts` |
| Deliberation and scorecard | `app/api/verdict/verdict/route.ts` |
| Screens | `app/verdict/**` |
| Components | `components/verdict/*` |
| Theme | `app/verdict/verdict.css` (all scoped under `.vd`) |

### The server/client split

`lib/verdict/cases/` imports `server-only`, so a witness's `hiddenFacts`,
`crackConditions` and `crackResponse` cannot reach the browser without the build
failing. The client receives `toPublicCase()` output only. Crack condition ids
are opaque (`c1`, `c2`, `c3`) precisely because they *are* sent to the browser to
drive the pressure meter — a descriptive id would leak the answer.

Verified on every build: no hidden fact appears in either the client bundles or
the server-rendered HTML.

---

## Model routing

Routing is where the business lives or dies, so it is in one place —
`lib/verdict/model.ts`.

| Route | Model | Why |
| --- | --- | --- |
| Witness replies | `claude-opus-5`, effort `low` | Quality *is* the product here |
| Jury judgement + reasoning | `claude-opus-5`, effort `medium` | Once per trial, so it can afford to think |
| Headlines, commentary, rival banter | `claude-haiku-4-5` | Flavour, not simulation — **Milestone 3** |

Overridable without a deploy:

```bash
VERDICT_STRONG_MODEL=claude-opus-5
VERDICT_FAST_MODEL=claude-haiku-4-5
VERDICT_FAST_MODE=1      # Opus fast mode — ~2.5x output speed at premium rates
```

**Cost control**, in the order it matters:

1. Witness replies are capped at two or three sentences. Long monologues cost
   money and kill pace at the same time — the constraint does double duty.
2. Case context and the witness persona are fixed for a whole trial, so they sit
   behind a `cache_control` breakpoint instead of being re-sent at full price on
   every question. Volatile per-turn text sits *after* the breakpoint.
3. Structured output everywhere — we parse and render the scorecard ourselves.

A trial is one model call per question (~10–20) plus two at the end.

**Latency.** The brief wants witness replies inside ~1.5s. Effort is set to
`low` for the witness, and the UI covers generation with the filler beat the
brief prescribes — the witness shifts in the chair and glances at the bench.
`VERDICT_FAST_MODE=1` is the first dial to turn if replies still feel slow; it
is off by default because it genuinely costs more per trial. This has not been
measured against the real API yet — do that before any paid acquisition.

---

## Known gaps

- **The live model path is unverified.** This build was written and tested
  without an `ANTHROPIC_API_KEY` available. Everything deterministic is
  covered by `npm run verify:verdict`; the two model-calling routes have been
  exercised only for validation and failure handling. Play all five cases
  through once with a key before showing anyone.
- **Trial state round-trips through the browser** because there is nowhere
  server-side to keep it without accounts. Every call re-validates it
  (`engine.ts` → `reconcile()`), so tampering can only cheat the player out of
  their own game — nothing here authorises anything. This moves into the
  database in Milestone 2.
- **Rate limiting is per-instance and in-memory.** Real per-user cost control
  (free tier: two trials a day) arrives with accounts.
- **Voice quality is the browser's.** Web Speech is free and instant; hosted TTS
  is a Milestone 2 upgrade, not a prerequisite.
- Speech recognition is unavailable in some browsers (notably Firefox). The mic
  is hidden there and typing works identically.

## Next

Milestone 2, in the brief's order: objections and the judge ruling on them,
twelve jurors, rating and ranks, clip auto-cut and export, accounts, 20 more
cases.
