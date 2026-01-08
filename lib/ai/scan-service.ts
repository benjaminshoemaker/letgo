import { openai, AI_MODEL } from "@/lib/openai";
import type { ScanResult } from "@/lib/scan-types";

import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/ai/scan-prompt";

type LowConfidenceError = Error & { code: "LOW_CONFIDENCE"; result?: ScanResult };

function shouldTriggerManualFallback(result: ScanResult): boolean {
  if (result.confidence === "LOW") return true;

  if (result.confidence !== "MEDIUM") return false;

  const hedge = /(not sure|unclear|hard to tell|difficult to tell|can'?t tell|maybe|possibly|might|appears to be|looks like)/i;
  if (hedge.test(result.reasoning)) return true;

  const name = result.identifiedName.trim().toLowerCase();
  const genericName =
    name.length < 4 ||
    /(unknown|misc|miscellaneous|item|object|thing|stuff)/i.test(name) ||
    /^(a |an |the )?(unknown|unclear)/i.test(name);

  return genericName;
}

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
    text: { format: { type: "json_object" } },
    max_output_tokens: 1000,
  });

  if (response.status !== "completed") {
    throw new Error(
      `AI response not completed (status=${response.status}, reason=${response.incomplete_details?.reason ?? "unknown"})`
    );
  }

  const content = response.output_text?.trim();
  if (!content) {
    throw new Error("No response from AI");
  }

  let result: ScanResult;
  try {
    result = JSON.parse(content) as ScanResult;
  } catch {
    throw new Error("AI response was not valid JSON");
  }

  if (shouldTriggerManualFallback(result) && !manualName) {
    const error = new Error("Low confidence identification") as LowConfidenceError;
    error.code = "LOW_CONFIDENCE";
    error.result = result;
    throw error;
  }

  return result;
}
