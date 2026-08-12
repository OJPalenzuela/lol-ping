# Ping Testing Specification

## Purpose

Client-side latency measurement for all 10 League of Legends regional servers via AWS DynamoDB `/ping` endpoints (`https://dynamodb.{region}.amazonaws.com/ping`). Produces per-region latency results, sorted and classified, with timeout and error states — the foundation for both on-demand tests and the continuous monitor.

## Requirements

### Requirement: Parallel Multi-Region Measurement

The system MUST measure all 10 regions concurrently and MUST NOT let one region's failure block the others.

#### Scenario: All regions respond

- GIVEN the user triggers a ping test
- WHEN the system sends requests to all 10 regional endpoints in parallel
- THEN every region resolves with its measured latency
- AND the run completes with zero error regions

#### Scenario: One region fails

- GIVEN one regional endpoint is unreachable
- WHEN the parallel run finishes
- THEN the failing region reports an error state
- AND the other 9 regions still report valid latency

### Requirement: Median of Three Attempts

The system MUST report the median latency of 3 attempts per region.

#### Scenario: Median of three

- GIVEN three attempts measure 90ms, 110ms, and 100ms
- WHEN the run completes
- THEN the region reports 100ms

#### Scenario: Outlier excluded

- GIVEN three attempts measure 80ms, 500ms, and 90ms
- WHEN the run completes
- THEN the region reports 90ms (the outlier does not dominate)

### Requirement: Attempt Timeout

Each attempt MUST abort after 4 seconds via AbortController; a timed-out attempt MUST be recorded as failed.

#### Scenario: Slow endpoint times out

- GIVEN an endpoint does not respond within 4 seconds
- WHEN the attempt completes
- THEN the attempt is aborted and recorded as failed

#### Scenario: Timeout treated as expected for CN

- GIVEN the CN region times out from a non-Chinese network
- THEN the UI labels it as an expected Timeout state, not a tool failure

### Requirement: Error Classification

The system MUST expose distinct per-region error states for timeout, network failure, and blocked requests (e.g. ad blockers). A region whose attempts all fail MUST be excluded from sorting and MUST NOT fail the run.

#### Scenario: All attempts fail

- GIVEN all 3 attempts for a region fail
- WHEN the run completes
- THEN the region shows its error state
- AND the remaining regions still sort normally

#### Scenario: Ad blocker blocks endpoint

- GIVEN requests are blocked by an ad blocker
- WHEN the attempt fails
- THEN the region shows a distinct blocked state with an explanation

### Requirement: Latency Sorting and Best Highlight

The system MUST sort successful results ascending by latency and MUST highlight exactly one best region using a deterministic tie-break.

#### Scenario: Sorted results

- GIVEN measured latencies of 150ms, 80ms, and 120ms across regions
- WHEN the run completes
- THEN regions render in the order 80ms, 120ms, 150ms

#### Scenario: Best region highlighted

- GIVEN the sorted run completes
- THEN the lowest-latency region is visually marked as best

#### Scenario: Tie for best

- GIVEN two regions share the lowest latency
- WHEN the run completes
- THEN exactly one is marked best, chosen by a stable ordering

### Requirement: Latency Classification

The system MUST classify latency into four tiers: green <100ms, yellow <200ms, orange <300ms, red ≥300ms. Classification MUST be conveyed by color paired with icon or text — never color alone.

#### Scenario: Boundary values

- GIVEN latencies 99ms, 100ms, 199ms, 200ms, 299ms, 300ms
- THEN classes are green, yellow, yellow, orange, orange, red respectively

#### Scenario: Non-color conveyance

- GIVEN a red-classified region
- THEN the UI shows both the red indicator and a text/icon cue
