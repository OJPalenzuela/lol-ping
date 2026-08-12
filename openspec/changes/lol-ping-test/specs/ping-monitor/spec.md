# Ping Monitor Specification

## Purpose

Continuous latency monitoring: automatically re-runs the full ping test every 5 seconds with user start/stop control, pausing while the tab is hidden to save battery and avoid hammering AWS endpoints.

## Requirements

### Requirement: Automatic Re-Ping Interval

While active, the system MUST re-run the full 10-region test every 5 seconds after the previous run completes.

#### Scenario: Regular cadence

- GIVEN the monitor is active and a run just finished
- WHEN 5 seconds elapse
- THEN a new run starts

#### Scenario: No overlapping runs

- GIVEN a run takes longer than 5 seconds
- WHEN the interval fires
- THEN the new run is skipped and rescheduled for the next interval
- AND only one run executes at a time

### Requirement: Start/Stop Control

The system MUST provide a toggle to start and stop monitoring. The monitor MUST default to off on page load.

#### Scenario: Start monitoring

- GIVEN the monitor is off
- WHEN the user toggles it on
- THEN an immediate run starts
- AND subsequent runs follow the 5-second interval

#### Scenario: Stop monitoring

- GIVEN the monitor is running
- WHEN the user toggles it off
- THEN no further runs are scheduled
- AND an in-flight run MAY complete

#### Scenario: Default off

- GIVEN the page loads
- THEN monitoring is off and no pings fire automatically

### Requirement: Tab-Hidden Pause

The system MUST pause monitoring while the tab is hidden and MUST resume with a fresh run when it becomes visible again.

#### Scenario: Tab hidden

- GIVEN monitoring is active
- WHEN the tab becomes hidden
- THEN the interval is paused

#### Scenario: Tab visible again

- GIVEN the tab was hidden while monitoring was active
- WHEN the tab becomes visible
- THEN monitoring resumes with a fresh run

### Requirement: Monitor Status Feedback

The system MUST surface the monitor state (running, paused, or idle) via a visible indicator that includes text or icon — never color-only.

#### Scenario: Status visible

- GIVEN monitoring is active
- THEN the UI shows the running state with a text/icon indicator
