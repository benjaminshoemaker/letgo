"use client";

import { Card, CardContent } from "@/components/ui/card";

function formatResetTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "tomorrow";
  return date.toLocaleString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function RateLimitBanner({
  scansRemaining,
  scanLimit,
  resetsAt,
}: {
  scansRemaining: number;
  scanLimit: number;
  resetsAt: string;
}) {
  const reached = scansRemaining <= 0;

  return (
    <Card className={reached ? "border-amber-300 bg-amber-50" : undefined}>
      <CardContent className="flex flex-col gap-1 p-4">
        <div className="text-sm font-medium">
          {reached ? "Daily scan limit reached" : `Scans remaining: ${scansRemaining}/${scanLimit}`}
        </div>
        <div className="text-sm text-foreground/70">Resets at {formatResetTime(resetsAt)}.</div>
      </CardContent>
    </Card>
  );
}

