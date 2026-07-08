import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { computeReadiness, READINESS_COPY, type AnswerSample } from "@/lib/readiness/readiness";
import { moduleTitle } from "@/lib/question-bank/modules";
import { MODULE_KEYS } from "@/lib/questions/module-keys";
import type { ModuleKey } from "@/lib/questions/types";

// =============================================================
// AI study coach — CSCS HS&E test. Named "David".
//
// Mirrors the My Life in the UK Test app: Anthropic claude-haiku-4-5 with a
// per-user DAILY message cap. Personalises the system prompt from the client's
// on-device progress summary (no Supabase progress tables). Sign-in is
// optional — a signed-out user is capped under an "anon" bucket.
// =============================================================

export const runtime = "nodejs";

type ChatMessage = { role: "user" | "assistant"; content: string };

const COACH_DAILY_LIMIT = (() => {
  const n = parseInt(process.env.COACH_DAILY_LIMIT ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : 5;
})();

// In-memory daily counter. Per server instance (a soft cap); move to a DB
// counter for hard cross-instance enforcement.
const dailyByUser = new Map<string, { day: string; count: number }>();
const utcDay = () => new Date().toISOString().slice(0, 10);
/** True if the user has already hit today's cap. Does NOT consume quota. */
function isDailyLimited(userId: string): boolean {
  const e = dailyByUser.get(userId);
  return !!e && e.day === utcDay() && e.count >= COACH_DAILY_LIMIT;
}
/** Count one SUCCESSFUL coach reply against today's allowance. */
function noteDailyUse(userId: string): void {
  const day = utcDay();
  const e = dailyByUser.get(userId);
  if (!e || e.day !== day) dailyByUser.set(userId, { day, count: 1 });
  else e.count += 1;
}

const clampCount = (v: unknown) => (typeof v === "number" && v >= 0 && Number.isFinite(v) ? Math.min(v, 100000) : 0);

/** Validate the client's on-device progress summary. */
function parseLocalProgress(input: unknown): {
  samples: AnswerSample[];
  byModule: Record<string, { answered: number; correct: number }>;
  mocksTaken: number;
} {
  const empty = { samples: [] as AnswerSample[], byModule: {}, mocksTaken: 0 };
  if (typeof input !== "object" || input === null) return empty;
  const p = input as Record<string, unknown>;
  const samples: AnswerSample[] = Array.isArray(p.samples)
    ? p.samples
        .filter((s): s is AnswerSample => !!s && typeof (s as AnswerSample).correct === "boolean")
        .slice(0, 100)
        .map((s) => ({ correct: !!s.correct, isMock: !!s.isMock }))
    : [];
  const byModule: Record<string, { answered: number; correct: number }> = {};
  if (typeof p.byModule === "object" && p.byModule !== null) {
    for (const key of MODULE_KEYS) {
      const v = (p.byModule as Record<string, unknown>)[key];
      if (v && typeof v === "object") {
        const r = v as Record<string, unknown>;
        byModule[key] = { answered: clampCount(r.answered), correct: clampCount(r.correct) };
      }
    }
  }
  return { samples, byModule, mocksTaken: clampCount(p.mocksTaken) };
}

function buildSystemPrompt(progress: ReturnType<typeof parseLocalProgress>): string {
  const lines = [
    "You are David, the friendly, encouraging study coach for the UK CITB Health, Safety & Environment (HS&E) test — the exam people take to get a CSCS card to work on construction sites.",
    "The test is 50 multiple-choice questions in 45 minutes, and you must score 45/50 (90%) to pass. Some questions have more than one correct answer, and some ask you to tap the right spot on an image. Advise booking the real test only once they are consistently scoring around 90%+.",
    "Keep replies short, plain-English and practical. Explain WHY something is safe or unsafe, not just the rule. Never invent legal requirements; if unsure, say so and point them to the official CITB materials. Do not help anyone cheat the real test — teach the underlying knowledge.",
    "The five modules are: Working Environment, Occupational Health, Safety, High Risk Activities, and Specialist Topics.",
  ];

  const readiness = computeReadiness(progress.samples);
  if (readiness.score != null) {
    lines.push(
      `The learner's estimated readiness is ${readiness.score}% (${READINESS_COPY[readiness.band].label}). They have answered ${progress.samples.length} recent questions and taken ${progress.mocksTaken} mock test(s).`
    );
  } else {
    lines.push("The learner is just getting started — encourage them to answer a few questions so you can gauge their readiness.");
  }

  const ranked = Object.entries(progress.byModule)
    .filter(([, v]) => v.answered >= 3)
    .map(([k, v]) => ({ k, pct: Math.round((v.correct / v.answered) * 100) }))
    .sort((a, b) => a.pct - b.pct);
  if (ranked.length > 0) {
    const weak = ranked.slice(0, 2).map((r) => `${moduleTitle(r.k as ModuleKey)} (${r.pct}%)`).join(", ");
    lines.push(`Their weakest module(s) so far: ${weak}. Gently steer revision there when relevant.`);
  }

  return lines.join(" ");
}

export async function POST(request: Request) {
  // Sign-in is optional; use the user id for the daily cap when present.
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userId = user?.id ?? "anon";

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI coach is not configured yet (missing ANTHROPIC_API_KEY)." },
      { status: 503 }
    );
  }

  if (isDailyLimited(userId)) {
    return NextResponse.json(
      { error: "You've used your coach messages for today — check back tomorrow!", code: "daily_limit" },
      { status: 429 }
    );
  }

  let body: { messages?: unknown; progress?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const messages: ChatMessage[] = (Array.isArray(body.messages) ? body.messages : [])
    .filter(
      (m: unknown): m is ChatMessage =>
        !!m &&
        typeof (m as ChatMessage).content === "string" &&
        ((m as ChatMessage).role === "user" || (m as ChatMessage).role === "assistant")
    )
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

  // Anthropic requires the conversation to START on a user turn — after the
  // slice(-12) window the first message could be an assistant reply, so drop
  // any leading non-user turns.
  while (messages.length > 0 && messages[0].role !== "user") messages.shift();

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "No question provided." }, { status: 400 });
  }

  const system = buildSystemPrompt(parseLocalProgress(body.progress));
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const msg = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });
    const reply = msg.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    noteDailyUse(userId); // only successful replies count against the daily cap
    return NextResponse.json({ reply: reply || "Sorry, I couldn't think of a reply just then. Try rephrasing?" });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "The coach is busy right now. Please try again in a moment." }, { status: 429 });
    }
    console.error("coach error", err);
    return NextResponse.json({ error: "The coach is unavailable right now. Please try again." }, { status: 502 });
  }
}
