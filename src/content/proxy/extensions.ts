import type { Category } from "../types";
import { proxyOperation, q } from "./shared";

/**
 * Extension/peer reqtypes: BLFS, COUNTPEERS, PEERS, UNREGISTER, REBOOT,
 * VIRTUALEXT. Each gets its own sidebar category (grouped by reqtype).
 */

const peerCountTenantParam = q(
  "tenant",
  "Optional if using the Admin API key, returns only peers from the selected tenant. Omitting it with an Admin key returns every tenant's peers.",
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
  queryParameters: [q("tenant", "The tenant to report.")],
  notes: ["No example and no response sample in either source; the method is not stated."],
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
  queryParameters: [peerCountTenantParam],
  notes: ["No example and no response sample in either source; the method is not stated."],
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
  queryParameters: [peerCountTenantParam],
  notes: [
    "New in the 2026-09-25 source rebuild; the prior MiRTA-sourced audit documented a different reqtype, CHANSIPPEERS (chan_sip-specific, table-only). Whether PEERS supersedes, overlaps with, or is unrelated to CHANSIPPEERS is not stated by either current source.",
    "No example and no response sample; the method is not stated.",
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
  notes: ["Same list/add/del/clean action shape as QUEUE. No example and no response sample in either source."],
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
