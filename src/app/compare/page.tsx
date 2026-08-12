import type { Metadata } from "next";
import Link from "next/link";

import { SITE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "LoL Ping Test Comparison — Browser vs In-Game vs CLI",
  description:
    "Compare different ways to check your League of Legends ping: browser-based tests, the in-game client, command-line tools, and third-party apps. Find the most accurate method.",
  alternates: { canonical: "/compare" },
  openGraph: {
    title:
      "LoL Ping Test Comparison — Browser vs In-Game vs CLI | LoL Ping Test",
    description:
      "Compare different ways to check your League of Legends ping: browser-based tests, the in-game client, command-line tools, and third-party apps.",
    url: "/compare",
  },
};

const METHODS = [
  {
    name: "Browser-based ping test (this tool)",
    accuracy: "High — real round-trip to AWS infrastructure",
    ease: "Instant — no install, no login, works on any device",
    pros: [
      "Measures actual path from your device to Riot's AWS region",
      "All 10 regions in one click, sorted by latency",
      "History and trend sparklines show stability over time",
      "No download, no account, no permissions needed",
    ],
    cons: [
      "Dependent on AWS DynamoDB endpoint availability",
      "China region may be unreachable from outside China",
    ],
  },
  {
    name: "In-game client (Practice Tool)",
    accuracy: "Highest — exact game server latency",
    ease: "Slow — requires launching the game and loading a match",
    pros: [
      "Measures the exact game server, not a proxy",
      "Shows packet loss in addition to ping (Ctrl+F in-game)",
      "No third-party dependencies",
    ],
    cons: [
      "Only works for one region at a time (your account region)",
      "Takes 2–3 minutes to launch and load",
      "Requires full game installation and login",
    ],
  },
  {
    name: "Command-line ping / traceroute",
    accuracy: "Medium — ICMP ping, not game-protocol latency",
    ease: "Technical — requires terminal and server IP addresses",
    pros: [
      "ICMP ping is the lowest-level latency test available",
      "traceroute shows every hop between you and the server",
    ],
    cons: [
      "Many AWS endpoints block ICMP (ping will time out)",
      "Requires knowing the exact game server IP (changes frequently)",
      "No visual comparison across regions",
    ],
  },
  {
    name: "Third-party gaming VPNs (ExitLag, WTFast, etc.)",
    accuracy: "Variable — measures through their proxy network",
    ease: "Install once, runs in background",
    pros: [
      "Can reduce ping through optimized routing",
      "Shows before/after latency comparison",
    ],
    cons: [
      "Monthly subscription cost ($5–15/month)",
      "Adds another point of failure between you and Riot",
      "Not a measurement tool — a routing tool",
    ],
  },
];

export default function ComparePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
          LoL Ping Test Comparison
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base leading-7">
          There are several ways to check your League of Legends ping — each
          with different tradeoffs in accuracy, speed, and convenience. Here is
          how our browser-based tool compares to the alternatives.
        </p>
      </header>

      <div className="flex flex-col gap-6">
        {METHODS.map((method) => (
          <section
            key={method.name}
            className="border-border bg-card rounded-lg border p-5"
          >
            <h2 className="text-lg font-semibold">{method.name}</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Accuracy: {method.accuracy} · Ease: {method.ease}
            </p>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-tier-green text-sm font-semibold">
                  ✅ Pros
                </h3>
                <ul className="text-muted-foreground mt-1 flex list-disc flex-col gap-1 pl-5 text-sm leading-6">
                  {method.pros.map((pro) => (
                    <li key={pro}>{pro}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-tier-red text-sm font-semibold">❌ Cons</h3>
                <ul className="text-muted-foreground mt-1 flex list-disc flex-col gap-1 pl-5 text-sm leading-6">
                  {method.cons.map((con) => (
                    <li key={con}>{con}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ))}
      </div>

      <section className="border-gold/30 bg-gold/[0.04] rounded-lg border p-5">
        <h2 className="text-lg font-semibold">Our recommendation</h2>
        <p className="text-muted-foreground mt-2 leading-7">
          Use our browser-based test for quick, multi-region comparisons before
          deciding where to play. Once you have chosen a server, verify your
          in-game ping in the Practice Tool (Ctrl+F). The browser test is your
          scouting tool — the in-game client is your confirmation.
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
