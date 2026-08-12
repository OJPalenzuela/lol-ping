import Link from "next/link";

import { SITE } from "@/lib/seo";

const NAV_LINKS = [
  { href: "/servers", label: "Server Guide" },
  { href: "/methodology", label: "Methodology" },
  { href: "/improve-ping", label: "Reduce Ping" },
  { href: "/compare", label: "Compare Tools" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-border bg-card mt-auto border-t">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <Link
            href="/"
            className="hover:text-gold text-sm font-semibold transition-colors"
          >
            {SITE.name}
          </Link>
          <p className="text-muted-foreground text-xs">{SITE.description}</p>
        </div>

        <nav aria-label="Site pages" className="flex flex-wrap gap-x-6 gap-y-2">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
