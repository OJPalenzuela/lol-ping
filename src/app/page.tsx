import type { Metadata } from "next";

import { PingPanel } from "@/components/ping/ping-panel";
import {
  FAQ_ITEMS,
  SITE,
  faqPageJsonLd,
  webApplicationJsonLd,
} from "@/lib/seo";
import { REGIONS } from "@/lib/regions";

export const metadata: Metadata = {
  title: "Check Your League of Legends Ping",
  description: SITE.description,
};

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-10 px-4 py-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
          LoL Ping Test — Check Your League of Legends Ping
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base leading-7">
          {SITE.description} All measurements run in your browser, directly to
          the AWS endpoints that host each region.
        </p>
      </header>

      <PingPanel />

      <section aria-label="All LoL regions" className="flex flex-col gap-4">
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {REGIONS.map((region) => (
            <li
              key={region.code}
              className="border-border bg-card rounded-lg border p-4"
            >
              <h2 className="text-lg font-semibold">
                {region.flag} {region.name} ({region.code}) LoL ping
              </h2>
              <p className="text-muted-foreground mt-1 text-sm leading-6">
                {region.name} game servers are measured via the AWS{" "}
                {region.endpoint
                  .replace(/^https:\/\/dynamodb\./, "")
                  .replace(/\.amazonaws\.com(\.\w+)?\/ping$/, "")}{" "}
                endpoint — the list above sorts servers by your real latency.
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="how-title" className="flex flex-col gap-3">
        <h2 id="how-title" className="text-xl font-semibold">
          How this LoL ping test works
        </h2>
        <p className="text-muted-foreground max-w-2xl text-sm leading-7">
          Your browser pings all 10 regional endpoints in parallel, three times
          each, and reports the median latency per region. Runs time out after 4
          seconds per attempt, so one unreachable region never blocks the rest.
          Nothing is installed and no data leaves your browser except the ping
          requests themselves.
        </p>
      </section>

      <section aria-labelledby="faq-title" className="flex flex-col gap-3">
        <h2 id="faq-title" className="text-xl font-semibold">
          Frequently asked questions
        </h2>
        <ul className="flex flex-col gap-4">
          {FAQ_ITEMS.map((item) => (
            <li key={item.question} className="flex flex-col gap-1">
              <h3 className="text-base font-semibold">{item.question}</h3>
              <p className="text-muted-foreground max-w-2xl text-sm leading-7">
                {item.answer}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webApplicationJsonLd()),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqPageJsonLd(FAQ_ITEMS)),
        }}
      />
    </main>
  );
}
