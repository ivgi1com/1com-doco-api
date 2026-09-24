# Phase 6 — Demo Mode

## Goal

Add a first-class Demo environment for the same endpoint without touching production systems.

## Architecture

Same:
- endpoint metadata
- request form
- documentation
- JSON viewer
- validation UX

Different execution provider:
- `LiveProvider`
- `DemoProvider`

## Demo requirements

- no real API key
- no real tenant required
- no production calls
- no production data
- clearly labeled simulated environment
- synthetic schema-valid JSON
- realistic but obviously non-production sample values

## Fixture strategy

Prefer fixtures derived from the verified endpoint schema.

Potential scenarios:
- successful response
- empty response
- validation error
- not found

Do not invent scenarios unsupported by the known API contract without clearly labeling them as illustrative.

## Critical rule

Demo mode is never a fallback for Live mode.
If Live fails, show the Live failure.

## Gate

Test both Live and Demo independently.

STOP for explicit user approval before full Proxy API rollout.
