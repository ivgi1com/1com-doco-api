# AI Logs

The **AI Logs** endpoint exports records from `ai_ailogs`. It is a read-only OpenAPI endpoint that supports JSON responses and downloadable CSV files.

Use this endpoint to report on conversations handled by the Talk with AI custom destination, including the conversation text, duration, caller ID, and token usage. To retrieve call transcripts, summaries, and sentimental analysis instead, use the `/aianalysis` endpoint.

## Object Summary

<table id="bkmrk-propertyvalueobjecta"><thead><tr><th>Property</th><th>Value</th></tr></thead><tbody><tr><td>Object</td><td>`ailog`</td></tr><tr><td>Primary path</td><td>`/ailogs`</td></tr><tr><td>Path aliases</td><td>`/ailog`, `/ailogs`, `/ai_log`, `/ai_logs`</td></tr><tr><td>Supported method</td><td>`GET`</td></tr><tr><td>Default format</td><td>`json`</td></tr><tr><td>Export format</td><td>`csv`</td></tr><tr><td>Source table</td><td>`ai_ailogs`</td></tr></tbody></table>

## Authentication and Tenant Scope

The endpoint accepts tenant full API keys, tenant read-only API keys, global full API keys, and global read-only API keys. Supply the key in the `X-API-Key` header, as a bearer token, or in the `key` query parameter.

- A tenant API key can return records only for its own tenant.
- A global API key can select one tenant by code or name, use a `%` wildcard, or omit `tenant` to return records from all tenants.
- If IP filtering is enabled for the selected key, the request must originate from an allowed IP address or network.

## Endpoint Patterns

<table id="bkmrk-actionexample-patter"><thead><tr><th>Action</th><th>Example pattern</th></tr></thead><tbody><tr><td>List AI logs as JSON</td><td>`GET https://pbx.example.com/pbx/openapi.php/ailogs?tenant=CANISTRACCI`</td></tr><tr><td>Export AI logs as CSV</td><td>`GET https://pbx.example.com/pbx/openapi.php/ailogs?tenant=CANISTRACCI&format=csv`</td></tr><tr><td>Use the CSV export path</td><td>`GET https://pbx.example.com/pbx/openapi.php/ailogs/export?tenant=CANISTRACCI`</td></tr><tr><td>Filter by date range</td><td>`GET https://pbx.example.com/pbx/openapi.php/ailogs?tenant=CANISTRACCI&start=2026-08-01%2000:00:00&end=2026-08-31%2023:59:59`</td></tr><tr><td>Get one row by path ID</td><td>`GET https://pbx.example.com/pbx/openapi.php/ailogs/123?tenant=CANISTRACCI`</td></tr><tr><td>Compatibility query form</td><td>`GET https://pbx.example.com/pbx/openapi.php?object=ailogs&action=list&tenant=CANISTRACCI`</td></tr></tbody></table>

## Query Parameters

<table id="bkmrk-parameterdescription"><thead><tr><th>Parameter</th><th>Description</th></tr></thead><tbody><tr><td>`tenant`</td><td>Tenant code or tenant name. Tenant API keys are restricted to their tenant. Global API keys can use a code, name, `%` wildcard, or omit this parameter to search all tenants.</td></tr><tr><td>`start`</td><td>Start date and time applied to `ai_start`. The default is today at `00:00:00`. The date filter is not applied when `id` or `uniqueid` is supplied.</td></tr><tr><td>`end`</td><td>End date and time applied to `ai_start`. The default is today at `23:59:59`. The date filter is not applied when `id` or `uniqueid` is supplied.</td></tr><tr><td>`id`</td><td>One or more comma-separated `ai_id` values. A path value such as `/ailogs/123` maps to this filter.</td></tr><tr><td>`uniqueid`</td><td>One or more comma-separated Asterisk unique ID values.</td></tr><tr><td>`callerid`</td><td>One or more comma-separated exact caller ID values.</td></tr><tr><td>`customid`</td><td>One or more comma-separated custom destination IDs from `cu_customs`.</td></tr><tr><td>`format`</td><td>`json` or `csv`. The default is `json`. The `/ailogs/export` path defaults to `csv`.</td></tr><tr><td>`key`</td><td>Optional API key query parameter. Prefer the `X-API-Key` header or bearer token for new integrations.</td></tr></tbody></table>

## Response and CSV Fields

