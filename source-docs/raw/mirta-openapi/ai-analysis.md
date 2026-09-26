# AI Analysis

The **AI Analysis** endpoint returns transcript, AI summary, and sentimental analysis data for recorded calls. It is a read-only OpenAPI endpoint and supports `GET` only.

Use this endpoint when an integration already has an Asterisk `uniqueid` from CDR, Simple CDR, call events, or recording metadata and needs the AI results associated with that call.

## Object Summary

<table id="bkmrk-propertyvalueobjecta"><thead><tr><th>Property</th><th>Value</th></tr></thead><tbody><tr><td>Object</td><td>`aianalysis`</td></tr><tr><td>Primary path</td><td>`/aianalysis`</td></tr><tr><td>Path aliases</td><td>`/aianalysis`, `/aianalyses`, `/ai_analysis`, `/ai_analyses`, `/callanalysis`, `/call_analysis`</td></tr><tr><td>Supported method</td><td>`GET`</td></tr><tr><td>Required filter</td><td>`uniqueid`</td></tr><tr><td>Default format</td><td>`json`</td></tr><tr><td>Source tables</td><td>`rm_recordingmetadatas`, `tr_transcripts`</td></tr></tbody></table>

## Endpoint Patterns

<table id="bkmrk-actionexample-patter"><thead><tr><th>Action</th><th>Example pattern</th></tr></thead><tbody><tr><td>Get AI analysis by unique ID</td><td>`GET https://pbx.example.com/pbx/openapi.php/aianalysis?tenant=CANISTRACCI&uniqueid=1717240000.42`</td></tr><tr><td>Get AI analysis by path unique ID</td><td>`GET https://pbx.example.com/pbx/openapi.php/aianalysis/1717240000.42?tenant=CANISTRACCI`</td></tr><tr><td>Get multiple calls</td><td>`GET https://pbx.example.com/pbx/openapi.php/aianalysis?tenant=CANISTRACCI&uniqueid=1717240000.42,1717240000.43`</td></tr><tr><td>Use an alias path</td><td>`GET https://pbx.example.com/pbx/openapi.php/ai_analysis?tenant=CANISTRACCI&uniqueid=1717240000.42`</td></tr></tbody></table>

## Query Parameters

<table id="bkmrk-parameterdescription"><thead><tr><th>Parameter</th><th>Description</th></tr></thead><tbody><tr><td>`tenant`</td><td>Tenant code or tenant name. Tenant API keys are restricted to their tenant. Global API keys can query one tenant by code or name, use `%` wildcards, or omit the parameter to search all tenants.</td></tr><tr><td>`uniqueid`</td><td>Required comma-separated Asterisk unique ID values. A path value such as `/aianalysis/1717240000.42` also maps to this filter.</td></tr><tr><td>`key`</td><td>Optional API key query parameter. Prefer the `X-API-Key` header or bearer token for new integrations.</td></tr></tbody></table>

## Response Fields

<table id="bkmrk-fielddescriptiontena"><thead><tr><th>Field</th><th>Description</th></tr></thead><tbody><tr><td>`tenant_id`</td><td>Internal tenant ID.</td></tr><tr><td>`tenant_code`</td><td>Tenant code.</td></tr><tr><td>`uniqueid`</td><td>Asterisk unique ID requested by the integration.</td></tr><tr><td>`transcript`</td><td>Full transcript text. When recording metadata does not contain a full transcript, MiRTA PBX builds this value from transcript segments.</td></tr><tr><td>`summary`</td><td>AI-generated call summary.</td></tr><tr><td>`sentiment_score`</td><td>First numeric sentimental analysis score found for the unique ID, or `null`.</td></tr><tr><td>`sentiment_scores`</td><td>All distinct numeric sentimental analysis scores found for the unique ID.</td></tr><tr><td>`sentiment_brief`</td><td>Short sentimental analysis text from recording metadata.</td></tr><tr><td>`sentiment_details`</td><td>Detailed sentimental analysis payload. This may be JSON text depending on the configured AI processor.</td></tr><tr><td>`recordings`</td><td>Per-recording metadata rows for the unique ID.</td></tr><tr><td>`transcript_segments`</td><td>Timestamped transcript segments for the unique ID.</td></tr></tbody></table>

## Recording Fields

