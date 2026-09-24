# Old ProxyAPI Legacy proxy API reference and examples.

## Overview and Examples

`proxyapi.php` is the legacy MiRTA PBX HTTP API. It is still useful for integrations that already depend on query-string based requests, plain text responses, CDR exports, queue operations, voicemail actions, phonebook operations, fax handling, and the older `MANAGEDB` object/action interface.

The API is controlled with the `reqtype` parameter. Most calls also require `key`; tenant-scoped calls normally require `tenant`. Several read operations accept `format=json`, `format=xml`, or `format=csv`. Write operations that update PBX records commonly send JSON in a POST field named `jsondata`.

## Common Parameters

<table id="bkmrk-parameterdescription"><thead><tr><th>Parameter</th><th>Description</th></tr></thead><tbody><tr><td>`reqtype`</td><td>Main request family, such as INFO, DND, QUEUE, VOICEMAIL, FAX, CDR, or MANAGEDB.</td></tr><tr><td>`key`</td><td>Tenant or admin API key. Use read-only keys when the integration does not need to change data.</td></tr><tr><td>`tenant`</td><td>Tenant code. Optional only for operations that allow an administrator key to act globally.</td></tr><tr><td>`format`</td><td>Optional output format. Common values are plain, json, xml, and csv, depending on the request.</td></tr><tr><td>`callback`</td><td>Optional JSONP callback name for cross-domain script integrations using JSON.</td></tr><tr><td>`language`</td><td>Optional language used by requests that support translated data.</td></tr><tr><td>`cache`</td><td>Set to no to bypass SQL or AMI cache for supported requests.</td></tr></tbody></table>

## Request Types

<table id="bkmrk-reqtypepurposecountp"><thead><tr><th>reqtype</th><th>Purpose</th></tr></thead><tbody><tr><td>`COUNTPEERS`</td><td>Count peers by node and optionally by tenant.</td></tr><tr><td>`COUNTCHANNELS`</td><td>Count active channels globally, by node, or by tenant.</td></tr><tr><td>`CHANSIPPEERS`</td><td>Return registered chan\_sip peers across the cluster.</td></tr><tr><td>`BLFS`</td><td>Return BLF status for peers and flows.</td></tr><tr><td>`DND`</td><td>Get or set do-not-disturb for an extension.</td></tr><tr><td>`FLOWS`</td><td>Read flow state.</td></tr><tr><td>`CHANNEL`</td><td>Read details for one channel.</td></tr><tr><td>`CHANNELS`</td><td>List active channels.</td></tr><tr><td>`GETCURRENTCALLS`</td><td>Show current calls for a phone or tenant.</td></tr><tr><td>`PHONEBOOKS`</td><td>List available phonebooks.</td></tr><tr><td>`PHONEBOOK`</td><td>Query, add, delete, clean, or dump phonebook records.</td></tr><tr><td>`INFO`</td><td>Read status, CDRs, recordings, DIDs, queues, agents, variables, flows, and other reporting data.</td></tr><tr><td>`AGENT`</td><td>Pause, unpause, list, add, or remove queue agents.</td></tr><tr><td>`ATXTRANSFER`</td><td>Perform attended transfer for a channel.</td></tr><tr><td>`CAMPAIGN`</td><td>Start, stop, pause, resume, or maintain campaign numbers.</td></tr><tr><td>`DIAL`</td><td>Originate a call from a source and connect it to a destination.</td></tr><tr><td>`FAX`</td><td>Send, list, or download faxes.</td></tr><tr><td>`HANGUP`</td><td>Hang up a channel or extension.</td></tr><tr><td>`MEDIAFILE`</td><td>Download media-file audio.</td></tr><tr><td>`QUEUE`</td><td>List, add, remove, clean, or log queue members.</td></tr><tr><td>`QUEUERESET`</td><td>Reset queue statistics.</td></tr><tr><td>`REBOOT`</td><td>Reboot one or more peers.</td></tr><tr><td>`RESPONSEPATH`</td><td>Read response-path results.</td></tr><tr><td>`SETFLOW`</td><td>Set a flow state or variable value.</td></tr><tr><td>`SMS`</td><td>Send an SMS.</td></tr><tr><td>`TRANSFER`</td><td>Transfer a channel.</td></tr><tr><td>`UNREGISTER`</td><td>Unregister one or more peers.</td></tr><tr><td>`USERGROUP`</td><td>Manage tenants and users assigned to user groups.</td></tr><tr><td>`VIRTUALEXT`</td><td>Manage members of a virtual extension.</td></tr><tr><td>`VOICEMAIL`</td><td>List mailboxes, list messages, download messages, mark read/unread, or delete messages.</td></tr><tr><td>`SETTING`</td><td>Get or set tenant settings.</td></tr><tr><td>`COUNTCALLS`</td><td>Count running calls.</td></tr><tr><td>`LICENSEDAYS`</td><td>Return days before license expiration.</td></tr><tr><td>`BALANCE`</td><td>Add or subtract tenant balance.</td></tr><tr><td>`CDR`</td><td>Get or update fields on a CDR row.</td></tr><tr><td>`MANAGEDB`</td><td>Read or change supported PBX database objects through object/action parameters.</td></tr><tr><td>`CHECKAUTH`</td><td>Validate a username and password and return privilege information.</td></tr><tr><td>`AUTHTOKEN`</td><td>Generate or reset one-time or expiring authentication tokens.</td></tr><tr><td>`GETWEBRTCAUTH`</td><td>Authenticate an extension user and return WebRTC details.</td></tr></tbody></table>

