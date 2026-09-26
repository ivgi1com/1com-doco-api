# CDR

## Status

- Evidence: DOCUMENTED (official page, full parameter and field tables, multiple examples)
- Scope: Tenant (read) or Global (cross-tenant read)
- Access: Read-only
- Security review: **BLOCK LIVE** (SEC-REQ-07)

## Purpose

Read-only call detail record (CDR) reporting endpoint (`cdrs.md:3` → source file `cdr.md:3`).

## Official Sources

- https://manual.mirtapbx.com/books/api/page/cdr (rev #13, updated 2026-07-03). Snapshot: `source-docs/raw/mirta-openapi/cdr.md`. Line citations below refer to it.

## Endpoint

| Property | Value | Evidence |
|---|---|---|
| Object | `cdr` | DOCUMENTED `:7` |
| Primary path | `/cdrs` | DOCUMENTED `:7` |
| Path aliases | `/cdr`, `/cdrs`, `/call`, `/calls` | DOCUMENTED `:7` |
| Supported method | `GET` only | DOCUMENTED `:3`, `:7` |
| Default format | `json` | DOCUMENTED `:7` |
| Compatibility formats | `template`, `xml` | DOCUMENTED `:7` |

## Authentication and Scope

- Tenant API keys must include `tenant=<code>` (`:3`).
- Global API keys can query one tenant by code/name, or use `%` SQL-style wildcards (`:3`, `:15`).
- Write methods (create/update/delete) return `method_not_allowed` (`:3`).

## Operations

### GET /cdrs (and `/cdr`, `/call`, `/calls`)

**Query parameters:**

| Parameter | Required | Description | Evidence |
|---|---:|---|---|
| `tenant` | yes for tenant keys | tenant code or name; global keys can use `%` wildcards | DOCUMENTED `:15` |
| `start` | no | start date/time; defaults to today 00:00:00 | DOCUMENTED `:15` |
| `end` | no | end date/time; defaults to today 23:59:59 | DOCUMENTED `:15` |
| `id` | no | comma-separated CDR IDs; a path segment (`/cdrs/123`) also maps here | DOCUMENTED `:15` |
| `uniqueid` | no | comma-separated Asterisk unique IDs | DOCUMENTED `:15` |
| `linkedid` | no | comma-separated linked IDs, groups call legs | DOCUMENTED `:15` |
| `src` | no | comma-separated source values | DOCUMENTED `:15` |
| `firstdst` | no | comma-separated first-destination values | DOCUMENTED `:15` |
| `disposition` | no | comma-separated, e.g. `ANSWERED`, `NO ANSWER`, `BUSY`, `FAILED` | DOCUMENTED `:15` |
| `direction` | no | `IN`, `OUT`, `IN,OUT`, or `OUT,IN` (based on the CDR userfield mapping) | DOCUMENTED `:15` |
| `phone` | no | comma-separated; searched across `src`, `dst`, `firstdst`, `lastdst`, `realsrc`, `wherelanded` | DOCUMENTED `:15` |
| `format` | no | `json` (default), `template`, or `xml` | DOCUMENTED `:15` |
| `template` | no | template name; only with `format=template`/`xml` | DOCUMENTED `:15` |
| `contenttype` | no | Content-Type override for rendered template output | DOCUMENTED `:15` |

**Filtering rules (`:23-26`):**
- If neither `id` nor `uniqueid` is supplied, the start/end date range applies.
- If neither `id` nor `linkedid` is supplied, the date range also applies.
- Template/XML output requires the request to resolve to exactly one tenant (error `single_tenant_required`).
- The endpoint "may repair attended-transfer and where-landed CDR metadata while preparing results" — an undocumented normalization step, not raw storage.

**Response fields** (JSON object per record; envelope — array vs wrapper object — is UNKNOWN):

