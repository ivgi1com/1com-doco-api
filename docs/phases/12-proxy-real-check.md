# Phase 12 — Proxy API real-PBX redaction check

> **Status (2026-10-09): DONE — at the approval gate.** Branch `phase/proxy-real-check`.
> **Model:** Opus 5.5 (judging real redaction output is security work).

## Why

Phase 10 made every Proxy read Live; Phase 11 checked only Open API reads
against the real PBX (and found OA-19). The user chose to check **all**
Proxy Live reads with a Proxy TEST key.

## What was run

`tests/e2e/live-real.spec.ts`, block "Phase 12" (env `PROXY_TEST_KEY` +
`PROXY_TEST_TENANT`, chromium only, counts and ids only, 7 s between
requests). It walks every Proxy GET read in the content model plus the three
strict-policy targets; the portal decides blocked vs Live. It fails only on a
leak: the key in the response, a secret-named JSON value, a secret column in
a plain-text table, or a secret URL query parameter.

## Result (2026-10-09, temporary TEST key, tenant scope)

- 40 operations walked: 7 blocked by the portal (as designed), 33 Live
  targets.
- 31 answered by the PBX: **0 leaks**, no non-200 upstream answers.
- 2 timed out upstream (portal limit 10 s), so nothing was shown and they
  were not checked: `info-call`, `countpeers`.
- 2 answers withheld whole by the portal's fail-closed redaction (safe, but
  the user sees no data): `info-cdrs`, `agent-listqueues` (DOCS_AUDIT OA-20).
- No required parameter lacked a documented example.

## Open

- `info-call` / `countpeers`: unchecked (upstream slower than 10 s).
- `info-cdrs` / `agent-listqueues`: withheld in Live; making them readable
  would need a policy change (security decision, not started).
- Rotate the TEST key (pasted in chat).
