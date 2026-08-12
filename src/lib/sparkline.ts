import type { HistoryEntry } from "@/types/ping";

/**
 * SVG polyline points for a latency history (pure, hand-rolled — no chart lib).
 * Higher latency plots lower on the chart (SVG y grows downward);
 * first entry leftmost. Empty for fewer than two entries.
 */
export function sparklinePoints(
  history: HistoryEntry[],
  width: number,
  height: number,
): string {
  if (history.length < 2) return "";
  const latencies = history.map((entry) => entry.latencyMs);
  const max = Math.max(...latencies);
  const min = Math.min(...latencies);
  const range = max - min || 1;
  const stepX = width / (history.length - 1);

  return history
    .map((entry, index) => {
      const x = index * stepX;
      // Higher latency → larger y (lower on the chart).
      const y = 1 + ((entry.latencyMs - min) / range) * (height - 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}