## Using POST jsondata

For `MANAGEDB`, phonebook, destination, and similar write requests, send the object fields as JSON in the POST field `jsondata`. The examples below show the URL and the JSON payload separately instead of wrapping every case in a PHP cURL script.

```
curl -X POST \
  --data-urlencode 'jsondata={"field":"value"}' \
  "https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&tenant=TENANTCODE&reqtype=MANAGEDB&object=OBJECT&action=add"
```

## Examples

## INFO - SIMPLECDRS / Get the list of calls

Get the list of calls.

Use the date range and phone filters to narrow the returned call history. The phone filter searches the relevant caller, dialed, and answered number fields.

This uses the simplified call-history source and supports filters such as caller ID number and date range.

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=INFO&info=SIMPLECDRS&tenant=TENANTCODE&calleridnum=103,104&start=2020-01-01&end=2020-12-31
```

## INFO - CDRS / Get the list of calls

Get the list of calls.

Use the date range and phone filters to narrow the returned call history. The phone filter searches the relevant caller, dialed, and answered number fields.

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=INFO&info=CDRS&tenant=TENANTCODE&phone=103,104&start=2019-12-01&end=2022-12-31
```

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=INFO&info=CDRS&tenant=TENANTCODE&phone=103,104&start=2019-12-01&end=2022-12-31&format=xml&template=Test_CSV
```

Sample output or template:

```
{row_loop}{$uniqueid},{$ID},{$te_id},{$realsrc},{$lastdst},{$start},{$duration},{$answer},{$direction},{$direction},{$disposition}
{/row_loop}
```

## INFO - DIDS / Get the list of DIDs for one tenant

Get the list of DIDs for one tenant.

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=INFO&info=DIDS&tenant=TENANTCODE
```

## INFO - DIDS / Get the list of DIDs for all tenants

Get the list of DIDs for all tenants.

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=INFO&info=DIDS
```

## INFO - Flow / Get the state of a flow

Get the state of a flow.

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=INFO&info=FLOW&id=61&tenant=TENANTCODE
```

## INFO - Extension / Get the state of a extension

Get the state of a extension.

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=INFO&info=EXTSTATE&ext=500&tenant=TENANTCODE
```

## INFO - Extensions / Get the list of extensions

Get the list of extensions.

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=INFO&info=EXTENSIONS&tenant=TENANTCODE
```

## INFO - Extensions / Get an extension by id

Get an extension by id.

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=INFO&info=EXTENSIONS&tenant=TENANTCODE&id=36979
```

## INFO - Extensions / Get an extension by number

Get an extension by number.

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=INFO&info=EXTENSIONS&tenant=TENANTCODE&number=100
```

## INFO - IVR Logs / Get the IVR logs

Get the IVR logs.

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&tenant=TENANTCODE&reqtype=INFO&info=IVRLOGS&format=json&start=2023-01-01&end=2024-12-31
```

## INFO - Variable / Get the value of a variable

Get the value of a variable.

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=INFO&info=variable&id=61&tenant=TENANTCODE
```

## DND / Get the DND for an extension

Get the DND for an extension.

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&tenant=TENANTCODE&reqtype=DND&action=get&number=100
```

## DND /Set the DND for an extension

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&tenant=TENANTCODE&reqtype=DND&action=set&number=100&value=on
```

