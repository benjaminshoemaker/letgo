"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { CameraCapture } from "@/components/scan/camera-capture";
import { ConditionSelector } from "@/components/scan/condition-selector";
import { ManualInput } from "@/components/scan/manual-input";
import {
  RecommendationCard,
  type RecommendationCardData,
} from "@/components/scan/recommendation-card";
import { RateLimitBanner } from "@/components/shared/rate-limit-banner";
import { ScanResultSkeleton } from "@/components/shared/skeleton";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ApiError } from "@/lib/api-client";
import { useManualScanItem, useScanItem } from "@/hooks/use-scan";
import { toast } from "sonner";
import { useUserStats, type UserStats } from "@/hooks/use-user-stats";
import type { ItemCondition } from "@/lib/scan-types";
import { uploadImage } from "@/lib/upload";

function isLowConfidenceError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.code === "LOW_CONFIDENCE";
}

function isRateLimitedError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.code === "RATE_LIMITED";
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError && typeof error.details === "string") {
    return error.details;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong";
}

function toRecommendationData(result: RecommendationCardData): RecommendationCardData {
  return {
    identifiedName: result.identifiedName,
    recommendation: result.recommendation,
    reasoning: result.reasoning,
    estimatedValueLow: result.estimatedValueLow,
    estimatedValueHigh: result.estimatedValueHigh,
    guidance: result.guidance,
    isHazardous: result.isHazardous,
    hazardWarning: result.hazardWarning,
  };
}

function RateLimitSection({ data }: { data: UserStats | undefined }) {
  if (!data) return null;
  return (
    <RateLimitBanner
      scanLimit={data.scanLimit}
      scansRemaining={data.scansRemaining}
      resetsAt={data.resetsAt}
    />
  );
}

function ScanAction({
  hasResult,
  isManualFallback,
  isBusy,
  isUploading,
  isSubmitDisabled,
  limitReached,
  onManualSubmit,
  onRetake,
  onSubmit,
}: {
  hasResult: boolean;
  isManualFallback: boolean;
  isBusy: boolean;
  isUploading: boolean;
  isSubmitDisabled: boolean;
  limitReached: boolean;
  onManualSubmit: (manualName: string) => void;
  onRetake: () => void;
  onSubmit: () => void;
}) {
  if (isManualFallback) {
    return (
      <ManualInput
        isSubmitting={isBusy || limitReached}
        onCancel={onRetake}
        onSubmit={onManualSubmit}
      />
    );
  }

  if (hasResult) return null;

  return (
    <Button disabled={isSubmitDisabled || limitReached} onClick={onSubmit} type="button">
      {isBusy ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {isUploading ? "Uploading…" : "Analyzing…"}
        </>
      ) : (
        "Continue"
      )}
    </Button>
  );
}

function ScanControls({
  file,
  condition,
  hasResult,
  isManualFallback,
  isBusy,
  isUploading,
  limitReached,
  onConditionChange,
  onManualSubmit,
  onRetake,
  onSubmit,
}: {
  file: File | null;
  condition: ItemCondition | null;
  hasResult: boolean;
  isManualFallback: boolean;
  isBusy: boolean;
  isUploading: boolean;
  limitReached: boolean;
  onConditionChange: (next: ItemCondition | null) => void;
  onManualSubmit: (manualName: string) => void;
  onRetake: () => void;
  onSubmit: () => void;
}) {
  if (!file) return null;

  const isSubmitDisabled = !condition || isBusy || limitReached;

  return (
    <>
      <ConditionSelector onChange={onConditionChange} value={condition} />
      <ScanAction
        hasResult={hasResult}
        isBusy={isBusy}
        isManualFallback={isManualFallback}
        isUploading={isUploading}
        isSubmitDisabled={isSubmitDisabled}
        limitReached={limitReached}
        onManualSubmit={onManualSubmit}
        onRetake={onRetake}
        onSubmit={onSubmit}
      />
    </>
  );
}

