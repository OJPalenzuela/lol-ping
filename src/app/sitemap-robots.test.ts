import { describe, expect, it } from "vitest";

import { SITE } from "@/lib/seo";

import robots from "./robots";
import sitemap from "./sitemap";

describe("sitemap", () => {
  it("includes the homepage and all SEO content pages", () => {
    const entries = sitemap();

    expect(entries).toHaveLength(5);
    expect(entries[0]?.url).toBe(SITE.url);
    expect(entries[0]?.priority).toBe(1);

    const paths = entries.map((e) => new URL(e.url).pathname);
    expect(paths).toContain("/");
    expect(paths).toContain("/servers");
    expect(paths).toContain("/methodology");
    expect(paths).toContain("/improve-ping");
    expect(paths).toContain("/compare");
  });
});

describe("robots", () => {
  it("allows crawling and references the sitemap", () => {
    const config = robots();

    expect(config.rules).toEqual({ userAgent: "*", allow: "/" });
    expect(config.sitemap).toBe(`${SITE.url}/sitemap.xml`);
  });
});
