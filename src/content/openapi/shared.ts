import type { Authentication, Endpoint, ErrorSpec, Parameter, Requirement } from "../types";

/**
 * Shared building blocks for MiRTA OpenAPI (`openapi.php`) content, one
 * module per official resource page in this folder. Sources:
 * source-docs/openapi/ (README.md has the authority rules and coverage
 * index; `_common.md` the cross-resource contract, cited here as `ov:N`).
 * No-guessing rule: what the official page does not say stays
 * "undocumented" (response schemas, HTTP statuses). Nothing here has been
 * tested against a real PBX.
 */

// U-17: closed on the user's confirmation (2026-09-26), not by a call.
export const OPENAPI_BASE_URL = "https://pbx6webserver.1com.co.il/pbx/openapi.php";

export const OFFICIAL_BOOK = "https://manual.mirtapbx.com/books/api/page";

// ov:18
const TRANSPORTS =
  "Send the key in the `X-API-Key` header. The source also accepts it as the `key` query parameter or as `Authorization: Bearer <key>`; the header keeps it out of URLs and logs.";

/**
 * Authentication for one resource. `write` adds the rule every object page
 * states for create/update/delete.
 */
export function openapiAuth(opts: { write?: boolean; extra?: string } = {}): Authentication {
  const parts = [TRANSPORTS];
  if (opts.write) parts.push("Writes require an API Key with write access; a read-only API Key gets `read_only_api_key`.");
  if (opts.extra) parts.push(opts.extra);
  return {
    type: "API Key",
    description: parts.join(" "),
    location: "header",
    parameter: "X-API-Key",
  };
}

/** A query parameter. */
export function q(name: string, description: string, extra: Partial<Parameter> = {}): Parameter {
  return { name, location: "query", type: "string", required: false, description, ...extra };
}

/**
 * A request-body field. `required` defaults to `false`: each object page
 * lists its required create fields ("Required on create"), so any other
 * field is optional unless the resource file says "not stated".
 */
export function f(name: string, description: string, extra: Partial<Parameter> = {}): Parameter {
  return { name, location: "body", type: "string", required: false, description, ...extra };
}

/** `tenant` query parameter. `required` follows what the resource page states. */
export function tenantParam(required: Requirement, description?: string): Parameter {
  return q(
    "tenant",
    description ??
      (required === true
        ? "Tenant code."
        : "Tenant code."), // ov:18
    {
      required,
      example: "TESTTENANT",
      ...(required === true ? {} : { condition: "Required with your API Key" }),
    },
  );
}

/** Official wording for each documented error code (`_common.md` §6). */
const ERROR_TEXT = {
  missing_api_key: "No API Key was supplied in the query string, `X-API-Key`, or bearer token.",
  invalid_api_key: "The supplied API Key does not match the tenant.",
  tenant_required: "A tenant code is required for tenant-scoped writes or tenant-key reads.",
  read_only_api_key: "The key can read data but cannot create, update, or delete objects.",
  missing_required_field: "A required create field is missing.",
  tenant_not_found: "The tenant parameter did not match any visible tenant.",
  method_not_allowed: "The endpoint is read-only and only supports GET.",
  single_tenant_required: "Template output requires the request to resolve to exactly one tenant.",
  template_not_found: "The selected XML/template output template does not exist for the tenant.",
  uniqueid_required: "The request did not include a usable `uniqueid` value.",
  invalid_format: "The `format` value is not `json` or `csv`.",
  api_ip_not_allowed: "IP filtering is enabled and the client address is not in the key's allowed IP or network list.",
} as const;

export type ErrorCode = keyof typeof ERROR_TEXT;

/** Error entries for the given codes. No page documents an HTTP status for any error. */
export function errors(...codes: ErrorCode[]): ErrorSpec[] {
  return codes.map((code) => ({ status: "undocumented", code, description: ERROR_TEXT[code] }));
}

export const VERIFICATION = { documented: true, implemented: true, tested: false, verified: false } as const;

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

type OperationInput = WithRequired<
  Partial<Endpoint>,
  "id" | "category" | "method" | "path" | "title" | "summary" | "authentication" | "queryParameters"
> & { file: string; page: string };

/**
 * One OpenAPI operation with the defaults every documented operation
 * shares: stable, method documented, JSON body, no response documented,
 * errors undocumented, not tested. POST/PATCH/PUT/DELETE are always
 * `write` (Reference-only; SEC-REQ-27). Callers override only what the
 * official page says.
 */
export function openapiOperation({ file, page, ...o }: OperationInput): Endpoint {
  const write = o.method !== "GET";
  return {
    api: "openapi",
    version: "current",
    status: "stable",
    methodBasis: "documented",
    sourceUrl: `${OFFICIAL_BOOK}/${page}`,
    verification: { ...VERIFICATION },
    headers: [],
    pathParameters: [],
    requestBody: null,
    responses: [],
    errors: "undocumented",
    related: [],
    ...o,
    operationClass: write ? "write" : "read",
    notes: [...(o.notes ?? []), `Source: source-docs/openapi/${file}.`],
  };
}

