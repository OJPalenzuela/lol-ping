import type { Metadata } from "next";
import Link from "next/link";

import { SITE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "How Our LoL Ping Test Works — Methodology",
  description:
    "Learn how our League of Legends ping tool measures latency to all 10 regional servers using AWS DynamoDB endpoints. Three attempts per region, median calculation, real browser measurements.",
  alternates: { canonical: "/methodology" },
  openGraph: {
    title: "How Our LoL Ping Test Works — Methodology | LoL Ping Test",
    description:
      "Learn how our League of Legends ping tool measures latency to all 10 regional servers using AWS DynamoDB endpoints.",
    url: "/methodology",
  },
};

export default function MethodologyPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
          How Our LoL Ping Test Works
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base leading-7">
          We built the most accurate browser-based League of Legends ping test.
          Here is exactly how it measures your latency to every LoL server.
        </p>
      </header>

      <section className="flex flex-col gap-5">
        <h2 className="text-xl font-semibold">Why AWS DynamoDB Endpoints?</h2>
        <p className="text-muted-foreground leading-7">
          Riot Games hosts League of Legends on Amazon Web Services (AWS). Each
          regional server runs in a different AWS region — NA in us-east-2
          (Ohio), EUW in eu-west-2 (London), KR in ap-northeast-2 (Seoul), and
          so on. Instead of requiring a game client, we ping the AWS DynamoDB
          health-check endpoint in each region. DynamoDB is a core AWS service,
          so its response time correlates strongly with game server latency on
          the same infrastructure.
        </p>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-xl font-semibold">Three Attempts Per Region</h2>
        <p className="text-muted-foreground leading-7">
          A single ping can be an outlier — a momentary spike in your home
          network, a brief router hiccup, or random jitter. We run three
          independent requests to each regional endpoint in parallel using{" "}
          <code className="bg-card text-gold rounded px-1.5 py-0.5 text-sm">
            Promise.allSettled
          </code>
          , measure the round-trip time with{" "}
          <code className="bg-card text-gold rounded px-1.5 py-0.5 text-sm">
            performance.now()
          </code>
          , and report the <strong>median</strong>. The median filters out
          outliers — a single slow attempt does not distort your result.
        </p>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-xl font-semibold">Parallel, Independent Pings</h2>
        <p className="text-muted-foreground leading-7">
          All 10 regions are measured simultaneously — 30 requests in total (3
          per region × 10 regions). Each request has a 4-second timeout via the
          AbortController API, so one unresponsive region (like China for
          players outside Asia) never blocks the rest. Results appear as soon as
          the last region responds, sorted from lowest to highest latency.
        </p>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-xl font-semibold">Pure Browser Measurements</h2>
        <p className="text-muted-foreground leading-7">
          Every ping runs directly from your browser to the AWS endpoint. There
          is no proxy, no intermediary server, no VPN — the latency you see is
          the real round-trip time from your device to the game server region.
          No data leaves your browser except the ping requests themselves. We do
          not track, store, or transmit your results to any server.
        </p>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-xl font-semibold">Latency Classification</h2>
        <p className="text-muted-foreground leading-7">
          We color-code your results so you can instantly spot which servers are
          playable. Every badge includes an icon and a text label — never
          color-only, fully accessible.
        </p>
        <ul className="flex flex-col gap-3">
          <li className="flex items-center gap-3">
            <span className="bg-tier-green/10 text-tier-green border-tier-green/30 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium">
              Under 100 ms
            </span>
            <span className="text-muted-foreground text-sm">
              Excellent — responsive, ideal for ranked play and mechanical
              champions
            </span>
          </li>
          <li className="flex items-center gap-3">
            <span className="bg-tier-yellow/10 text-tier-yellow border-tier-yellow/30 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium">
              100–199 ms
            </span>
            <span className="text-muted-foreground text-sm">
              Good — playable for most champions, slight input delay
            </span>
          </li>
          <li className="flex items-center gap-3">
            <span className="bg-tier-orange/10 text-tier-orange border-tier-orange/30 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium">
              200–299 ms
            </span>
            <span className="text-muted-foreground text-sm">
              Fair — noticeable lag, avoid mechanically intensive champions
            </span>
          </li>
          <li className="flex items-center gap-3">
            <span className="bg-tier-red/10 text-tier-red border-tier-red/30 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium">
              300 ms and above
            </span>
            <span className="text-muted-foreground text-sm">
              Poor — ranked play becomes very difficult, significant input lag
            </span>
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="text-xl font-semibold">History and Trends</h2>
        <p className="text-muted-foreground leading-7">
          The inline sparkline in each server row shows your ping trend over the
          last 30 measurements, stored locally in your browser via localStorage.
          Your history never leaves your device and resets when you clear
          browser data.
        </p>
      </section>

      <footer className="text-muted-foreground border-border border-t pt-6 text-sm">
        <Link href="/" className="text-gold hover:underline">
          ← Back to {SITE.name}
        </Link>
      </footer>
    </main>
  );
}
