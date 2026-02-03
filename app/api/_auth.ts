import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth";

export async function getUserIdOrResponse(): Promise<{ userId: string } | NextResponse> {
  try {
    const user = await requireAuth();
    return { userId: user.id };
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
