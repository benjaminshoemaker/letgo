"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SignInButton() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Button
      disabled={isLoading}
      onClick={() => {
        setIsLoading(true);
        signIn("google", { callbackUrl: "/" });
      }}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        "Continue with Google"
      )}
    </Button>
  );
}
