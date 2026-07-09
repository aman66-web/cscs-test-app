import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// =============================================================
// Request-scoped Supabase reads, deduped with React cache().
//
// Ported from the My Life in the UK Test app: without this, one dashboard
// navigation makes up to five sequential Supabase network calls (layout
// getUser + profile select, page getUser + profile select, …). Layout and
// page share ONE getUser and ONE profile select per request instead.
// =============================================================

/** The columns every screen collectively needs — fetched once per request. */
export type CachedProfile = {
  first_name: string | null;
  date_of_birth: string | null;
  email: string | null;
  taken_before: boolean | null;
  previous_score: number | null;
  hardest_topics: unknown;
  hardest_notes: string | null;
  onboarding_completed: boolean | null;
  goal: string | null;
  test_date: string | null;
} | null;

const PROFILE_COLUMNS =
  "first_name, date_of_birth, email, taken_before, previous_score, " +
  "hardest_topics, hardest_notes, onboarding_completed, goal, test_date";

/** The signed-in user, fetched at most once per server request. */
export const getCachedUser = cache(async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** The user's profile row, fetched at most once per server request. */
export const getCachedProfile = cache(
  async (userId: string): Promise<CachedProfile> => {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("id", userId)
      .maybeSingle<NonNullable<CachedProfile>>();
    return data ?? null;
  }
);
