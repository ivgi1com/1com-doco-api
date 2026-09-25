# MEDIAFILE

**Purpose:** "Manage media files" (Doc line 229, see note in `hangup.md`
about the missing line break before this heading in the raw source).
**Method:** GET (`basis: example_url`).
**Source:** Site line 134–135; Doc lines 229–234.

Note: `MANAGEDB&object=MEDIAFILE` is a **separate** operation set (list /
get / getbinary / update / updatebinary a media file's metadata/binary in
the ManageDB CRUD sense) — see `managedb.md`. This file (`MEDIAFILE`
reqtype) is the narrower single-action "retrieve a file by its id" form.

## Parameters (Doc lines 230–234)

| Param | Required | Accepted values | Description |
|---|---|---|---|
| `action` | not stated | `getaudio` | "Download the audio" — the only action Doc lists |
| `tenant` | not stated (Doc: "tenant to get audio from") | tenant code | |
| `objectid` | not stated | media id | |

## Example (Site, line 135)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?key=APIKEY&reqtype=MEDIAFILE&tenant=DEMO&id=19&action=GETAUDIO&objectid=3619
```
Note: this example also passes `id=19` in addition to `objectid=3619` —
neither source explains what `id` means here versus `objectid`
(`id` is not in the Doc's parameter list for this reqtype at all).
UNRESOLVED.

Response: audio binary (implied by "Download the audio"; content-type not
documented).

## Source
Site line 135; Doc lines 229–234.
