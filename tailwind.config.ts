import type { Config } from "tailwindcss";

// =============================================================
// CSCS Test App — brand system (construction theme).
// Charcoal + safety-orange + hi-vis yellow. Tokens are also mirrored as CSS
// variables in app/globals.css (--ink, --purple, …) for the hand-written
// component classes.
//
// NOTE ON ALIASES: the app's ~40 components were built with the utility names
// text-ink / bg-purple / bg-lilac / gold. Rather than a risky app-wide class
// rename (the substring "ink" collides with next/link etc.), those names are
// kept as ALIASES pointing at the new construction values, so every existing
// class renders the new palette. New code can use the semantic names
// (text-charcoal, bg-safety-orange, bg-hi-vis, bg-cream).
// =============================================================
const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ---- Construction palette (canonical names) ----
        // Deep charcoal text colour + its softer muted variant.
        charcoal: {
          DEFAULT: "#1C1917",
          soft: "#57534E",
        },
        // Primary accent — safety orange + the deeper pressed/hover shade.
        "safety-orange": "#F97316",
        "orange-deep": "#C2410C",
        // Secondary accent — hi-vis yellow (badges / streaks / XP / gauge ticks).
        "hi-vis": "#FACC15",
        // Warm cream tint for soft backgrounds / selected pills.
        cream: "#FEF3E2",
        // App canvas.
        canvas: "#FFFFFF",
        // Semantic answer states (correct / incorrect) for the quiz UI.
        good: "#22B268",
        bad: "#E05555",

        // ---- Back-compat aliases → new construction values ----
        // Utilities: text-ink, text-ink-soft, bg-purple, text-purple-deep,
        // bg-lilac, bg-gold — all now render the construction palette.
        ink: {
          DEFAULT: "#1C1917",
          soft: "#57534E",
        },
        purple: {
          DEFAULT: "#F97316",
          deep: "#C2410C",
        },
        lilac: "#FEF3E2",
        gold: "#FACC15",
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
        // Soft charcoal-tinted lift for white cards.
        glow: "0 14px 30px -18px rgba(28,25,23,0.30)",
        // Safety-orange bloom under primary pill buttons.
        pop: "0 14px 26px -12px rgba(249,115,22,0.75)",
      },
    },
  },
  plugins: [],
};

export default config;
