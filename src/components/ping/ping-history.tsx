import { REGIONS } from "@/lib/regions";
import type { HistoryEntry } from "@/types/ping";

export const SPARKLINE_WIDTH = 96;
export const SPARKLINE_HEIGHT = 24;

/**
 * SVG polyline points for a latency history (pure, hand-rolled — no chart lib).
 * Higher latency plots lower on the chart; first entry leftmost.
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
      // Higher latency → larger y (lower on the chart, SVG y grows downward).
      const y = 1 + ((entry.latencyMs - min) / range) * (height - 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

interface PingHistoryProps {
  history: Record<string, HistoryEntry[]>;
}

/** Per-region latency trend sparklines from persisted history. */
export function PingHistory({ history }: PingHistoryProps) {
  return (
    <section aria-labelledby="ping-history-title">
      <h2 id="ping-history-title" className="text-lg font-semibold">
        Ping history
      </h2>
      <ul className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {REGIONS.map((region) => {
          const entries = history[region.code] ?? [];
          const hasTrend = entries.length >= 2;
          // Persisted newest-first; plot oldest → newest left-to-right.
          const points = hasTrend
            ? sparklinePoints(
                [...entries].reverse(),
                SPARKLINE_WIDTH,
                SPARKLINE_HEIGHT,
              )
            : "";

          return (
            <li
              key={region.code}
              className="border-border bg-card flex items-center gap-3 rounded-lg border px-3 py-2.5"
            >
              <span className="text-xl" aria-hidden="true">
                {region.flag}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm">
                {region.name}
              </span>
              {hasTrend ? (
                <svg
                  role="img"
                  aria-label={`Ping trend for ${region.name} across ${entries.length} runs`}
                  viewBox={`0 0 ${SPARKLINE_WIDTH} ${SPARKLINE_HEIGHT}`}
                  className="text-gold h-6 w-24 shrink-0"
                >
                  <polyline
                    points={points}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              ) : (
                <span className="text-muted-foreground shrink-0 text-xs">
                  No history yet
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