/** A configuration object documented with the standard list/get/create/update/delete set. */
export interface ResourceSpec {
  /** Endpoint id prefix, the documented primary path without its slash, e.g. `extensions`. */
  slug: string;
  /** Local resource file in source-docs/openapi/. */
  file: string;
  /** Official page slug under OFFICIAL_BOOK. */
  page: string;
  category: string;
  /** Lower-case nouns used in titles and summaries, e.g. "extension" / "extensions". */
  singular: string;
  plural: string;
  path: string;
  idField: string;
  /** False for objects that take no `tenant` parameter. */
  tenantScoped: boolean;
  /** Documented path aliases, recorded as a note. */
  aliases?: string[];
  /**
   * Extra query parameters accepted only by `list`, beyond the shared
   * tenant/global set (e.g. a parent-object filter). Additive: most
   * resources have none.
   */
  listFilters?: Parameter[];
  /** Create/update body fields, request name first, mapped column in the description. */
  fields: Parameter[];
  createExample: Record<string, unknown>;
  updateExample: Record<string, unknown>;
  /** Error codes listed on the official page. */
  errorCodes: ErrorCode[];
  /** Summaries; each defaults to a generic sentence built from `singular`/`plural`. */
  summaries?: Partial<Record<"list" | "get" | "create" | "update" | "delete", string>>;
  /** Notes shown on every operation of the resource (security findings, unknowns). */
  notes?: string[];
  /** Notes for one operation only. */
  operationNotes?: Partial<Record<"list" | "get" | "create" | "update" | "delete", string[]>>;
}

/**
 * Expands a resource into its five documented operations. `read_only_api_key`
 * is kept for writes only and `missing_required_field` for create only:
 * both codes are defined by the source as write/create errors.
 */
export function openapiResource(r: ResourceSpec): Endpoint[] {
  const idParam: Parameter = {
    name: r.idField,
    location: "path",
    type: "string",
    required: true,
    description: `Internal ID (\`${r.idField}\`). Its type is not documented; the official examples use the placeholder OBJECT_ID.`,
    example: "OBJECT_ID",
  };
  const readQuery = r.tenantScoped ? [tenantParam(false)] : [];
  const writeQuery = r.tenantScoped ? [tenantParam(true, "Tenant code. Writes require it.")] : [];
  const aliasNote = r.aliases?.length ? [`Documented path aliases: ${r.aliases.map((a) => `\`${a}\``).join(", ")}.`] : [];
  const pick = (kind: "list" | "get" | "create" | "update" | "delete") =>
    errors(
      ...r.errorCodes.filter(
        (c) =>
          (c !== "read_only_api_key" || ["create", "update", "delete"].includes(kind)) &&
          (c !== "missing_required_field" || kind === "create"),
      ),
    );
  const base = (kind: "list" | "get" | "create" | "update" | "delete") => ({
    file: r.file,
    page: r.page,
    category: r.category,
    notes: [...aliasNote, ...(r.notes ?? []), ...(r.operationNotes?.[kind] ?? [])],
    errors: pick(kind),
  });
  const readAuth = openapiAuth();
  const writeAuth = openapiAuth({ write: true });
  const updateFields = r.fields.map((p) => ({ ...p, required: false }));

  return [
    openapiOperation({
      ...base("list"),
      id: `${r.slug}-list`,
      method: "GET",
      path: r.path,
      title: `List ${r.plural}`,
      summary: r.summaries?.list ?? `Returns the ${r.plural} visible to the key and scope.`,
      authentication: readAuth,
      queryParameters: [...readQuery, ...(r.listFilters ?? [])],
      related: [`${r.slug}-get`, `${r.slug}-create`],
    }),
    openapiOperation({
      ...base("get"),
      id: `${r.slug}-get`,
      method: "GET",
      path: `${r.path}/{${r.idField}}`,
      title: `Get ${r.singular}`,
      summary: r.summaries?.get ?? `Reads one ${r.singular} by its internal ID.`,
      authentication: readAuth,
      pathParameters: [idParam],
      queryParameters: readQuery,
      related: [`${r.slug}-list`, `${r.slug}-update`],
    }),
    openapiOperation({
      ...base("create"),
      id: `${r.slug}-create`,
      method: "POST",
      path: r.path,
      title: `Create ${r.singular}`,
      summary: r.summaries?.create ?? `Creates a ${r.singular}. Accepts the short request aliases or the source column names.`,
      authentication: writeAuth,
      queryParameters: writeQuery,
      requestBody: r.fields,
      requestExample: r.createExample,
      related: [`${r.slug}-update`, `${r.slug}-list`],
    }),
    openapiOperation({
      ...base("update"),
      id: `${r.slug}-update`,
      method: "PATCH",
      path: `${r.path}/{${r.idField}}`,
      title: `Update ${r.singular}`,
      summary: r.summaries?.update ?? "Updates only the supplied fields.",
      authentication: writeAuth,
      pathParameters: [idParam],
      queryParameters: writeQuery,
      requestBody: updateFields,
      requestExample: r.updateExample,
      related: [`${r.slug}-get`, `${r.slug}-delete`],
    }),
    openapiOperation({
      ...base("delete"),
      id: `${r.slug}-delete`,
      method: "DELETE",
      path: `${r.path}/{${r.idField}}`,
      title: `Delete ${r.singular}`,
      summary: r.summaries?.delete ?? `Deletes the ${r.singular}. Check references before deleting configuration used by routing or reporting.`,
      authentication: writeAuth,
      pathParameters: [idParam],
      queryParameters: writeQuery,
      related: [`${r.slug}-get`],
    }),
  ];
}
