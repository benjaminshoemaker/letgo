import { checkRateLimit, incrementScanCount } from "@/lib/rate-limit";

// Mock Prisma
const mockFindUnique = jest.fn();
const mockUpdate = jest.fn();

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
}));

describe("rate-limit", () => {
  const userId = "test-user-id";
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  beforeEach(() => {
    jest.clearAllMocks();
    // Default: user has 0 scans today
    mockFindUnique.mockResolvedValue({
      scanCountToday: 0,
      scanCountDate: today,
    });
    mockUpdate.mockResolvedValue({
      scanCountToday: 1,
    });
  });

  describe("checkRateLimit", () => {
    it("allows scan when under limit", async () => {
      mockFindUnique.mockResolvedValue({
        scanCountToday: 5,
        scanCountDate: today,
      });

      const result = await checkRateLimit(userId);

      expect(result.allowed).toBe(true);
      expect(result.scansToday).toBe(5);
      expect(result.scansRemaining).toBe(45); // 50 - 5
    });

    it("blocks scan when at limit", async () => {
      mockFindUnique.mockResolvedValue({
        scanCountToday: 50,
        scanCountDate: today,
      });

      const result = await checkRateLimit(userId);

      expect(result.allowed).toBe(false);
      expect(result.scansToday).toBe(50);
      expect(result.scansRemaining).toBe(0);
    });

    it("resets count on new day", async () => {
      const yesterday = new Date(today);
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);

      // First call for resetIfNewDay check
      mockFindUnique
        .mockResolvedValueOnce({
          scanCountToday: 50,
          scanCountDate: yesterday,
        })
        // Second call after reset
        .mockResolvedValueOnce({
          scanCountToday: 0,
        });

      mockUpdate.mockResolvedValue({
        scanCountToday: 0,
        scanCountDate: today,
      });

      const result = await checkRateLimit(userId);

      // Should have called update to reset
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            scanCountToday: 0,
          }),
        })
      );
      expect(result.allowed).toBe(true);
      expect(result.scansRemaining).toBe(50);
    });

    it("handles first scan (no existing user data)", async () => {
      mockFindUnique.mockResolvedValue(null);

      const result = await checkRateLimit(userId);

      expect(result.allowed).toBe(true);
      expect(result.scansToday).toBe(0);
      expect(result.scansRemaining).toBe(50);
    });
  });

  describe("incrementScanCount", () => {
    it("increments count and returns updated status", async () => {
      mockFindUnique.mockResolvedValue({
        scanCountToday: 5,
        scanCountDate: today,
      });
      mockUpdate.mockResolvedValue({
        scanCountToday: 6,
      });

      const result = await incrementScanCount(userId);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            scanCountToday: { increment: 1 },
          }),
        })
      );
      expect(result.scansToday).toBe(6);
      expect(result.scansRemaining).toBe(44);
    });
  });
});
