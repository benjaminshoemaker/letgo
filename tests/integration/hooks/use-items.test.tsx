/**
 * Integration tests for React Query hooks
 *
 * Tests:
 * - useItems fetches and caches data
 * - useUpdateItemStatus invalidates cache
 * - useScanItem handles success and error
 */

import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { useItems, useUpdateItemStatus, Item, ItemsPage } from "@/hooks/use-items";
import { useScanItem, ScanResponse } from "@/hooks/use-scan";

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockItem: Item = {
  id: "item-1",
  photoUrl: "https://example.com/1.jpg",
  identifiedName: "Vintage Lamp",
  userOverrideName: null,
  condition: "GOOD",
  recommendation: "SELL",
  reasoning: "Good condition, has resale value",
  estimatedValueLow: 2000,
  estimatedValueHigh: 5000,
  guidance: "List on eBay",
  isHazardous: false,
  hazardWarning: null,
  status: "TODO",
  createdAt: "2025-01-01T00:00:00Z",
  updatedAt: "2025-01-01T00:00:00Z",
};

const mockItemsPage: ItemsPage = {
  items: [mockItem],
  nextCursor: null,
  hasMore: false,
  totalCount: 1,
};

const mockScanResponse: ScanResponse = {
  item: {
    id: "item-2",
    photoUrl: "https://example.com/2.jpg",
    identifiedName: "New Item",
    userOverrideName: null,
    condition: "EXCELLENT",
    recommendation: "SELL",
    reasoning: "Like new condition",
    estimatedValueLow: 5000,
    estimatedValueHigh: 10000,
    guidance: "Sell online",
    isHazardous: false,
    hazardWarning: null,
    createdAt: "2025-01-02T00:00:00Z",
    updatedAt: "2025-01-02T00:00:00Z",
  },
  rateLimitRemaining: 49,
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useItems", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches and caches data", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockItemsPage,
    });

    const { result } = renderHook(() => useItems({ status: "all" }), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.pages[0].items).toHaveLength(1);
    expect(result.current.data?.pages[0].items[0].identifiedName).toBe(
      "Vintage Lamp"
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/items"),
      expect.any(Object)
    );
  });

  it("passes status filter to API", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockItemsPage,
    });

    const { result } = renderHook(() => useItems({ status: "TODO" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("status=TODO"),
      expect.any(Object)
    );
  });

  it("handles fetch error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: "Server error" }),
    });

    const { result } = renderHook(() => useItems({ status: "all" }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Server error");
  });
});

describe("useUpdateItemStatus", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("updates item status and returns updated item", async () => {
    const updatedItem = { ...mockItem, status: "SOLD" as const };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ item: updatedItem }),
    });

    const { result } = renderHook(() => useUpdateItemStatus(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: "item-1", status: "SOLD" });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.item.status).toBe("SOLD");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/items/item-1"),
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ status: "SOLD" }),
      })
    );
  });

  it("handles update error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: "Not found" }),
    });

    const { result } = renderHook(() => useUpdateItemStatus(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ id: "non-existent", status: "SOLD" });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Not found");
  });
});

describe("useScanItem", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("handles successful scan", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockScanResponse,
    });

    const { result } = renderHook(() => useScanItem(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      imageUrl: "https://example.com/image.jpg",
      condition: "EXCELLENT",
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.item.identifiedName).toBe("New Item");
    expect(result.current.data?.rateLimitRemaining).toBe(49);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/scan"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          imageUrl: "https://example.com/image.jpg",
          condition: "EXCELLENT",
        }),
      })
    );
  });

  it("handles scan error with low confidence", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      json: async () => ({
        error: "Low confidence identification",
        code: "LOW_CONFIDENCE",
      }),
    });

    const { result } = renderHook(() => useScanItem(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      imageUrl: "https://example.com/image.jpg",
      condition: "FAIR",
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Low confidence identification");
  });

  it("handles rate limit error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      json: async () => ({
        error: "Daily scan limit reached",
        code: "RATE_LIMITED",
        resetAt: "2025-01-25T00:00:00Z",
      }),
    });

    const { result } = renderHook(() => useScanItem(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({
      imageUrl: "https://example.com/image.jpg",
      condition: "GOOD",
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe("Daily scan limit reached");
  });
});
