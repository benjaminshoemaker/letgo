"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  primaryAction,
}: {
  title: string;
  description?: string;
  primaryAction?: { label: string; href: string };
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-6">
        <div className="text-base font-medium">{title}</div>
        {description ? <div className="text-sm text-foreground/70">{description}</div> : null}
        {primaryAction ? (
          <Button asChild className="mt-1 w-fit" type="button">
            <Link href={primaryAction.href}>{primaryAction.label}</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

