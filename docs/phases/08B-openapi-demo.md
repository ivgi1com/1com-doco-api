# Phase 8B — OpenAPI Demo

> **Parent phase:** Phase 8 — MiRTA OpenAPI rollout  
> **Position:** After Phase 8A API Reference completeness, before OpenAPI Playground and Stage 6  
> **Primary model:** Sonnet 5  
> **Purpose:** Provide a safe, useful, synthetic OpenAPI Demo that uses the same verified endpoint metadata as the documentation UI.

---

## 1. Objective

Implement the **OpenAPI Demo** as a first-class execution mode for documented MiRTA OpenAPI operations.

The Demo must allow users to understand how an OpenAPI operation behaves without:

- providing real credentials;
- contacting a real PBX;
- exposing customer data;
- implying behavior that is not documented.

The Demo should reuse the existing architecture and UX patterns established for the Proxy API Demo where appropriate, while keeping OpenAPI and Proxy API as separate API families.

---

## 2. Core Principle

The Demo is a **simulation provider**, not a real API client.

Preferred architecture:

```text
Shared OpenAPI endpoint metadata
          ↓
Shared request form / validation
          ↓
       ApiExecutor
       /        \
 DemoProvider  LiveProvider
     ↓
Synthetic fixture
```

If the repository already has an equivalent provider/executor abstraction, reuse it.

Do not create a second unrelated Demo system.

---

## 3. Source of Truth

Use the approved OpenAPI metadata created/validated in Phase 8A.

The Demo must derive operation definitions from the same source used by the API Reference wherever practical.

Do not hand-maintain a separate list of endpoint names, parameters, or methods if the project architecture can share them.

### Evidence handling

- `DOCUMENTED` behavior may be represented.
- `DOCUMENTED+OBSERVED` behavior may be represented.
- `UNKNOWN` behavior must remain unknown.
- `CONFLICT` behavior must not be silently resolved in fixtures.

If the response schema is not documented, do not fabricate a rich response just to make the Demo look complete.

---

## 4. Demo Safety Invariants

The Demo must:

- use synthetic data only;
- make no production PBX calls;
- make no test-PBX calls;
- require no real API key;
- require no real tenant;
- contain no copied customer data;
- contain no real DIDs;
- contain no real caller IDs;
- contain no recordings;
- contain no real email addresses;
- contain no API secrets or tokens;
- contain no production identifiers.

A Demo execution must never silently fall back to Live.

A Live failure must never trigger Demo automatically.

---

## 5. Supported Demo Operations

Create Demo coverage for documented operations where there is enough evidence to simulate the contract safely.

Prioritize:

- operations with documented request parameters;
- operations with documented request bodies;
- operations with documented response examples or response schemas;
- high-value read operations;
- representative CRUD operations using simulated state where the existing Demo architecture supports it safely.

For any operation without enough response evidence:

- keep the endpoint documented;
- allow request construction if useful;
- clearly mark the response as `Not documented` / `Demo response unavailable`;
- do not invent fields.

---

## 6. Demo Scenarios

Where supported by documentation, fixtures may include:

- success
- empty result
- validation error
- not found
- permission/auth error
- read-only-key rejection
- tenant-required error

Do not add scenarios that are not supported by evidence.

All synthetic error bodies must match documented structure when known. If error-body structure is not documented, avoid inventing an API-shaped payload.

---

## 7. Fixture Design

Fixtures should be:

- deterministic
- synthetic
- small enough to understand
- schema-aligned where schema is known
- reusable
- clearly separated from production configuration
- easy to update when the baseline changes

Prefer one fixture definition per operation/scenario or the repository's existing fixture convention.

Do not copy real responses and merely redact a few values.

---

## 8. Request Form Behavior

The Demo should use the same request form/parameter definitions as the API Reference/Playground.

Support where documented:

- path parameters
- query parameters
- tenant parameter
- global/admin indicators
- request bodies
- enums
- booleans
- dates/times
- format selectors
- aliases where the UI design intentionally supports them

Required/optional validation must come from verified metadata.

---

## 9. Response Viewer

Reuse the existing professional response viewer where possible.

Expected capabilities, if already present in the project:

- Body / Headers / Request tabs
- Tree / Raw
- expand all
- collapse all
- JSON search
- copy JSON
- download JSON
- status
- latency
- response size
- sanitized request representation

Demo responses should be visibly marked as simulated.

Do not present synthetic latency/status behavior as observed production performance.

---

## 10. Demo vs Live Visual Clarity

Users must always be able to tell whether they are in Demo or Live mode.

Demo should clearly state:

- simulated response
- no real request sent
- no credentials required

Do not use subtle labeling that can be missed.

---

## 11. Implementation Tasks

1. Inspect the existing Proxy Demo architecture.
2. Identify reusable executor/provider/fixture abstractions.
3. Connect OpenAPI metadata to the Demo execution path.
4. Add synthetic fixtures for supported OpenAPI operations.
5. Add scenario handling where documented.
6. Reuse existing request forms and response viewer.
7. Add explicit Demo labeling.
8. Ensure no Demo path can reach Live transport.
9. Add targeted unit/integration tests.
10. Add Playwright coverage.
11. Produce Demo coverage metrics.

---

## 12. Required Coverage Report

Report:

- total OpenAPI resources
- total OpenAPI operations
- Demo-supported resources
- Demo-supported operations
- operations with full synthetic responses
- operations where response is intentionally unavailable due to `UNKNOWN`
- intentionally excluded operations and reason

Do not label an operation Demo-supported if the UI merely displays its documentation but cannot simulate the expected interaction.

---

## 13. Validation

At minimum:

- `npm run check`
- `npm run build`
- relevant unit/integration tests
- Playwright against OpenAPI Demo
- verify no real network request to PBX/API infrastructure occurs in Demo
- verify no real credentials are required
- verify mode labeling
- verify validation behavior
- verify representative success and error scenarios
- verify unknown response handling
- secret/customer-data scan
- Git diff review

Network validation should explicitly prove that Demo execution cannot reach the Live PBX transport.

---

## 14. Out of Scope

Do not in this sub-phase:

- build/finish the Live OpenAPI Playground transport
- expand Live allowlists
- authorize writes in Live
- fetch the PBX OpenAPI spec
- make real API calls
- alter Proxy API behavior
- start Stage 6
- merge
- push
- tag

---

## 15. Acceptance Criteria

This sub-phase is complete when:

- OpenAPI Demo exists and is usable;
- it uses shared verified OpenAPI metadata;
- it uses synthetic data only;
- it makes no real PBX calls;
- no credentials are required;
- supported operations have evidence-based fixtures;
- unknown response schemas are not fabricated;
- Demo and Live are clearly separated;
- tests prove the Demo cannot reach Live transport;
- Proxy Demo behavior is not regressed;
- checks/build/tests pass.

---

## 16. STOP Gate

When acceptance criteria are met:

1. stop;
2. report Demo coverage;
3. report intentionally unsupported operations;
4. report unknown/conflict handling;
5. report test results;
6. report files changed;
7. report Git status;
8. ask for approval before moving to **Phase 8C — OpenAPI Playground**.

Do not begin the Playground automatically.
