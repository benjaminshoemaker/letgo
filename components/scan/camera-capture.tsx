"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import Image from "next/image";

import { Button } from "@/components/ui/button";

const ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
type AcceptedMimeType = (typeof ACCEPTED_MIME_TYPES)[number];

function isAcceptedImageType(file: File): file is File & { type: AcceptedMimeType } {
  return (ACCEPTED_MIME_TYPES as readonly string[]).includes(file.type);
}

export function CameraCapture({
  file,
  onFileChange,
}: {
  file: File | null;
  onFileChange: (file: File | null) => void;
}) {
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFiles(files: FileList | null) {
    const next = files?.[0];
    if (!next) return;

    if (!isAcceptedImageType(next)) {
      setError("Please choose a JPEG, PNG, or WebP image.");
      return;
    }

    setError(null);
    onFileChange(next);
  }

  return (
    <section className="flex flex-col gap-4">
      {!file ? (
        <>
          <div className="flex flex-col gap-2">
            <Button
              className="h-12 text-base"
              onClick={() => cameraInputRef.current?.click()}
              type="button"
            >
              Scan Item
            </Button>
            <Button
              className="h-12 text-base"
              onClick={() => fileInputRef.current?.click()}
              type="button"
              variant="secondary"
            >
              Upload Photo
            </Button>
          </div>

          <input
            accept={ACCEPTED_MIME_TYPES.join(",")}
            capture="environment"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            ref={cameraInputRef}
            type="file"
          />
          <input
            accept={ACCEPTED_MIME_TYPES.join(",")}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            ref={fileInputRef}
            type="file"
          />

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </>
      ) : (
        <>
          <div className="overflow-hidden rounded-md border">
            <Image
              alt="Selected item"
              className="h-auto w-full"
              height={900}
              src={previewUrl ?? ""}
              unoptimized
              width={1200}
            />
          </div>
          <Button onClick={() => onFileChange(null)} type="button" variant="secondary">
            Retake
          </Button>
        </>
      )}
    </section>
  );
}
