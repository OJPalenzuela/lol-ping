# Ping History Specification

## Purpose

Persists per-region ping results in localStorage (last 50 per region) so returning visitors see trends, and renders a hand-rolled SVG sparkline per region. Degrades gracefully when storage is unavailable (private browsing, quota exceeded, blocked).

## Requirements

### Requirement: Result Persistence

The system MUST persist each completed run's per-region latency to localStorage, capped at 50 entries per region, newest first. Failed regions MUST NOT be persisted as latency values.

#### Scenario: Persist successful run

- GIVEN a run completes with 10 measured regions
- WHEN results are stored
- THEN each region's history gains one entry, newest first

#### Scenario: Cap at 50 entries

- GIVEN a region already has 50 entries
- WHEN a new entry is stored
- THEN the oldest entry is evicted
- AND the count stays at 50

#### Scenario: Failed region not persisted

- GIVEN a region failed the run
- THEN no latency entry is stored for that region

### Requirement: Hydration-Safe Reads

The system MUST read localStorage only inside effects on the client and MUST NOT access it during server rendering.

#### Scenario: SSR safety

- GIVEN the page renders on the server
- THEN no localStorage access occurs
- AND the history UI mounts only after client hydration

### Requirement: Storage Failure Tolerance

The system MUST wrap all localStorage access in try/catch and MUST render the page with empty history when storage is unavailable or throws.

#### Scenario: Private browsing

- GIVEN localStorage access throws
- WHEN history loads
- THEN the page renders without history data
- AND no error is surfaced beyond a missing sparkline

#### Scenario: Quota exceeded

- GIVEN writing a new entry exceeds the storage quota
- THEN the write is skipped
- AND the run results still render

### Requirement: SVG Sparkline Visualization

The system MUST render each region's history as a hand-rolled SVG sparkline (no chart library) when 2 or more entries exist, and each sparkline MUST carry an accessible name describing the region and trend.

#### Scenario: Sparkline with enough data

- GIVEN a region has 2 or more history entries
- WHEN history renders
- THEN an SVG sparkline is displayed for that region

#### Scenario: Insufficient data

- GIVEN a region has fewer than 2 entries
- THEN no sparkline renders for that region
- AND a placeholder is shown instead

#### Scenario: Accessible sparkline

- GIVEN a sparkline renders
- THEN it carries an accessible name describing the region and trend
