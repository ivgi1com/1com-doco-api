# MANAGEDB

**Purpose:** database-style CRUD over several PBX object types, selected
by `object=`.
**Key requirement:** *"Any ManageDB action requires an admin key"* (Site
line 225 — the only reqtype-specific key-scope statement in either
source).
**Method:** GET for list/get operations (`basis: example_url`); POST
`jsondata` for add/update/replace/setextensions (`basis:
stated_jsondata` — see `_common.md`).
**Source:** Site lines 224–534. Not covered by the Doc at all — MANAGEDB
does not appear in the Doc's reqtype list.

Discriminator: `object=` (one of the 9 below); most objects then take
`action=` (`list`/`get`/`add`/`update`/`getbinary`/`getextensions`/
`setextensions`/`replace`/`getdestinations`/`getextendedinfos`/
`replaceextendedinfos`, varying per object — see each section). Common to
all: `tenant`.

---

## `object=CUSTOMTYPES` — Custom Destination Types

### Getting the custom destination type list — `action=list` (Site, line 228)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=CUSTOMTYPES&tenant=DEMO&action=list
```
Response: not documented.

---

## `object=CUSTOM` — Custom Destinations

### Getting the custom destination list — `action=list` (Site, line 231)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=CUSTOM&tenant=DEMO&action=list
```

### Getting info for a custom destination — `action=get` (Site, line 233)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=CUSTOM&tenant=DEMO&action=get&objectid=67
```

### Creating a custom destination — `action=add` (Site, lines 234–248)
```php
$config['cu_name']="Boss phone";
$config['cu_ct_id']=1;
$config['cu_param1']="3564732920";
$config['cu_param2']="INCOMINGDID";
$config['cu_param3']="30";
$url = "https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&action=add&object=custom&tenant=DEMO";
// POST jsondata=urlencode(json_encode($config))
```
Fields (from the example): `cu_name`, `cu_ct_id` (a `CUSTOMTYPES` id),
`cu_param1`/`cu_param2`/`cu_param3`. Full field set not documented.

### Updating a custom destination — `action=update` (Site, lines 249–261)
```php
$config['cu_name']="Boss private phone";
$config['cu_id']=286;
$config['cu_param1']="0636287454";
$url = "https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&action=update&object=custom&tenant=DEMO&objectid=286";
// POST jsondata=urlencode(json_encode($config))
```
Note: `objectid` appears in **both** the URL and as `cu_id` in the
posted body — not explained whether both are required or one is
redundant.

Response for add/update: not documented.

---

## `object=PHONE` — Phones

### Getting the phones list — `action=list` (Site, line 264)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=PHONE&action=list&tenant=DEMO
```

### Getting info for a phone — `action=get` (Site, line 266)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=PHONE&action=get&objectid=182&tenant=DEMO
```

### Creating a phone — `action=add`, `object=phones` (Site, lines 267–279)
```php
$config['ph_name']="George Basement";
$config['ph_mac']="AA:BB:CC:DD:EE:FF:00:11";
$config['ph_pm_id']=5;
$url = "https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&action=add&object=phones&tenant=DEMO";
// POST jsondata=urlencode(json_encode($config))
```
Note: `object=phones` (plural) here, vs. `object=PHONE` (singular) for
list/get above — inconsistent casing/pluralization within the same
section, not explained. Fields: `ph_name`, `ph_mac`, `ph_pm_id` (a phone
model id, per the name). Full field set not documented.

### Updating a phone — `action=update`, `object=phone` (Site, lines 280–290)
```php
$config['ph_name']="George Lower Basement";
$url = "https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&action=update&object=phone&objectid=207&tenant=DEMO";
// POST jsondata=urlencode(json_encode($config))
```
(`object=phone`, singular, yet a third form.)

Response for any of the above: not documented.

---

## `object=MEDIAFILE` (ManageDB form) — media file metadata/binary

Distinct from the standalone `MEDIAFILE` reqtype (`mediafile.md`, which
only downloads audio by id).

### Getting the media file list — `action=list` (Site, line 293)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=MEDIAFILE&action=list&tenant=DEMO
```

### Getting info for a media file — `action=get` (Site, line 295)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=MEDIAFILE&action=get&objectid=1063&tenant=DEMO
```

### Getting the binary part of a media file — `action=getbinary` (Site, line 297)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=MEDIAFILE&action=getbinary&objectid=1063&tenant=DEMO
```

### Updating a media file (metadata) — `action=update`, `object=mediafile` (Site, lines 298–308)
```php
$config['me_name']="Beep";
$url = "https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&action=update&object=mediafile&objectid=10&tenant=DEMO";
// POST jsondata=urlencode(json_encode($config))
```

