"use server";

import { createClient } from "@/lib/supabase/server";

// Cloned from the My Life in the UK Test app's app/settings/actions.ts.

type Result = { ok: true } | { ok: false; error: string };

export async function updateFirstName(name: string): Promise<Result> {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false, error: "Please enter your first name." };
  if (trimmed.length > 100) return { ok: false, error: "That name is too long." };

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Your session has expired." };

  const { error } = await supabase
    .from("profiles")
    .update({ first_name: trimmed })
    .eq("id", user.id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Set (or clear, with null) the user's booked test date. */
export async function updateTestDate(date: string | null): Promise<Result> {
  if (date !== null) {
    // Shape AND calendar validity ("2026-13-45" passes the regex alone —
    // round-trip through Date to reject impossible dates).
    const d = new Date(`${date}T00:00:00Z`);
    if (
      !DATE_RE.test(date) ||
      Number.isNaN(d.getTime()) ||
      d.toISOString().slice(0, 10) !== date
    ) {
      return { ok: false, error: "Please pick a valid date." };
    }
  }
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Your session has expired." };

  const { error } = await supabase
    .from("profiles")
    .update({ test_date: date })
    .eq("id", user.id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

/** Daily study goal in minutes (stored in the profiles.goal text column). */
export async function updateDailyGoal(minutes: number): Promise<Result> {
  if (!Number.isFinite(minutes) || minutes < 5 || minutes > 120) {
    return { ok: false, error: "Pick a goal between 5 and 120 minutes." };
  }
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Your session has expired." };

  const { error } = await supabase
    .from("profiles")
    .update({ goal: String(Math.round(minutes)) })
    .eq("id", user.id);
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function deleteAccount(): Promise<Result> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Your session has expired." };

  const { error } = await supabase.rpc("delete_account");
  if (error) return { ok: false, error: error.message };

  // The auth user is gone now — clear the local session cookies too.
  await supabase.auth.signOut();
  return { ok: true };
}
