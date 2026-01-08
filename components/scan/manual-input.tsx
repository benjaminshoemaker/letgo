"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ManualInput({
  defaultValue,
  isSubmitting,
  onCancel,
  onSubmit,
}: {
  defaultValue?: string;
  isSubmitting?: boolean;
  onCancel?: () => void;
  onSubmit: (manualName: string) => Promise<void> | void;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    const trimmed = value.trim();
    if (!trimmed) {
      setError("Please enter an item name.");
      return;
    }

    setError(null);
    await onSubmit(trimmed);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Couldn’t identify this item</CardTitle>
        <CardDescription>
          Try entering a name so we can still generate a recommendation.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <label className="text-sm font-medium" htmlFor="manualName">
          Item name
        </label>
        <Input
          autoCapitalize="sentences"
          autoComplete="off"
          autoCorrect="on"
          disabled={isSubmitting}
          id="manualName"
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g., cordless drill, blender, winter jacket"
          value={value}
        />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
      </CardContent>
      <CardFooter className="flex gap-2">
        {onCancel ? (
          <Button
            disabled={isSubmitting}
            onClick={onCancel}
            type="button"
            variant="secondary"
          >
            Retake photo
          </Button>
        ) : null}
        <Button disabled={isSubmitting} onClick={handleSubmit} type="button">
          {isSubmitting ? "Retrying…" : "Retry with this name"}
        </Button>
      </CardFooter>
    </Card>
  );
}

