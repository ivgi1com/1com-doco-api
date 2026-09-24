# Decisions Log

Record decisions that should not be repeatedly re-litigated.

## 2026-09-24 — Initial architecture direction

Decision:
Use a modern developer-portal architecture rather than a static documentation-only site.

Direction:
- Next.js
- React
- TypeScript
- Tailwind CSS
- MDX
- OpenAPI-compatible internal model

Status:
Approved in planning discussion.

---

## 2026-09-24 — Proxy API first

Decision:
Proxy API is the pilot API because its smaller documentation surface makes it suitable for validating the architecture.

Status:
Approved in planning discussion.

---

## 2026-09-24 — One-endpoint prototype gate

Decision:
Implement exactly one suitable real Proxy API endpoint end-to-end before scaling.

Status:
Approved in planning discussion.

---

## 2026-09-24 — Demo environment

Decision:
Demo mode uses the same Playground UI but a separate Demo provider and never touches production systems.

Status:
Approved in planning discussion.

---

## 2026-09-24 — No-guessing protocol

Decision:
Material ambiguity requires clarification rather than silent assumptions.

Status:
Approved in planning discussion.

---

## 2026-09-24 — Git workflow

Decision:
Use `main` as the approved stable branch plus phase branches and approval tags.

Status:
Approved in planning discussion.

---

## 2026-09-24 — Model routing

Decision:
- Sonnet 5 is the default implementation model.
- Opus 5.5 handles high-consequence architecture/security/review.
- Haiku 4.5 is restricted to low-risk repetitive work.

Status:
Approved in planning discussion.

---

## 2026-09-24 — Phase 1 setup choices

Decision:
- Git initialized locally: `main` baseline + `phase/design-research`. No remote.
- Research tooling: WebSearch/WebFetch + Playwright screenshots (scratchpad, not committed) + `impeccable` rules in place of UI/UX Pro Max (not installed).
- Brand cues derived from public 1com.co.il, marked UNCONFIRMED.
- Locales: English + Hebrew (RTL) from the start.

Status:
Approved by user (plan approval, 2026-09-24).

---

## 2026-09-24 — Design direction (Phase 1 output)

Decision:
- Restrained color strategy on brand-hue-tinted neutrals; brand indigo (official) `#3731ee` as accent, violet `#781df0` as hover; lightened tint for dark mode.
- Light + dark, default follows OS; code/JSON surfaces dark in both.
- Assistant (official brand font; UI, Hebrew+Latin) + JetBrains Mono (code).
- Radii 4/6/10px.
- Three-column endpoint layout with sticky request panel; nothing hidden on mobile.
- Dedicated Playground route with persistent Live/Demo mode bar (amber Live, teal Demo) and per-response source stamp.
- Four lifecycle states shown as page banner + inline badge.

Status:
Approved by user at Phase 1 gate (2026-09-24). See `design-system/MASTER.md` "Resolved decisions".

Deferred (non-blocking):
- SVG logo availability (only raster PNG known).
- Hebrew content scope (chrome / guides / reference prose) — decide before Phase 3/4 content model.
- Sign-in / Console link destination — decide before Phase 2 nav is finalized.
- Whether to commit reference screenshots (currently no).

---

## 2026-09-24 — Process notes

Decision:
- `impeccable` init (PRODUCT.md creation) skipped: outside approved Phase 1 file scope.
- Reference-portal screenshots not committed (third-party imagery); regenerable.

Status:
Applied; revisit at gate if user prefers otherwise.

---

## 2026-09-24 — Phase 1 merge

Decision:
`phase/design-research` fast-forward merged into `main` (`dc5f5bc`).

Status:
Approved by user.

---

## 2026-09-24 — Phase 2 setup

