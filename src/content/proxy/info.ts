import type { Category, Endpoint, Parameter, ResponseSpec } from "../types";
import { NEW_SOURCE_SITE, SOURCE_PAGE, auth, legacyDeprecation, proxyOperation, q, tenantParam } from "./shared";

/**
 * reqtype=INFO — "Get info about system" (source-docs/proxy-api/info.md).
 * Discriminator: `info`. The first five operations below are the Phase 4–6
 * endpoints (Live and/or Demo); Phase 7 operations follow.
 */
const idParam: Parameter = {
  name: "id",
  location: "query",
  type: "string",
  required: "undocumented",
  description:
    "Return only the extension with this internal identifier. Shown only by example, alongside `tenant`.",
  source: `${SOURCE_PAGE}#bkmrk-info---extensions-%2F--1`,
};

const numberParam: Parameter = {
  name: "number",
  location: "query",
  type: "string",
  required: "undocumented",
  description:
    "Return only the extension with this extension number. Shown only by example, alongside `tenant`.",
  source: `${SOURCE_PAGE}#bkmrk-info---extensions-%2F--2`,
};

const formatParam: Parameter = {
  name: "format",
  location: "query",
  type: "string",
  required: "undocumented",
  enum: ["plain", "json"],
  description:
    "Output format. The source lists plain, json, xml and csv \"depending on the request\" without saying which this operation supports. Observed (A-40): the default is plain (a pipe-delimited table); json returns an array; xml and csv returned an empty body, so they are not offered here.",
  source: `${SOURCE_PAGE}#bkmrk-common-parameters`,
};

// Observed 2026-09-25 through the portal's Live proxy (A-40), structure only.
// These six fields are the portal's JSON field allowlist
// (src/server/playground/allowlist.ts): the same information as the plain
// table, minus Password. The real format=json item has ~148 fields,
// including credential and 2FA fields, which the portal never displays.
const extensionItemSchema: Parameter[] = [
  { name: "ex_id", location: "body", type: "string", required: true, description: "Internal extension identifier (use with the `id` filter)." },
  { name: "ex_number", location: "body", type: "string", required: true, description: "Extension number, dialable within the tenant (use with the `number` filter)." },
  { name: "ex_name", location: "body", type: "string", required: true, description: "Extension display name." },
  { name: "ex_tech", location: "body", type: "string", required: true, description: "Channel technology, e.g. SIP. Full value set not documented." },
  { name: "st_state", location: "body", type: "string", required: true, description: "Current device state, e.g. UNAVAILABLE. Full value set not documented." },
  { name: "username", location: "body", type: "string", required: true, description: "SIP username for the extension." },
];

const infoExtensionsResponse: ResponseSpec = {
  status: 200,
  description:
    "With format=json: a JSON array, one object per extension. Shown here: the six fields this portal returns; the upstream record has many more (about 148, including credential and 2FA fields), which the portal's Live proxy removes. Without format (or format=plain) the response is a pipe-delimited text table with a header row: Number|Name|Tech|State|Username|Password.",
  format: "json",
  // Structure observed through the Live proxy; example values are synthetic.
  evidence: "observed-sanitized",
  verified: true,
  source: "source-docs/DOCS_AUDIT.md#a-40",
  schema: [
    {
      name: "[ ]",
      location: "body",
      type: "object",
      required: true,
      description: "One item per matching extension.",
      children: extensionItemSchema,
    },
  ],
  example: [
    { ex_id: "10001", ex_number: "201", ex_name: "Reception", ex_tech: "SIP", st_state: "UNAVAILABLE", username: "201-TENANTCODE" },
    { ex_id: "10002", ex_number: "300", ex_name: "Support desk", ex_tech: "SIP", st_state: "UNAVAILABLE", username: "300-TENANTCODE" },
  ],
};

const infoExtensions: Endpoint = {
  id: "info-extensions",
  api: "proxy",
  version: "legacy",
  category: "info",
  status: "legacy",
  deprecation: legacyDeprecation,
  method: "GET",
  methodBasis: "inferred",
  path: "/pbx/proxyapi.php",
  fixedQuery: { reqtype: "INFO", info: "EXTENSIONS" },
  title: "List extensions",
  summary:
    "Returns extensions for the tenant, or a single extension when filtered by id or number.",
  sourceUrl: `${SOURCE_PAGE}#bkmrk-info---extensions-%2F-`,
  verification: { documented: true, implemented: true, tested: true, verified: false },
  authentication: auth,
  headers: [],
  pathParameters: [],
  queryParameters: [tenantParam, idParam, numberParam, formatParam],
  requestBody: null,
  // Response derived from a user-supplied sanitized real capture
  // (source-docs/observed/info-extensions.json, U-11). Names were replaced
  // with placeholders before this file was written. `evidence:
  // "observed-sanitized"` means Demo must never replay it — see types.ts
  // `Evidence` and use-playground.ts's `unavailable` variant.
  responses: [infoExtensionsResponse],
  errors: "undocumented",
  notes: [
    "One operation of the legacy proxyapi.php reqtype catalogue (reqtype=INFO, info=EXTENSIONS). Full audit: source-docs/proxy-api/info.md.",
    "1com's production path is /pbx/proxyapi.php. The vendor's own documentation examples use /mirtapbx/proxyapi.php; only the 1com path is used in this portal.",
    "The source shows three usage patterns only by example: list every extension (tenant only), filter by id, or filter by number. Whether id and number can be combined, and how the list is paginated, is not documented.",
    "Response formats are observed, not vendor-documented (source-docs/DOCS_AUDIT.md A-40): the default is a pipe-delimited plain-text table (content type text/html); format=json returns a JSON array. format=xml and format=csv returned an empty body for this operation, so they are not offered.",
    "In Live mode the portal returns only the six fields documented above for format=json, and redacts credential-like values (passwords, 2FA parameters, PINs) in either format before the response reaches your browser. Your own integration receives the full upstream record.",
    "An earlier sample (source-docs/observed/info-extensions.json, U-11) showed an object keyed by ex_id; it matches neither observed format and is superseded.",
  ],
  related: [],
};

// --- INFO / agents (Phase 5 adjustment; user-supplied operation, A-43) ---

const agentsQueueParam: Parameter = {
  name: "queue",
  location: "query",
  type: "string",
  required: "undocumented",
  description:
    "Queue identifier to list agents for. Not documented by the source for this operation (the operation itself is only named in the INFO purpose line). Observed (A-43): a nonexistent queue returns the JSON literal null; omitting it returned the same agents as the tenant's one queue on the test tenant.",
  example: "281",
  constraints: "Digits only (enforced by this portal's Live proxy).",
  source: "source-docs/DOCS_AUDIT.md#a-43",
};

