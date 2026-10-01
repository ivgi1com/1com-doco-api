import type { Category } from "../types";
import { proxyOperation, q } from "./shared";

/**
 * Extension/peer reqtypes: BLFS, COUNTPEERS, PEERS, UNREGISTER, REBOOT,
 * VIRTUALEXT. Each gets its own sidebar category (grouped by reqtype).
 */

const peerCountTenantParam = q(
  "tenant",
  "Optional if using the Admin API Key, returns only peers from the selected tenant. Omitting it with an Admin key returns every tenant's peers.",
  { required: false },
);

// --- BLFS (blfs.md; Doc 75-76, no Site example) ---

export const blfs = proxyOperation({
  id: "blfs",
  category: "blfs",
  operationClass: "read",
  fixedQuery: { reqtype: "BLFS" },
  title: "Get BLF status",
  summary: "Returns the BLF (Busy Lamp Field) status, peers and flows for the tenant.",
  source: "blfs.md",
  queryParameters: [
    q("tenant", "The tenant to report."),
    q("format", "Output format. Observed (A-72): the default is a pipe-delimited table; format=json (undocumented) returns an array of the same fields.", { required: false, enum: ["json"], example: "json" }),
  ],
  verification: { documented: true, implemented: true, tested: true, verified: false },
  responses: [
    {
      status: 200,
      description: "With format=json (undocumented): an array, one object per BLF entry (518 observed on the test tenant). Without format: the same 3 fields pipe-delimited, each repeated under both a bare positional key and its name (6 values per line, not 4 — see A-72).",
      format: "json",
      evidence: "observed-sanitized",
      verified: true,
      source: "source-docs/DOCS_AUDIT.md#a-72",
      schema: [
        {
          name: "[ ]",
          location: "body",
          type: "object",
          required: true,
          description: "One item per BLF entry.",
          children: [
            { name: "0", location: "body", type: "string", required: true, description: "Bare positional duplicate of st_extension." },
            { name: "st_extension", location: "body", type: "string", required: true, description: "Extension identifier." },
            { name: "1", location: "body", type: "string", required: true, description: "Bare positional duplicate of st_state." },
            { name: "st_state", location: "body", type: "string", required: true, description: "State value. Full value set not documented." },
            { name: "2", location: "body", type: "string", required: true, description: "Bare positional duplicate of st_timestamp." },
            { name: "st_timestamp", location: "body", type: "string", required: true, description: "Timestamp, \"YYYY-MM-DD HH:MM:SS\"." },
          ],
        },
      ],
      example: [{ "0": "201", st_extension: "201", "1": "NOT_INUSE", st_state: "NOT_INUSE", "2": "2026-01-15 09:30:00", st_timestamp: "2026-01-15 09:30:00" }],
    },
  ],
  notes: [
    "No example and no response sample in either source; the method is not stated.",
    "Response observed by probe (source-docs/DOCS_AUDIT.md A-72).",
  ],
});

export const blfsCategory: Category = { id: "blfs", title: "BLFS", endpoints: [blfs] };

// --- COUNTPEERS / PEERS (countpeers.md, peers.md; Doc 62-65, 71-74) ---

export const countpeers = proxyOperation({
  id: "countpeers",
  category: "countpeers",
  operationClass: "read",
  fixedQuery: { reqtype: "COUNTPEERS" },
  title: "Count peers",
  summary: "Returns the number of peers on each node, and the total.",
  source: "countpeers.md",
  queryParameters: [
    peerCountTenantParam,
    q("format", "Output format. Observed (A-70): the default is a pipe-delimited `<node>:<count>` line; format=json (undocumented) returns a keyed object.", { required: false, enum: ["json"], example: "json" }),
  ],
  verification: { documented: true, implemented: true, tested: true, verified: false },
  responses: [
    {
      status: 200,
      description: "With format=json (undocumented): an object keyed by node id, integer values. Without format: a pipe-delimited `<node>:<count>` line (50 entries observed). Observed latency was high (~23 seconds); an initial 15-second attempt timed out (source-docs/DOCS_AUDIT.md A-70).",
      format: "json",
      evidence: "observed-sanitized",
      verified: true,
      source: "source-docs/DOCS_AUDIT.md#a-70",
      schema: [{ name: "{node}", location: "body", type: "integer", required: true, description: "Peer count for this node." }],
      example: { PBX: 12 },
    },
  ],
  notes: [
    "No example and no response sample in either source; the method is not stated.",
    "Observed to be slow: a 15-second probe timed out; a 30-second retry succeeded at ~23 seconds (source-docs/DOCS_AUDIT.md A-70) — a separate blocking concern from data sensitivity if this is ever proposed for Live.",
  ],
  related: ["peers", "countchannels"],
});

