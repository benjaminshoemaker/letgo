import { ProtectedRoute } from "@/components/layout/protected-route";
import { ItemsPageClient } from "@/components/items/items-page-client";

export default async function ItemsPage() {
  return (
    <ProtectedRoute>
      <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">My Items</h1>
        <p className="text-sm text-foreground/70">
          Review past recommendations, mark items done, or delete them when you’re finished.
        </p>
        <ItemsPageClient />
      </main>
    </ProtectedRoute>
  );
}
