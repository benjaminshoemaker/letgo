/**
 * @jest-environment node
 */

/**
 * Integration tests for the items API endpoints
 *
 * These tests verify:
 * - List returns user's items only
 * - Filtering by status works
 * - Update status works
 * - Delete works
 * - 404 for non-existent items
 */

// Mock auth - must be before importing the routes
const mockUserId = "test-user-123";

jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn(),
}));

// Mock prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    item: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GET as getItems } from "@/app/api/items/route";
import {
  GET as getItem,
  PATCH as updateItem,
  DELETE as deleteItem,
} from "@/app/api/items/[id]/route";

const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;
const mockFindMany = prisma.item.findMany as jest.MockedFunction<
  typeof prisma.item.findMany
>;
const mockFindFirst = prisma.item.findFirst as jest.MockedFunction<
  typeof prisma.item.findFirst
>;
const mockCount = prisma.item.count as jest.MockedFunction<
  typeof prisma.item.count
>;
const mockUpdate = prisma.item.update as jest.MockedFunction<
  typeof prisma.item.update
>;
const mockDeleteMany = prisma.item.deleteMany as jest.MockedFunction<
  typeof prisma.item.deleteMany
>;

const authUser = {
  id: mockUserId,
  email: "test@example.com",
  name: "Test User",
};

const mockItems = [
  {
    id: "item-1",
    userId: mockUserId,
    photoUrl: "https://example.com/1.jpg",
    identifiedName: "Lamp",
    userOverrideName: null,
    condition: "GOOD" as const,
    recommendation: "SELL" as const,
    reasoning: "Good condition",
    estimatedValueLow: 1000,
    estimatedValueHigh: 2000,
    guidance: "List on eBay",
    isHazardous: false,
    hazardWarning: null,
    status: "TODO" as const,
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
  },
  {
    id: "item-2",
    userId: mockUserId,
    photoUrl: "https://example.com/2.jpg",
    identifiedName: "Chair",
    userOverrideName: null,
    condition: "FAIR" as const,
    recommendation: "DONATE" as const,
    reasoning: "Some wear",
    estimatedValueLow: null,
    estimatedValueHigh: null,
    guidance: "Donate to charity",
    isHazardous: false,
    hazardWarning: null,
    status: "SOLD" as const,
    createdAt: new Date("2025-01-02"),
    updatedAt: new Date("2025-01-02"),
  },
];

function createMockRequest(
  url: string,
  options?: { method?: string; body?: object }
): Request {
  return {
    url,
    method: options?.method ?? "GET",
    json: () => Promise.resolve(options?.body ?? {}),
  } as Request;
}

function createItemRequest(
  itemId: string,
  options?: { method?: string; body?: object }
) {
  return createMockRequest(`http://localhost:3000/api/items/${itemId}`, options);
}

function mockAuthSuccess() {
  mockRequireAuth.mockResolvedValue(authUser);
}

async function expectErrorResponse(
  response: Response,
  status: number,
  errorMessage: string
) {
  const data = await response.json();
  expect(response.status).toBe(status);
  expect(data.error).toBe(errorMessage);
  return data;
}

describe("GET /api/items", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthSuccess();
    mockCount.mockResolvedValue(2);
    mockFindMany.mockResolvedValue(mockItems);
  });

  it("returns user's items only", async () => {
    const request = createMockRequest("http://localhost:3000/api/items");
    const response = await getItems(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.items).toHaveLength(2);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: mockUserId }),
      })
    );
  });

  it("filters by status", async () => {
    mockFindMany.mockResolvedValue([mockItems[0]]);
    mockCount.mockResolvedValue(1);

    const request = createMockRequest(
      "http://localhost:3000/api/items?status=TODO"
    );
    const response = await getItems(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.items).toHaveLength(1);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: mockUserId,
          status: "TODO",
        }),
      })
    );
  });

  it("filters by DONE status group", async () => {
    mockFindMany.mockResolvedValue([mockItems[1]]);
    mockCount.mockResolvedValue(1);

    const request = createMockRequest(
      "http://localhost:3000/api/items?status=DONE"
    );
    const response = await getItems(request);

    expect(response.status).toBe(200);
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          userId: mockUserId,
          status: { in: ["SOLD", "DONATED", "RECYCLED", "TRASHED"] },
        }),
      })
    );
  });

  it("rejects invalid status filter", async () => {
    const request = createMockRequest(
      "http://localhost:3000/api/items?status=INVALID"
    );
    const response = await getItems(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid status filter");
  });

  it("requires authentication", async () => {
    mockRequireAuth.mockRejectedValue(new Error("Unauthorized"));

    const request = createMockRequest("http://localhost:3000/api/items");
    const response = await getItems(request);

    await expectErrorResponse(response, 401, "Unauthorized");
  });
});

