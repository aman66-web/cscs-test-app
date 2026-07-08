import type { Config } from "tailwindcss";

// =============================================================
// CSCS Test App — brand system.
// Colours are adapted 1:1 from the "My Life in the UK Test" app so the two
// share one visual language. Tokens are also mirrored as CSS variables in
// app/globals.css (--ink, --purple, …) for the hand-written component classes.
// =============================================================
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep-ink text colour + its softer muted variant.
        // Utilities: text-ink, bg-ink / text-ink-soft, bg-ink-soft
        ink: {
          DEFAULT: "#211B4E",
          soft: "#6B6690",
        },
        // Brand accent purple + the deeper pressed/hover shade.
        // Utilities: bg-purple, text-purple / bg-purple-deep, text-purple-deep
        purple: {
          DEFAULT: "#7C3AED",
          deep: "#6D28D9",
        },
        // Soft lilac tint for backgrounds / selected pills.  Utility: bg-lilac
        lilac: "#F1EAFE",
        // App canvas.
        canvas: "#FFFFFF",
        // Semantic answer states (correct / incorrect) for the quiz UI.
        good: "#22B268",
        bad: "#E05555",
        gold: "#FFC24B",
      },
      fontFamily: {
        // Plus Jakarta Sans, loaded via next/font in app/layout.tsx and
        // exposed as the --font-sans CSS variable.
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
        card: "20px",
      },
      boxShadow: {
        // Soft ink-tinted lift for white cards.
        glow: "0 14px 30px -18px rgba(33,27,78,0.30)",
        // Purple bloom under primary pill buttons.
        pop: "0 14px 26px -12px rgba(124,58,237,0.75)",
      },
    },
  },
  plugins: [],
};

export default config;