<table id="bkmrk-fielddescriptionmeta"><thead><tr><th>Field</th><th>Description</th></tr></thead><tbody><tr><td>`metadata_id`</td><td>Internal recording metadata row ID.</td></tr><tr><td>`recording_id`</td><td>Internal recording ID.</td></tr><tr><td>`date`</td><td>Recording metadata date.</td></tr><tr><td>`transcript`</td><td>Transcript stored on that recording metadata row.</td></tr><tr><td>`summary`</td><td>Summary stored on that recording metadata row.</td></tr><tr><td>`sentiment_score`</td><td>Numeric sentimental score for that recording metadata row, or `null`.</td></tr><tr><td>`sentiment_brief`</td><td>Short sentimental analysis text for that recording metadata row.</td></tr><tr><td>`sentiment_details`</td><td>Detailed sentimental analysis payload for that recording metadata row.</td></tr></tbody></table>

## Transcript Segment Fields

<table id="bkmrk-fielddescriptionreco"><thead><tr><th>Field</th><th>Description</th></tr></thead><tbody><tr><td>`recording_id`</td><td>Internal recording ID associated with the transcript segment.</td></tr><tr><td>`speaker`</td><td>Speaker number assigned by the transcript processor.</td></tr><tr><td>`start`</td><td>Segment start time. Numeric values are returned as numbers.</td></tr><tr><td>`end`</td><td>Segment end time. Numeric values are returned as numbers.</td></tr><tr><td>`text`</td><td>Transcript text for the segment.</td></tr></tbody></table>

## Examples

### Get AI Analysis

Returns transcript, summary, and sentimental analysis data for one call unique ID.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/aianalysis?tenant=CANISTRACCI&uniqueid=1717240000.42"
```

### Get AI Analysis by Path

Uses the path segment after `/aianalysis` as the unique ID filter.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/aianalysis/1717240000.42?tenant=CANISTRACCI"
```

### Get Multiple AI Analysis Results

Requests more than one unique ID in a single call.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/aianalysis?tenant=CANISTRACCI&uniqueid=1717240000.42,1717240000.43"
```

### Global Key Tenant Wildcard

Uses a global API key to search matching tenants. Use this only when unique IDs may need to be resolved across tenant boundaries.

```
curl -H "X-API-Key: GLOBAL_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/aianalysis?tenant=CAN%25&uniqueid=1717240000.42"
```

### Example Response

```
[
  {
    "tenant_id": 12,
    "tenant_code": "CANISTRACCI",
    "uniqueid": "1717240000.42",
    "transcript": "Speaker 1: Hello, how can I help you?",
    "summary": "The caller asked for support and the agent scheduled a follow-up.",
    "sentiment_score": 0.72,
    "sentiment_scores": [0.72],
    "sentiment_brief": "Positive",
    "sentiment_details": "{...}",
    "recordings": [
      {
        "metadata_id": 345,
        "recording_id": 678,
        "date": "2026-06-01 10:00:00",
        "transcript": "Speaker 1: Hello, how can I help you?",
        "summary": "The caller asked for support and the agent scheduled a follow-up.",
        "sentiment_score": 0.72,
        "sentiment_brief": "Positive",
        "sentiment_details": "{...}"
      }
    ],
    "transcript_segments": [
      {
        "recording_id": 678,
        "speaker": 1,
        "start": 0.0,
        "end": 3.4,
        "text": "Hello, how can I help you?"
      }
    ]
  }
]
```

## Important Notes

- The endpoint returns rows only for unique IDs that have recording metadata or transcript segments in the selected tenant scope. Unknown unique IDs are omitted from the response.
- If multiple recording metadata rows exist for the same unique ID, top-level transcript, summary, and sentiment text values are combined without duplicate text. The `recordings` array preserves the per-recording values.
- `sentiment_details` is returned as stored. It may contain JSON text produced by the configured sentimental analysis model.
- The endpoint checks available database columns before selecting transcript and metadata fields, so older installations may return fewer populated fields until their database upgrades are complete.

## Common Errors

<table id="bkmrk-errormeaningmissing_"><thead><tr><th>Error</th><th>Meaning</th></tr></thead><tbody><tr><td>`missing_api_key`</td><td>No API key was supplied in the query string, `X-API-Key`, or bearer token.</td></tr><tr><td>`invalid_api_key`</td><td>The supplied key does not match the tenant or global API key.</td></tr><tr><td>`tenant_required`</td><td>A tenant code or tenant name is required when using a tenant API key.</td></tr><tr><td>`tenant_not_found`</td><td>The tenant parameter did not match any visible tenant.</td></tr><tr><td>`uniqueid_required`</td><td>The request did not include a usable `uniqueid` value.</td></tr><tr><td>`method_not_allowed`</td><td>The endpoint is read-only and only supports `GET`.</td></tr></tbody></table>