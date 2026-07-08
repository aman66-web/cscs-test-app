import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// =============================================================
// Middleware — refreshes the Supabase auth session on every request.
//
// NOTE (canonical host): OAuth (Apple/Google) uses PKCE, which requires the
// whole sign-in flow to stay on ONE host. Once you have a production domain
// and know your Vercel alias, add a redirect here that bounces any stale
// hostname to the canonical host BEFORE calling updateSession (see the
// My Life in the UK Test app's middleware.ts for the reference pattern).
// =============================================================
export async function middleware(request: NextRequest) {
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
  // The @supabase/ssr → supabase-js chain uses dynamic code (computed requires
  // in the realtime transport) that Next.js's Edge bundler rejects by default,
  // failing the Vercel deploy with "referencing unsupported modules". This
  // whitelists the Supabase packages so the Edge bundler allows their dynamic
  // code instead of failing the build. (Globs are relative to the app root;
  // both forms cover hoisted and nested installs.)
  unstable_allowDynamic: [
    "/node_modules/@supabase/**",
    "**/node_modules/@supabase/**",
  ],
};
