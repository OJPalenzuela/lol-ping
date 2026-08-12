import { Trophy } from "lucide-react";

import { sparklinePoints } from "@/lib/sparkline";
import { cn } from "@/lib/utils";
import type { HistoryEntry, PingResult } from "@/types/ping";

import { PingBadge } from "./ping-badge";
import { PingError } from "./ping-error";

/** Compact sparkline dimensions for inline row display. */
const ROW_SPARKLINE_W = 56;
const ROW_SPARKLINE_H = 16;

interface PingRowProps {
  result: PingResult;
  history: HistoryEntry[];
  isBest: boolean;
  rank: number;
}

/** One region in the results list: rank, flag, name, trend sparkline, latency badge or error. */
export function PingRow({ result, history, isBest, rank }: PingRowProps) {
  const failed = result.latencyMs === null;
  const entries = history ?? [];
  const hasTrend = entries.length >= 2;
  // Persisted newest-first; plot oldest → newest left-to-right.
  const points = hasTrend
    ? sparklinePoints([...entries].reverse(), ROW_SPARKLINE_W, ROW_SPARKLINE_H)
    : "";

  return (
    <li
      className={cn(
        "border-border bg-card flex items-center gap-4 rounded-lg border px-4 py-3.5",
        isBest && "border-gold/60 bg-gold/[0.06]",
      )}
    >
      <span className="text-muted-foreground w-6 shrink-0 text-center text-sm tabular-nums">
        {rank}
      </span>
      <span className="text-xl" aria-hidden="true">
        {result.region.flag}
      </span>
      <span className="min-w-0 flex-1 truncate font-medium">
        {result.region.name}
      </span>

      {/* Inline trend sparkline */}
      <span className="hidden w-14 shrink-0 sm:block" aria-hidden="true">
        {hasTrend ? (
          <svg
            role="img"
            aria-label={`Ping trend for ${result.region.name}`}
            viewBox={`0 0 ${ROW_SPARKLINE_W} ${ROW_SPARKLINE_H}`}
            className="text-gold/60 h-4 w-14"
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
          <svg
            viewBox={`0 0 ${ROW_SPARKLINE_W} ${ROW_SPARKLINE_H}`}
            className="text-border h-4 w-14"
          >
            <line
              x1="0"
              y1={ROW_SPARKLINE_H / 2}
              x2={ROW_SPARKLINE_W}
              y2={ROW_SPARKLINE_H / 2}
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          </svg>
        )}
      </span>

      {isBest && (
        <span className="border-gold/60 text-gold inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold">
          <Trophy className="size-3.5" aria-hidden="true" />
          Best
        </span>
      )}
      {failed && result.failure ? (
        <PingError failure={result.failure} region={result.region} />
      ) : (
        <PingBadge result={result} />
      )}
    </li>
  );
}
