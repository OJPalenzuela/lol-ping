import { Skeleton } from "@/components/ui/skeleton";

interface PingSkeletonProps {
  rows?: number;
}

/** Loading placeholder rows while a run is in flight. */
export function PingSkeleton({ rows = 10 }: PingSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Measuring latency"
      className="flex flex-col gap-2"
    >
      <span className="sr-only">Measuring latency…</span>
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="border-border bg-card flex items-center gap-3 rounded-lg border px-3 py-3"
        >
          <Skeleton className="size-6 rounded-full" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}
