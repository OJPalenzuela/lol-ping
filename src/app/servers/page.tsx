import type { Metadata } from "next";
import Link from "next/link";

import { REGION_GUIDES } from "@/lib/server-guides";
import { SITE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "LoL Server Guide — All 10 Regions",
  description:
    "Complete guide to every League of Legends server region: locations, best ping targets, and which server you should play on. Compare latency for NA, EUW, KR, and more.",
  alternates: { canonical: "/servers" },
  openGraph: {
    title: "LoL Server Guide — All 10 Regions | LoL Ping Test",
    description:
      "Complete guide to every League of Legends server region: locations, best ping targets, and which server you should play on.",
    url: "/servers",
  },
};

export default function ServersPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
          LoL Server Guide — All 10 Regions
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base leading-7">
          League of Legends operates 10 regional servers worldwide. Each server
          is hosted in a different city and provides the lowest ping to players
          in its geographic region. Use this guide to understand where each
          server is, who it serves, and what ping to expect.
        </p>
      </header>

      <nav aria-label="Server list" className="flex flex-col gap-6">
        {REGION_GUIDES.map((region) => (
          <section
            key={region.code}
            aria-labelledby={`region-${region.code}`}
            className="flex flex-col gap-3"
          >
            <h2 id={`region-${region.code}`} className="text-xl font-semibold">
              {region.flag} {region.name} ({region.code}) Server
            </h2>
            <dl className="border-border bg-card grid grid-cols-1 gap-3 rounded-lg border p-5 sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Location
                </dt>
                <dd className="text-sm">{region.location}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Best for
                </dt>
                <dd className="text-sm">{region.bestFor}</dd>
              </div>
            </dl>
          </section>
        ))}
      </nav>

      <footer className="text-muted-foreground border-border border-t pt-6 text-sm">
        <Link href="/" className="text-gold hover:underline">
          ← Back to {SITE.name}
        </Link>
      </footer>
    </main>
  );
}
