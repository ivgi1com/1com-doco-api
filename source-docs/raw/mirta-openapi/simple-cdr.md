# Simple CDR

The **Simple CDR** endpoint is a read-only reporting endpoint. It supports `GET` only; create, update, and delete methods return `method_not_allowed`. Tenant API keys must include `tenant=CANISTRACCI`. Global API keys can query one tenant by code or name, or use SQL-style `%` wildcards in the tenant parameter.

## Object Summary

<table id="bkmrk-propertyvalueobjects"><thead><tr><th>Property</th><th>Value</th></tr></thead><tbody><tr><td>Object</td><td>`simplecdr`</td></tr><tr><td>Primary path</td><td>`/simplecdrs`</td></tr><tr><td>Path aliases</td><td>`/simplecdr`, `/simplecdrs`, `/simple_cdr`, `/simple_cdrs`</td></tr><tr><td>Supported method</td><td>`GET`</td></tr><tr><td>Default format</td><td>`json`</td></tr><tr><td>Compatibility formats</td><td>`template`, `xml`</td></tr></tbody></table>

## Endpoint Patterns

<table id="bkmrk-actionexample-patter"><thead><tr><th>Action</th><th>Example pattern</th></tr></thead><tbody><tr><td>List records</td><td>`GET https://pbx.example.com/pbx/openapi.php/simplecdrs?tenant=CANISTRACCI`</td></tr><tr><td>Filter by date range</td><td>`GET https://pbx.example.com/pbx/openapi.php/simplecdrs?tenant=CANISTRACCI&start=2026-06-01%2000%3A00%3A00&end=2026-06-01%2023%3A59%3A59`</td></tr><tr><td>Filter by ID from the path</td><td>`GET https://pbx.example.com/pbx/openapi.php/simplecdrs/RECORD_ID?tenant=CANISTRACCI`</td></tr><tr><td>Template/XML compatibility output</td><td>`GET https://pbx.example.com/pbx/openapi.php/simplecdrs?tenant=CANISTRACCI&format=template&template=Docs%20Export`</td></tr></tbody></table>

## Query Parameters

<table id="bkmrk-parameterdescription"><thead><tr><th>Parameter</th><th>Description</th></tr></thead><tbody><tr><td>`tenant`</td><td>Tenant code or tenant name. Global API keys can use % wildcards; tenant API keys are restricted to their tenant.</td></tr><tr><td>`start`</td><td>Start date and time. Defaults to today at 00:00:00.</td></tr><tr><td>`end`</td><td>End date and time. Defaults to today at 23:59:59.</td></tr><tr><td>`id`</td><td>Comma-separated simple CDR ID values. A path value such as /simplecdrs/123 also maps to this filter.</td></tr><tr><td>`uniqueid`</td><td>Comma-separated Asterisk unique ID values.</td></tr><tr><td>`calleridnum`</td><td>Comma-separated caller ID number values.</td></tr><tr><td>`calleridname`</td><td>Comma-separated caller ID name values.</td></tr><tr><td>`disposition`</td><td>Comma-separated disposition values such as ANSWERED, NO ANSWER, BUSY, or FAILED.</td></tr><tr><td>`direction`</td><td>Comma-separated simple CDR directions, such as IN, OUT, or LOCAL.</td></tr><tr><td>`dialednum`</td><td>Comma-separated dialed number values.</td></tr><tr><td>`whoanswered`</td><td>Comma-separated values for the extension, user, or object that answered.</td></tr><tr><td>`phone`</td><td>Comma-separated phone values searched across sc\_whoanswered, sc\_calleridnum, and sc\_dialednum.</td></tr><tr><td>`minduration`</td><td>Minimum total call duration in seconds, exclusive.</td></tr><tr><td>`mintalktime`</td><td>Minimum answered talk time in seconds, exclusive.</td></tr><tr><td>`format`</td><td>Response format. Defaults to json. Use template or xml for template-based compatibility output.</td></tr><tr><td>`template`</td><td>Template name from the tenant XML templates. Used only with format=template or format=xml.</td></tr><tr><td>`contenttype`</td><td>Optional Content-Type header for rendered template output.</td></tr></tbody></table>

## Response Fields

<table id="bkmrk-fielddescriptionsc_t"><thead><tr><th>Field</th><th>Description</th></tr></thead><tbody><tr><td>`sc_te_id`</td><td>Internal tenant ID.</td></tr><tr><td>`tenantcode`</td><td>Tenant code.</td></tr><tr><td>`sc_start`</td><td>Simple CDR start timestamp.</td></tr><tr><td>`sc_direction`</td><td>Simple direction value, such as IN, OUT, or LOCAL.</td></tr><tr><td>`sc_calleridnum`</td><td>Caller ID number.</td></tr><tr><td>`sc_calleridname`</td><td>Caller ID name.</td></tr><tr><td>`sc_dialednum`</td><td>Dialed number.</td></tr><tr><td>`sc_disposition`</td><td>Call disposition.</td></tr><tr><td>`sc_duration`</td><td>Total call duration in seconds.</td></tr><tr><td>`sc_billsec`</td><td>Answered talk time in seconds.</td></tr><tr><td>`sc_uniqueid`</td><td>Asterisk unique ID represented by the simple CDR row.</td></tr><tr><td>`sc_whoanswered`</td><td>Extension, user, or object that answered the call.</td></tr></tbody></table>

