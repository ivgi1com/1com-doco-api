/**
 * Normalized, API-neutral content model (docs/API_CONTENT_MODEL.md).
 * Phase 2 draft: shape is exercised by the prototype only. It is finalized
 * against real Proxy API evidence in Phases 3–4.
 */

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type Lifecycle = "stable" | "experimental" | "deprecated" | "legacy";

export type ParameterLocation = "path" | "query" | "header" | "body";

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
  required: boolean;
  description: string;
  default?: string;
  enum?: string[];
  example?: string | number | boolean;
  constraints?: string;
  /** Condition under which the field is present, e.g. "Only when status is completed". */
  condition?: string;
  children?: Parameter[];
  source?: string;
}

export interface ResponseSpec {
  status: number;
  description: string;
  schema?: Parameter[];
  example?: unknown;
  headers?: Parameter[];
  source?: string;
  verified: boolean;
}

export interface ErrorSpec {
  status: number;
  code: string;
  description: string;
}

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
  path: string;
  title: string;
  summary: string;
  sourceUrl?: string;
  verification: Verification;
  authentication: { type: string; description: string };
  headers: Parameter[];
  pathParameters: Parameter[];
  queryParameters: Parameter[];
  requestBody: Parameter[] | null;
  /** Example request body used by code samples and the Playground. */
  requestExample?: Record<string, unknown>;
  responses: ResponseSpec[];
  errors: ErrorSpec[];
  related: string[];
}

export interface Category {
  id: string;
  title: string;
  endpoints: Endpoint[];
}

export interface ApiDefinition {
  id: string;
  name: string;
  version: string;
  baseUrl: string;
  /** True for fabricated prototype content that must be labelled as such. */
  synthetic: boolean;
  categories: Category[];
}
