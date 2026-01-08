"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ApiError, fetchJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { ItemCondition, ItemStatus, Recommendation } from "@/lib/scan-types";

export type ItemsStatusFilter = ItemStatus | "DONE" | "all";

export type Item = {
  id: string;
  photoUrl: string;
  identifiedName: string;
  userOverrideName: string | null;
  condition: ItemCondition;
  recommendation: Recommendation;
  reasoning: string;
  estimatedValueLow: number | null;
  estimatedValueHigh: number | null;
  guidance: string;
  isHazardous: boolean;
  hazardWarning: string | null;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
};

export type ItemsPage = {
  items: Item[];
  nextCursor: string | null;
  hasMore: boolean;
  totalCount: number;
};

export function useItems({
  status = "all",
  limit = 20,
}: {
  status?: ItemsStatusFilter;
  limit?: number;
}) {
  return useInfiniteQuery<ItemsPage, ApiError>({
    queryKey: queryKeys.items.list(status),
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams();
      if (status && status !== "all") params.set("status", status);
      params.set("limit", String(limit));
      const cursor = typeof pageParam === "string" ? pageParam : null;
      if (cursor) params.set("cursor", cursor);

      return await fetchJson<ItemsPage>(`/api/items?${params.toString()}`);
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : null),
  });
}

export function useItem(id: string) {
  return useQuery<{ item: Item }, ApiError>({
    queryKey: queryKeys.items.detail(id),
    queryFn: async () => {
      return await fetchJson<{ item: Item }>(`/api/items/${id}`);
    },
    enabled: Boolean(id),
  });
}

export function useUpdateItemStatus() {
  const queryClient = useQueryClient();

  return useMutation<
    { item: Item },
    ApiError,
    { id: string; status?: ItemStatus; userOverrideName?: string | null }
  >({
    mutationFn: async ({ id, ...body }) => {
      return await fetchJson<{ item: Item }>(`/api/items/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
    },
    onSuccess: async (data) => {
      queryClient.setQueryData(queryKeys.items.detail(data.item.id), data);
      await queryClient.invalidateQueries({ queryKey: queryKeys.items.all });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation<void, ApiError, { id: string }>({
    mutationFn: async ({ id }) => {
      await fetchJson<unknown>(`/api/items/${id}`, { method: "DELETE" });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.items.all });
    },
  });
}
