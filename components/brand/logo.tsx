// The app logo (white safety check on the purple gradient tile), shared by
// the splash animations, notification previews and future landing page.
// Same tile/gradient as the My Life in the UK Test app's BrandLogo; the
// sunrise-crown artwork is swapped for the CSCS safety check.

export function BrandLogo({
  className,
  withWordmark = true,
}: {
  className?: string;
  withWordmark?: boolean;
}) {
  const id = withWordmark ? "brandLgBig" : "brandLgSmall";
  return (
    <svg viewBox="0 0 44 44" className={className} aria-hidden="true">
      <rect width="44" height="44" rx="13" fill={`url(#${id})`} />
      {withWordmark ? (
        <>
          <path
            d="M15 20.5l5 5L30 15"
            stroke="#fff"
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text
            x="22"
            y="38.5"
            textAnchor="middle"
            fontWeight="800"
            fontSize="8"
            letterSpacing="1"
            fill="#fff"
          >
            CSCS
          </text>
        </>
      ) : (
        <path
          d="M14 23l5.5 5.5L31 16"
          stroke="#fff"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8B4BF5" />
          <stop offset="1" stopColor="#6D28D9" />
        </linearGradient>
      </defs>
    </svg>
  );
}
