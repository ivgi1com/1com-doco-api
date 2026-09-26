# AI Analysis

## Status

- Evidence: DOCUMENTED (official page, full example response)
- Scope: Tenant (read) or Global (cross-tenant read)
- Access: Read-only
- Security review: **BLOCK LIVE** (SEC-REQ-09)

## Purpose

Returns transcript, AI-generated summary, and sentiment-analysis data for recorded calls, keyed by Asterisk `uniqueid` (`aianalysis.md:3-5` → source `ai-analysis.md:3-5`). Use `/ailogs` instead for Talk-with-AI conversation logs (token usage, conversation text) — the two are explicitly distinguished on the AI Logs page.

## Official Sources

- https://manual.mirtapbx.com/books/api/page/ai-analysis (rev #6, updated 2026-07-03). Snapshot: `source-docs/raw/mirta-openapi/ai-analysis.md`. Line citations below refer to it.

## Endpoint

| Property | Value | Evidence |
|---|---|---|
| Object | `aianalysis` | DOCUMENTED `:9` |
| Primary path | `/aianalysis` | DOCUMENTED `:9` |
| Path aliases | `/aianalysis`, `/aianalyses`, `/ai_analysis`, `/ai_analyses`, `/callanalysis`, `/call_analysis` | DOCUMENTED `:9` |
| Supported method | `GET` only | DOCUMENTED `:3`, `:9` |
| Required filter | `uniqueid` | DOCUMENTED `:9` |
| Default format | `json` | DOCUMENTED `:9` |
| Source tables | `rm_recordingmetadatas`, `tr_transcripts` | DOCUMENTED `:9` |

## Authentication and Scope

- Tenant API keys are restricted to their own tenant.
- Global API keys can query one tenant by code/name, use `%` wildcards, or omit `tenant` to search all tenants (`:17`).

## Operations

### GET /aianalysis

**Query parameters:**

| Parameter | Required | Description | Evidence |
|---|---:|---|---|
| `tenant` | yes for tenant keys | tenant code or name; global keys: code/name, `%` wildcard, or omitted for all tenants | DOCUMENTED `:17` |
| `uniqueid` | **yes** | comma-separated Asterisk unique IDs; a path value (`/aianalysis/<id>`) also maps here | DOCUMENTED `:9`, `:17` |
| `key` | no | API key; header/bearer preferred for new integrations | DOCUMENTED `:17` |

**Response fields** (top level, `:21`):

| Field | Description |
|---|---|
| `tenant_id` | internal tenant ID |
| `tenant_code` | tenant code |
| `uniqueid` | requested Asterisk unique ID |
| `transcript` | full transcript text (built from segments if metadata lacks a full transcript) |
| `summary` | AI-generated call summary |
| `sentiment_score` | first numeric sentiment score found, or `null` |
| `sentiment_scores` | all distinct numeric sentiment scores found |
| `sentiment_brief` | short sentiment text |
| `sentiment_details` | detailed sentiment payload; "may be JSON text depending on the configured AI processor" |
| `recordings` | array of per-recording metadata rows |
| `transcript_segments` | array of timestamped transcript segments |

**Recording fields** (nested in `recordings[]`, `:25`): `metadata_id`, `recording_id`, `date`, `transcript`, `summary`, `sentiment_score`, `sentiment_brief`, `sentiment_details`.

**Transcript segment fields** (nested in `transcript_segments[]`, `:29`): `recording_id`, `speaker` (number), `start` (numeric seconds), `end` (numeric seconds), `text`.

**Example response** (`:72-105`, synthetic values already used by the vendor page, reproduced with local placeholder tenant):

```json
[
  {
    "tenant_id": 1,
    "tenant_code": "TESTTENANT",
    "uniqueid": "1700000000.42",
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
        "date": "2026-01-01 10:00:00",
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

- **Envelope: a top-level JSON array**, one object per matched `uniqueid` (DOCUMENTED — the only reporting endpoint on this page whose envelope is explicit).
- "Unknown unique IDs are omitted from the response"; rows are returned only for IDs with recording metadata or transcript segments in the selected tenant scope (`:110`).
- Multiple recording rows for one `uniqueid`: top-level `transcript`/`summary`/sentiment text are "combined without duplicate text"; `recordings[]` keeps the per-recording values (`:111`).
- "Older installations may return fewer populated fields until their database upgrades are complete" (`:113`) — field presence is install-dependent.
- HTTP status: UNKNOWN.

```bash
curl -H "X-API-Key: TEST_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/aianalysis?tenant=TESTTENANT&uniqueid=1700000000.42"
```

## Request Schema

GET only; no body.

## Response Schema

Full nested schema above (`:21`, `:25`, `:29`), confirmed by a worked example (`:72-105`).

## Aliases / Accepted Values

Path aliases listed above. No field aliases documented.

## Security Notes

- **Full call transcripts and AI-generated summaries** are the most sensitive content documented in this baseline so far — potentially covering anything discussed on a call.
- `sentiment_details` "may contain JSON text" from a third-party AI processor — an opaque nested payload whose own schema is unknown.
- Unlike a phone-number/PII leak, this is **call content** exposure.
- → **SEC-REQ-09**: BLOCK LIVE outright, not just an allowlist. Any future Live consideration needs a distinct product/privacy decision (recording/transcript consent, retention), beyond a field allowlist.

## Demo Considerations

The schema and an example are both fully documented, so a synthetic fixture is feasible without inventing structure. If ever built, transcript/summary/sentiment content must be obviously fictional (e.g. "Demo Caller asked about pricing").

## Live Considerations

Not a Live candidate under the standard allowlist pattern — see Security Notes. Read-only, but content-sensitive rather than merely field-sensitive.

## Unknowns

- HTTP status codes.
- Response when *no* requested `uniqueid` matches (empty array vs error) — unmatched IDs are documented as omitted (`:110`), but the all-miss case is not shown.
- `sentiment_details`'s actual JSON shape (AI-processor-dependent).
- Whether pagination applies when many unique IDs are requested at once.

## Conflicts

None found. (Wrapper's claims, W:121/154-156/336, match: path, GET-only, requires `uniqueid`.)

## Verification Notes

DOCUMENTED from rev #6. No call has been made.
