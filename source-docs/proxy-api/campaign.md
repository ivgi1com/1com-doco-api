# CAMPAIGN

**Purpose:** "Manage call campaign" (Doc line 173).
**Method:** GET (`basis: example_url`).
**Source:** Doc lines 173–185. No Site example beyond the Doc's own
reference URL.

## Parameters (Doc lines 174–179)

| Param | Required | Accepted values | Description |
|---|---|---|---|
| `campaign` | not stated | campaign id (from the campaign's editing URL) | |
| `tenant` | optional | tenant code | |
| `action` | not stated | `start`, `stop`, `pause`, `resume`, `addnumber`, `delnumber` | "Start and stop can affect only on-demand campaign" |
| `number` | optional | phone number | used with `action=addnumber` |
| `numberdescription` | optional | free text | used with `action=addnumber` |

## Example (Doc, line 184)
```
GET https://pbx6webserver.1com.co.il/pbx/proxyapi.php?tenant=TENANT&key=APIKEY&reqtype=CAMPAIGN&campaign=camIDnumber&action=addnumber&number=505050505&numberdescription=leadname
```
Response: not documented.

## Source
Doc lines 173–185.
