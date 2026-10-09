import type { Category, Endpoint, Parameter, ResponseSpec } from "../types";
import { SOURCE_PAGE, auth, legacyDeprecation, tenantParam } from "./shared";

/**
 * reqtype=CDR (standalone) — not in the current 1com source (U-15); the
 * only documentation is historical MiRTA evidence
 * (source-docs/proxy-api/cdr-standalone.md). action=UPDATE is excluded
 * (operations.json).
 */
// --- CDR / GET (userfield) (Phase 5 adjustment, A-42) ---

const uniqueidParam: Parameter = {
  name: "uniqueid",
  location: "query",
  type: "string",
  required: "undocumented",
  description:
    "Unique identifier of the call record (CDR). Format not documented; examples look like `PBX-1701011773.4670` (server prefix, epoch seconds, sequence).",
  example: "PBX-1701011773.4670",
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
  deprecation: legacyDeprecation,
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
    "One operation of the legacy CDR reqtype (action=GET). This reqtype has no coverage in the rebuilt 1com source (source-docs/unresolved.md U-15); its only documentation is the historical documentation: source-docs/proxy-api/cdr-standalone.md.",
    "field is fixed to userfield in this portal: it is the only value shown in the examples, and other CDR columns (such as caller and callee numbers) are personal data.",
    "The userfield is free-form data written by your own integration. The portal cannot tell what it contains, so Live mode shows it as returned.",
    "Errors are not signalled by HTTP status: an unknown uniqueid returns HTTP 200 with an empty body (A-42).",
    "CDR action=UPDATE exists in the same reqtype and is not offered here.",
  ],
  related: [],
};

export const cdrCategory: Category = { id: "cdr", title: "CDR", endpoints: [cdrGet] };