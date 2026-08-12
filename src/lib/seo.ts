export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Site-wide config. The domain is a placeholder — swapping it here updates
 * canonical, OG, Twitter, sitemap, robots and JSON-LD references.
 */
export const SITE = {
  name: "LoL Ping Test",
  description:
    "Check your League of Legends ping to all 10 regional servers, compare latency, find the best server for you, and monitor your connection.",
  url: "https://lol-ping-op.vercel.app",
  locale: "en_US",
} as const;

/** Full home-page title (root layout and root page share the same segment,
 *  so the layout's title template does not apply to it). */
export const PAGE_TITLE = "LoL Ping Test — Check Your League of Legends Ping";

/** Visible FAQ — the single source of truth for the FAQPage JSON-LD parity. */
export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "What is a good ping for League of Legends?",
    answer:
      "Under 100ms is excellent, 100–200ms is playable for most champions, and above 200ms you will notice input lag. Above 300ms, ranked play becomes very difficult.",
  },
  {
    question: "How can I lower my LoL ping?",
    answer:
      "Play on the regional server closest to you, use a wired connection instead of Wi-Fi, close bandwidth-heavy apps, and check that no VPN or proxy is rerouting your traffic.",
  },
  {
    question: "Which LoL server should I play on?",
    answer:
      "Run the test above and play on the region with the lowest median latency — that is almost always the best experience regardless of which server your friends use.",
  },
];

/** Canonical URL for a path, always derived from the configured site base. */
export function canonicalUrl(path: string): string {
  return `${SITE.url}${path}`;
}

export function webApplicationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    applicationCategory: "GameApplication",
    operatingSystem: "Any",
    inLanguage: "en",
  };
}

export function faqPageJsonLd(faqs: FaqItem[] = FAQ_ITEMS) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