function ScanResult({
  isPending,
  isManualFallback,
  onRetake,
  onViewItems,
  result,
  uploadedUrl,
}: {
  isPending: boolean;
  isManualFallback: boolean;
  onRetake: () => void;
  onViewItems: () => void;
  result: RecommendationCardData | null;
  uploadedUrl: string | null;
}) {
  if (isPending) {
    return <ScanResultSkeleton />;
  }

  if (result) {
    return (
      <RecommendationCard
        result={toRecommendationData(result)}
        footer={
          <>
            <Button onClick={onViewItems} type="button" variant="secondary">
              View in My Items
            </Button>
            <Button onClick={onRetake} type="button">
              Scan another item
            </Button>
          </>
        }
      />
    );
  }

  if (uploadedUrl && !isManualFallback) {
    return (
      <div className="rounded-md border bg-muted/30 p-3">
        <div className="text-sm font-medium">Uploaded image URL (temporary)</div>
        <div className="mt-1 break-all font-mono text-xs text-foreground/80">
          {uploadedUrl}
        </div>
      </div>
    );
  }

  return null;
}

export function ScanPageClient() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [condition, setCondition] = useState<ItemCondition | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isManualFallback, setIsManualFallback] = useState(false);
  const scanMutation = useScanItem();
  const manualScanMutation = useManualScanItem();
  const statsQuery = useUserStats();

  function resetScanState() {
    setUploadedUrl(null);
    setIsManualFallback(false);
    scanMutation.reset();
    manualScanMutation.reset();
  }

  async function handleSubmit() {
    if (!file || !condition) return;

    setIsUploading(true);
    resetScanState();

    try {
      const url = await uploadImage(file);
      setUploadedUrl(url);
      await scanMutation.mutateAsync({ imageUrl: url, condition });
    } catch (error: unknown) {
      if (isLowConfidenceError(error)) {
        setIsManualFallback(true);
        return;
      }
      if (isRateLimitedError(error)) {
        toast.error(error.message);
        return;
      }
      toast.error(getErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  }

  async function handleManualSubmit(manualName: string) {
    if (!uploadedUrl || !condition) return;

    try {
      await manualScanMutation.mutateAsync({ imageUrl: uploadedUrl, condition, manualName });
      setIsManualFallback(false);
    } catch (error: unknown) {
      if (isRateLimitedError(error)) {
        toast.error(error.message);
        return;
      }
      toast.error(getErrorMessage(error));
    }
  }

  function handleRetake() {
    setFile(null);
    setCondition(null);
    resetScanState();
  }

  const isBusy = isUploading || scanMutation.isPending || manualScanMutation.isPending;
  const result =
    (scanMutation.data?.item as RecommendationCardData | undefined) ??
    (manualScanMutation.data?.item as RecommendationCardData | undefined) ??
    null;
  const scansRemaining = statsQuery.data?.scansRemaining ?? null;
  const limitReached = scansRemaining !== null && scansRemaining <= 0;
  const isPending = scanMutation.isPending || manualScanMutation.isPending;
  const handleViewItems = () => router.push("/items?added=1");

  return (
    <section className="flex flex-col gap-4">
      <RateLimitSection data={statsQuery.data} />

      <CameraCapture
        disabled={limitReached}
        file={file}
        onFileChange={(next) => {
          setFile(next);
          resetScanState();
          if (!next) setCondition(null);
        }}
      />

      <ScanControls
        condition={condition}
        file={file}
        hasResult={Boolean(result)}
        isBusy={isBusy}
        isManualFallback={isManualFallback}
        isUploading={isUploading}
        limitReached={limitReached}
        onConditionChange={setCondition}
        onManualSubmit={handleManualSubmit}
        onRetake={handleRetake}
        onSubmit={handleSubmit}
      />

      <ScanResult
        isManualFallback={isManualFallback}
        isPending={isPending}
        onRetake={handleRetake}
        onViewItems={handleViewItems}
        result={result}
        uploadedUrl={uploadedUrl}
      />
    </section>
  );
}
