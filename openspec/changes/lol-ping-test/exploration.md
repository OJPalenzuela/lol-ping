# Exploration: LoL Ping Test

## Current State

- **Project**: Bare Next.js 16.3 App Router starter (`src/`), React 19.2, TypeScript strict, Tailwind CSS 4, pnpm 10.32.1. React Compiler enabled (`reactCompiler: true`). shadcn/ui v4 initialized (Base UI button + `cn()`). Vitest 4 + RTL + jsdom configured, strict TDD on (`pnpm test`). ESLint 9 + Prettier + husky pre-commit. `openspec/config.yaml` present with no specs or changes yet.
- **Page**: `src/app/page.tsx` is the stock Create Next App landing; `layout.tsx` has generic metadata; `globals.css` has the default neutral shadcn theme (oklch vars, dark variant present).
- **Reference (gameserverping.com/lol)**: plain static HTML + vanilla JS, no framework. Server list is in **fixed DOM order (no sort by latency)**; pings continuously every 3 s via a shared `pingManager`; snapshot sharing requires a backend (PHP `POST` + hashkey). SEO is weak: generic title "Ping Test - Check Ping" even on the LoL page, no JSON-LD, no sitemap.

## Feasibility Verification (live-tested)

- All 10 regional DynamoDB `/ping` endpoints respond `200 OK` with `Access-Control-Allow-Origin: *` **when an Origin header is present** (browsers always send one on cross-origin fetch). Verified for: us-east-2, sa-east-1, eu-west-2, eu-central-1, ap-northeast-1, ap-northeast-2, ap-southeast-1, ap-southeast-2, cn-north-1 (.com.cn).
- `GET /ping` with no custom headers is a **simple request → no CORS preflight**, single round trip. (Preflight `OPTIONS` also returns `Access-Control-Allow-Origin: *` if ever needed.)
- Observed latencies from this machine: NA 0.35 s, KR 0.83 s, CN 1.76 s — endpoint choice measurably reflects geography.
- **Conclusion**: pure client-side approach is viable. No backend, API routes, or database required.

## Affected Areas

- `src/app/page.tsx` — replaced with the LoL ping test page (server component shell + SEO content).
- `src/app/layout.tsx` — metadata (title/description/OG/Twitter/JSON-LD), `metadataBase`, lang.
- `src/app/globals.css` — LoL-themed dark design tokens (gold accent, LoL-blue), fonts, latency color scale.
- `src/app/sitemap.ts` + `src/app/robots.ts` — SEO (new files).
- `src/lib/regions.ts` — const region table (server code, name, endpoint) + latency thresholds (new).
- `src/lib/ping.ts` — pure ping logic: `pingEndpoint()` + `runPingTest()` (new; TDD unit target).
- `src/hooks/use-ping-test.ts` — client state machine: idle → running → results (new).
- `src/components/ping/` — client components: test panel, region rows, latency badge, skeleton rows, history (new).
- `src/components/ui/` — add shadcn Card/Skeleton/Badge as needed (button exists).
- Tests: `src/lib/ping.test.ts`, hook/component tests alongside (new).

## Approaches

1. **Pure client-side (recommended)** — fetch to DynamoDB `/ping` from the browser; no backend.
   - Pros: free to host, no ops, instant anywhere, verified CORS, matches reference model; "implacable" reliability ceiling is only the browser + AWS.
   - Cons: results depend on user's location/ISP (inherent to any ping tool); cannot do server-side aggregation; no server-side fallback if AWS changes headers.
   - Effort: Low (core) — the entire app is one page + one lib.

2. **Next.js route handler proxy** — server (Node runtime) pings regions, client fetches `/api/ping`.
   - Pros: bypasses CORS entirely, can add timeouts/retries server-side.
   - Cons: adds a moving part + latency of an extra hop through our server; breaks the "no backend" promise; server egress can be rate-limited; useless if the goal is measuring the _user's_ path to the region (a proxy measures the _server's_ path — wrong measurement).
   - Effort: Low-Med (needs route handler + API tests).
   - Verdict: wrong measurement semantics for a client ping tool. Reject.

