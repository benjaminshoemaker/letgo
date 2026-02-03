import { handleScanRequest } from "@/app/api/scan/_helpers";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handleScanRequest(request, {
    requireManualName: true,
    logLabel: "Manual scan error",
    useManualName: true,
  });
}
