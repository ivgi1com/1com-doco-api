# Extension State

## Status

- Evidence: DOCUMENTED (official page, including two response examples)
- Scope: Tenant (a tenant is required even with a global key)
- Access: Read-only
- Security review: **REVIEW REQUIRED** (SEC-REQ-04). The response carries live caller numbers and names.

## Purpose

Returns the live call state of one extension. It checks the extension's registration server and queries the Asterisk manager for the active channel (`extension-state.md:3-5`).
- It differs from the regular extension `GET`, which returns the cached `st_states` value (`:5`).
- The page says it matches the purpose of Proxy `reqtype=info&info=extstate` (`:5`). The two are separate API families, so no Proxy behavior is carried over here.

## Official Sources

- https://manual.mirtapbx.com/books/api/page/extension-state (rev #4, updated 2026-07-03). Snapshot: `source-docs/raw/mirta-openapi/extension-state.md`. Line citations below refer to it.
- Overview endpoint patterns: `overview-and-examples.md:32`.

## Endpoint

| Property | Value | Evidence |
|---|---|---|
| Primary path | `/extensions/state` | DOCUMENTED `:10` |
| Path aliases | none documented | — |
| ID field / Label field | n/a (not an object) | — |

## Authentication and Scope

- Tenant context is required, even with a global API key (`:59`).
- Key transports: `key` query, `X-API-Key`, or `Authorization: Bearer` (`:13`, `:17-23`).
- Which key kinds are accepted (read-only vs full) is not stated: UNKNOWN.

## Operations

### GET /extensions/state

| Parameter | Location | Required | Type | Description | Evidence |
|---|---|---:|---|---|---|
| `tenant` | query | yes | string | tenant code or tenant name | DOCUMENTED `:13` |
| `number` | query | yes, unless `ext` is used | string | extension number to check | DOCUMENTED `:13` |
| `ext` | query | yes, unless `number` is used | string | compatibility alias for `number` | DOCUMENTED `:13` |
| `key` | query | no, if a header is used | string | API key | DOCUMENTED `:13` |

Other methods: the endpoint "supports `GET` only" (`:3`). The error returned for other methods is not stated here.

**Response:** always JSON (`:61`). Three documented cases:

| Case | Body | Evidence |
|---|---|---|
| Active matching channel | an object with `UniqueID`, `LinkedID`, `Connected Line ID`, `Connected Line ID Name`, `Context`, `Extension`, `Direction`, `OtherParty` | `:27-40` |
| Extension exists, no registration server available | the same keys, with `UniqueID: "KO"`, `LinkedID: "Extension not registered"` and the rest `""` | `:42-55` |
| Registered, no active channel | "the live fields are returned empty" | `:60` |

- Field types: every example value is a JSON string (`:30-39`).
- `Direction` shows `IN` (`:37`). Its other values are UNKNOWN.
- HTTP status: UNKNOWN.
- The response for an unknown extension number: UNKNOWN.

```bash
curl -H "X-API-Key: TEST_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/extensions/state?tenant=TESTTENANT&number=100"
```

Synthetic response, using the documented keys only:

```json
{
  "UniqueID": "1700000000.1",
  "LinkedID": "1700000000.1",
  "Connected Line ID": "5550100",
  "Connected Line ID Name": "Demo Caller",
  "Context": "authenticated",
  "Extension": "5550100",
  "Direction": "IN",
  "OtherParty": "5550100"
}
```

## Request Schema

None (GET, query parameters only).

## Response Schema

- The key set is shown above. Keys contain spaces (`Connected Line ID`).
- It is not a column-prefixed object like the configuration objects.

## Aliases / Accepted Values

`ext` is an alias of `number` (`:13`).

## Security Notes

- The response exposes live call metadata: caller number and name (`Connected Line ID`, `Connected Line ID Name`, `OtherParty`) and channel IDs. This is customer PII.
- No credentials are shown in the documented shape.
- Status: REVIEW REQUIRED → SEC-REQ-04 (an allowlist of the 8 documented keys; no pass-through of undocumented keys).

## Demo Considerations

A good Demo candidate. The complete key set and all three states are documented, so fixtures need no invented fields. Use synthetic numbers only.

## Live Considerations

- A read-only operation, but it returns live caller PII.
- Requires SEC-REQ-04 and tenant-scoped keys.
- Whether a read-only key suffices is UNKNOWN.

## Unknowns

- Accepted key kinds.
- HTTP statuses.
- The unknown-extension response.
- The error for non-GET methods.
- The values of `Direction` other than `IN`.

## Conflicts

None.

## Verification Notes

DOCUMENTED from rev #4. No call has been made.
