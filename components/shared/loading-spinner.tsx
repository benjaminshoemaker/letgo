"use client";

import { cn } from "@/lib/utils";

export function LoadingSpinner({
  className,
  label = "Loading",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div className={cn("flex items-center justify-center gap-2 text-sm text-foreground/70", className)}>
      <span
        aria-hidden
        className="h-4 w-4 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground/70"
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}