### Updating the binary part of a media file — `action=updatebinary` (Site, lines 309–323)
```php
<?php
$postfields = array(
    'filename' => '@audio.wav'
);
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=MEDIAFILE&action=updatebinary&objectid=247&tenant=DEMO");
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $postfields);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$postResult = curl_exec($ch);
if (curl_errno($ch)) { print curl_error($ch); }
curl_close($ch);
```
Multipart file upload, not `jsondata` — see `_common.md`.

Response for any of the above: not documented.

---

## `object=HUNTLIST` — Hunt Lists

### Getting the hunt lists list — `action=get` (Site, line 326)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=HUNTLIST&action=get&objectid=323&tenant=DEMO
```
Note: despite the section title "Getting the hunt lists **list**", the
action used is `get` (not `list`), with an `objectid` already supplied —
inconsistent with every other object's `list` action, which takes no
`objectid`. Not explained.

### Getting the hunt lists extension list — `action=getextensions` (Site, line 328)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=HUNTLIST&action=getextensions&objectid=323&tenant=DEMO
```

### Setting the hunt lists extension list — `action=setextensions` (Site, lines 329–341)
```php
<?php
$destinations=array('EXT-1701','EXT-1703','EXT-1705','CUSTOM-67');
$url = "https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&action=setextensions&object=huntlist&objectid=26&tenant=DEMO";
// POST jsondata=urlencode(json_encode($destinations))
?>
```
Body is a **plain indexed array of destination-tag strings** (see
"Destination tags" below), not an associative array like every other
`jsondata` example.

Response for any of the above: not documented.

---

## `object=extension`/`EXTENSION` — Extensions

### Getting the extension list — `action=list` (Site, line 344)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&action=list&object=extension&tenant=DEMO
```

### Updating the security for an extension — `action=update` (Site, lines 345–358)
```php
<?php
$value['ex_callallowed']='none';
//$value['ex_callallowed']='all';
$url = "https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&action=update&object=extension&objectid=1695&tenant=DEMO";
// POST jsondata=urlencode(json_encode($value))
?>
```
`ex_callallowed`: `none` or `all` (both values shown, one active one
commented out in the example). Other accepted values not documented.

### Adding a SIP extension — `action=add` (Site, lines 359–372)
```php
$config['ex_number']="1100";
$config['ex_name']="Test extension";
$config['ex_tech']="SIP";
$config['secret']="hackmeifyoucan";
$url = "https://DEMO.1com.com/1com/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&action=add&object=extension&tenant=DEMO";
// POST jsondata=urlencode(json_encode($config))
```
**Security note**: the example's own `secret` value ("hackmeifyoucan")
is the vendor's placeholder text for an extension's SIP secret, not a
real credential — reproduced as-is because it is the source's own
placeholder, same treatment as `TENANTCODE`/`APIKEY`. Never used as a
Demo fixture value (`CLAUDE.md` §Demo mode invariants: synthetic
fixtures only, and this string specifically should not be reused given
what it spells out).

Response for any of the above: not documented.

---

## `object=conference`/`CONFERENCE` — Conferences

### Creating a conference — `action=add` (Site, lines 373–388)
```php
<?php
$config['cr_number']="887";
$config['cr_name']="Test conference";
$config['pin']="5678";
$url = "https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&action=add&object=conference&tenant=DEMO";
// POST jsondata=urlencode(json_encode($config))
?>
```
Fields: `cr_number`, `cr_name`, `pin`. Full field set not documented.
Response: not documented.

---

## `object=routingprofile` — Routing Profiles

Only an update example exists; no `object=` value is confirmed for
list/get (not shown).

### Update a routing profile — `action=update` (Site, lines 389–393)
```php
<?php
$config['rp_name']="Only National calls";
$url = "https://DEMO.1com.com/1com/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&action=update&object=routingprofile&objectid=275";
// POST jsondata=urlencode(json_encode($config))
?>
```
Note: this example has **no `tenant` parameter**, unlike every sibling
ManageDB example — UNRESOLVED whether that's intentional (e.g. routing
profiles are tenant-independent) or an omission in the source.

Response: not documented.

---

## `object=DID` — DIDs

### Listing the DIDs for a tenant — `action=LIST` (Site, line 396)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=DID&action=LIST&tenant=DEMO
```

