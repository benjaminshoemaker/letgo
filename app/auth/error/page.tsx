import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function getErrorMessage(error?: string) {
  switch (error) {
    case "OAuthSignin":
    case "OAuthCallback":
    case "OAuthCreateAccount":
      return "Google sign-in failed. Please try again.";
    case "AccessDenied":
      return "Access denied. Please make sure you selected the correct Google account.";
    case "Configuration":
      return "Authentication is not configured correctly. Check environment variables.";
    default:
      return "Something went wrong during sign-in. Please try again.";
  }
}

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const message = getErrorMessage(searchParams.error);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>Sign-in error</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-foreground/70">{message}</p>
          <Button asChild>
            <Link href="/auth/signin">Back to sign in</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

