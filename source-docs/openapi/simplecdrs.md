# Simple CDR

## Status

- Evidence: DOCUMENTED (official page, full parameter/field tables; no JSON example given, but every field is named and described)
- Scope: Tenant (read) or Global (cross-tenant read)
- Access: Read-only
- Security review: **BLOCK LIVE** (SEC-REQ-08)

## Purpose

A simplified, read-only call-history reporting endpoint — fewer/renamed fields than full CDR (`simplecdrs.md:3` → source file `simple-cdr.md:3`).

## Official Sources

- https://manual.mirtapbx.com/books/api/page/simple-cdr (rev #13, updated 2026-07-03). Snapshot: `source-docs/raw/mirta-openapi/simple-cdr.md`. Line citations below refer to it.

## Endpoint

| Property | Value | Evidence |
|---|---|---|
| Object | `simplecdr` | DOCUMENTED `:7` |
| Primary path | `/simplecdrs` | DOCUMENTED `:7` |
| Path aliases | `/simplecdr`, `/simplecdrs`, `/simple_cdr`, `/simple_cdrs` | DOCUMENTED `:7` |
| Supported method | `GET` only | DOCUMENTED `:3`, `:7` |
| Default format | `json` | DOCUMENTED `:7` |
| Compatibility formats | `template`, `xml` | DOCUMENTED `:7` |

## Authentication and Scope

Same as CDR: tenant keys require `tenant=`; global keys can wildcard with `%` (`:3`, `:15`). Writes return `method_not_allowed`.

## Operations

### GET /simplecdrs

**Query parameters:**

| Parameter | Required | Description | Evidence |
|---|---:|---|---|
| `tenant` | yes for tenant keys | tenant code or name; global `%` wildcard supported | DOCUMENTED `:15` |
| `start` | no | default today 00:00:00 | DOCUMENTED `:15` |
| `end` | no | default today 23:59:59 | DOCUMENTED `:15` |
| `id` | no | comma-separated simple-CDR IDs; path segment also maps here | DOCUMENTED `:15` |
| `uniqueid` | no | comma-separated Asterisk unique IDs | DOCUMENTED `:15` |
| `calleridnum` | no | comma-separated caller-ID numbers | DOCUMENTED `:15` |
| `calleridname` | no | comma-separated caller-ID names | DOCUMENTED `:15` |
| `disposition` | no | e.g. `ANSWERED`, `NO ANSWER`, `BUSY`, `FAILED` | DOCUMENTED `:15` |
| `direction` | no | comma-separated, e.g. `IN`, `OUT`, `LOCAL` | DOCUMENTED `:15` |
| `dialednum` | no | comma-separated dialed numbers | DOCUMENTED `:15` |
| `whoanswered` | no | comma-separated extension/user/object that answered | DOCUMENTED `:15` |
| `phone` | no | comma-separated; searched across `sc_whoanswered`, `sc_calleridnum`, `sc_dialednum` | DOCUMENTED `:15` |
| `minduration` | no | minimum total duration, seconds, exclusive | DOCUMENTED `:15` |
| `mintalktime` | no | minimum answered talk time, seconds, exclusive | DOCUMENTED `:15` |
| `format` | no | `json` (default), `template`, `xml` | DOCUMENTED `:15` |
| `template` | no | template name; only with `format=template`/`xml` | DOCUMENTED `:15` |
| `contenttype` | no | Content-Type override | DOCUMENTED `:15` |

**Filtering rules (`:29-31`):** date range applies only when neither `id` nor `uniqueid` is set; `mintalktime` uses the stored billsec/talk-time value; template/XML requires exactly one tenant.

**Response fields** (`:19`):

| Field | Description |
|---|---|
| `sc_te_id` | internal tenant ID |
| `tenantcode` | tenant code |
| `sc_start` | start timestamp |
| `sc_direction` | `IN` / `OUT` / `LOCAL` |
| `sc_calleridnum` | caller ID number |
| `sc_calleridname` | caller ID name |
| `sc_dialednum` | dialed number |
| `sc_disposition` | call disposition |
| `sc_duration` | total duration, seconds |
| `sc_billsec` | answered talk time, seconds |
| `sc_uniqueid` | Asterisk unique ID |
| `sc_whoanswered` | extension/user/object that answered |

**Template variables** (used inside `{row_loop}` for `format=template`/`xml`, `:25`):

| Variable | Description |
|---|---|
| `{$end}` | computed end timestamp: `sc_start` + `sc_duration` |
| `{$clid}` | `"sc_calleridname" <sc_calleridnum>` |
| `{$callerid_number}` | alias for `sc_calleridnum` |
| `{$callerid_name}` | alias for `sc_calleridname` |
| `{$firstdst}` | alias for `sc_dialednum` |
| `{$talk_time}` | alias for `sc_billsec` |
| `{$who_answered}` | alias for `sc_whoanswered` |

```bash
curl -H "X-API-Key: TEST_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/simplecdrs?tenant=TESTTENANT&start=2026-01-01%2000%3A00%3A00&end=2026-01-01%2023%3A59%3A59"
```

Combined filters (`:76-77`, normalized):

```bash
curl -H "X-API-Key: TEST_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/simplecdrs?tenant=TESTTENANT&calleridnum=5550100&calleridname=Demo%20Caller&dialednum=100"
```

## Request Schema

GET only; no body.

## Response Schema

Field table above (`:19`). No JSON example on the page (unlike AI Analysis/AI Logs/Extension State). Envelope shape, types, and empty-result behavior UNKNOWN.

## Aliases / Accepted Values

- Path aliases: `/simplecdr`, `/simplecdrs`, `/simple_cdr`, `/simple_cdrs`.
- `sc_direction`: `IN`, `OUT`, `LOCAL` (examples, not stated exhaustive).
- `format`: `json`, `template`, `xml`.

## Security Notes

- `sc_calleridnum`, `sc_calleridname`, `sc_dialednum` are caller PII.
- Lower field count than CDR (no billing/cost fields), but still customer call metadata.
- Same template/XML rendering path as CDR — same caveat about tenant-defined template content.
- → **SEC-REQ-08**: default-deny field allowlist before Live.

## Demo Considerations

Field names are fully documented, but with no JSON example the envelope shape is unconfirmed (`PARTIAL`). A fixture built purely from the field table risks inventing structure; wait for a spec or authorized observation.

## Live Considerations

Read-only, but exposes caller PII. Requires SEC-REQ-08.

## Unknowns

- JSON envelope (array vs object; pagination).
- Field types.
- HTTP status codes.
- Full `sc_direction`/`disposition` enums.
- Empty-result behavior.

## Conflicts

None found. (Wrapper's Simple CDR claims, W:90/148-151/335, match.)

## Verification Notes

DOCUMENTED from rev #13. No call has been made.
