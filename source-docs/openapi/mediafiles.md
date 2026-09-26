# Media File

## Status

- Evidence: DOCUMENTED (official page). Response schema UNKNOWN.
- Scope: Tenant, or Global with `global=1`
- Access: Mixed (read and write)
- Security review: **REVIEW REQUIRED** (SEC-REQ-18)

## Purpose

An audio prompt or TTS-generated media file: uploaded binary audio, or text-to-speech configuration (`mediafiles.md:3` → source `media-file.md:3`).

## Official Sources

- https://manual.mirtapbx.com/books/api/page/media-file (rev #18, updated 2026-07-03). Snapshot: `source-docs/raw/mirta-openapi/media-file.md`. Line citations below refer to it.

## Endpoint

| Property | Value | Evidence |
|---|---|---|
| Object | `mediafile` | DOCUMENTED `:7` |
| Primary path | `/mediafiles` | DOCUMENTED `:7` |
| Path aliases | `/mediafiles`, `/media_files`, `/media_file` | DOCUMENTED `:7` |
| ID field | `me_id` | DOCUMENTED `:7` |
| Label field | `me_name` | DOCUMENTED `:7` |
| Primary source table | `me_mediafiles` | DOCUMENTED `:7` |
| Required on create | `me_name` | DOCUMENTED `:7` |

## Authentication and Scope

"Normally tenant-scoped. With a global API key, use `global=1`..." (`:3`) — one of the 8 `global=1`-capable resources.

## Operations

| Operation | Method and path | Evidence |
|---|---|---|
| List | `GET /mediafiles?tenant=` (or `?global=1`) | DOCUMENTED `:11`, `:84-86` |
| Get by ID | `GET /mediafiles/{me_id}?tenant=` | DOCUMENTED `:11` |
| Create | `POST /mediafiles?tenant=` | DOCUMENTED `:11` |
| Update | `PATCH /mediafiles/{me_id}?tenant=` | DOCUMENTED `:11` |
| Delete | `DELETE /mediafiles/{me_id}?tenant=` | DOCUMENTED `:11` |
| PUT | not documented | — |

### POST /mediafiles (create) — two distinct forms

**Form 1: TTS (text-to-speech)** (`:41-53`):

| Field | Required | Notes | Evidence |
|---|---:|---|---|
| `name` → `me_name` | **yes** | | DOCUMENTED `:7`, `:15` |
| `description` → `me_description` | no | | DOCUMENTED `:15` |
| `type` → `me_type` | no | example `"tts"` | DOCUMENTED `:15`, `:48` |
| `text` → `me_text` | no (required for TTS in practice) | prompt text to synthesize | DOCUMENTED `:15`, `:49` |
| `engine` → `me_engine` | no | example `"azure"` | DOCUMENTED `:15`, `:50` |
| `language` → `me_language` | no | example `"en-US"` | DOCUMENTED `:15`, `:51` |

```bash
curl -X POST -H "X-API-Key: TEST_API_KEY" -H "Content-Type: application/json" \
  -d '{"name":"Demo Welcome Prompt","description":"Demo TTS prompt","type":"tts","text":"Welcome to Demo Corp. Press 1 for sales or 2 for support.","engine":"azure","language":"en-US"}' \
  "https://pbx.example.com/pbx/openapi.php/mediafiles?tenant=TESTTENANT"
```

**Form 2: Binary upload** (`:89-103`):

| Field | Required | Notes | Evidence |
|---|---:|---|---|
| `format` → `me_format` | no | e.g. `"wav"` | DOCUMENTED `:15`, `:99` |
| `data_base64` → `me_data` | no (required in practice for this form) | base64-encoded audio | DOCUMENTED `:15`, `:100` |

```bash
curl -X POST -H "X-API-Key: TEST_API_KEY" -H "Content-Type: application/json" \
  -d '{"name":"Demo Uploaded Prompt","format":"wav","data_base64":"BASE64_AUDIO_DATA"}' \
  "https://pbx.example.com/pbx/openapi.php/mediafiles?tenant=TESTTENANT"
```

"Replace the shortened example with the complete encoded file" (`:91`) — the official example truncates the base64 payload with `...`.

### GET, PATCH, DELETE

Standard patterns; response UNKNOWN — critically, whether GET returns `me_data`/audio content is unconfirmed.

## Aliases / Accepted Values

Full alias table (`:15`): `name`, `description`, `format`, `type`, `text`, `engine`, `language`, `data_base64`.
- `type`: `"tts"` observed (not stated exhaustive — a non-TTS/binary type value is implied but not named).
- `format`: `"wav"` observed.
- `engine`: `"azure"` observed.

## Request Schema

Two create forms above (TTS vs binary upload). No formal discriminator field beyond `type` is confirmed to select between them.

## Response Schema

UNKNOWN — no GET example on the page. Whether a GET returns the base64 audio payload (`me_data`) is a specific, material unknown for both storage/bandwidth and content-sensitivity reasons.

## Security Notes

- Audio content itself may contain business-sensitive or PII-laden prompts (e.g. a TTS prompt reciting private information, though the documented examples are generic).
- If GET echoes `me_data` (the full base64 audio), that is a **potentially large, and possibly sensitive, binary payload** returned to any caller with a read key.
- → **SEC-REQ-18**: REVIEW REQUIRED. Confirm whether GET returns `me_data` before any Live consideration; if it does, decide whether audio playback/download should ever be Live-exposed at all (separate from a simple field-name allowlist, since the field itself might be desired for legitimate playback use cases).

## Demo Considerations

Not fixturable: no response shape documented; large binary payloads are also a poor fit for a lightweight fixture regardless.

## Live Considerations

Not a Live candidate until SEC-REQ-18 is resolved.

## Unknowns

- GET response shape — specifically whether `me_data` is returned.
- Full `type` enum (TTS vs binary vs others).
- Maximum file size / format constraints for binary upload.

## Conflicts

None found. (Wrapper's Media File claims, W:105/315, match: path and "tenant/global" scope description.)

## Verification Notes

DOCUMENTED from rev #18. No call has been made.
