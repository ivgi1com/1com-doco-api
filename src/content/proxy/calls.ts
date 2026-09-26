import type { Category } from "../types";
import { proxyOperation, q, tenantParam } from "./shared";

/**
 * Call-control reqtypes: AGENT, ATXTRANSFER, CHANNEL, CHANNELS, COUNTCALLS,
 * COUNTCHANNELS, HANGUP, TRANSFER. Each gets its own sidebar category
 * (user decision, Phase 7 Stage 1: grouped by reqtype). DIAL lives in
 * dial.ts (a Stage 2 pilot).
 */

// --- AGENT (agent.md; Site 130-133, Doc 154-164) ---

const agentTenantParam = { ...tenantParam, description: "Name of the tenant (Doc: \"name of the tenant\")." };
const agentExtensionParam = q("extension", "Agent's username or extension number.", { example: "104" });
const agentQueueParam = q("queue", "Queue id.", { example: "281" });

export const agentPause = proxyOperation({
  id: "agent-pause",
  category: "agent",
  operationClass: "write",
  fixedQuery: { reqtype: "AGENT", action: "pause" },
  title: "Pause a queue agent",
  summary: "Pauses an agent in a queue, optionally with a reason.",
  source: "agent.md",
  queryParameters: [
    agentTenantParam,
    agentExtensionParam,
    agentQueueParam,
    q("pausereason", "Free-text reason for the pause.", { required: false, example: "Breakfast" }),
  ],
  notes: [
    "The Doc's own example uses lowercase action=pause (Doc line 164); the Site's uses action=PAUSE (Site line 131). Casing is not documented as significant either way.",
  ],
  related: ["agent-unpause", "agent-listqueues", "queue-add"],
});

export const agentUnpause = proxyOperation({
  id: "agent-unpause",
  category: "agent",
  operationClass: "write",
  fixedQuery: { reqtype: "AGENT", action: "unpause" },
  title: "Unpause a queue agent",
  summary: "Removes an agent's pause in a queue.",
  source: "agent.md",
  queryParameters: [agentTenantParam, agentExtensionParam, agentQueueParam],
  notes: ["Named in the Doc's action list (line 159) alongside pause; no separate example exists for unpause."],
  related: ["agent-pause"],
});

export const agentListqueues = proxyOperation({
  id: "agent-listqueues",
  category: "agent",
  operationClass: "read",
  fixedQuery: { reqtype: "AGENT", action: "LISTQUEUES" },
  title: "List an agent's queues",
  summary: "Returns an agent's info across all the queues it belongs to.",
  source: "agent.md",
  queryParameters: [
    agentTenantParam,
    agentExtensionParam,
    q("format", "Output format. The Site's own example always sends format=json; no other value has been tried.", { enum: ["json"], example: "json" }),
  ],
  verification: { documented: true, implemented: true, tested: true, verified: false },
  responses: [
    {
      status: 200,
      description: "Without extension, both format variants return the plain-text error \"No extension specified\" (source-docs/DOCS_AUDIT.md A-68). This refines an earlier probe's \"no observable data\" finding (A-41) into a concrete parameter-validation error; the real success response remains undocumented.",
      format: "plain",
      evidence: "observed-sanitized",
      verified: true,
      source: "source-docs/DOCS_AUDIT.md#a-68",
    },
  ],
  notes: [
    "Site-only action (Site line 133); not in the Doc's action list, which names only pause and unpause. Neither source explains it further or states whether other action values exist beyond these three.",
    "A structure-only probe against a real test tenant returned an explicit \"No extension specified\" error without an extension value (source-docs/DOCS_AUDIT.md A-68, refining A-41); the success response shape remains undocumented here.",
  ],
});

export const agentCategory: Category = {
  id: "agent",
  title: "AGENT",
  endpoints: [agentPause, agentUnpause, agentListqueues],
};

// --- ATXTRANSFER (atxtransfer.md; Doc 167-172, no Site example) ---