const agentsFormatParam: Parameter = {
  ...formatParam,
  description:
    "Output format. Observed (A-43): the default is plain (`<agent>:<State>|` pairs on one line); json returns an object keyed by agent. xml and csv returned an empty body, so they are not offered.",
};

// Observed 2026-09-25 by a structure-only probe (A-43). Upstream returns
// positional records: numeric string keys with 3 and 9 absent. Meanings are
// not documented; descriptions state observed values only.
const agentRecordSchema: Parameter[] = [
  { name: "0", location: "body", type: "string", required: true, description: "Meaning not documented. Observed: \"0\"." },
  { name: "1", location: "body", type: "string", required: true, description: "Meaning not documented. Observed: \"available\"." },
  { name: "2", location: "body", type: "string", required: true, description: "Meaning not documented. Observed: \"UNAVAILABLE\" (resembles a device state)." },
  ...["4", "5", "6", "7", "8"].map(
    (name): Parameter => ({ name, location: "body", type: "string", required: true, description: "Meaning not documented. Observed: empty string." }),
  ),
  { name: "10", location: "body", type: "string", required: true, description: "Meaning not documented. Observed: equal to the agent key." },
  { name: "11", location: "body", type: "string", required: true, description: "Meaning not documented. Observed: equal to the agent key." },
];

const agentExample = (key: string) => ({
  "0": "0",
  "1": "available",
  "2": "UNAVAILABLE",
  "4": "",
  "5": "",
  "6": "",
  "7": "",
  "8": "",
  "10": key,
  "11": key,
});

const infoAgentsResponse: ResponseSpec = {
  status: 200,
  description:
    "With format=json: a JSON object keyed by agent (observed shape `<extension>-<tenant>`), each value a positional record with numeric keys. A nonexistent queue returns null. Without format (or format=plain): one text line of `<agent>:<State>|` pairs, with no header row.",
  format: "json",
  // Structure observed by probe; example values are synthetic.
  evidence: "observed-sanitized",
  // Structure re-confirmed through the portal's Live proxy (2026-09-25).
  verified: true,
  source: "source-docs/DOCS_AUDIT.md#a-43",
  schema: [
    {
      name: "{agent}",
      location: "body",
      type: "object",
      required: true,
      description: "One entry per agent, keyed by the agent identifier.",
      children: agentRecordSchema,
    },
  ],
  example: { "201-TENANTCODE": agentExample("201-TENANTCODE"), "300-TENANTCODE": agentExample("300-TENANTCODE") },
};

const infoAgents: Endpoint = {
  id: "info-agents",
  api: "proxy",
  version: "legacy",
  category: "info",
  status: "legacy",
  deprecation: legacyDeprecation,
  method: "GET",
  methodBasis: "inferred",
  path: "/pbx/proxyapi.php",
  fixedQuery: { reqtype: "INFO", info: "agents" },
  title: "List queue agents",
  summary: "Returns the agents of a queue with their current state.",
  sourceUrl: SOURCE_PAGE,
  verification: { documented: false, implemented: true, tested: true, verified: false },
  authentication: auth,
  headers: [],
  pathParameters: [],
  queryParameters: [tenantParam, agentsQueueParam, agentsFormatParam],
  requestBody: null,
  responses: [infoAgentsResponse],
  errors: "undocumented",
  notes: [
    "Not exemplified by the vendor documentation: the INFO operation list names \"agents\" without an example. This operation was supplied by 1com and characterised by observation only (source-docs/DOCS_AUDIT.md A-43).",
    "The info value is case-insensitive in observation (agents and AGENTS returned the same body).",
    "Errors are not signalled by HTTP status: a nonexistent queue returns HTTP 200 with the body null.",
    "Field meanings are not documented. Records use numeric keys; the Live proxy returns only the positions observed so far (0, 1, 2, 4–8, 10, 11).",
  ],
  related: [],
};

// --- INFO / DIDS (Phase 6, A-53) ---

const didsFormatParam: Parameter = {
  name: "format",
  location: "query",
  type: "string",
  required: "undocumented",
  enum: ["plain", "json", "csv"],
  description:
    "Output format. Observed (A-53): the default is plain (an 11-column pipe-delimited table); json returns an array where each upstream item also carries the whole tenant record (this portal shows only the DID's own fields); csv returned an empty body on the tenant tested.",
  source: "source-docs/DOCS_AUDIT.md#a-53",
};

// Observed 2026-09-25 (A-53), structure only. The real record also carries
// about 174 positional duplicate keys and the entire tenant row (te_*,
// including recording credentials and billing codes); neither is shown
// here — only the DID's own core fields, matching the plain-format
// columns (user decision, 2026-09-25).
const didItemSchema: Parameter[] = [
  { name: "di_country", location: "body", type: "string", required: true, description: "Country code prefix. Empty in every record observed." },
  { name: "di_area", location: "body", type: "string", required: true, description: "Area code. Empty in every record observed." },
  { name: "di_number", location: "body", type: "string", required: true, description: "The DID number." },
  { name: "di_comment", location: "body", type: "string", required: true, description: "Free-text comment on the DID." },
  { name: "di_recording", location: "body", type: "string", required: true, description: "Whether calls to this DID are recorded. Observed values: yes, empty string." },
  { name: "di_faxstationid", location: "body", type: "string", required: true, description: "Fax station identifier." },
  { name: "di_fax_email", location: "body", type: "string", required: true, description: "Email address for incoming faxes. Empty in every record observed." },
  { name: "di_maxchannels", location: "body", type: "string", required: true, description: "Maximum simultaneous channels for this DID, or -1 for unlimited (observed)." },
  { name: "di_emailrecording", location: "body", type: "string", required: true, description: "Email address for call recordings. Empty in every record observed." },
  { name: "di_smsemail", location: "body", type: "string", required: true, description: "Email address for incoming SMS. Empty in every record observed." },
];

