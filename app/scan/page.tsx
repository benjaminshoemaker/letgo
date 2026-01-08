import { ProtectedRoute } from "@/components/layout/protected-route";
import { ScanPageClient } from "@/components/scan/scan-page";

export default async function ScanPage() {
  return (
    <ProtectedRoute>
      <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Scan</h1>
        <p className="text-sm text-foreground/70">
          Take a photo (or upload one), choose the condition, and we’ll suggest what to do next. If we
          can’t identify the item, you can enter a name to retry.
        </p>
        <ScanPageClient />
      </main>
    </ProtectedRoute>
  );
}
