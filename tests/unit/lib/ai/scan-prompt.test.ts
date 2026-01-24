import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/ai/scan-prompt";

describe("scan-prompt", () => {
  describe("buildUserPrompt", () => {
    it("builds prompt with condition only", () => {
      const result = buildUserPrompt("EXCELLENT");

      expect(result).toBe("Item condition: EXCELLENT");
    });

    it("builds prompt with condition and manualName", () => {
      const result = buildUserPrompt("GOOD", "iPhone 12");

      expect(result).toContain("Item condition: GOOD");
      expect(result).toContain("User identified this item as: iPhone 12");
    });

    it("handles all condition values", () => {
      const conditions = ["EXCELLENT", "GOOD", "FAIR", "POOR"];

      for (const condition of conditions) {
        const result = buildUserPrompt(condition);
        expect(result).toContain(`Item condition: ${condition}`);
      }
    });
  });

  describe("SYSTEM_PROMPT", () => {
    it("contains required elements", () => {
      // Check for key response fields
      expect(SYSTEM_PROMPT).toContain("identifiedName");
      expect(SYSTEM_PROMPT).toContain("confidence");
      expect(SYSTEM_PROMPT).toContain("recommendation");
      expect(SYSTEM_PROMPT).toContain("reasoning");
      expect(SYSTEM_PROMPT).toContain("estimatedValueLow");
      expect(SYSTEM_PROMPT).toContain("estimatedValueHigh");
      expect(SYSTEM_PROMPT).toContain("guidance");
      expect(SYSTEM_PROMPT).toContain("isHazardous");
      expect(SYSTEM_PROMPT).toContain("hazardWarning");
    });

    it("includes recommendation categories", () => {
      expect(SYSTEM_PROMPT).toContain("SELL");
      expect(SYSTEM_PROMPT).toContain("DONATE");
      expect(SYSTEM_PROMPT).toContain("RECYCLE");
      expect(SYSTEM_PROMPT).toContain("DISPOSE");
    });

    it("includes confidence levels", () => {
      expect(SYSTEM_PROMPT).toContain("HIGH");
      expect(SYSTEM_PROMPT).toContain("MEDIUM");
      expect(SYSTEM_PROMPT).toContain("LOW");
    });

    it("includes hazard detection instructions", () => {
      expect(SYSTEM_PROMPT).toContain("Batteries");
      expect(SYSTEM_PROMPT).toContain("Electronics");
      expect(SYSTEM_PROMPT).toContain("isHazardous");
    });

    it("requires JSON response format", () => {
      expect(SYSTEM_PROMPT).toContain("JSON");
    });
  });
});
