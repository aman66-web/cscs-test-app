import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { NativeReminderSync } from "@/components/app/native-reminder-sync";
import { ReviewGate } from "@/components/review/review-gate";
import { LanguageProvider } from "@/components/i18n/language-provider";
import "./globals.css";

// App-wide brand font (matches the My Life in the UK Test app). Loaded via
// next/font (self-hosted at build time, no external request, no flash).
// Exposed as the --font-sans CSS variable that Tailwind's `sans` family and
// globals.css reference.
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CSCS Test App",
  description:
    "Practice for the CITB Health, Safety & Environment (HS&E) test — your route to a CSCS card.",
  // All icons live in public/ and are declared explicitly here (no Next
  // file-convention icons in app/, so the <head> has exactly these links):
  //  - SVG favicon (scalable, primary) + 32px PNG fallback
  //  - apple-touch-icon for iOS "Add to Home Screen"
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", type: "image/png", sizes: "32x32" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
  // Pin the scale so iOS can never auto-zoom into a focused input. All inputs
  // are also >=16px, the real fix — this is the backstop.
  maximumScale: 1,
  userScalable: false,
  // Go edge-to-edge so env(safe-area-inset-*) reports the real notch/home-bar
  // insets; screens then pad themselves with .pt-safe / .pb-safe.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Construction theme (charcoal + safety-orange), light-only. The
  // LanguageProvider makes the chosen interface language available app-wide
  // (used by the landing screen today; more screens can adopt t() over time).
  return (
    <html lang="en" className={jakarta.variable}>
      <body>
        <LanguageProvider>
          {children}
          <NativeReminderSync />
          <ReviewGate />
        </LanguageProvider>
      </body>
    </html>
  );
}
