import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorMessage({
  title = "Error",
  message,
  onRetry,
}: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-destructive/20 bg-destructive/5 p-4 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-5 w-5 text-destructive" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-sm text-foreground/70">{message}</p>
      </div>
      {onRetry ? (
        <Button onClick={onRetry} size="sm" type="button" variant="secondary">
          Try again
        </Button>
      ) : null}
    </div>
  );
}
