"use client";

import { Button } from "@/components/ui/button";
import { useUi } from "@/contexts/ui-context";
import { cn } from "@/lib/utils";

type Tab = { id: "all" | "TODO" | "DONE"; label: string };

const TABS: Tab[] = [
  { id: "all", label: "All" },
  { id: "TODO", label: "To Do" },
  { id: "DONE", label: "Done" },
];

export function ItemFilters() {
  const { itemsFilter, setItemsFilter } = useUi();

  return (
    <div className="flex gap-2 rounded-xl border bg-muted/30 p-1">
      {TABS.map((tab) => {
        const isActive = itemsFilter === tab.id;
        return (
          <Button
            className={cn(
              "h-9 flex-1 rounded-lg text-sm",
              isActive ? "bg-background shadow-sm" : "bg-transparent"
            )}
            key={tab.id}
            onClick={() => setItemsFilter(tab.id)}
            type="button"
            variant="secondary"
          >
            {tab.label}
          </Button>
        );
      })}
    </div>
  );
}