## DIAL / Call an extension and then dial a number

Call an extension and then dial a number.

The originate response includes an ID that can later be used to query call status or retrieve the recording. Extra variables can be passed with the var parameter.

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=DIAL&source=402&dest=9922323232&tenant=TENANTCODE&account=402-TENANTCODE
```

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=INFO&info=recording&id=15a4cfe6429054
```

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=DIAL&source=402&dest=9922323232&tenant=TENANTCODE&account=402-TENANTCODE&var=callid=453131
```

## HANGUP / Hangup a call by extension

Hangup a call by extension.

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=HANGUP&extension=103-TENANTCODE&tenant=TENANTCODE
```

## AGENT / Pause agent from queue

Pause agent from queue.

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=AGENT&action=PAUSE&queue=281&extension=104-TENANTCODE&tenant=TENANTCODE&pausereason=Breakfast
```

## AGENT / Get info for agent in all the queues

Get info for agent in all the queues.

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=AGENT&action=LISTQUEUES&extension=104-TENANTCODE&tenant=TENANTCODE&format=json
```

## MEDIAFILE / Retrieve a media file by its ID

Retrieve a media file by its ID.

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MEDIAFILE&tenant=TENANTCODE&id=19&action=GETAUDIO&objectid=3619
```

## QUEUE / Get the list of agents

Get the list of agents.

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=QUEUE&tenant=TENANTCODE&action=list&number=9200
```

## QUEUE / Add an agent to a queue

Add an agent to a queue.

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=QUEUE&tenant=TENANTCODE&action=add&number=9200&extension=103
```

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=QUEUE&tenant=TENANTCODE&action=add&number=781&extension=107&paused=1&penalty=4
```

## SETTING

### Get a tenant setting

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?tenant=TENANTCODE&key=APIKEY&reqtype=SETTING&action=GET&code=VMAUTORECOVER
```

### Set a tenant setting

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?tenant=TENANTCODE&key=APIKEY&reqtype=SETTING&action=SET&code=VMAUTORECOVER&value=no
```

## VOICEMAIL

### Get all voicemails for a tenant

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=VOICEMAIL&tenant=TENANTCODE&action=list
```

### Get info about voicemails in a mailbox

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=VOICEMAIL&tenant=TENANTCODE&mailbox=102&action=messages
```

### Get the binary audio for a message

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=VOICEMAIL&tenant=TENANTCODE&mailbox=102&action=message&msgid=1475685709-00000004
```

### Mark a message as read

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=VOICEMAIL&tenant=TENANTCODE&mailbox=1000&action=markread&msgid=1543267778-00000007
```

### Mark a message as not read

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=VOICEMAIL&tenant=TENANTCODE&action=markunread&mailbox=1000&msgid=1543267778-00000007
```

## COUNTCALLS / Count the calls on a system

Count the calls on a system.

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=COUNTCALLS
```

## RECORDINGS / Get or play a recording

Get or play a recording.

Use info=recording to download the file, or info=playrecording when the browser should play it inline.

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=INFO&info=recording&id=srv02-1531779475.48&tenant=TENANTCODE
```

## TRANSCRIPT / Get the transcript for a recording

Get the transcript for a recording.

Use info=transcript with the recording unique ID to retrieve the generated transcript when transcription is enabled.

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=INFO&info=transcript&id=srv02-1695552000.1043&tenant=TENANTCODE
```

## PHONEBOOKS

### Search for an entry

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=PHONEBOOK&subreqtype=query&tenant=TENANTCODE&phonebook=Default&field=name&value=Ben
```

### Add an entry

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=PHONEBOOK&subreqtype=add&phonebook=Default&tenant=TENANTCODE
```

Payload sent as `jsondata`:

```
{
  "NAME": "Ross",
  "PHONE1": "3564732920"
}
```

## FAX

### Send a fax

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=FAX&action=send&number=99397654321&source_number=123412345&tenant=TENANTCODE
```

Multipart upload example:

```
curl -F "filename=@/path/to/fax.pdf" "https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=FAX&action=send&tenant=TENANTCODE&source_number=15551230000&dest_number=15551239999"
```

### List faxes

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?tenant=TENANTCODE&key=APIKEY&reqtype=FAX&action=list
```