const infoDidsResponse: ResponseSpec = {
  status: 200,
  description:
    "With format=json: a JSON array, one object per DID. Shown here: the ten fields this portal returns; the upstream record has about 348 keys, including the whole tenant record (recording credentials, billing codes), which this portal never surfaces. Without format (or format=plain): an 11-column pipe-delimited table with a header row (Country|Area|Number|Tenant|Comment|Recording|Faxstation ID|FAX Email|Max Channels|Recording EMail|SMS Email). format=csv returned an empty body on the tenant tested.",
  format: "json",
  evidence: "observed-sanitized",
  verified: true,
  source: "source-docs/DOCS_AUDIT.md#a-53",
  schema: [
    { name: "[ ]", location: "body", type: "object", required: true, description: "One item per DID.", children: didItemSchema },
  ],
  example: [
    { di_country: "", di_area: "", di_number: "5550101010", di_comment: "Main line", di_recording: "yes", di_faxstationid: "Fax Station", di_fax_email: "", di_maxchannels: "-1", di_emailrecording: "", di_smsemail: "" },
  ],
};

const infoDids: Endpoint = {
  id: "info-dids",
  api: "proxy",
  version: "legacy",
  category: "info",
  status: "legacy",
  deprecation: legacyDeprecation,
  method: "GET",
  methodBasis: "inferred",
  path: "/pbx/proxyapi.php",
  fixedQuery: { reqtype: "INFO", info: "DIDS" },
  title: "List DIDs",
  summary: "Returns the DIDs (phone numbers) configured for a tenant.",
  sourceUrl: NEW_SOURCE_SITE,
  verification: { documented: true, implemented: true, tested: true, verified: false },
  authentication: auth,
  headers: [],
  pathParameters: [],
  queryParameters: [tenantParam, didsFormatParam],
  requestBody: null,
  responses: [infoDidsResponse],
  errors: "undocumented",
  notes: [
    "One operation of the Proxy API INFO reqtype (info=DIDS). Full audit: source-docs/proxy-api/info.md.",
    "Omitting tenant may return every tenant's DIDs with an admin key (the source shows this by example), but that form is not offered or tested here — see source-docs/unresolved.md U-12/U-13 (base host and tenant-placeholder ambiguity).",
    "Response formats are observed, not vendor-documented for their exact shape (source-docs/DOCS_AUDIT.md A-53): the default is a pipe-delimited plain-text table (content type text/html); format=json returns a JSON array; format=csv returned an empty body on the tenant tested.",
    "format=json here shows only the DID's own fields, never the joined tenant record the real API also returns in the same item.",
    "Not offered on Live: src/server/playground/allowlist.ts has no entry for this operation. Adding one is a separate security decision (Phase 7).",
  ],
  related: [],
};

// --- INFO / SIMPLECDRS (Phase 6, A-49/A-54) ---

const simplecdrsPhoneParam: Parameter = {
  name: "phone",
  location: "query",
  type: "string",
  required: "undocumented",
  description:
    "Filters by caller, dialed, or answered number (source-docs/proxy-api/info.md); comma-separated for multiple values (documented, not independently tested). Observed (A-49): a value matching no call returns an empty 200 body, not [].",
  source: "source-docs/proxy-api/info.md",
};

const simplecdrsStartParam: Parameter = {
  name: "start",
  location: "query",
  type: "string",
  required: "undocumented",
  description: "Start date/time filter, observed as YYYY-MM-DD.",
  example: "2026-01-01",
  source: "source-docs/proxy-api/info.md",
};

const simplecdrsEndParam: Parameter = {
  ...simplecdrsStartParam,
  name: "end",
  description: "End date/time filter, observed as YYYY-MM-DD.",
  example: "2026-01-31",
};

const simplecdrsFormatParam: Parameter = {
  name: "format",
  location: "query",
  type: "string",
  required: "undocumented",
  enum: ["json", "csv"],
  description:
    "Output format. Observed (A-49): json returns an array (each record's fields also duplicated under bare positional keys); csv returns the same fields as a comma-separated table. Default/plain is not offered here: its real structure is only partially decoded from a masked capture (A-54) and is not reproduced without confidence.",
  source: "source-docs/DOCS_AUDIT.md#a-54",
};

const simplecdrsItemSchema: Parameter[] = [
  { name: "sc_te_id", location: "body", type: "string", required: true, description: "Internal tenant identifier." },
  { name: "tenantcode", location: "body", type: "string", required: true, description: "Tenant short code." },
  { name: "sc_start", location: "body", type: "string", required: true, description: "Call start time, \"YYYY-MM-DD HH:MM:SS\"." },
  { name: "sc_direction", location: "body", type: "string", required: true, description: "Observed values: IN, OUT, LOCAL." },
  { name: "sc_calleridnum", location: "body", type: "string", required: true, description: "Caller number." },
  { name: "sc_calleridname", location: "body", type: "string", required: true, description: "Caller name, when known; often empty." },
  { name: "sc_dialednum", location: "body", type: "string", required: true, description: "Dialed number." },
  { name: "sc_disposition", location: "body", type: "string", required: true, description: "Observed values: ANSWERED, NO ANSWER, FAILED, CONGESTION." },
  { name: "sc_duration", location: "body", type: "string", required: true, description: "Call duration in seconds." },
  { name: "sc_uniqueid", location: "body", type: "string", required: true, description: "Unique call identifier." },
  { name: "sc_whoanswered", location: "body", type: "string", required: true, description: "Extension that answered, when applicable; often empty." },
];

const infoSimplecdrsResponse: ResponseSpec = {
  status: 200,
  description:
    "With format=json: a JSON array, one object per call; every field also appears a second time under a bare positional key (\"0\"..\"10\", same order as listed here) — observed, not vendor-documented (A-49). With format=csv: the same 11 named fields as a comma-separated table with a header row; values containing a space are quoted. No matching calls returns an empty 200 body, not [] (A-49). A default/plain format exists but is not reproduced here — see A-54.",
  format: "json",
  evidence: "observed-sanitized",
  verified: true,
  source: "source-docs/DOCS_AUDIT.md#a-49",
  schema: [
    {
      name: "[ ]",
      location: "body",
      type: "object",
      required: true,
      description: "One item per call, plus the same 11 fields duplicated under bare positional keys.",
      children: simplecdrsItemSchema,
    },
  ],
  example: [
    {
      sc_te_id: "9001",
      tenantcode: "TENANTCODE",
      sc_start: "2026-01-15 09:30:00",
      sc_direction: "IN",
      sc_calleridnum: "5550101001",
      sc_calleridname: "Caller One",
      sc_dialednum: "201",
      sc_disposition: "ANSWERED",
      sc_duration: "42",
      sc_uniqueid: "demo01-1768469400.1001",
      sc_whoanswered: "201-TENANTCODE",
    },
  ],
};

