# Site SEO Specification

## Purpose

Technical SEO and accessibility for the single-page site: metadata, canonical/OG/Twitter tags, JSON-LD structured data (WebApplication + FAQPage), sitemap.ts, robots.ts, semantic heading structure with per-region H2s, and a visible FAQ section. The domain is a placeholder (`lop-ing.com`), configurable before launch.

## Requirements

### Requirement: Metadata and Canonical

The RSC shell MUST render a unique title, meta description, self-referencing canonical URL, and Open Graph plus Twitter card tags. All URLs MUST derive from a single configurable site base (placeholder `lop-ing.com`) adjustable before launch.

#### Scenario: Full metadata rendered

- GIVEN the page is served
- THEN title, description, canonical, OG, and Twitter tags are present in the head

#### Scenario: Configurable base URL

- GIVEN the site base URL is configured
- THEN all canonical, OG, and Twitter URLs derive from it
- AND swapping the domain updates every reference

### Requirement: Structured Data

The page MUST include valid JSON-LD for WebApplication and FAQPage, and the FAQ structured data MUST match visible page content.

#### Scenario: JSON-LD validates

- GIVEN the page is served
- THEN WebApplication and FAQPage JSON-LD blocks are present and valid

#### Scenario: FAQ parity

- GIVEN the FAQ section renders on the page
- THEN every JSON-LD question and answer has a visible counterpart

### Requirement: Sitemap and Robots

The site MUST expose `sitemap.ts` and `robots.ts`; the generated robots.txt MUST reference the sitemap.

#### Scenario: Sitemap served

- GIVEN `/sitemap.xml` is requested
- THEN it returns the homepage URL with the configured base

#### Scenario: Robots served

- GIVEN `/robots.txt` is requested
- THEN it allows crawling
- AND it references the sitemap URL

### Requirement: Semantic Structure

The page MUST contain exactly one H1 and one H2 per region, and interactive results MUST be announced via `aria-live`.

#### Scenario: Heading hierarchy

- GIVEN the page renders
- THEN exactly one H1 exists
- AND each region has an H2

#### Scenario: Results announced

- GIVEN a ping run completes
- THEN the results region announces the outcome via `aria-live`
