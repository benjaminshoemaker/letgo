"use client";

import { useState } from "react";
import Link from "next/link";

import { CameraCapture } from "@/components/scan/camera-capture";
import { ConditionSelector } from "@/components/scan/condition-selector";
import { RecommendationCard } from "@/components/scan/recommendation-card";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api-client";
import { useScanItem } from "@/hooks/use-scan";
import type { ItemCondition } from "@/lib/scan-types";
import { uploadImage } from "@/lib/upload";

export function ScanPageClient() {
  const [file, setFile] = useState<File | null>(null);
  const [condition, setCondition] = useState<ItemCondition | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scanMutation = useScanItem();

  async function handleSubmit() {
    if (!file || !condition) return;

    setIsUploading(true);
    setError(null);
    setUploadedUrl(null);
    scanMutation.reset();

    try {
      const url = await uploadImage(file);
      setUploadedUrl(url);
      await scanMutation.mutateAsync({ imageUrl: url, condition });
    } catch (e) {
      if (e instanceof ApiError && e.code === "LOW_CONFIDENCE") {
        setError("Couldn't identify this item. Try retaking the photo.");
        return;
      }
      const message = e instanceof Error ? e.message : "Something went wrong";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  }

  const isBusy = isUploading || scanMutation.isPending;
  const result = scanMutation.data?.item ?? null;

  return (
    <section className="flex flex-col gap-4">
      <CameraCapture
        file={file}
        onFileChange={(next) => {
          setFile(next);
          setUploadedUrl(null);
          setError(null);
          scanMutation.reset();
          if (!next) setCondition(null);
        }}
      />

      {file ? (
        <>
          <ConditionSelector onChange={setCondition} value={condition} />
          <Button
            disabled={!file || !condition || isBusy}
            onClick={handleSubmit}
            type="button"
          >
            {isUploading ? "Uploading…" : scanMutation.isPending ? "Analyzing…" : "Continue"}
          </Button>
        </>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {result ? (
        <>
          <RecommendationCard
            result={{
              identifiedName: result.identifiedName,
              recommendation: result.recommendation,
              reasoning: result.reasoning,
              estimatedValueLow: result.estimatedValueLow,
              estimatedValueHigh: result.estimatedValueHigh,
              guidance: result.guidance,
              isHazardous: result.isHazardous,
              hazardWarning: result.hazardWarning,
            }}
          />
          <Button asChild type="button">
            <Link href="/items">Add to My Items</Link>
          </Button>
        </>
      ) : uploadedUrl ? (
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
