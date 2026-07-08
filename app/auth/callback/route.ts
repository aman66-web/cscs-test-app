import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { authedRedirectTarget } from "@/lib/auth/redirect-target";

/**
 * OAuth (Google / Apple) redirect target for the WEB flow.
 *
 * Supabase validates the provider response, mints a PKCE code, and
 * GET-redirects the browser here with `?code=`. We exchange it for a session
 * cookie and forward the user on. (On native iOS/Android the app uses
 * signInWithIdToken instead and never hits this route — see native-oauth.ts.)
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const explicitNext = searchParams.get("next");
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
      // mismatch) or an expired Apple client secret.
      console.error("[auth/callback] exchangeCodeForSession failed:", error.message);
      return errorRedirect(origin, error.message, request);
    }

    // Only honour an in-app path for ?next= — never an absolute or
    // protocol-relative URL (open-redirect guard).
    const safeNext =
      explicitNext && explicitNext.startsWith("/") && !explicitNext.startsWith("//")
        ? explicitNext
        : null;
    const next = safeNext ?? (await authedRedirectTarget(supabase));

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

  // Reached with neither a code nor an error — unexpected.
  console.error("[auth/callback] no code and no error param on GET");
  return errorRedirect(origin, "no_code", request);
}

/** Bounce to sign-in with a short machine-readable reason (also server-logged). */
function errorRedirect(origin: string, reason: string, request?: Request): NextResponse {
  const r = encodeURIComponent(reason.slice(0, 200));
  const forwardedHost = request?.headers.get("x-forwarded-host");
  const base =
    process.env.NODE_ENV !== "development" && forwardedHost
      ? `https://${forwardedHost}`
      : origin;
  return NextResponse.redirect(`${base}/sign-in?error=auth&reason=${r}`);
}