### Get a fax binary

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?tenant=TENANTCODE&key=APIKEY&reqtype=FAX&action=download&id=63095
```

## INFO

### Get the cdr for a tenant in CSV format

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=INFO&info=CDRS&format=csv&tenant=TENANTCODE&start=2017-01-01&end=2017-02-01
```

### Get the cdr for all tenants in CSV format

For one tenant, the tenant CSV template is used. With tenant=% across tenants, the admin CSV format is used.

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=INFO&info=CDRS&format=csv&tenant=%&start=2017-01-01&end=2017-02-01
```

### Get the queue log for a tenant in CSV format

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=INFO&info=QUEUELOGS&format=csv&tenant=TENANTCODE&start=2017-10-01&end=2017-12-01
```

## Getting response paths results

Response Path results can be filtered by queue, answering extension, or unique ID and can be returned as plain text or XML.

### Getting the latest one for a given Response Path

Response Path results can be filtered by queue, answering extension, or unique ID and can be returned as plain text or XML.

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=RESPONSEPATH&tenant=TENANTCODE&id=19&action=GETLAST
```

Sample output or template:

```
UniqueID|Type|Type ID|Value|Type Name|Value Name
srv02-1509806457.625|START|0|2017-11-04 15:41:01||
srv02-1509806457.625|CALLERID|0|Susan <1132555678>||
srv02-1509806457.625|VARIABLE|85|36985||
srv02-1509806457.625|VARIABLE|144|56896||
srv02-1509806457.625|QUEUE|281|||
srv02-1509806457.625|ANSWER|0|105-TENANTCODE||
srv02-1509806457.625|HANGUP|0|||
```

### Getting the latest one for a given Response Path for agent 104-TENANTCODE

Response Path results can be filtered by queue, answering extension, or unique ID and can be returned as plain text or XML.

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=RESPONSEPATH&tenant=TENANTCODE&id=19&action=GETLAST&filter=ANSWER&filterdata=104-TENANTCODE
```

### Getting the latest one for a given Response Path for agent 104-TENANTCODE in xml format

Response Path results can be filtered by queue, answering extension, or unique ID and can be returned as plain text or XML.

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=RESPONSEPATH&tenant=TENANTCODE&id=19&action=GETLAST&filter=ANSWER&filterdata=105-TENANTCODE&format=xml
```

Sample output or template:

```
<?xml version="1.0">
<Result>
<Agent>105-TENANTCODE</Agent>
<Status>NOT ACTIVE</Status>
<Queue>supportQ</Queue>
<ClientID>1234</MemberNumber>
<OrderNumber>11223344</MemberNumber>
<Caller>Manuel <7171345678></Caller>
<VoiceFile>3619</VoiceFile>
</Result>
```

## ManageDB / Custom Destination Types

Custom Destination Types.

### Getting the custom destination type list

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=CUSTOMTYPES&tenant=TENANTCODE&action=list
```

## ManageDB / Custom Destinations

Custom Destinations.

### Getting the custom destination list

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=CUSTOM&tenant=TENANTCODE&action=list
```

### Getting info for a custom destination

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=CUSTOM&tenant=TENANTCODE&action=get&objectid=67
```

### Creating a custom destination

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&action=add&object=custom&tenant=TENANTCODE
```

Payload sent as `jsondata`:

```
{
  "cu_name": "Boss phone",
  "cu_ct_id": 1,
  "cu_param1": "3564732920",
  "cu_param2": "INCOMINGDID",
  "cu_param3": "30"
}
```

### Updating a custom destination

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&action=update&object=custom&tenant=TENANTCODE&objectid=286
```

Payload sent as `jsondata`:

```
{
  "cu_name": "Boss private phone",
  "cu_id": 286,
  "cu_param1": "0636287454"
}
```

## CDR / Get the userfield

Get the userfield.

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&tenant=TENANTCODE&reqtype=CDR&action=GET&field=userfield&uniqueid=srv02-1701011773.4670
```

## CDR / Update the userfield

Update the userfield.

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&tenant=TENANTCODE&reqtype=CDR&action=UPDATE&field=userfield&uniqueid=srv02-1701011773.4670&value=
```

## ManageDB / Tenants

Tenants.

### Getting the tenant list

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=TENANT&action=list
```

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=TENANT&action=list&filter=te_disabled='on'
```

### Getting info for a tenant

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=TENANT&action=get&objectid=1
```

### Creating a tenant

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&action=add&object=tenant
```

