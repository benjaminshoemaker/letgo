import { openai, AI_MODEL } from "@/lib/openai";
import type { ScanResult } from "@/lib/scan-types";

import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/ai/scan-prompt";

type LowConfidenceError = Error & { code: "LOW_CONFIDENCE"; result?: ScanResult };

export async function scanItem(
  imageUrl: string,
  condition: string,
  manualName?: string
): Promise<ScanResult> {
  const response = await openai.chat.completions.create({
    model: AI_MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: imageUrl, detail: "high" },
          },
          {
            type: "text",
            text: buildUserPrompt(condition, manualName),
          },
        ],
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 1000,
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;
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

