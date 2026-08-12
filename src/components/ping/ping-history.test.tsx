import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { sparklinePoints } from "@/lib/sparkline";
import { REGIONS } from "@/lib/regions";
import type { HistoryEntry } from "@/types/ping";

import { PingHistory } from "./ping-history";

function entries(latencies: number[]): HistoryEntry[] {
  return latencies.map((latencyMs, index) => ({
    latencyMs,
    timestamp: index * 1000,
  }));
}

describe("sparklinePoints", () => {
  it("builds two points spanning the full width for two entries", () => {
    const points = sparklinePoints(entries([100, 200]), 100, 24);

    const coords = points.split(" ").map((p) => p.split(",").map(Number));
    expect(coords).toHaveLength(2);
    expect(coords[0]?.[0]).toBe(0); // first point at x=0
    expect(coords[1]?.[0]).toBe(100); // last point at x=width
  });

  it("plots higher latency lower on the chart (inverted y)", () => {
    const points = sparklinePoints(entries([100, 200]), 100, 24);
    const [first, last] = points
      .split(" ")
      .map((p) => p.split(",").map(Number));

    // Lower latency (100) must have a SMALLER y than higher latency (200).
    expect(last?.[1]).toBeGreaterThan(first?.[1] ?? 0);
  });

  it("spaces three entries evenly", () => {
    const points = sparklinePoints(entries([100, 150, 200]), 100, 24);
    const xs = points.split(" ").map((p) => Number(p.split(",")[0]));

    expect(xs).toEqual([0, 50, 100]);
  });

  it("returns empty for fewer than two entries", () => {
    expect(sparklinePoints(entries([100]), 100, 24)).toBe("");
  });
});

describe("PingHistory", () => {
  // Every region has a trend except EUW, which only has one entry.
  const history = Object.fromEntries(
    REGIONS.map((region) => [
      region.code,
      region.code === "EUW" ? entries([200]) : entries([100, 120, 90]),
    ]),
  );

  it("renders a sparkline with an accessible trend name for regions with 2+ entries", () => {
    render(<PingHistory history={history} />);

    expect(
      screen.getByRole("img", { name: /ping trend for north america/i }),
    ).toBeInTheDocument();
  });

  it("shows a placeholder instead of a sparkline for regions with <2 entries", () => {
    render(<PingHistory history={history} />);

    expect(screen.getByText(/no history yet/i)).toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: /ping trend for eu west/i }),
    ).not.toBeInTheDocument();
  });

  it("renders one trend area per region with enough data", () => {
    render(<PingHistory history={history} />);

    // 10 regions total, EUW excluded for lacking data.
    expect(screen.getAllByRole("img", { name: /ping trend/i })).toHaveLength(
      REGIONS.length - 1,
    );
    expect(screen.getAllByText(/no history yet/i)).toHaveLength(1);
  });
});
