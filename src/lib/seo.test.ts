import { describe, expect, it } from "vitest";

import {
  FAQ_ITEMS,
  SITE,
  canonicalUrl,
  faqPageJsonLd,
  webApplicationJsonLd,
} from "./seo";

describe("SITE config", () => {
  it("exposes a single configurable base URL", () => {
    expect(SITE.url).toMatch(/^https:\/\/.+/);
  });

  it("derives canonical URLs from the site base", () => {
    expect(canonicalUrl("/")).toBe(`${SITE.url}/`);
    expect(canonicalUrl("/sitemap.xml")).toBe(`${SITE.url}/sitemap.xml`);
  });
});

describe("webApplicationJsonLd", () => {
  it("builds a WebApplication block from the site config", () => {
    const jsonLd = webApplicationJsonLd();

    expect(jsonLd["@type"]).toBe("WebApplication");
    expect(jsonLd.name).toBe(SITE.name);
    expect(jsonLd.url).toBe(SITE.url);
    expect(jsonLd.applicationCategory).toBe("GameApplication");
  });
});

describe("faqPageJsonLd", () => {
  it("mirrors every FAQ item as a question/answer pair", () => {
    const jsonLd = faqPageJsonLd();

    expect(jsonLd.mainEntity).toHaveLength(FAQ_ITEMS.length);
    for (const [index, item] of FAQ_ITEMS.entries()) {
      expect(jsonLd.mainEntity[index]?.name).toBe(item.question);
      expect(jsonLd.mainEntity[index]?.acceptedAnswer.text).toBe(item.answer);
    }
  });

  it("keeps at least three real FAQ items with non-empty answers", () => {
    expect(FAQ_ITEMS.length).toBeGreaterThanOrEqual(3);
    for (const item of FAQ_ITEMS) {
      expect(item.question.length).toBeGreaterThan(0);
      expect(item.answer.length).toBeGreaterThan(20);
    }
  });
});
