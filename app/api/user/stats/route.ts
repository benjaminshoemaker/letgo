import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function GET() {
  let userId: string;
  try {
    const user = await requireAuth();
    userId = user.id;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const status = await checkRateLimit(userId);

  return NextResponse.json({
    scansToday: status.scansToday,
    scanLimit: status.scanLimit,
    scansRemaining: status.scansRemaining,
    resetsAt: status.resetAt.toISOString(),
  });
}

