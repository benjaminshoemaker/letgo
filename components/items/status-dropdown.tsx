"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateItemStatus } from "@/hooks/use-items";
import type { ItemStatus } from "@/lib/scan-types";

const OPTIONS: { value: ItemStatus; label: string }[] = [
  { value: "TODO", label: "To Do" },
  { value: "SOLD", label: "Sold" },
  { value: "DONATED", label: "Donated" },
  { value: "RECYCLED", label: "Recycled" },
  { value: "TRASHED", label: "Trashed" },
];

export function StatusDropdown({
  itemId,
  status,
}: {
  itemId: string;
  status: ItemStatus;
}) {
  const mutation = useUpdateItemStatus();

  return (
    <Select
      disabled={mutation.isPending}
      onValueChange={(next) => mutation.mutate({ id: itemId, status: next as ItemStatus })}
      value={status}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={mutation.isPending ? "Updating…" : "Update status"} />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
