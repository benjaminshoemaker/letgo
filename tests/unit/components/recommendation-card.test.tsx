import { render, screen } from "@testing-library/react";
import { RecommendationCard } from "@/components/scan/recommendation-card";
import type { RecommendationCardData } from "@/components/scan/recommendation-card";

describe("RecommendationCard", () => {
  const baseResult: RecommendationCardData = {
    identifiedName: "iPhone 12",
    recommendation: "SELL",
    reasoning: "This item is in good condition and has resale value.",
    estimatedValueLow: 20000,
    estimatedValueHigh: 30000,
    guidance: "List on eBay or Facebook Marketplace.",
    isHazardous: false,
    hazardWarning: null,
  };

  it("renders SELL recommendation correctly", () => {
    render(<RecommendationCard result={baseResult} />);

    expect(screen.getByText("iPhone 12")).toBeInTheDocument();
    expect(screen.getByText("SELL")).toBeInTheDocument();
    expect(screen.getByText(/\$200/)).toBeInTheDocument();
    expect(screen.getByText(/300/)).toBeInTheDocument();
  });

  it("renders DONATE recommendation correctly", () => {
    const donateResult: RecommendationCardData = {
      ...baseResult,
      recommendation: "DONATE",
      estimatedValueLow: null,
      estimatedValueHigh: null,
    };

    render(<RecommendationCard result={donateResult} />);

    expect(screen.getByText("DONATE")).toBeInTheDocument();
    // Should not show value estimate for DONATE
    expect(screen.queryByText(/Est\. value/)).not.toBeInTheDocument();
  });

  it("renders RECYCLE recommendation correctly", () => {
    const recycleResult: RecommendationCardData = {
      ...baseResult,
      recommendation: "RECYCLE",
      estimatedValueLow: null,
      estimatedValueHigh: null,
    };

    render(<RecommendationCard result={recycleResult} />);

    expect(screen.getByText("RECYCLE")).toBeInTheDocument();
  });

  it("renders DISPOSE recommendation correctly", () => {
    const disposeResult: RecommendationCardData = {
      ...baseResult,
      recommendation: "DISPOSE",
      estimatedValueLow: null,
      estimatedValueHigh: null,
    };

    render(<RecommendationCard result={disposeResult} />);

    expect(screen.getByText("DISPOSE")).toBeInTheDocument();
  });

  it("shows hazard warning when appropriate", () => {
    const hazardousResult: RecommendationCardData = {
      ...baseResult,
      isHazardous: true,
      hazardWarning: "Contains lithium battery. Dispose at designated facility.",
    };

    render(<RecommendationCard result={hazardousResult} />);

    expect(screen.getByText("Hazard warning")).toBeInTheDocument();
    expect(
      screen.getByText("Contains lithium battery. Dispose at designated facility.")
    ).toBeInTheDocument();
  });

  it("does not show hazard warning when not hazardous", () => {
    render(<RecommendationCard result={baseResult} />);

    expect(screen.queryByText("Hazard warning")).not.toBeInTheDocument();
  });

  it("renders reasoning text", () => {
    render(<RecommendationCard result={baseResult} />);

    expect(
      screen.getByText("This item is in good condition and has resale value.")
    ).toBeInTheDocument();
  });

  it("renders guidance markdown", () => {
    render(<RecommendationCard result={baseResult} />);

    expect(
      screen.getByText("List on eBay or Facebook Marketplace.")
    ).toBeInTheDocument();
  });

  it("renders footer when provided", () => {
    render(
      <RecommendationCard
        result={baseResult}
        footer={<button>Add to Items</button>}
      />
    );

    expect(screen.getByText("Add to Items")).toBeInTheDocument();
  });
});
