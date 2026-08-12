import { afterEach, describe, expect, it, vi } from "vitest";

import type { PingResult, Region } from "@/types/ping";

import { HISTORY_MAX_PER_REGION, loadHistory, saveHistory } from "./history";

function makeRegion(code: string): Region {
  return {
    code,
    name: code,
    flag: "🏳️",
    endpoint: `https://${code.toLowerCase()}.test/ping`,
  };
}

function resultFor(region: Region, latencyMs: number | null): PingResult {
  return { region, latencyMs, attempts: latencyMs === null ? [] : [latencyMs] };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe("saveHistory / loadHistory", () => {
  it("persists successful results newest first per region", () => {
    const na = makeRegion("NA");
    saveHistory([resultFor(na, 100)], 1000);
    saveHistory([resultFor(na, 90)], 2000);

    const history = loadHistory();
    expect(history.NA).toHaveLength(2);
    expect(history.NA?.[0]).toEqual({ latencyMs: 90, timestamp: 2000 });
    expect(history.NA?.[1]).toEqual({ latencyMs: 100, timestamp: 1000 });
  });

  it("keeps separate lists per region", () => {
    saveHistory(
      [resultFor(makeRegion("NA"), 100), resultFor(makeRegion("EUW"), 200)],
      1000,
    );

    const history = loadHistory();
    expect(history.NA).toHaveLength(1);
    expect(history.EUW).toHaveLength(1);
    expect(history.NA?.[0]?.latencyMs).toBe(100);
    expect(history.EUW?.[0]?.latencyMs).toBe(200);
  });

  it("evicts the oldest entry beyond the cap of 50 per region", () => {
    const na = makeRegion("NA");
    for (let timestamp = 1; timestamp <= 55; timestamp++) {
      saveHistory([resultFor(na, timestamp)], timestamp);
    }

    const history = loadHistory();
    expect(history.NA).toHaveLength(HISTORY_MAX_PER_REGION);
    expect(history.NA?.[0]).toEqual({ latencyMs: 55, timestamp: 55 });
    expect(history.NA?.[HISTORY_MAX_PER_REGION - 1]).toEqual({
      latencyMs: 6,
      timestamp: 6,
    });
  });

  it("never persists a failed region", () => {
    const na = makeRegion("NA");
    const euw = makeRegion("EUW");
    saveHistory([resultFor(na, 100), resultFor(euw, null)], 1000);

    const history = loadHistory();
    expect(history.NA).toHaveLength(1);
    expect(history.EUW).toBeUndefined();
  });

  it("degrades silently when the storage write throws (quota exceeded)", () => {
    const na = makeRegion("NA");
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("QuotaExceededError");
    });

    expect(() => saveHistory([resultFor(na, 100)], 1000)).not.toThrow();
    expect(loadHistory()).toEqual({});
  });

  it("degrades silently when the storage read throws (private browsing)", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("SecurityError");
    });

    expect(loadHistory()).toEqual({});
  });

  it("returns empty history for corrupt stored JSON", () => {
    window.localStorage.setItem("lol-ping:history:v1", "{not valid json");

    expect(loadHistory()).toEqual({});
  });

  it("never touches localStorage during server rendering", () => {
    vi.stubGlobal("window", undefined);

    expect(loadHistory()).toEqual({});
  });
});
