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
import { isFreshOAuthSignup } from "@/lib/auth/new-account";

export type NativeOAuthProvider = "google" | "apple";

/** True only inside the native Capacitor shell (never the plain web).
    In a normal browser (desktop Safari/Chrome, mobile web) there is no native
    bridge, so isNativePlatform() is false and the buttons take the standard
    web `signInWithOAuth` redirect flow instead. */
export async function isNativeAuth(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const { Capacitor } = await import("@capacitor/core");
    return Capacitor.isNativePlatform() === true;
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
  /** Where to navigate on success (already carries any ?auth= toast param). */
  redirectTo?: string;
};

/** Shape of the name/email the plugin returns for Apple and Google. */
type NativeProfile = {
  email?: string | null;
  givenName?: string | null;
  familyName?: string | null;
  name?: string | null; // Google only (Apple gives given/family)
};

/**
 * Persist the name (+ email) the native provider returned onto our profile row,
 * so onboarding doesn't have to ask for it again (Apple 4.0 requirement).
 *
 * CRITICAL for Apple: the full name is only returned on the user's VERY FIRST
 * authorisation, and it is NOT inside the ID token — it arrives only in the
 * plugin's `profile`. If we don't grab it here, right after sign-in, it is gone
 * forever. Mirrors the web callback's captureOAuthProfile. Never throws — a
 * profile write must never break a successful sign-in.
 */
async function captureNativeProfile(
  supabase: ReturnType<typeof createClient>,
  profile: NativeProfile | undefined
): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: existing } = await supabase
      .from("profiles")
      .select("first_name")
      .eq("id", user.id)
      .maybeSingle<{ first_name: string | null }>();

    const patch: Record<string, string> = {};

    // Derive a first name (Apple: givenName; Google: givenName or first word of
    // `name`). Only write it when we don't already have one, so a later Apple
    // login — which returns no name — never clobbers the saved value.
    if (!existing?.first_name?.trim()) {
      const given = profile?.givenName?.trim() ?? "";
      const full = profile?.name?.trim() ?? "";
      const first = given || (full ? full.split(/\s+/)[0] : "");
      if (first) patch.first_name = first.slice(0, 100);
    }

    // Email: prefer the Supabase session email (relay-safe — Apple's "Hide My
    // Email" relay address arrives here already verified), fall back to the
    // provider's. A relay address is a real, valid email; store it as-is.
    const email = user.email ?? profile?.email ?? undefined;
    if (email) patch.email = email;

    if (Object.keys(patch).length > 0) {
      // RLS lets a user write only their own row.
      await supabase.from("profiles").upsert(
        { id: user.id, ...patch },
        { onConflict: "id" }
      );
    }
  } catch (e) {
    // Non-fatal: sign-in already succeeded; the name step in onboarding is the
    // fallback if this ever fails.
    console.error("[native-oauth] profile capture failed (non-fatal):", e);
  }
}

/**
 * Decide where a freshly-signed-in native user goes, mirroring the web
 * callback: new users → /onboarding, returning → /dashboard, and the same
 * friendly new-vs-returning toast when the chosen entry screen doesn't match
 * (signed in via "Sign in" but has no account yet → "we couldn't find an
 * account…"; via "Create account" but already exists → "welcome back…").
 */
async function nativeRedirect(
  supabase: ReturnType<typeof createClient>,
  mode?: "signin" | "signup"
): Promise<string> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // The confirm-account interstitial is ONLY for the SIGN IN path (tapped
    // "Sign in" but no account yet). A "Create account" tap already asked for an
    // account, so skip it and go straight to onboarding (same as the web callback).
    if (mode !== "signup" && (await isFreshOAuthSignup(supabase, user))) {
      return "/auth/confirm-account";
    }
    let onboarded = false;
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .maybeSingle<{ onboarding_completed: boolean | null }>();
      onboarded = !!data?.onboarding_completed;
    }
    let dest = onboarded ? "/dashboard" : "/onboarding";
    if (mode === "signup" && dest === "/dashboard") dest += "?auth=welcomeBack";
    return dest;
  } catch {
    return "/";
  }
}

/**
 * Run the native sign-in and establish a Supabase session in the WebView.
 * On success the caller hard-navigates to `redirectTo`, which routes the user
 * to onboarding (new) or the dashboard (returning) with the right arrival toast.
 * `mode` is the entry screen the user tapped ("signin" | "signup").
 */
export async function nativeOAuth(
  provider: NativeOAuthProvider,
  mode?: "signin" | "signup"
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

    const result = (res?.result ?? {}) as {
      idToken?: string | null;
      profile?: NativeProfile;
    };
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

    // Grab the provider's name/email NOW — for Apple this is the ONLY moment the
    // full name is ever available (first authorisation only). Persisted so
    // onboarding can skip the name/email steps.
    await captureNativeProfile(supabase, result.profile);

    return { ok: true, redirectTo: await nativeRedirect(supabase, mode) };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e ?? "");
    // The plugins reject with a cancellation message when the user dismisses
    // the sheet — treat that quietly rather than as an error.
    const cancelled = /cancel|dismiss|closed|1001|user.?cancel/i.test(message);
    if (!cancelled) console.error(`[native-oauth] ${provider} failed:`, message);
    return { ok: false, cancelled, error: cancelled ? undefined : message };
  }
}
