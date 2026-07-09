// David's avatar — a purple-gradient graduate-cap circle.
export function CoachAvatar({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`flex flex-none items-center justify-center rounded-full bg-[linear-gradient(135deg,#F97316,#C2410C)] shadow-[0_10px_20px_-10px_rgba(249, 115, 22,0.7)] ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.52) }}
    >
      🎓
    </span>
  );
}