export const atxtransfer = proxyOperation({
  id: "atxtransfer",
  category: "atxtransfer",
  operationClass: "write",
  fixedQuery: { reqtype: "ATXTRANSFER" },
  title: "Attended-transfer a channel",
  summary: "Attend-transfers a channel to another number, with a confirmation step before the transfer completes.",
  source: "atxtransfer.md",
  queryParameters: [
    q("tenant", "Tenant for the channel to transfer.", { required: false }),
    q("channel", "Channel to transfer."),
    q("dest", "Number to transfer the channel to."),
  ],
  notes: [
    "No example and no response sample in either source. The method is not stated; GET is assumed by analogy to sibling channel-control reqtypes, not confirmed.",
    "Compare TRANSFER, the blind/unattended form.",
  ],
  related: ["transfer"],
});

export const atxtransferCategory: Category = { id: "atxtransfer", title: "ATXTRANSFER", endpoints: [atxtransfer] };

// --- CHANNEL / CHANNELS (channel.md, channels.md; Doc 79-87, no Site example) ---

export const channel = proxyOperation({
  id: "channel",
  category: "channel",
  operationClass: "read",
  fixedQuery: { reqtype: "CHANNEL" },
  title: "Get a channel",
  summary: "Shows one channel's details for the selected tenant.",
  source: "channel.md",
  queryParameters: [
    q("channel", "The channel to show info for."),
    tenantParam,
    q("format", "Output format. Observed (A-69): the default is a pipe-delimited line; format=json (undocumented) returns an array.", { required: false, enum: ["json"], example: "json" }),
  ],
  verification: { documented: true, implemented: true, tested: true, verified: false },
  responses: [
    {
      status: 200,
      description: "Without a channel value, returns an array of same-length, content-empty pairs (55 items observed) — plausibly an idle-channel enumeration when no channel is selected; not confirmed. Without tenant, returns the shared \"tenant required\" error also seen on COUNTCALLS/COUNTCHANNELS/HELP (source-docs/DOCS_AUDIT.md A-69).",
      format: "json",
      evidence: "observed-sanitized",
      verified: true,
      source: "source-docs/DOCS_AUDIT.md#a-69",
      schema: [
        {
          name: "[ ]",
          location: "body",
          type: "array",
          required: true,
          description: "One item per entry; each item observed as a 2-element array of empty strings when no channel is active.",
        },
      ],
      example: [["", ""]],
    },
  ],
  notes: [
    "Singular form. Compare CHANNELS, the plural listing form.",
    "tenant is not documented for this operation, but a probe found it required in practice: omitting it returns a fixed error shared with COUNTCALLS, COUNTCHANNELS and HELP (source-docs/DOCS_AUDIT.md A-69).",
  ],
  related: ["channels"],
});

export const channelCategory: Category = { id: "channel", title: "CHANNEL", endpoints: [channel] };

export const channels = proxyOperation({
  id: "channels",
  category: "channels",
  operationClass: "read",
  fixedQuery: { reqtype: "CHANNELS" },
  title: "List channels",
  summary: "Shows the channels for the selected tenant.",
  source: "channels.md",
  queryParameters: [q("tenant", "Show channels for this tenant.", { required: false })],
  responses: [],
  notes: ["One of only two Doc-only reqtypes with a full example URL (the other is SIMPLECDRS). Response not documented."],
  related: ["channel"],
});

export const channelsCategory: Category = { id: "channels", title: "CHANNELS", endpoints: [channels] };

// --- COUNTCALLS / COUNTCHANNELS (countcalls.md, countchannels.md) ---

export const countcalls = proxyOperation({
  id: "countcalls",
  category: "countcalls",
  operationClass: "read",
  fixedQuery: { reqtype: "COUNTCALLS" },
  title: "Count running calls",
  summary: "Counts the number of calls currently running.",
  source: "countcalls.md",
  queryParameters: [tenantParam],
  verification: { documented: true, implemented: true, tested: true, verified: false },
  responses: [
    {
      status: 200,
      description: "With tenant supplied: an empty 200 body (0 bytes) — plausibly \"no calls in progress\" on the test tenant, not confirmed. Without tenant: the shared \"tenant required\" error also seen on CHANNEL/COUNTCHANNELS/HELP (source-docs/DOCS_AUDIT.md A-69).",
      format: "plain",
      evidence: "observed-sanitized",
      verified: true,
      source: "source-docs/DOCS_AUDIT.md#a-69",
    },
  ],
  notes: [
    "No parameters are documented, and the Doc gives only the one-line purpose (unlike every other reqtype). The Site's own example (Site line 152) sends no tenant, but a probe found tenant required in practice to avoid a fixed error response (source-docs/DOCS_AUDIT.md A-69).",
  ],
});

