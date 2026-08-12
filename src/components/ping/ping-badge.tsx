import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { classifyLatency, TIER_CLASSES, TIER_META } from "@/lib/thresholds";
import { cn } from "@/lib/utils";
import type { PingResult } from "@/types/ping";

/**
 * Latency badge using shadcn/ui Badge with className overrides.
 * Color PLUS icon PLUS text label — never color-only (WCAG 1.4.1).
 * Shows a spinner during background refreshes to indicate an update.
 */
export function PingBadge({
  result,
  updating = false,
}: {
  result: PingResult;
  updating?: boolean;
}) {
  if (result.latencyMs === null) {
    return (
      <span className="text-muted-foreground text-sm" aria-label="No data">
        —
      </span>
    );
  }
  const tier = classifyLatency(result.latencyMs);
  const meta = TIER_META[tier];
  const Icon = updating ? Loader2 : meta.icon;

  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 px-2.5 py-1", TIER_CLASSES[tier])}
    >
      <Icon
        className={cn("size-4", updating && "animate-spin")}
        aria-hidden="true"
      />
      <span
        className="tabular-nums"
        aria-label={updating ? "Updating" : undefined}
      >
        {updating ? "..." : `${result.latencyMs} ms`}
      </span>
      {!updating && <span className="sr-only">{meta.label}</span>}
    </Badge>
  );
}