### Getting more info for a DID — `action=GET` (Site, line 398)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=DID&action=GET&objectid=27699&tenant=DEMO
```

### Updating a DID — `action=update`, `object=did` (Site, lines 399–412)
```php
<?php
$config['di_comment']="Test DID";
$config['di_recording']="yes";
$url = "https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&action=update&object=did&objectid=27699";
// POST jsondata=urlencode(json_encode($config))
?>
```
Note: **no `tenant`** in this update example either (same pattern as
routing profile above). Fields: `di_comment`, `di_recording` (`yes`
shown; other accepted values not documented).

Response for any of the above: not documented.

Note: `object=DID` (uppercase, `action=LIST`/`GET`) here is distinct from
the standalone `INFO&info=dids` operation in `info.md` — same underlying
data, different access path and capabilities (this one supports get by
id and update; INFO's is list-only).

---

## `object=DESTINATION` — Destinations

### Getting the destinations for a DID — `action=LIST`, `typesrc=DID` (Site, line 415)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=DESTINATION&action=LIST&typesrc=DID&typeidsrc=27699&tenant=DEMO
```

### Getting the destinations for a Condition (true) — `typesrc=CONDITION` (Site, line 417)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=DESTINATION&action=LIST&typesrc=CONDITION&typeidsrc=20&tenant=DEMO
```

### Getting the destinations for a Condition (false) — `typesrc=NOTCONDITION` (Site, line 419)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=DESTINATION&action=LIST&typesrc=NOTCONDITION&typeidsrc=20&tenant=DEMO
```

### Replace the destinations for a DID — `action=replace` (Site, lines 420–433)
```php
<?php
$config[]='PLAYBACK-60';
$config[]='EXT-29379';
$url = "https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=DESTINATION&action=replace&typesrc=DID&typeidsrc=27699&tenant=DEMO";
// POST jsondata=urlencode(json_encode($config))
?>
```
Body is a plain indexed array of destination-tag strings (`TAG-id`
form — see "Destination tags" below), like `HUNTLIST`'s `setextensions`.

### Replace for a Condition (true/false) (Site, lines 487–490)
```
https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=DESTINATION&action=replace&typesrc=CONDITION&typeidsrc=20&tenant=DEMO
https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=DESTINATION&action=replace&typesrc=NOTCONDITION&typeidsrc=20&tenant=DEMO
```
(Shown as bare URLs in the source; the `jsondata` body shape is presumed
the same array-of-tags form as the DID example, not separately shown.)

### Replace for an IVR "press 1" (Site, line 492)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=DESTINATION&action=replace&typesrc=IVR_1&typeidsrc=3634&tenant=DEMO
```
`typesrc=IVR_1` — the trailing `_1` presumably selects the "press 1"
branch of the IVR; the general pattern (`IVR_<digit>`?) for other key
presses is not documented.

### Destination tags (Site, lines 434–486)

Full table, `TAG` — meaning, used as `TAG-<id>` in a destination array:

| Tag | Meaning |
|---|---|
| `EXT` | Dial an extension |
| `SMS` | Send a SMS to an extension |
| `PLAYBACK` | Play a media file |
| `RERECORD` | Rerecord a media file |
| `CLEARRECORDING` | Clear the media from a media file |
| `RERECORDSILENT` | Rerecord a media file without playing an intro |
| `CONDITION` | Follow to a condition |
| `VOICMEAIL` | Call a voicemail — **spelled this way in the source** (sic; should presumably read `VOICEMAIL`) |
| `IVR` | Call an IVR |
| `DISA` | Call a DISA |
| `PAGING` | Call a Paging group |
| `HUNTLIST` | Call a Huntlist |
| `FLOW` | Call a Flow |
| `PARK` | Park the call |
| `SPECIAL` | Execute a special destination (check the `sp_specials` table for the id) |
| `MEETME` | Join a conference |
| `QUEUE` | Dial a Queue |
| `RESETQUEUESTATS` | Reset the stats for a Queue |
| `STARTCAMPAIGN` | Start a campaign |
| `REDIALNOTANSWEREDCAMPAIGN` | Redial the calls not answered for a campaign |
| `STOPCAMPAIGN` | Stop a campaign |
| `PAUSECAMPAIGN` | Pause a campaign |
| `PAUSECAMPAIGN` (again) | **Listed a second time**, described as "Unpause a campaign" — almost certainly meant to be `UNPAUSECAMPAIGN`, but that is not what the source says. Reproduced as given; UNRESOLVED. |
| `REMOVEFROMCAMPAIGN` | Remove called number from campaign |
| `REMOVECALLERFROMCAMPAIGN` | Remove caller number from campaign |
| `ADDLATESTDIALEDOUTTOCAMPAIGN` | Add latest dialed out number to campaign |
| `ADDLATESTDIALEDINTOCAMPAIGN` | Add latest dialed in number to campaign |
| `ADDTODNCLIST` | Add called number to Do Not Call list |
| `LOGINQUEUE` | Login caller to Queue |
| `TOGGLELOGINQUEUE` | Toggle Login/Logout caller to Queue |
| `LOGINADQUEUE` | Login caller to Queue |
| `TOGGLELOGINADQUEUE` | Toggle Login/Logout caller to Queue |
| `TOGGLEPAUSEQUEUE` | Toggle Pause/Unpause caller to Queue |
| `LOGOUTALLAGENTSFROMQUEUE` | Logout all agents from Queue |
| `LOGOUTQUEUE` | Logout caller from Queue |
| `PAUSEQUEUE` | Pause caller from Queue |
| `UNPAUSEQUEUE` | Unpause caller from Queue |
| `PAUSEALLAGENTSINQUEUE` | Pause all agents in Queue |
| `UNPAUSEALLAGENTSINQUEUE` | Unpause all agents in Queue |
| `CUSTOM` | Use a custom destination |
| `PHONEBOOK` | Route by Phone Book using regex |
| `EXACTPHONEBOOK` | Route by Phone Book not using regex |
| `SETUNCONDITIONALDID` | Set unconditional forwarding for a DID |
| `ENABLEUNCONDITIONALDID` | Enable the unconditional forwarding for a DID |
| `DISABLEUNCONDITIONALDID` | Disable the unconditional forwarding for a DID |
| `TOGGLEUNCONDITIONALDID` | Toggle the unconditional forwarding for a DID |
| `CLIDNAMEBYPHONEBOOK` | Set Caller ID Name by Phone Book |
| `CALLERIDMOD` | Alter Caller ID based on rule |
| `MUSICONHOLD` | Set Music On Hold to |
| `RINGMUSICONHOLD` | Ring extension using Music On Hold |
| `RESPONSEPATH` | Start Response Path |
| `SAMENUMBERVM` | Voicemail same number |

Response for any DESTINATION operation: not documented.

---

## `object=IVR` — IVRs

### Listing the IVRs for a tenant — `action=LIST` (Site, line 495)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=IVR&action=LIST&tenant=DEMO
```

