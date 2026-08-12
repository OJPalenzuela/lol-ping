import { ImageResponse } from "next/og";

import { SITE } from "@/lib/seo";

export const runtime = "edge";
export const alt = SITE.description;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NA_ENDPOINT = "https://dynamodb.us-east-2.amazonaws.com/ping";
const PING_TIMEOUT_MS = 4000;

async function pingNA(): Promise<number | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
  try {
    const start = Date.now();
    const res = await fetch(NA_ENDPOINT, {
      signal: controller.signal,
      cache: "no-store",
    });
    const end = Date.now();
    if (res.ok) return end - start;
  } catch {
    // timeout or network error — return null
  } finally {
    clearTimeout(timeout);
  }
  return null;
}

export default async function Image() {
  const ping = await pingNA();

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, #0a0e1a 0%, #141b2d 100%)",
        color: "#e8e6e3",
        fontFamily: "system-ui, sans-serif",
        padding: 64,
      }}
    >
      {/* LoL gold accent line */}
      <div
        style={{
          display: "flex",
          width: 80,
          height: 4,
          borderRadius: 2,
          background: "#c8aa6e",
          marginBottom: 40,
        }}
      />

      <div
        style={{
          display: "flex",
          fontSize: 56,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: "#e8e6e3",
          marginBottom: 16,
        }}
      >
        LoL Ping Test
      </div>

      <div
        style={{
          display: "flex",
          fontSize: 24,
          color: "#8b8a8d",
          maxWidth: 640,
          textAlign: "center",
          marginBottom: 48,
        }}
      >
        Check your League of Legends ping to all 10 regions
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 32px",
          borderRadius: 9999,
          border: "2px solid rgba(200, 170, 110, 0.4)",
          background: "rgba(200, 170, 110, 0.08)",
        }}
      >
        <span style={{ fontSize: 20, color: "#8b8a8d" }}>NA ping</span>
        <span
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: ping !== null ? "#c8aa6e" : "#d63031",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {ping !== null ? `${ping} ms` : "—"}
        </span>
      </div>
    </div>,
    { ...size },
  );
}
