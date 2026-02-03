import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

function SkeletonTextBlock({ widths }: { widths: string[] }) {
  return (
    <div className="space-y-2">
      {widths.map((width, index) => (
        <Skeleton key={`${width}-${index}`} className={`h-4 ${width}`} />
      ))}
    </div>
  );
}

function RecommendationSkeletonCard({ showValue }: { showValue?: boolean }) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        {showValue ? <Skeleton className="h-4 w-24" /> : null}
        <SkeletonTextBlock widths={["w-full", "w-full", "w-3/4"]} />
        <SkeletonTextBlock widths={["w-full", "w-full", "w-1/2"]} />
      </div>
    </div>
  );
}

export function ItemCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <Skeleton className="h-14 w-14 rounded-md" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  );
}

export function ItemListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <ItemCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ItemDetailSkeleton() {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-9 w-16 rounded-md" />
        <Skeleton className="h-4 w-12" />
      </div>

      <Skeleton className="h-64 w-full rounded-md" />

      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-10 w-full rounded-md" />
      </div>

      <RecommendationSkeletonCard showValue />

      <Skeleton className="h-10 w-full rounded-md" />
    </section>
  );
}

export function ScanResultSkeleton() {
  return (
    <div className="space-y-4">
      <RecommendationSkeletonCard />
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1 rounded-md" />
        <Skeleton className="h-10 flex-1 rounded-md" />
      </div>
    </div>
  );
}
