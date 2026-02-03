"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ApiError, fetchJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { ItemCondition, ScanResult } from "@/lib/scan-types";

export type ScanRequest = {
  imageUrl: string;
  condition: ItemCondition;
};

export type ManualScanRequest = ScanRequest & {
  manualName: string;
};

export type ScanResponse = {
  item: {
    id: string;
    photoUrl: string;
    identifiedName: string;
    userOverrideName: string | null;
    condition: ItemCondition;
    recommendation: ScanResult["recommendation"];
    reasoning: string;
    estimatedValueLow: number | null;
    estimatedValueHigh: number | null;
    guidance: string;
    isHazardous: boolean;
    hazardWarning: string | null;
    createdAt: string;
    updatedAt: string;
  };
  rateLimitRemaining: number;
};

function useScanMutation<TPayload>(endpoint: string) {
  const queryClient = useQueryClient();

  return useMutation<ScanResponse, ApiError, TPayload>({
    mutationFn: async (payload) => {
      return await fetchJson<ScanResponse>(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.items.all });
      await queryClient.invalidateQueries({ queryKey: queryKeys.userStats });
    },
  });
}

export function useScanItem() {
  return useScanMutation<ScanRequest>("/api/scan");
}

export function useManualScanItem() {
  return useScanMutation<ManualScanRequest>("/api/scan/manual");
}
