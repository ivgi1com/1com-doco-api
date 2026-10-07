# Phase 8E — Customer-facing change brief

> **Status (2026-10-01): IN PROGRESS — Stage 0 (setup).** Branch `phase/customer-brief`, created from `phase/open-api` @ `4d1c8ab` (the 8D readiness checkpoint). Not pushed, merged or tagged.
> **Source brief:** `docs/phases/1com_API_Documentation_App_Change_Brief.md` (12 items; item 12 is an open question, not implementation).
> **Position:** after 8D (PASS), **before** the Phase 8 Stage 6 Opus cross-API consistency and security review. The 8D result is re-run at the end of this phase against the reduced surface.
> **Primary model:** Sonnet 5. Stage 2 (exclusion mechanism + `docs/SECURITY.md` notes) is routed to Opus 5; everything else Sonnet 5.

## 1. Objective

Make the portal customer-ready without breaking API integration, request formats, routes or internal identifiers: 1com branding, one "API Key" label, no admin/SysAdmin content, PBX-based example IDs, no Console button, no Change Log in the nav, date/time pickers, Open API first and default, a Guides API selector, and a "Most Used Cases" entry point.

Out of scope (cancelled in the brief): the Playground/Demo audit for missing JSON responses after Send.

## 2. Decisions (user, 2026-10-01)

| Topic | Decision |
|---|---|
| Admin removal | Everything admin-keyed: 27 OpenAPI operations (Tenants, Users, User Profiles, Routing Profiles, Providers x5 each; Auth Token x2), 35 Proxy ManageDB operations, the ManageDB guide, Admin sections of guides, the `global=1` parameter and "or global key" wording. Approved baseline documents stay untouched; an explicit exclusion list reconciles the inventory tests. |
| OpenAPI name | "1com Open API" (the Proxy entry stays "Proxy API"). |
| SRV | Call-ID prefixes `srv02-<id>` become `PBX-<id>`; node/peer example ids become `PBX`. Live responses are never rewritten. |
| Date/time | Native date input (plus a time input with seconds for date-times), combined into the exact documented string, no timezone conversion, Clear button, documented-format fields only. |
| Popup / post-call | Ship Click to Call and CDRs now. The inbound-call popup and post-call delivery are added only after the user supplies mechanism, payload and example. Nothing invented. |
| Sample guide | Kept as a third Guides selector entry, "Sample (prototype)", unchanged. |
| Sequencing | New phase before Stage 6. |

## 3. Defaults chosen (confirmed by plan approval)

1. The "Key scope" line/chip is dropped; `Authentication.scope` values are removed from content.
2. The `tenant` parameter reads "Tenant code." with the condition "Required with your API Key"; its `required` flag is unchanged.
3. The read-only vs full key distinction stays, worded "API Key with write access" / `read_only_api_key`.
4. Demo error `message` bodies that mimic real API output stay verbatim; labels and prose use "API Key".
5. Env var names in code samples (`$OPENAPI_API_KEY`, `$PROXY_API_KEY`) are unchanged.
6. A date-only selection on a date-time field applies the documented default time (start 00:00:00, end 23:59:59); fields without a documented format stay text.
7. Playground default endpoint for Open API: `simplecdrs-list`, via an additive `defaultEndpoint` on the API definition.
8. The Change Log nav entry, the empty placeholder route and its i18n keys are deleted.
9. Proxy is listed second with a small "legacy" qualifier; Sample last. No stored selection exists to preserve.
10. Hebrew strings are DRAFT; guide/reference prose stays English.
11. Open: `src/content/proxy/info.ts:110` quotes the vendor's real example path `/mirtapbx/proxyapi.php`. Kept until the user rules (asked at Stage 1).

## 4. Stages

0. Setup: branch, brief committed, this document, DECISIONS entry, baseline check.
1. Branding, API Key wording, SRV (items 1, 2, 4) and the customer-copy guard tests.
2. Remove admin-keyed content (item 3), exclusion list, SECURITY.md notes, test/script updates. Opus for the mechanism.
3. Remove Console and Change Log (items 5, 6).
4. Date/time pickers (item 7).
5. Open API first/default (item 8).
6. Guides selector and "Most Used Cases" (items 9, 10, 11).
7. Regression, readiness re-run, full validation.
8. Gate: Phase Completion Report and the A/B/C/D question.

## 5. Acceptance criteria

The acceptance criteria of each brief item, shown by tests (customer-copy guard, exclusion, ordering, picker serialization, navigation) and by UI checks on desktop, tablet, mobile and Hebrew; `npm run check`, `npm run build` and the full Playwright suite pass; the 8D readiness script has zero unexplained gaps against the new expected counts (OpenAPI 132 operations / 31 resources, Proxy 74 operations); no secrets or customer data introduced.

## 6. Git

One branch for this phase. Per-stage commits. No merge, push or tag without explicit instruction.