### Getting more info for an IVR — `action=GET` (Site, line 498)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=IVR&action=GET&tenant=DEMO&objectid=322
```
Note (Site line 497): *"the `iv_me_id` field is not used and the media
files are stored in the destination table"* — a documented quirk of the
response shape.

### Getting the destinations for the IVR, including media files — `action=GETDESTINATIONS` (Site, line 500)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=IVR&action=GETDESTINATIONS&tenant=DEMO&objectid=3634
```
Site line 501: *"Use the Destination call to replace values"* — i.e. to
change an IVR's destinations, use `object=DESTINATION&action=replace`
with `typesrc=IVR_<n>` (see above), not a dedicated IVR-update call.

Response for any of the above: not documented.

---

## `object=CONDITION` — Conditions

### Listing the Conditions for a tenant — `action=LIST` (Site, line 504)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=CONDITION&action=LIST&tenant=DEMO
```

### Listing the destinations for a Condition — `action=GETDESTINATIONS` (Site, line 506)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=CONDITION&action=GETDESTINATIONS&tenant=DEMO&objectid=20&format=json
```

### Getting info and more info for a Condition — `action=GET` (Site, line 508)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=CONDITION&action=GET&tenant=DEMO&objectid=20&format=json
```
Note (Site line 509): for `WEEKTIME` or `CALENDAR`-type conditions, use
`action=GETEXTENDEDINFOS` (below) to get the extended fields this call
doesn't return.

### Getting extended info for a Condition — `action=GETEXTENDEDINFOS` (Site, line 510)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=CONDITION&action=GETEXTENDEDINFOS&tenant=DEMO&objectid=20&format=json
```

### Replacing extended info for a Condition — `action=replaceextendedinfos` (Site, lines 511–534)
```php
<?php
$config[0]['param1']='1';
$config[0]['param2']='8:00';
$config[0]['param3']='13:00';
$config[1]['param1']='1';
$config[1]['param2']='15:00';
$config[1]['param3']='19:00';
$config[2]['param1']='2';
$config[2]['param2']='8:00';
$config[2]['param3']='13:00';
$config[3]['param1']='2';
$config[3]['param2']='15:00';
$config[3]['param3']='19:00';
$url = "https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=CONDITION&action=replaceextendedinfos&objectid=20&tenant=DEMO";
// POST jsondata=urlencode(json_encode($config))
?>
```
Body is an indexed array of objects, each with `param1`/`param2`/
`param3` — from the example, this looks like a weekly time-window table
(`param1`=day-of-week code, `param2`/`param3`=start/end time), but that
reading is inferred from the sample values, not stated by the source.
`param1` values `1`/`2` (presumably day indices) are not otherwise
defined.

Response for any CONDITION operation: not documented.

---

## `object=` values seen with no dedicated operation example

None beyond the 9 sections above — every `object=` value used anywhere in
the Site has at least one example, captured above.
