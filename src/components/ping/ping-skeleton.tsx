import { Skeleton } from "@/components/ui/skeleton";

interface PingSkeletonProps {
  rows?: number;
}

/**
 * Loading placeholder rows that mirror the real PingRow layout
 * to prevent Cumulative Layout Shift (CLS).
 */
export function PingSkeleton({ rows = 10 }: PingSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Measuring latency"
      className="flex flex-col gap-3"
    >
      <span className="sr-only">Measuring latency…</span>
      {Array.from({ length: rows }, (_, index) => (
        <div
          key={index}
          className="border-border bg-card flex items-center gap-4 rounded-lg border px-5 py-5"
        >
          <Skeleton className="h-4 w-6" />
          <Skeleton className="size-7 rounded" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="hidden h-7 w-64 sm:block" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}
