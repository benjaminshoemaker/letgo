import { handleScanRequest } from "@/app/api/scan/_helpers";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleScanRequest(request, {
    allowLowConfidence: true,
    requireManualName: false,
    logLabel: "Scan error",
    useManualName: false,
  });
}
