import {
  SignalHigh,
  SignalLow,
  SignalMedium,
  TriangleAlert,
} from "lucide-react";
import type { ComponentType } from "react";

import { Badge } from "@/components/ui/badge";
import { classifyLatency, type LatencyTier } from "@/lib/thresholds";
import type { PingResult } from "@/types/ping";

export const TIER_META: Record<
  LatencyTier,
  {
    label: string;
    icon: ComponentType<{ className?: string }>;
  }
> = {
  green: { label: "Excellent", icon: SignalHigh },
  yellow: { label: "Good", icon: SignalMedium },
  orange: { label: "Fair", icon: SignalLow },
  red: { label: "Poor", icon: TriangleAlert },
};

/**
 * Latency badge using shadcn/ui Badge with custom latency variants.
 * Color PLUS icon PLUS text label — never color-only (WCAG 1.4.1).
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
    <Badge variant={`ping_${tier}`} className="gap-1.5 px-2.5 py-1">
      <Icon className="size-4" aria-hidden="true" />
      <span className="tabular-nums">{result.latencyMs} ms</span>
      <span className="sr-only">{meta.label}</span>
    </Badge>
  );
}
