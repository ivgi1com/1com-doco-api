import type { Category, Parameter } from "../types";
import { proxyOperation, q } from "./shared";

/**
 * Queue and flow reqtypes: QUEUE, QUEUERESET, CAMPAIGN, FLOWS, SETFLOW.
 * Each gets its own sidebar category (grouped by reqtype). Compare
 * INFO info=FLOW (info.ts, read-only single-flow lookup) and FLOWS below
 * (plural, all flows) and SETFLOW (the write counterpart of info=FLOW).
 */

// --- QUEUE (queue.md; Site 136-139, Doc 240-255) ---

const queueTenantParam = q("tenant", "Tenant for the queue.");
const queueNumberParam = q("number", "Queue number, or NONE where applicable. Alternative to id.", { example: "9200" });
const queueIdParam = q("id", "Queue id. Alternative to number.");
const queueExtensionParam = q("extension", "Agent number or username to add or delete, or NONE where applicable.", { required: false, example: "103" });

export const queueList = proxyOperation({
  id: "queue-list",
  category: "queue",
  operationClass: "read",
  fixedQuery: { reqtype: "QUEUE", action: "list" },
  title: "List a queue's agents",
  summary: "Returns the agents in a queue.",
  source: "queue.md",
  queryParameters: [queueTenantParam, queueNumberParam, queueIdParam],
  verification: { documented: true, implemented: true, tested: true, verified: false },
  responses: [
    {
      status: 200,
      description: "Success response is not documented. Without number or id (A-75): an explicit \"No queue (id or number) specified\"-style error.",
      format: "plain",
      evidence: "observed-sanitized",
      verified: true,
      source: "source-docs/DOCS_AUDIT.md#a-75",
    },
  ],
  notes: ["Response observed by probe without number/id (source-docs/DOCS_AUDIT.md A-75); the success shape remains undocumented."],
  related: ["queue-add", "info-agents"],
});

export const queueAdd = proxyOperation({
  id: "queue-add",
  category: "queue",
  operationClass: "write",
  fixedQuery: { reqtype: "QUEUE", action: "add" },
  title: "Add an agent to a queue",
  summary: "Adds an agent to a queue.",
  source: "queue.md",
  queryParameters: [
    queueTenantParam,
    queueNumberParam,
    queueIdParam,
    queueExtensionParam,
    q("order", "Agent's position in the agent list.", { required: false, type: "integer" }),
    q("type", "Agent type.", { required: false, enum: ["NF", "AD", "NFR", "ADR"] }),
  ],
  notes: [
    "type values (Doc 254): NF (Not Following), AD (Additional Destinations), NFR (Not Following with Ring), ADR (Additional Destinations with Ring).",
    "Response not documented.",
  ],
  related: ["queue-del", "queue-list"],
});

export const queueDel = proxyOperation({
  id: "queue-del",
  category: "queue",
  operationClass: "write",
  fixedQuery: { reqtype: "QUEUE", action: "del" },
  title: "Remove an agent from a queue",
  summary: "Deletes one agent from a queue.",
  source: "queue.md",
  queryParameters: [queueTenantParam, queueNumberParam, queueIdParam, queueExtensionParam],
  notes: ["No example; parameters inferred from the shared QUEUE parameter table. Response not documented."],
  related: ["queue-add", "queue-clean"],
});

export const queueClean = proxyOperation({
  id: "queue-clean",
  category: "queue",
  operationClass: "write",
  fixedQuery: { reqtype: "QUEUE", action: "clean" },
  title: "Clear a queue",
  summary: "Deletes every agent from a queue.",
  source: "queue.md",
  queryParameters: [queueTenantParam, queueNumberParam, queueIdParam],
  notes: ["No example; parameters inferred from the shared QUEUE parameter table. Response not documented."],
  related: ["queue-del"],
});

export const queueLog = proxyOperation({
  id: "queue-log",
  category: "queue",
  operationClass: "write",
  fixedQuery: { reqtype: "QUEUE", action: "log" },
  title: "Write a custom queue-log entry",
  summary: "Writes a custom event to a queue's log.",
  source: "queue.md",
  queryParameters: [
    queueTenantParam,
    queueNumberParam,
    queueIdParam,
    q("uniqid", "Unique id to use for the log record.", { required: false }),
    q("event", "Custom log event name.", { required: false }),
    q("data1", "Payload field 1 for the custom event.", { required: false }),
    q("data2", "Payload field 2 for the custom event.", { required: false }),
    q("data3", "Payload field 3 for the custom event.", { required: false }),
    q("data4", "Payload field 4 for the custom event.", { required: false }),
    q("data5", "Payload field 5 for the custom event.", { required: false }),
  ],
  notes: ["No example; parameters inferred from the shared QUEUE parameter table. Response not documented."],
  related: ["info-queuelogs"],
});

export const queueCategory: Category = {
  id: "queue",
  title: "QUEUE",
  endpoints: [queueList, queueAdd, queueDel, queueClean, queueLog],
};

// --- QUEUERESET (queuereset.md; Doc 256-259, 321-324 duplicate) ---