| Field | Description |
|---|---|
| `accountcode` | tenant code stored on the CDR |
| `ID` | internal CDR row ID |
| `start` | call start timestamp |
| `answer` | answer timestamp |
| `end` | call end timestamp |
| `clid` | full caller ID string |
| `realsrc` | normalized/real source value |
| `firstdst` | first dialed destination |
| `duration` | total duration, seconds |
| `billsec` | answered talk time, seconds |
| `disposition` | Asterisk call disposition |
| `cc_cost` | calculated tenant-side call cost, when available |
| `dcontext` | Asterisk destination context |
| `dstchannel` | destination channel |
| `userfield` | MiRTA call marker (often direction info) |
| `uniqueid` | Asterisk unique ID |
| `prevuniqueid` | previous unique ID for linked-leg processing |
| `lastdst` | last destination reached |
| `wherelanded` | final PBX object/destination |
| `src` | Asterisk source value |
| `dst` | Asterisk destination value |
| `lastapp` | last Asterisk application executed |
| `srcCallID` | source SIP Call-ID, when available |
| `linkedid` | Asterisk linked ID |
| `peeraccount` | Asterisk peer account value |
| `originateid` | origination tracking ID, when available |
| `cc_country` | rated country, when rating data available |
| `cc_network` | rated network, when rating data available |
| `pincode` | PIN code associated with the call, when present |
| `cc_buy` | calculated buy-side cost, when available |

(`:19`)

- No JSON example is given for CDR (unlike Simple CDR / AI Logs / AI Analysis / Extension State). Field **names and descriptions** are DOCUMENTED; actual JSON **types, envelope shape and empty-result behavior** are UNKNOWN.
- HTTP status codes: UNKNOWN.

```bash
curl -H "X-API-Key: TEST_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/cdrs?tenant=TESTTENANT&start=2026-01-01%2000%3A00%3A00&end=2026-01-01%2023%3A59%3A59"
```

Global-key tenant wildcard (`:107-108`):

```bash
curl -H "X-API-Key: GLOBAL_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/cdrs?tenant=TEST%25&start=2026-01-01%2000%3A00%3A00&end=2026-01-01%2023%3A59%3A59"
```

Template/XML output (`:116-117`):

```bash
curl -H "X-API-Key: TEST_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/cdrs?tenant=TESTTENANT&format=template&template=Docs%20CDR%20Export&contenttype=text%2Fcsv"
```

## Request Schema

GET only; no body.

## Response Schema

Field table above (`:19`). Types, envelope and empty-result behavior UNKNOWN.

## Aliases / Accepted Values

- Path aliases: `/cdr`, `/cdrs`, `/call`, `/calls` (`:7`).
- `disposition`: `ANSWERED`, `NO ANSWER`, `BUSY`, `FAILED` (examples given, not stated as exhaustive).
- `direction`: `IN`, `OUT`, `IN,OUT`, `OUT,IN`.
- `format`: `json`, `template`, `xml`.

## Security Notes

- Response fields include `clid` (full caller ID string), `src`/`dst`/`realsrc`/`firstdst`/`lastdst` (phone numbers), and `pincode`. These are customer call-metadata and potentially sensitive PIN data.
- `cc_cost`/`cc_country`/`cc_network`/`cc_buy` are billing-rate fields — business-sensitive, not customer-private, but still worth allowlist scrutiny.
- Template/XML output renders through a tenant-configured template — a second, less-audited output path with its own `contenttype` override.
- → **SEC-REQ-07**: a default-deny field allowlist before Live, excluding `pincode` and billing-cost fields unless a business decision says otherwise; template/XML output requires a tenant-registered template, whose own content is out of scope of this baseline (UNKNOWN what a template can render).

## Demo Considerations

The field table is complete but the JSON shape has no example (unlike Simple CDR). A fixture would need either a supplied spec/example or an authorized observation to avoid inventing the envelope shape. Currently `PARTIAL` for this reason.

## Live Considerations

Read-only, but see Security Notes. Requires SEC-REQ-07 before any Live exposure. The `%`-wildcard cross-tenant search for global keys is a broader blast radius than a single-tenant read and should be excluded from any Live allowlist regardless.

## Unknowns

- JSON envelope shape (array vs object; pagination).
- Exact types (string vs number vs null) for every field.
- HTTP status codes.
- Full enum of `disposition` values.
- Empty-result behavior.
- What `format=template`/`xml` actually renders structurally (depends on the tenant's own template).

## Conflicts

None found. (Wrapper's CDR claims, W:89/144-151/334, match: path `/cdrs`, GET-only, reporting.)

## Verification Notes

DOCUMENTED from rev #13. No call has been made.
