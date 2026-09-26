# Auth Token

The **Auth Token** endpoint generates or resets temporary login tokens for web users and extension web identities. The generated token can be used in place of the user password on the MiRTA PBX login page.

## Authentication Scope

This endpoint always requires the global full API key. Tenant API keys and read-only API keys are rejected. The token is returned only once when it is generated, so store it securely in the calling system if it needs to be delivered to the user.

<table id="bkmrk-operationpathapi-key"><thead><tr><th>Operation</th><th>Path</th><th>API key</th></tr></thead><tbody><tr><td>Generate token</td><td>`POST https://pbx.example.com/pbx/openapi.php/auth/token`</td><td>`GLOBAL_API_KEY`</td></tr><tr><td>Reset token</td><td>`DELETE https://pbx.example.com/pbx/openapi.php/auth/token`</td><td>`GLOBAL_API_KEY`</td></tr></tbody></table>

## Supported Identities

The user value is resolved in the same order as the legacy ProxyAPI token feature: MiRTA PBX web users first, then extension web users, then SIP extension usernames, then PJSIP endpoint IDs when the extension does not have a separate web user.

<table id="bkmrk-identity-typematched"><thead><tr><th>Identity type</th><th>Matched field</th></tr></thead><tbody><tr><td>Web user</td><td>`us_users.us_username`</td></tr><tr><td>Extension web user</td><td>`ex_extensions.ex_webuser`</td></tr><tr><td>SIP extension username</td><td>`sipfriends.name` when `ex_webuser` is empty</td></tr><tr><td>PJSIP endpoint ID</td><td>`ps_endpoints.id` when `ex_webuser` is empty</td></tr></tbody></table>

## Generate Token

Use `validity` set to `ONCE` for a single-use token, or provide a date/time string to make the token valid until that time.

```
curl -X POST \
  -H "X-API-Key: GLOBAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"user":"100","validity":"ONCE"}' \
  "https://pbx.example.com/pbx/openapi.php/auth/token"
```

Successful response:

```
{
  "token": "generated-token-value",
  "user": "100",
  "target_type": "WEBPASSWORD"
}
```

## Generate Expiring Token

```
curl -X POST \
  -H "X-API-Key: GLOBAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"user":"api.operator","validity":"2026-06-30 23:59:59"}' \
  "https://pbx.example.com/pbx/openapi.php/auth/token"
```

## Reset Token

Resetting a token clears the stored token hash and validity for the resolved user identity.

```
curl -X DELETE \
  -H "X-API-Key: GLOBAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"user":"100"}' \
  "https://pbx.example.com/pbx/openapi.php/auth/token"
```

Successful response:

```
{
  "reset": true,
  "user": "100",
  "target_type": "WEBPASSWORD"
}
```

## Important Notes

- Only the generated token value is returned. MiRTA PBX stores a SHA-256 hash of the token.
- A single-use token is cleared after a successful login.
- Generating a new token replaces any previous token for that user identity.
- This endpoint manages login tokens only. It does not create or rotate OpenAPI API keys.

## Common Errors

<table id="bkmrk-errormeaningmissing_"><thead><tr><th>Error</th><th>Meaning</th></tr></thead><tbody><tr><td>`missing_api_key`</td><td>No API key was supplied in the query string, `X-API-Key`, or bearer token.</td></tr><tr><td>`invalid_api_key`</td><td>The supplied key does not match a valid API key.</td></tr><tr><td>`admin_required`</td><td>A global API key is required.</td></tr><tr><td>`read_only_api_key`</td><td>The supplied key is read-only and cannot generate or reset tokens.</td></tr><tr><td>`missing_user`</td><td>The request body did not include a user value.</td></tr><tr><td>`invalid_validity`</td><td>The validity value was not ONCE and could not be parsed as a date/time.</td></tr><tr><td>`user_not_found`</td><td>No supported web user or extension identity matched the requested user value.</td></tr></tbody></table>