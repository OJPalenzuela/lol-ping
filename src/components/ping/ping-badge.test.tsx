import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { PingResult, Region } from "@/types/ping";

import { PingBadge } from "./ping-badge";

function makeResult(latencyMs: number): PingResult {
  const region: Region = {
    code: "NA",
    name: "North America",
    flag: "🇺🇸",
    endpoint: "https://example.test/ping",
  };
  return { region, latencyMs, attempts: [latencyMs] };
}

describe("PingBadge", () => {
  it("shows the latency in milliseconds with tabular numerals", () => {
    render(<PingBadge result={makeResult(99)} />);
    expect(screen.getByText("99 ms")).toBeInTheDocument();
  });

  it("shows a text label alongside the color for every tier (never color-only)", () => {
    const { rerender } = render(<PingBadge result={makeResult(99)} />);
    expect(screen.getByText("Excellent")).toBeInTheDocument();

    rerender(<PingBadge result={makeResult(150)} />);
    expect(screen.getByText("Good")).toBeInTheDocument();

    rerender(<PingBadge result={makeResult(250)} />);
    expect(screen.getByText("Fair")).toBeInTheDocument();

    rerender(<PingBadge result={makeResult(300)} />);
    expect(screen.getByText("Poor")).toBeInTheDocument();
  });

  it("groups latency and tier label in one badge", () => {
    render(<PingBadge result={makeResult(300)} />);
    const badge = screen.getByText("300 ms").parentElement;
    expect(badge).toHaveTextContent("300 ms");
    expect(badge).toHaveTextContent("Poor");
  });

  it("renders an em dash for a region without a measurement", () => {
    const failed: PingResult = {
      region: { ...makeResult(0).region },
      latencyMs: null,
      attempts: [],
      failure: "timeout",
    };
    render(<PingBadge result={failed} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
