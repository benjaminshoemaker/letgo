"use client";

import { useQuery } from "@tanstack/react-query";

import { ApiError, fetchJson } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

export type UserStats = {
  scansToday: number;
  scanLimit: number;
  scansRemaining: number;
  resetsAt: string;
};

export function useUserStats() {
  return useQuery<UserStats, ApiError>({
    queryKey: queryKeys.userStats,
    queryFn: async () => {
      return await fetchJson<UserStats>("/api/user/stats");
    },
    staleTime: 30_000,
  });
}

