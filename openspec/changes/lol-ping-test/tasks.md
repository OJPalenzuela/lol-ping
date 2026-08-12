# Tasks: LoL Ping Test — Multi-Region Latency Checker

## Review Workload Forecast

| Field                   | Value                                                        |
| ----------------------- | ------------------------------------------------------------ |
| Estimated changed lines | ~1,600–1,900 authored (+~150 shadcn generated)               |
| 400-line budget risk    | High                                                         |
| Chained PRs recommended | Yes                                                          |
| Suggested split         | 5 chained PRs (libs → hook → primitives → composition → SEO) |
| Delivery strategy       | ask-on-risk                                                  |
| Chain strategy          | pending                                                      |

```
Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High
```

### Suggested Work Units

| Unit | Goal                                     | Likely PR | Focused test command                                                                           | Runtime harness                                                                             | Rollback boundary                                                                                  |
| ---- | ---------------------------------------- | --------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| 1    | Domain libs + tests                      | PR 1      | `pnpm exec vitest run src/lib/ping.test.ts src/lib/thresholds.test.ts src/lib/history.test.ts` | N/A — pure logic, no browser surface; jsdom proves behavior                                 | Revert `src/types/ping.ts` + `src/lib/{regions,thresholds,ping,history}.ts` + tests; no UI touched |
| 2    | Monitor state machine                    | PR 2      | `pnpm exec vitest run src/hooks/use-ping-test.test.ts`                                         | N/A — interval/visibility verified via fake timers in jsdom                                 | Revert `src/hooks/use-ping-test.ts` + test                                                         |
| 3    | Theme tokens + visual primitives         | PR 3      | `pnpm exec vitest run src/components/ping/ping-badge.test.tsx`                                 | N/A — primitives only render inside panel (PR 4)                                            | Revert `globals.css`, `src/components/ui/*`, `ping-badge/error/skeleton`                           |
| 4    | Composition: row, panel, toggle, history | PR 4      | `pnpm exec vitest run src/components/ping`                                                     | `pnpm dev` — Test Ping click, monitor toggle, sparklines, hidden-tab pause                  | Revert `ping-row/monitor-toggle/ping-history/ping-panel`                                           |
| 5    | SEO shell + integration                  | PR 5      | `pnpm build` + `pnpm test`                                                                     | `pnpm dev` — head tags, `/sitemap.xml`, `/robots.txt`; Lighthouse SEO ≥90; JSON-LD validate | Revert `src/app/{layout,page}.tsx`, `sitemap.ts`, `robots.ts`, `src/lib/seo.ts`                    |

Commit boundary: each RED+GREEN pair = one conventional commit (`test:` + `feat:`). Threat matrix is N/A per design (no routing/shell/process surface) — no threat RED tests.

## Phase 1: Core Domain Libraries (PR 1)

- [ ] 1.1 RED: `src/lib/thresholds.test.ts` — boundaries 99/100/199/200/299/300 → green/yellow/yellow/orange/orange/red [ping-testing]
- [ ] 1.2 GREEN: `src/lib/thresholds.ts` — threshold consts + `classifyLatency()`
- [ ] 1.3 RED: `src/lib/ping.test.ts` — median 100ms, outlier 80/500/90→90, 4s abort via fake timers, one region fails→9 succeed, timeout/network/blocked classification [ping-testing]
- [ ] 1.4 GREEN: `src/types/ping.ts` (types per design) + `src/lib/regions.ts` (10 regions, endpoints) + `src/lib/ping.ts` (`pingRegion`/`pingAllRegions`, injectable fetch, AbortController)
- [ ] 1.5 RED: `src/lib/history.test.ts` — cap-50 eviction, newest-first, failed region not persisted, quota throw degrades gracefully [ping-history]
- [ ] 1.6 GREEN: `src/lib/history.ts` — `loadHistory`/`saveHistory` with try/catch

## Phase 2: Monitor State Machine (PR 2)

- [ ] 2.1 RED: `src/hooks/use-ping-test.test.ts` — idle→loading→results/error transitions, 5s cadence, no-overlap skip, visibility pause + fresh run on visible, monitor default off, clearHistory [ping-monitor]
- [ ] 2.2 GREEN: `src/hooks/use-ping-test.ts` — `useReducer` state machine, `setInterval` 5s with in-flight ref guard, `visibilitychange` effect

## Phase 3: Theme + Components (PR 3, PR 4)

- [ ] 3.1 GREEN: `pnpm dlx shadcn@latest add card skeleton badge`
- [ ] 3.2 GREEN: `src/app/globals.css` — dark-only tokens (bg `#0a0e1a`, gold `#c8aa6e`), 4 tier colors, tabular-nums, reduced-motion, visible focus ring [theme]
- [ ] 3.3 RED: `src/components/ping/ping-badge.test.tsx` — tier = color + icon/text, never color-only [ping-testing]
- [ ] 3.4 GREEN: `ping-badge.tsx` (latency text + tier icon) + `ping-error.tsx` (timeout/network/blocked; CN timeout labeled "expected") [ping-testing]
- [ ] 3.5 RED: `src/components/ping/ping-row.test.tsx` — sorted order render, best highlighted, deterministic tie-break [ping-testing]
- [ ] 3.6 GREEN: `ping-row.tsx` — rank, flag, name, badge; `isBest` highlight
- [ ] 3.7 GREEN: `monitor-toggle.tsx` (44px target, text/icon running|paused|idle) + `ping-skeleton.tsx` [ping-monitor]
- [ ] 3.8 GREEN: `ping-history.tsx` — hand-rolled SVG sparkline (≥2 entries), accessible name, placeholder below, localStorage read in effect only [ping-history]
- [ ] 3.9 GREEN: `ping-panel.tsx` — composes hook + rows + toggle + history; results region `aria-live="polite"` + `aria-busy` [site-seo]

## Phase 4: SEO Shell + Integration (PR 5)

- [ ] 4.1 GREEN: `src/lib/seo.ts` — `SITE` config (placeholder `lop-ing.com`, single swap point) + JSON-LD WebApplication + FAQPage builders [site-seo]
- [ ] 4.2 GREEN: `src/app/layout.tsx` — title/description/canonical/OG/Twitter from `seo.ts`, `metadataBase`, display+body fonts via `next/font` [site-seo]
- [ ] 4.3 GREEN: `src/app/sitemap.ts` + `src/app/robots.ts` — sitemap URL from `SITE`; robots references sitemap [site-seo]
- [ ] 4.4 GREEN: `src/app/page.tsx` — RSC shell: exactly one H1, one H2 per region, visible FAQ matching JSON-LD, embeds `<PingPanel/>` [site-seo]

## Phase 5: Verification & Polish

- [ ] 5.1 VERIFY: `pnpm test` + `pnpm lint` + `npx tsc --noEmit` + `pnpm build` all green
- [ ] 5.2 VERIFY: `pnpm dev` — Lighthouse SEO ≥90, JSON-LD validates, keyboard-only flow, 44px targets, no layout jitter on updates [site-seo/theme]
- [ ] 5.3 VERIFY: re-check CN endpoint reachability; resolve display font (Chakra Petch vs Rajdhani) [design open questions]
- [ ] 5.4 CLEAN: remove starter-page leftovers; flag placeholder domain swap as pre-launch task
