import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { Region } from "@/types/ping";

import { PingError } from "./ping-error";

const region: Region = {
  code: "NA",
  name: "North America",
  flag: "🇺🇸",
  endpoint: "https://example.test/ping",
};

describe("PingError", () => {
  it("labels a timeout distinctly from a tool failure", () => {
    render(<PingError failure="timeout" region={region} />);
    expect(screen.getByText("Timed out")).toBeInTheDocument();
  });

  it("labels a CN timeout as expected outside China", () => {
    render(<PingError failure="timeout" region={{ ...region, code: "CN" }} />);
    expect(screen.getByText(/expected outside China/i)).toBeInTheDocument();
  });

  it("explains a network failure", () => {
    render(<PingError failure="network" region={region} />);
    expect(screen.getByRole("status")).toHaveTextContent(
      /check your connection/i,
    );
  });

  it("explains a blocked request (ad blocker / policy)", () => {
    render(<PingError failure="blocked" region={region} />);
    expect(screen.getByRole("status")).toHaveTextContent(/ad blocker/i);
  });

  it("names the affected region", () => {
    render(<PingError failure="timeout" region={region} />);
    expect(screen.getByRole("status")).toHaveTextContent(/North America/i);
  });
});
