import type { Authentication, Deprecation, Endpoint, Parameter } from "../types";

/**
 * Shared building blocks for the Proxy API content (`proxyapi.php`), one
 * module per reqtype in this folder. Sources: source-docs/proxy-api/
 * (README.md has the source and its conventions). Every parameter,
 * response and error state follows the no-guessing rule: what the source
 * does not say is `"undocumented"`, never invented.
 */

// The historical MiRTA vendor page: Phase 3/4/5 evidence for info-extensions,
// info-agents and cdr-get; superseded as the general source (DOCS_AUDIT.md §10).
export const SOURCE_PAGE =
  "https://manual.mirtapbx.com/books/api/page/old-proxyapi-legacy-proxy-api-reference-and-examples";

// The current, authoritative 1com source (Site + linked Doc), rebuilt 2026-09-25.
export const NEW_SOURCE_SITE = "https://sites.google.com/1com.co.il/1com-api/בית";

// U-01/U-12: the only host and path used in this portal.
export const PROXY_BASE_URL = "https://pbx6webserver.1com.co.il";
export const PROXY_PATH = "/pbx/proxyapi.php";

export const legacyDeprecation: Deprecation = {
  note:
    "The vendor documentation for proxyapi.php recommends the OpenAPI endpoint for new integrations. OpenAPI-based Proxy API documentation is not yet available in this portal.",
};

/** U-09: decided for info-extensions (tenant key, read-only suffices); applied unchanged to the Phase 4–6 operations. */
export const auth: Authentication = {
  type: "API key",
  description:
    "Tenant API key, sent as a query parameter. A tenant read-only key is sufficient for this read-only operation.",
  location: "query",
  parameter: "key",
  scope: "Tenant key (read-only is sufficient)",
};

/** Key scope not stated by the source for this operation (U-09 remains open for the catalogue). */
export const authScopeUndocumented: Authentication = {
  type: "API key",
  description:
    "API key, sent as the key query parameter. The source says a key is either an Admin key or a Tenant key, and that tenant keys come in read/write and read-only kinds; it does not say which kind this operation requires.",
  location: "query",
  parameter: "key",
  scope: "Not documented",
};

/** Site line 225: "Any ManageDB action requires an admin key". */
export const authAdmin: Authentication = {
  type: "API key",
  description: "Admin API key, sent as the key query parameter. The source states that any ManageDB action requires an admin key.",
  location: "query",
  parameter: "key",
  scope: "Admin key",
};

export const tenantParam: Parameter = {
  name: "tenant",
  location: "query",
  type: "string",
  required: "undocumented",
  description:
    "Tenant code to scope the request to. The source states this is \"normally\" required for tenant-scoped calls, without documenting when it can be omitted.",
  example: "TENANTCODE",
  source: `${SOURCE_PAGE}#bkmrk-common-parameters`,
};

/** A query parameter; requirement `"undocumented"` unless the source states it. */
export function q(name: string, description: string, extra: Partial<Parameter> = {}): Parameter {
  return { name, location: "query", type: "string", required: "undocumented", description, ...extra };
}

/** A request-body field (inside `jsondata`/`values` for the Proxy API). */
export function b(name: string, description: string, extra: Partial<Parameter> = {}): Parameter {
  return { name, location: "body", type: "string", required: "undocumented", description, ...extra };
}

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

type OperationInput = WithRequired<
  Partial<Endpoint>,
  "id" | "category" | "fixedQuery" | "title" | "summary" | "operationClass" | "queryParameters" | "notes"
> & { source: string };

/**
 * Builds a Phase 7 Proxy operation with the defaults every documented-only
 * operation shares: legacy lifecycle, inferred GET, key scope not
 * documented, no response or errors documented, not tested. Callers
 * override only what the source actually says.
 */
export function proxyOperation({ source, ...o }: OperationInput): Endpoint {
  return {
    api: "proxy",
    version: "legacy",
    status: "legacy",
    deprecation: legacyDeprecation,
    method: "GET",
    methodBasis: "inferred",
    path: PROXY_PATH,
    sourceUrl: NEW_SOURCE_SITE,
    verification: { documented: true, implemented: true, tested: false, verified: false },
    authentication: authScopeUndocumented,
    headers: [],
    pathParameters: [],
    requestBody: null,
    responses: [],
    errors: "undocumented",
    related: [],
    ...o,
    notes: [...o.notes, `Source: source-docs/proxy-api/${source}.`],
  };
}
