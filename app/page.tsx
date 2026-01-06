import { ProtectedRoute } from "@/components/layout/protected-route";
import { getSession } from "@/lib/auth";

export default async function Home() {
  const session = await getSession();

  return (
    <ProtectedRoute>
      <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">LetGo</h1>
        <p className="text-sm text-foreground/70">
          Signed in as{" "}
          <span className="font-medium text-foreground">
            {session?.user?.email ?? session?.user?.name ?? session?.user?.id}
          </span>
          .
        </p>
      </main>
    </ProtectedRoute>
  );
}
