# PEERS

**New in this rebuild — not present in the old (MiRTA-sourced) 40-file
set at all.** The old audit documented `CHANSIPPEERS` (chan_sip-specific,
table-only, no params) and `COUNTPEERS` (a count); this `PEERS` reqtype
(the full peer listing) has no old-source counterpart.

**Purpose:** "Show the peers registered on all nodes of the network" (Doc
line 71).
**Method:** not stated (no example).
**Source:** Doc lines 71–74. No Site example.

## Parameters (Doc lines 72–74)

| Param | Required | Accepted values | Description |
|---|---|---|---|
| `tenant` | optional | tenant code | "optional if using the Admin API key, returns only peers from the selected tenant" |

No example, no response sample. Relationship to the old `CHANSIPPEERS`
reqtype (chan_sip-specific peer listing) is not stated — this one does
not mention a `chan_sip`/PJSIP distinction, so whether it supersedes,
overlaps with, or is unrelated to `CHANSIPPEERS` is UNRESOLVED.

## Source
Doc lines 71–74.
