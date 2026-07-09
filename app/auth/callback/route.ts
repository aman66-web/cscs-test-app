import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { authedRedirectTarget } from "@/lib/auth/redirect-target";
import { isFreshOAuthSignup } from "@/lib/auth/new-account";

/**
 * OAuth (Google / Apple) redirect target.
 *
 * FLOW (verified): the provider never POSTs here. For Apple, Apple uses
 * response_mode=form_post but posts to SUPABASE's own callback
 * (https://<ref>.supabase.co/auth/v1/callback — this MUST be the "Return URL"
 * on the Apple Service ID). Supabase validates it, mints a PKCE code, and
 * GET-redirects the browser here with `?code=`. We exchange it for a session
 * cookie and forward the user on (new users → /onboarding, else /dashboard).
 *
 * If Apple's Service ID Return URL is misconfigured to point at THIS app, Apple
 * form_posts here instead — see the POST handler below, which surfaces that as
 * an actionable error rather than a bare 405.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const explicitNext = searchParams.get("next");
  // Which entry screen the user STARTED from ("signin" | "signup") — threaded
  // through the OAuth redirectTo so we can message new-vs-returning nicely.
  const mode = searchParams.get("mode");
  const oauthError = searchParams.get("error");
  const oauthErrorDescription = searchParams.get("error_description");

  // The provider / Supabase can redirect back with an error and no code.
  if (oauthError) {
    console.error("[auth/callback] provider error:", oauthError, oauthErrorDescription);
    return errorRedirect(origin, oauthErrorDescription ?? oauthError, request);
  }

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      // Most commonly a missing/blocked PKCE code-verifier cookie (host
      // mismatch, e.g. www vs apex) or an expired Apple client secret.
      console.error("[auth/callback] exchangeCodeForSession failed:", error.message);
      return errorRedirect(origin, error.message, request);
    }

    // Apple only returns the user's name (and, if hidden, the relay email) on
    // the VERY FIRST sign-in. Capture it once into our profile — but NEVER let
    // a profile write break a successful sign-in.
    try {
      await captureOAuthProfile(supabase);
    } catch (e) {
      console.error("[auth/callback] profile capture failed (non-fatal):", e);
    }

    // Only honour an in-app path for ?next= — "/dashboard" style, never an
    // absolute or protocol-relative URL (open-redirect guard).
    const safeNext =
      explicitNext && explicitNext.startsWith("/") && !explicitNext.startsWith("//")
        ? explicitNext
        : null;

    // A brand-new OAuth account (Google/Apple just created it) is sent to the
    // confirm-account interstitial FIRST — "no account found, create one?" —
    // so we never silently sign up someone who only meant to sign in. They
    // confirm (→ onboarding) or cancel (→ the account is deleted). Returning
    // users skip this entirely.
    let next: string;
    if (!safeNext) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (await isFreshOAuthSignup(supabase, user)) {
        next = "/auth/confirm-account";
      } else {
        next = await authedRedirectTarget(supabase);
        // Existing account reached via "Create account" → a friendly note.
        if (mode === "signup" && next.startsWith("/dashboard")) {
          next += (next.includes("?") ? "&" : "?") + "auth=welcomeBack";
        }
      }
    } else {
      next = safeNext;
    }

    // `x-forwarded-host` is set behind a load balancer / proxy.
    const forwardedHost = request.headers.get("x-forwarded-host");
    const isLocalEnv = process.env.NODE_ENV === "development";
    if (isLocalEnv) {
      return NextResponse.redirect(`${origin}${next}`);
    } else if (forwardedHost) {
      return NextResponse.redirect(`https://${forwardedHost}${next}`);
    } else {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Reached with neither a code nor an error — unexpected for the Supabase
  // GET redirect. Usually means the provider sent us here without completing
  // (e.g. Apple form_posted to this app; see POST handler).
  console.error("[auth/callback] no code and no error param on GET");
  return errorRedirect(origin, "no_code", request);
}

/**
 * Apple form_post lands here ONLY if the Apple Service ID "Return URL" is
 * misconfigured to this app instead of Supabase's callback. We can't complete
 * the Supabase-managed OAuth from Apple's raw POST, so surface a clear,
 * actionable error instead of a bare 405.
 */
export async function POST(request: Request) {
  const { origin } = new URL(request.url);
  console.error(
    "[auth/callback] received a POST — Apple is posting directly to this app. " +
      "Set the Apple Service ID 'Return URL' to https://<project-ref>.supabase.co/auth/v1/callback " +
      "(Supabase's callback), not this app's /auth/callback."
  );
  return errorRedirect(origin, "apple_return_url_misconfigured", request);
}

/** Bounce to sign-in with a short machine-readable reason (also server-logged).
    The screen shows a friendly message; the `reason` aids debugging in the URL.
    Prefers x-forwarded-host like the success path, so a failure never strands
    the user on a non-canonical origin (where a retry's PKCE cookie would be
    written to the wrong host). */
function errorRedirect(
  origin: string,
  reason: string,
  request?: Request
): NextResponse {
  const r = encodeURIComponent(reason.slice(0, 200));
  const forwardedHost = request?.headers.get("x-forwarded-host");
  const base =
    process.env.NODE_ENV !== "development" && forwardedHost
      ? `https://${forwardedHost}`
      : origin;
  return NextResponse.redirect(`${base}/sign-in?error=auth&reason=${r}`);
}

/** Pull a first name out of the various shapes Apple/Google put in metadata. */
function firstNameFromMetadata(meta: Record<string, unknown> | undefined): string | null {
  if (!meta) return null;
  const clip = (s: string) => s.trim().slice(0, 100);

  // Apple/Google often provide these directly.
  for (const key of ["first_name", "given_name"]) {
    const v = meta[key];
    if (typeof v === "string" && v.trim()) return clip(v);
  }
  // Apple's raw payload can be a { firstName, lastName } object under `name`.
  const name = meta["name"];
  if (name && typeof name === "object" && "firstName" in name) {
    const fn = (name as { firstName?: unknown }).firstName;
    if (typeof fn === "string" && fn.trim()) return clip(fn);
  }
  // Otherwise take the first word of a full name string.
  const full = meta["full_name"] ?? (typeof name === "string" ? name : undefined);
  if (typeof full === "string" && full.trim()) return clip(full.trim().split(/\s+/)[0]);

  return null;
}

/**
 * On first OAuth login, save the provider's name + email onto our profile row
 * (the `handle_new_user` trigger creates the row; this fills `first_name`,
 * which the app actually uses, from the one-time Apple payload). Skips entirely
 * once a name is present, so later logins read from our DB.
 */
async function captureOAuthProfile(
  supabase: ReturnType<typeof createClient>
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", user.id)
    .maybeSingle<{ first_name: string | null }>();

  // Already have a name → trust our DB, ignore the provider payload.
  if (profile?.first_name && profile.first_name.trim()) return;

  const patch: Record<string, string> = {};
  const first = firstNameFromMetadata(
    user.user_metadata as Record<string, unknown> | undefined
  );
  if (first) patch.first_name = first;
  if (user.email) patch.email = user.email;

  if (Object.keys(patch).length > 0) {
    // RLS: runs as the signed-in user, so this only ever writes their own row.
    await supabase.from("profiles").update(patch).eq("id", user.id);
  }
}