const infoSimplecdrs: Endpoint = {
  id: "info-simplecdrs",
  api: "proxy",
  version: "legacy",
  category: "info",
  status: "legacy",
  deprecation: legacyDeprecation,
  method: "GET",
  methodBasis: "inferred",
  path: "/pbx/proxyapi.php",
  fixedQuery: { reqtype: "INFO", info: "SIMPLECDRS" },
  title: "List calls (simplified)",
  summary: "Returns call records from the simplified call-history source, optionally filtered by phone number and date range.",
  sourceUrl: NEW_SOURCE_SITE,
  verification: { documented: true, implemented: true, tested: true, verified: false },
  authentication: auth,
  headers: [],
  pathParameters: [],
  queryParameters: [tenantParam, simplecdrsPhoneParam, simplecdrsStartParam, simplecdrsEndParam, simplecdrsFormatParam],
  requestBody: null,
  responses: [infoSimplecdrsResponse],
  errors: "undocumented",
  notes: [
    "One operation of the Proxy API INFO reqtype (info=SIMPLECDRS). Full audit: source-docs/proxy-api/info.md.",
    "The source also names id/uniqueid/calleridnum/calleridname/disposition/direction/whoanswered as filter parameters (source-docs/proxy-api/info.md); only phone, start and end are offered here, matching what was actually characterised (A-49).",
    "Response formats are observed, not vendor-documented for their exact shape (source-docs/DOCS_AUDIT.md A-49, A-54): format=json and format=csv are well understood; a default/plain table exists but is not offered here because its structure could only be partially decoded from a masked capture (A-54).",
    "Not offered on Live: src/server/playground/allowlist.ts has no entry for this operation. Adding one is a separate security decision (Phase 7).",
  ],
  related: [],
};

const queuelogsQueueParam: Parameter = {
  ...agentsQueueParam,
  description:
    "Queue identifier. The source names it for queue logs (Doc line 151: \"queue id requested for agents info or queue logs\"). Whether it actually narrows the result was not observed (A-50): a nonexistent queue returned the same empty result as every other request on the test tenant.",
  source: "source-docs/DOCS_AUDIT.md#a-50",
};

const queuelogsStartParam: Parameter = {
  ...simplecdrsStartParam,
  description: "Start date/time filter (Doc lines 152–153). Its effect on this operation was not observed (A-50).",
  source: "source-docs/proxy-api/info.md",
};

const queuelogsEndParam: Parameter = {
  ...simplecdrsEndParam,
  description: "End date/time filter (Doc lines 152–153). Its effect on this operation was not observed (A-50).",
  source: "source-docs/proxy-api/info.md",
};

const queuelogsFormatParam: Parameter = {
  name: "format",
  location: "query",
  type: "string",
  required: "undocumented",
  enum: ["json", "csv"],
  description:
    "Output format. json returns an array of records, each field also duplicated under a bare positional key (observed from one user-supplied record, A-50). csv is the Site's own example format; only its empty result (0 bytes) has been observed. The default format's structure with data is unknown and is not offered here.",
  source: "source-docs/DOCS_AUDIT.md#a-50",
};

const queuelogsItemSchema: Parameter[] = [
  { name: "time", location: "body", type: "string", required: true, description: "Event time, \"YYYY-MM-DD HH:MM:SS\"." },
  { name: "qu_name", location: "body", type: "string", required: true, description: "Queue name." },
  { name: "callerid", location: "body", type: "string", required: true, description: "Caller number." },
  { name: "disposition", location: "body", type: "string", required: true, description: "Observed value: ABANDONED. Other values not yet observed." },
  { name: "agent", location: "body", type: "string", required: false, description: "Agent who took the call; null when abandoned." },
  { name: "holdtime", location: "body", type: "string", required: true, description: "Seconds the caller waited in the queue." },
  { name: "calltime", location: "body", type: "string", required: false, description: "Talk time in seconds; null when abandoned." },
  { name: "origpos", location: "body", type: "string", required: true, description: "Caller's original position in the queue." },
  { name: "callid", location: "body", type: "string", required: true, description: "Call identifier, \"<host>-<epoch>.<seq>\"." },
  {
    name: "ex_id … ex_pinlocked",
    location: "body",
    type: "string",
    required: false,
    description:
      "147 fields: the answering agent's full extension row, same names as info=EXTENSIONS json (A-51). Null in the only record observed (an abandoned call). Includes credential fields, which is why this operation is not offered on Live (A-55, docs/SECURITY.md SEC-REQ-01).",
  },
];

const infoQueuelogsResponse: ResponseSpec = {
  status: 200,
  description:
    "With format=json: a JSON array, one object per queue event; 156 named fields, each also under a bare positional key (\"0\"..\"155\", same order). Observed from a single user-supplied record, an abandoned call (A-50). No data: format=json returns the single byte ] (invalid JSON); csv and default return an empty body (A-50). The example is truncated: it shows the 9 queue-log fields and the first ex_* field only, without the positional keys.",
  format: "json",
  evidence: "observed-sanitized",
  verified: true,
  source: "source-docs/DOCS_AUDIT.md#a-50",
  schema: [
    {
      name: "[ ]",
      location: "body",
      type: "object",
      required: true,
      description: "One item per queue event, plus every field duplicated under a bare positional key.",
      children: queuelogsItemSchema,
    },
  ],
  example: [
    {
      time: "2026-01-15 09:31:12",
      qu_name: "Demo Support Queue",
      callerid: "5550101003",
      disposition: "ABANDONED",
      agent: null,
      holdtime: "31",
      calltime: null,
      origpos: "1",
      callid: "demo01-1768469472.1003",
      ex_id: null,
    },
  ],
};

const infoQueuelogs: Endpoint = {
  id: "info-queuelogs",
  api: "proxy",
  version: "legacy",
  category: "info",
  status: "legacy",
  deprecation: legacyDeprecation,
  method: "GET",
  methodBasis: "inferred",
  path: "/pbx/proxyapi.php",
  fixedQuery: { reqtype: "INFO", info: "QUEUELOGS" },
  title: "List queue calls",
  summary: "Returns the queue log: calls processed by a tenant's queues, with wait time, position and outcome.",
  sourceUrl: NEW_SOURCE_SITE,
  verification: { documented: true, implemented: true, tested: false, verified: false },
  authentication: auth,
  headers: [],
  pathParameters: [],
  queryParameters: [tenantParam, queuelogsQueueParam, queuelogsStartParam, queuelogsEndParam, queuelogsFormatParam],
  requestBody: null,
  responses: [infoQueuelogsResponse],
  errors: "undocumented",
  notes: [
    "One operation of the Proxy API INFO reqtype (info=QUEUELOGS). Full audit: source-docs/proxy-api/info.md.",
    "The response shape comes from one record supplied by the user (an abandoned call), not from the vendor documentation or a controlled probe (source-docs/DOCS_AUDIT.md A-50). Answered calls, other dispositions and csv/default output with data are not yet observed.",
    "Each record embeds the answering agent's extension row, including credential fields, duplicated under positional keys (A-55). Not offered on Live until docs/SECURITY.md SEC-REQ-01 is implemented and validated.",
  ],
  related: [],
};

