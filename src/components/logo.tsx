import { cn } from "@/lib/format";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cn("h-10 w-10 shrink-0", className)} aria-hidden="true">
      <defs>
        <linearGradient id="jeet-logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#46c6b8" />
          <stop offset="1" stopColor="#12736a" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill="url(#jeet-logo-g)" />
      <rect x="15" y="8" width="18" height="32" rx="5" fill="#fff" />
      <rect x="18" y="12" width="12" height="21" rx="2.5" fill="#7ddcd0" />
      <path
        d="M24 18.2c1.9-1.6 4.9-.5 4.9 2 0 2.3-2.8 3.9-4.9 5-2.1-1.1-4.9-2.7-4.9-5 0-2.5 3-3.6 4.9-2z"
        fill="#f26a97"
      />
      <circle cx="24" cy="36.5" r="1.7" fill="#15262b" />
    </svg>
  );
}

export function BrandWordmark({ siteName, className, sub }: { siteName: string; className?: string; sub?: string }) {
  return (
    <span className="flex min-w-0 flex-col leading-none">
      <span className={cn("font-display text-xl font-semibold tracking-tight text-ink-900 sm:text-2xl", className)}>
        {siteName}
      </span>
      {sub && <span className="mt-1 truncate text-[11px] font-semibold uppercase tracking-[0.16em] text-tq-700">{sub}</span>}
    </span>
  );
}
