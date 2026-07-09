// Maps the machine-readable `reason` code that /auth/callback attaches to its
// error redirect (?error=auth&reason=...) into a human-readable, actionable
// message for the sign-in screen. The RAW code is never shown to the user —
// it stays in the URL and server logs for debugging. Pure module: safe to
// import from server components.

type Rule = { test: RegExp; message: string };

const RULES: Rule[] = [
  {
    // Supabase "Allow new users to sign up" is switched off (signup_disabled),
    // or the provider returned before the account could be created.
    test: /signup.*(disabled|not.*(allowed|complete))|signups? not allowed/i,
    message:
      "We couldn't create your account — new sign-ups appear to be switched off for this app right now. If you already have an account, try signing in with the same method you used before.",
  },
  {
    // PKCE code-verifier cookie missing: the flow started on one web address
    // (e.g. www) and returned to another (e.g. the bare domain), so the
    // browser cookie holding the security code couldn't be read back.
    test: /code.?verifier|pkce|flow.?state|invalid.?flow/i,
    message:
      "The sign-in started and finished on different web addresses, so it couldn't complete securely. Please try again in one go, always using the same address for this site.",
  },
  {
    // Our callback's POST handler: Apple Service ID Return URL points here
    // instead of at Supabase's callback.
    test: /apple_return_url_misconfigured/i,
    message:
      "Apple sign-in isn't fully set up yet — please try another sign-in method, or contact support.",
  },
  {
    // Provider switched on in Supabase but its credentials are incomplete.
    test: /missing oauth secret|provider.*not.*enabled|unsupported provider|validation_failed/i,
    message:
      "That sign-in method isn't fully set up yet — please use your email address instead, or contact support.",
  },
  {
    test: /access_denied|cancell?ed|consent/i,
    message: "The sign-in was cancelled before it finished. Please try again.",
  },
  {
    test: /expired/i,
    message: "That sign-in link or code has expired. Please start again.",
  },
  {
    test: /no_code/i,
    message:
      "The sign-in provider returned without completing. Please try again.",
  },
];

/** Human-readable message for an auth-callback failure reason. Never echoes
    the raw code; unknown reasons fall back to a friendly generic line. */
export function friendlyAuthError(reason: string | null | undefined): string {
  const r = (reason ?? "").slice(0, 300);
  for (const rule of RULES) {
    if (rule.test.test(r)) return rule.message;
  }
  return "We couldn't finish that sign-in. Please try again.";
}
