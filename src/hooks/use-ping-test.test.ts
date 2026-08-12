import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HISTORY_STORAGE_KEY } from "@/lib/history";
import type { PingResult, Region } from "@/types/ping";

import { usePingTest } from "./use-ping-test";

function makeRegion(code: string): Region {
  return {
    code,
    name: code,
    flag: "🏳️",
    endpoint: `https://${code.toLowerCase()}.test/ping`,
  };
}

const REGION_NA = makeRegion("NA");
const REGION_EUW = makeRegion("EUW");

const okResults: PingResult[] = [
  { region: REGION_NA, latencyMs: 100, attempts: [100] },
  { region: REGION_EUW, latencyMs: 200, attempts: [200] },
];

const failedResults: PingResult[] = [
  { region: REGION_NA, latencyMs: null, attempts: [], failure: "timeout" },
  { region: REGION_EUW, latencyMs: null, attempts: [], failure: "network" },
];

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

function setVisibility(state: DocumentVisibilityState): void {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    value: state,
  });
  document.dispatchEvent(new Event("visibilitychange"));
}

describe("usePingTest", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    window.localStorage.clear();
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
  });

  it("defaults to idle with the monitor off and never pings on mount", () => {
    const pingAll = vi.fn();
    const { result } = renderHook(() => usePingTest({ pingAll }));

    expect(result.current.state.status).toBe("idle");
    expect(result.current.state.monitorActive).toBe(false);
    expect(result.current.state.results).toEqual([]);
    expect(pingAll).not.toHaveBeenCalled();
  });

  it("transitions idle → loading → results after a successful run", async () => {
    const pingAll = vi.fn().mockResolvedValue(okResults);
    const { result } = renderHook(() => usePingTest({ pingAll }));

    act(() => result.current.startPing());
    expect(result.current.state.status).toBe("loading");

    await waitFor(() => expect(result.current.state.status).toBe("results"));
    expect(result.current.state.results).toHaveLength(2);
    expect(result.current.state.lastUpdated).not.toBeNull();
  });

  it("transitions to error when every region fails", async () => {
    const pingAll = vi.fn().mockResolvedValue(failedResults);
    const { result } = renderHook(() => usePingTest({ pingAll }));

    act(() => result.current.startPing());

    await waitFor(() => expect(result.current.state.status).toBe("error"));
    expect(result.current.state.results).toHaveLength(2);
  });

  it("re-runs every 5 seconds while the monitor is active", async () => {
    vi.useFakeTimers();
    const pingAll = vi.fn().mockResolvedValue(okResults);
    const { result } = renderHook(() => usePingTest({ pingAll }));

    act(() => result.current.toggleMonitor());
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(pingAll).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(pingAll).toHaveBeenCalledTimes(2);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(pingAll).toHaveBeenCalledTimes(3);
  });

  it("skips interval ticks while a run is in flight", async () => {
    vi.useFakeTimers();
    const slow = deferred<PingResult[]>();
    const pingAll = vi.fn().mockReturnValue(slow.promise);
    const { result } = renderHook(() => usePingTest({ pingAll }));

    act(() => result.current.toggleMonitor());
    expect(pingAll).toHaveBeenCalledTimes(1);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(15000);
    });
    expect(pingAll).toHaveBeenCalledTimes(1); // in-flight guard swallowed the ticks

    await act(async () => {
      slow.resolve(okResults);
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(result.current.state.status).toBe("results");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000);
    });
    expect(pingAll).toHaveBeenCalledTimes(2); // cadence resumes after completion
  });

  it("pauses while the tab is hidden and fires a fresh run when visible again", async () => {
    vi.useFakeTimers();
    const pingAll = vi.fn().mockResolvedValue(okResults);
    const { result } = renderHook(() => usePingTest({ pingAll }));

    act(() => result.current.toggleMonitor());
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(pingAll).toHaveBeenCalledTimes(1);

    act(() => setVisibility("hidden"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(15000);
    });
    expect(pingAll).toHaveBeenCalledTimes(1); // paused while hidden

    act(() => setVisibility("visible"));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    expect(pingAll).toHaveBeenCalledTimes(2); // fresh run on visible
  });

  it("persists history on run completion and clears it on demand", async () => {
    const pingAll = vi.fn().mockResolvedValue(okResults);
    const { result } = renderHook(() => usePingTest({ pingAll }));

    act(() => result.current.startPing());
    await waitFor(() => expect(result.current.state.status).toBe("results"));
    expect(result.current.state.history.NA).toHaveLength(1);
    expect(result.current.state.history.EUW).toHaveLength(1);

    act(() => result.current.clearHistory());
    expect(result.current.state.history).toEqual({});
    expect(window.localStorage.getItem(HISTORY_STORAGE_KEY)).toBeNull();
  });
});
