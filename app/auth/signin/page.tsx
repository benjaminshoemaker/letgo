import { redirect } from "next/navigation";

import { SignInButton } from "@/components/auth/sign-in-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth";

export default async function SignInPage() {
  const session = await getSession();
  if (session?.user?.id) {
    redirect("/");
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-foreground/70">
            Continue with Google to start using LetGo.
          </p>
          <SignInButton />
        </CardContent>
      </Card>
    </main>
  );
}

