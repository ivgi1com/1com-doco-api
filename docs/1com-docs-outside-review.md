# 1com Developers — Documentation Review

**Reviewed:** October 2026
**Scope:** Content, structure, auth flow, reference pages (dial as sample), search/navigation. Visual design (colors, typography, mobile) not yet inspected.

---

## The one big issue (fix first)

The whole site is written as if a **third party is analyzing an unfamiliar API** rather than the team that built it. Phrases like *"The source documents…"*, *"Not documented by the source"*, *"Vendor sample"*, *"the portal's placeholder"* appear throughout. Worse, the site openly says:

- *"Verification: Not verified against a live API"*
- *"No Open API operation has been tested against a real PBX"*

A customer reading that closes the tab. **This is your API — document it with authority and fill the gaps instead of leaving them "undocumented."**

---

## Critical (credibility & correctness)

1. **Rewrite all copy in a first-party, authoritative voice.** Remove every "source / portal / vendor / not verified" reference.
2. **Document HTTP status codes and the error-body schema.** Currently statuses show as "undocumented" and the 200 is a "placeholder."
3. **Resolve the Live contradiction.** Home page says the Playground has a Live mode; the auth page says nothing is Live yet.
4. **Sync search with the sidebar.** `settings` and `provisioning phones` appear in search but are missing from the sidebar.
5. **Hide the leftover "Sample (prototype)"** section (`/v1/contacts`) — looks like forgotten scaffolding.

---

## Expert-developer perspective

- **Base URL exposes `/pbx/openapi.php/`** — a PHP filename in the path, and no version prefix (e.g. `/v1`).
- **Path style is inconsistent:** `campaignnumbers`, `calleridblacklists` instead of kebab-case / nested resources (`/campaigns/{id}/numbers`).
- **ID naming is inconsistent** (`ex_id`, `uniqueid`); the same `cr_id` is used for both conference rooms and cron jobs.
- **Response casing is mixed** (`Response`, `ID` next to `source`, `dest`); `dialtimeout` is an int while `timeout` is a string.
- **Key-in-query-param still supported** — should be removed (keys leak into logs/URLs).
- **`tenant` query param is redundant** if the key is already tied to a tenant.
- **Legacy destructive actions use GET** (delete, hang up, reboot, pause) and all sit on the same `proxyapi.php` path, so the reference can't show how they differ.

### Missing for a serious API

- Pagination
- Rate limits
- **Webhooks / call events** (critical for VoIP — real-time answered/hung-up)
- Changelog
- Downloadable OpenAPI spec (for code generation)

---

## Beginner perspective

- **"Get started" button misleads** — it links to the auth page, not a real quickstart. The actual "Getting started" page only shows up in search.
- **No glossary** for DID, DISA, Hunt List, BLF, Feature Code — a newcomer gets lost.
- **Sidebar overwhelms** — ~25 resources with full CRUD, no task-based ordering.
- **Unclear how to get an API key** or where the tenant code comes from.
- **Three API versions** in the selector with no guidance on which to pick.

---

## What works well

- Code examples in cURL, JavaScript, and Python with copy buttons.
- Sending the key in the header (good default).
- Clear "changes state" warnings on write operations.
- Search with Ctrl+K.
- Reference pages follow a consistent structure.

---

## Suggested fix order

1. Rewrite all copy in an authoritative voice; delete "source / portal / not verified" language.
2. Document HTTP status codes and the error schema.
3. Build a 5-minute Quickstart (API key → first call) + a glossary.
4. Hide the Sample section; sync search with the sidebar.
5. Resolve the Live contradiction in the docs.
