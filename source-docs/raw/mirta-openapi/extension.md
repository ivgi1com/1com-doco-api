# Extension

The **Extension** object is supported by the MiRTA PBX OpenAPI endpoint. This object is tenant-scoped. Tenant API keys must include `tenant=CANISTRACCI`; writes require a writable API key.

## Object Summary

<table id="bkmrk-propertyvalueobjecte"><thead><tr><th>Property</th><th>Value</th></tr></thead><tbody><tr><td>Object</td><td>`extension`</td></tr><tr><td>Primary path</td><td>`/extensions`</td></tr><tr><td>ID field</td><td>`ex_id`</td></tr><tr><td>Label field</td><td>`ex_number`</td></tr><tr><td>Primary source table</td><td>`ex_extensions`</td></tr><tr><td>Required on create</td><td>`number or ex_number`</td></tr><tr><td>Path aliases</td><td>`/extensions`</td></tr></tbody></table>

## Endpoint Patterns

<table id="bkmrk-actionexample-patter"><thead><tr><th>Action</th><th>Example pattern</th></tr></thead><tbody><tr><td>List</td><td>`GET https://pbx.example.com/pbx/openapi.php/extensions?tenant=CANISTRACCI`</td></tr><tr><td>Get by ID</td><td>`GET https://pbx.example.com/pbx/openapi.php/extensions/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Create</td><td>`POST https://pbx.example.com/pbx/openapi.php/extensions?tenant=CANISTRACCI`</td></tr><tr><td>Update</td><td>`PATCH https://pbx.example.com/pbx/openapi.php/extensions/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Delete</td><td>`DELETE https://pbx.example.com/pbx/openapi.php/extensions/OBJECT_ID?tenant=CANISTRACCI`</td></tr></tbody></table>

## Accepted Field Aliases

<table id="bkmrk-request-fieldsource-"><thead><tr><th>Request field</th><th>Source field</th></tr></thead><tbody><tr><td>`number`</td><td>`ex_number`</td></tr><tr><td>`name`</td><td>`ex_name`</td></tr><tr><td>`tech`</td><td>`ex_tech`</td></tr><tr><td>`sipusername`</td><td>`username`</td></tr><tr><td>`mailbox`</td><td>`ex_mailbox`</td></tr><tr><td>`email`</td><td>`ex_email`</td></tr><tr><td>`password`</td><td>`technology secret/password`</td></tr><tr><td>`callgroups`</td><td>`ex_callgroup`</td></tr><tr><td>`pickupgroups`</td><td>`ex_pickupgroup`</td></tr><tr><td>`realextensions`</td><td>`virtual_items`</td></tr></tbody></table>

## Destination Fields

Destination fields accept one destination string or an array of destination strings such as `EXT-100`, `VOICEMAIL-100`, or another supported destination type and ID pair.

<table id="bkmrk-destination-typeacce"><thead><tr><th>Destination type</th><th>Accepted aliases</th></tr></thead><tbody><tr><td>`EXT-UNCONDITIONAL`</td><td>`unconditional`</td></tr><tr><td>`EXT-NOANSWER`</td><td>`onnoanswer`, `noanswer`, `no_answer`</td></tr><tr><td>`EXT-BUSY`</td><td>`onbusy`, `busy`</td></tr><tr><td>`EXT-OFFLINE`</td><td>`onoffline`, `offline`</td></tr><tr><td>`EXT-ONCONDITION`</td><td>`oncondition`, `condition`</td></tr><tr><td>`EXT-DIALBYNAME`</td><td>`dialbyname`, `dial_by_name`</td></tr><tr><td>`EXT-ONLYALLOWCALL`</td><td>`onlyallowcall`, `only_allow_call`</td></tr><tr><td>`EXT-DONOTCALL`</td><td>`donotcall`, `do_not_call`</td></tr></tbody></table>

## Important Notes

- Supported technologies are SIP, PJSIP, CUSTOM, and VIRTUAL.
- When username is not supplied, the API generates number-tenantcode, for example 100-CANISTRACCI.
- Nested technology data can be supplied with sipfriends, ps\_endpoints, ps\_aors, ps\_auths, ce\_customextensions, or ve\_virtualextensions.

## Examples

### List Extensions

Returns extension ID, number, name, and technology for the tenant.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/extensions?tenant=CANISTRACCI"
```

### Get Extension

Reads one extension by internal ID and includes related technology data.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/extensions/EXTENSION_ID?tenant=CANISTRACCI"
```

### Get Extension by Number

Reads an extension by PBX number. Keep the tenant parameter when the same number may exist in multiple tenants.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/extensions/number/100?tenant=CANISTRACCI"
```

### Create PJSIP Extension

Creates a PJSIP extension and optional endpoint/AOR details.

```
curl -X POST \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "number": "100",
  "name": "Ada Rivera",
  "tech": "PJSIP",
  "password": "change-this-secret",
  "email": "ada.rivera@example.com",
  "ps_endpoints": {
    "transport": "transport-udp",
    "direct_media": "no"
  },
  "ps_aors": {
    "max_contacts": 1,
    "remove_existing": "yes"
  }
}' \
  "https://pbx.example.com/pbx/openapi.php/extensions?tenant=CANISTRACCI"
```

### Create SIP Extension

Creates a chan\_sip extension and optional SIP peer fields.

```
curl -X POST \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "number": "101",
  "name": "Bruno Long",
  "tech": "SIP",
  "password": "change-this-secret",
  "sipfriends": {
    "host": "dynamic",
    "nat": "force_rport,comedia"
  }
}' \
  "https://pbx.example.com/pbx/openapi.php/extensions?tenant=CANISTRACCI"
