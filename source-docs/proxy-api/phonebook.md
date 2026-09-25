# PHONEBOOK

**Purpose:** "Manage phone books" (Doc line 90).
**Method:** GET for `query`, POST (`stated_jsondata`-like, but field name
is `values` not `jsondata` — see `_common.md`) for `add`.
**Source:** Site lines 156–172; Doc lines 90–105.

Note: the Site's own TOC groups this under a heading literally spelled
"PHONEBOOKS" (plural), but every example and every Doc reference uses
`reqtype=PHONEBOOK` (singular) — the old MiRTA-sourced audit already
flagged this same mismatch (`../DOCS_AUDIT.md`, prior finding A-10) and it
recurs unchanged in the new source. Confirmed, not a one-off typo.

## Parameters (Doc lines 91–102)

| Param | Required | Accepted values | Description |
|---|---|---|---|
| `tenant` | not stated (Doc: "select the tenant") | tenant code | |
| `phonebook` | not stated (Doc: "select the phone book by name") | phonebook name | |
| `subreqtype` | not stated | `query`, `add`, `delete`, `cleanall` | sub-request selector |
| `field` | required for `subreqtype=query` | field name | |
| `value` | required for `subreqtype=query` | search value, `%` for partial | |
| `values` | required for `subreqtype=add` | JSON-encoded associative array of field:value | POSTed, not a query param — see `_common.md` |
| `peid` | required for `subreqtype=delete` | id returned by a prior search | |
| (none) | — | — | `subreqtype=cleanall` deletes every record in the phonebook, no extra params |

## Examples

### Search for an entry — `subreqtype=query` (Site, line 158)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=PHONEBOOK&subreqtype=query&tenant=DEMO&phonebook=Default&field=name&value=Ben
```

### Reference — `subreqtype=add` as a bare URL (Doc, line 105; the PHP example below is the Site's fuller version of the same call)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?reqtype=PHONEBOOK&phonebook=phonebookname&tenant=TENANTNAME&subreqtype=add&key=apikey
```

### Add an entry — `subreqtype=add` (Site, lines 159–172)
```php
<?php
$phonebook['NAME']="Ross";
$phonebook['PHONE1']="3564732920";
$url = "https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=PHONEBOOK&subreqtype=add&phonebook=Default&tenant=DEMO";
$resource = curl_init();
curl_setopt($resource, CURLOPT_URL, $url);
curl_setopt($resource, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($resource, CURLOPT_VERBOSE, true);
curl_setopt($resource, CURLOPT_POSTFIELDS, "values=".urlencode(json_encode($phonebook)));
$data = curl_exec($resource);
curl_close($resource);
print_r($data);
?>
```
Field names (`NAME`, `PHONE1`) are the example's own; the full set of
accepted phonebook field names is not documented.

Response for either: not documented.

## Source
Site lines 156–172; Doc lines 90–105.
