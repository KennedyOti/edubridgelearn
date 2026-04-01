"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  reviewCount?: number;
  className?: string;
}

export function Rating({
  value,
  max = 5,
  size = "md",
  showValue = true,
  reviewCount,
  className,
}: RatingProps) {
  const sizes = { sm: "w-3 h-3", md: "w-4 h-4", lg: "w-5 h-5" };
  const textSizes = { sm: "text-xs", md: "text-sm", lg: "text-base" };
  const num = Number(value) || 0;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              sizes[size],
              i < Math.floor(num)
                ? "fill-amber-400 text-amber-400"
                : i < num
                ? "fill-amber-200 text-amber-400"
                : "fill-none text-muted-foreground/30"
            )}
          />
        ))}
      </div>
      {showValue && (
        <span className={cn("font-semibold text-foreground", textSizes[size])}>
          {num.toFixed(1)}
        </span>
      )}
      {reviewCount != null && (
        <span className={cn("text-muted-foreground", textSizes[size])}>
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
}
