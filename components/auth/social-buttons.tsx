"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isNativeAuth, nativeOAuth } from "@/lib/auth/native-oauth";
import { AppleLogo, GoogleLogo } from "@/components/logos";
import { INK, INK_SOFT } from "@/components/auth/auth-shell";
import { ErrorBanner, Spinner } from "@/components/auth/ui";

type OAuthProvider = "google" | "apple";

/**
 * "or continue with" divider + Google / Apple buttons. One flow for both
 * pages: OAuth signs existing users in and creates accounts for new ones.
 */
export function SocialButtons({
  dividerText,
  mode,
}: {
  dividerText: string;
  /** Which entry screen hosts the buttons — threaded to OAuth so the callback
      can show a friendly new-vs-returning note (wired up with onboarding). */
  mode?: "signin" | "signup";
}) {
  const supabase = createClient();
  const [pending, setPending] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleOAuth(provider: OAuthProvider) {
    setError(null);
    setPending(provider);

    // NATIVE (iOS/Android shell): use the in-app Apple/Google sheet and set the
    // session directly in the WebView — no Safari, no PKCE redirect. On success
    // hard-navigate so the server components see the new session cookie.
    if (await isNativeAuth()) {
      const res = await nativeOAuth(provider, mode);
      if (res.ok) {
        window.location.assign(res.redirectTo ?? "/");
        return;
      }
      if (!res.cancelled) setError("Something went wrong. Please try again.");
      setPending(null);
      return;
    }

    // WEB: PKCE redirect flow. The code-verifier cookie is set on THIS origin,
    // so the callback must return to THIS origin to read it back. Use the
    // current origin rather than an env var that could point at a different host.
    const base =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_SITE_URL ?? "";
    const redirectTo = `${base}/auth/callback${mode ? `?mode=${mode}` : ""}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
    if (error) {
      setError("Something went wrong. Please try again.");
      setPending(null);
    }
    // On success the browser is redirected to the provider.
  }

  const sbtn =
    "flex h-[52px] flex-1 items-center justify-center gap-[9px] rounded-full border-[1.5px] border-[rgba(28, 25, 23,0.12)] bg-white text-[14.5px] font-bold transition hover:border-[rgba(249, 115, 22,0.35)] hover:bg-[#FDFBF7] disabled:opacity-60";

  return (
    <div>
      <div
        className="mb-3.5 mt-4 flex items-center gap-3 text-xs font-semibold"
        style={{ color: INK_SOFT }}
      >
        <span className="h-px flex-1 bg-[rgba(28, 25, 23,0.12)]" />
        {dividerText}
        <span className="h-px flex-1 bg-[rgba(28, 25, 23,0.12)]" />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => handleOAuth("google")}
          disabled={pending !== null}
          className={sbtn}
          style={{ color: INK }}
        >
          {pending === "google" ? (
            <Spinner />
          ) : (
            <>
              <GoogleLogo className="h-[18px] w-[18px]" />
              Google
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => handleOAuth("apple")}
          disabled={pending !== null}
          className={sbtn}
          style={{ color: INK }}
        >
          {pending === "apple" ? (
            <Spinner />
          ) : (
            <>
              <AppleLogo className="h-[17px] w-[17px]" />
              Apple
            </>
          )}
        </button>
      </div>

      {error ? (
        <div className="mt-3">
          <ErrorBanner message={error} />
        </div>
      ) : null}
    </div>
  );
}
