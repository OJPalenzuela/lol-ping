import { Trophy } from "lucide-react";

import { cn } from "@/lib/utils";
import type { HistoryEntry, PingResult } from "@/types/ping";

import { PingBadge } from "./ping-badge";
import { PingError } from "./ping-error";

interface PingRowProps {
  result: PingResult;
  history: HistoryEntry[];
  isBest: boolean;
  rank: number;
}

/** One region in the results list: rank, flag, name, latency badge or error. */
export function PingRow({ result, isBest, rank }: PingRowProps) {
  const failed = result.latencyMs === null;

  return (
    <li
      className={cn(
        "border-border bg-card flex items-center gap-3 rounded-lg border px-3 py-2.5",
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
