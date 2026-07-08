// =============================================================
// Native OAuth for the iOS/Android Capacitor shell.
//
// WHY: the app is a remote wrapper (the shell loads the deployed web app in a
// WebView). A normal web `signInWithOAuth` redirect kicks the user out to
// Safari, Google refuses OAuth in embedded WebViews, and the session set in
// Safari never makes it back into the app — hence the "stuck spinner".
//
// FIX: on native we use a native social-login plugin to get the provider's
// ID token from the IN-APP sheet (Apple's native Sign in with Apple sheet;
// Google's native account picker), then hand that token to
// `supabase.auth.signInWithIdToken`. That sets the Supabase session directly
// INSIDE the WebView's cookie store, so a normal navigation lands the user in
// the app, signed in — no browser redirect, no PKCE round-trip, no spinner.
//
// The whole module is dynamically imported and guarded by isNativeAuth(), so
// nothing here runs (or bloats the bundle) on the plain web, where the
// redirect flow (social-buttons.tsx) is kept.
//
// Client IDs come from NEXT_PUBLIC_* env (baked into the deployed web build).
// =============================================================

import { createClient } from "@/lib/supabase/client";

export type NativeOAuthProvider = "google" | "apple";

/** True only inside the native Capacitor shell (never the plain web). */
export async function isNativeAuth(): Promise<boolean> {
  try {
    const { Capacitor } = await import("@capacitor/core");
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

let initialized = false;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function ensureInitialized(SocialLogin: any): Promise<void> {
  if (initialized) return;
  await SocialLogin.initialize({
    google: {
      // iOS OAuth client id (Google Cloud → Credentials → iOS client).
      iOSClientId: process.env.NEXT_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      // Web client id — the audience Supabase's Google provider verifies.
      webClientId: process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    },
    apple: {
      // Services ID (used only on the web/Android path). On iOS the native
      // sheet uses the app's bundle id; redirectUrl "" prevents any redirect.
      clientId: process.env.NEXT_PUBLIC_APPLE_SERVICES_ID ?? "com.cscstestapp.web",
      redirectUrl: "",
    },
  });
  initialized = true;
}

export type NativeOAuthResult = {
  ok: boolean;
  /** True when the user simply dismissed the native sheet (show no error). */
  cancelled?: boolean;
  error?: string;
  /** Where to navigate on success. */
  redirectTo?: string;
};

/**
 * Run the native sign-in and establish a Supabase session in the WebView.
 * On success the caller hard-navigates to `redirectTo`.
 */
export async function nativeOAuth(
  provider: NativeOAuthProvider
): Promise<NativeOAuthResult> {
  if (provider === "google" && !process.env.NEXT_PUBLIC_GOOGLE_IOS_CLIENT_ID) {
    // Fail loudly rather than with a generic "try again" when the native
    // build shipped without the Google client IDs.
    return { ok: false, error: "Google sign-in isn't set up yet." };
  }
  try {
    const { SocialLogin } = await import("@capgo/capacitor-social-login");
    await ensureInitialized(SocialLogin);

    const res = await SocialLogin.login({
      provider,
      options:
        provider === "google"
          ? { scopes: ["email", "profile"] }
          : { scopes: ["email", "name"] },
    });

    const result = (res?.result ?? {}) as { idToken?: string | null };
    const idToken = result.idToken ?? undefined;
    if (!idToken) {
      return { ok: false, error: "No identity token was returned." };
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithIdToken({
      provider,
      token: idToken,
    });
    if (error) {
      // Log the exact Supabase reason so it's visible in the Safari Web
      // Inspector during device testing (e.g. a Google nonce error → enable
      // "Skip nonce checks" on the Supabase Google provider).
      console.error(
        `[native-oauth] signInWithIdToken(${provider}) failed:`,
        error.message
      );
      return { ok: false, error: error.message };
    }
    // No onboarding/dashboard split yet — land on the home screen.
    return { ok: true, redirectTo: "/" };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e ?? "");
    // The plugins reject with a cancellation message when the user dismisses
    // the sheet — treat that quietly rather than as an error.
    const cancelled = /cancel|dismiss|closed|1001|user.?cancel/i.test(message);
    if (!cancelled) console.error(`[native-oauth] ${provider} failed:`, message);
    return { ok: false, cancelled, error: cancelled ? undefined : message };
  }
}
