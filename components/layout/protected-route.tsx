import { redirect } from "next/navigation";

import { getSession } from "@/lib/auth";

export async function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}): Promise<JSX.Element> {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  return <>{children}</>;
}
