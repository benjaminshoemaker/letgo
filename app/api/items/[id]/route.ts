import { NextResponse } from "next/server";

import { getUserIdOrResponse } from "@/app/api/_auth";
import { itemSelect } from "@/app/api/items/_helpers";
import { prisma } from "@/lib/prisma";
import type { ItemStatus } from "@prisma/client";

export const runtime = "nodejs";

type PatchBody = {
  status?: unknown;
  userOverrideName?: unknown;
};

type PatchUpdates = {
  status?: ItemStatus;
  userOverrideName?: string | null;
};

function isItemStatus(value: unknown): value is ItemStatus {
  return (
    value === "TODO" ||
    value === "SOLD" ||
    value === "DONATED" ||
    value === "RECYCLED" ||
    value === "TRASHED"
  );
}

function invalidStatusResponse() {
  return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
}

function invalidOverrideResponse() {
  return NextResponse.json({ error: "Invalid userOverrideName" }, { status: 400 });
}

function applyStatusUpdate(value: unknown, updates: PatchUpdates): NextResponse | null {
  if (value === undefined) return null;
  if (isItemStatus(value)) {
    updates.status = value;
    return null;
  }
  return invalidStatusResponse();
}

function applyUserOverrideUpdate(
  value: unknown,
  updates: PatchUpdates
): NextResponse | null {
  if (value === undefined) return null;
  if (value === null) {
    updates.userOverrideName = null;
    return null;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return invalidOverrideResponse();
    updates.userOverrideName = trimmed;
    return null;
  }
  return invalidOverrideResponse();
}

function buildUpdates(body: PatchBody | null): { updates: PatchUpdates } | NextResponse {
  const updates: PatchUpdates = {};

  if (body && "status" in body) {
    const statusResponse = applyStatusUpdate(body.status, updates);
    if (statusResponse) return statusResponse;
  }

  if (body && "userOverrideName" in body) {
    const overrideResponse = applyUserOverrideUpdate(body.userOverrideName, updates);
    if (overrideResponse) return overrideResponse;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates provided" }, { status: 400 });
  }

  return { updates };
}

export async function GET(_request: Request, context: { params: { id: string } }) {
  const auth = await getUserIdOrResponse();
  if (!("userId" in auth)) return auth;

  const id = context.params.id;
  const item = await prisma.item.findFirst({
    where: { id, userId: auth.userId },
    select: itemSelect(),
  });

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ item });
}

export async function PATCH(request: Request, context: { params: { id: string } }) {
  const auth = await getUserIdOrResponse();
  if (!("userId" in auth)) return auth;

  const id = context.params.id;
  const body = (await request.json().catch(() => null)) as
    | PatchBody
    | null;

  const updateResult = buildUpdates(body);
  if (!("updates" in updateResult)) return updateResult;

  try {
    const item = await prisma.item.update({
      where: { id, userId: auth.userId },
      data: updateResult.updates,
      select: itemSelect(),
    });
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function DELETE(_request: Request, context: { params: { id: string } }) {
  const auth = await getUserIdOrResponse();
  if (!("userId" in auth)) return auth;

  const id = context.params.id;
  const result = await prisma.item.deleteMany({ where: { id, userId: auth.userId } });
  if (result.count === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
