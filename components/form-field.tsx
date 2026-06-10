import * as React from "react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  className,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs font-medium text-foreground/80">
        {label}
      </span>
      <input
        className="h-11 w-full border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-foreground"
        {...props}
      />
    </label>
  );
}
