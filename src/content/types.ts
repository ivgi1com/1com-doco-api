/**
 * Normalized, API-neutral content model (docs/API_CONTENT_MODEL.md).
 * Covers REST APIs and reqtype-style APIs (one path, operation selected by
 * fixed query parameters). "undocumented" states exist so the portal never
 * has to guess what the source does not say.
 */

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type Lifecycle = "stable" | "experimental" | "deprecated" | "legacy";

export type ParameterLocation = "path" | "query" | "header" | "body";

/** `"undocumented"`: the source does not say whether the parameter is required. */
export type Requirement = boolean | "undocumented";

export type ResponseFormat = "json" | "xml" | "csv" | "plain" | "binary";

/**
 * Where a response example comes from. Only `synthetic` examples may be
 * replayed by Demo mode; `observed-sanitized` is real traffic with identifying
 * values replaced, published as evidence only.
 */
export type Evidence = "vendor" | "observed-sanitized" | "synthetic";

export interface Verification {
  documented: boolean;
  implemented: boolean;
  tested: boolean;
  verified: boolean;
}

export interface Parameter {
  name: string;
  location: ParameterLocation;
  type: string;
  required: Requirement;
  description: string;
  default?: string;
  enum?: string[];
  example?: string | number | boolean;
  constraints?: string;
  /** Condition under which the field is present, e.g. "Only when status is completed". */
  condition?: string;
  /**
   * Set only where the source documents an exact date or date-time format
   * (`date`: `YYYY-MM-DD`; `datetime`: `YYYY-MM-DD HH:MM:SS`). The Playground
   * then offers a picker that composes that exact string (Phase 8E).
   */
  format?: "date" | "datetime";
  children?: Parameter[];
  source?: string;
}

export interface ResponseSpec {
  status: number;
  description: string;
  schema?: Parameter[];
  example?: unknown;
  format?: ResponseFormat;
  evidence?: Evidence;
  headers?: Parameter[];
  source?: string;
  verified: boolean;
}

export interface Authentication {
  type: string;
  description: string;
  /** Where the credential travels. Code samples follow this; defaults to header. */
  location?: "header" | "query";
  /**
   * Header or query-parameter name carrying the credential, e.g. "key" or
   * "X-API-Key". With header auth and no parameter, samples send
   * `Authorization: Bearer`.
   */
  parameter?: string;
}

export interface ErrorSpec {
  /** `"undocumented"`: the source names the error code but not its HTTP status. */
  status: number | "undocumented";
  code: string;
  description: string;
}

/**
 * How the request body travels. `json` (the default when omitted) is a
 * JSON document body. `form-json-field` is an
 * `application/x-www-form-urlencoded` body with one field whose value is
 * the JSON-encoded `requestExample` (Proxy API ManageDB `jsondata=`,
 * PHONEBOOK `values=`). `multipart` uploads one file under `fileField`.
 */
export type RequestBodyEncoding =
  | { kind: "json" }
  | { kind: "form-json-field"; field: string }
  | { kind: "multipart"; fileField: string; exampleFile: string };

/**
 * `write`: changes state (places a call, edits configuration, deletes
 * data). Write operations are Reference-only: the Playground never sends
 * them, in Live or Demo. Omitted means read.
 */
export type OperationClass = "read" | "write";

export interface Deprecation {
  date?: string;
  replacement?: string;
  note?: string;
}

export interface Endpoint {
  /** URL slug, unique within an API. */
  id: string;
  api: string;
  version: string;
  category: string;
  status: Lifecycle;
  deprecation?: Deprecation;
  method: HttpMethod;
  /** `inferred`: the source never states the method; it is read from its examples. */
  methodBasis?: "documented" | "inferred";
  path: string;
  /**
   * Query parameters with fixed values that select the operation on a shared
   * path (e.g. `{ reqtype: "INFO", info: "EXTENSIONS" }`). Always sent; not editable.
   */
  fixedQuery?: Record<string, string>;
  title: string;
  summary: string;
  sourceUrl?: string;
  verification: Verification;
  authentication: Authentication;
  headers: Parameter[];
  pathParameters: Parameter[];
  queryParameters: Parameter[];
  requestBody: Parameter[] | null;
  /** Example request body used by code samples and the Playground. An array for list-shaped bodies (e.g. ManageDB destination tags). */
  requestExample?: Record<string, unknown> | unknown[];
  requestBodyEncoding?: RequestBodyEncoding;
  operationClass?: OperationClass;
  responses: ResponseSpec[];
  /** `"undocumented"`: the source documents no errors; shown as such, never invented. */
  errors: ErrorSpec[] | "undocumented";
  /** Source caveats and interpretation notes shown in a Notes section. */
  notes?: string[];
  related: string[];
}

/**
 * A named request example taken from the official source page (title,
 * description, and the request it shows), with real-looking values
 * normalized. Shown in the Reference; the code sample is rendered from
 * these fields, never copied, so it always uses the portal's base URL and
 * auth convention. `path` is literal (placeholders already substituted).
 */
export interface EndpointExample {
  title: string;
  description: string;
  path: string;
  query: Record<string, string>;
  body?: Record<string, unknown> | unknown[];
  /** Which key the source's example uses: a tenant key or a global key. */
  keyKind: "tenant" | "global";
  source: string;
}

export interface Category {
  id: string;
  title: string;
  endpoints: Endpoint[];
}

/** Several categories shown as one side-menu entry (menu only; ids, URLs and Live policy are unaffected). */
export interface MenuGroupDefinition {
  title: string;
  /** Member category ids, in display order. */
  categories: string[];
}

/** One side-menu entry: a group of one or more categories. */
export interface MenuGroup {
  /** The first member's category id: stable key for open/closed state. */
  id: string;
  title: string;
  categories: Category[];
}

export interface ApiDefinition {
  id: string;
  name: string;
  version: string;
  baseUrl: string;
  /** True for fabricated prototype content that must be labelled as such. */
  synthetic: boolean;
  /** Older API kept for existing integrations; selectors show a "legacy" qualifier. */
  legacy?: boolean;
  /** Endpoint id the Playground opens on for this API; falls back to the first endpoint. */
  defaultEndpoint?: string;
  /** Shown on the API overview page. */
  summary: string;
  categories: Category[];
  /** Category ids shown first in the side menus, in this order; the rest keep their order. */
  menuOrder?: string[];
  /** Category ids left out of the side menus and search (pages and routes are unaffected). */
  menuHidden?: string[];
  /** Related categories shown under one menu entry; the group sits where its first member would. */
  menuGroups?: MenuGroupDefinition[];
}
