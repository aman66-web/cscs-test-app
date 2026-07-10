// The app logo — the CSCS hard-hat icon: a charcoal rounded tile, a
// safety-orange hard hat, and a hi-vis yellow reflective stripe. This is the
// SINGLE source of truth for the in-app logo (same artwork as the app icon in
// public/icon.svg), shared by the splash, auth screens, landing page,
// onboarding, the language gate and notification previews — so every screen
// matches. Pure inline SVG: no image file to 404, scales to any size via
// className.

export function BrandLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 44" className={className} aria-hidden="true">
      <rect width="44" height="44" rx="13" fill="url(#brandHat)" />
      {/* hard-hat brim */}
      <rect x="7.5" y="27.5" width="29" height="5" rx="2.5" fill="#F97316" />
      {/* hard-hat dome */}
      <path d="M12.5 28a9.5 9.5 0 0 1 19 0z" fill="#F97316" />
      {/* hi-vis reflective stripe across the dome */}
      <rect x="14" y="21" width="16" height="3.4" rx="1.7" fill="#FACC15" />
      <defs>
        <linearGradient
          id="brandHat"
          x1="0"
          y1="0"
          x2="44"
          y2="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#292524" />
          <stop offset="1" stopColor="#1C1917" />
        </linearGradient>
      </defs>
    </svg>
  );
}