export const countcallsCategory: Category = { id: "countcalls", title: "COUNTCALLS", endpoints: [countcalls] };

export const countchannels = proxyOperation({
  id: "countchannels",
  category: "countchannels",
  operationClass: "read",
  fixedQuery: { reqtype: "COUNTCHANNELS" },
  title: "Count channels",
  summary: "Returns the number of channels, in total or per node.",
  source: "countchannels.md",
  queryParameters: [
    q("nodename", "Count only this node's channels.", { required: false }),
    q("tenant", "Optional if using the Admin API key, returns only channels from the selected tenant.", { required: false }),
  ],
  verification: { documented: true, implemented: true, tested: true, verified: false },
  responses: [
    {
      status: 200,
      description: "Without tenant: the shared \"tenant required\" error also seen on CHANNEL/COUNTCALLS/HELP. With tenant (but no nodename): \"Wrong or missing tenant\" instead — a different error from the other three, suggesting this operation actually wants nodename and/or an Admin key rather than a tenant key (source-docs/DOCS_AUDIT.md A-69). Neither variant was resolved to a success response.",
      format: "plain",
      evidence: "observed-sanitized",
      verified: true,
      source: "source-docs/DOCS_AUDIT.md#a-69",
    },
  ],
  notes: [
    "No example and no response sample in either source; the method is not stated.",
    "A probe found two distinct error responses depending on whether tenant is supplied, neither of them a success (source-docs/DOCS_AUDIT.md A-69) — this operation may need nodename and/or an Admin key instead of a tenant key.",
  ],
  related: ["countpeers", "countcalls"],
});

export const countchannelsCategory: Category = { id: "countchannels", title: "COUNTCHANNELS", endpoints: [countchannels] };

// --- HANGUP (hangup.md; Site 128-129, Doc 225-229, 237) ---

export const hangup = proxyOperation({
  id: "hangup",
  category: "hangup",
  operationClass: "write",
  fixedQuery: { reqtype: "HANGUP" },
  title: "Hang up a channel",
  summary: "Hangs up a channel, or a call by extension.",
  source: "hangup.md",
  queryParameters: [
    q("tenant", "Tenant for the channel to hang up.", { required: false }),
    q("channel", "Channel to hang up."),
    q("extension", "Extension to hang up. The Site's example uses this alone, with no channel.", { required: false, example: "103" }),
  ],
  notes: [
    "A raw-source defect: the Doc's text for this reqtype runs directly into the next reqtype's heading with no line break (\"...extension to hangupMEDIAFILE    - Manage media files\"), confirmed against the raw export, not an extraction artifact.",
    "Response not documented for either example.",
  ],
});

export const hangupCategory: Category = { id: "hangup", title: "HANGUP", endpoints: [hangup] };

// --- TRANSFER (transfer.md; Doc 292-297, 346-351, no Site example) ---

export const transfer = proxyOperation({
  id: "transfer",
  category: "transfer",
  operationClass: "write",
  fixedQuery: { reqtype: "TRANSFER" },
  title: "Transfer a channel",
  summary: "Blind-transfers a channel to another number, with no confirmation step.",
  source: "transfer.md",
  queryParameters: [
    q("tenant", "Tenant for the channel to transfer.", { required: false }),
    q("channel", "Channel to transfer."),
    q("extrachannel", "An extra channel to transfer along with the first.", { required: false }),
    q("dest", "Number to transfer the channel to."),
  ],
  notes: ["No example and no response sample in either source. Compare ATXTRANSFER, the attended form with a confirmation step."],
  related: ["atxtransfer"],
});

export const transferCategory: Category = { id: "transfer", title: "TRANSFER", endpoints: [transfer] };
