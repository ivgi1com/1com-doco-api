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

const extensionEntrySchema: Parameter[] = [
  {
    name: "ex_id",
    location: "body",
    type: "string",
    required: true,
    description: "Internal extension identifier. Matches the object key this entry is stored under.",
  },
  {
    name: "ex_name",
    location: "body",
    type: "string",
    required: true,
    description: "Extension display name.",
  },
  {
    name: "ex_number",
    location: "body",
    type: "string",
    required: true,
    description: "Extension number, dialable within the tenant.",
  },
];

const infoExtensionsResponse: ResponseSpec = {
  status: 200,
  description:
    "An object keyed by each extension's internal id (ex_id), one entry per extension. Not a JSON array.",
  format: "json",
  evidence: "observed-sanitized",
  verified: true,
  source: "source-docs/observed/info-extensions.json",
  schema: [
    {
      name: "<ex_id>",
      location: "body",
      type: "object",
      required: true,
      description:
        "One entry per matching extension. The key is the extension's own ex_id, repeated inside the value.",
      children: extensionEntrySchema,
    },
  ],
  example: {
    "3272": { ex_id: "3272", ex_name: "REDACTED_NAME_1", ex_number: "201" },
    "155450": { ex_id: "155450", ex_name: "REDACTED_NAME_2", ex_number: "300" },
    "169430": { ex_id: "169430", ex_name: "REDACTED_NAME_3", ex_number: "301" },
  },
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
  verification: { documented: true, implemented: true, tested: false, verified: false },
  authentication: auth,
  headers: [],
  pathParameters: [],
  queryParameters: [tenantParam, idParam, numberParam],
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
    "The response is a JSON object keyed by each extension's ex_id, not an array. This shape is observed (source-docs/observed/info-extensions.json), not stated by the vendor documentation.",
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
