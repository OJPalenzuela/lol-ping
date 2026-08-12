import type { Metadata } from "next";

import { PingPanel } from "@/components/ping/ping-panel";
import {
  FAQ_ITEMS,
  PAGE_TITLE,
  SITE,
  faqPageJsonLd,
  webApplicationJsonLd,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: SITE.description,
};

const METHODOLOGY =
  "Your browser pings all 10 regional AWS endpoints in parallel, three times each, and reports the median latency per region. Nothing is installed and no data leaves your browser except the ping requests themselves.";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-4 py-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
          LoL Ping Test — Check Your League of Legends Ping
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base leading-7">
          {SITE.description}
        </p>
      </header>

      <PingPanel description={METHODOLOGY} />

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
