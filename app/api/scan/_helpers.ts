import { NextResponse } from "next/server";

import { getUserIdOrResponse } from "@/app/api/_auth";
import { scanItem } from "@/lib/ai/scan-service";
import { withRetry } from "@/lib/ai/retry";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, incrementScanCount } from "@/lib/rate-limit";
import type { ItemCondition, ScanResult } from "@/lib/scan-types";

type ScanInput = {
  imageUrl: string;
  condition: ItemCondition;
  manualName: string | null;
};

type ScanRequestOptions = {
  allowLowConfidence?: boolean;
  requireManualName: boolean;
  logLabel: string;
  useManualName?: boolean;
};

type ScanParseResult = { input: ScanInput } | { response: NextResponse };

function isItemCondition(value: unknown): value is ItemCondition {
  return value === "EXCELLENT" || value === "GOOD" || value === "FAIR" || value === "POOR";
}

function isLowConfidenceError(error: unknown): error is { code?: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "LOW_CONFIDENCE"
  );
}

function buildRateLimitResponse(resetAt: Date): NextResponse {
  return NextResponse.json(
    {
      error: "Daily scan limit reached",
      code: "RATE_LIMITED",
      resetAt: resetAt.toISOString(),
    },
    { status: 429 }
  );
}

function buildScanFailureResponse(
  error: unknown,
  options: Pick<ScanRequestOptions, "allowLowConfidence" | "logLabel">
): NextResponse {
  console.error(options.logLabel, error);

  if (options.allowLowConfidence && isLowConfidenceError(error)) {
    return NextResponse.json(
      { error: "Low confidence identification", code: "LOW_CONFIDENCE" },
      { status: 422 }
    );
  }

  const message = error instanceof Error ? error.message : "Scan failed";
  return NextResponse.json(
    {
      error: "Scan failed",
      ...(process.env.NODE_ENV !== "production" ? { details: message } : null),
    },
    { status: 500 }
  );
}

async function parseScanRequest(
  request: Request,
  options: Pick<ScanRequestOptions, "requireManualName" | "useManualName">
): Promise<ScanParseResult> {
  const body = (await request.json().catch(() => null)) as
    | { imageUrl?: unknown; condition?: unknown; manualName?: unknown }
    | null;

  const imageUrl = typeof body?.imageUrl === "string" ? body.imageUrl : null;
  const condition = body?.condition;
  const manualNameRaw = typeof body?.manualName === "string" ? body.manualName.trim() : "";
  const manualName = options.useManualName ? manualNameRaw : "";
  const hasValidName = !options.requireManualName || manualName.length > 0;

  if (!imageUrl || !isItemCondition(condition) || !hasValidName) {
    return {
      response: NextResponse.json(
        {
          error: options.requireManualName
            ? "Invalid imageUrl, condition, or manualName"
            : "Invalid imageUrl or condition",
        },
        { status: 400 }
      ),
    };
  }

  return {
    input: {
      imageUrl,
      condition,
      manualName: manualName.length > 0 ? manualName : null,
    },
  };
}

async function getRateLimitResponse(userId: string): Promise<NextResponse | null> {
  const limitStatus = await checkRateLimit(userId);
  if (!limitStatus.allowed) {
    return buildRateLimitResponse(limitStatus.resetAt);
  }
  return null;
}

async function createItemFromScan(
  userId: string,
  input: ScanInput,
  result: ScanResult
) {
  return prisma.item.create({
    data: {
      userId,
      photoUrl: input.imageUrl,
      identifiedName: result.identifiedName,
      userOverrideName: input.manualName,
      condition: input.condition,
      recommendation: result.recommendation,
      reasoning: result.reasoning,
      estimatedValueLow: result.estimatedValueLow ?? null,
      estimatedValueHigh: result.estimatedValueHigh ?? null,
      guidance: result.guidance,
      isHazardous: result.isHazardous,
      hazardWarning: result.hazardWarning,
    },
  });
}

async function processScan(userId: string, input: ScanInput): Promise<NextResponse> {
  const result = await withRetry(() =>
    scanItem(input.imageUrl, input.condition, input.manualName ?? undefined)
  );
  const item = await createItemFromScan(userId, input, result);
  const updatedLimit = await incrementScanCount(userId);

  return NextResponse.json({ item, rateLimitRemaining: updatedLimit.scansRemaining });
}

export async function handleScanRequest(
  request: Request,
  options: ScanRequestOptions
): Promise<NextResponse> {
  const auth = await getUserIdOrResponse();
  if (!("userId" in auth)) return auth;

  const parsed = await parseScanRequest(request, options);
  if ("response" in parsed) return parsed.response;

  const rateLimitResponse = await getRateLimitResponse(auth.userId);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    return await processScan(auth.userId, parsed.input);
  } catch (error: unknown) {
    return buildScanFailureResponse(error, options);
  }
}
