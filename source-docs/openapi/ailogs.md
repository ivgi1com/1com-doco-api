# AI Logs

## Status

- Evidence: DOCUMENTED (official page, full example response)
- Scope: Tenant (read) or Global (cross-tenant read)
- Access: Read-only
- Security review: **REVIEW REQUIRED** (SEC-REQ-10)

## Purpose

Exports records from `ai_ailogs`: conversations handled by the "Talk with AI" custom destination — conversation text, duration, caller ID and token usage (`ailogs.md:3-5` → source `ai-logs.md:3-5`). Distinct from `/aianalysis` (recorded-call transcripts/summaries/sentiment).

## Official Sources

- https://manual.mirtapbx.com/books/api/page/ai-logs (rev #3, updated 2026-08-26 — the most recently updated page in the chapter). Snapshot: `source-docs/raw/mirta-openapi/ai-logs.md`. Line citations below refer to it.

## Endpoint

| Property | Value | Evidence |
|---|---|---|
| Object | `ailog` | DOCUMENTED `:9` |
| Primary path | `/ailogs` | DOCUMENTED `:9` |
| Path aliases | `/ailog`, `/ailogs`, `/ai_log`, `/ai_logs` | DOCUMENTED `:9` |
| Supported method | `GET` only | DOCUMENTED `:9`, `:85` |
| Default format | `json` | DOCUMENTED `:9` |
| Export format | `csv` | DOCUMENTED `:9` |
| Source table | `ai_ailogs` | DOCUMENTED `:9` |

## Authentication and Scope

- Accepts **all four key kinds**: tenant full, tenant read-only, global full, global read-only (`:13`) — this is the page that establishes the four-kind model used in `_common.md` §2.
- Tenant keys: own tenant only. Global keys: one tenant by code/name, `%` wildcard, or omitted for all tenants (`:15-16`).
- Optional per-key IP filtering: if enabled, the request must originate from an allowed address/network (`:17`).

## Operations

### GET /ailogs (and `/ailogs/export`, `/ailogs/{id}`)

**Query parameters:**

| Parameter | Required | Description | Evidence |
|---|---:|---|---|
| `tenant` | yes for tenant keys | code/name; global: code, name, `%`, or omitted | DOCUMENTED `:25` |
| `start` | no | applied to `ai_start`; default today 00:00:00; **ignored when `id` or `uniqueid` is supplied** | DOCUMENTED `:25` |
| `end` | no | applied to `ai_start`; default today 23:59:59; ignored with `id`/`uniqueid` | DOCUMENTED `:25` |
| `id` | no | comma-separated `ai_id` values; path segment (`/ailogs/123`) also maps here | DOCUMENTED `:25` |
| `uniqueid` | no | comma-separated Asterisk unique IDs | DOCUMENTED `:25` |
| `callerid` | no | comma-separated exact caller ID values | DOCUMENTED `:25` |
| `customid` | no | comma-separated custom destination IDs from `cu_customs` | DOCUMENTED `:25` |
| `format` | no | `json` (default) or `csv`; `/ailogs/export` defaults to `csv` | DOCUMENTED `:25` |
| `key` | no | API key; header/bearer preferred | DOCUMENTED `:25` |

**Compatibility query form:** `GET /openapi.php?object=ailogs&action=list&tenant=<code>` (`:21`).

**Response/CSV fields, in this documented order** (`:29-31`):

| Field | Description |
|---|---|
| `ai_id` | internal row ID |
| `ai_te_id` | internal tenant ID |
| `ai_cu_id` | internal custom destination ID |
| `cu_name` | associated custom destination name, when available |
| `ai_uniqueid` | Asterisk unique ID |
| `ai_callerid` | caller ID recorded for the conversation |
| `ai_start` | conversation start date/time |
| `ai_end` | conversation end date/time |
| `ai_duration` | conversation duration |
| `ai_talk` | **conversation text exchanged with the AI service** |
| `ai_total_tokens` | total tokens reported |
| `ai_input_tokens` | input tokens reported |
| `ai_output_tokens` | output tokens reported |

**Example response** (`:63-81`, tenant/number normalized):

```json
[
  {
    "ai_id": 123,
    "ai_te_id": 1,
    "ai_cu_id": 34,
    "cu_name": "AI Receptionist",
    "ai_uniqueid": "1700000000.42",
    "ai_callerid": "+15550100",
    "ai_start": "2026-01-01 09:30:00",
    "ai_end": "2026-01-01 09:31:15",
    "ai_duration": 75,
    "ai_talk": ">> I need sales.\n<< I will connect you.",
    "ai_total_tokens": 420,
    "ai_input_tokens": 280,
    "ai_output_tokens": 140
  }
]
```

- **Envelope: a top-level JSON array** (DOCUMENTED, confirmed by example).
- HTTP status: UNKNOWN.

```bash
curl -H "X-API-Key: TEST_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/ailogs?tenant=TESTTENANT"
```

CSV export (`:47-49`):

```bash
curl -H "X-API-Key: TEST_API_KEY" -o ai-logs.csv \
  "https://pbx.example.com/pbx/openapi.php/ailogs/export?tenant=TESTTENANT&start=2026-01-01%2000:00:00&end=2026-01-31%2023:59:59"
```

## Request Schema

GET only; no body.

## Response Schema

Field table and full example above (`:29-31`, `:63-81`). Array envelope confirmed.

## Aliases / Accepted Values

- Path aliases: `/ailog`, `/ailogs`, `/ai_log`, `/ai_logs`.
- `format`: `json`, `csv`.
- Compatibility query form via `?object=ailogs&action=list`.

## Security Notes

- **`ai_talk` is conversation content** — the page itself warns: "can contain sensitive conversation content. Store exports securely and restrict access to API keys" (`:89`).
- `ai_callerid` is caller PII.
- Accepts **read-only** keys, unlike Dial/Auth Token — a lower authorization bar for what is still fairly sensitive content.
- The compatibility `?object=…&action=list` form is a second, less-visible entry point to the same data (recorded, not yet assessed for whether it bypasses anything the primary path enforces — UNKNOWN).
- → **SEC-REQ-10**: REVIEW REQUIRED rather than an outright block, since content here is bounded to one custom destination's AI interactions (not full-call transcripts, unlike AI Analysis) — but `ai_talk` still needs explicit product sign-off before any Live/Demo exposure, and a field allowlist that at minimum questions whether `ai_talk` is includable at all.

## Demo Considerations

Schema and example both fully documented — feasible to fixture. Any `ai_talk` example must be obviously synthetic dialogue, not resembling real customer conversation patterns.

## Live Considerations

Read-only and accepts read-only keys, but see Security Notes — `ai_talk` is conversational content requiring a specific decision, not just a mechanical allowlist.

## Unknowns

- HTTP status codes.
- Whether the compatibility `?object=ailogs&action=list` form has different security properties than the primary path.
- CSV column order vs JSON key order (documented as the same "in this order", but not independently verified for CSV).
- Empty-result behavior.

## Conflicts

None found. (Wrapper's claims, W:122/159-161/337/463-480, match: path, GET-only, JSON/CSV, current-day default, tenant wildcard behavior for global keys, IP filtering.)

## Verification Notes

DOCUMENTED from rev #3 (most recently updated page, 2026-08-26). No call has been made.