export const countpeersCategory: Category = { id: "countpeers", title: "COUNTPEERS", endpoints: [countpeers] };

export const peers = proxyOperation({
  id: "peers",
  category: "peers",
  operationClass: "read",
  fixedQuery: { reqtype: "PEERS" },
  title: "List peers",
  summary: "Shows the peers registered on all nodes of the network.",
  source: "peers.md",
  queryParameters: [
    peerCountTenantParam,
    q("format", "Output format. Observed (A-71): the default is a pipe-delimited table; format=json (undocumented) returns an array of the same fields.", { required: false, enum: ["json"], example: "json" }),
  ],
  verification: { documented: true, implemented: true, tested: true, verified: false },
  responses: [
    {
      status: 200,
      description: "With format=json (undocumented): an array, one object per peer (41 observed). Without format: the same 11 columns pipe-delimited, in the same order (source-docs/DOCS_AUDIT.md A-71).",
      format: "json",
      evidence: "observed-sanitized",
      verified: true,
      source: "source-docs/DOCS_AUDIT.md#a-71",
      schema: [
        {
          name: "[ ]",
          location: "body",
          type: "object",
          required: true,
          description: "One item per peer.",
          children: [
            { name: "node", location: "body", type: "string", required: true, description: "Node identifier." },
            { name: "Name", location: "body", type: "string", required: true, description: "Peer name, observed as \"<number>/<number>\"." },
            { name: "Host", location: "body", type: "string", required: true, description: "Peer host, an IP address." },
            { name: "Dyn", location: "body", type: "string", required: true, description: "Whether the peer is dynamic. Observed single-letter values." },
            { name: "Forcerport", location: "body", type: "string", required: true, description: "Force rport setting." },
            { name: "Comedia", location: "body", type: "string", required: true, description: "Comedia setting." },
            { name: "ACL", location: "body", type: "string", required: true, description: "ACL setting." },
            { name: "Port", location: "body", type: "string", required: true, description: "Peer port." },
            { name: "Status", location: "body", type: "string", required: true, description: "Registration status, e.g. \"OK (<n> ms)\"." },
            { name: "Description", location: "body", type: "string", required: true, description: "Free-text description; often empty." },
            { name: "Realtime", location: "body", type: "string", required: true, description: "Whether the peer is realtime-configured." },
          ],
        },
      ],
      example: [{ node: "PBX", Name: "201/201", Host: "10.0.0.1", Dyn: "D", Forcerport: "Yes", Comedia: "Yes", ACL: "N", Port: "5060", Status: "OK (10 ms)", Description: "", Realtime: "no" }],
    },
  ],
  notes: [
    "New in the 2026-09-25 source rebuild; the prior audit documented a different reqtype, CHANSIPPEERS (chan_sip-specific, table-only). Whether PEERS supersedes, overlaps with, or is unrelated to CHANSIPPEERS is not stated by either current source.",
    "Response observed by probe (source-docs/DOCS_AUDIT.md A-71).",
  ],
  related: ["countpeers"],
});

export const peersCategory: Category = { id: "peers", title: "PEERS", endpoints: [peers] };

// --- UNREGISTER / REBOOT (unregister.md, reboot.md) ---

const peerOrAllParam = q("peer", "Peer name, or ALL for every peer.", { example: "ALL" });
const peerTenantParam = q("tenant", "Tenant for the peer.", { required: false });

export const unregister = proxyOperation({
  id: "unregister",
  category: "unregister",
  operationClass: "write",
  fixedQuery: { reqtype: "UNREGISTER" },
  title: "Unregister a peer",
  summary: "Unregisters one peer, or every peer, from the PBX.",
  source: "unregister.md",
  queryParameters: [peerOrAllParam, { ...peerTenantParam, description: "Tenant for the peer to unregister." }],
  notes: ["No example and no response sample in either source; the method is not stated."],
  related: ["reboot"],
});

