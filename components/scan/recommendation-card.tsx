"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Recommendation } from "@/lib/scan-types";
import { cn } from "@/lib/utils";

function formatUsdFromCents(cents: number): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(dollars);
}

function badgeClass(recommendation: Recommendation): string {
  switch (recommendation) {
    case "SELL":
      return "bg-emerald-600 text-white";
    case "DONATE":
      return "bg-sky-600 text-white";
    case "RECYCLE":
      return "bg-amber-600 text-white";
    case "DISPOSE":
      return "bg-rose-600 text-white";
  }
}

export type RecommendationCardData = {
  identifiedName: string;
  recommendation: Recommendation;
  reasoning: string;
  estimatedValueLow: number | null;
  estimatedValueHigh: number | null;
  guidance: string;
  isHazardous: boolean;
  hazardWarning: string | null;
};

export function RecommendationCard({ result }: { result: RecommendationCardData }) {
  const showValue =
    result.recommendation === "SELL" &&
    result.estimatedValueLow != null &&
    result.estimatedValueHigh != null;

  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg">{result.identifiedName}</CardTitle>
          <span
            className={cn(
              "inline-flex shrink-0 items-center rounded-full px-2 py-1 text-xs font-semibold",
              badgeClass(result.recommendation)
            )}
          >
            {result.recommendation}
          </span>
        </div>
        {showValue ? (
          <div className="text-sm text-foreground/80">
            Est. value: {formatUsdFromCents(result.estimatedValueLow!)}–$
            {formatUsdFromCents(result.estimatedValueHigh!).replace("$", "")}
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {result.isHazardous ? (
          <div className="rounded-md border border-rose-300 bg-rose-50 p-3 text-sm text-rose-900">
            <div className="font-medium">Hazard warning</div>
            <div className="mt-1">{result.hazardWarning ?? "Handle with care."}</div>
          </div>
        ) : null}

        <div className="text-sm text-foreground/90">{result.reasoning}</div>

        <div className="prose prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.guidance}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