Decision:
- Toolchain: Node 24.15.0 (LTS), npm 12.0.2. Next.js 16.3.6 (App Router, `src/`), React 19.2.8, TypeScript 5.9, Tailwind CSS 4.3.3, next-intl 4.14.7 (`/en`, `/he` prefixes via `src/proxy.ts`), shiki 4 (server-side highlighting), lucide-react (icons), vitest 5, @playwright/test 1.63.
- Prototype content: synthetic, clearly labelled "Sample API" (fictional endpoints, example.com host, 555-01xx numbers). No Proxy API claims before the Phase 3 audit.
- Header branding: official raster PNG logo from 1com.co.il, rendered as a CSS mask in theme ink colour. Swap for the SVG logo when it is provided.
- Console button: present but inert ("not available yet") until the destination is decided.
- Hebrew: UI chrome strings drafted by Claude, marked DRAFT for native review. API content prose stays English with a "not translated yet" banner until the Hebrew scope is decided.
- `AGENTS.md` added so `next dev` writes its agent rules there rather than into `CLAUDE.md`.

Status:
Approved by user (2026-09-24), except the implementation details noted as reversible.

---

## 2026-09-24 — Phase 2 approval

Decision:
Phase 2 (Design Prototype) is complete and approved. All routes/components
listed in `docs/CURRENT_STATUS.md` are built; `npm run check`, `npm run build`
and `npm run test:e2e` (58 Playwright tests, Chromium + WebKit) pass; a
`code-review` pass and a manual UI audit against `design-system/MASTER.md`
were completed and their findings fixed (see `docs/SESSION_HANDOFF.md`).

Scope:
Approval covers the Phase 2 prototype only (visual/interaction shell over
synthetic content). It does not authorize Phase 3 (Proxy API audit) or any
later phase — those need their own separate, explicit approval per
`CLAUDE.md`'s approval-gate rule.

Consequences:
- `phase/design-prototype` remains unmerged into `main` as of this decision;
  merging still needs separate explicit approval per the Git workflow rules.
- Known issues/limitations recorded at approval time (SVG logo unavailable,
  Console link destination undecided, Hebrew content scope deferred, two
  design-system documentation tensions, one acknowledged non-bug code-quality
  duplication) are accepted as-is for this phase, not blockers.

Status:
Approved by user (2026-09-24).

---

## 2026-09-24 — Phase 3 setup (Proxy API audit)

Decision (user, via plan-mode questions and plan approval):
- Source of the existing Proxy API docs: the public vendor page
  https://manual.mirtapbx.com/books/api/page/old-proxyapi-legacy-proxy-api-reference-and-examples
  (MiRTA PBX `proxyapi.php`). 1com runs MiRTA PBX.
- Proxy API stays first, even though the vendor calls it legacy and recommends
  OpenAPI for new integrations. How the portal labels it is not decided (U-03).
- Every documented reqtype is exposed to 1com customers. How this squares with
  admin-key-only operations is open (U-09).
- Scope: full audit of the Proxy page only. The 38 OpenAPI pages are indexed
  in `source-docs/inventory.json` as out of scope (Phase 8).
- Docs only: no live API calls in Phase 3. Everything stays DOCUMENTED.
- Hebrew content scope: deferred to Phase 4.
- Git: `phase/design-prototype` fast-forwarded into `main` (`1980a72`).
  Phase 3 branch `phase/proxy-api-audit` created off `main`. The tag
  `v0.2-shell-approved` already existed (user-created, annotated, on
  `20597af`), so it was left unchanged.
- Model: Opus 5.5 for the whole phase (interpretation, content-model fit,
  security findings). `CLAUDE.md` routing is canonical over the phase doc's
  "Sonnet 5" line.

