"use client";

import Link from "next/link";
import Image from "next/image";

import { Card } from "@/components/ui/card";
import type { ItemStatus, Recommendation } from "@/lib/scan-types";
import { cn } from "@/lib/utils";

function badgeClass(recommendation: Recommendation): string {
  switch (recommendation) {
    case "SELL":
      return "bg-emerald-600 text-white";
    case "DONATE":
      return "bg-sky-600 text-white";
    case "RECYCLE":
      return "bg-amber-600 text-white";
    case "DISPOSE":
      return "bg-rose-600 text-white";
  }
}

function statusLabel(status: ItemStatus): string {
  switch (status) {
    case "TODO":
      return "To do";
    case "SOLD":
      return "Sold";
    case "DONATED":
      return "Donated";
    case "RECYCLED":
      return "Recycled";
    case "TRASHED":
      return "Trashed";
  }
}

export function ItemCard({
  item,
}: {
  item: {
    id: string;
    photoUrl: string;
    identifiedName: string;
    recommendation: Recommendation;
    status: ItemStatus;
  };
}) {
  return (
    <Link className="block" href={`/items/${item.id}`}>
      <Card className="p-3">
        <div className="flex items-center gap-3">
          <div className="relative h-14 w-14 overflow-hidden rounded-md border bg-muted/30">
            <Image
              alt={item.identifiedName}
              className="object-cover"
              fill
              sizes="56px"
              src={item.photoUrl}
              unoptimized
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="truncate text-sm font-medium">{item.identifiedName}</div>
              <span
                className={cn(
                  "inline-flex shrink-0 items-center rounded-full px-2 py-1 text-[10px] font-semibold",
                  badgeClass(item.recommendation)
                )}
              >
                {item.recommendation}
              </span>
            </div>
            <div className="mt-1 text-xs text-foreground/70">{statusLabel(item.status)}</div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

