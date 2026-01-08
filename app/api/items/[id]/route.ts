import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { ItemStatus } from "@prisma/client";

export const runtime = "nodejs";

function isItemStatus(value: unknown): value is ItemStatus {
  return (
    value === "TODO" ||
    value === "SOLD" ||
    value === "DONATED" ||
    value === "RECYCLED" ||
    value === "TRASHED"
  );
}

function itemSelect() {
  return {
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
  } as const;
}

export async function GET(_request: Request, context: { params: { id: string } }) {
  let userId: string;
  try {
    const user = await requireAuth();
    userId = user.id;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = context.params.id;
  const item = await prisma.item.findFirst({
    where: { id, userId },
    select: itemSelect(),
  });

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ item });
}

export async function PATCH(request: Request, context: { params: { id: string } }) {
  let userId: string;
  try {
    const user = await requireAuth();
    userId = user.id;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = context.params.id;
  const body = (await request.json().catch(() => null)) as
    | { status?: unknown; userOverrideName?: unknown }
    | null;

  const updates: { status?: ItemStatus; userOverrideName?: string | null } = {};

  if (body && "status" in body) {
    if (body.status === undefined) {
      // no-op
    } else if (isItemStatus(body.status)) {
      updates.status = body.status;
    } else {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }
  }

  if (body && "userOverrideName" in body) {
    const raw = body.userOverrideName;
    if (raw === undefined) {
      // no-op
    } else if (raw === null) {
      updates.userOverrideName = null;
    } else if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (!trimmed) {
        return NextResponse.json({ error: "Invalid userOverrideName" }, { status: 400 });
      }
      updates.userOverrideName = trimmed;
    } else {
      return NextResponse.json({ error: "Invalid userOverrideName" }, { status: 400 });
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  try {
    const item = await prisma.item.update({
      where: { id, userId },
      data: updates,
      select: itemSelect(),
    });
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, context: { params: { id: string } }) {
  let userId: string;
  try {
    const user = await requireAuth();
    userId = user.id;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = context.params.id;
  const result = await prisma.item.deleteMany({ where: { id, userId } });
  if (result.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}

