import {
  SignalHigh,
  SignalLow,
  SignalMedium,
  TriangleAlert,
} from "lucide-react";
import type { ComponentType } from "react";

import { classifyLatency, type LatencyTier } from "@/lib/thresholds";
import { cn } from "@/lib/utils";
import type { PingResult } from "@/types/ping";

export const TIER_META: Record<
  LatencyTier,
  {
    label: string;
    icon: ComponentType<{ className?: string }>;
    colorClass: string;
  }
> = {
  green: {
    label: "Excellent",
    icon: SignalHigh,
    colorClass: "text-tier-green bg-tier-green/10 border-tier-green/30",
  },
  yellow: {
    label: "Good",
    icon: SignalMedium,
    colorClass: "text-tier-yellow bg-tier-yellow/10 border-tier-yellow/30",
  },
  orange: {
    label: "Fair",
    icon: SignalLow,
    colorClass: "text-tier-orange bg-tier-orange/10 border-tier-orange/30",
  },
  red: {
    label: "Poor",
    icon: TriangleAlert,
    colorClass: "text-tier-red bg-tier-red/10 border-tier-red/30",
  },
};

/**
 * Latency badge: color PLUS icon PLUS text label — never color-only (WCAG 1.4.1).
 * The tier word is visually hidden but present for screen readers.
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
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm font-medium",
        meta.colorClass,
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      <span className="tabular-nums">{result.latencyMs} ms</span>
      <span className="sr-only">{meta.label}</span>
    </span>
  );
}