describe("GET /api/items/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthSuccess();
  });

  it("returns item for authorized user", async () => {
    mockFindFirst.mockResolvedValue(mockItems[0]);

    const request = createItemRequest("item-1");
    const response = await getItem(request, { params: { id: "item-1" } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.item.id).toBe("item-1");
    expect(mockFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "item-1", userId: mockUserId },
      })
    );
  });

  it("returns 404 for non-existent item", async () => {
    mockFindFirst.mockResolvedValue(null);

    const request = createItemRequest("non-existent");
    const response = await getItem(request, { params: { id: "non-existent" } });

    await expectErrorResponse(response, 404, "Not found");
  });

  it("requires authentication", async () => {
    mockRequireAuth.mockRejectedValue(new Error("Unauthorized"));

    const request = createItemRequest("item-1");
    const response = await getItem(request, { params: { id: "item-1" } });

    await expectErrorResponse(response, 401, "Unauthorized");
  });
});

describe("PATCH /api/items/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthSuccess();
  });

  it("updates item status", async () => {
    const updatedItem = { ...mockItems[0], status: "SOLD" };
    mockUpdate.mockResolvedValue(updatedItem);

    const request = createItemRequest("item-1", {
      method: "PATCH",
      body: { status: "SOLD" },
    });
    const response = await updateItem(request, { params: { id: "item-1" } });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.item.status).toBe("SOLD");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "item-1", userId: mockUserId },
        data: { status: "SOLD" },
      })
    );
  });

  it("rejects invalid status value", async () => {
    const request = createItemRequest("item-1", {
      method: "PATCH",
      body: { status: "INVALID_STATUS" },
    });
    const response = await updateItem(request, { params: { id: "item-1" } });

    await expectErrorResponse(response, 400, "Invalid status value");
  });

  it("returns 404 for non-existent item", async () => {
    mockUpdate.mockRejectedValue(new Error("Record not found"));

    const request = createItemRequest("non-existent", {
      method: "PATCH",
      body: { status: "SOLD" },
    });
    const response = await updateItem(request, {
      params: { id: "non-existent" },
    });

    await expectErrorResponse(response, 404, "Not found");
  });

  it("requires at least one update field", async () => {
    const request = createItemRequest("item-1", {
      method: "PATCH",
      body: {},
    });
    const response = await updateItem(request, { params: { id: "item-1" } });

    await expectErrorResponse(response, 400, "No updates provided");
  });
});

describe("DELETE /api/items/[id]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthSuccess();
  });

  it("deletes item successfully", async () => {
    mockDeleteMany.mockResolvedValue({ count: 1 });

    const request = createItemRequest("item-1", {
      method: "DELETE",
    });
    const response = await deleteItem(request, { params: { id: "item-1" } });

    expect(response.status).toBe(204);
    expect(mockDeleteMany).toHaveBeenCalledWith({
      where: { id: "item-1", userId: mockUserId },
    });
  });

  it("returns 404 for non-existent item", async () => {
    mockDeleteMany.mockResolvedValue({ count: 0 });

    const request = createItemRequest("non-existent", {
      method: "DELETE",
    });
    const response = await deleteItem(request, {
      params: { id: "non-existent" },
    });

    await expectErrorResponse(response, 404, "Not found");
  });

  it("requires authentication", async () => {
    mockRequireAuth.mockRejectedValue(new Error("Unauthorized"));

    const request = createItemRequest("item-1", {
      method: "DELETE",
    });
    const response = await deleteItem(request, { params: { id: "item-1" } });

    await expectErrorResponse(response, 401, "Unauthorized");
  });
});
