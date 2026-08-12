import { ShieldOff, TriangleAlert, WifiOff } from "lucide-react";

import type { PingFailure, Region } from "@/types/ping";

const FAILURE_META: Record<
  PingFailure,
  { icon: typeof TriangleAlert; title: string }
> = {
  timeout: { icon: TriangleAlert, title: "Timed out" },
  network: { icon: WifiOff, title: "Unreachable" },
  blocked: { icon: ShieldOff, title: "Blocked" },
};

/**
 * Per-region error state with an explanation. A CN timeout is expected
 * outside China — labeled as such, never as a tool failure.
 */
export function PingError({
  failure,
  region,
}: {
  failure: PingFailure;
  region: Region;
}) {
  const meta = FAILURE_META[failure];
  const Icon = meta.icon;
  const isCnTimeout = failure === "timeout" && region.code === "CN";

  return (
    <div role="status" className="flex items-center gap-2 text-sm">
      <Icon className="text-destructive size-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        <span className="text-destructive font-medium">{meta.title}</span>
        <span className="text-muted-foreground">
          {isCnTimeout
            ? " — expected outside China"
            : failure === "network"
              ? " — check your connection (ad blockers or proxies can also cause this)"
              : " — an ad blocker or network policy may be intercepting the request"}
        </span>
        <span className="sr-only">for {region.name}</span>
      </div>
    </div>
  );
}
