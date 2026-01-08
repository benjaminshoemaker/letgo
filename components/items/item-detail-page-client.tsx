"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { StatusDropdown } from "@/components/items/status-dropdown";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { RecommendationCard } from "@/components/scan/recommendation-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDeleteItem, useItem } from "@/hooks/use-items";
import { ApiError } from "@/lib/api-client";

export function ItemDetailPageClient({ id }: { id: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const query = useItem(id);
  const deleteMutation = useDeleteItem();

  if (query.isLoading) {
    return <LoadingSpinner className="py-10" />;
  }

  if (query.isError) {
    return (
      <EmptyState
        description={query.error.message}
        title="Couldn’t load this item"
        primaryAction={{ label: "Back to My Items", href: "/items" }}
      />
    );
  }

  const item = query.data?.item;
  if (!item) {
    return <EmptyState title="Item not found" primaryAction={{ label: "Back", href: "/items" }} />;
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Button asChild type="button" variant="secondary">
          <Link href="/items">Back</Link>
        </Button>
        <div className="text-xs text-foreground/70">{item.status}</div>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Image
          alt={item.userOverrideName ?? item.identifiedName}
          className="h-auto w-full"
          height={900}
          src={item.photoUrl}
          unoptimized
          width={1200}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="text-sm font-medium">Status</div>
        <StatusDropdown itemId={item.id} status={item.status} />
      </div>

      <RecommendationCard
        result={{
          identifiedName: item.userOverrideName ?? item.identifiedName,
          recommendation: item.recommendation,
          reasoning: item.reasoning,
          estimatedValueLow: item.estimatedValueLow,
          estimatedValueHigh: item.estimatedValueHigh,
          guidance: item.guidance,
          isHazardous: item.isHazardous,
          hazardWarning: item.hazardWarning,
        }}
      />

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Dialog>
        <DialogTrigger asChild>
          <Button type="button" variant="secondary">
            Delete item
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this item?</DialogTitle>
            <DialogDescription>This can’t be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button
              disabled={deleteMutation.isPending}
              onClick={async () => {
                setError(null);
                try {
                  await deleteMutation.mutateAsync({ id: item.id });
                  router.push("/items?deleted=1");
                } catch (e) {
                  const message =
                    e instanceof ApiError && typeof e.details === "string"
                      ? e.details
                      : e instanceof Error
                        ? e.message
                        : "Delete failed";
                  setError(message);
                }
              }}
              type="button"
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
