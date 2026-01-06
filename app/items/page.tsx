import { ProtectedRoute } from "@/components/layout/protected-route";

export default async function ItemsPage() {
  return (
    <ProtectedRoute>
      <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">My Items</h1>
        <p className="text-sm text-foreground/70">Coming soon.</p>
      </main>
    </ProtectedRoute>
  );
}

