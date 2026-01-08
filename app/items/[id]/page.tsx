import { ProtectedRoute } from "@/components/layout/protected-route";
import { ItemDetailPageClient } from "@/components/items/item-detail-page-client";

export default async function ItemDetailPage({ params }: { params: { id: string } }) {
  return (
    <ProtectedRoute>
      <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Item</h1>
        <ItemDetailPageClient id={params.id} />
      </main>
    </ProtectedRoute>
  );
}

