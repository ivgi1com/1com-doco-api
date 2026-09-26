# Phase 8D — Pre-Stage-6 Readiness Gate

> **Parent phase:** Phase 8 — MiRTA OpenAPI rollout  
> **Position:** Final implementation-readiness gate immediately before the existing Stage 6 cross-API consistency/security review  
> **Primary model:** Sonnet 5 for deterministic validation; switch to Opus 5 only after this gate passes  
> **Purpose:** Prove that Phase 8 implementation is actually feature-complete enough to enter the final high-consequence Stage 6 review.

---

## 1. Objective

This is a **readiness gate**, not another feature-building stage.

Its purpose is to verify that the three required OpenAPI surfaces are complete and internally consistent:

1. API Reference
2. Demo
3. Playground

Stage 6 must not begin until this gate passes.

If this gate finds missing implementation, remain on Sonnet 5 and fix the gap before requesting Stage 6.

---

## 2. Required Inputs

The following must already be complete and approved:

- Phase 8A — OpenAPI API Reference Completeness
- Phase 8B — OpenAPI Demo
- Phase 8C — OpenAPI Playground

Also required:

- approved OpenAPI documentation baseline
- coverage/index data
- current security requirements
- current tests
- current Phase 8 branch
- clean understanding of intentionally unsupported/Live-disabled operations

---

## 3. Readiness Questions

The gate must answer all of the following.

### API Reference

- Are all approved OpenAPI resources represented?
- Are all documented operations represented?
- Are required/optional parameters visible?
- Are request bodies documented where known?
- Are response schemas shown only where documented?
- Are unknowns explicit?
- Are security findings preserved?

### Demo

- Does OpenAPI Demo exist?
- Does it use synthetic data only?
- Can Demo run without credentials?
- Is there proof that Demo cannot contact Live/PBX transport?
- Are fixtures evidence-based?
- Are unknown response schemas not fabricated?

### Playground

- Can users browse OpenAPI resources/operations?
- Can users enter documented parameters?
- Can users construct request bodies?
- Are generated request/cURL views accurate?
- Does Demo execution work?
- Are unapproved Live operations visibly disabled?
- Are mutating operations blocked from Live unless explicitly approved?

### Shared architecture

- Do Reference, Demo, and Playground consume the same authoritative metadata where practical?
- Are there duplicate endpoint catalogs that can drift?
- Are Proxy and OpenAPI contracts still separated correctly?

---

## 4. Coverage Reconciliation

Produce one reconciled table or machine-readable report containing:

| Metric | Baseline | API Reference | Demo | Playground | Live |
|---|---:|---:|---:|---:|---:|
| Resources | | | | | |
| Operations | | | | | |
| Response schemas documented | | | | | |
| `UNKNOWN` response schemas | | | | | |
| Security-blocked operations | | | | | |

Every mismatch must be classified as one of:

- implementation gap
- intentionally unsupported
- security-blocked
- documentation `UNKNOWN`
- out of scope by explicit decision

Unexplained gaps fail this gate.

---

## 5. Security Boundary Verification

Before Stage 6, perform deterministic checks that obvious boundaries are intact.

Verify:

- Demo cannot make real PBX calls.
- No new Live allowlist entries were added without explicit approval.
- Mutating OpenAPI methods remain Live-disabled unless explicitly approved.
- No arbitrary upstream target can be supplied.
- Credentials remain server-side.
- No API keys/tokens appear in frontend bundles.
- No credentials appear in request history/logging/analytics.
- Tenant isolation code paths are unchanged or explicitly validated.
- Known `SEC-REQ-*` blockers remain enforced.
- Sensitive response data is not newly exposed by the OpenAPI UI.

This is not the final Opus security review; it is a readiness check to ensure Stage 6 is reviewing a complete, sensible implementation.

---

## 6. Regression Verification

Verify the OpenAPI completion work did not regress:

- Proxy API Reference
- Proxy Demo
- Proxy Playground
- shared navigation
- shared response viewer
- search
- responsive layout
- authentication/session behavior
- existing approved Live behavior

Any material regression fails this gate.

---

## 7. Required Validation

Run all required project checks.

At minimum:

- `npm run check`
- `npm run build`
- relevant unit/integration suites
- complete relevant Playwright suite
- targeted OpenAPI Reference tests
- targeted OpenAPI Demo tests
- targeted OpenAPI Playground tests
- Demo no-network-to-Live assertion
- Live-disabled operation assertions
- secret scan
- customer-data scan
- console-error review
- final Git diff review

If the project has a standard Phase 8 validation command or status generator, run it too.

Do not hide flaky tests. Classify each failure as:

- regression
- pre-existing flake
- environment issue
- outdated expectation
- unknown

A failing regression must be resolved before Stage 6.

---

## 8. Documentation/Status Updates

Update current project status/handoff documentation to reflect:

- 8A complete
- 8B complete
- 8C complete
- 8D validation result
- remaining known limitations
- remaining `UNKNOWN`
- security-blocked Live operations
- exact next step

Do not mark Phase 8 complete.

Do not mark Stage 6 complete.

---

## 9. Git Requirements

Before leaving this gate:

- inspect branch
- inspect `git status`
- inspect staged/unstaged/untracked changes
- inspect diff
- confirm no secrets
- confirm no unrelated changes

If existing workflow allows a progress checkpoint, create a descriptive checkpoint commit.

A checkpoint is not phase approval.

Do not:

- merge
- push
- tag
- delete branches
- rewrite history

unless separately instructed.

---

## 10. Gate Result

The result must be one of:

### PASS — Ready for Stage 6

All required surfaces are complete enough for final cross-API/security review.

Action:

1. STOP.
2. Tell the user to switch to **Opus 5**.
3. After model switch, begin the existing **Stage 6 cross-API consistency and security review**.
4. Stage 6 remains review-first.

### FAIL — Implementation gap remains

Action:

1. Remain on **Sonnet 5**.
2. Report the exact missing requirement.
3. Fix only the missing implementation.
4. Re-run affected validation.
5. Re-run this readiness gate.
6. Do not start Stage 6.

### BLOCKED — External decision/input required

Action:

1. Report the blocker precisely.
2. Do not guess.
3. Wait for user decision/input.
4. Do not start Stage 6.

---

## 11. Acceptance Criteria

This readiness gate passes only when:

- API Reference coverage is reconciled with the approved baseline;
- OpenAPI Demo is implemented and demonstrably synthetic-only;
- OpenAPI Playground is implemented for documented operations;
- unapproved Live operations remain blocked;
- known security blockers remain enforced;
- shared metadata architecture is coherent;
- no unexplained coverage gaps remain;
- Proxy API behavior is not regressed;
- required checks/build/tests pass;
- no secrets/customer data were introduced;
- Git state is understood;
- remaining limitations are documented.

---

## 12. Final Report

When the gate finishes, provide:

1. gate result: PASS / FAIL / BLOCKED
2. OpenAPI baseline resource count
3. OpenAPI baseline operation count
4. API Reference coverage
5. Demo coverage
6. Playground coverage
7. Live-enabled OpenAPI operations
8. Live-disabled/security-blocked operations
9. remaining `UNKNOWN`
10. remaining `CONFLICT`
11. known security blockers
12. regression-test result
13. Playwright result
14. build/check result
15. secret/customer-data scan result
16. branch
17. Git status
18. checkpoint commit if created
19. exact next action

If the result is PASS, end with:

> **Ready for Stage 6. Switch to Opus 5 before starting the cross-API consistency and security review.**

Then STOP.

Do not start Stage 6 in the same step.
