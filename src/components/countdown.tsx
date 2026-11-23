"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock } from "lucide-react";
import { cn, splitDuration } from "@/lib/format";

type Unit = [label: string, value: number | undefined];

export function Countdown({
  endsAt,
  size = "md",
  className,
  label = "Deal ends in",
  dark = false,
}: {
  endsAt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
  dark?: boolean;
}) {
  const [now, setNow] = useState<number | null>(null);
  const end = useMemo(() => new Date(endsAt).getTime(), [endsAt]);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const remaining = now === null ? null : Math.max(0, end - now);
  const ended = remaining === 0;
  const d = remaining === null ? null : splitDuration(remaining);

  const units: Unit[] =
    d === null
      ? [["Hrs", undefined], ["Min", undefined], ["Sec", undefined]]
      : d.days > 0
        ? [["Days", d.days], ["Hrs", d.hours], ["Min", d.minutes], ["Sec", d.seconds]]
        : [["Hrs", d.hours], ["Min", d.minutes], ["Sec", d.seconds]];

  const box =
    size === "lg"
      ? "h-14 w-14 text-2xl sm:h-16 sm:w-16 sm:text-[28px]"
      : size === "sm"
        ? "h-8 w-8 text-sm"
        : "h-10 w-10 text-lg";

  if (ended) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 text-sm font-semibold",
          dark ? "text-bp-200" : "text-ink-500",
          className,
        )}
      >
        <Clock className="h-4 w-4" /> This deal has ended
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div
        className={cn(
          "flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em]",
          dark ? "text-bp-200" : "text-bp-700",
        )}
      >
        <Clock className="h-3.5 w-3.5" /> {label}
      </div>
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {units.map(([u, v]) => (
          <div key={u} className="flex items-center gap-1">
            <div
              className={cn(
                "tnum grid place-items-center rounded-xl font-semibold leading-none shadow-soft",
                dark ? "bg-white text-ink-900" : "bg-ink-900 text-white",
                box,
              )}
            >
              {v === undefined ? "--" : String(v).padStart(2, "0")}
            </div>
            <span className={cn("text-[10px] font-bold uppercase tracking-wider", dark ? "text-white/70" : "text-ink-400")}>
              {u}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Compact "04:12:33" timer used inside product cards. */
export function MiniCountdown({ endsAt, className }: { endsAt: string; className?: string }) {
  const [now, setNow] = useState<number | null>(null);
  const end = useMemo(() => new Date(endsAt).getTime(), [endsAt]);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) return <span className={cn("tnum", className)}>--:--:--</span>;
  const remaining = Math.max(0, end - now);
  if (remaining === 0) return <span className={className}>Ended</span>;
  const d = splitDuration(remaining);
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    <span className={cn("tnum", className)}>
      {d.days > 0 ? `${d.days}d ` : ""}
      {p(d.hours)}:{p(d.minutes)}:{p(d.seconds)}
    </span>
  );
}
