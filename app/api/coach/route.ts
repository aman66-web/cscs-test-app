import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import {
  computeReadiness,
  READINESS_COPY,
  BOOK_READY_PERCENT,
  type AnswerSample,
  type Band,
} from "@/lib/readiness/readiness";
import {
  topicStats,
  weakestFirst,
  type TopicCount,
} from "@/lib/study-plan/study-plan";
import { sanitizeTopics, TOPICS, type TopicKey } from "@/lib/onboarding/types";
import { moduleTitle } from "@/lib/question-bank/modules";
import { MOCK_CONFIG } from "@/lib/mock/config";

// Cloned from the My Life in the UK Test app's app/api/coach/route.ts,
// adapted for the CITB HS&E test (David persona, 50-question format, 90%
// pass mark, 95% safe-to-book guidance, module keys instead of chapters).

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

const TOPIC_SET = new Set<string>(TOPICS.map((t) => t.key));

// ----- Cost control: daily per-user message cap --------------------------
// Every coach reply costs real money (Anthropic API), so each account gets a
// small daily allowance. SINGLE CONFIG VALUE — raise it here or via the
// COACH_DAILY_LIMIT env var (no code change needed).
const COACH_DAILY_LIMIT = (() => {
  const n = parseInt(process.env.COACH_DAILY_LIMIT ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : 5;
})();

// In-memory fallback counter, used ONLY if the coach_usage RPC isn't
// installed yet (supabase/coach-usage.sql). Per server instance, so it's
// weaker than the DB counter — run the SQL for real enforcement.
const dailyByUser = new Map<string, { day: string; count: number }>();
function fallbackDailyLimited(userId: string): boolean {
  const day = new Date().toISOString().slice(0, 10); // UTC day, matches SQL
  const e = dailyByUser.get(userId);
  if (!e || e.day !== day) {
    dailyByUser.set(userId, { day, count: 1 });
    return false;
  }
  if (e.count >= COACH_DAILY_LIMIT) return true;
  e.count += 1;
  return false;
}

// Best-effort per-user rate limit (in-memory, per server instance): 10
// coach calls per minute is plenty for humans and blunts scripted abuse of
// the paid model behind this endpoint. (Anti-abuse burst limit — the daily
// cap above is the cost control.)
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;
const recentByUser = new Map<string, number[]>();
function rateLimited(userId: string): boolean {
  const now = Date.now();
  const recent = (recentByUser.get(userId) ?? []).filter(
    (t) => now - t < RATE_WINDOW_MS
  );
  if (recent.length >= RATE_LIMIT) {
    recentByUser.set(userId, recent);
    return true;
  }
  recent.push(now);
  recentByUser.set(userId, recent);
  // Bounded memory: prune the map occasionally.
  if (recentByUser.size > 5000) recentByUser.clear();
  return false;
}

export async function POST(req: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "The coach isn't set up yet. Add ANTHROPIC_API_KEY to enable it." },
      { status: 503 }
    );
  }

  if (rateLimited(user.id)) {
    return NextResponse.json(
      { error: "The coach is busy right now — please try again in a moment." },
      { status: 429 }
    );
  }

  let body: { messages?: ChatMessage[]; progress?: unknown };
  try {
    body = (await req.json()) as { messages?: ChatMessage[]; progress?: unknown };
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const messages = (Array.isArray(body.messages) ? body.messages : [])
    .filter(
      (m) =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string"
    )
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

  // Anthropic requires the conversation to START with a user turn.
  while (messages.length > 0 && messages[0].role !== "user") messages.shift();

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "No question provided." }, { status: 400 });
  }

  // Daily cost cap — enforced SERVER-SIDE so it can't be bypassed by a
  // modified client. Prefer the atomic DB counter (works across serverless
  // instances); fall back to the per-instance counter until the SQL is run.
  // Runs AFTER body validation so malformed requests never consume one of
  // the day's messages (an Anthropic-side failure still does — fail-closed
  // on cost is the safe direction).
  {
    const { data: newCount, error: usageError } = await supabase.rpc(
      "increment_coach_usage",
      { daily_limit: COACH_DAILY_LIMIT }
    );
    const limited = usageError
      ? fallbackDailyLimited(user.id)
      : newCount === -1;
    if (usageError) {
      console.warn(
        "[coach] coach_usage RPC unavailable (run supabase/coach-usage.sql); using in-memory fallback:",
        usageError.message
      );
    }
    if (limited) {
      return NextResponse.json(
        {
          error:
            "You've used your coach messages for today — check back tomorrow!",
          code: "daily_limit",
        },
        { status: 429 }
      );
    }
  }

  // ----- Build personalised context from the user's data -----
  const { data: profile } = await supabase
    .from("profiles")
    .select("hardest_topics")
    .eq("id", user.id)
    .maybeSingle<{ hardest_topics: unknown }>();

  const { data: answersRaw } = await supabase
    .from("user_answers")
    .select("module, correct, is_mock")
    .eq("user_id", user.id)
    .order("answered_at", { ascending: false })
    .limit(500);

  const answers = (answersRaw ?? []) as {
    module: string;
    correct: boolean;
    is_mock: boolean;
  }[];

  // Study answers also live on-device (see lib/progress/local-progress.ts),
  // so the client sends a compact summary with each request. The DB log is
  // preferred if it has data; otherwise personalise from the summary
  // (validated + clamped — it's coaching context, not authorization).
  const local = parseLocalProgress(body.progress);

  const samples: AnswerSample[] =
    answers.length > 0
      ? answers.map((a) => ({ correct: a.correct, isMock: a.is_mock }))
      : local.samples;
  // Prefer the exact predicted grade the client computed for the Home gauge
  // (whole-bank mastery) so the coach can't over-promise readiness; fall back
  // to a recency-weighted accuracy when the client didn't send it.
  const readiness = local.readiness ?? computeReadiness(samples);

  const counts: Partial<Record<TopicKey, TopicCount>> = {};
  if (answers.length > 0) {
    for (const a of answers) {
      if (!TOPIC_SET.has(a.module)) continue;
      const key = a.module as TopicKey;
      const c = counts[key] ?? { answered: 0, correct: 0 };
      c.answered += 1;
      if (a.correct) c.correct += 1;
      counts[key] = c;
    }
  } else {
    for (const [k, c] of Object.entries(local.byModule)) {
      if (TOPIC_SET.has(k)) counts[k as TopicKey] = c;
    }
  }

  const seed = sanitizeTopics(profile?.hardest_topics);
  const stats = weakestFirst(topicStats(counts, seed));
  const withData = stats.filter((s) => !s.seeded);
  const weakLine = (withData.length ? withData : stats)
    .slice(0, 2)
    .map((s) =>
      s.seeded
        ? `${moduleTitle(s.topic)} (flagged at sign-up)`
        : `${moduleTitle(s.topic)} (${s.accuracy}% correct)`
    )
    .join(", ");

  // Totals from whichever source is live (per-module counts cover the whole
  // local log; `samples` alone is capped at the most recent 100).
  const moduleTotals = Object.values(counts);
  const totalAnswered = moduleTotals.reduce((s, c) => s + c.answered, 0);
  const totalCorrect = moduleTotals.reduce((s, c) => s + c.correct, 0);
  const overallAcc =
    totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : null;
  const mockCount =
    answers.length > 0
      ? answers.filter((a) => a.is_mock).length
      : local.mocksTaken;

  // NOTE: we deliberately do NOT send the user's name (or email/any other
  // identifying detail) to Anthropic — only anonymous study stats below. This
  // keeps the payload consistent with the privacy policy ("we do not send
  // Anthropic your name or contact details").
  const system = [
    `You are David, the app's friendly, encouraging study coach for the official CITB Health, Safety & Environment (HS&E) test — the test needed for a CSCS card. Introduce yourself as David when greeting someone or if asked your name.`,
    `Help the user revise: explain answers, quiz them, suggest what to study next, and advise on readiness. Keep replies concise, warm and specific to the HS&E test and UK construction-site safety. Use British English. If asked about something unrelated, gently steer back to their study.`,
    `Test facts: ${MOCK_CONFIG.questionCount} multiple-choice questions in ${MOCK_CONFIG.durationMinutes} minutes, pass mark ${MOCK_CONFIG.passMark}/${MOCK_CONFIG.questionCount} (${MOCK_CONFIG.passPercentage}%). Advise booking only once they are consistently scoring ${BOOK_READY_PERCENT}%+.`,
    ``,
    `About the person you're helping (anonymous study stats only):`,
    `- Readiness score: ${
      readiness.score == null ? "not enough data yet" : `${readiness.score}%`
    } (${READINESS_COPY[readiness.band].label})`,
    `- Questions answered so far: ${totalAnswered}${
      mockCount ? `, including ${mockCount} under mock-test conditions` : ""
    }`,
    `- Overall accuracy: ${overallAcc == null ? "no data yet" : `${overallAcc}%`}`,
    `- Weakest modules right now: ${weakLine || "unknown"}`,
    `- Modules they said were hardest at sign-up: ${
      seed.length ? seed.map((t) => moduleTitle(t)).join(", ") : "none given"
    }`,
    ``,
    `Personalise your advice with this. If they ask "am I ready to book?", answer using their readiness score and the ${BOOK_READY_PERCENT}% guidance.`,
  ].join("\n");

  const client = new Anthropic();
  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const reply = msg.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("")
      .trim();

    return NextResponse.json({
      reply: reply || "Sorry, I couldn't think of a reply just then. Try rephrasing?",
    });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: "The coach is busy right now — please try again in a moment." },
        { status: 429 }
      );
    }
    if (err instanceof Anthropic.APIError) {
      return NextResponse.json(
        { error: "The coach had trouble answering. Please try again." },
        { status: 502 }
      );
    }
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// ----- Local-progress summary validation ------------------------------------

