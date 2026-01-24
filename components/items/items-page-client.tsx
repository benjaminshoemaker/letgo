"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

import { ItemFilters } from "@/components/items/item-filters";
import { ItemList } from "@/components/items/item-list";
import { useUi } from "@/contexts/ui-context";

export function ItemsPageClient() {
  const searchParams = useSearchParams();
  const { itemsFilter } = useUi();
  const toastShown = useRef(false);

  useEffect(() => {
    if (toastShown.current) return;

    if (searchParams.get("added") === "1") {
      toast.success("Added to My Items");
      toastShown.current = true;
    } else if (searchParams.get("deleted") === "1") {
      toast.success("Item deleted");
      toastShown.current = true;
    }
  }, [searchParams]);

  return (
    <section className="flex flex-col gap-4">
      <ItemFilters />
      <ItemList status={itemsFilter} />
    </section>
  );
}
