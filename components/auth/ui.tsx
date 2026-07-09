"use client";

import { useId, useState } from "react";
import { INK, INK_SOFT } from "@/components/auth/auth-shell";

// ---- Small icons (outline style, matches the auth mock) --------------------

function MailIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="10" width="16" height="10" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function EyeIcon({ off }: { off?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      {off ? (
        <path d="m4 3.5 16 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      ) : null}
    </svg>
  );
}

export function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="rounded-[13px] bg-[#FDE8E8] px-4 py-3 text-[13px] font-semibold text-[#B4232A]"
    >
      {message}
    </div>
  );
}

/**
 * Labelled input: lead icon, soft lilac fill, purple border + glow on focus.
 * `password` adds a working show/hide toggle.
 */
export function TextField({
  label,
  icon,
  password = false,
  ...props
}: {
  label: string;
  icon: "mail" | "lock";
  password?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const [show, setShow] = useState(false);

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-[7px] block ps-1 text-[12.5px] font-bold"
        style={{ color: INK }}
      >
        {label}
      </label>
      <div className="flex h-[53px] items-center gap-[11px] rounded-[15px] border-[1.5px] border-transparent bg-[#FBF5EE] px-[15px] transition focus-within:border-[#F97316] focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(249, 115, 22,0.12)]">
        <span className="flex flex-none" style={{ color: INK_SOFT }}>
          {icon === "mail" ? <MailIcon /> : <LockIcon />}
        </span>
        <input
          id={id}
          {...props}
          type={password ? (show ? "text" : "password") : props.type}
          // 16px minimum: anything smaller makes iOS auto-zoom into the field
          // on focus (zoomed/off-centre screen, sideways scroll, stuck zoom).
          className="min-w-0 flex-1 bg-transparent text-[16px] font-medium outline-none placeholder:font-medium placeholder:text-[#A7A2BE]"
          style={{ color: INK }}
        />
        {password ? (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            className="flex flex-none p-0.5"
            style={{ color: INK_SOFT }}
          >
            <EyeIcon off={show} />
          </button>
        ) : null}
      </div>
    </div>
  );
}

/** Purple gradient pill button (form submit). */
export function PrimaryButton({
  children,
  pending = false,
  disabled = false,
}: {
  children: React.ReactNode;
  pending?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="mt-2 flex items-center justify-center gap-2.5 rounded-full p-[17px] text-base font-bold text-white shadow-[0_14px_26px_-12px_rgba(249, 115, 22,0.75)] outline-none transition hover:-translate-y-px hover:shadow-[0_18px_30px_-12px_rgba(249, 115, 22,0.85)] focus-visible:ring-[3px] focus-visible:ring-[rgba(249, 115, 22,0.4)] active:translate-y-0 disabled:opacity-60 disabled:hover:translate-y-0"
      style={{ background: "linear-gradient(180deg,#F97316,#C2410C)" }}
    >
      {pending ? <Spinner /> : children}
    </button>
  );
}
