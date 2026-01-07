import { openai, AI_MODEL } from "@/lib/openai";
import type { ScanResult } from "@/lib/scan-types";

import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/ai/scan-prompt";

type LowConfidenceError = Error & { code: "LOW_CONFIDENCE"; result?: ScanResult };

export async function scanItem(
  imageUrl: string,
  condition: string,
  manualName?: string
): Promise<ScanResult> {
  const response = await openai.responses.create({
    model: AI_MODEL,
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: SYSTEM_PROMPT }],
      },
      {
        role: "user",
        content: [
          { type: "input_image", image_url: imageUrl, detail: "high" },
          { type: "input_text", text: buildUserPrompt(condition, manualName) },
        ],
      },
    ],
    reasoning: { effort: "low" },
    max_output_tokens: 1000,
    temperature: 0.3,
  });

  const content = response.output_text?.trim();
  if (!content) {
    throw new Error("No response from AI");
  }

  const result = JSON.parse(content) as ScanResult;

  if (result.confidence === "LOW" && !manualName) {
    const error = new Error("Low confidence identification") as LowConfidenceError;
    error.code = "LOW_CONFIDENCE";
    error.result = result;
    throw error;
  }

  return result;
}
