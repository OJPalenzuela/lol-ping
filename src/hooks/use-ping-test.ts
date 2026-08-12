"use client";

import { useEffect, useReducer, useRef } from "react";

import { HISTORY_STORAGE_KEY, loadHistory, saveHistory } from "@/lib/history";
import { pingAllRegions, sortResults } from "@/lib/ping";
import { REGIONS } from "@/lib/regions";
import type { HistoryEntry, PingResult, PingStatus } from "@/types/ping";

export const MONITOR_INTERVAL_MS = 5000;

export interface PingTestState {
  status: PingStatus;
  results: PingResult[];
  history: Record<string, HistoryEntry[]>;
  monitorActive: boolean;
  lastUpdated: Date | null;
}

export interface UsePingTestOptions {
  pingAll?: typeof pingAllRegions;
  intervalMs?: number;
}

const initialState: PingTestState = {
  status: "idle",
  results: [],
  history: {},
  monitorActive: false,
  lastUpdated: null,
};

type Action =
  | { type: "start" }
  | {
      type: "finish";
      results: PingResult[];
      history: Record<string, HistoryEntry[]>;
      updatedAt: Date;
    }
  | { type: "setMonitor"; active: boolean }
  | { type: "clearHistory" }
  | { type: "hydrateHistory"; history: Record<string, HistoryEntry[]> };

function reducer(state: PingTestState, action: Action): PingTestState {
  switch (action.type) {
    case "start":
      return { ...state, status: "loading" };
    case "finish": {
      const allFailed = action.results.every(
        (result) => result.latencyMs === null,
      );
      return {
        ...state,
        status: allFailed ? "error" : "results",
        results: action.results,
        history: action.history,
        lastUpdated: action.updatedAt,
      };
    }
    case "setMonitor":
      return { ...state, monitorActive: action.active };
    case "clearHistory":
      return { ...state, history: {} };
    case "hydrateHistory":
      return { ...state, history: action.history };
  }
}

export function usePingTest(opts: UsePingTestOptions = {}) {
  const pingAll = opts.pingAll ?? pingAllRegions;
  const intervalMs = opts.intervalMs ?? MONITOR_INTERVAL_MS;
  const [state, dispatch] = useReducer(reducer, initialState);

  const inFlight = useRef(false);
  const hasResults = useRef(false);
  const monitorRef = useRef(false);
  const pingAllRef = useRef(pingAll);
  const runRef = useRef<() => void>(() => {});

  const run = () => {
    if (inFlight.current) return; // never overlap runs
    inFlight.current = true;

    // Only show skeleton on first run — keep stale results visible during refresh
    if (!hasResults.current) {
      dispatch({ type: "start" });
    }

    pingAllRef
      .current(REGIONS)
      .then((results) => {
        hasResults.current = true;
        const sorted = sortResults(results);
        saveHistory(sorted);
        dispatch({
          type: "finish",
          results: sorted,
          history: loadHistory(),
          updatedAt: new Date(),
        });
      })
      .finally(() => {
        inFlight.current = false;
      });
  };

  // Keep refs in sync inside effects — refs must never be written during render.
  useEffect(() => {
    pingAllRef.current = pingAll;
    runRef.current = run;
  });

  // Hydrate history once on mount (client-only — localStorage never in SSR).
  useEffect(() => {
    dispatch({ type: "hydrateHistory", history: loadHistory() });
  }, []);

  // Monitor cadence: every intervalMs, skip while hidden or already in flight.
  useEffect(() => {
    if (!state.monitorActive) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "hidden") return;
      runRef.current();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [state.monitorActive, intervalMs]);

  // Tab-hidden pause + fresh run when visible again.
  useEffect(() => {
    const handleVisibility = () => {
      if (!monitorRef.current || document.visibilityState !== "visible") return;
      runRef.current();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  useEffect(() => {
    monitorRef.current = state.monitorActive;
  }, [state.monitorActive]);

  const startPing = () => {
    runRef.current();
  };

  const toggleMonitor = () => {
    const next = !state.monitorActive;
    dispatch({ type: "setMonitor", active: next });
    if (next) runRef.current(); // starting the monitor runs immediately
  };

  const clearHistory = () => {
    try {
      window.localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch {
      // storage unavailable — nothing to clear
    }
    dispatch({ type: "clearHistory" });
  };

  return { state, startPing, toggleMonitor, clearHistory };
}