Payload sent as `jsondata`:

```
{
  "te_code": "RELAX",
  "te_name": "Relax & entertainment",
  "pk_start": 800,
  "pk_end": 810
}
```

### Updating a tenant

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&action=update&object=tenant&objectid=460
```

Payload sent as `jsondata`:

```
{
  "te_name": "Relax and entertainment",
  "pk_end": 820
}
```

## ManageDB / Phones

Phones.

### Getting the phones list

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=PHONE&action=list&tenant=TENANTCODE
```

### Getting info for a phone

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=PHONE&action=get&objectid=182&tenant=TENANTCODE
```

### Creating a phone

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&action=add&object=phones&tenant=TENANTCODE
```

Payload sent as `jsondata`:

```
{
  "ph_name": "George Basement",
  "ph_mac": "AA:BB:CC:DD:EE:FF:00:11",
  "ph_pm_id": 5
}
```

### Updating a phone

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&action=update&object=phone&objectid=207&tenant=TENANTCODE
```

Payload sent as `jsondata`:

```
{
  "ph_name": "George Lower Basement"
}
```

## Manage DB / media files

media files.

ManageDB requests require an administrator API key. Most write operations send the record fields as a jsondata POST value.

### Getting the media file list

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=MEDIAFILE&action=list&tenant=TENANTCODE
```

### Getting info for a media file

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=MEDIAFILE&action=get&objectid=1063&tenant=TENANTCODE
```

### Getting the binary part of a media file

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=MEDIAFILE&action=getbinary&objectid=1063&tenant=TENANTCODE
```

### Updating a media file

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&action=update&object=mediafile&objectid=10&tenant=TENANTCODE
```

Payload sent as `jsondata`:

```
{
  "me_name": "Beep"
}
```

### Updating the binary part of a media file

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=MEDIAFILE&action=updatebinary&objectid=247&tenant=TENANTCODE
```

## ManageDB / Hunt Lists

Hunt Lists.

### Getting the hunt lists list

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=HUNTLIST&action=get&objectid=323&tenant=TENANTCODE
```

### Getting the hunt lists extension list

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=HUNTLIST&action=getextensions&objectid=323&tenant=TENANTCODE
```

### Setting the hunt lists extension list

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&action=setextensions&object=huntlist&objectid=26&tenant=TENANTCODE
```

## ManageDB / Extensions

Extensions.

### Getting the extension list

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&action=list&object=extension&tenant=TENANTCODE
```

### Getting the details for an extension

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&action=get&object=extension&objectid=1701&tenant=TENANTCODE
```

### Deleting an extension

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&action=delete&object=extension&objectid=6016&tenant=TENANTCODE
```

### Updating the security for an extension

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&action=update&object=extension&objectid=1695&tenant=TENANTCODE
```

Payload sent as `jsondata`:

```
{
  "ex_callallowed": "all"
}
```

### Adding a SIP extension

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&action=add&object=extension&tenant=TENANTCODE
```

Payload sent as `jsondata`:

```
{
  "ex_number": "1100",
  "ex_name": "Test extension",
  "ex_tech": "SIP",
  "secret": "hackmeifyoucan",
  "ex_pickupgroup": "1,5,6",
  "ex_callgroup": "1,7,9"
}
```

### Adding a PJSIP extension

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&action=add&object=extension&tenant=TENANTCODE
```

Payload sent as `jsondata`:

```
{
  "ex_number": "1100",
  "ex_name": "Test PJSIP extension",
  "password": "hackmeifyoucan",
  "ex_tech": "PJSIP"
}
```

## ManageDB / Users

Users.

### Getting the user list

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=user&action=list
```

### Getting the details for an user

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=user&action=get&objectid=3635
```

### Creating an user

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&action=add&object=user
```

Payload sent as `jsondata`:

```
{
  "us_username": "Leandro71",
  "us_password": "sha256(change-me)",
  "us_up_id": 1
}
```

## ManageDB / Conferences

Conferences.

### Creating a conference

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&action=add&object=conference&tenant=TENANTCODE
```

Payload sent as `jsondata`:

```
{
  "cr_number": "887",
  "cr_name": "Test conference",
  "pin": "5678"
}
```

## ManageDB / Providers

Providers.

### Getting the provider list

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=provider&action=list
```

### Getting the details for a provider (SIP)

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=provider&action=get&objectid=1027
```

### Update a provider

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&action=update&object=provider&objectid=1027
```

