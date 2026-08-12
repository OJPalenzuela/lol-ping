import { Trophy } from "lucide-react";

import { sparklinePoints } from "@/lib/sparkline";
import { cn } from "@/lib/utils";
import type { HistoryEntry, PingResult } from "@/types/ping";

import { PingBadge } from "./ping-badge";
import { PingError } from "./ping-error";

/** How many recent history entries to keep in the inline sparkline. */
const SPARKLINE_MAX_ENTRIES = 30;
/** Sparkline dimensions. */
const ROW_SPARKLINE_W = 256;
const ROW_SPARKLINE_H = 28;

interface PingRowProps {
  result: PingResult;
  history: HistoryEntry[];
  isBest: boolean;
  rank: number;
  updating?: boolean;
}

/** One region in the results list: rank, flag, name, Best badge, trend sparkline, latency. */
export function PingRow({
  result,
  history,
  isBest,
  rank,
  updating,
}: PingRowProps) {
  const failed = result.latencyMs === null;
  const entries = (history ?? []).slice(-SPARKLINE_MAX_ENTRIES);
  const hasTrend = entries.length >= 2;
  const points = hasTrend
    ? sparklinePoints([...entries].reverse(), ROW_SPARKLINE_W, ROW_SPARKLINE_H)
    : "";

  return (
    <li
      className={cn(
        "border-border bg-card flex items-center gap-4 rounded-lg border px-5 py-5",
        isBest && "border-gold/60 bg-gold/[0.06]",
      )}
    >
      <span className="text-muted-foreground w-6 shrink-0 text-center text-sm tabular-nums">
        {rank}
      </span>
      <span className="text-xl" aria-hidden="true">
        {result.region.flag}
      </span>
      <span className="flex min-w-0 flex-1 items-center gap-2 truncate">
        <span className="truncate font-medium">{result.region.name}</span>
        {isBest && (
          <span className="border-gold/60 text-gold inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold">
            <Trophy className="size-3.5" aria-hidden="true" />
            Best
          </span>
        )}
      </span>

      {/* Inline trend sparkline */}
      <span className="hidden w-64 shrink-0 sm:block" aria-hidden="true">
        {hasTrend ? (
          <svg
            role="img"
            aria-label={`Ping trend for ${result.region.name}`}
            viewBox={`0 0 ${ROW_SPARKLINE_W} ${ROW_SPARKLINE_H}`}
            className="text-gold/60 h-7 w-64"
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
            className="text-border h-7 w-64"
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

      {failed && result.failure ? (
        <PingError failure={result.failure} region={result.region} />
      ) : (
        <PingBadge result={result} updating={updating} />
      )}
    </li>
  );
}