```

### Create Custom Extension

Creates an extension that points to a custom dial string or custom endpoint behavior.

```
curl -X POST \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "number": "102",
  "name": "Custom Doorphone",
  "tech": "CUSTOM",
  "ce_customextensions": {
    "ce_peername": "doorphone-main",
    "ce_destination": "Local/100@from-internal"
  }
}' \
  "https://pbx.example.com/pbx/openapi.php/extensions?tenant=CANISTRACCI"
```

### Create Virtual Extension

Creates a virtual extension and maps it to real extension IDs.

```
curl -X POST \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "number": "103",
  "name": "After Hours Virtual",
  "tech": "VIRTUAL",
  "realextensions": [
    100,
    101
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/extensions?tenant=CANISTRACCI"
```

### Edit Extension

Updates only the supplied extension fields.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "Ada Rivera - Desk",
  "email": "ada.desk@example.com",
  "callgroups": [
    1
  ],
  "pickupgroups": [
    1
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/extensions/EXTENSION_ID?tenant=CANISTRACCI"
```

### Delete Extension

Deletes the extension, its technology row, and extension destinations.

```
curl -X DELETE \
  -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/extensions/EXTENSION_ID?tenant=CANISTRACCI"
```

### Extension Unconditional Destination

Sets the `EXT-UNCONDITIONAL` destination using the `unconditional` alias.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "unconditional": [
    "EXT-101"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/extensions/EXTENSION_ID?tenant=CANISTRACCI"
```

### Extension No Answer Destination

Sets the `EXT-NOANSWER` destination using the `onnoanswer` alias.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "onnoanswer": [
    "EXT-101"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/extensions/EXTENSION_ID?tenant=CANISTRACCI"
```

### Extension Busy Destination

Sets the `EXT-BUSY` destination using the `onbusy` alias.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "onbusy": [
    "EXT-101"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/extensions/EXTENSION_ID?tenant=CANISTRACCI"
```

### Extension Offline Destination

Sets the `EXT-OFFLINE` destination using the `onoffline` alias.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "onoffline": [
    "EXT-101"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/extensions/EXTENSION_ID?tenant=CANISTRACCI"
```

### Extension On Condition Destination

Sets the `EXT-ONCONDITION` destination using the `oncondition` alias.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "oncondition": [
    "EXT-101"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/extensions/EXTENSION_ID?tenant=CANISTRACCI"
```

### Extension Dial by Name Destination

Sets the `EXT-DIALBYNAME` destination using the `dialbyname` alias.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "dialbyname": [
    "EXT-101"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/extensions/EXTENSION_ID?tenant=CANISTRACCI"
```

### Extension Only Allow Call Destination

Sets the `EXT-ONLYALLOWCALL` destination using the `onlyallowcall` alias.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "onlyallowcall": [
    "EXT-101"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/extensions/EXTENSION_ID?tenant=CANISTRACCI"
```

### Extension Do Not Call Destination

Sets the `EXT-DONOTCALL` destination using the `donotcall` alias.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "donotcall": [
    "EXT-101"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/extensions/EXTENSION_ID?tenant=CANISTRACCI"
```

### Extension Destinations Object Form

The destination aliases are convenient, but integrations can also send the database destination type names inside the destinations object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "destinations": {
    "EXT-BUSY": [
      "EXT-101"
    ],
    "EXT-NOANSWER": [
      "VOICEMAIL-100"
    ]
  }
}' \
  "https://pbx.example.com/pbx/openapi.php/extensions/EXTENSION_ID?tenant=CANISTRACCI"
```

### Extension UNCONDITIONAL Destination

Updates the `EXT-UNCONDITIONAL` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "unconditional": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/extensions/OBJECT_ID?tenant=CANISTRACCI"
```

### Extension NOANSWER Destination

Updates the `EXT-NOANSWER` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "onnoanswer": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/extensions/OBJECT_ID?tenant=CANISTRACCI"
```

### Extension BUSY Destination

Updates the `EXT-BUSY` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "onbusy": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/extensions/OBJECT_ID?tenant=CANISTRACCI"
```

### Extension OFFLINE Destination

Updates the `EXT-OFFLINE` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "onoffline": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/extensions/OBJECT_ID?tenant=CANISTRACCI"
```

### Extension ONCONDITION Destination

Updates the `EXT-ONCONDITION` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "oncondition": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/extensions/OBJECT_ID?tenant=CANISTRACCI"
```

### Extension DIALBYNAME Destination

Updates the `EXT-DIALBYNAME` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "dialbyname": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/extensions/OBJECT_ID?tenant=CANISTRACCI"
```

### Extension ONLYALLOWCALL Destination

Updates the `EXT-ONLYALLOWCALL` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "onlyallowcall": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/extensions/OBJECT_ID?tenant=CANISTRACCI"
```

### Extension DONOTCALL Destination

Updates the `EXT-DONOTCALL` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "donotcall": [
    "EXT-100"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/extensions/OBJECT_ID?tenant=CANISTRACCI"
```

## Common Errors

<table id="bkmrk-errormeaningmissing_"><thead><tr><th>Error</th><th>Meaning</th></tr></thead><tbody><tr><td>`missing_api_key`</td><td>No API key was supplied in the query string, `X-API-Key`, or bearer token.</td></tr><tr><td>`invalid_api_key`</td><td>The supplied key does not match the tenant or global API key.</td></tr><tr><td>`tenant_required`</td><td>A tenant code is required for tenant-scoped writes or tenant-key reads.</td></tr><tr><td>`read_only_api_key`</td><td>The key can read data but cannot create, update, or delete objects.</td></tr><tr><td>`missing_required_field`</td><td>A required create field is missing.</td></tr></tbody></table>