Payload sent as `jsondata`:

```
{
  "pr_peername": "test_extradevel",
  "pr_name": "Test extradevel"
}
```

### Insert a provider

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&action=add&object=provider
```

Payload sent as `jsondata`:

```
{
  "pr_peername": "new_provider",
  "pr_name": "New Provider",
  "pr_tech": "SIP",
  "pr_userealtime": "on",
  "allow": "'alaw:20",
  "host": "172.16.1.100"
}
```

## ManageDB / Routing Profiles

Routing Profiles.

### Getting the routing profiles list

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=routingprofile&action=list
```

### Getting the details for a routing profile

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=routingprofile&action=get&objectid=99
```

### Getting the list of routes for a routing profile

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=routingprofile&action=listroutes&objectid=99
```

### Adding a routing profile

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&action=add&object=routingprofile
```

Payload sent as `jsondata`:

```
{
  "rp_name": "Only National",
  "rp_type": "VOICE"
}
```

### Update a routing profile

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&action=update&object=routingprofile&objectid=275
```

## ManageDB / Routes

Routes.

### Getting the route list

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=route&action=list
```

### Getting the route list for a routing profile

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=route&routingprofileid=1&action=list
```

### Getting the details for a route

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=route&action=get&objectid=69
```

### Adding a route to a routing profile

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&action=add&object=route
```

Payload sent as `jsondata`:

```
{
  "dl_rp_id": "1",
  "dl_name": "Free Numbers",
  "dl_regex": "^800.*",
  "dl_pr_id": "89"
}
```

### Update a route

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&action=update&object=route&objectid=69
```

Payload sent as `jsondata`:

```
{
  "dl_emergencyroute": "",
  "dl_usepin": "on"
}
```

## ManageDB / DIDs

DIDs.

### Listing the DIDs for a tenant

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=DID&action=LIST&tenant=TENANTCODE
```

### Getting more info for a DID

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=DID&action=GET&objectid=27699&tenant=TENANTCODE
```

### Updating a DID

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&action=update&object=did&objectid=27699
```

Payload sent as `jsondata`:

```
{
  "di_comment": "Test DID",
  "di_recording": "yes"
}
```

## ManageDB / Destinations

Destinations.

### Getting the destinations for a DID

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=DESTINATION&action=LIST&typesrc=DID&typeidsrc=27699&tenant=TENANTCODE
```

### Getting the destinations for a Condition (true)

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=DESTINATION&action=LIST&typesrc=CONDITION&typeidsrc=20&tenant=TENANTCODE
```

