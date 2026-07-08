// David's avatar — a purple-gradient graduate-cap circle.
export function CoachAvatar({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`flex flex-none items-center justify-center rounded-full bg-[linear-gradient(135deg,#8B4BF5,#6D28D9)] shadow-[0_10px_20px_-10px_rgba(124,58,237,0.7)] ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.52) }}
    >
      🎓
    </span>
  );
}
