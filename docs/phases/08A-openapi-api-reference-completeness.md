# Phase 8A — OpenAPI API Reference Completeness

> **Parent phase:** Phase 8 — MiRTA OpenAPI rollout  
> **Position:** Inserted before the existing Phase 8 Stage 6 cross-API consistency/security review  
> **Primary model:** Sonnet 5  
> **Purpose:** Make the application API Reference accurately and completely represent the approved MiRTA OpenAPI documentation baseline before final review.

---

## 1. Objective

Bring the application's **OpenAPI API Reference** into alignment with the approved local MiRTA OpenAPI documentation baseline.

The API Reference must not be a shallow list of resource names or endpoint paths. It should expose the useful, verified engineering information already present in the approved documentation so a developer can understand how to use each documented resource.

This sub-phase is complete only when the application reference has been audited against the approved OpenAPI baseline and all supported documentation has been represented correctly.

---

## 2. Source of Truth

Use the approved local MiRTA OpenAPI documentation baseline and its generated indexes as the authoritative implementation input for this sub-phase.

Expected source material includes, where present:

- `source-docs/openapi/` or the repository's approved OpenAPI baseline location
- resource Markdown files
- `_common.md`
- coverage/index documents
- `resources.json`
- official MiRTA source snapshots
- `SOURCES.md`
- OpenAPI audit/unresolved-items records
- repository-level OpenAPI documentation instructions

Do not use memory or previous assumptions when the approved baseline disagrees.

### Evidence rules

Preserve the existing evidence model:

- `DOCUMENTED`
- `OBSERVED`
- `DOCUMENTED+OBSERVED`
- `CONFLICT`
- `UNKNOWN`

If the approved baseline does not establish a field, schema, response, method, or behavior, the application must not invent it.

Use labels such as:

- `Unknown`
- `Not documented`
- `Response schema not documented`

where appropriate.

---

## 3. Scope

Audit and complete every OpenAPI resource represented by the approved baseline.

For each resource, expose all applicable documented information.

### Identity and purpose

- resource name
- concise purpose
- official source reference where the application design supports it
- primary path
- path aliases
- resource status/evidence state

### HTTP contract

- supported HTTP methods
- operation purpose
- read-only vs mutating classification
- special actions

Never infer CRUD support.

### Authentication and scope

- accepted authentication mechanism
- API-key requirements
- tenant-key behavior
- global/admin-key behavior
- read-only vs writable/full-key requirements
- tenant requirement
- tenant/global/admin scope
- global-mode behavior where documented

### Parameters

- path parameters
- query parameters
- required/optional state
- type where documented
- accepted aliases
- accepted values/enums
- defaults
- filters
- pagination where documented
- date/time formats
- output-format options
- compatibility parameters

### Request body

For mutating operations, expose where documented:

- required fields
- optional fields
- aliases
- types
- enums/accepted values
- nested structures
- validation rules
- destination structures
- special behavior

### Response information

Expose only what is actually documented:

- response shape
- field names
- field types
- arrays/objects
- nested structures
- empty-result behavior
- documented errors
- documented examples

If a response schema is not documented, say so explicitly.

### Examples

Where supported by the approved baseline, expose normalized synthetic examples:

- cURL
- request URL
- request body
- response example
- authentication example

Never introduce real customer or credential data.

---

## 4. Architecture Requirement

Prefer a **single authoritative OpenAPI metadata model** feeding the API Reference.

Do not manually duplicate the same endpoint facts in multiple UI-specific files if the existing architecture can consume shared metadata.

Preferred direction:

```text
Approved OpenAPI baseline
        ↓
Normalized OpenAPI metadata
        ↓
API Reference
        ↓
Demo
        ↓
Playground
```

The exact implementation must follow the existing repository architecture rather than forcing a new structure unnecessarily.

If the project already has a reusable endpoint/content model, extend it rather than creating a parallel OpenAPI-only system.

---

## 5. UI/UX Requirements

Keep the established design system and existing Proxy API documentation UX.

The OpenAPI API Reference should be:

