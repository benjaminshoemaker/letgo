"use client";

import { ItemFilters } from "@/components/items/item-filters";
import { ItemList } from "@/components/items/item-list";
import { useUi } from "@/contexts/ui-context";

export function ItemsPageClient() {
  const { itemsFilter } = useUi();

  return (
    <section className="flex flex-col gap-4">
      <ItemFilters />
      <ItemList status={itemsFilter} />
    </section>
  );
}

