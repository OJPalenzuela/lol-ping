import type { MetadataRoute } from "next";

import { SITE } from "@/lib/seo";

const SEO_PAGES = [
  { path: "/servers", priority: 0.9 },
  { path: "/methodology", priority: 0.8 },
  { path: "/improve-ping", priority: 0.8 },
  { path: "/compare", priority: 0.7 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [
    {
      url: SITE.url,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...SEO_PAGES.map(({ path, priority }) => ({
      url: `${SITE.url}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority,
    })),
  ];

  return entries;
}
