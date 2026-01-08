"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { ItemFilters } from "@/components/items/item-filters";
import { ItemList } from "@/components/items/item-list";
import { Button } from "@/components/ui/button";
import { useUi } from "@/contexts/ui-context";

export function ItemsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dismissed, setDismissed] = useState(false);
  const { itemsFilter } = useUi();

  const banner = useMemo(() => {
    if (dismissed) return null;
    if (searchParams.get("added") === "1") return "Added to My Items.";
    if (searchParams.get("deleted") === "1") return "Item deleted.";
    return null;
  }, [dismissed, searchParams]);

  return (
    <section className="flex flex-col gap-4">
      {banner ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border bg-muted/30 p-3 text-sm">
          <div>{banner}</div>
          <Button
            onClick={() => {
              setDismissed(true);
              router.replace("/items");
            }}
            size="sm"
            type="button"
            variant="secondary"
          >
            Dismiss
          </Button>
        </div>
      ) : null}
      <ItemFilters />
      <ItemList status={itemsFilter} />
    </section>
  );
}
