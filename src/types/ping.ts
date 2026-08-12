/** Shared domain types for the ping tester. */

export const PING_FAILURES = ["timeout", "network", "blocked"] as const;

export type PingFailure = (typeof PING_FAILURES)[number];

export interface Region {
  code: string;
  name: string;
  flag: string;
  endpoint: string;
}

export interface PingResult {
  region: Region;
  latencyMs: number | null;
  attempts: number[];
  failure?: PingFailure;
}

export const PING_STATUSES = ["idle", "loading", "results", "error"] as const;

export type PingStatus = (typeof PING_STATUSES)[number];

export interface HistoryEntry {
  latencyMs: number;
  timestamp: number;
}
