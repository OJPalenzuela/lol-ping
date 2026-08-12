import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MonitorToggle } from "./monitor-toggle";

describe("MonitorToggle", () => {
  it("offers to start monitoring when idle, with a text label and icon", () => {
    render(<MonitorToggle active={false} paused={false} onToggle={vi.fn()} />);

    const button = screen.getByRole("button", { name: /start monitoring/i });
    expect(button).toHaveAttribute("aria-pressed", "false");
  });

  it("offers to stop monitoring while running", () => {
    render(<MonitorToggle active paused={false} onToggle={vi.fn()} />);

    const button = screen.getByRole("button", { name: /stop monitoring/i });
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("shows the paused state while the tab is hidden", () => {
    render(<MonitorToggle active paused onToggle={vi.fn()} />);

    expect(screen.getByRole("button", { name: /paused/i })).toBeInTheDocument();
  });

  it("fires onToggle on click", () => {
    const onToggle = vi.fn();
    render(<MonitorToggle active={false} paused={false} onToggle={onToggle} />);

    fireEvent.click(screen.getByRole("button", { name: /start monitoring/i }));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
