# CDR

The **CDR** endpoint is a read-only reporting endpoint. It supports `GET` only; create, update, and delete methods return `method_not_allowed`. Tenant API keys must include `tenant=CANISTRACCI`. Global API keys can query one tenant by code or name, or use SQL-style `%` wildcards in the tenant parameter.

## Object Summary

<table id="bkmrk-propertyvalueobjectc"><thead><tr><th>Property</th><th>Value</th></tr></thead><tbody><tr><td>Object</td><td>`cdr`</td></tr><tr><td>Primary path</td><td>`/cdrs`</td></tr><tr><td>Path aliases</td><td>`/cdr`, `/cdrs`, `/call`, `/calls`</td></tr><tr><td>Supported method</td><td>`GET`</td></tr><tr><td>Default format</td><td>`json`</td></tr><tr><td>Compatibility formats</td><td>`template`, `xml`</td></tr></tbody></table>

## Endpoint Patterns

<table id="bkmrk-actionexample-patter"><thead><tr><th>Action</th><th>Example pattern</th></tr></thead><tbody><tr><td>List records</td><td>`GET https://pbx.example.com/pbx/openapi.php/cdrs?tenant=CANISTRACCI`</td></tr><tr><td>Filter by date range</td><td>`GET https://pbx.example.com/pbx/openapi.php/cdrs?tenant=CANISTRACCI&start=2026-06-01%2000%3A00%3A00&end=2026-06-01%2023%3A59%3A59`</td></tr><tr><td>Filter by ID from the path</td><td>`GET https://pbx.example.com/pbx/openapi.php/cdrs/RECORD_ID?tenant=CANISTRACCI`</td></tr><tr><td>Template/XML compatibility output</td><td>`GET https://pbx.example.com/pbx/openapi.php/cdrs?tenant=CANISTRACCI&format=template&template=Docs%20Export`</td></tr></tbody></table>

## Query Parameters

<table id="bkmrk-parameterdescription"><thead><tr><th>Parameter</th><th>Description</th></tr></thead><tbody><tr><td>`tenant`</td><td>Tenant code or tenant name. Global API keys can use % wildcards; tenant API keys are restricted to their tenant.</td></tr><tr><td>`start`</td><td>Start date and time. Defaults to today at 00:00:00.</td></tr><tr><td>`end`</td><td>End date and time. Defaults to today at 23:59:59.</td></tr><tr><td>`id`</td><td>Comma-separated CDR ID values. A path value such as /cdrs/123 also maps to this filter.</td></tr><tr><td>`uniqueid`</td><td>Comma-separated Asterisk unique ID values.</td></tr><tr><td>`linkedid`</td><td>Comma-separated linked ID values used to group call legs.</td></tr><tr><td>`src`</td><td>Comma-separated source values.</td></tr><tr><td>`firstdst`</td><td>Comma-separated first destination values.</td></tr><tr><td>`disposition`</td><td>Comma-separated disposition values such as ANSWERED, NO ANSWER, BUSY, or FAILED.</td></tr><tr><td>`direction`</td><td>Direction filter based on the CDR userfield mapping. Accepted values are IN, OUT, IN,OUT, and OUT,IN.</td></tr><tr><td>`phone`</td><td>Comma-separated phone values searched across src, dst, firstdst, lastdst, realsrc, and wherelanded.</td></tr><tr><td>`format`</td><td>Response format. Defaults to json. Use template or xml for template-based compatibility output.</td></tr><tr><td>`template`</td><td>Template name from the tenant XML templates. Used only with format=template or format=xml.</td></tr><tr><td>`contenttype`</td><td>Optional Content-Type header for rendered template output.</td></tr></tbody></table>

## Response Fields

