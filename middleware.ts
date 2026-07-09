import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// =============================================================
// Canonical host + session refresh.
//
// The whole auth flow MUST stay on ONE host. OAuth (Apple/Google) uses PKCE:
// the code-verifier cookie is written on the host the user is on when they
// click sign-in, and `exchangeCodeForSession` on /auth/callback must read that
// same cookie back. If the callback lands on a DIFFERENT host (e.g. `www.` vs
// the bare domain, or a stale Vercel alias), the cookie isn't present →
// "PKCE code verifier not found in storage" and sign-in fails. Email
// confirmation links have the same requirement.
//
// Our canonical host is the APEX `cscstestapp.com` (matches Supabase Site URL
// and the redirect allow-list). So: bounce `www.` (and any stale production
// alias listed below) to the apex BEFORE anything else runs. Preview deploys
// (branch/commit-hashed *.vercel.app) are intentionally left alone so they stay
// testable.
// =============================================================

const CANONICAL_HOST = "cscstestapp.com";

// Non-canonical production hostnames that should always redirect to the apex.
// Add your production Vercel alias here if you use one (e.g. "cscs-test-app.vercel.app").
const STALE_HOSTS = new Set<string>(["www.cscstestapp.com"]);

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  if (host !== CANONICAL_HOST && STALE_HOSTS.has(host)) {
    const url = new URL(request.url);
    url.protocol = "https:";
    url.host = CANONICAL_HOST;
    url.port = "";
    // 307 (temporary, method-preserving) — avoids browsers permanently caching
    // a host redirect while the domain setup stabilises.
    return NextResponse.redirect(url, 307);
  }
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public image/asset files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
