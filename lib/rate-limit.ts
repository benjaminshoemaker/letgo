import { prisma } from "@/lib/prisma";

export type RateLimitStatus = {
  allowed: boolean;
  scanLimit: number;
  scansToday: number;
  scansRemaining: number;
  resetAt: Date;
};

function getDailyScanLimit(): number {
  const raw = process.env.DAILY_SCAN_LIMIT ?? "50";
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 50;
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addUtcDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

async function resetIfNewDay(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { scanCountDate: true },
  });
  if (!user) return;

  const today = startOfUtcDay(new Date());
  const stored = startOfUtcDay(new Date(user.scanCountDate));
  if (stored.getTime() === today.getTime()) return;

  await prisma.user.update({
    where: { id: userId },
    data: { scanCountToday: 0, scanCountDate: today },
  });
}

export async function checkRateLimit(userId: string): Promise<RateLimitStatus> {
  await resetIfNewDay(userId);

  const scanLimit = getDailyScanLimit();
  const today = startOfUtcDay(new Date());
  const resetAt = addUtcDays(today, 1);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { scanCountToday: true },
  });

  const scansToday = user?.scanCountToday ?? 0;
  const scansRemaining = Math.max(0, scanLimit - scansToday);

  return {
    allowed: scansRemaining > 0,
    scanLimit,
    scansToday,
    scansRemaining,
    resetAt,
  };
}

export async function incrementScanCount(userId: string): Promise<RateLimitStatus> {
  await resetIfNewDay(userId);

  const scanLimit = getDailyScanLimit();
  const today = startOfUtcDay(new Date());
  const resetAt = addUtcDays(today, 1);

  const user = await prisma.user.update({
    where: { id: userId },
    data: { scanCountToday: { increment: 1 } },
    select: { scanCountToday: true },
  });

  const scansToday = user.scanCountToday;
  const scansRemaining = Math.max(0, scanLimit - scansToday);

  return {
    allowed: scansRemaining > 0,
    scanLimit,
    scansToday,
    scansRemaining,
    resetAt,
  };
}

