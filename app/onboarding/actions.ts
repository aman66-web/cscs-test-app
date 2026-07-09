"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  sanitizeTopics,
  type SaveOnboardingInput,
  type SaveOnboardingResult,
} from "@/lib/onboarding/types";

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/");
}

function isValidDob(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return false;
  const now = new Date();
  const todayMidnight = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  if (parsed.getTime() > todayMidnight.getTime()) return false;
  // Mirror the client's age gate (steps.tsx MIN_AGE/MAX_AGE) so client and
  // server agree — no under-13 / over-110 dates get persisted.
  const ageYears =
    (todayMidnight.getTime() - parsed.getTime()) / (365.25 * 86400000);
  return ageYears >= 13 && ageYears <= 110;
}

/**
 * Persists a single onboarding step to the signed-in user's profiles row.
 * Validation is authoritative on the server; the client mirrors it for UX.
 * Returns a result object (never throws/redirects mid-flow) so the client
 * can show inline errors and keep control of navigation.
 */
export async function saveOnboarding(
  input: SaveOnboardingInput
): Promise<SaveOnboardingResult> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Your session has expired. Please sign in again." };
  }

  // Build the column patch for this step (validated).
  const patch: Record<string, unknown> = {};

  switch (input.step) {
    case "dob": {
      if (!isValidDob(input.dateOfBirth)) {
        return { ok: false, error: "Please enter a valid date of birth." };
      }
      patch.date_of_birth = input.dateOfBirth;
      break;
    }
    case "firstName": {
      const firstName = input.firstName.trim();
      if (!firstName) return { ok: false, error: "Please enter your first name." };
      if (firstName.length > 100) {
        return { ok: false, error: "That name is too long." };
      }
      patch.first_name = firstName;
      break;
    }
    case "email": {
      const email = input.email.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return { ok: false, error: "Please enter a valid email address." };
      }
      if (email.length > 255) {
        return { ok: false, error: "That email is too long." };
      }
      patch.email = email;
      break;
    }
    case "takenBefore": {
      patch.taken_before = input.takenBefore;
      // "No" can never carry a previous score.
      if (input.takenBefore === false) {
        patch.previous_score = null;
      }
      break;
    }
    case "score": {
      // The CITB HS&E mock is 50 questions, so the score range is 0–50
      // (the Life in the UK app's equivalent is 0–24).
      if (input.previousScore === null) {
        patch.previous_score = null;
      } else if (
        !Number.isInteger(input.previousScore) ||
        input.previousScore < 0 ||
        input.previousScore > 50
      ) {
        return { ok: false, error: "Score must be a whole number from 0 to 50." };
      } else {
        patch.previous_score = input.previousScore;
      }
      break;
    }
    case "hardest": {
      const topics = sanitizeTopics(input.hardestTopics);
      const notes = input.hardestNotes.trim().slice(0, 1000);
      patch.hardest_topics = topics;
      patch.hardest_notes = notes.length > 0 ? notes : null;
      break;
    }
    case "finish": {
      // Age gate is authoritative here: onboarding can only complete once a
      // VALID 13+ date of birth is on the profile. Without this, a client that
      // skipped the DOB step could finish onboarding under-age. (The required
      // steps also can't complete without a name + email.)
      const { data: profile } = await supabase
        .from("profiles")
        .select("date_of_birth, first_name")
        .eq("id", user.id)
        .maybeSingle<{ date_of_birth: string | null; first_name: string | null }>();
      if (!profile?.date_of_birth || !isValidDob(profile.date_of_birth)) {
        return {
          ok: false,
          error: "Please add your date of birth before finishing.",
        };
      }
      if (!profile.first_name?.trim()) {
        return { ok: false, error: "Please add your name before finishing." };
      }
      patch.onboarding_completed = true;
      break;
    }
  }

  // Upsert keyed on the user id — self-healing if the signup trigger never
  // created the row. RLS only permits the owner to write their own row.
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, ...patch }, { onConflict: "id" });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