// --- Phase 7 operations ---

export const infoRecording = proxyOperation({
  id: "info-recording",
  category: "info",
  operationClass: "read",
  fixedQuery: { reqtype: "INFO", info: "recording" },
  title: "Get a call recording",
  summary: "Returns the recording of one call, looked up by its unique id or by the call id a DIAL request returned.",
  source: "info.md",
  queryParameters: [
    q("id", "The call's unique id, or the originate id returned by DIAL (its third field).", { example: "srv02-1531779475.48" }),
    tenantParam,
  ],
  responses: [
    {
      status: 200,
      description: "The recording as a binary audio file. Implied by the source (\"get the recording for the call\"); the content type and audio format are not documented.",
      format: "binary",
      evidence: "vendor",
      verified: false,
      source: "source-docs/proxy-api/info.md",
    },
  ],
  verification: { documented: true, implemented: true, tested: true, verified: false },
  notes: [
    "info=playrecording takes the same parameters and asks the browser to play the recording instead of downloading it (Site line 155). info=inforecording returns the recording's metadata instead.",
    "One Site example omits tenant (a lookup by DIAL call id); the other sends it. Whether tenant is needed is not stated.",
    "Observed (A-60): without id, this operation returns the plain-text error \"No id specified\" (both with and without format=json) rather than the binary response above. The binary shape itself remains unconfirmed — a real recording id would be needed.",
  ],
});

export const infoPlayrecording = proxyOperation({
  id: "info-playrecording",
  category: "info",
  operationClass: "read",
  fixedQuery: { reqtype: "INFO", info: "playrecording" },
  title: "Play a call recording",
  summary: "Same lookup as \"Get a call recording\", but asks the browser to play the recording inline instead of downloading it.",
  source: "info.md",
  queryParameters: [
    q("id", "The call's unique id, or the originate id returned by DIAL.", { example: "srv02-1531779475.48" }),
    tenantParam,
  ],
  responses: [
    {
      status: 200,
      description: "The recording as binary audio, with response headers (not documented) intended to make the browser play it rather than download it.",
      format: "binary",
      evidence: "vendor",
      verified: false,
      source: "source-docs/proxy-api/info.md",
    },
  ],
  verification: { documented: true, implemented: true, tested: true, verified: false },
  notes: [
    "Site line 155: \"Based on your browser settings, you can force the browser to play the recording using the playrecording info parameter\" — the only difference from info=recording.",
    "Observed (A-60): without id, returns the same \"No id specified\" plain-text error as info=recording. The binary shape remains unconfirmed.",
  ],
  related: ["info-recording", "info-inforecording"],
});

export const infoInforecording = proxyOperation({
  id: "info-inforecording",
  category: "info",
  operationClass: "read",
  fixedQuery: { reqtype: "INFO", info: "inforecording" },
  title: "Get a call recording's metadata",
  summary: "Returns the metadata associated with a call's recording, without the audio itself.",
  source: "info.md",
  queryParameters: [
    q("id", "The call's unique id, or the originate id."),
    tenantParam,
  ],
  verification: { documented: true, implemented: true, tested: true, verified: false },
  responses: [
    {
      status: 200,
      description: "Observed (A-60): without id, the plain-text error \"No id specified\" (14 bytes), identical to info=recording/playrecording. Response shape with a real id is unknown.",
      format: "plain",
      evidence: "observed-sanitized",
      verified: true,
      source: "source-docs/DOCS_AUDIT.md#a-60",
    },
  ],
  notes: [
    "Doc-only purpose line (Doc line 127): \"get the metadata associated to the recording for the call (unique id or originated id)\". No example or response sample in either source.",
  ],
  related: ["info-recording", "info-playrecording"],
});

export const infoVoicemail = proxyOperation({
  id: "info-voicemail",
  category: "info",
  operationClass: "read",
  fixedQuery: { reqtype: "INFO", info: "voicemail" },
  title: "Get a voicemail message",
  summary: "Returns one voicemail message for a call, by the voicemail_messages table id.",
  source: "info.md",
  queryParameters: [
    q("id", "The voicemail_messages table id for this message."),
    tenantParam,
  ],
  responses: [
    {
      status: 200,
      description: "Presumed to be the message audio (implied by VOICEMAIL's own action=message, which the source documents as binary); not confirmed for this INFO form.",
      format: "binary",
      evidence: "vendor",
      verified: false,
      source: "source-docs/proxy-api/info.md",
    },
  ],
  notes: [
    "Doc-only purpose line (Doc line 130). No example or response sample in either source.",
    "Not probed and has no Demo fixture: the source does not say whether retrieving a message marks it read, and VOICEMAIL separately exposes markread/markunread actions — calling this to observe its response could silently change a real mailbox's state (user decision, Phase 7 Stage 1).",
  ],
});

export const infoVoicemailtranscript = proxyOperation({
  id: "info-voicemailtranscript",
  category: "info",
  operationClass: "read",
  fixedQuery: { reqtype: "INFO", info: "voicemailtranscript" },
  title: "Get a voicemail message transcript",
  summary: "Returns the transcript of one voicemail message, by the voicemail_messages table id.",
  source: "info.md",
  queryParameters: [
    q("id", "The voicemail_messages table id for this message."),
    tenantParam,
  ],
  verification: { documented: true, implemented: true, tested: true, verified: false },
  responses: [
    {
      status: 200,
      description: "Observed (A-61): an empty 200 body (0 bytes, text/plain) without id, for both the default and format=json requests. Response with a real id is unknown.",
      format: "plain",
      evidence: "observed-sanitized",
      verified: true,
      source: "source-docs/DOCS_AUDIT.md#a-61",
    },
  ],
  notes: ["Doc-only purpose line (Doc line 131). No response sample in either source."],
  related: ["info-voicemail"],
});

