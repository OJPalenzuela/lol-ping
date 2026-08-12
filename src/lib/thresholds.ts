/**
 * Latency classification thresholds and tiers.
 * Boundaries: green <100ms, yellow <200ms, orange <300ms, red >=300ms.
 */

import {
  SignalHigh,
  SignalLow,
  SignalMedium,
  TriangleAlert,
} from "lucide-react";
import type { ComponentType } from "react";

export const LATENCY_THRESHOLDS = {
  GREEN: 100,
  YELLOW: 200,
  ORANGE: 300,
} as const;

export const LATENCY_TIERS = ["green", "yellow", "orange", "red"] as const;

export type LatencyTier = (typeof LATENCY_TIERS)[number];

/** Classify a latency measurement into its color tier. */
export function classifyLatency(latencyMs: number): LatencyTier {
  if (latencyMs < LATENCY_THRESHOLDS.GREEN) return "green";
  if (latencyMs < LATENCY_THRESHOLDS.YELLOW) return "yellow";
  if (latencyMs < LATENCY_THRESHOLDS.ORANGE) return "orange";
  return "red";
}

/** Display metadata per latency tier — icon + accessible label. */
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
