// =============================================================
// Server-side answer log — writes every answered question to the Supabase
// `user_answers` table (supabase/questions.sql), the same schema the
// My Life in the UK Test app defines. This is the authoritative record for
// readiness/accuracy: it survives reinstalls, syncs across devices, and the
// AI coach reads it server-side to personalise.
//
// Fire-and-forget by design: recording is a background side effect of the
// localStorage log (the instant-read cache the UI uses) and must NEVER block
// or break a quiz — offline, signed-out, or a missing table all no-op.
// =============================================================

import { createClient } from "@/lib/supabase/client";

export function recordAnswersServer(
  entries: { qid: string; module: string; correct: boolean }[],
  isMock: boolean
): void {
  if (entries.length === 0) return;
  void (async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const rows = entries.map((e) => ({
        user_id: user.id,
        question_id: e.qid,
        module: e.module,
        correct: e.correct,
        is_mock: isMock,
      }));
      const { error } = await supabase.from("user_answers").insert(rows);
      if (error) {
        // Table not created yet / RLS mismatch — log once per session shape,
        // never surface to the user (the local log still has everything).
        console.warn("[server-log] user_answers insert failed:", error.message);
      }
    } catch {
      // Offline — best-effort only.
    }
  })();
}
