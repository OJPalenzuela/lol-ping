import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { FAQ_ITEMS } from "@/lib/seo";
import { REGIONS } from "@/lib/regions";

import Home from "./page";

describe("Home page shell", () => {
  it("renders exactly one H1", () => {
    const html = renderToString(<Home />);
    expect(html.match(/<h1/g)).toHaveLength(1);
  });

  it("renders one H2 per region with the region name", () => {
    const html = renderToString(<Home />);

    for (const region of REGIONS) {
      // region names are rendered inside h2 elements
      expect(html).toMatch(
        new RegExp(`<h2[^>]*>.*${region.name.replace(/&/g, "&amp;")}`),
      );
    }
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
