import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor shell for iOS + Android.
 *
 * MODE: remote wrapper — the native shell loads the DEPLOYED web app
 * (this Next.js app uses server components + Supabase SSR auth, so it can't
 * be statically exported without a refactor). Set server.url to your
 * production origin before running `npx cap sync`.
 *
 * Icon + splash sources live in resources/ — generate the native sets with
 * `npx @capacitor/assets generate` after adding the platforms.
 */
const config: CapacitorConfig = {
  appId: "com.cscstestapp.app",
  appName: "CSCS Test App",
  webDir: "public",
  server: {
    // The deployed production origin (canonical host — the whole auth flow
    // depends on staying on this exact host; see middleware.ts).
    url: process.env.CAP_SERVER_URL ?? "https://cscstestapp.com",
    cleartext: false,
  },
  ios: {
    // "never": let the web content go edge-to-edge (paired with
    // viewport-fit=cover) and handle the notch/home-bar itself via the
    // .pt-safe/.pb-safe env(safe-area-inset-*) padding. Avoids the WebView
    // double-insetting on top of our own safe-area padding.
    contentInset: "never",
  },
  android: {
    allowMixedContent: false,
  },
  backgroundColor: "#F1EAFE",
};

export default config;
