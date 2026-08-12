import { afterEach, describe, expect, it, vi } from "vitest";

import type { PingResult, Region } from "@/types/ping";

import { pingAllRegions, pingRegion, sortResults } from "./ping";

const okResponse = () => new Response(null, { status: 200 });

function makeRegion(code: string, endpoint: string): Region {
  return { code, name: code, flag: "🏳️", endpoint };
}

/**
 * Script performance.now() so each fetch attempt measures a controlled delta.
 * Deltas are applied in order: attempt 1 spans deltas[0], attempt 2 deltas[1], ...
 */
function mockClock(deltas: number[]): void {
  const times: number[] = [0];
  for (const delta of deltas) {
    const next = times[times.length - 1] + delta;
    times.push(next, next);
  }
  let call = 0;
  vi.spyOn(performance, "now").mockImplementation(
    () => times[Math.min(call++, times.length - 1)],
  );
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("pingRegion", () => {
  it("reports the median of three successful attempts", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(okResponse());
    mockClock([90, 110, 100]);

    const result = await pingRegion(
      makeRegion("NA", "https://example.test/ping"),
      {
        fetchImpl,
      },
    );

    expect(fetchImpl).toHaveBeenCalledTimes(3);
    expect(result.latencyMs).toBe(100);
    expect(result.attempts).toEqual([90, 110, 100]);
    expect(result.failure).toBeUndefined();
  });

  it("excludes an outlier from the median", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(okResponse());
    mockClock([80, 500, 90]);

    const result = await pingRegion(
      makeRegion("NA", "https://example.test/ping"),
      {
        fetchImpl,
      },
    );

    expect(result.latencyMs).toBe(90);
  });

  it("aborts an attempt that exceeds the 4s timeout and classifies it as timeout", async () => {
    vi.useFakeTimers();
    const fetchImpl = vi.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () =>
            reject(
              new DOMException("The operation was aborted.", "AbortError"),
            ),
          );
        }),
    );

    const resultPromise = pingRegion(
      makeRegion("CN", "https://example.test/ping"),
      {
        fetchImpl,
        attempts: 1,
      },
    );
    await vi.advanceTimersByTimeAsync(4000);
    const result = await resultPromise;

    expect(result.latencyMs).toBeNull();
    expect(result.failure).toBe("timeout");
    expect(result.attempts).toEqual([]);
  });

  it("classifies a network failure (TypeError) as network", async () => {
    const fetchImpl = vi
      .fn()
      .mockRejectedValue(new TypeError("Failed to fetch"));

    const result = await pingRegion(
      makeRegion("NA", "https://example.test/ping"),
      {
        fetchImpl,
      },
    );

    expect(result.latencyMs).toBeNull();
    expect(result.failure).toBe("network");
  });

  it("classifies a refused non-OK response as blocked", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 403 }));

    const result = await pingRegion(
      makeRegion("NA", "https://example.test/ping"),
      {
        fetchImpl,
      },
    );

    expect(result.latencyMs).toBeNull();
    expect(result.failure).toBe("blocked");
  });
});

describe("pingAllRegions", () => {
  it("keeps all regions when every endpoint responds", async () => {
    const regions = [1, 2, 3].map((n) =>
      makeRegion(`R${n}`, `https://r${n}.test/ping`),
    );
    const fetchImpl = vi.fn().mockResolvedValue(okResponse());
    mockClock([100, 100, 100, 100, 100, 100, 100, 100, 100]);

    const results = await pingAllRegions(regions, { fetchImpl });

    expect(results).toHaveLength(3);
    // Parallel regions interleave clock reads, so exact values are asserted
    // per-region in the pingRegion suite; here we pin isolation behavior.
    expect(results.every((r) => r.latencyMs !== null)).toBe(true);
    expect(results.every((r) => r.failure === undefined)).toBe(true);
  });

  it("reports 9 regions with latency and 1 with an error when one endpoint fails", async () => {
    const regions = Array.from({ length: 10 }, (_, i) =>
      makeRegion(`R${i}`, `https://r${i}.test/ping`),
    );
    // One region's endpoint always rejects; the other nine always resolve.
    const fetchImpl = vi.fn((input: RequestInfo | URL) =>
      String(input).includes("r1.test")
        ? Promise.reject(new TypeError("Failed to fetch"))
        : Promise.resolve(okResponse()),
    );
    mockClock(Array.from({ length: 30 }, () => 100));

    const results = await pingAllRegions(regions, { fetchImpl });

    expect(results).toHaveLength(10);
    const failed = results.filter((r) => r.latencyMs === null);
    const ok = results.filter((r) => r.latencyMs !== null);
    expect(ok).toHaveLength(9);
    expect(failed).toHaveLength(1);
    expect(failed[0]?.failure).toBe("network");
    expect(failed[0]?.region.code).toBe("R1");
    // results stay in input order
    expect(results[0]?.region.code).toBe("R0");
    expect(results[9]?.region.code).toBe("R9");
  });
});

describe("sortResults", () => {
  function result(code: string, latencyMs: number | null): PingResult {
    return {
      region: makeRegion(code, `https://${code.toLowerCase()}.test/ping`),
      latencyMs,
      attempts: latencyMs === null ? [] : [latencyMs],
    };
  }

  it("sorts successful results ascending by latency", () => {
    const sorted = sortResults([
      result("NA", 150),
      result("EUW", 80),
      result("KR", 120),
    ]);

    expect(sorted.map((r) => r.region.code)).toEqual(["EUW", "KR", "NA"]);
  });

  it("keeps failed regions after successes without failing the sort", () => {
    const sorted = sortResults([
      result("NA", 150),
      result("CN", null),
      result("EUW", 80),
      result("JP", null),
    ]);

    expect(sorted.map((r) => r.region.code)).toEqual(["EUW", "NA", "CN", "JP"]);
  });

  it("breaks latency ties deterministically by input (table) order", () => {
    const sorted = sortResults([
      result("NA", 100),
      result("EUW", 100),
      result("KR", 100),
    ]);

    expect(sorted.map((r) => r.region.code)).toEqual(["NA", "EUW", "KR"]);
  });
});
