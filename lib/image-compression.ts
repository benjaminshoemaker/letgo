import imageCompression from "browser-image-compression";

const MAX_WIDTH_OR_HEIGHT_PX = 1200;
const JPEG_QUALITY = 0.8;

function toJpegFilename(originalName: string): string {
  const name = originalName.trim() || "upload";
  const withoutExt = name.replace(/\.[^/.]+$/, "");
  return `${withoutExt}.jpg`;
}

export async function compressImage(file: File): Promise<File> {
  const compressed = await imageCompression(file, {
    maxWidthOrHeight: MAX_WIDTH_OR_HEIGHT_PX,
    initialQuality: JPEG_QUALITY,
    fileType: "image/jpeg",
    useWebWorker: true,
  });

  const blob =
    compressed instanceof Blob ? compressed : new Blob([compressed], { type: "image/jpeg" });

  return new File([blob], toJpegFilename(file.name), {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

