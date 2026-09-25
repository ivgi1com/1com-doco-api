import type { ApiDefinition, Authentication, Endpoint, Parameter, ResponseSpec } from "./types";

/**
 * Real content, hand-authored from source-docs/proxy-api/ — rebuilt
 * 2026-09-25 from 1com's own documentation (see
 * source-docs/proxy-api/README.md for the source and its conventions).
 * Every parameter/response/error state follows the no-guessing rule: what
 * the source does not say is marked `"undocumented"`, never invented.
 *
 * Scope: five read-only operations of the Proxy API `proxyapi.php`:
 * INFO/EXTENSIONS, INFO/AGENTS, CDR/GET (Phase 4/5 — CDR/GET's only
 * documentation is the now-historical MiRTA source; see
 * source-docs/proxy-api/cdr-standalone.md), and INFO/DIDS, INFO/SIMPLECDRS
 * (Phase 6, added below). The remaining reqtypes are audited in
 * source-docs/proxy-api/ but not implemented; see
 * docs/phases/07-proxy-api-rollout.md.
 */

// The historical MiRTA vendor page (Phase 3/4/5 evidence for the three
// endpoints below, superseded as the general source — DOCS_AUDIT.md SS10).
const SOURCE_PAGE =
  "https://manual.mirtapbx.com/books/api/page/old-proxyapi-legacy-proxy-api-reference-and-examples";

// The current source (Phase 6 rebuild) for the two endpoints added below.
const NEW_SOURCE_SITE = "https://sites.google.com/1com.co.il/1com-api/בית";

const auth: Authentication = {
  type: "API key",
  description:
    "Tenant API key, sent as a query parameter. A tenant read-only key is sufficient for this read-only operation.",
  location: "query",
  parameter: "key",
  scope: "Tenant key (read-only is sufficient)",
};

const tenantParam: Parameter = {
  name: "tenant",
  location: "query",
  type: "string",
  required: "undocumented",
  description:
    "Tenant code to scope the request to. The source states this is \"normally\" required for tenant-scoped calls, without documenting when it can be omitted.",
  example: "TENANTCODE",
  source: `${SOURCE_PAGE}#bkmrk-common-parameters`,
};

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
  deprecation: {
    note:
      "The vendor documentation for proxyapi.php recommends the OpenAPI endpoint for new integrations. OpenAPI-based Proxy API documentation is not yet available in this portal.",
  },
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
  deprecation: infoExtensions.deprecation,
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

// --- CDR / GET (userfield) (Phase 5 adjustment, A-42) ---

const uniqueidParam: Parameter = {
  name: "uniqueid",
  location: "query",
  type: "string",
  required: "undocumented",
  description:
    "Unique identifier of the call record (CDR). Format not documented; examples look like `srv02-1701011773.4670` (server prefix, epoch seconds, sequence).",
  example: "srv02-1701011773.4670",
  constraints: "Optional `<server>-` prefix, then `<digits>.<digits>` (enforced by this portal's Live proxy).",
  source: `${SOURCE_PAGE}#bkmrk-cdr-%2F-get-the-userfi`,
};

const cdrGetResponse: ResponseSpec = {
  status: 200,
  description:
    "The raw value of the CDR's userfield as text, with no wrapping or header (observed, A-42). The body is the same whatever format is requested; only the content type changes. A nonexistent, malformed or missing uniqueid returns HTTP 200 with an empty body.",
  format: "plain",
  evidence: "observed-sanitized",
  // Structure re-confirmed through the portal's Live proxy (2026-09-25).
  verified: true,
  source: "source-docs/DOCS_AUDIT.md#a-42",
  example: "example-userfield-value",
};

const cdrGet: Endpoint = {
  id: "cdr-get",
  api: "proxy",
  version: "legacy",
  category: "cdr",
  status: "legacy",
  deprecation: infoExtensions.deprecation,
  method: "GET",
  methodBasis: "inferred",
  path: "/pbx/proxyapi.php",
  fixedQuery: { reqtype: "CDR", action: "GET", field: "userfield" },
  title: "Get a call's userfield",
  summary: "Returns the userfield value of one call record (CDR).",
  sourceUrl: `${SOURCE_PAGE}#bkmrk-cdr-%2F-get-the-userfi`,
  verification: { documented: true, implemented: true, tested: true, verified: false },
  authentication: auth,
  headers: [],
  pathParameters: [],
  queryParameters: [tenantParam, uniqueidParam],
  requestBody: null,
  responses: [cdrGetResponse],
  errors: "undocumented",
  notes: [
    "One operation of the legacy CDR reqtype (action=GET). This reqtype has no coverage in the rebuilt 1com source (source-docs/unresolved.md U-15); its only documentation is the historical MiRTA evidence: source-docs/proxy-api/cdr-standalone.md.",
    "field is fixed to userfield in this portal: it is the only value the source shows, and other CDR columns (such as caller and callee numbers) are personal data.",
    "The userfield is free-form data written by your own integration. The portal cannot tell what it contains, so Live mode shows it as returned.",
    "Errors are not signalled by HTTP status: an unknown uniqueid returns HTTP 200 with an empty body (A-42).",
    "CDR action=UPDATE exists in the same reqtype and is not offered here.",
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
  deprecation: infoExtensions.deprecation,
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
  deprecation: infoExtensions.deprecation,
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
  deprecation: infoExtensions.deprecation,
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

export const proxyApi: ApiDefinition = {
  id: "proxy",
  name: "Proxy API",
  version: "legacy",
  baseUrl: "https://pbx6webserver.1com.co.il",
  synthetic: false,
  summary:
    "1com's HTTP API for MiRTA PBX (proxyapi.php). Six read-only operations are documented here; the remaining reqtypes are audited in source-docs/proxy-api/ pending a later phase.",
  categories: [
    // Grouped by reqtype (user decision, Phase 7 Stage 1): the source defines no categories.
    { id: "info", title: "INFO", endpoints: [infoExtensions, infoAgents, infoDids, infoSimplecdrs, infoQueuelogs] },
    { id: "cdr", title: "CDR", endpoints: [cdrGet] },
  ],
};