## Template Variables

When `format=template` or `format=xml` is used, variables inside the `{row_loop}` section are replaced for each returned row.

<table id="bkmrk-variabledescription%7B"><thead><tr><th>Variable</th><th>Description</th></tr></thead><tbody><tr><td>`{$end}`</td><td>Computed end timestamp from sc\_start plus sc\_duration seconds.</td></tr><tr><td>`{$clid}`</td><td>CDR-style caller ID formatted as "sc\_calleridname" &lt;sc\_calleridnum&gt;.</td></tr><tr><td>`{$callerid_number}`</td><td>Alias for sc\_calleridnum.</td></tr><tr><td>`{$callerid_name}`</td><td>Alias for sc\_calleridname.</td></tr><tr><td>`{$firstdst}`</td><td>Alias for sc\_dialednum.</td></tr><tr><td>`{$talk_time}`</td><td>Alias for sc\_billsec.</td></tr><tr><td>`{$who_answered}`</td><td>Alias for sc\_whoanswered.</td></tr></tbody></table>

## Important Notes

- When neither id nor uniqueid is supplied, the endpoint applies the start/end date range.
- The mintalktime filter uses the stored simple CDR billsec/talk-time value.
- Template and XML compatibility output require the request to resolve to exactly one tenant.

## Examples

### List Today Simple CDRs

Returns simplified call history rows for the selected tenant using today as the default date range.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/simplecdrs?tenant=CANISTRACCI"
```

### Simple CDR Date Range

Limits simple CDR results to an explicit date and time window.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/simplecdrs?tenant=CANISTRACCI&start=2026-06-01%2000%3A00%3A00&end=2026-06-01%2023%3A59%3A59"
```

### Simple CDR by Path ID

Uses the path segment after /simplecdrs as a simple CDR ID filter.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/simplecdrs/98765?tenant=CANISTRACCI"
```

### Simple CDR by ID and Unique ID

Filters by one or more simple CDR row IDs and unique IDs.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/simplecdrs?tenant=CANISTRACCI&id=98765%2C98766&uniqueid=1717240000.42"
```

### Simple CDR Caller and Dialed Number

Combines caller number, caller name, and dialed number filters.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/simplecdrs?tenant=CANISTRACCI&calleridnum=15551234567&calleridname=Docs%20Caller&dialednum=100"
```

### Simple CDR Direction and Disposition

Filters by simple direction values and disposition.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/simplecdrs?tenant=CANISTRACCI&direction=IN%2COUT&disposition=ANSWERED"
```

### Simple CDR Who Answered

Filters by the extension or object that answered the call.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/simplecdrs?tenant=CANISTRACCI&whoanswered=100"
```

### Simple CDR Phone Search

Searches across caller ID number, dialed number, and who answered.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/simplecdrs?tenant=CANISTRACCI&phone=100%2C15551234567"
```

### Simple CDR Minimum Durations

Returns calls longer than the supplied total duration and talk-time thresholds.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/simplecdrs?tenant=CANISTRACCI&minduration=30&mintalktime=10"
```

### Simple CDR Global Tenant Wildcard

Uses a global key and a tenant wildcard to query matching tenants.

```
curl -H "X-API-Key: GLOBAL_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/simplecdrs?tenant=CAN%25&start=2026-06-01%2000%3A00%3A00&end=2026-06-01%2023%3A59%3A59"
```

### Simple CDR Template Output

Renders simple CDR rows through a tenant XML/template definition. This requires exactly one tenant.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/simplecdrs?tenant=CANISTRACCI&format=template&template=Docs%20Simple%20CDR%20Export&contenttype=text%2Fcsv"
```

## Common Errors

<table id="bkmrk-errormeaningmissing_"><thead><tr><th>Error</th><th>Meaning</th></tr></thead><tbody><tr><td>`missing_api_key`</td><td>No API key was supplied in the query string, `X-API-Key`, or bearer token.</td></tr><tr><td>`invalid_api_key`</td><td>The supplied key does not match the tenant or global API key.</td></tr><tr><td>`tenant_required`</td><td>A tenant code or tenant name is required when using a tenant API key.</td></tr><tr><td>`single_tenant_required`</td><td>Template output requires the request to resolve to exactly one tenant.</td></tr><tr><td>`template_not_found`</td><td>The selected XML/template output template does not exist for the tenant.</td></tr><tr><td>`method_not_allowed`</td><td>The endpoint is read-only and only supports GET.</td></tr></tbody></table>