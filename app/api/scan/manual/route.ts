import { NextResponse } from "next/server";

import { scanItem } from "@/lib/ai/scan-service";
import { withRetry } from "@/lib/ai/retry";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, incrementScanCount } from "@/lib/rate-limit";
import type { ItemCondition } from "@/lib/scan-types";

export const runtime = "nodejs";

function isItemCondition(value: unknown): value is ItemCondition {
  return value === "EXCELLENT" || value === "GOOD" || value === "FAIR" || value === "POOR";
}

export async function POST(request: Request) {
  let userId: string;
  try {
    const user = await requireAuth();
    userId = user.id;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { imageUrl?: unknown; condition?: unknown; manualName?: unknown }
    | null;

  const imageUrl = typeof body?.imageUrl === "string" ? body.imageUrl : null;
  const condition = body?.condition;
  const manualName = typeof body?.manualName === "string" ? body.manualName.trim() : "";

  if (!imageUrl || !isItemCondition(condition) || !manualName) {
    return NextResponse.json(
      { error: "Invalid imageUrl, condition, or manualName" },
      { status: 400 }
    );
  }

  try {
    const limitStatus = await checkRateLimit(userId);
    if (!limitStatus.allowed) {
      return NextResponse.json(
        {
          error: "Daily scan limit reached",
          code: "RATE_LIMITED",
          resetAt: limitStatus.resetAt.toISOString(),
        },
        { status: 429 }
      );
    }

    const result = await withRetry(() => scanItem(imageUrl, condition, manualName));

    const item = await prisma.item.create({
      data: {
        userId,
        photoUrl: imageUrl,
        identifiedName: result.identifiedName,
        userOverrideName: manualName,
        condition,
        recommendation: result.recommendation,
        reasoning: result.reasoning,
        estimatedValueLow: result.estimatedValueLow ?? null,
        estimatedValueHigh: result.estimatedValueHigh ?? null,
        guidance: result.guidance,
        isHazardous: result.isHazardous,
        hazardWarning: result.hazardWarning,
      },
    });

    const updatedLimit = await incrementScanCount(userId);

    return NextResponse.json({ item, rateLimitRemaining: updatedLimit.scansRemaining });
  } catch (error: unknown) {
    console.error("Manual scan error", error);

    const message = error instanceof Error ? error.message : "Scan failed";
    return NextResponse.json(
      {
        error: "Scan failed",
        ...(process.env.NODE_ENV !== "production" ? { details: message } : null),
      },
      { status: 500 }
    );
  }
}
