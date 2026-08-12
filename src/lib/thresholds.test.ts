import { describe, expect, it } from "vitest";

import { classifyLatency } from "./thresholds";

describe("classifyLatency", () => {
  it("classifies 99ms as green (below 100)", () => {
    expect(classifyLatency(99)).toBe("green");
  });

  it("classifies 100ms as yellow (boundary inclusive of 100)", () => {
    expect(classifyLatency(100)).toBe("yellow");
  });

  it("classifies 199ms as yellow (below 200)", () => {
    expect(classifyLatency(199)).toBe("yellow");
  });

  it("classifies 200ms as orange (boundary inclusive of 200)", () => {
    expect(classifyLatency(200)).toBe("orange");
  });

  it("classifies 299ms as orange (below 300)", () => {
    expect(classifyLatency(299)).toBe("orange");
  });

  it("classifies 300ms as red (boundary inclusive of 300)", () => {
    expect(classifyLatency(300)).toBe("red");
  });

  it("classifies 0ms as green (minimum boundary)", () => {
    expect(classifyLatency(0)).toBe("green");
  });
});
