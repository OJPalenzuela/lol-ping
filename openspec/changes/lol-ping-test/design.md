# Design: LoL Ping Test — Multi-Region Latency Checker

## Technical Approach

Pure client-side single page covering specs `ping-testing`, `ping-monitor`, `ping-history`, `summoners-rift-theme`, `site-seo`. RSC `page.tsx` renders all SEO content (H1, per-region H2s, FAQ, JSON-LD); a client island (`PingPanel`) owns the tester. Measurement: 10 AWS DynamoDB `/ping` endpoints fetched in parallel, `AbortController` 4s timeout per attempt, median of 3 attempts, `Promise.allSettled` so one failure never blocks the run. State lives in one `use-ping-test` hook (reducer). History persists to localStorage (50/region) with a hand-rolled SVG sparkline. Exploration verified CORS `*` on all 10 endpoints with simple requests — no preflight, no backend. File names follow repo kebab-case (`use-ping-test.ts`, `ping-panel.tsx`).

## Architecture Decisions

| #   | Decision         | Choice                                                              | Alternatives                           | Rationale                                                                                                                 |
| --- | ---------------- | ------------------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| D1  | Measurement      | Browser `fetch` to DynamoDB `/ping`                                 | Route-handler proxy; League client IPs | Proxy measures server's path, not user's — wrong semantics; client IPs CORS-blocked. Live-verified on all 10 regions      |
| D2  | State            | `useReducer` in `use-ping-test.ts`                                  | Zustand; scattered useState            | One screen, one owner — external store is YAGNI (zustand-5 skill consulted, rejected); reducer keeps transitions testable |
| D3  | Median & timeout | 3 attempts/region, median of successes, 4s abort                    | Single attempt; mean                   | Median excludes outliers (spec: 80/500/90 → 90); abort bounds total run                                                   |
| D4  | Monitor          | `setInterval(5000)` + in-flight ref guard                           | `setTimeout` chain                     | Spec requires interval semantics with skip-when-in-flight; guard prevents overlapping runs                                |
| D5  | Visibility       | `visibilitychange` → pause interval; fresh run on visible           | rAF loop                               | Spec `ping-monitor`; saves battery, avoids hammering AWS                                                                  |
| D6  | History          | localStorage, 50/region, try/catch, read in effects only            | Zustand persist; IndexedDB             | Private-mode + hydration-safe; small quota fits trend signal                                                              |
| D7  | Sparkline        | Hand-rolled ~30-line SVG                                            | Chart library                          | One fixed polyline — dependency is overkill                                                                               |
| D8  | Theme            | Tailwind 4 CSS vars in `globals.css`, dark-only, no `.dark` variant | Light theme; inline hex                | Single token source; tier colors become semantic tokens (tailwind-4 skill: no hex in className)                           |
| D9  | Errors           | `timeout` / `network` / `blocked` + CN "expected" label             | One generic error                      | Spec requires distinct states; ad-blockers and CN geography are common, not exceptional                                   |
| D10 | Best highlight   | Stable sort by (latency, region table order), exactly one best      | Random tie-break                       | Deterministic single winner per spec                                                                                      |

## Data Flow

```
User ─click "Test Ping"→ PingPanel ─dispatch START→ usePingTest
  → pingAllRegions()                          [lib/ping.ts, pure]
     └─ Promise.allSettled: 10 × pingRegion(region)
        └─ 3× fetch(endpoint, {signal, cache:"no-store"})
           └─ AbortController 4s + performance.now()
  → median(attempts) | failure classification
  → sort (latency, order) → saveHistory() [lib/history.ts → localStorage]
  → dispatch RESULTS → PingRow×10 (best = first) → PingBadge (color+icon+text)
  → PingHistory: load in effect → SVG sparklines

Monitor: MonitorToggle → setInterval 5s → same flow; visibilitychange pause/resume
```

State machine:

```
idle ─startPing→ loading ─all failed→ error
  ▲                │
  └── resolved ────┴─→ results ─startPing/interval→ loading
monitorActive: orthogonal boolean, default false
```

## File Changes

