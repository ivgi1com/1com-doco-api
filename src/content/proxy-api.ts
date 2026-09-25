import type { ApiDefinition, Authentication, Endpoint, Parameter, ResponseSpec } from "./types";

/**
 * PHASE 4 VERTICAL SLICE — real content, hand-authored from the Phase 3
 * audit evidence (source-docs/proxy-api/info.yaml, source-docs/proxy-api/_common.yaml).
 * Every parameter/response/error state follows the no-guessing rule: what
 * the source does not say is marked `"undocumented"`, never invented.
 *
 * Scope: three operations of the legacy MiRTA PBX `proxyapi.php` reqtype
 * catalogue: INFO / EXTENSIONS (Phase 4), INFO / agents and CDR / GET
 * (Phase 5 adjustment, A-42/A-43). The rest are audited (source-docs/) but
 * not implemented; see docs/phases/07-proxy-api-rollout.md.
 */

const SOURCE_PAGE =
  "https://manual.mirtapbx.com/books/api/page/old-proxyapi-legacy-proxy-api-reference-and-examples";

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
  category: "extensions",
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
    "One operation of the legacy proxyapi.php reqtype catalogue (reqtype=INFO, info=EXTENSIONS). Full audit: source-docs/proxy-api/info.yaml.",
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
  category: "queues",
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
    "One operation of the legacy CDR reqtype (action=GET). Full audit: source-docs/proxy-api/cdr.yaml.",
    "field is fixed to userfield in this portal: it is the only value the source shows, and other CDR columns (such as caller and callee numbers) are personal data.",
    "The userfield is free-form data written by your own integration. The portal cannot tell what it contains, so Live mode shows it as returned.",
    "Errors are not signalled by HTTP status: an unknown uniqueid returns HTTP 200 with an empty body (A-42).",
    "CDR action=UPDATE exists in the same reqtype and is not offered here.",
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
    "1com's legacy HTTP API for MiRTA PBX (proxyapi.php). Three read-only operations are documented here; the remaining reqtypes are audited in source-docs/ pending a later phase.",
  categories: [
    { id: "extensions", title: "Extensions", endpoints: [infoExtensions] },
    { id: "queues", title: "Queues", endpoints: [infoAgents] },
    { id: "cdr", title: "Call records", endpoints: [cdrGet] },
  ],
};
