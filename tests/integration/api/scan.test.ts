/**
 * @jest-environment node
 */

/**
 * Integration tests for the scan API endpoints
 *
 * These tests verify the scan endpoint behavior including:
 * - Successful scans creating items
 * - Input validation
 * - Authentication requirements
 * - Low confidence handling
 */

// Mock auth - must be before importing the route
const mockUserId = "test-user-123";
jest.mock("@/lib/auth", () => ({
  requireAuth: jest.fn(),
}));

// Mock prisma
const mockItem = {
  id: "item-123",
  userId: mockUserId,
  photoUrl: "https://example.com/image.jpg",
  identifiedName: "Vintage Lamp",
  userOverrideName: null,
  condition: "GOOD",
  recommendation: "SELL",
  reasoning: "This item is in good condition.",
  estimatedValueLow: 2000,
  estimatedValueHigh: 5000,
  guidance: "List on eBay",
  isHazardous: false,
  hazardWarning: null,
  status: "TODO",
  createdAt: new Date(),
  updatedAt: new Date(),
};

jest.mock("@/lib/prisma", () => ({
  prisma: {
    item: {
      create: jest.fn(),
    },
  },
}));

// Mock rate limiting
jest.mock("@/lib/rate-limit", () => ({
  checkRateLimit: jest.fn(),
  incrementScanCount: jest.fn(),
}));

// Mock scan service
jest.mock("@/lib/ai/scan-service", () => ({
  scanItem: jest.fn(),
}));

// Mock retry wrapper to just call the function directly
jest.mock("@/lib/ai/retry", () => ({
  withRetry: jest.fn((fn: () => Promise<unknown>) => fn()),
}));

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, incrementScanCount } from "@/lib/rate-limit";
import { scanItem } from "@/lib/ai/scan-service";
import { POST } from "@/app/api/scan/route";

const mockRequireAuth = requireAuth as jest.MockedFunction<typeof requireAuth>;
const mockCreate = prisma.item.create as jest.MockedFunction<
  typeof prisma.item.create
>;
const mockCheckRateLimit = checkRateLimit as jest.MockedFunction<
  typeof checkRateLimit
>;
const mockIncrementScanCount = incrementScanCount as jest.MockedFunction<
  typeof incrementScanCount
>;
const mockScanItem = scanItem as jest.MockedFunction<typeof scanItem>;

function createMockRequest(body: object): Request {
  return {
    json: () => Promise.resolve(body),
  } as Request;
}

describe("POST /api/scan", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mocks for successful scan
    mockRequireAuth.mockResolvedValue({
      id: mockUserId,
      email: "test@example.com",
      name: "Test User",
    });

    mockCheckRateLimit.mockResolvedValue({
      allowed: true,
      scanLimit: 50,
      scansToday: 1,
      scansRemaining: 49,
      resetAt: new Date(),
    });

    mockIncrementScanCount.mockResolvedValue({
      allowed: true,
      scanLimit: 50,
      scansToday: 2,
      scansRemaining: 48,
      resetAt: new Date(),
    });

    mockScanItem.mockResolvedValue({
      identifiedName: "Vintage Lamp",
      recommendation: "SELL",
      reasoning: "This item is in good condition.",
      estimatedValueLow: 2000,
      estimatedValueHigh: 5000,
      guidance: "List on eBay",
      isHazardous: false,
      hazardWarning: null,
      confidence: "HIGH",
    });

    mockCreate.mockResolvedValue(mockItem);
  });

  it("creates item on successful scan", async () => {
    const request = createMockRequest({
      imageUrl: "https://example.com/image.jpg",
      condition: "GOOD",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.item).toBeDefined();
    expect(data.item.identifiedName).toBe("Vintage Lamp");
    expect(data.rateLimitRemaining).toBe(48);

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: mockUserId,
        photoUrl: "https://example.com/image.jpg",
        condition: "GOOD",
        recommendation: "SELL",
      }),
    });
  });

  it("rejects invalid condition", async () => {
    const request = createMockRequest({
      imageUrl: "https://example.com/image.jpg",
      condition: "INVALID_CONDITION",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid imageUrl or condition");
    expect(mockScanItem).not.toHaveBeenCalled();
  });

  it("rejects missing imageUrl", async () => {
    const request = createMockRequest({
      condition: "GOOD",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("Invalid imageUrl or condition");
  });

  it("requires authentication", async () => {
    mockRequireAuth.mockRejectedValue(new Error("Unauthorized"));

    const request = createMockRequest({
      imageUrl: "https://example.com/image.jpg",
      condition: "GOOD",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe("Unauthorized");
    expect(mockScanItem).not.toHaveBeenCalled();
  });

  it("returns 422 on low confidence", async () => {
    const lowConfidenceError = new Error(
      "Low confidence identification"
    ) as Error & { code: string };
    lowConfidenceError.code = "LOW_CONFIDENCE";
    mockScanItem.mockRejectedValue(lowConfidenceError);

    const request = createMockRequest({
      imageUrl: "https://example.com/image.jpg",
      condition: "GOOD",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(422);
    expect(data.error).toBe("Low confidence identification");
    expect(data.code).toBe("LOW_CONFIDENCE");
  });

  it("enforces rate limiting", async () => {
    mockCheckRateLimit.mockResolvedValue({
      allowed: false,
      scanLimit: 50,
      scansToday: 50,
      scansRemaining: 0,
      resetAt: new Date("2025-01-25T00:00:00Z"),
    });

    const request = createMockRequest({
      imageUrl: "https://example.com/image.jpg",
      condition: "GOOD",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data.error).toBe("Daily scan limit reached");
    expect(data.code).toBe("RATE_LIMITED");
    expect(mockScanItem).not.toHaveBeenCalled();
  });

  it("accepts all valid condition values", async () => {
    const conditions = ["EXCELLENT", "GOOD", "FAIR", "POOR"];

    for (const condition of conditions) {
      jest.clearAllMocks();
      mockRequireAuth.mockResolvedValue({
        id: mockUserId,
        email: "test@example.com",
        name: "Test User",
      });
      mockCheckRateLimit.mockResolvedValue({
        allowed: true,
        scanLimit: 50,
        scansToday: 1,
        scansRemaining: 49,
        resetAt: new Date(),
      });
      mockIncrementScanCount.mockResolvedValue({
        allowed: true,
        scanLimit: 50,
        scansToday: 2,
        scansRemaining: 48,
        resetAt: new Date(),
      });
      mockScanItem.mockResolvedValue({
        identifiedName: "Test Item",
        recommendation: "SELL",
        reasoning: "Test reasoning",
        estimatedValueLow: 1000,
        estimatedValueHigh: 2000,
        guidance: "Test guidance",
        isHazardous: false,
        hazardWarning: null,
        confidence: "HIGH",
      });
      mockCreate.mockResolvedValue({ ...mockItem, condition });

      const request = createMockRequest({
        imageUrl: "https://example.com/image.jpg",
        condition,
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    }
  });
});
