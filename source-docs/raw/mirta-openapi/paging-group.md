# Paging Group

The **Paging Group** object is supported by the MiRTA PBX OpenAPI endpoint. This object is tenant-scoped. Tenant API keys must include `tenant=CANISTRACCI`; writes require a writable API key.

## Object Summary

<table id="bkmrk-propertyvalueobjectp"><thead><tr><th>Property</th><th>Value</th></tr></thead><tbody><tr><td>Object</td><td>`paginggroup`</td></tr><tr><td>Primary path</td><td>`/paginggroups`</td></tr><tr><td>ID field</td><td>`pa_id`</td></tr><tr><td>Label field</td><td>`pa_name`</td></tr><tr><td>Primary source table</td><td>`pa_paginggroups`</td></tr><tr><td>Required on create</td><td>`pa_name`, `pa_number`</td></tr><tr><td>Path aliases</td><td>`/paging`, `/pagings`, `/paginggroup`, `/paginggroups`, `/intercom`, `/intercoms`</td></tr></tbody></table>

## Endpoint Patterns

<table id="bkmrk-actionexample-patter"><thead><tr><th>Action</th><th>Example pattern</th></tr></thead><tbody><tr><td>List</td><td>`GET https://pbx.example.com/pbx/openapi.php/paginggroups?tenant=CANISTRACCI`</td></tr><tr><td>Get by ID</td><td>`GET https://pbx.example.com/pbx/openapi.php/paginggroups/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Create</td><td>`POST https://pbx.example.com/pbx/openapi.php/paginggroups?tenant=CANISTRACCI`</td></tr><tr><td>Update</td><td>`PATCH https://pbx.example.com/pbx/openapi.php/paginggroups/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Delete</td><td>`DELETE https://pbx.example.com/pbx/openapi.php/paginggroups/OBJECT_ID?tenant=CANISTRACCI`</td></tr></tbody></table>

## Accepted Field Aliases

<table id="bkmrk-request-fieldsource-"><thead><tr><th>Request field</th><th>Source field</th></tr></thead><tbody><tr><td>`name`</td><td>`pa_name`</td></tr><tr><td>`number`</td><td>`pa_number`</td></tr><tr><td>`pin`</td><td>`pa_pin`</td></tr><tr><td>`bidirectional`</td><td>`pa_bidirectional`</td></tr><tr><td>`checkinuse`</td><td>`pa_checkinuse`</td></tr><tr><td>`mediafile_id`</td><td>`pa_me_id`</td></tr><tr><td>`manualheader`</td><td>`pa_manualheader`</td></tr></tbody></table>

## Destination Fields

Destination fields accept one destination string or an array of destination strings such as `EXT-100`, `VOICEMAIL-100`, or another supported destination type and ID pair.

<table id="bkmrk-destination-typeacce"><thead><tr><th>Destination type</th><th>Accepted aliases</th></tr></thead><tbody><tr><td>`PAGING`</td><td>`extensions`, `peers`, `members`, `destination`</td></tr></tbody></table>

## Examples

### List Paging Groups

Returns the paging groups visible to the key and scope.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/paginggroups?tenant=CANISTRACCI"
```

### Get Paging Group

Reads one object by its internal ID.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/paginggroups/OBJECT_ID?tenant=CANISTRACCI"
```

### Create Paging Group

Creates a new object. Use the short aliases shown above or the source field names.

```
curl -X POST \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "Docs API Paging Group",
  "number": "830",
  "pin": "1234",
  "bidirectional": "no"
}' \
  "https://pbx.example.com/pbx/openapi.php/paginggroups?tenant=CANISTRACCI"
```

### Edit Paging Group

Updates only the supplied fields.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "bidirectional": "yes"
}' \
  "https://pbx.example.com/pbx/openapi.php/paginggroups/OBJECT_ID?tenant=CANISTRACCI"
```

### Delete Paging Group

Deletes the object. Check references before deleting configuration used by routing or reporting.

```
curl -X DELETE \
  -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/paginggroups/OBJECT_ID?tenant=CANISTRACCI"
```

### Paging Group Destination

Updates the `PAGING` destination. The same value can also be sent inside a `destinations` object.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "extensions": [
    100,
    101
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/paginggroups/OBJECT_ID?tenant=CANISTRACCI"
```

## Common Errors

<table id="bkmrk-errormeaningmissing_"><thead><tr><th>Error</th><th>Meaning</th></tr></thead><tbody><tr><td>`missing_api_key`</td><td>No API key was supplied in the query string, `X-API-Key`, or bearer token.</td></tr><tr><td>`invalid_api_key`</td><td>The supplied key does not match the tenant or global API key.</td></tr><tr><td>`tenant_required`</td><td>A tenant code is required for tenant-scoped writes or tenant-key reads.</td></tr><tr><td>`read_only_api_key`</td><td>The key can read data but cannot create, update, or delete objects.</td></tr><tr><td>`missing_required_field`</td><td>A required create field is missing.</td></tr></tbody></table>