<table id="bkmrk-fielddescriptionacco"><thead><tr><th>Field</th><th>Description</th></tr></thead><tbody><tr><td>`accountcode`</td><td>Tenant code stored on the CDR.</td></tr><tr><td>`ID`</td><td>Internal CDR row ID.</td></tr><tr><td>`start`</td><td>Call start timestamp.</td></tr><tr><td>`answer`</td><td>Answer timestamp when the call was answered.</td></tr><tr><td>`end`</td><td>Call end timestamp.</td></tr><tr><td>`clid`</td><td>Full caller ID string.</td></tr><tr><td>`realsrc`</td><td>Normalized or real source value.</td></tr><tr><td>`firstdst`</td><td>First dialed destination tracked by MiRTA PBX.</td></tr><tr><td>`duration`</td><td>Total call duration in seconds.</td></tr><tr><td>`billsec`</td><td>Answered talk time in seconds.</td></tr><tr><td>`disposition`</td><td>Asterisk call disposition.</td></tr><tr><td>`cc_cost`</td><td>Calculated tenant-side call cost when available.</td></tr><tr><td>`dcontext`</td><td>Asterisk destination context.</td></tr><tr><td>`dstchannel`</td><td>Destination channel.</td></tr><tr><td>`userfield`</td><td>MiRTA PBX call marker, commonly including inbound or outbound direction information.</td></tr><tr><td>`uniqueid`</td><td>Asterisk unique ID for the CDR leg.</td></tr><tr><td>`prevuniqueid`</td><td>Previous unique ID for linked call-leg processing.</td></tr><tr><td>`lastdst`</td><td>Last destination reached by the call.</td></tr><tr><td>`wherelanded`</td><td>Final PBX object or destination where the call landed.</td></tr><tr><td>`src`</td><td>Asterisk source value.</td></tr><tr><td>`dst`</td><td>Asterisk destination value.</td></tr><tr><td>`lastapp`</td><td>Last Asterisk application executed.</td></tr><tr><td>`srcCallID`</td><td>Source SIP Call-ID when available.</td></tr><tr><td>`linkedid`</td><td>Asterisk linked ID used to group related CDR legs.</td></tr><tr><td>`peeraccount`</td><td>Asterisk peer account value.</td></tr><tr><td>`originateid`</td><td>Origination tracking ID when available.</td></tr><tr><td>`cc_country`</td><td>Rated country when rating data is available.</td></tr><tr><td>`cc_network`</td><td>Rated network when rating data is available.</td></tr><tr><td>`pincode`</td><td>PIN code associated with the call when present.</td></tr><tr><td>`cc_buy`</td><td>Calculated buy-side cost when available.</td></tr></tbody></table>

## Important Notes

- When neither id nor uniqueid is supplied, the endpoint applies the start/end date range.
- When neither id nor linkedid is supplied, the endpoint also applies the start/end date range.
- Template and XML compatibility output require the request to resolve to exactly one tenant.
- The endpoint may repair attended-transfer and where-landed CDR metadata while preparing results.

## Examples

### List Today CDRs

Returns CDR rows for the selected tenant using today as the default date range.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/cdrs?tenant=CANISTRACCI"
```

### CDR Date Range

Limits results to an explicit date and time window.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/cdrs?tenant=CANISTRACCI&start=2026-06-01%2000%3A00%3A00&end=2026-06-01%2023%3A59%3A59"
```

### CDR by Path ID

Uses the path segment after /cdrs as a CDR ID filter.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/cdrs/123456?tenant=CANISTRACCI"
```

### CDR by ID and Unique ID

Filters by one or more CDR row IDs and one or more Asterisk unique IDs.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/cdrs?tenant=CANISTRACCI&id=123456%2C123457&uniqueid=1717240000.42"
```

### CDR by Linked ID

Returns all matching CDR legs associated with one linked call.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/cdrs?tenant=CANISTRACCI&linkedid=1717240000.42"
```

### CDR Source Destination and Disposition

Combines source, first destination, and disposition filters.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/cdrs?tenant=CANISTRACCI&src=100&firstdst=15551234567&disposition=ANSWERED"
```

### CDR Direction

Filters by outbound calls using the MiRTA PBX CDR userfield mapping.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/cdrs?tenant=CANISTRACCI&direction=OUT"
```

### CDR Phone Search

Searches phone values across the main CDR source and destination columns.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/cdrs?tenant=CANISTRACCI&phone=100%2C15551234567"
```

### CDR Global Tenant Wildcard

Uses a global key and a tenant wildcard to query matching tenants.

```
curl -H "X-API-Key: GLOBAL_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/cdrs?tenant=CAN%25&start=2026-06-01%2000%3A00%3A00&end=2026-06-01%2023%3A59%3A59"
```

### CDR Template Output

Renders rows through a tenant XML/template definition. This requires exactly one tenant.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/cdrs?tenant=CANISTRACCI&format=template&template=Docs%20CDR%20Export&contenttype=text%2Fcsv"
```

## Common Errors

<table id="bkmrk-errormeaningmissing_"><thead><tr><th>Error</th><th>Meaning</th></tr></thead><tbody><tr><td>`missing_api_key`</td><td>No API key was supplied in the query string, `X-API-Key`, or bearer token.</td></tr><tr><td>`invalid_api_key`</td><td>The supplied key does not match the tenant or global API key.</td></tr><tr><td>`tenant_required`</td><td>A tenant code or tenant name is required when using a tenant API key.</td></tr><tr><td>`single_tenant_required`</td><td>Template output requires the request to resolve to exactly one tenant.</td></tr><tr><td>`template_not_found`</td><td>The selected XML/template output template does not exist for the tenant.</td></tr><tr><td>`method_not_allowed`</td><td>The endpoint is read-only and only supports GET.</td></tr></tbody></table>