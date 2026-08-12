# Proposal: LoL Ping Test — Multi-Region Latency Checker

## Intent

LoL players can't compare ping across all 10 regional servers without launching the game; reference tools (gameserverping.com) don't sort by latency and have weak SEO. This change ships a single-page, client-side "lol ping test" pinging all 10 regions via AWS DynamoDB endpoints (`GET https://dynamodb.{region}.amazonaws.com/ping`), sorting by latency, with on-demand + continuous monitor modes and technical SEO. Target: players choosing a region or diagnosing ping. Value: organic SEO traffic; zero hosting cost.

## Scope

### In Scope

- 10-region ping: median of 3, 4s timeout, parallel (`Promise.allSettled`)
- Auto-sort ascending, best-server highlight
- Monitor mode: auto-ping every N seconds, toggle
- Latency coding: green <100ms, yellow <200ms, orange <300ms, red ≥300ms — color + icon/text, never color-only
- Dark-only Summoner's Rift theme (near-black blue, LoL gold #C8AA6E, display font, tabular-nums)
- localStorage history (~50/region) + hand-rolled SVG sparkline
- SEO: metadata, canonical, OG/Twitter, JSON-LD (WebApplication + FAQPage), sitemap.ts, robots.ts, per-region H2s
- WCAG 2.2: aria-live results, keyboard nav, 44px targets, reduced-motion
- TDD: lib + hook + components

### Out of Scope

Backend/API routes/DB, accounts, i18n, chart lib, WebSockets, light theme, real domain (placeholder `lop-ing.com`).

## User Stories

- As a player, I test all regions in one click and see the best first.
- As a player, I keep a monitor running to watch drift.
- As a returning visitor, I see recent sparklines.

## Capabilities

### New Capabilities

- `ping-testing`: latency measurement, median aggregation, sorting, color coding, timeout/error states
- `ping-monitor`: continuous auto-ping with interval + toggle
- `ping-history`: localStorage persistence + SVG sparkline
- `summoners-rift-theme`: dark-only tokens, typography, latency semantics, responsive layout
- `site-seo`: metadata, JSON-LD, sitemap, robots

### Modified Capabilities

None (no existing specs)

## Approach

Pure client-side single page (exploration-verified: CORS OK on all 10 endpoints). RSC `page.tsx` renders SEO content; client island uses `src/lib/ping.ts` (pure, TDD-first), `src/hooks/use-ping-test.ts` (reducer), `src/components/ping/`.

## Affected Areas

| Area                              | Impact   | Description                           |
| --------------------------------- | -------- | ------------------------------------- |
| `src/app/page.tsx`, `layout.tsx`  | Modified | RSC shell + metadata/JSON-LD          |
| `src/app/globals.css`             | Modified | Theme tokens, latency colors, fonts   |
| `src/app/sitemap.ts`, `robots.ts` | New      | SEO files                             |
| `src/lib/regions.ts`, `ping.ts`   | New      | Region table + ping logic             |
| `src/hooks/use-ping-test.ts`      | New      | Client state machine                  |
| `src/components/ping/*`           | New      | Panel, rows, badge, skeleton, history |
| `src/lib/ping.test.ts` + tests    | New      | TDD suite                             |

## Risks

| Risk                               | Likelihood | Mitigation                                   |
| ---------------------------------- | ---------- | -------------------------------------------- |
| AWS /ping CORS change              | Med        | One-file swap in regions.ts/ping.ts          |
| CN unreachable outside China       | High       | Label Timeout as expected, not tool failure  |
| Monitor hammers AWS/mobile battery | Med        | Configurable interval, pause when tab hidden |
| Ad blockers block AWS              | Med        | Distinct Error state with explanation        |
| Hydration mismatch (localStorage)  | Med        | Read in effects only                         |
| Placeholder domain in SEO          | High       | Flag as pre-launch task                      |

## Rollback Plan

Single commit revert (starter page restored); all additive, no schema/migrations. Monitor defaults off until validated.

## Dependencies

- AWS DynamoDB `/ping` endpoints (undocumented, live-verified)
- shadcn/ui (add Card/Skeleton/Badge)

## Success Criteria

- [ ] `pnpm test` green (lib, hook, components)
- [ ] 10 regions measured, sorted, best highlighted
- [ ] Monitor auto-updates at interval
- [ ] Lighthouse SEO ≥ 90; JSON-LD validates
- [ ] Keyboard-only flow works; no color-only cues
- [ ] History + sparkline persist across reloads
