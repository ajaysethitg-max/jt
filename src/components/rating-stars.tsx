import { Star } from "lucide-react";
import { cn } from "@/lib/format";

function Stars({ size }: { size: number }) {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} strokeWidth={0} className="shrink-0 fill-current" />
      ))}
    </>
  );
}

export function RatingStars({
  rating,
  count,
  size = 14,
  className,
  showValue = false,
}: {
  rating: number;
  count?: number;
  size?: number;
  className?: string;
  showValue?: boolean;
}) {
  const width = size * 5 + 2 * 4;
  const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
  return (
    <div className={cn("flex items-center gap-1.5", className)} aria-label={`Rated ${rating.toFixed(1)} out of 5`}>
      <div className="relative shrink-0" style={{ width, height: size }}>
        <div className="absolute inset-0 flex gap-0.5 text-ink-200">
          <Stars size={size} />
        </div>
        <div
          className="absolute inset-y-0 left-0 flex gap-0.5 overflow-hidden text-bp-500"
          style={{ width: `${pct}%` }}
        >
          <div className="flex shrink-0 gap-0.5">
            <Stars size={size} />
          </div>
        </div>
      </div>
      {showValue && <span className="tnum text-xs font-bold text-ink-700">{rating.toFixed(1)}</span>}
      {typeof count === "number" && <span className="tnum text-xs text-ink-400">({count})</span>}
    </div>
  );
}
