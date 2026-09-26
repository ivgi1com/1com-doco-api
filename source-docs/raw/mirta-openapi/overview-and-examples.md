# Overview and Examples

The MiRTA PBX OpenAPI endpoint exposes configuration and reporting APIs as an OpenAPI 3.0.3 JSON specification. OpenAPI describes the available paths, methods, authentication schemes, request bodies, and response schemas in a machine-readable format.

Using the OpenAPI specification makes integrations easier to test and maintain: developers can generate client code, import the API into tools such as Postman or Swagger UI, validate request shapes, and keep documentation aligned with the endpoint implementation.

## Base URL

```
https://pbx.example.com/pbx/openapi.php
https://pbx.example.com/pbx/openapi.php?spec=1
https://pbx.example.com/pbx/openapi.php/openapi.json
https://pbx.example.com/pbx/openapi.php/swagger.json
```

## Authentication

Send the API key as a `key` query parameter, an `X-API-Key` header, or an `Authorization: Bearer` token. Tenant API keys require a tenant parameter. Global keys can access global administration objects and can list tenant-scoped objects across tenants when no tenant parameter is supplied.

```
curl -H "X-API-Key: TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/extensions?tenant=CANISTRACCI"

curl -H "Authorization: Bearer TENANT_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/extensions/number/100?tenant=CANISTRACCI"

curl "https://pbx.example.com/pbx/openapi.php/extensions?tenant=CANISTRACCI&key=TENANT_API_KEY"
```

## Endpoint Patterns

<table id="bkmrk-actionpatternlistget"><thead><tr><th>Action</th><th>Pattern</th></tr></thead><tbody><tr><td>List</td><td>`GET https://pbx.example.com/pbx/openapi.php/extensions?tenant=CANISTRACCI`</td></tr><tr><td>Get by ID</td><td>`GET https://pbx.example.com/pbx/openapi.php/extensions/EXTENSION_ID?tenant=CANISTRACCI`</td></tr><tr><td>Get extension by number</td><td>`GET https://pbx.example.com/pbx/openapi.php/extensions/number/100?tenant=CANISTRACCI`</td></tr><tr><td>Get live extension state</td><td>`GET https://pbx.example.com/pbx/openapi.php/extensions/state?tenant=CANISTRACCI&number=100`</td></tr><tr><td>Dial</td><td>`POST https://pbx.example.com/pbx/openapi.php/dial?tenant=CANISTRACCI`</td></tr><tr><td>Create</td><td>`POST https://pbx.example.com/pbx/openapi.php/extensions?tenant=CANISTRACCI`</td></tr><tr><td>Modify</td><td>`PATCH https://pbx.example.com/pbx/openapi.php/extensions/EXTENSION_ID?tenant=CANISTRACCI`</td></tr><tr><td>Delete</td><td>`DELETE https://pbx.example.com/pbx/openapi.php/extensions/EXTENSION_ID?tenant=CANISTRACCI`</td></tr></tbody></table>

## Supported Objects

Each supported object has its own page in this chapter. Most configuration objects support CRUD operations. CDR, Simple CDR, AI Analysis, and AI Logs are read-only reporting endpoints. The examples use fictional IDs, numbers, names, and keys; replace them with values from the target PBX.

