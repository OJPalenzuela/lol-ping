import { Badge } from "@/components/ui/badge";
import { classifyLatency, TIER_CLASSES, TIER_META } from "@/lib/thresholds";
import { cn } from "@/lib/utils";
import type { PingResult } from "@/types/ping";

/**
 * Latency badge using shadcn/ui Badge with className overrides.
 * Color PLUS icon PLUS text label — never color-only (WCAG 1.4.1).
 * Does NOT modify shadcn vendor files; tier styling is composed via className.
 */
export function PingBadge({ result }: { result: PingResult }) {
  if (result.latencyMs === null) {
    return (
      <span className="text-muted-foreground text-sm" aria-label="No data">
        —
      </span>
    );
  }
  const tier = classifyLatency(result.latencyMs);
  const meta = TIER_META[tier];
  const Icon = meta.icon;

  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 px-2.5 py-1", TIER_CLASSES[tier])}
    >
      <Icon className="size-4" aria-hidden="true" />
      <span className="tabular-nums">{result.latencyMs} ms</span>
      <span className="sr-only">{meta.label}</span>
    </Badge>
  );
}