export const queuereset = proxyOperation({
  id: "queuereset",
  category: "queuereset",
  operationClass: "write",
  fixedQuery: { reqtype: "QUEUERESET" },
  title: "Reset a queue's statistics",
  summary: "Resets the statistics for a queue.",
  source: "queuereset.md",
  queryParameters: [
    q("tenant", "Tenant for the queue.", { required: false }),
    q("queueid", "Queue to reset."),
  ],
  notes: ["No example and no response sample in either source; the method is not stated."],
  related: ["queue-list"],
});

export const queueresetCategory: Category = { id: "queuereset", title: "QUEUERESET", endpoints: [queuereset] };

// --- CAMPAIGN (campaign.md; Doc 173-185) ---

const campaignParam = q("campaign", "Campaign id, from the campaign's editing URL.");
const campaignTenantParam = q("tenant", "Tenant for the campaign.", { required: false });

function campaignAction(action: string, title: string, summary: string, extra: Parameter[] = []) {
  return proxyOperation({
    id: `campaign-${action}`,
    category: "campaign",
    operationClass: "write",
    fixedQuery: { reqtype: "CAMPAIGN", action },
    title,
    summary,
    source: "campaign.md",
    queryParameters: [campaignParam, campaignTenantParam, ...extra],
    notes: ["Doc line 179: start and stop can affect only an on-demand campaign. Response not documented."],
  });
}

export const campaignStart = campaignAction("start", "Start a campaign", "Starts an on-demand campaign.");
export const campaignStop = campaignAction("stop", "Stop a campaign", "Stops an on-demand campaign.");
export const campaignPause = campaignAction("pause", "Pause a campaign", "Pauses a campaign.");
export const campaignResume = campaignAction("resume", "Resume a campaign", "Resumes a paused campaign.");
export const campaignAddnumber = campaignAction(
  "addnumber",
  "Add a number to a campaign",
  "Adds a phone number to a campaign's dial list.",
  [
    q("number", "Phone number to add.", { example: "505050505" }),
    q("numberdescription", "Free-text description for the number.", { required: false, example: "leadname" }),
  ],
);
export const campaignDelnumber = campaignAction(
  "delnumber",
  "Remove a number from a campaign",
  "Removes a phone number from a campaign's dial list.",
  [q("number", "Phone number to remove.")],
);

export const campaignCategory: Category = {
  id: "campaign",
  title: "CAMPAIGN",
  endpoints: [campaignStart, campaignStop, campaignPause, campaignResume, campaignAddnumber, campaignDelnumber],
};

// --- FLOWS / SETFLOW (flows.md, setflow.md) ---

