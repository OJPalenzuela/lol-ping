import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { HistoryEntry, PingResult, Region } from "@/types/ping";

import { PingRow } from "./ping-row";

function makeRegion(code: string, name: string): Region {
  return {
    code,
    name,
    flag: "🏳️",
    endpoint: `https://${code.toLowerCase()}.test/ping`,
  };
}

function makeResult(
  region: Region,
  latencyMs: number | null,
  failure?: PingResult["failure"],
): PingResult {
  return {
    region,
    latencyMs,
    attempts: latencyMs === null ? [] : [latencyMs],
    failure,
  };
}

const NA = makeRegion("NA", "North America");
const EUW = makeRegion("EUW", "EU West");

const history: HistoryEntry[] = [];

describe("PingRow", () => {
  it("renders rank, flag, region name and the latency badge for a success", () => {
    render(
      <PingRow
        result={makeResult(NA, 80)}
        history={history}
        isBest={false}
        rank={1}
      />,
    );

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("North America")).toBeInTheDocument();
    expect(screen.getByText("80 ms")).toBeInTheDocument();
  });

  it("renders the error state for a failed region instead of a latency", () => {
    render(
      <PingRow
        result={makeResult(EUW, null, "timeout")}
        history={history}
        isBest={false}
        rank={2}
      />,
    );

    expect(screen.getByText("EU West")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/timed out/i);
    expect(screen.queryByText(/ms$/)).not.toBeInTheDocument();
  });

  it("visibly marks exactly the best region with a Best label", () => {
    render(
      <div>
        <PingRow
          result={makeResult(NA, 80)}
          history={history}
          isBest
          rank={1}
        />
        <PingRow
          result={makeResult(EUW, 120)}
          history={history}
          isBest={false}
          rank={2}
        />
      </div>,
    );

    const best = screen.getByText("Best");
    expect(best).toBeInTheDocument();
    expect(best.closest("li")).toHaveTextContent("North America");
    // only one Best label for the whole list
    expect(screen.getAllByText("Best")).toHaveLength(1);
  });
});
