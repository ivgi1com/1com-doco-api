# FAX

**Purpose:** "Manage Faxes" (Doc line 208).
**Method:** POST, multipart (`basis: example_curl_multipart`).
**Source:** Site lines 173–188; Doc lines 208–222.

## Parameters (Doc lines 209–220)

| Param | Required | Accepted values | Description |
|---|---|---|---|
| `action` | not stated | `send` (only action Doc lists) | |
| `source_number` | not stated | number | the number to send the fax from |
| `dest_number` | not stated | number | the number to send the fax to |
| `quality` | optional | `204x98`, `204x196`, `204x392` | fax quality |
| `pagesize` | optional | `a4`, `letter`, `legal` | page size |
| `rotate` | optional | empty (automatic), `E`, `W`, `no` | rotation |
| `deleteaftersend` | optional | `on` | delete the fax after sending |
| `schedule` | optional | date/time | when to send |
| `statusemail` | optional | email address | status-update recipient |
| `filename` | not stated | uploaded PDF | the fax content, posted as a file (see body below) |

## Examples

### Reference URL (Doc, line 222 — parameter names only, no file upload shown)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?dest_number=$NUMBER&tenant=TENANTNAME&key=??????&reqtype=FAX&source_number=???&filename=FAX.pdf&action=send
```
Note: `filename=FAX.pdf` appears as a query parameter here, unlike the
Site's fuller example below where `filename` is instead the POSTed file
field's key — UNRESOLVED whether the Doc's version is a simplified
(non-functional) illustration or a genuinely different calling
convention.

### Full example, multipart upload (Site, lines 175–188)
```php
<?php
$postfields = array(
    'filename' => '@protected/FAXtestPage.pdf'
);
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=FAX&action=send&number=99397654321&source_number=123412345&tenant=DEMO");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postfields);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$postResult = curl_exec($ch);
if (curl_errno($ch)) {
  print curl_error($ch);
}
curl_close($ch);
```
Note: the Site example's query string uses `number=` (not `dest_number=`
as the Doc's parameter table names it) — UNRESOLVED whether `number` is
an undocumented alias for `dest_number`, or the Site example itself is
inconsistent with the Doc.

`filename` is posted as an old-style cURL `@`-prefixed file field (see
`_common.md`'s POST-conventions section), not a query parameter.

Response: not documented.

## Source
Site lines 173–188; Doc lines 208–222.
