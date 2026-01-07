"use client";

import { useState } from "react";

import { CameraCapture } from "@/components/scan/camera-capture";
import {
  ConditionSelector,
  type ItemCondition,
} from "@/components/scan/condition-selector";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/lib/upload";

export function ScanPageClient() {
  const [file, setFile] = useState<File | null>(null);
  const [condition, setCondition] = useState<ItemCondition | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!file || !condition) return;

    setIsUploading(true);
    setError(null);
    setUploadedUrl(null);

    try {
      const url = await uploadImage(file);
      setUploadedUrl(url);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Upload failed";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <CameraCapture
        file={file}
        onFileChange={(next) => {
          setFile(next);
          setUploadedUrl(null);
          setError(null);
          if (!next) setCondition(null);
        }}
      />

      {file ? (
        <>
          <ConditionSelector onChange={setCondition} value={condition} />
          <Button
            disabled={!file || !condition || isUploading}
            onClick={handleSubmit}
            type="button"
          >
            {isUploading ? "Uploading…" : "Continue"}
          </Button>
        </>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {uploadedUrl ? (
        <div className="rounded-md border bg-muted/30 p-3">
          <div className="text-sm font-medium">Uploaded image URL (temporary)</div>
          <div className="mt-1 break-all font-mono text-xs text-foreground/80">
            {uploadedUrl}
          </div>
        </div>
      ) : null}
    </section>
  );
}

