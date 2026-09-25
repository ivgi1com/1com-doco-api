# Phase 7 — Full Proxy API Rollout

## Prerequisite

The user has explicitly approved:
- design
- one-endpoint implementation
- Live Playground
- Demo mode

## Goal

Scale the proven architecture across the remaining Proxy API documentation.

## Per-endpoint workflow

DISCOVER
-> EXTRACT
-> NORMALIZE
-> VERIFY
-> DOCUMENT
-> TEST

## Track

- pages discovered
- pages processed
- endpoints discovered
- endpoints documented
- endpoints tested
- endpoints verified
- broken links
- unresolved questions
- documentation conflicts

## Quality additions

Introduce/complete:
- guides
- search
- feedback
- observability
- sanitized request history if approved

## Model

Sonnet 5 default.
Haiku 4.5 allowed for low-risk repetitive extraction.
Opus 5.5 for architecture exceptions, security, major reviews.

## Gate

Run final Proxy API architecture review.
Refactor anything unnecessarily Proxy-specific.

STOP for explicit approval before Open API.

## Blocking security requirements

Before any operation is added to the Live allowlist, check
`docs/SECURITY.md` "Blocking requirements for future Live enablement".
Open item: **SEC-REQ-01**. QUEUELOGS stays Demo-only until its response
field allowlist is implemented and validated.