JSON objects and CSV columns use the following fields in this order:

<table id="bkmrk-fielddescriptionai_i"><thead><tr><th>Field</th><th>Description</th></tr></thead><tbody><tr><td>`ai_id`</td><td>Internal AI log row ID.</td></tr><tr><td>`ai_te_id`</td><td>Internal tenant ID.</td></tr><tr><td>`ai_cu_id`</td><td>Internal custom destination ID.</td></tr><tr><td>`cu_name`</td><td>Name of the associated custom destination, when available.</td></tr><tr><td>`ai_uniqueid`</td><td>Asterisk unique ID associated with the AI conversation.</td></tr><tr><td>`ai_callerid`</td><td>Caller ID recorded for the conversation.</td></tr><tr><td>`ai_start`</td><td>Conversation start date and time.</td></tr><tr><td>`ai_end`</td><td>Conversation end date and time.</td></tr><tr><td>`ai_duration`</td><td>Conversation duration.</td></tr><tr><td>`ai_talk`</td><td>Conversation exchanged with the AI service.</td></tr><tr><td>`ai_total_tokens`</td><td>Total tokens reported for the AI request.</td></tr><tr><td>`ai_input_tokens`</td><td>Input tokens reported for the AI request.</td></tr><tr><td>`ai_output_tokens`</td><td>Output tokens reported for the AI request.</td></tr></tbody></table>

## Examples

### List Current-Day AI Logs

When no ID or date filter is supplied, the endpoint returns records started during the current day.

```
curl -H "X-API-Key: TENANT_READ_ONLY_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/ailogs?tenant=CANISTRACCI"
```

### Export a Date Range as CSV

```
curl -H "X-API-Key: TENANT_READ_ONLY_API_KEY" \
  -o ai-logs.csv \
  "https://pbx.example.com/pbx/openapi.php/ailogs/export?tenant=CANISTRACCI&start=2026-08-01%2000:00:00&end=2026-08-31%2023:59:59"
```

### Get Logs by Unique ID

Supplying `uniqueid` disables the default current-day filter, so an older record can be retrieved without also setting a date range.

```
curl -H "Authorization: Bearer TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/ailogs?tenant=CANISTRACCI&uniqueid=1787740000.42"
```

### Example JSON Response

```
[
  {
    "ai_id": 123,
    "ai_te_id": 12,
    "ai_cu_id": 34,
    "cu_name": "AI Receptionist",
    "ai_uniqueid": "1787740000.42",
    "ai_callerid": "+390212345678",
    "ai_start": "2026-08-26 09:30:00",
    "ai_end": "2026-08-26 09:31:15",
    "ai_duration": 75,
    "ai_talk": ">> I need sales.\n<< I will connect you.",
    "ai_total_tokens": 420,
    "ai_input_tokens": 280,
    "ai_output_tokens": 140
  }
]
```

## Important Notes

- The endpoint is read-only. `POST`, `PUT`, `PATCH`, and `DELETE` are rejected.
- Without `id` or `uniqueid`, the default range is the current day. Set `start` and `end` to export a different period.
- When `id` or `uniqueid` is supplied, the date range is intentionally ignored.
- A global key without a `tenant` parameter can return records from all tenants visible to that key.
- The `ai_talk` field can contain sensitive conversation content. Store exports securely and restrict access to API keys.
- Use `/aianalysis`, not `/ailogs`, for recorded-call transcripts, summaries, and sentimental analysis.

## Common Errors

<table id="bkmrk-errormeaningmissing_"><thead><tr><th>Error</th><th>Meaning</th></tr></thead><tbody><tr><td>`missing_api_key`</td><td>No API key was supplied in the query string, `X-API-Key`, or bearer token.</td></tr><tr><td>`invalid_api_key`</td><td>The supplied key does not match the tenant or global API key.</td></tr><tr><td>`api_ip_not_allowed`</td><td>IP filtering is enabled and the client address is not in the key's allowed IP or network list.</td></tr><tr><td>`tenant_required`</td><td>A tenant code or tenant name is required when using a tenant API key.</td></tr><tr><td>`tenant_not_found`</td><td>The tenant parameter did not match any visible tenant.</td></tr><tr><td>`invalid_format`</td><td>The `format` value is not `json` or `csv`.</td></tr><tr><td>`method_not_allowed`</td><td>The endpoint is read-only and only supports `GET`.</td></tr></tbody></table>