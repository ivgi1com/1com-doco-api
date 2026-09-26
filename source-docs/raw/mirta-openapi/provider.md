# Provider

The **Provider** object is supported by the MiRTA PBX OpenAPI endpoint. This object is managed at system scope and requires a global API key.

## Object Summary

<table id="bkmrk-propertyvalueobjectp"><thead><tr><th>Property</th><th>Value</th></tr></thead><tbody><tr><td>Object</td><td>`provider`</td></tr><tr><td>Primary path</td><td>`/providers`</td></tr><tr><td>ID field</td><td>`pr_id`</td></tr><tr><td>Label field</td><td>`pr_name`</td></tr><tr><td>Primary source table</td><td>`pr_providers`</td></tr><tr><td>Required on create</td><td>`pr_name`</td></tr><tr><td>Path aliases</td><td>`/provider`, `/providers`</td></tr></tbody></table>

## Endpoint Patterns

<table id="bkmrk-actionexample-patter"><thead><tr><th>Action</th><th>Example pattern</th></tr></thead><tbody><tr><td>List</td><td>`GET https://pbx.example.com/pbx/openapi.php/providers`</td></tr><tr><td>Get by ID</td><td>`GET https://pbx.example.com/pbx/openapi.php/providers/OBJECT_ID`</td></tr><tr><td>Create</td><td>`POST https://pbx.example.com/pbx/openapi.php/providers`</td></tr><tr><td>Update</td><td>`PATCH https://pbx.example.com/pbx/openapi.php/providers/OBJECT_ID`</td></tr><tr><td>Delete</td><td>`DELETE https://pbx.example.com/pbx/openapi.php/providers/OBJECT_ID`</td></tr></tbody></table>

## Accepted Field Aliases

<table id="bkmrk-request-fieldsource-"><thead><tr><th>Request field</th><th>Source field</th></tr></thead><tbody><tr><td>`name`</td><td>`pr_name`</td></tr><tr><td>`peername`</td><td>`pr_peername`</td></tr><tr><td>`peer_name`</td><td>`pr_peername`</td></tr><tr><td>`tech`</td><td>`pr_tech`</td></tr><tr><td>`host`</td><td>`pr_host`</td></tr><tr><td>`disabled`</td><td>`pr_disabled`</td></tr><tr><td>`penalty`</td><td>`pr_penalty`</td></tr><tr><td>`realtime`</td><td>`pr_userealtime`</td></tr><tr><td>`use_realtime`</td><td>`pr_userealtime`</td></tr><tr><td>`calleridmod_id`</td><td>`pr_ca_id`</td></tr><tr><td>`callerid`</td><td>`pr_callerid`</td></tr><tr><td>`caller_id`</td><td>`pr_callerid`</td></tr><tr><td>`callerid_number`</td><td>`pr_callerid`</td></tr><tr><td>`caller_id_number`</td><td>`pr_callerid`</td></tr><tr><td>`calleridname`</td><td>`pr_calleridname`</td></tr><tr><td>`callerid_name`</td><td>`pr_calleridname`</td></tr><tr><td>`caller_id_name`</td><td>`pr_calleridname`</td></tr><tr><td>`did_mod_id`</td><td>`pr_did_ca_id`</td></tr><tr><td>`max_out_channels`</td><td>`pr_maxoutchannels`</td></tr><tr><td>`ignore_sip_cause`</td><td>`pr_ignoresipcause`</td></tr><tr><td>`ignore_busy`</td><td>`pr_ignorebusy`</td></tr><tr><td>`sms_protocol`</td><td>`pr_smsprotocol`</td></tr><tr><td>`sms_url`</td><td>`pr_smsurl`</td></tr><tr><td>`sms_user`</td><td>`pr_smsuser`</td></tr><tr><td>`sms_password`</td><td>`pr_smspassword`</td></tr><tr><td>`canreinvite`</td><td>`sipfriends.canreinvite for chan_sip direct media`</td></tr><tr><td>`direct_media`</td><td>`ps_endpoints.direct_media for PJSIP direct media`</td></tr></tbody></table>

## Important Notes

