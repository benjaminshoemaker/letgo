"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { CameraCapture } from "@/components/scan/camera-capture";
import { ConditionSelector } from "@/components/scan/condition-selector";
import { ManualInput } from "@/components/scan/manual-input";
import { RecommendationCard } from "@/components/scan/recommendation-card";
import { RateLimitBanner } from "@/components/shared/rate-limit-banner";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api-client";
import { useManualScanItem, useScanItem } from "@/hooks/use-scan";
import { useUserStats } from "@/hooks/use-user-stats";
import type { ItemCondition } from "@/lib/scan-types";
import { uploadImage } from "@/lib/upload";

export function ScanPageClient() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [condition, setCondition] = useState<ItemCondition | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isManualFallback, setIsManualFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scanMutation = useScanItem();
  const manualScanMutation = useManualScanItem();
  const statsQuery = useUserStats();

  async function handleSubmit() {
    if (!file || !condition) return;

    setIsUploading(true);
    setError(null);
    setUploadedUrl(null);
    setIsManualFallback(false);
    scanMutation.reset();
    manualScanMutation.reset();

    try {
      const url = await uploadImage(file);
      setUploadedUrl(url);
      await scanMutation.mutateAsync({ imageUrl: url, condition });
    } catch (e) {
      if (e instanceof ApiError && e.code === "LOW_CONFIDENCE") {
        setIsManualFallback(true);
        return;
      }
      if (e instanceof ApiError && e.code === "RATE_LIMITED") {
        setError(e.message);
        return;
      }
      const message =
        e instanceof ApiError && typeof e.details === "string"
          ? e.details
          : e instanceof Error
            ? e.message
            : "Something went wrong";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleManualSubmit(manualName: string) {
    if (!uploadedUrl || !condition) return;
    setError(null);

    try {
      await manualScanMutation.mutateAsync({ imageUrl: uploadedUrl, condition, manualName });
      setIsManualFallback(false);
    } catch (e) {
      if (e instanceof ApiError && e.code === "RATE_LIMITED") {
        setError(e.message);
        return;
      }
      const message =
        e instanceof ApiError && typeof e.details === "string"
          ? e.details
          : e instanceof Error
            ? e.message
            : "Something went wrong";
      setError(message);
    }
  }

  function handleRetake() {
    setFile(null);
    setCondition(null);
    setUploadedUrl(null);
    setIsManualFallback(false);
    setError(null);
    scanMutation.reset();
    manualScanMutation.reset();
  }

  const isBusy = isUploading || scanMutation.isPending || manualScanMutation.isPending;
  const result = scanMutation.data?.item ?? manualScanMutation.data?.item ?? null;
  const scansRemaining = statsQuery.data?.scansRemaining ?? null;
  const limitReached = scansRemaining !== null && scansRemaining <= 0;

  return (
    <section className="flex flex-col gap-4">
      {statsQuery.data ? (
        <RateLimitBanner
          scanLimit={statsQuery.data.scanLimit}
          scansRemaining={statsQuery.data.scansRemaining}
          resetsAt={statsQuery.data.resetsAt}
        />
      ) : null}

      <CameraCapture
        disabled={limitReached}
        file={file}
        onFileChange={(next) => {
          setFile(next);
          setUploadedUrl(null);
          setIsManualFallback(false);
          setError(null);
          scanMutation.reset();
          manualScanMutation.reset();
          if (!next) setCondition(null);
        }}
      />

      {file ? (
        <>
          <ConditionSelector onChange={setCondition} value={condition} />
          {isManualFallback ? (
            <ManualInput
              isSubmitting={manualScanMutation.isPending || limitReached}
              onCancel={handleRetake}
              onSubmit={handleManualSubmit}
            />
          ) : (
            <Button
              disabled={!file || !condition || isBusy || limitReached}
              onClick={handleSubmit}
              type="button"
            >
              {isUploading ? "Uploading…" : scanMutation.isPending ? "Analyzing…" : "Continue"}
            </Button>
          )}
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
            footer={
              <>
                <Button
                  onClick={() => router.push("/items?added=1")}
                  type="button"
                  variant="secondary"
                >
                  Add to My Items
                </Button>
                <Button onClick={handleRetake} type="button">
                  Scan another item
                </Button>
              </>
            }
          />
        </>
      ) : uploadedUrl && !isManualFallback ? (
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