export const unregisterCategory: Category = { id: "unregister", title: "UNREGISTER", endpoints: [unregister] };

export const reboot = proxyOperation({
  id: "reboot",
  category: "reboot",
  operationClass: "write",
  fixedQuery: { reqtype: "REBOOT" },
  title: "Reboot a peer",
  summary: "Reboots one peer, or every peer.",
  source: "reboot.md",
  queryParameters: [peerOrAllParam, { ...peerTenantParam, description: "Tenant for the peer to reboot." }],
  notes: ["No example and no response sample in either source; the method is not stated."],
  related: ["unregister"],
});

export const rebootCategory: Category = { id: "reboot", title: "REBOOT", endpoints: [reboot] };

// --- VIRTUALEXT (virtualext.md; Doc 302-310, no Site example) ---

const virtualextTenantParam = q("tenant", "Tenant for the virtual extension.");
const virtualextNumberParam = q("number", "Virtual extension number.");

export const virtualextList = proxyOperation({
  id: "virtualext-list",
  category: "virtualext",
  operationClass: "read",
  fixedQuery: { reqtype: "VIRTUALEXT", action: "list" },
  title: "List a virtual extension's members",
  summary: "Lists the extensions under a virtual extension.",
  source: "virtualext.md",
  queryParameters: [virtualextTenantParam, virtualextNumberParam],
  verification: { documented: true, implemented: true, tested: true, verified: false },
  responses: [
    {
      status: 200,
      description: "Success response with a real number is not documented. Without number (A-75): an explicit \"virtual extension number not specified\"-style error naming the missing parameter.",
      format: "plain",
      evidence: "observed-sanitized",
      verified: true,
      source: "source-docs/DOCS_AUDIT.md#a-75",
    },
  ],
  notes: [
    "Same list/add/del/clean action shape as QUEUE.",
    "Response observed by probe without a number value (source-docs/DOCS_AUDIT.md A-75); the success shape remains undocumented.",
  ],
  related: ["virtualext-add", "virtualext-del", "virtualext-clean", "queue-list"],
});

export const virtualextAdd = proxyOperation({
  id: "virtualext-add",
  category: "virtualext",
  operationClass: "write",
  fixedQuery: { reqtype: "VIRTUALEXT", action: "add" },
  title: "Add to a virtual extension",
  summary: "Adds an extension to a virtual extension.",
  source: "virtualext.md",
  queryParameters: [
    virtualextTenantParam,
    virtualextNumberParam,
    q("extension", "Extension number or username to add.", { required: false }),
  ],
  notes: ["No example and no response sample in either source."],
  related: ["virtualext-list", "virtualext-del"],
});

export const virtualextDel = proxyOperation({
  id: "virtualext-del",
  category: "virtualext",
  operationClass: "write",
  fixedQuery: { reqtype: "VIRTUALEXT", action: "del" },
  title: "Remove from a virtual extension",
  summary: "Deletes one extension from a virtual extension.",
  source: "virtualext.md",
  queryParameters: [
    virtualextTenantParam,
    virtualextNumberParam,
    q("extension", "Extension number or username to delete.", { required: false }),
  ],
  notes: ["No example and no response sample in either source."],
  related: ["virtualext-add", "virtualext-clean"],
});

export const virtualextClean = proxyOperation({
  id: "virtualext-clean",
  category: "virtualext",
  operationClass: "write",
  fixedQuery: { reqtype: "VIRTUALEXT", action: "clean" },
  title: "Clear a virtual extension",
  summary: "Deletes every extension from a virtual extension.",
  source: "virtualext.md",
  queryParameters: [virtualextTenantParam, virtualextNumberParam],
  notes: ["No example and no response sample in either source."],
  related: ["virtualext-del"],
});

export const virtualextCategory: Category = {
  id: "virtualext",
  title: "VIRTUALEXT",
  endpoints: [virtualextList, virtualextAdd, virtualextDel, virtualextClean],
};
