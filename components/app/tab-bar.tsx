"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Floating frosted bottom nav (prototype .nav/.tab): white blur bar with a
// lilac pill on the active tab. Icons are the prototype's 22px stroke set.
// Cloned from the My Life in the UK Test app's tab-bar.tsx (English-only).

type IconProps = { className?: string };

function HomeIcon({ className }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-4.5v-5.5h-5V21H5a1 1 0 0 1-1-1v-8.5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LearnIcon({ className }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 6c-1.8-1.4-4.2-2-8-2v14c3.8 0 6.2.6 8 2 1.8-1.4 4.2-2 8-2V4c-3.8 0-6.2.6-8 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M12 6v14" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function PracticeIcon({ className }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" />
    </svg>
  );
}

function ProfileIcon({ className }: IconProps) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M4.5 20c.8-3.4 3.9-5.4 7.5-5.4s6.7 2 7.5 5.4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const TABS = [
  { href: "/dashboard", label: "Home", Icon: HomeIcon },
  { href: "/learn", label: "Learn", Icon: LearnIcon },
  { href: "/practice", label: "Practice", Icon: PracticeIcon },
  { href: "/profile", label: "Profile", Icon: ProfileIcon },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav
      id="tour-tabs"
      className="fixed inset-x-0 z-30 px-4"
      style={{ bottom: "max(16px, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto flex w-full max-w-md rounded-3xl border border-white/90 bg-white/90 p-2 shadow-[0_18px_40px_-16px_rgba(33,27,78,0.45)] backdrop-blur-xl">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-1 flex-col items-center gap-[3px] rounded-[17px] px-1 py-2 text-[10.5px] font-extrabold transition ${
                active
                  ? "bg-lilac text-purple-deep"
                  : "text-[#9A94B8] hover:text-ink"
              }`}
            >
              <Icon />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