type LocalSummary = {
  samples: AnswerSample[];
  byModule: Record<string, { answered: number; correct: number }>;
  mocksTaken: number;
  readiness: { score: number; band: Band } | null;
};

/** Clamp + sanitise the client-sent progress summary (coaching context only —
    never used for authorization). Malformed input degrades to empty. */
function parseLocalProgress(input: unknown): LocalSummary {
  const empty: LocalSummary = {
    samples: [],
    byModule: {},
    mocksTaken: 0,
    readiness: null,
  };
  if (!input || typeof input !== "object") return empty;
  const o = input as Record<string, unknown>;

  const samples: AnswerSample[] = Array.isArray(o.samples)
    ? o.samples
        .slice(0, 100)
        .filter(
          (s): s is { correct: boolean; isMock: boolean } =>
            !!s &&
            typeof s === "object" &&
            typeof (s as Record<string, unknown>).correct === "boolean" &&
            typeof (s as Record<string, unknown>).isMock === "boolean"
        )
        .map((s) => ({ correct: s.correct, isMock: s.isMock }))
    : [];

  const byModule: LocalSummary["byModule"] = {};
  if (o.byModule && typeof o.byModule === "object") {
    for (const [k, v] of Object.entries(o.byModule as Record<string, unknown>)) {
      if (!TOPIC_SET.has(k) || !v || typeof v !== "object") continue;
      const c = v as Record<string, unknown>;
      const answered = clampCount(c.answered);
      const correct = Math.min(clampCount(c.correct), answered);
      if (answered > 0) byModule[k] = { answered, correct };
    }
  }

  const mocksTaken = clampCount(o.mocksTaken);

  let readiness: LocalSummary["readiness"] = null;
  if (o.readiness && typeof o.readiness === "object") {
    const r = o.readiness as Record<string, unknown>;
    if (
      typeof r.score === "number" &&
      Number.isFinite(r.score) &&
      isReadinessBand(r.band)
    ) {
      readiness = {
        score: Math.max(0, Math.min(100, Math.round(r.score))),
        band: r.band,
      };
    }
  }

  return { samples, byModule, mocksTaken, readiness };
}

const READINESS_BANDS: Band[] = ["empty", "not-ready", "getting-there", "ready"];
function isReadinessBand(v: unknown): v is Band {
  return typeof v === "string" && (READINESS_BANDS as string[]).includes(v);
}

function clampCount(v: unknown): number {
  return typeof v === "number" && Number.isFinite(v)
    ? Math.max(0, Math.min(100000, Math.floor(v)))
    : 0;
}
