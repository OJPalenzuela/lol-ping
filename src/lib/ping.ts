import type { PingFailure, PingResult, Region } from "@/types/ping";

export interface PingOptions {
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  attempts?: number;
}

const DEFAULT_TIMEOUT_MS = 4000;
const DEFAULT_ATTEMPTS = 3;

/** Median of a list of values (even-length lists average the middle two). */
export function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  }
  return sorted[mid];
}

function classifyFetchFailure(error: unknown): PingFailure {
  // AbortError can be a DOMException (browser/jsdom) or an Error — check by name.
  if (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "AbortError"
  ) {
    return "timeout";
  }
  return "network";
}

async function pingAttempt(
  endpoint: string,
  fetchImpl: typeof fetch,
  timeoutMs: number,
): Promise<{ latencyMs: number | null; failure?: PingFailure }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const start = performance.now();
  try {
    const response = await fetchImpl(endpoint, {
      signal: controller.signal,
      cache: "no-store",
    });
    const end = performance.now();
    if (!response.ok) {
      // Server responded but refused the request (proxy, ad blocker, policy).
      return { latencyMs: null, failure: "blocked" };
    }
    return { latencyMs: Math.round(end - start) };
  } catch (error) {
    return { latencyMs: null, failure: classifyFetchFailure(error) };
  } finally {
    clearTimeout(timer);
  }
}

/** Measure one region: `attempts` sequential fetches, median of successes. */
export async function pingRegion(
  region: Region,
  opts: PingOptions = {},
): Promise<PingResult> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const attempts = opts.attempts ?? DEFAULT_ATTEMPTS;

  const measured: number[] = [];
  const failures: PingFailure[] = [];

  for (let i = 0; i < attempts; i++) {
    const { latencyMs, failure } = await pingAttempt(
      region.endpoint,
      fetchImpl,
      timeoutMs,
    );
    if (latencyMs !== null) {
      measured.push(latencyMs);
    } else if (failure) {
      failures.push(failure);
    }
  }

  if (measured.length === 0) {
    return {
      region,
      latencyMs: null,
      attempts: measured,
      failure: failures[0] ?? "network",
    };
  }
  return { region, latencyMs: median(measured), attempts: measured };
}

/**
 * Measure all regions in parallel. One region failing never blocks the rest
 * (`Promise.allSettled`); failed regions report their own error state.
 */
export async function pingAllRegions(
  regions: Region[],
  opts: PingOptions = {},
): Promise<PingResult[]> {
  const settled = await Promise.allSettled(
    regions.map((region) => pingRegion(region, opts)),
  );
  return regions.map((region, index) => {
    const outcome = settled[index];
    if (outcome.status === "fulfilled") return outcome.value;
    return {
      region,
      latencyMs: null,
      attempts: [],
      failure: "network" as const,
    };
  });
}