Process notes (reversible, Claude's choice):
- Vendor pages are kept as local evidence snapshots with hashes. The
  session CSRF token is redacted before commit.
- Normalized data is split one YAML file per reqtype, with operations
  nested inside.

Status:
Applied. The Phase 3 audit is complete and awaiting approval at the gate.

---

## 2026-09-24 — Phase 3 approval

Decision:
Phase 3 (Proxy API Audit) is complete and approved (gate option A). Outputs:
`source-docs/{raw/,proxy-api/,inventory.json,DOCS_AUDIT.md,unresolved.md}`.

Scope:
Approval covers the audit only. The 11 items in `source-docs/unresolved.md`
stay open and are not decided by this approval. Option A authorizes Phase 4
*planning* only; implementation needs separate approval of the Phase 4 plan.

Consequences:
- `phase/proxy-api-audit` is not merged into `main`; merging needs explicit
  approval.
- No milestone tag was created (the suggested tag list has no audit-phase tag).

Status:
Approved by user (2026-09-24).

---

## 2026-09-25 — Phase 4 implementation (One Real Proxy API Endpoint)

Decision (user, via plan-mode questions and plan approval, 2026-09-24/25):
- Endpoint: `reqtype=INFO&info=EXTENSIONS` (list / by id / by number).
- Host: `https://pbx6webserver.1com.co.il/pbx/proxyapi.php`, fixed, never
  changes for proxyapi. Differs from the vendor's own `/mirtapbx/` path.
- Auth: a tenant key, including a read-only one, is sufficient.
- Lifecycle: `legacy` badge plus a note that the vendor recommends OpenAPI
  for new integrations.
- Hebrew: English endpoint prose plus the existing "not translated yet"
  banner, unchanged from Phase 2. Content model stays single-locale.
- Content model: extend the existing API-neutral model rather than modeling
  Proxy as synthetic REST or as a separate model (U-07).
- Sample API: kept, clearly labelled prototype. Proxy API is now `apis[0]`
  (the default API across home, the API-reference redirect, and Playground).
- Response: the user was asked to supply one sanitized real response; not
  received as of this checkpoint. The endpoint ships with `responses: []`
  and the page truthfully shows "Not documented by the source" rather than
  a fabricated example. This is recorded as the one item still blocking the
  Phase 4 completion gate (`source-docs/unresolved.md` U-11).
- Errors and the vendor-text-reuse question (U-02, U-04) were left at their
  audit-recommended defaults (undocumented / original prose), not decided
  by the user; both are reversible.

Implementation notes (Claude's engineering choices, reversible):
- `src/content/proxy-api.ts` is hand-authored from the Phase 3 YAML
  evidence, not generated. A YAML→content generator is a Phase 7 concern.
- Query-parameter authentication (the Proxy API's `key`) is a new code-path
  in `src/lib/code-samples.ts`, additive alongside the existing header-auth
  path; the Sample API's samples are pinned unchanged by a regression test.
- Fixed two real, pre-existing bugs surfaced by having a second real API
  (previously masked because Sample API was always `apis[0]`):
  1. `ReferenceNav`'s API/version switcher was hardcoded to `apiId="sample"`
     and its `<select>` had no `onChange` — it always showed Sample API's
     sidebar regardless of the page being viewed, and picking an option did
     nothing. Fixed by making it a client component that reads the current
     API from the path (`usePathname`) and wired the switcher to navigate.
  2. `playground/page.tsx` always used `apis[0]` regardless of the
     requested endpoint's own API, and the home page's/API-overview page's
     "planned APIs" list still listed "Proxy API" as not-yet-documented.
     Both fixed.
- Playground's Demo mode never replays a response for a non-synthetic API
  (`PlaygroundResponse` gained an `unavailable` variant); it shows "Demo
  data not available yet" instead. This upholds the Evidence rule even once
  a real (`observed-sanitized`) response is eventually added — Demo must
  still never replay it.
- `buildPlaygroundSamples` is now cached per API id (like the existing
  `getSearchIndex()`), fixing a genuine performance issue: it recomputed
  shiki highlighting for every endpoint/language on every request/prefetch.
  Also fixed `tests/e2e/smoke.spec.ts`'s console-error check to use
  `waitForLoadState("load")` instead of `"networkidle"` — Next's Link
  prefetching keeps the network busy in the background, which is normal,
  not a defect, and Playwright's own docs discourage relying on
  `networkidle` for this reason.

Status:
Applied. Steps 1-5 and 7 of the approved plan are complete and verified
(`npm run check`, `npm run build`, 80/80 Playwright tests on Chromium +
WebKit, manual visual pass at 1440/1024/768/390 desktop/tablet/mobile,
en+he, zero console errors). Step 6 (this entry) is complete except that
the response/schema content itself remains blocked on U-11. Phase 4 is not
yet approved — awaiting the sanitized response and the gate decision.
