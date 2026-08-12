import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PingResult, PingStatus, Region } from "@/types/ping";

import { PingPanel } from "./ping-panel";

const { mockHook } = vi.hoisted(() => ({ mockHook: vi.fn() }));

vi.mock("@/hooks/use-ping-test", () => ({
  usePingTest: () => mockHook(),
}));

function makeRegion(code: string): Region {
  return {
    code,
    name: code,
    flag: "🏳️",
    endpoint: `https://${code.toLowerCase()}.test/ping`,
  };
}

function makeResult(region: Region, latencyMs: number | null): PingResult {
  return { region, latencyMs, attempts: latencyMs === null ? [] : [latencyMs] };
}

const sortedResults = [
  makeResult(makeRegion("NA"), 80),
  makeResult(makeRegion("EUW"), 120),
  {
    region: makeRegion("CN"),
    latencyMs: null,
    attempts: [],
    failure: "timeout" as const,
  },
];

beforeEach(() => {
  mockHook.mockReset();
  mockHook.mockReturnValue({
    state: {
      status: "idle" as PingStatus,
      results: [],
      history: {},
      monitorActive: false,
      lastUpdated: null,
    },
    startPing: vi.fn(),
    toggleMonitor: vi.fn(),
    clearHistory: vi.fn(),
  });
});

describe("PingPanel", () => {
  it("offers a test trigger while idle and renders no rows", () => {
    render(<PingPanel />);

    expect(
      screen.getByRole("button", { name: /test ping/i }),
    ).toBeInTheDocument();
    expect(screen.queryAllByRole("listitem")).toHaveLength(0);
  });

  it("starts a run when the test button is clicked", () => {
    const startPing = vi.fn();
    mockHook.mockReturnValue({
      state: {
        status: "idle",
        results: [],
        history: {},
        monitorActive: false,
        lastUpdated: null,
      },
      startPing,
      toggleMonitor: vi.fn(),
      clearHistory: vi.fn(),
    });

    render(<PingPanel />);
    fireEvent.click(screen.getByRole("button", { name: /test ping/i }));

    expect(startPing).toHaveBeenCalledTimes(1);
  });

  it("shows the skeleton and marks the results region busy while loading", () => {
    mockHook.mockReturnValue({
      state: {
        status: "loading",
        results: [],
        history: {},
        monitorActive: false,
        lastUpdated: null,
      },
      startPing: vi.fn(),
      toggleMonitor: vi.fn(),
      clearHistory: vi.fn(),
    });

    render(<PingPanel />);

    expect(
      screen.getByRole("status", { name: /measuring latency/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/results/i)).toHaveAttribute(
      "aria-busy",
      "true",
    );
  });

  it("renders sorted results as rows with exactly one Best mark", () => {
    mockHook.mockReturnValue({
      state: {
        status: "results",
        results: sortedResults,
        history: {},
        monitorActive: false,
        lastUpdated: null,
      },
      startPing: vi.fn(),
      toggleMonitor: vi.fn(),
      clearHistory: vi.fn(),
    });

    render(<PingPanel />);

    const resultsRegion = screen.getByLabelText("Ping results");
    const rows = within(resultsRegion).getAllByRole("listitem");
    expect(rows).toHaveLength(3);
    expect(screen.getAllByText("Best")).toHaveLength(1);
    // best row is the first (lowest latency) — Best label sits in the first row
    expect(rows[0]).toHaveTextContent("NA");
    // failed region shows its error state, not a latency
    expect(rows[2]).toHaveTextContent(/unreachable|timed out|blocked/i);
  });

  it("announces an all-failed run instead of rendering rows", () => {
    mockHook.mockReturnValue({
      state: {
        status: "error",
        results: [makeResult(makeRegion("CN"), null)],
        history: {},
        monitorActive: false,
        lastUpdated: null,
      },
      startPing: vi.fn(),
      toggleMonitor: vi.fn(),
      clearHistory: vi.fn(),
    });

    render(<PingPanel />);

    const resultsRegion = screen.getByLabelText("Ping results");
    expect(within(resultsRegion).queryAllByRole("listitem")).toHaveLength(0);
    expect(within(resultsRegion).getByRole("status")).toHaveTextContent(
      /couldn.t reach|unreachable/i,
    );
  });

  it("toggles the monitor from the panel toggle", () => {
    const toggleMonitor = vi.fn();
    mockHook.mockReturnValue({
      state: {
        status: "idle",
        results: [],
        history: {},
        monitorActive: false,
        lastUpdated: null,
      },
      startPing: vi.fn(),
      toggleMonitor,
      clearHistory: vi.fn(),
    });

    render(<PingPanel />);
    fireEvent.click(screen.getByRole("button", { name: /start monitoring/i }));

    expect(toggleMonitor).toHaveBeenCalledTimes(1);
  });
});
