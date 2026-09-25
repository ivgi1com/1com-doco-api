import type { ApiDefinition, Authentication, Endpoint, Parameter, ResponseSpec } from "./types";

/**
 * PHASE 4 VERTICAL SLICE — real content, hand-authored from the Phase 3
 * audit evidence (source-docs/proxy-api/info.yaml, source-docs/proxy-api/_common.yaml).
 * Every parameter/response/error state follows the no-guessing rule: what
 * the source does not say is marked `"undocumented"`, never invented.
 *
 * Scope: one operation (INFO / EXTENSIONS) of the legacy MiRTA PBX
 * `proxyapi.php` reqtype catalogue. The remaining 38 reqtypes are audited
 * (source-docs/) but not implemented; see docs/phases/07-proxy-api-rollout.md.
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

export const proxyApi: ApiDefinition = {
  id: "proxy",
  name: "Proxy API",
  version: "legacy",
  baseUrl: "https://pbx6webserver.1com.co.il",
  synthetic: false,
  summary:
    "1com's legacy HTTP API for MiRTA PBX (proxyapi.php). One real endpoint is documented here as the Phase 4 vertical slice; the remaining reqtypes are audited in source-docs/ pending a later phase.",
  categories: [{ id: "extensions", title: "Extensions", endpoints: [infoExtensions] }],
};
