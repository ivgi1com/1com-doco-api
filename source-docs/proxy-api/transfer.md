# TRANSFER

**Purpose:** "Transfer a channel" (Doc lines 292, 346).
**Method:** not stated (no example).
**Source:** Doc lines 292–297, 346–351 (duplicate block, identical).

## Parameters (Doc lines 293–297)

| Param | Required | Accepted values | Description |
|---|---|---|---|
| `tenant` | optional | tenant code | "tenant for the channel to transfer" |
| `channel` | not stated | channel identifier | channel to transfer |
| `extrachannel` | optional | channel identifier | extra channel to transfer |
| `dest` | not stated | number | number to transfer the channel to |

No example, no response sample. Compare `ATXTRANSFER` (attended transfer,
`atxtransfer.md`) — this is the blind/unattended form, no `dest`
confirmation step documented for either.

## Source
Doc lines 292–297, 346–351.