<table id="bkmrk-objectprimary-pathau"><thead><tr><th>Object</th><th>Primary path</th><th>Authentication scope</th><th>Operations or required fields</th></tr></thead><tbody><tr><td>**Auth Token**</td><td>`/auth/token`</td><td>Global full API key</td><td>`POST` generate, `DELETE` reset</td></tr><tr><td>**Dial**</td><td>`/dial`</td><td>Tenant full API key</td><td>`POST` only; requires `source` and `dest`</td></tr><tr><td>**CDR**</td><td>`/cdrs`</td><td>Tenant API key or global key; GET only</td><td>`GET` only</td></tr><tr><td>**Simple CDR**</td><td>`/simplecdrs`</td><td>Tenant API key or global key; GET only</td><td>`GET` only</td></tr><tr><td>**AI Analysis**</td><td>`/aianalysis`</td><td>Tenant API key or global key; GET only</td><td>`GET` only; requires `uniqueid`</td></tr><tr><td>**AI Logs**</td><td>`/ailogs`</td><td>Tenant full or read-only API key, or global key; GET only</td><td>`GET` only; JSON or CSV; defaults to the current day</td></tr><tr><td>**Extension**</td><td>`/extensions`</td><td>Tenant API key</td><td>`number or ex_number`; `GET /extensions/state` for live state</td></tr><tr><td>**Tenant**</td><td>`/tenants`</td><td>Global API key</td><td>`te_name`, `te_code`</td></tr><tr><td>**User**</td><td>`/users`</td><td>Global API key</td><td>`us_username`</td></tr><tr><td>**User Profile**</td><td>`/userprofiles`</td><td>Global API key</td><td>`up_name`</td></tr><tr><td>**Routing Profile**</td><td>`/routingprofiles`</td><td>Global API key</td><td>`rp_name`</td></tr><tr><td>**Provider**</td><td>`/providers`</td><td>Global API key</td><td>`pr_name`</td></tr><tr><td>**Voicemail**</td><td>`/voicemails`</td><td>Tenant API key</td><td>`mailbox`</td></tr><tr><td>**IVR**</td><td>`/ivrs`</td><td>Tenant API key</td><td>`iv_name`</td></tr><tr><td>**Custom Destination**</td><td>`/customdestinations`</td><td>Tenant API key or global key with global=1</td><td>`cu_name`, `cu_ct_id`</td></tr><tr><td>**Condition**</td><td>`/conditions`</td><td>Tenant API key</td><td>`co_type`</td></tr><tr><td>**Hunt List**</td><td>`/huntlists`</td><td>Tenant API key</td><td>`hu_name`</td></tr><tr><td>**DID**</td><td>`/dids`</td><td>Tenant API key</td><td>`di_number`</td></tr><tr><td>**Queue**</td><td>`/queues`</td><td>Tenant API key</td><td>No required create field listed</td></tr><tr><td>**Setting**</td><td>`/settings`</td><td>Tenant API key or global key with global=1</td><td>`se_code`</td></tr><tr><td>**Media File**</td><td>`/mediafiles`</td><td>Tenant API key or global key with global=1</td><td>`me_name`</td></tr><tr><td>**Music On Hold**</td><td>`/musiconholds`</td><td>Tenant API key or global key with global=1</td><td>`mu_name`</td></tr><tr><td>**Paging Group**</td><td>`/paginggroups`</td><td>Tenant API key</td><td>`pa_name`, `pa_number`</td></tr><tr><td>**Conference Room**</td><td>`/conferencerooms`</td><td>Tenant API key</td><td>`cr_name`, `cr_number`</td></tr><tr><td>**Flow**</td><td>`/flows`</td><td>Tenant API key</td><td>`fl_name`</td></tr><tr><td>**Tenant Variable**</td><td>`/tenantvariables`</td><td>Tenant API key</td><td>`tv_al_id`</td></tr><tr><td>**DISA**</td><td>`/disas`</td><td>Tenant API key</td><td>`ds_name`</td></tr><tr><td>**Caller ID Blacklist**</td><td>`/calleridblacklists`</td><td>Tenant API key or global key with global=1</td><td>`bl_callerid`</td></tr><tr><td>**Campaign**</td><td>`/campaigns`</td><td>Tenant API key</td><td>`ca_name`</td></tr><tr><td>**Campaign Number**</td><td>`/campaignnumbers`</td><td>Tenant API key</td><td>`cn_ca_id`, `cn_number`</td></tr><tr><td>**Cron Job**</td><td>`/cronjobs`</td><td>Tenant API key or global key with global=1</td><td>`cr_name`</td></tr><tr><td>**Feature Code**</td><td>`/featurecodes`</td><td>Tenant API key or global key with global=1</td><td>`fe_code`</td></tr><tr><td>**Short Number**</td><td>`/shortnumbers`</td><td>Tenant API key or global key with global=1</td><td>`sn_number`</td></tr><tr><td>**Phone Book**</td><td>`/phonebooks`</td><td>Tenant API key</td><td>`pb_name`</td></tr><tr><td>**Phone Book Entry**</td><td>`/phonebookentries`</td><td>Tenant API key</td><td>`phonebook_id`, `at least one value`</td></tr><tr><td>**Provisioning Phone**</td><td>`/provisioningphones`</td><td>Tenant API key</td><td>`ph_name`, `ph_mac`</td></tr></tbody></table>

## Errors

Errors are returned as JSON with an error code and message. Common errors include `missing_api_key`, `invalid_api_key`, `tenant_not_found`, `invalid_json`, `missing_required_field`, `read_only_api_key`, `method_not_allowed`, and `not_found`.