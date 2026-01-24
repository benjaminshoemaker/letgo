"use client";

import { WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-8">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="rounded-full bg-muted p-6">
          <WifiOff className="h-12 w-12 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">You&apos;re offline</h1>
          <p className="max-w-sm text-muted-foreground">
            LetGo needs an internet connection to scan items and get recommendations.
            Please check your connection and try again.
          </p>
        </div>

        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="mt-4"
        >
          Try again
        </Button>
      </div>
    </main>
  );
}