### Getting the destinations for a Condition (false)

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=DESTINATION&action=LIST&typesrc=NOTCONDITION&typeidsrc=20&tenant=TENANTCODE
```

### Replace the destinations for a DID

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=DESTINATION&action=replace&typesrc=CONDITION&typeidsrc=20&tenant=TENANTCODE
```

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=DESTINATION&action=replace&typesrc=NOTCONDITION&typeidsrc=20&tenant=TENANTCODE
```

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=DESTINATION&action=replace&typesrc=IVR_1&typeidsrc=3634&tenant=TENANTCODE
```

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=DESTINATION&action=replace&typesrc=DID&typeidsrc=27699&tenant=TENANTCODE
```

Payload sent as `jsondata`:

```
[
  "PLAYBACK-60",
  "EXT-29379"
]
```

### Destination Tags

Destination replacement uses values in `TYPE-ID` form. The following tags are supported by the legacy destination examples and the current destination lookup code.

<table id="bkmrk-tagdestinationextdia"><thead><tr><th>Tag</th><th>Destination</th></tr></thead><tbody><tr><td>`EXT`</td><td>Dial an extension</td></tr><tr><td>`SMS`</td><td>Send a SMS to an extension</td></tr><tr><td>`PLAYBACK`</td><td>Play a media file</td></tr><tr><td>`RERECORD`</td><td>Rerecord a media file</td></tr><tr><td>`CLEARRECORDING`</td><td>Clear the media from a media file</td></tr><tr><td>`RERECORDSILENT`</td><td>Rerecord a media file without playing an intro</td></tr><tr><td>`CONDITION`</td><td>Follow to a condition</td></tr><tr><td>`VOICEMAIL`</td><td>Call a voicemail</td></tr><tr><td>`IVR`</td><td>Call an IVR</td></tr><tr><td>`DISA`</td><td>Call a DISA</td></tr><tr><td>`PAGING`</td><td>Call a Paging group</td></tr><tr><td>`HUNTLIST`</td><td>Call a Huntlist</td></tr><tr><td>`FLOW`</td><td>Call a Flow</td></tr><tr><td>`PARK`</td><td>Park the call</td></tr><tr><td>`SPECIAL`</td><td>Execute a special destination (check the sp\_specials table for the id)</td></tr><tr><td>`MEETME`</td><td>Join a conference</td></tr><tr><td>`QUEUE`</td><td>Dial a Queue</td></tr><tr><td>`RESETQUEUESTATS`</td><td>Reset the stats for a Queue</td></tr><tr><td>`STARTCAMPAIGN`</td><td>Start a campaign</td></tr><tr><td>`REDIALNOTANSWEREDCAMPAIGN`</td><td>Redial the calls not answered for a campaign</td></tr><tr><td>`STOPCAMPAIGN`</td><td>Stop a campaign</td></tr><tr><td>`PAUSECAMPAIGN`</td><td>Pause a campaign</td></tr><tr><td>`UNPAUSECAMPAIGN`</td><td>Unpause a campaign</td></tr><tr><td>`REMOVEFROMCAMPAIGN`</td><td>Remove called number from campaign</td></tr><tr><td>`REMOVECALLERFROMCAMPAIGN`</td><td>Remove caller number from campaign</td></tr><tr><td>`ADDLATESTDIALEDOUTTOCAMPAIGN`</td><td>Add latest dialed out number to campaign</td></tr><tr><td>`ADDLATESTDIALEDINTOCAMPAIGN`</td><td>Add latest dialed in number to campaign</td></tr><tr><td>`ADDTODNCLIST`</td><td>Add called number to Do Not Call list</td></tr><tr><td>`LOGINQUEUE`</td><td>Login caller to Queue</td></tr><tr><td>`TOGGLELOGINQUEUE`</td><td>Toggle Login/Logout caller to Queue</td></tr><tr><td>`LOGINADQUEUE`</td><td>Login caller to Queue</td></tr><tr><td>`TOGGLELOGINADQUEUE`</td><td>Toggle Login/Logout caller to Queue</td></tr><tr><td>`TOGGLEPAUSEQUEUE`</td><td>Toggle Pause/Unpause caller to Queue</td></tr><tr><td>`LOGOUTALLAGENTSFROMQUEUE`</td><td>Logout all agents from Queue</td></tr><tr><td>`LOGOUTQUEUE`</td><td>Logout caller from Queue</td></tr><tr><td>`PAUSEQUEUE`</td><td>Pause caller from Queue</td></tr><tr><td>`UNPAUSEQUEUE`</td><td>Unpause caller from Queue</td></tr><tr><td>`PAUSEALLAGENTSINQUEUE`</td><td>Pause all agents in Queue</td></tr><tr><td>`UNPAUSEALLAGENTSINQUEUE`</td><td>Unpause all agents in Queue</td></tr><tr><td>`CUSTOM`</td><td>Use a custom destination</td></tr><tr><td>`PHONEBOOK`</td><td>Route by Phone Book using regex</td></tr><tr><td>`EXACTPHONEBOOK`</td><td>Route by Phone Book not using regex</td></tr><tr><td>`SETUNCONDITIONALDID`</td><td>Set unconditional forwarding for a DID</td></tr><tr><td>`ENABLEUNCONDITIONALDID`</td><td>Enable the unconditional forwarding for a DID</td></tr><tr><td>`DISABLEUNCONDITIONALDID`</td><td>Disable the unconditional forwarding for a DID</td></tr><tr><td>`TOGGLEUNCONDITIONALDID`</td><td>Toggle the unconditional forwarding for a DID</td></tr><tr><td>`CLIDNAMEBYPHONEBOOK`</td><td>Set Caller ID Name by Phone Book</td></tr><tr><td>`CALLERIDMOD`</td><td>Alter Caller ID based on rule</td></tr><tr><td>`MUSICONHOLD`</td><td>Set Music On Hold to</td></tr><tr><td>`RINGMUSICONHOLD`</td><td>Ring extension using Music On Hold</td></tr><tr><td>`RESPONSEPATH`</td><td>Start Response Path</td></tr><tr><td>`SAMENUMBERVM`</td><td>Voicemail same number</td></tr></tbody></table>

## ManageDB / IVRs

IVRs.

### Listing the IVRs for a tenant

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=IVR&action=LIST&tenant=TENANTCODE
```