const queueStatsFieldNames = [
  "AGENTSAVAILABLE", "AGENTSPAUSED", "AGENTSFREE", "AGENTSONLINE", "CALLSINQUEUE",
  "SERVICELEVEL", "FIRSTWAITING", "SECONDWAITING", "THIRDWAITING", "CALLSONLINE",
  "TALKTIME", "HOLDTIME", "ANSWEREDCALLS", "CALLSRECEIVED", "REALANSWEREDCALLS",
  "TRANSFEREDCALLS", "ABANDONEDCALLS", "TIMEDOUTCALLS", "QUEUECAR", "EXITWITHKEYCALLS",
  "MAXHOLDTIME", "AVERAGETALKTIME", "AVERAGEHOLDTIME",
];

export const infoQueues = proxyOperation({
  id: "info-queues",
  category: "info",
  operationClass: "read",
  fixedQuery: { reqtype: "INFO", info: "queues" },
  title: "List queues",
  summary: "Returns the tenant's queues.",
  source: "info.md",
  queryParameters: [
    tenantParam,
    q("format", "Output format. Observed (A-56): the default is one line of pipe-delimited `<id>: <label>` pairs with no header; format=json (undocumented) returns an object keyed by queue id.", { required: false, enum: ["json"] }),
  ],
  verification: { documented: true, implemented: true, tested: true, verified: false },
  responses: [
    {
      status: 200,
      description: "With format=json (undocumented): an object keyed by queue id, each value the queue's name. Without format (or format=plain): one line of pipe-delimited `<id>: <label>` pairs, no header. Observed on a tenant with 38 queues.",
      format: "json",
      evidence: "observed-sanitized",
      verified: true,
      source: "source-docs/DOCS_AUDIT.md#a-56",
      schema: [{ name: "{queue-id}", location: "body", type: "string", required: true, description: "Queue name, keyed by the queue's id." }],
      example: { "281": "Sales", "282": "Support" },
    },
  ],
  notes: ["Doc-only purpose line (Doc line 120): \"list of queues\". No vendor response sample; response observed by probe (source-docs/DOCS_AUDIT.md A-56)."],
  related: ["info-queue"],
});

export const infoQueue = proxyOperation({
  id: "info-queue",
  category: "info",
  operationClass: "read",
  fixedQuery: { reqtype: "INFO", info: "queue" },
  title: "Get a queue",
  summary: "Returns one queue's info, by id.",
  source: "info.md",
  queryParameters: [
    q("id", "The queue's id."),
    tenantParam,
  ],
  verification: { documented: true, implemented: true, tested: true, verified: false },
  responses: [
    {
      status: 200,
      description: "A single queue-statistics object, both as a pipe-delimited positional row (default) and with the same field names via format=json (A-56). Observed with no id supplied — whether id actually filters to one queue, or is ignored, is not confirmed.",
      format: "json",
      evidence: "observed-sanitized",
      verified: true,
      source: "source-docs/DOCS_AUDIT.md#a-56",
      schema: queueStatsFieldNames.map((name): Parameter => ({
        name,
        location: "body",
        type: "string",
        required: true,
        description: "Meaning not documented beyond the field name.",
      })),
      example: Object.fromEntries(queueStatsFieldNames.map((name) => [name, "0"])),
    },
  ],
  notes: [
    "Doc-only purpose line (Doc line 121): \"info about the queue based on id\". No vendor response sample; response observed by probe (source-docs/DOCS_AUDIT.md A-56), called without an id.",
  ],
  related: ["info-queues"],
});

export const infoAgentsconnected = proxyOperation({
  id: "info-agentsconnected",
  category: "info",
  operationClass: "read",
  fixedQuery: { reqtype: "INFO", info: "agentsconnected" },
  title: "List currently connected queue agents",
  summary: "Returns the agents in all or one queue who are currently connected (on a call), narrower than the plain agents list.",
  source: "info.md",
  queryParameters: [
    tenantParam,
    q("queue", "Queue id to narrow the result to. Shared INFO param (Doc line 151).", { required: false }),
  ],
  verification: { documented: true, implemented: true, tested: true, verified: false },
  responses: [
    {
      status: 200,
      description: "With format=json (undocumented): an object keyed by extension number, each value itself an object keyed by a queue id mapping to an integer (meaning not documented). Without format: one line of pipe-delimited `<number>:<state>` pairs. Observed without a queue filter (tenant-wide).",
      format: "json",
      evidence: "observed-sanitized",
      verified: true,
      source: "source-docs/DOCS_AUDIT.md#a-57",
      schema: [
        {
          name: "{extension}",
          location: "body",
          type: "object",
          required: true,
          description: "One entry per extension.",
          children: [{ name: "{queue-id}", location: "body", type: "integer", required: true, description: "Meaning not documented." }],
        },
      ],
      example: { "2015550101": { "1": 0 } },
    },
  ],
  notes: [
    "Doc-only purpose line (Doc line 123): \"info about the agents in all or selected queue, but only if currently connected\". Response observed by probe (source-docs/DOCS_AUDIT.md A-57), not presumed from info=agents.",
  ],
  related: ["info-agents", "info-agentsdelay"],
});

export const infoAgentsdelay = proxyOperation({
  id: "info-agentsdelay",
  category: "info",
  operationClass: "read",
  fixedQuery: { reqtype: "INFO", info: "agentsdelay" },
  title: "List queue agents' answer delay",
  summary: "Returns answer-delay info for the agents in all or one queue.",
  source: "info.md",
  queryParameters: [
    tenantParam,
    q("queue", "Queue id to narrow the result to. Shared INFO param (Doc line 151).", { required: false }),
  ],
  verification: { documented: true, implemented: true, tested: true, verified: false },
  responses: [
    {
      status: 200,
      description: "With format=json (undocumented): an object keyed by queue id, each value itself an object keyed by agent number mapping to an integer (presumably a delay count or seconds; not documented). Without format: one line of pipe-delimited `<id>:<value>` pairs. Observed without a queue filter.",
      format: "json",
      evidence: "observed-sanitized",
      verified: true,
      source: "source-docs/DOCS_AUDIT.md#a-57",
      schema: [
        {
          name: "{queue-id}",
          location: "body",
          type: "object",
          required: true,
          description: "One entry per queue.",
          children: [{ name: "{agent}", location: "body", type: "integer", required: true, description: "Meaning not documented; presumed answer-delay related." }],
        },
      ],
      example: { "281": { "2015550101": 0 } },
    },
  ],
  notes: ["Doc-only purpose line (Doc line 124): \"info about the agents delay in answering in all or selected queue\". Response observed by probe (source-docs/DOCS_AUDIT.md A-57)."],
  related: ["info-agents", "info-agentsconnected"],
});

