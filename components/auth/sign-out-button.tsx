"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/** Signs the user out and refreshes so server components re-render signed-out. */
export function SignOutButton() {
  const supabase = createClient();
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function signOut() {
    setPending(true);
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void signOut()}
      disabled={pending}
      className="text-sm font-bold text-purple-deep disabled:opacity-50"
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
