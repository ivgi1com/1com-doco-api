# SETFLOW

**Purpose:** "Set Flow status or variable" (Doc lines 277, 340).
**Method:** not stated (no example).
**Source:** Doc lines 277–282, 340–345 (duplicate block, identical).

## Parameters (Doc lines 278–282)

| Param | Required | Accepted values | Description |
|---|---|---|---|
| `number` | not stated | flow number | |
| `state` | optional | `INUSE`, `NOT_INUSE`, `UNAVAILABLE`, `RINGING` | |
| `value` | optional | any | |
| `tenant` | optional | tenant code | "tenant for the flow to set" |

No example, no response sample. Compare to `info.md`'s `INFO&info=FLOW`
(read-only flow-state lookup) — SETFLOW is the write counterpart.

## Source
Doc lines 277–282, 340–345.