export const infoOutdialed = proxyOperation({
  id: "info-outdialed",
  category: "info",
  operationClass: "read",
  fixedQuery: { reqtype: "INFO", info: "outdialed" },
  title: "List calls dialed out by extensions",
  summary: "Returns info about calls dialed out by extensions.",
  source: "info.md",
  queryParameters: [tenantParam],
  verification: { documented: true, implemented: true, tested: true, verified: false },
  responses: [
    {
      status: 200,
      description: "Without format: an empty 200 body. With format=json (undocumented): an object keyed by a device/extension identifier, each value { STATE }. Observed keys were not always numeric extension numbers — some were free-text device labels, unlike EXTENSIONS/AGENTS/DIDS's stable numeric or `<number>-<tenant>` key shapes (source-docs/DOCS_AUDIT.md A-58).",
      format: "json",
      evidence: "observed-sanitized",
      verified: true,
      source: "source-docs/DOCS_AUDIT.md#a-58",
      schema: [
        {
          name: "{device}",
          location: "body",
          type: "object",
          required: true,
          description: "One entry per device/extension identifier (not guaranteed numeric).",
          children: [{ name: "STATE", location: "body", type: "string", required: true, description: "Device state. Observed value: NOT_INUSE." }],
        },
      ],
      example: { "201": { STATE: "NOT_INUSE" } },
    },
  ],
  notes: [
    "Doc-only purpose line (Doc line 125). No filter parameters beyond tenant are documented.",
    "This operation's json key space can include human-readable device labels, not just numeric extension identifiers (source-docs/DOCS_AUDIT.md A-58) — treat with extra caution before any future Live consideration, more like INFO CONFIG than like EXTENSIONS.",
  ],
});

export const infoCall = proxyOperation({
  id: "info-call",
  category: "info",
  operationClass: "read",
  fixedQuery: { reqtype: "INFO", info: "call" },
  title: "Get a call",
  summary: "Returns info about a call originated through this API, by the id or unique id the originating call returned.",
  source: "info.md",
  queryParameters: [
    q("id", "The call id or unique id returned by the originating request (e.g. DIAL's response, or CDR's uniqueid)."),
    tenantParam,
  ],
  notes: [
    "Doc-only purpose line (Doc line 126): \"info about the call originated with the api using the returned id or unique id\". No example or response sample in either source.",
    "A structure-only probe without an id timed out (30s) rather than returning a response (source-docs/DOCS_AUDIT.md A-59); a real call/unique id would be needed to observe the response shape, and none was available.",
  ],
});

export const infoConfig = proxyOperation({
  id: "info-config",
  category: "info",
  operationClass: "read",
  fixedQuery: { reqtype: "INFO", info: "config" },
  title: "Get tenant configuration",
  summary: "Returns info about the configured tenant.",
  source: "info.md",
  queryParameters: [tenantParam],
  verification: { documented: true, implemented: true, tested: true, verified: false },
  responses: [
    {
      status: 200,
      description: "Without format: a 7-field pipe-delimited positional row (the extra 4 fields' names/meanings are not established). With format=json (undocumented): only 3 named fields — a strict subset of the positional row, not a full mirror (source-docs/DOCS_AUDIT.md A-63).",
      format: "json",
      evidence: "observed-sanitized",
      verified: true,
      source: "source-docs/DOCS_AUDIT.md#a-63",
      schema: [
        { name: "maxchannels", location: "body", type: "string", required: true, description: "Maximum simultaneous channels, as a numeric string." },
        { name: "maxextensions", location: "body", type: "string", required: true, description: "Maximum extensions, as a numeric string." },
        { name: "maxdids", location: "body", type: "string", required: true, description: "Maximum DIDs, or -1 for unlimited (observed)." },
      ],
      example: { maxchannels: "50", maxextensions: "500", maxdids: "-1" },
    },
  ],
  notes: [
    "Doc-only purpose line (Doc line 135): \"get info about configured tenant\". Response observed by probe (source-docs/DOCS_AUDIT.md A-63).",
    "May return configuration fields not meant for display beyond the 3 shown here (the tenant record observed alongside other operations, e.g. INFO DIDS's json form, includes credential-like fields) — treat any future full characterisation of the positional row with the same field-level caution as EXTENSIONS/DIDS/QUEUELOGS.",
  ],
});

export const infoBalance = proxyOperation({
  id: "info-balance",
  category: "info",
  operationClass: "read",
  fixedQuery: { reqtype: "INFO", info: "balance" },
  title: "Get tenant balance",
  summary: "Returns the tenant's available credit.",
  source: "info.md",
  queryParameters: [tenantParam],
  verification: { documented: true, implemented: true, tested: true, verified: false },
  responses: [
    {
      status: 200,
      description: "A bare number (not wrapped in a JSON object or array), identically for the default and format=json requests (source-docs/DOCS_AUDIT.md A-65).",
      format: "plain",
      evidence: "observed-sanitized",
      verified: true,
      source: "source-docs/DOCS_AUDIT.md#a-65",
      example: "123.45",
    },
  ],
  notes: ["Doc-only purpose line (Doc line 149): \"get the credit available\". Response observed by probe (source-docs/DOCS_AUDIT.md A-65)."],
});

export const infoExtstate = proxyOperation({
  id: "info-extstate",
  category: "info",
  operationClass: "read",
  fixedQuery: { reqtype: "INFO", info: "EXTSTATE" },
  title: "Get an extension's state",
  summary: "Returns the state of one extension, including the number it is speaking with, if any.",
  source: "info.md",
  queryParameters: [
    q("ext", "The extension number.", { example: "500" }),
    tenantParam,
  ],
  verification: { documented: true, implemented: true, tested: true, verified: false },
  responses: [
    {
      status: 200,
      description: "Without format (or format=plain): a 2-byte whitespace-only body. With format=json (undocumented): { UniqueID: a 2-letter string, LinkedID: a string up to 24 chars observed }. Confirms a partial finding from an earlier interrupted Phase 6 probe (source-docs/DOCS_AUDIT.md A-62); observed without an ext value supplied.",
      format: "json",
      evidence: "observed-sanitized",
      verified: true,
      source: "source-docs/DOCS_AUDIT.md#a-62",
      schema: [
        { name: "UniqueID", location: "body", type: "string", required: true, description: "A short 2-letter code. Meaning not documented." },
        { name: "LinkedID", location: "body", type: "string", required: true, description: "A text value, up to 24 characters observed. Meaning not documented." },
      ],
      example: { UniqueID: "ab", LinkedID: "srv02-1531779475.48" },
    },
  ],
  notes: [
    "Doc purpose (Doc line 134): \"get the state of the extensions, including the number speaking with.\"",
    "Shares the Site's \"INFO - Flow\" section heading with info=FLOW, but is a distinct info value with its own ext parameter (FLOW uses id).",
  ],
  related: ["info-flow", "info-extensions"],
});