### Getting more info for a IVR

The IVR media-file references are stored as destinations; use the destination examples to change them.

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=IVR&action=GET&tenant=TENANTCODE&objectid=322
```

### Getting the destinations for the IVR, including the media files

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=IVR&action=GETDESTINATIONS&tenant=TENANTCODE&objectid=3634
```

## ManageDB / Conditions

Conditions.

### Listing the Conditions for a tenant

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=CONDITION&action=LIST&tenant=TENANTCODE
```

### Listing the destinations for a Condition

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=CONDITION&action=GETDESTINATIONS&tenant=TENANTCODE&objectid=20&format=json
```

### Getting info and more info for a Condition

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=CONDITION&action=GET&tenant=TENANTCODE&objectid=20&format=json
```

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=CONDITION&action=GETEXTENDEDINFOS&tenant=TENANTCODE&objectid=20&format=json
```

### Replacing extended info for a Condition

Weektime and calendar conditions use extended-info rows; replace the extended-info list when changing their schedules.

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=CONDITION&action=replaceextendedinfos&objectid=20&tenant=TENANTCODE
```

Payload sent as `jsondata`:

```
[
  {
    "param1": "1",
    "param2": "8:00",
    "param3": "13:00"
  },
  {
    "param1": "1",
    "param2": "15:00",
    "param3": "19:00"
  },
  {
    "param1": "2",
    "param2": "8:00",
    "param3": "13:00"
  },
  {
    "param1": "2",
    "param2": "15:00",
    "param3": "19:00"
  }
]
```

## ManageDB / Voicemails

Voicemails.

### Listing the Voicemails for a tenant

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=VOICEMAIL&action=LIST&tenant=TENANTCODE
```

### Listing the Voicemails message for a voicemail

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=VOICEMAIL&action=LISTMESSAGES&tenant=TENANTCODE&mailboxuser=001&mailbox=INBOX
```

### Get a message recording for a voicemail id

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=VOICEMAIL&action=GETMESSAGERECORDING&id=4963&tenant=TENANTCODE
```

### Add a voicemail box

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&action=add&tenant=TENANTCODE&object=voicemail
```

Payload sent as `jsondata`:

```
{
  "mailbox": "9000",
  "password": "1234567",
  "fullname": "This is a test",
  "email": "test@mirtapbx.com"
}
```

### Delete a voicemail box

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=VOICEMAIL&action=DELETE&objectid=32259&tenant=TENANTCODE
```

## ManageDB / Phone phonebooks

Phone phonebooks.

### Listing the Phone phonebooks for a tenant

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&tenant=TENANTCODE&reqtype=MANAGEDB&object=PHONEPHONEBOOK&action=LIST
```

### Get the detail of a phone phone book

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&tenant=TENANTCODE&reqtype=MANAGEDB&object=PHONEPHONEBOOK&action=GET&objectid=1332
```

## ManageDB / Queues

Queues.

### Listing the Queues for a tenant

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=QUEUE&action=LIST&tenant=TENANTCODE
```

### Add a Queue

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&action=add&tenant=TENANTCODE&object=queue
```

Payload sent as `jsondata`:

```
{
  "qu_name": "Support Line",
  "strategy": "RINGALL",
  "timeout": "30"
}
```

### Delete a queue

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=MANAGEDB&object=QUEUE&action=DELETE&objectid=7027&tenant=TENANTCODE
```

## Token Authentication

Use `reqtype=AUTHTOKEN` to generate a one-time or expiring login token for a user. The returned token can be used as the password in the normal web login URL.

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=AUTHTOKEN&action=generate&validity=ONCE&user=adrian
```

```
https://pbx.example.com/mirtapbx/login.php?username=adrian&password=AUTH_TOKEN
```

Request example:

```
https://pbx.example.com/mirtapbx/proxyapi.php?key=APIKEY&reqtype=AUTHTOKEN&action=generate&validity=ONCE&user=adrian
```

## Security Notes

- Use tenant read-only keys for reporting integrations whenever possible.
- Use administrator keys only for global reporting or `MANAGEDB` actions that require them.
- Do not store production keys in browser-side scripts.
- Prefer the OpenAPI endpoint for new integrations unless an existing integration requires the legacy ProxyAPI format.