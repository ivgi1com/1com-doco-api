# Phone Book Entry

The **Phone Book Entry** object is supported by the MiRTA PBX OpenAPI endpoint. This object is tenant-scoped. Tenant API keys must include `tenant=CANISTRACCI`; writes require a writable API key.

## Object Summary

<table id="bkmrk-propertyvalueobjectp"><thead><tr><th>Property</th><th>Value</th></tr></thead><tbody><tr><td>Object</td><td>`phonebookentry`</td></tr><tr><td>Primary path</td><td>`/phonebookentries`</td></tr><tr><td>ID field</td><td>`pe_id`</td></tr><tr><td>Label field</td><td>`pe_id`</td></tr><tr><td>Primary source table</td><td>`pe_phonebookentries`</td></tr><tr><td>Required on create</td><td>`phonebook_id`, `at least one value`</td></tr><tr><td>Path aliases</td><td>`/phonebookentry`, `/phonebookentries`, `/phonebook_entry`, `/phonebook_entries`, `/phonebookcontact`, `/phonebookcontacts`, `/phonebook_contact`, `/phonebook_contacts`</td></tr></tbody></table>

## Endpoint Patterns

<table id="bkmrk-actionexample-patter"><thead><tr><th>Action</th><th>Example pattern</th></tr></thead><tbody><tr><td>List</td><td>`GET https://pbx.example.com/pbx/openapi.php/phonebookentries?tenant=CANISTRACCI`</td></tr><tr><td>Get by ID</td><td>`GET https://pbx.example.com/pbx/openapi.php/phonebookentries/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Create</td><td>`POST https://pbx.example.com/pbx/openapi.php/phonebookentries?tenant=CANISTRACCI`</td></tr><tr><td>Update</td><td>`PATCH https://pbx.example.com/pbx/openapi.php/phonebookentries/OBJECT_ID?tenant=CANISTRACCI`</td></tr><tr><td>Delete</td><td>`DELETE https://pbx.example.com/pbx/openapi.php/phonebookentries/OBJECT_ID?tenant=CANISTRACCI`</td></tr></tbody></table>

## Accepted Field Aliases

<table id="bkmrk-request-fieldsource-"><thead><tr><th>Request field</th><th>Source field</th></tr></thead><tbody><tr><td>`phonebook_id`</td><td>`pe_pb_id`</td></tr><tr><td>`pbid`</td><td>`pe_pb_id`</td></tr><tr><td>`values`</td><td>`pd_phonebookdetails keyed by pi_code`</td></tr><tr><td>`fields`</td><td>`pd_phonebookdetails keyed by pi_code`</td></tr><tr><td>`details`</td><td>`pd_phonebookdetails rows`</td></tr><tr><td>`NAME`</td><td>`phone book item code`</td></tr><tr><td>`PHONE1`</td><td>`phone book item code`</td></tr><tr><td>`PHONE2`</td><td>`phone book item code`</td></tr><tr><td>`EMAIL`</td><td>`phone book item code`</td></tr><tr><td>`ROUTING`</td><td>`phone book item code`</td></tr></tbody></table>

## Important Notes

- Entry values are stored in pd\_phonebookdetails and are keyed by pi\_phonebookitems.pi\_code.
- Send values as a values or fields object, as top-level item codes, or as detail rows containing pi\_id or pi\_code and a value.
- Sending an empty string or null for a value clears that field from the entry.

## Examples

### List Phone Book Entries

Returns the phone book entries visible to the key and scope.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/phonebookentries?tenant=CANISTRACCI"
```

### Get Phone Book Entry

Reads one object by its internal ID.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/phonebookentries/OBJECT_ID?tenant=CANISTRACCI"
```

### Create Phone Book Entry

Creates a new object. Use the short aliases shown above or the source field names.

```
curl -X POST \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "phonebook_id": 12,
  "values": {
    "NAME": "Ada Rivera",
    "PHONE1": "+15551230001",
    "EMAIL": "ada.rivera@example.com",
    "ROUTING": "EXT-100"
  }
}' \
  "https://pbx.example.com/pbx/openapi.php/phonebookentries?tenant=CANISTRACCI"
```

### Edit Phone Book Entry

Updates only the supplied fields.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "values": {
    "PHONE1": "+15551230002",
    "EMAIL": "ada.updated@example.com"
  }
}' \
  "https://pbx.example.com/pbx/openapi.php/phonebookentries/OBJECT_ID?tenant=CANISTRACCI"
```

### Delete Phone Book Entry

Deletes the object. Check references before deleting configuration used by routing or reporting.

```
curl -X DELETE \
  -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/phonebookentries/OBJECT_ID?tenant=CANISTRACCI"
```

### List Entries for One Phone Book

Filters the phone book entry list by parent phonebook\_id. The aliases pbid and pe\_pb\_id are also accepted.

```
curl -X GET \
  -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/phonebookentries?tenant=CANISTRACCI&phonebook_id=12"
```

### Clear Phone Book Entry Value

Removes the EMAIL detail row for the selected entry while leaving other values unchanged.

```
curl -X PATCH \
  -H "X-API-Key: TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
  "values": {
    "EMAIL": ""
  }
}' \
  "https://pbx.example.com/pbx/openapi.php/phonebookentries/OBJECT_ID?tenant=CANISTRACCI"
```

## Common Errors

<table id="bkmrk-errormeaningmissing_"><thead><tr><th>Error</th><th>Meaning</th></tr></thead><tbody><tr><td>`missing_api_key`</td><td>No API key was supplied in the query string, `X-API-Key`, or bearer token.</td></tr><tr><td>`invalid_api_key`</td><td>The supplied key does not match the tenant or global API key.</td></tr><tr><td>`tenant_required`</td><td>A tenant code is required for tenant-scoped writes or tenant-key reads.</td></tr><tr><td>`read_only_api_key`</td><td>The key can read data but cannot create, update, or delete objects.</td></tr><tr><td>`missing_required_field`</td><td>A required create field is missing.</td></tr></tbody></table>