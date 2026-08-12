# Summoner's Rift Theme Specification

## Purpose

Dark-only visual identity: near-black blue background, LoL gold (#C8AA6E) accent, display font for headings, tabular numerals for latency values. Responsive mobile-first, WCAG 2.2 AA contrast, reduced-motion support. No light theme.

## Requirements

### Requirement: Dark-Only Palette

The system MUST render with a dark-only palette — near-black blue background with LoL gold accent — defined as theme tokens. The system MUST NOT offer or render a light theme.

#### Scenario: Default render

- GIVEN the page loads
- THEN the background is near-black blue and accents use LoL gold
- AND no light theme exists

#### Scenario: Token-driven colors

- GIVEN the theme is applied
- THEN all colors come from theme tokens
- AND text contrast meets WCAG 2.2 AA

### Requirement: Latency Semantics

Latency tiers MUST be visually distinguished by color PLUS icon or text — never color-only — using the fixed thresholds green <100ms, yellow <200ms, orange <300ms, red ≥300ms.

#### Scenario: Color-blind-safe cue

- GIVEN a region classified red (≥300ms)
- THEN the row shows red styling and a distinct icon/text label

#### Scenario: Threshold boundaries

- GIVEN latencies of 99, 100, 199, 200, 299, 300ms
- THEN classification is green, yellow, yellow, orange, orange, red respectively

### Requirement: Tabular Numerals and Typography

Latency values MUST render with tabular numerals so digits do not jitter during updates, and headings MUST use a display font distinct from the body font.

#### Scenario: No jitter during updates

- GIVEN the monitor updates a value from 99ms to 199ms
- THEN the value changes without layout jitter (tabular-nums)

#### Scenario: Display typography

- GIVEN the page renders
- THEN headings use the display font and body text uses the readable body font

### Requirement: Responsive Mobile-First Layout

The layout MUST be mobile-first: single-column on small screens, multi-column from the md breakpoint up, with interactive targets of at least 44px.

#### Scenario: Mobile layout

- GIVEN the viewport is below the md breakpoint
- THEN regions render in a single scrollable column
- AND all interactive targets are ≥44px

#### Scenario: Desktop layout

- GIVEN the viewport is at or above the md breakpoint
- THEN regions render in a multi-column layout
- AND no content is clipped or overlapping

### Requirement: Motion and Accessibility

The system MUST respect `prefers-reduced-motion` by disabling non-essential animation, and MUST keep every interactive element keyboard-focusable with a visible focus indicator.

#### Scenario: Reduced motion

- GIVEN the user prefers reduced motion
- THEN non-essential animations are disabled

#### Scenario: Keyboard focus

- GIVEN the user tabs through the page
- THEN every interactive element receives a visible focus indicator