- easy to scan
- consistent across resources
- explicit about required vs optional inputs
- explicit about read-only vs mutating operations
- explicit about tenant/global scope
- explicit about missing/unknown information
- visually consistent with Proxy API where concepts are shared
- clearly identified as OpenAPI where API-family distinction matters

Do not hide security or evidence limitations in tooltips only. Important limitations must be visible in the resource/operation content.

---

## 6. Security Requirements

The API Reference may document sensitive resources, but documentation must not leak sensitive values.

Never render or commit:

- API keys
- passwords
- SIP/PJSIP secrets
- auth tokens
- PINs
- 2FA secrets
- provisioning credentials
- real customer data
- real phone numbers/DIDs
- recordings
- real tenant identifiers

When a resource is known to have Live security concerns, surface an appropriate developer-facing warning or internal metadata flag if the application architecture supports it.

Preserve known security findings, including any existing `SEC-REQ-*` records.

Documentation of an endpoint does not authorize Live access.

---

## 7. Implementation Tasks

1. Inspect the current OpenAPI API Reference implementation.
2. Produce a baseline-to-app coverage comparison.
3. Identify resources present in source documentation but missing from the application.
4. Identify operations present but incompletely documented in the UI.
5. Identify metadata fields that exist in the baseline but are not exposed.
6. Identify any application content that contradicts the approved baseline.
7. Normalize the OpenAPI metadata source where necessary.
8. Update the API Reference to consume the complete supported metadata.
9. Preserve explicit `UNKNOWN` / `Not documented` states.
10. Update navigation/search/indexing if newly represented resources or operations require it.
11. Ensure Proxy API reference behavior is not regressed.
12. Add or update tests.

---

## 8. Required Coverage Report

Before this sub-phase can pass, report:

- total documented OpenAPI resources in the approved baseline
- total documented operations in the approved baseline
- resources represented in the application API Reference
- operations represented in the application API Reference
- resources missing before this work
- operations missing before this work
- resources/operations added
- intentionally excluded items and reason
- remaining `UNKNOWN` items
- remaining `CONFLICT` items

Do not claim 100% coverage merely because resource names exist in navigation.

Coverage means the relevant documented contract is represented.

---

## 9. Validation

Run the repository's normal required checks plus targeted API Reference checks.

At minimum:

- `npm run check`
- `npm run build`
- relevant unit/integration tests
- targeted Playwright coverage for OpenAPI API Reference
- navigation checks
- search checks
- representative desktop/mobile viewport checks
- console-error review
- secret/customer-data scan
- Git diff review

Verify representative resources from different categories, not just one resource.

Include at least:

- one read-only resource
- one CRUD resource
- one tenant-scoped resource
- one global/admin resource if documented
- one resource containing `UNKNOWN` response details
- one resource with a security warning

---

## 10. Out of Scope

Do not in this sub-phase:

- build the OpenAPI Demo
- build the OpenAPI Playground
- enable new Live operations
- expand Live allowlists
- make real PBX API calls
- mutate the PBX
- alter Proxy API behavior
- start Stage 6
- merge to `main`
- push
- tag

Those are separate decisions/sub-phases.

---

## 11. Acceptance Criteria

This sub-phase is complete when:

- the API Reference has been audited against the approved OpenAPI baseline;
- every supported resource is represented;
- every documented operation is represented appropriately;
- required/optional parameters and request-body information are exposed where documented;
- response information is shown only where supported by evidence;
- unknowns are explicit;
- security/evidence status is preserved;
- navigation/search still work;
- Proxy API reference behavior is unchanged;
- tests/build/checks pass;
- no secrets or customer data were introduced.

---

## 12. STOP Gate

When acceptance criteria are met:

1. stop implementation;
2. report what was missing and what was added;
3. report coverage numbers;
4. report remaining unknown/conflict items;
5. report tests and validation;
6. report files changed;
7. report Git status;
8. ask for approval before moving to **Phase 8B — OpenAPI Demo**.

Do not interpret successful checks as approval.
