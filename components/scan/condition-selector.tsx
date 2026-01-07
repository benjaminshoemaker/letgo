"use client";

import { cn } from "@/lib/utils";

export type ItemCondition = "EXCELLENT" | "GOOD" | "FAIR" | "POOR";

const OPTIONS: Array<{ value: ItemCondition; label: string; help: string }> = [
  {
    value: "EXCELLENT",
    label: "Excellent",
    help: "Like new, no visible wear.",
  },
  {
    value: "GOOD",
    label: "Good",
    help: "Works well, minor cosmetic wear.",
  },
  {
    value: "FAIR",
    label: "Fair",
    help: "Noticeable wear or missing parts, still usable.",
  },
  {
    value: "POOR",
    label: "Poor",
    help: "Not functional or heavily damaged.",
  },
];

export function ConditionSelector({
  value,
  onChange,
}: {
  value: ItemCondition | null;
  onChange: (value: ItemCondition) => void;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-foreground/80">Condition</h2>
      <div className="grid grid-cols-1 gap-2">
        {OPTIONS.map((option) => {
          const isSelected = option.value === value;
          return (
            <button
              className={cn(
                "rounded-md border p-3 text-left transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                isSelected && "border-primary bg-primary/5"
              )}
              key={option.value}
              onClick={() => onChange(option.value)}
              type="button"
            >
              <div className="font-medium">{option.label}</div>
              <div className="text-sm text-foreground/70">{option.help}</div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

