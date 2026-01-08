"use client";

import { Button } from "@/components/ui/button";
import { ItemCard } from "@/components/items/item-card";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { useItems, type ItemsStatusFilter } from "@/hooks/use-items";

export function ItemList({ status }: { status: ItemsStatusFilter }) {
  const query = useItems({ status });

  const items = query.data?.pages.flatMap((p) => p.items) ?? [];

  if (query.isLoading) {
    return <LoadingSpinner className="py-10" />;
  }

  if (query.isError) {
    return (
      <EmptyState
        description={query.error.message}
        title="Couldn’t load your items"
        primaryAction={{ label: "Try again", href: "/items" }}
      />
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        description="Scan an item to get a recommendation, then save it here."
        title="No items yet"
        primaryAction={{ label: "Scan an item", href: "/scan" }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <ItemCard
          item={{
            id: item.id,
            photoUrl: item.photoUrl,
            identifiedName: item.userOverrideName ?? item.identifiedName,
            recommendation: item.recommendation,
            status: item.status,
          }}
          key={item.id}
        />
      ))}

      {query.hasNextPage ? (
        <Button
          disabled={query.isFetchingNextPage}
          onClick={() => query.fetchNextPage()}
          type="button"
          variant="secondary"
        >
          {query.isFetchingNextPage ? "Loading…" : "Load more"}
        </Button>
      ) : null}
    </div>
  );
}