| File                              | Action           | Description                                                                                                           |
| --------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------- |
| `src/app/page.tsx`                | Modify           | RSC shell: H1, per-region H2s, FAQ, JSON-LD; embeds `<PingPanel/>`                                                    |
| `src/app/layout.tsx`              | Modify           | Metadata (title/description/OG/Twitter/canonical from `seo.ts`), display+body fonts via `next/font`, `metadataBase`   |
| `src/app/globals.css`             | Modify           | Dark-only tokens: bg `#0a0e1a`, surface, gold `#c8aa6e`, 4 tier colors; tabular-nums; reduced-motion                  |
| `src/app/sitemap.ts`, `robots.ts` | Create           | Static sitemap; robots allowing crawl + sitemap ref                                                                   |
| `src/lib/seo.ts`                  | Create           | `SITE` config (domain `lop-ing.com` — single swap point); JSON-LD builders (WebApplication + FAQPage)                 |
| `src/lib/regions.ts`              | Create           | 10-region table (code, name, flag, endpoint)                                                                          |
| `src/lib/thresholds.ts`           | Create           | Threshold consts + `classifyLatency()`                                                                                |
| `src/lib/ping.ts`                 | Create           | `pingRegion()`, `pingAllRegions()` — pure, injectable fetch                                                           |
| `src/lib/history.ts`              | Create           | `loadHistory/saveHistory`, cap-50 eviction, try/catch                                                                 |
| `src/types/ping.ts`               | Create           | Shared types                                                                                                          |
| `src/hooks/use-ping-test.ts`      | Create           | Reducer + interval/visibility effects                                                                                 |
| `src/components/ping/*`           | Create           | 7 components: `ping-panel`, `ping-row`, `ping-badge`, `ping-skeleton`, `ping-history`, `monitor-toggle`, `ping-error` |
| `src/components/ui/`              | Add (shadcn CLI) | `card`, `skeleton`, `badge`                                                                                           |
| `*.test.ts(x)`                    | Create           | 6 suites (see Testing)                                                                                                |

## Interfaces / Contracts

```ts
// types/ping.ts
export type PingFailure = "timeout" | "network" | "blocked";
export interface Region {
  code: string;
  name: string;
  flag: string;
  endpoint: string;
}
export interface PingResult {
  region: Region;
  latencyMs: number | null;
  attempts: number[];
  failure?: PingFailure;
}
export type PingStatus = "idle" | "loading" | "results" | "error";
export interface HistoryEntry {
  latencyMs: number;
  timestamp: number;
}

// use-ping-test.ts
export interface PingTestState {
  status: PingStatus;
  results: PingResult[];
  history: Record<string, HistoryEntry[]>; // keyed by region code
  monitorActive: boolean;
  lastUpdated: Date | null;
}
export function usePingTest(): {
  state: PingTestState;
  startPing(): void;
  toggleMonitor(): void;
  clearHistory(): void;
};

// lib/ping.ts — fetch injectable for tests
export function pingRegion(
  region: Region,
  opts?: { fetchImpl?: typeof fetch; timeoutMs?: number },
): Promise<PingResult>;
export function pingAllRegions(regions: Region[]): Promise<PingResult[]>;
```

Component props: `PingRow { result: PingResult; history: HistoryEntry[]; isBest: boolean; rank: number }`; `PingBadge { result: PingResult }` (latency text + tier icon, never color-only); `MonitorToggle { active: boolean; paused: boolean; onToggle(): void }` (44px target); `PingError { failure: PingFailure; region: Region }`. `PingPanel` owns the hook; results region carries `aria-live="polite"` + `aria-busy`.

## Testing Strategy

| Layer       | What to Test                                                | Approach                                                                                                         |
| ----------- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Unit        | median, abort timeout, allSettled isolation, sort/tie-break | `ping.test.ts` — mocked fetch + fake timers                                                                      |
| Unit        | thresholds                                                  | `thresholds.test.ts` — boundaries 99/100/199/200/299/300                                                         |
| Unit        | history                                                     | `history.test.ts` — cap 50, eviction, failures skipped, quota throw degrades                                     |
| Integration | hook                                                        | `use-ping-test.test.ts` — state transitions, interval cadence, no overlap, visibility pause, monitor default off |
| Integration | components                                                  | `ping-row.test.tsx`, `ping-badge.test.tsx` — sorted render, best highlight, icon+text cues, aria-live announce   |
| E2E         | none                                                        | Not configured (`config.yaml` e2e: null); Lighthouse SEO ≥90 + JSON-LD validation manual                         |

## Threat Matrix

N/A — no routing logic, shell commands, subprocesses, VCS/PR automation, executable-file classification, or process integration. `sitemap.ts`/`robots.ts` are declarative Next.js file conventions; the only external interaction is browser `fetch` to AWS (CORS-governed, covered by `ping.test.ts`).

## Migration / Rollout

No migration. Single-commit additive change (starter page replaced; rollback = revert). Monitor defaults off. Pre-launch task: swap placeholder domain `lop-ing.com` in `src/lib/seo.ts`.

## Open Questions

- [ ] Display font choice (Chakra Petch vs Rajdhani) — visual only, resolves at apply
- [ ] Re-verify CN endpoint (`cn-north-1` on `.com.cn`) reachability at apply time
