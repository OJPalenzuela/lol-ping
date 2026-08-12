import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { FAQ_ITEMS } from "@/lib/seo";

import Home from "./page";

describe("Home page shell", () => {
  it("renders exactly one H1", () => {
    const html = renderToString(<Home />);
    expect(html.match(/<h1/g)).toHaveLength(1);
  });

  it("renders the methodology description in the ping panel", () => {
    const html = renderToString(<Home />);

    expect(html).toContain("pings all 10 regional AWS endpoints");
    expect(html).toContain("median latency per region");
  });

  it("embeds WebApplication and FAQPage JSON-LD", () => {
    const html = renderToString(<Home />);

    expect(html).toContain('"@type":"WebApplication"');
    expect(html).toContain('"@type":"FAQPage"');
  });

  it("shows every FAQ item visibly (JSON-LD parity)", () => {
    const html = renderToString(<Home />);

    for (const item of FAQ_ITEMS) {
      expect(html).toContain(item.question);
      expect(html).toContain(item.answer);
    }
  });

  it("embeds the ping panel", () => {
    const html = renderToString(<Home />);

    expect(html).toContain("Test your ping");
  });
});