export const infoFlow = proxyOperation({
  id: "info-flow",
  category: "info",
  operationClass: "read",
  fixedQuery: { reqtype: "INFO", info: "FLOW" },
  title: "Get a flow's state",
  summary: "Returns the state of one call flow.",
  source: "info.md",
  queryParameters: [
    q("id", "The flow's id.", { example: "61" }),
    tenantParam,
  ],
  verification: { documented: true, implemented: true, tested: true, verified: false },
  responses: [
    {
      status: 200,
      description: "A single plain-text state word (11 bytes observed), identically for the default and format=json requests. Observed with no id supplied (source-docs/DOCS_AUDIT.md A-66) — not established whether this is a real single-flow state, a default/first flow, or a fixed value when id is absent.",
      format: "plain",
      evidence: "observed-sanitized",
      verified: true,
      source: "source-docs/DOCS_AUDIT.md#a-66",
      example: "NOT_INUSE",
    },
  ],
  notes: [
    "Site-only (Site line 112); not in the Doc's info value list.",
    "Compare FLOWS (all flows for a tenant) and SETFLOW (writes a flow's state).",
  ],
  related: ["flows", "setflow", "info-extstate"],
});

export const infoVariable = proxyOperation({
  id: "info-variable",
  category: "info",
  operationClass: "read",
  fixedQuery: { reqtype: "INFO", info: "variable" },
  title: "Get a variable's value",
  summary: "Returns the value of one dial-plan variable.",
  source: "info.md",
  queryParameters: [
    q("id", "The variable's id.", { example: "61" }),
    tenantParam,
  ],
  verification: { documented: true, implemented: true, tested: true, verified: false },
  responses: [
    {
      status: 200,
      description: "An empty 200 body (0 bytes) without id, for both the default and format=json requests (source-docs/DOCS_AUDIT.md A-67). Response with a real id is unknown.",
      format: "plain",
      evidence: "observed-sanitized",
      verified: true,
      source: "source-docs/DOCS_AUDIT.md#a-67",
    },
  ],
  notes: [
    "Site-only (Site line 116); not in the Doc's info value list.",
    "The Site's own example uses the alternate DEMO.1com.com/1com host form in its visible link text, not just its href target (source-docs/unresolved.md U-12) — reproduced here with the portal's canonical host instead.",
  ],
});

const cdrsFormatParam: Parameter = {
  name: "format",
  location: "query",
  type: "string",
  required: "undocumented",
  enum: ["csv", "xml"],
  description:
    "Output format (Doc line 137: csv, xml). The Site's own examples also show plain output with no format parameter at all.",
  source: "source-docs/proxy-api/info.md",
};

export const infoCdrs = proxyOperation({
  id: "info-cdrs",
  category: "info",
  operationClass: "read",
  fixedQuery: { reqtype: "INFO", info: "CDRS" },
  title: "List calls",
  summary: "Returns call records (CDRs), optionally filtered by phone number, id, or date range.",
  source: "info.md",
  queryParameters: [
    q("tenant", "Tenant code, or % for all tenants. The Site's all-tenant example uses a bare, non-percent-encoded %.", { example: "TENANTCODE" }),
    q("id", "Filters to one call. Doc line 137 lists id, uniqueid, src, firstdst and direction together as \"further parameters available\", without individually documenting them."),
    q("uniqueid", "Filters to one call by its unique id."),
    q("src", "Filters by source number. Meaning not further documented."),
    q("firstdst", "Filters by first destination. Meaning not further documented."),
    q("direction", "Filters by call direction. Accepted values not documented."),
    q("phone", "Filters across whoanswered, calleridnum and dialednum. Comma-separated for multiple values (Doc line 138)."),
    cdrsFormatParam,
    q("template", "Name of a server-defined XML output template (configured under Configuration/Settings → XML Template). Only meaningful with format=xml.", { example: "Test_CSV" }),
    q("start", "Start date/time filter (Doc lines 152-153).", { example: "2019-12-01" }),
    q("end", "End date/time filter (Doc lines 152-153).", { example: "2022-12-31" }),
  ],
  verification: { documented: true, implemented: true, tested: true, verified: false },
  responses: [
    {
      status: 200,
      description: "No CDR data was observed on the test tenant for any format: default, format=csv and format=xml all return an empty 200 body (0 bytes). format=json (undocumented) returns a single byte, `]` — a malformed/truncated empty-array artifact, the same pattern already seen on SIMPLECDRS and QUEUELOGS when they have no matching data (source-docs/DOCS_AUDIT.md A-64). The real column layout for csv/xml with data remains undocumented.",
      format: "plain",
      evidence: "observed-sanitized",
      verified: true,
      source: "source-docs/DOCS_AUDIT.md#a-64",
    },
  ],
  notes: [
    "Response column names/order are not documented for either CSV variant. Site line 194: getting the CSV for a single tenant uses \"the tenant\" format; for multiple tenants it uses \"the Admin\" format — two different, undocumented column layouts.",
    "The plain (no-format) response shown in the Site's own examples is not reproduced here: its structure is not independently characterised, unlike SIMPLECDRS.",
    "Compare SIMPLECDRS, a separate, simpler call-history source with its own (partially observed) shape.",
  ],
  related: ["info-simplecdrs", "cdr-get"],
});

export const infoCategory: Category = {
  id: "info",
  title: "INFO",
  endpoints: [
    infoExtensions,
    infoAgents,
    infoDids,
    infoSimplecdrs,
    infoQueuelogs,
    infoRecording,
    infoPlayrecording,
    infoInforecording,
    infoVoicemail,
    infoVoicemailtranscript,
    infoQueues,
    infoQueue,
    infoAgentsconnected,
    infoAgentsdelay,
    infoOutdialed,
    infoCall,
    infoConfig,
    infoBalance,
    infoExtstate,
    infoFlow,
    infoVariable,
    infoCdrs,
  ],
};