- Providers are global system objects and always require a global API key.
- Readonly global API keys can list and read providers, but create, update, and delete require the full global API key.
- SIP providers manage the related sipfriends realtime row when realtime is enabled.
- PJSIP providers manage the related ps\_endpoints, ps\_aors, ps\_auths, and ps\_endpoint\_id\_ips rows when realtime is enabled.
- When a provider changes technology, the API removes old realtime rows before creating rows for the new technology.
- Provider callerid and callerid\_name values are optional. When set, calls routed through the provider use those caller ID values instead of extension-derived caller ID.
- Use canreinvite for chan\_sip direct media values. Use direct\_media for PJSIP direct media values.

## Examples

### List Providers

Returns the providers visible to the key and scope.

```
curl -H "X-API-Key: GLOBAL_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/providers"
```

### Get Provider

Reads one object by its internal ID.

```
curl -H "X-API-Key: GLOBAL_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/providers/OBJECT_ID"
```

### Create Provider

Creates a new object. Use the short aliases shown above or the source field names.

```
curl -X POST \
  -H "X-API-Key: GLOBAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "Docs API PJSIP Provider",
  "peername": "docs-pjsip-provider",
  "tech": "PJSIP",
  "realtime": "on",
  "host": "198.51.100.20",
  "username": "docs-trunk",
  "password": "change-this-secret",
  "transport": "UDP",
  "codecs": [
    "ulaw",
    "alaw"
  ],
  "qualify": "yes",
  "qualifyfreq": 60,
  "direct_media": "no",
  "callerid": "+15551230000",
  "callerid_name": "Docs API Provider"
}' \
  "https://pbx.example.com/pbx/openapi.php/providers"
```

### Edit Provider

Updates only the supplied fields.

```
curl -X PATCH \
  -H "X-API-Key: GLOBAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "disabled": "",
  "penalty": 10,
  "max_out_channels": 25,
  "callerid": "+15551230001",
  "callerid_name": "Docs API Main"
}' \
  "https://pbx.example.com/pbx/openapi.php/providers/OBJECT_ID"
```

### Delete Provider

Deletes the object. Check references before deleting configuration used by routing or reporting.

```
curl -X DELETE \
  -H "X-API-Key: GLOBAL_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/providers/OBJECT_ID"
```

### Create SIP Provider

Creates a chan\_sip provider and the related sipfriends realtime peer.

```
curl -X POST \
  -H "X-API-Key: GLOBAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "Docs API SIP Provider",
  "peername": "docs-sip-provider",
  "tech": "SIP",
  "realtime": "on",
  "host": "198.51.100.10",
  "username": "docs-sip-trunk",
  "password": "change-this-secret",
  "transport": "UDP",
  "nat": "force_rport,comedia",
  "codecs": [
    "ulaw",
    "alaw"
  ],
  "canreinvite": "no"
}' \
  "https://pbx.example.com/pbx/openapi.php/providers"
```

### Edit PJSIP Realtime Settings

Updates provider fields and related PJSIP endpoint, AOR, auth, and endpoint identification rows.

```
curl -X PATCH \
  -H "X-API-Key: GLOBAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "host": "198.51.100.21",
  "password": "new-secret",
  "direct_media": "no",
  "sendrpid": "pai",
  "codecs": [
    "ulaw",
    "alaw",
    "opus"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/providers/OBJECT_ID"
```

## Common Errors

<table id="bkmrk-errormeaningmissing_"><thead><tr><th>Error</th><th>Meaning</th></tr></thead><tbody><tr><td>`missing_api_key`</td><td>No API key was supplied in the query string, `X-API-Key`, or bearer token.</td></tr><tr><td>`invalid_api_key`</td><td>The supplied key does not match the tenant or global API key.</td></tr><tr><td>`tenant_required`</td><td>A tenant code is required for tenant-scoped writes or tenant-key reads.</td></tr><tr><td>`read_only_api_key`</td><td>The key can read data but cannot create, update, or delete objects.</td></tr><tr><td>`missing_required_field`</td><td>A required create field is missing.</td></tr></tbody></table>