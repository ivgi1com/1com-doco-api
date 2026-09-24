# Phase 3 — Proxy API Audit

## Goal

Inventory and audit the existing Proxy API documentation before migration.

## Rules

Existing docs are evidence, not guaranteed truth.

Do not invent missing behavior.

## Capture for every relevant page

- source URL
- title
- category
- HTTP method
- endpoint/path
- authentication
- headers
- parameters
- request body
- response examples
- error examples
- code examples
- warnings/notes
- related pages
- unresolved or contradictory details

## Outputs

Update:
- `source-docs/inventory.json`
- `source-docs/DOCS_AUDIT.md`
- `source-docs/unresolved.md`
- normalized files under `source-docs/proxy-api/`

## Model

Sonnet 5 for reasoning.
Haiku 4.5 may be used for low-risk repetitive classification only.

## Gate

STOP after the audit and completeness summary.
Do not implement all endpoints.
