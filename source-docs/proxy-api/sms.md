# SMS

**Purpose:** "Send an SMS" (Doc line 283).
**Method:** not stated (no example; likely GET by analogy to DIAL, not
confirmed).
**Source:** Doc lines 283–291. No Site example.

## Parameters (Doc lines 284–291)

| Param | Required | Accepted values | Description |
|---|---|---|---|
| `tenant` | not stated (Doc: "tenant where to place the call" — reused DIAL wording, likely copy/paste) | tenant code | |
| `source` \| `?exten` | not stated | number, or `ACCOUNT` | "the sender number - use ACCOUNT to use the number associated with the account chosen" — same `?exten`/`ACCOUNT` pattern as DIAL, see `dial.md` |
| `dest` | not stated | number | number to send the SMS to |
| `account` | optional | account name, or `SOURCE` | simulate the SMS from this account |
| `destclid` | optional | CLID | CLID for the dest number |
| `server` | optional | server name | specific server to dial from |
| `message` | not stated | text | the message body |

No example, no response sample.

## Source
Doc lines 283–291.
