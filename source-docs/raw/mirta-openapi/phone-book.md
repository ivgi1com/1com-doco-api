# Phone Book

The **Phone Book** object is supported by the MiRTA PBX OpenAPI endpoint. This object is tenant-scoped. Tenant API keys must include `tenant=CANISTRACCI`; writes require a writable API key.

## Object Summary

<table id="bkmrk-propertyvalueobjectp"><thead><tr><th>Property</th><th>Value</th></tr></thead><tbody><tr><td>Object</td><td>`phonebook`</td></tr><tr><td>Primary path</td><td>`/phonebooks`</td></tr><tr><td>ID field</td><td>`pb_id`</td></tr><tr><td>Label field</td><td>`pb_name`</td></tr><tr><td>Primary source table</td><td>`pb_phonebooks`</td></tr><tr><td>Required on create</td><td>`pb_name`</td></tr><tr><td>Path aliases</td><td>`/phonebook`, `/phonebooks`, `/phone_book`, `/phone_books`</td></tr></tbody></table>

## Endpoint Patterns

<table id="bkmrk-actionexample-patter"><thead><tr><th>Action</th><th>Example pattern</th></tr></thead><tbody><tr><td>List</td><td>`GET https://pbx.example.com/pbx/openapi.php/phonebooks?tenant=CANISTRACCI`</td></tr><tr><td>Get by ID</td><td>`GET https://pbx.example.com/pbx/openapi.php/phonebooks/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Create</td><td>`POST https://pbx.example.com/pbx/openapi.php/phonebooks?tenant=CANISTRACCI`</td></tr><tr><td>Update</td><td>`PATCH https://pbx.example.com/pbx/openapi.php/phonebooks/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Delete</td><td>`DELETE https://pbx.example.com/pbx/openapi.php/phonebooks/OBJECT_ID?tenant=CANISTRACCI`</td></tr></tbody></table>

## Accepted Field Aliases

<table id="bkmrk-request-fieldsource-"><thead><tr><th>Request field</th><th>Source field</th></tr></thead><tbody><tr><td>`name`</td><td>`pb_name`</td></tr><tr><td>`include_extensions`</td><td>`pb_includeext`</td></tr><tr><td>`includeext`</td><td>`pb_includeext`</td></tr><tr><td>`include_short_numbers`</td><td>`pb_includeshortnum`</td></tr><tr><td>`includeshortnum`</td><td>`pb_includeshortnum`</td></tr><tr><td>`layout`</td><td>`pl_phonebooklayouts`</td></tr><tr><td>`items`</td><td>`pl_phonebooklayouts`</td></tr></tbody></table>

## Important Notes

- The layout field replaces the phone book field layout. Values can be phone book item codes such as NAME, PHONE1, EMAIL, and ROUTING, or pi\_phonebookitems IDs.
- When layout is omitted on create, the API creates the default layout NAME, PHONE1, PHONE2, EMAIL, ROUTING.
- Deleting a phone book removes its layout rows, entries, entry details, and phone assignment rows.

## Examples

### List Phone Books

Returns the phone books visible to the key and scope.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/phonebooks?tenant=CANISTRACCI"
```

### Get Phone Book

Reads one object by its internal ID.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/phonebooks/OBJECT_ID?tenant=CANISTRACCI"
```

### Create Phone Book

Creates a new object. Use the short aliases shown above or the source field names.

```
curl -X POST \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "Docs API Phone Book",
  "include_extensions": "no",
  "include_short_numbers": "no",
  "layout": [
    "NAME",
    "PHONE1",
    "PHONE2",
    "EMAIL",
    "ROUTING"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/phonebooks?tenant=CANISTRACCI"
```

### Edit Phone Book

Updates only the supplied fields.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "name": "Docs API Phone Book Updated",
  "layout": [
    "NAME",
    "PHONE1",
    "EMAIL",
    "ROUTING"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/phonebooks/OBJECT_ID?tenant=CANISTRACCI"
```

### Delete Phone Book

Deletes the object. Check references before deleting configuration used by routing or reporting.

```
curl -X DELETE \
  -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/phonebooks/OBJECT_ID?tenant=CANISTRACCI"
```

### Replace Phone Book Layout

Replaces the pl\_phonebooklayouts rows for the selected phone book.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "layout": [
    "NAME",
    "PHONE1",
    "EMAIL",
    "ROUTING"
  ]
}' \
  "https://pbx.example.com/pbx/openapi.php/phonebooks/OBJECT_ID?tenant=CANISTRACCI"
```

## Common Errors

<table id="bkmrk-errormeaningmissing_"><thead><tr><th>Error</th><th>Meaning</th></tr></thead><tbody><tr><td>`missing_api_key`</td><td>No API key was supplied in the query string, `X-API-Key`, or bearer token.</td></tr><tr><td>`invalid_api_key`</td><td>The supplied key does not match the tenant or global API key.</td></tr><tr><td>`tenant_required`</td><td>A tenant code is required for tenant-scoped writes or tenant-key reads.</td></tr><tr><td>`read_only_api_key`</td><td>The key can read data but cannot create, update, or delete objects.</td></tr><tr><td>`missing_required_field`</td><td>A required create field is missing.</td></tr></tbody></table>