# Phase 8C — OpenAPI Playground

> **Parent phase:** Phase 8 — MiRTA OpenAPI rollout  
> **Position:** After API Reference completeness and Demo, before pre-Stage-6 readiness gate  
> **Primary model:** Sonnet 5  
> **Purpose:** Provide a complete OpenAPI request-building Playground while preserving strict separation between Demo capability and explicitly approved Live execution.

---

## 1. Objective

Implement or complete the **OpenAPI Playground** so users can interactively explore documented MiRTA OpenAPI operations using verified metadata.

The Playground must support high-quality request construction and Demo execution for the approved OpenAPI baseline.

Live execution remains separately controlled and must not be broadened merely because an operation exists in the Playground.

---

## 2. Architecture Principle

The Playground should consume the same normalized OpenAPI operation metadata as:

- API Reference
- Demo

Preferred relationship:

```text
Approved OpenAPI baseline
        ↓
Normalized metadata
        ↓
┌────────────────────────────┐
│ API Reference              │
│ Playground request builder │
│ DemoProvider               │
└────────────────────────────┘
```

Avoid parallel, manually duplicated endpoint definitions.

---

## 3. Required Playground Capabilities

For documented operations, allow the user to:

- browse/select OpenAPI resources
- choose a documented HTTP operation
- view the exact path
- view resource/operation purpose
- see authentication requirements
- see tenant/global/admin scope
- see read-only vs mutating status
- enter path parameters
- enter query parameters
- enter request bodies where documented
- use enums/selectors where appropriate
- see required vs optional inputs
- see defaults where documented
- see aliases/accepted values where useful
- view generated request URL
- view generated cURL
- view sanitized request representation
- execute in Demo mode when supported
- view the response through the shared response viewer

If the response schema is not documented, the Playground must not fabricate one.

---

## 4. Demo Mode in Playground

Demo mode is the default safe execution path for OpenAPI operations unless the project already defines another approved behavior.

Demo mode must:

- use DemoProvider/synthetic fixtures
- require no real API key
- require no real tenant credentials
- make no real PBX call
- clearly state that the result is simulated
- preserve the same form fields and validation used for the operation

---

## 5. Live Mode Boundary

Documentation and Playground visibility do not grant Live permission.

Live mode must remain **default deny**.

Do not automatically expand the Live allowlist during this sub-phase.

If an OpenAPI operation is not explicitly approved for Live:

- it may still appear in Reference;
- it may still be usable in Demo;
- Live execution must remain disabled/blocked;
- the UI should explain that Live execution is not enabled.

### Mutating operations

`POST`, `PATCH`, `PUT`, `DELETE`, Dial/origination, token reset/generation, and other state-changing actions must not become Live-enabled without explicit approval.

---

## 6. Credentials and Session Context

If Live OpenAPI execution already exists for any approved operations, credentials must remain server-side.

The browser must not persist secrets into:

- localStorage
- committed files
- analytics
- request history
- console logs
- error reporting
- URLs where avoidable

If the existing application uses session-level tenant/API-key context, reuse the established secure pattern.

Do not create a second credential-storage mechanism for OpenAPI.

---

## 7. Request Generation

Generated request representations must accurately reflect the verified operation contract.

Where applicable, show:

- HTTP method
- endpoint path
- query string
- tenant parameter
- headers
- body
- cURL example

Never include real secret values in copied/generated examples unless the user explicitly entered them for an approved Live flow, and even then avoid exposing them unnecessarily.

Prefer placeholder/redacted representation for auth values.

---

## 8. Input Validation

Validation must come from verified metadata.

Support where documented:

- required fields
- string/integer/boolean types
- enums
- date/time inputs
- accepted formats
- body-field requirements
- path requirements

Do not invent validation constraints that the official baseline does not establish.

Client validation improves UX but must not be treated as a security boundary for Live execution.

---

## 9. Response Viewer

Reuse the project's shared response viewer.

Preserve the established UX, including where available:

- Body / Headers / Request tabs
- Tree / Raw view
- expand/collapse
- JSON search
- copy
- download
- status
- latency
- size
- sanitized request view
- sticky response controls

Do not create a separate lower-quality response viewer specifically for OpenAPI.

---

## 10. Security Requirements

The Playground must enforce:

- clear Demo/Live separation
- no automatic Demo fallback after Live errors
- no arbitrary upstream URLs
- no unrestricted methods
- no unapproved Live operations
- no credentials in logs/history
- no secrets in frontend bundles
- response security for approved Live operations
- tenant isolation
- server-side request validation

Known OpenAPI Live risks must remain blocked until their `SEC-REQ-*` requirements are resolved.

---

## 11. API-Family Consistency

OpenAPI and Proxy API should feel like parts of the same developer portal without pretending they are the same API.

Keep consistent:

- navigation patterns
- request forms
- response viewer
- Demo/Live controls
- copy/download interactions
- status/error presentation

Keep distinct:

- endpoint definitions
- authentication semantics
- scope
- parameter model
- Live authorization
- documented behavior

Do not map Proxy concepts onto OpenAPI unless the approved baseline explicitly supports the equivalence.

---

## 12. Implementation Tasks

1. Audit the current Playground for OpenAPI coverage.
2. Reuse shared metadata from Phase 8A.
3. Reuse Demo provider/fixtures from Phase 8B.
4. Implement resource/operation selection.
5. Implement parameter/body forms.
6. Implement request generation.
7. Implement Demo execution.
8. Preserve/implement explicit Live-disabled state for unapproved operations.
9. Reuse the shared response viewer.
10. Add unit/integration tests.
11. Add Playwright coverage.
12. Produce Playground coverage metrics.

---

## 13. Required Coverage Report

Report:

- total documented resources
- total documented operations
- resources represented in Playground
- operations represented in Playground
- operations executable in Demo
- operations executable in Live
- operations visible but intentionally Live-disabled
- missing operations
- intentionally excluded operations and reason

---

## 14. Validation

At minimum:

- `npm run check`
- `npm run build`
- relevant unit/integration tests
- Playwright for resource selection
- Playwright for parameter entry
- Playwright for request-body entry
- Playwright for generated request/cURL
- Playwright for Demo execution
- Playwright for Live-disabled behavior
- representative responsive/mobile checks
- console-error review
- secret/customer-data scan
- Git diff review

Verify at least one representative operation from:

- read-only GET
- parameterized GET
- CRUD-style resource
- mutating operation that must remain Live-disabled
- operation with unknown response schema
- global/admin-scoped resource if documented

---

## 15. Out of Scope

Do not:

- broaden Live allowlists
- authorize PBX mutations
- fetch/use real PBX spec unless separately approved
- resolve security blockers by bypassing them
- alter Proxy API behavior unnecessarily
- begin Stage 6
- merge
- push
- tag

---

## 16. Acceptance Criteria

This sub-phase is complete when:

- documented OpenAPI operations are discoverable in Playground;
- forms reflect verified parameters/request bodies;
- request generation is accurate;
- Demo execution is functional and synthetic;
- Live-disabled operations remain blocked;
- shared response viewer is used;
- API metadata is not duplicated unnecessarily;
- no undocumented behavior is invented;
- security boundaries are preserved;
- checks/build/tests pass.

---

## 17. STOP Gate

When acceptance criteria are met:

1. stop;
2. report Playground coverage;
3. report Demo vs Live execution coverage;
4. report any remaining Live-disabled/security-blocked operations;
5. report tests;
6. report files changed;
7. report Git status;
8. ask for approval before moving to **Phase 8D — Pre-Stage-6 Readiness Gate**.

Do not start Stage 6 automatically.