3. **Monitor mode (optional v2 feature)** — continuous pinging like the reference.
   - Pros: parity with reference's "open ping monitor" feature.
   - Cons: hammers AWS endpoints; battery/network cost on mobile; scope creep for v1.
   - Effort: Medium. Recommend out of v1 core; revisit as a follow-up change.

## Recommendation

Approach 1: **pure client-side, single page, no backend**. Details:

- **Measurement**: 3 attempts per region in parallel (`Promise.allSettled`), `performance.now()` delta around `fetch(url, { cache: "no-store" })`, `AbortController` timeout (~4 s). Display **median** of successful attempts; show `—`/`Timeout`/`Error` states distinctly.
- **Sorting**: results auto-sorted ascending by latency; highlight best server (crown badge + accent row). This is the headline differentiator vs the reference (their list is fixed-order).
- **State**: custom `use-ping-test` hook (useState/useReducer only — React 19, no manual memoization, compiler on). No external state library (YAGNI for one page).
- **History**: localStorage (try/catch for private mode), last ~50 timestamped results per region, hand-rolled ~30-line SVG sparkline in the row. Hydration-safe: read in effect after mount only.
- **Design** (frontend-design skill): commit to a dark "Summoner's Rift" aesthetic — near-black blue background, LoL gold (`#C8AA6E`-family) accent, distinctive display font (e.g. Chakra Petch/Rajdhani family) + refined body, tabular-nums for latency digits (zero CLS), staggered row reveal as results land, shimmer skeletons, `prefers-reduced-motion` respected.
- **Latency coding**: <50 green, 50–100 yellow, 100–150 orange, >150 red — conveyed by color **plus** icon/text (WCAG: never color-only), contrast-safe on dark bg, 4.5:1 minimum.
- **Accessibility (WCAG 2.2)**: single h1, region list semantics, `aria-live="polite"` results region, `aria-busy` while testing, 44 px tap targets, full keyboard support, focus-visible rings (already in shadcn button).
- **SEO (seo skill)**: root `/` page targets "lol ping test". Title ~55 chars, meta description 150–160, canonical, OG + Twitter, `sitemap.ts`, `robots.ts`, `metadataBase`. JSON-LD: `WebApplication` + `FAQPage` (visible FAQ: what is good LoL ping, how to lower it, which server is closest). On-page H2 sections per region + "How it works" methodology section (E-E-A-T). Server-rendered static content — SEO content is RSC, only the tester is a client island.
- **Testing (strict TDD)**: `ping.ts` unit tests (success/timeout/network-fail/median/sort via mocked fetch, jsdom), hook + component integration tests (skeleton shown while running, sorted render, aria-live updates, localStorage persistence).

## Risks

- **AWS changes DynamoDB `/ping` CORS/behavior** — the whole app's data source is one undocumented endpoint. Mitigation: single `regions.ts` + `ping.ts` abstraction so swapping measurement targets is a one-file change; monitor upstream behavior.
- **CN endpoint unreachable outside China / .com.cn routing** — likely shows Timeout for most non-CN users; that is _correct_ behavior (they can't play CN), but must be labeled clearly, not presented as failure of the tool.
- **Rate limiting / ToS etiquette** — on-demand pings only in v1 (unlike reference's 3 s loop); no hammering.
- **Ad blockers / corporate proxies** may block AWS endpoints — graceful Error state with explanation.
- **Hydration mismatch** from localStorage — read only in effects; deterministic initial render.
- **Unknown production domain** — metadata/sitemap need a real domain; proposal must ask the user (placeholder `https://lol-ping.example` until then).
- **Fake-rank temptation** — do NOT add fabricated `aggregateRating` rich results; Google penalizes. Rank via genuine technical SEO + content quality.

## Ready for Proposal

Yes. Feasibility verified live (CORS on all 10 endpoints), architecture is a single page + one lib + one hook, TDD infrastructure ready. The orchestrator should tell the user:

1. Confirm the production domain for SEO metadata (needed for canonical/sitemap/OG).
2. Confirm scope: v1 = on-demand test + sort + history; monitor mode deferred to a follow-up change unless explicitly requested.
3. Confirm dark-only theme (recommended, matches LoL aesthetic; light mode would dilute it).
