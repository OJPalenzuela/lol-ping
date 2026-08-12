import type { MetadataRoute } from "next";

import { SITE } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE.url,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
