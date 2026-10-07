# Phase 8 — Open API Rollout

## Prerequisite

Proxy API architecture is approved and frozen as the reusable reference implementation.

## Goal

Ingest and render Open API using the same core architecture.

## Strategy

Where an actual OpenAPI specification exists:
- prefer it as structured input
- validate it
- map it into the internal model
- preserve human-written guides separately

## Reuse

Reuse:
- endpoint pages
- navigation model
- parameter tables
- request/response components
- Playground
- Live/Demo execution patterns where applicable
- search
- versioning
- deprecation
- feedback
- observability

Do not create a parallel application unless a documented constraint requires it.

## Gate

Complete cross-API consistency review before production release.

## Pre-Stage-6 sub-phases (added 2026-09-26)

A manual product review found Phase 8 was not actually feature-complete
before Stage 6: the OpenAPI API Reference did not expose all information
available in the approved baseline, and the OpenAPI Demo and Playground
were missing/incomplete. Four sub-phases were inserted between Stage 5
and the existing Stage 6, each with its own STOP gate. This supersedes
the earlier "Phase 8 is feature-complete" status.

Order:

1. `08A-openapi-api-reference-completeness.md` — Sonnet 5
2. `08B-openapi-demo.md` — Sonnet 5
3. `08C-openapi-playground.md` — Sonnet 5
4. `08D-pre-stage6-readiness-gate.md` — Sonnet 5 (deterministic
   validation)
5. Existing Stage 6 — cross-API consistency and security review — Opus
   5.5, only after 8D passes

Full spec and routing detail: `docs/phases/08-substages-README.md`.
Stages 0–5 remain recorded as done; nothing about them is reopened by
this insertion.