export const flows = proxyOperation({
  id: "flows",
  category: "flows",
  operationClass: "read",
  fixedQuery: { reqtype: "FLOWS" },
  title: "List flow statuses",
  summary: "Shows the status of every flow for the tenant.",
  source: "flows.md",
  queryParameters: [
    q("tenant", "The tenant to report."),
    q("format", "Output format. Observed (A-73): the default is a pipe-delimited table; format=json (undocumented) returns an array of the same fields.", { required: false, enum: ["json"], example: "json" }),
  ],
  verification: { documented: true, implemented: true, tested: true, verified: false },
  responses: [
    {
      status: 200,
      description: "With format=json (undocumented): an array, one object per flow (5 observed). Without format: the same 18 fields pipe-delimited, each repeated under both a bare positional key and its name (source-docs/DOCS_AUDIT.md A-73).",
      format: "json",
      evidence: "observed-sanitized",
      verified: true,
      source: "source-docs/DOCS_AUDIT.md#a-73",
      schema: [
        {
          name: "[ ]",
          location: "body",
          type: "object",
          required: true,
          description: "One item per flow.",
          children: [
            { name: "0", location: "body", type: "string", required: true, description: "Bare positional duplicate of fl_id." },
            { name: "fl_id", location: "body", type: "string", required: true, description: "Flow id." },
            { name: "1", location: "body", type: "string", required: true, description: "Bare positional duplicate of fl_te_id." },
            { name: "fl_te_id", location: "body", type: "string", required: true, description: "Internal tenant id." },
            { name: "2", location: "body", type: "string", required: true, description: "Bare positional duplicate of fl_name." },
            { name: "fl_name", location: "body", type: "string", required: true, description: "Flow name." },
            { name: "3", location: "body", type: "string", required: true, description: "Bare positional duplicate of fl_comment." },
            { name: "fl_comment", location: "body", type: "string", required: true, description: "Free-text comment." },
            { name: "4", location: "body", type: "string", required: true, description: "Bare positional duplicate of fl_number." },
            { name: "fl_number", location: "body", type: "string", required: true, description: "Flow number, observed as \"<n>[state]\"." },
            { name: "5", location: "body", type: "string", required: true, description: "Bare positional duplicate of fl_value. Often empty." },
            { name: "fl_value", location: "body", type: "string", required: true, description: "Variable value. Often empty." },
            { name: "6", location: "body", type: "string", required: true, description: "Bare positional duplicate of fl_value_for_unavailable. Often empty." },
            { name: "fl_value_for_unavailable", location: "body", type: "string", required: true, description: "Value to use when unavailable. Often empty." },
            { name: "7", location: "body", type: "string", required: true, description: "Bare positional duplicate of fl_value_for_inuse. Often empty." },
            { name: "fl_value_for_inuse", location: "body", type: "string", required: true, description: "Value to use when in use. Often empty." },
            { name: "8", location: "body", type: "string", required: true, description: "Bare positional duplicate of fl_value_for_notinuse. Often empty." },
            { name: "fl_value_for_notinuse", location: "body", type: "string", required: true, description: "Value to use when not in use. Often empty." },
            { name: "9", location: "body", type: "string", required: true, description: "Bare positional duplicate of fl_value_for_ringing. Often empty." },
            { name: "fl_value_for_ringing", location: "body", type: "string", required: true, description: "Value to use when ringing. Often empty." },
            { name: "10", location: "body", type: "string", required: true, description: "Bare positional duplicate of fl_variable_name. Often empty." },
            { name: "fl_variable_name", location: "body", type: "string", required: true, description: "Associated variable name. Often empty." },
            { name: "11", location: "body", type: "string", required: true, description: "Bare positional duplicate of fl_monitor_type." },
            { name: "fl_monitor_type", location: "body", type: "string", required: true, description: "Monitor type, observed hyphenated." },
            { name: "12", location: "body", type: "string", required: true, description: "Bare positional duplicate of fl_monitor_type_id." },
            { name: "fl_monitor_type_id", location: "body", type: "string", required: true, description: "Monitor type id." },
            { name: "13", location: "body", type: "string", required: true, description: "Bare positional duplicate of fl_monitor_parameter." },
            { name: "fl_monitor_parameter", location: "body", type: "string", required: true, description: "Monitor parameter, observed as \"[state]\"." },
            { name: "14", location: "body", type: "string", required: true, description: "Bare positional duplicate of st_extension." },
            { name: "st_extension", location: "body", type: "string", required: true, description: "Extension identifier, observed as \"<n>[state]-<state>\"." },
            { name: "15", location: "body", type: "string", required: true, description: "Bare positional duplicate of st_state." },
            { name: "st_state", location: "body", type: "string", required: true, description: "State value." },
            { name: "16", location: "body", type: "string", required: true, description: "Bare positional duplicate of st_timestamp." },
            { name: "st_timestamp", location: "body", type: "string", required: true, description: "Timestamp, \"YYYY-MM-DD HH:MM\"." },
            { name: "17", location: "body", type: "string", required: true, description: "Bare positional duplicate of st_peername." },
            { name: "st_peername", location: "body", type: "string", required: true, description: "Peer name." },
          ],
        },
      ],
      example: [{
        "0": "12",
        fl_id: "12",
        "1": "500",
        fl_te_id: "500",
        "2": "night-mode",
        fl_name: "night-mode",
        "3": "Night mode toggle",
        fl_comment: "Night mode toggle",
        "4": "500[on]",
        fl_number: "500[on]",
        "5": "",
        fl_value: "",
        "6": "",
        fl_value_for_unavailable: "",
        "7": "",
        fl_value_for_inuse: "",
        "8": "",
        fl_value_for_notinuse: "",
        "9": "",
        fl_value_for_ringing: "",
        "10": "",
        fl_variable_name: "",
        "11": "flow-state",
        fl_monitor_type: "flow-state",
        "12": "1",
        fl_monitor_type_id: "1",
        "13": "[on]",
        fl_monitor_parameter: "[on]",
        "14": "500[on]-flow",
        st_extension: "500[on]-flow",
        "15": "NOT_INUSE",
        st_state: "NOT_INUSE",
        "16": "2026-01-15 09:30",
        st_timestamp: "2026-01-15 09:30",
        "17": "srv02",
        st_peername: "srv02",
      }],
    },
  ],
  notes: [
    "Plural, all-flows form. Compare INFO info=FLOW (a single flow by id) and SETFLOW (writes one flow's state).",
    "Response observed by probe (source-docs/DOCS_AUDIT.md A-73).",
  ],
  related: ["info-flow", "setflow"],
});

export const flowsCategory: Category = { id: "flows", title: "FLOWS", endpoints: [flows] };

export const setflow = proxyOperation({
  id: "setflow",
  category: "setflow",
  operationClass: "write",
  fixedQuery: { reqtype: "SETFLOW" },
  title: "Set a flow's status or variable",
  summary: "Sets one flow's state or an associated variable.",
  source: "setflow.md",
  queryParameters: [
    q("number", "Flow number."),
    q("state", "Flow state to set.", { required: false, enum: ["INUSE", "NOT_INUSE", "UNAVAILABLE", "RINGING"] }),
    q("value", "Variable value to set.", { required: false }),
    q("tenant", "Tenant for the flow to set.", { required: false }),
  ],
  notes: [
    "Write counterpart of INFO info=FLOW's read-only lookup.",
    "No example and no response sample in either source; the method is not stated.",
  ],
  related: ["info-flow", "flows"],
});

export const setflowCategory: Category = { id: "setflow", title: "SETFLOW", endpoints: [setflow] };
