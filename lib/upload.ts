import { compressImage } from "@/lib/image-compression";

type UploadApiResponse = {
  uploadUrl: string;
  imageUrl: string;
  expiresAt: string;
};

export async function uploadImage(file: File): Promise<string> {
  const compressed = await compressImage(file);

  const params = new URLSearchParams({
    filename: compressed.name,
    contentType: compressed.type,
  });

  const presignRes = await fetch(`/api/upload?${params.toString()}`, {
    method: "GET",
    credentials: "include",
  });

  if (!presignRes.ok) {
    const body = await presignRes.json().catch(() => null);
    throw new Error(body?.error ?? "Failed to create upload URL");
  }

  const { uploadUrl, imageUrl } = (await presignRes.json()) as UploadApiResponse;

  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": compressed.type,
    },
    body: compressed,
  });

  if (!uploadRes.ok) {
    throw new Error("Failed to upload image");
  }

  return imageUrl;
}

