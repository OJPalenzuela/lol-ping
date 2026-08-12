import { describe, expect, it } from "vitest";

import { SITE } from "@/lib/seo";

import robots from "./robots";
import sitemap from "./sitemap";

describe("sitemap", () => {
  it("serves the homepage with the configured base URL", () => {
    const entries = sitemap();

    expect(entries).toHaveLength(1);
    expect(entries[0]?.url).toBe(SITE.url);
  });
});

describe("robots", () => {
  it("allows crawling and references the sitemap", () => {
    const config = robots();

    expect(config.rules).toEqual({ userAgent: "*", allow: "/" });
    expect(config.sitemap).toBe(`${SITE.url}/sitemap.xml`);
  });
});
