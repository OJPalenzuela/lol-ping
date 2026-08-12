import type { Metadata } from "next";
import { Chakra_Petch, Geist } from "next/font/google";

import { SITE } from "@/lib/seo";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const chakraPetch = Chakra_Petch({
  variable: "--font-chakra",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const pageTitle = "LoL Ping Test — Check Your League of Legends Ping";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: pageTitle,
    template: "%s | LoL Ping Test",
  },
  description: SITE.description,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE.name,
    title: pageTitle,
    description: SITE.description,
    locale: SITE.locale,
  },
  twitter: {
    card: "summary",
    title: pageTitle,
    description: SITE.description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${chakraPetch.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
