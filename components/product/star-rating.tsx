import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  rating,
  size = 14,
  className,
  showValue = false,
}: {
  rating: number;
  size?: number;
  className?: string;
  showValue?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="relative inline-flex" style={{ width: size * 5, height: size }}>
        {/* empty track */}
        <span className="absolute inset-0 flex">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} style={{ width: size, height: size }} className="text-foreground/20" />
          ))}
        </span>
        {/* filled overlay */}
        <span
          className="absolute inset-0 flex overflow-hidden"
          style={{ width: `${(rating / 5) * 100}%` }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              style={{ width: size, height: size }}
              className="shrink-0 fill-brand text-brand"
            />
          ))}
        </span>
      </span>
      {showValue && (
        <span className="text-xs text-muted-foreground tabular-nums">
          {rating.toFixed(1)}
        </span>
      )}
    </span>
  );
}
