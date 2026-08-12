import type { Metadata } from "next";
import Link from "next/link";

import { SITE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "How to Reduce LoL Ping — 8 Tips That Work",
  description:
    "Practical tips to lower your League of Legends ping: wired connection, server selection, closing background apps, VPN configuration, ISP optimization, and more.",
  alternates: { canonical: "/improve-ping" },
  openGraph: {
    title: "How to Reduce LoL Ping — 8 Tips That Work | LoL Ping Test",
    description:
      "Practical tips to lower your League of Legends ping: wired connection, server selection, closing background apps, VPN configuration, and more.",
    url: "/improve-ping",
  },
};

const TIPS = [
  {
    title: "Use a wired Ethernet connection",
    body: "Wi-Fi introduces jitter and packet loss that can spike your ping unpredictably. An Ethernet cable provides a stable, low-latency connection. If you must use Wi-Fi, sit as close to the router as possible and use 5 GHz instead of 2.4 GHz.",
  },
  {
    title: "Play on the closest regional server",
    body: "Data travels at roughly 200 km per millisecond through fiber. The farther the server, the higher your baseline ping. Use our tool to find which server gives you the lowest latency and queue there — even if your friends play elsewhere, your gameplay experience will be better.",
  },
  {
    title: "Close bandwidth-heavy applications",
    body: "Streaming video (Netflix, Twitch, YouTube), large downloads, cloud backups, and torrents consume bandwidth and create bufferbloat on your router. Close them before queueing for ranked games. Even background apps like Discord screen sharing can add 10–30 ms.",
  },
  {
    title: "Check for VPN or proxy interference",
    body: "VPNs reroute your traffic through an extra server, often adding 20–100 ms or more. Disable your VPN before playing, or switch to a gaming-optimized VPN with a server close to your game region. Some corporate VPNs and school proxies also throttle gaming traffic.",
  },
  {
    title: "Restart your router and modem regularly",
    body: "Consumer routers accumulate buffer bloat and routing table errors over weeks of uptime. A weekly restart clears these issues and can recover 10–20 ms of degraded latency. Power-cycle both your modem and router — unplug for 30 seconds, then plug back in.",
  },
  {
    title: "Optimize your DNS settings",
    body: "Your ISP's default DNS servers may be slow or geographically distant. Switching to Cloudflare (1.1.1.1), Google (8.8.8.8), or Quad9 (9.9.9.9) can reduce the initial connection time to Riot's servers. DNS does not affect in-game ping directly, but it speeds up login and matchmaking.",
  },
  {
    title: "Enable Quality of Service (QoS) on your router",
    body: "QoS prioritizes gaming traffic over other devices on your network. If someone else is streaming or downloading while you play, QoS ensures your LoL packets get priority. Most modern routers have a QoS or 'Game Mode' setting in the admin panel.",
  },
  {
    title: "Contact your ISP about routing issues",
    body: "If your ping is consistently higher than expected for your distance to the server, your ISP may be routing traffic inefficiently. Run a traceroute (tracert on Windows) to the game server and contact your ISP with the results. Some ISPs can optimize your route on request.",
  },
];

export default function ImprovePingPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">
          How to Reduce Your LoL Ping — 8 Tips
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base leading-7">
          High ping in League of Legends is frustrating — input delay, missed
          skillshots, and losing trades you should have won. Here are eight
          practical, proven ways to lower your latency and get back to climbing.
        </p>
      </header>

      <ol className="flex flex-col gap-6">
        {TIPS.map((tip, index) => (
          <li key={index} className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold">
              {index + 1}. {tip.title}
            </h2>
            <p className="text-muted-foreground leading-7">{tip.body}</p>
          </li>
        ))}
      </ol>

      <footer className="text-muted-foreground border-border border-t pt-6 text-sm">
        <Link href="/" className="text-gold hover:underline">
          ← Back to {SITE.name}
        </Link>
      </footer>
    </main>
  );
}
