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

export function useScanItem() {
  const queryClient = useQueryClient();

  return useMutation<ScanResponse, ApiError, ScanRequest>({
    mutationFn: async (payload) => {
      return await fetchJson<ScanResponse>("/api/scan", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.items });
    },
  });
}

export function useManualScanItem() {
  const queryClient = useQueryClient();

  return useMutation<ScanResponse, ApiError, ManualScanRequest>({
    mutationFn: async (payload) => {
      return await fetchJson<ScanResponse>("/api/scan/manual", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.items });
    },
  });
}
