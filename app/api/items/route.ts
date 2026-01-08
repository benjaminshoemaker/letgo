import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ItemStatus } from "@prisma/client";

export const runtime = "nodejs";

const DONE_STATUSES: ItemStatus[] = ["SOLD", "DONATED", "RECYCLED", "TRASHED"];

function parseLimit(value: string | null): number {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed)) return 20;
  return Math.min(Math.max(parsed, 1), 50);
}

function parseStatusFilter(value: string | null):
  | { ok: true; where?: { status: ItemStatus | { in: ItemStatus[] } } }
  | { ok: false; error: string } {
  if (!value || value === "all") return { ok: true };
  if (value === "DONE") return { ok: true, where: { status: { in: DONE_STATUSES } } };

  if (
    value === "TODO" ||
    value === "SOLD" ||
    value === "DONATED" ||
    value === "RECYCLED" ||
    value === "TRASHED"
  ) {
    return { ok: true, where: { status: value } };
  }

  return { ok: false, error: "Invalid status filter" };
}

export async function GET(request: Request) {
  let userId: string;
  try {
    const user = await requireAuth();
    userId = user.id;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const status = url.searchParams.get("status");
  const limit = parseLimit(url.searchParams.get("limit"));
  const cursor = url.searchParams.get("cursor");

  const statusFilter = parseStatusFilter(status);
  if (!statusFilter.ok) {
    return NextResponse.json({ error: statusFilter.error }, { status: 400 });
  }

  const whereBase = {
    userId,
    ...(statusFilter.where ?? null),
  } as const;

  let cursorClause: { OR: [{ createdAt: { lt: Date } }, { createdAt: Date; id: { lt: string } }] } | null =
    null;
  if (cursor) {
    const cursorItem = await prisma.item.findFirst({
      where: { id: cursor, userId },
      select: { id: true, createdAt: true },
    });

    if (!cursorItem) {
      return NextResponse.json({ error: "Invalid cursor" }, { status: 400 });
    }

    cursorClause = {
      OR: [
        { createdAt: { lt: cursorItem.createdAt } },
        { createdAt: cursorItem.createdAt, id: { lt: cursorItem.id } },
      ],
    };
  }

  const [totalCount, itemsPage] = await Promise.all([
    prisma.item.count({ where: whereBase }),
    prisma.item.findMany({
      where: cursorClause ? { ...whereBase, ...cursorClause } : whereBase,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limit + 1,
      select: {
        id: true,
        photoUrl: true,
        identifiedName: true,
        userOverrideName: true,
        condition: true,
        recommendation: true,
        reasoning: true,
        estimatedValueLow: true,
        estimatedValueHigh: true,
        guidance: true,
        isHazardous: true,
        hazardWarning: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  const hasMore = itemsPage.length > limit;
  const items = hasMore ? itemsPage.slice(0, limit) : itemsPage;
  const nextCursor = hasMore ? items[items.length - 1]?.id ?? null : null;

  return NextResponse.json({ items, nextCursor, hasMore, totalCount });
}

