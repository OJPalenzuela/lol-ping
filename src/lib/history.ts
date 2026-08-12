import type { HistoryEntry, PingResult } from "@/types/ping";

export const HISTORY_STORAGE_KEY = "lol-ping:history:v1";
export const HISTORY_MAX_PER_REGION = 50;

/**
 * Persist a completed run's successful latencies, newest first, capped at
 * `HISTORY_MAX_PER_REGION` entries per region. Failed regions are skipped.
 * Storage failures (private browsing, quota) degrade silently — the page
 * still renders, just without history.
 */
export function saveHistory(
  results: PingResult[],
  timestamp: number = Date.now(),
): void {
  if (typeof window === "undefined") return;
  const history = loadHistory();
  for (const result of results) {
    if (result.latencyMs === null) continue;
    const entries = history[result.region.code] ?? [];
    entries.unshift({ latencyMs: result.latencyMs, timestamp });
    history[result.region.code] = entries.slice(0, HISTORY_MAX_PER_REGION);
  }
  try {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch {
    // storage unavailable — skip the write, never throw
  }
}

/** Read persisted history; returns {} when storage is missing or unusable. */
export function loadHistory(): Record<string, HistoryEntry[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return {};
    return parsed as Record<string, HistoryEntry[]>;
  } catch {
    return {};
  }
}
