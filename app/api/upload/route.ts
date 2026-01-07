import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

const PRESIGNED_URL_TTL_SECONDS = 60 * 5;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

let s3Client: S3Client | null = null;
function getS3Client(): S3Client {
  if (s3Client) return s3Client;

  s3Client = new S3Client({
    region: "auto",
    endpoint: requireEnv("R2_ENDPOINT"),
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
    forcePathStyle: true,
  });

  return s3Client;
}

function joinUrl(base: string, path: string): string {
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

function sanitizeFilename(filename: string): string {
  const trimmed = filename.trim();
  const basename = trimmed.split("/").pop() ?? trimmed;
  const safe = basename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return safe.length > 64 ? safe.slice(-64) : safe;
}

export async function GET(request: Request) {
  let userId: string;
  try {
    const user = await requireAuth();
    userId = user.id;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename");
  const contentType = searchParams.get("contentType");

  if (!filename || !contentType) {
    return NextResponse.json(
      { error: "Missing filename or contentType" },
      { status: 400 }
    );
  }

  const safeFilename = sanitizeFilename(filename);
  const key = `users/${userId}/items/${Date.now()}-${crypto.randomUUID()}-${safeFilename.replace(
    /\.[^/.]+$/,
    ""
  )}.jpg`;

  const command = new PutObjectCommand({
    Bucket: requireEnv("R2_BUCKET_NAME"),
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(getS3Client(), command, {
    expiresIn: PRESIGNED_URL_TTL_SECONDS,
  });

  const imageUrl = joinUrl(requireEnv("R2_PUBLIC_URL"), key);

  return NextResponse.json({
    uploadUrl,
    imageUrl,
    expiresAt: new Date(
      Date.now() + PRESIGNED_URL_TTL_SECONDS * 1000
    ).toISOString(),
  });
}
