export type ItemCondition = "EXCELLENT" | "GOOD" | "FAIR" | "POOR";

export type ScanConfidence = "HIGH" | "MEDIUM" | "LOW";

export type Recommendation = "SELL" | "DONATE" | "RECYCLE" | "DISPOSE";

export interface ScanResult {
  identifiedName: string;
  confidence: ScanConfidence;
  recommendation: Recommendation;
  reasoning: string;
  estimatedValueLow: number | null;
  estimatedValueHigh: number | null;
  guidance: string;
  isHazardous: boolean;
  hazardWarning: string | null;
}

