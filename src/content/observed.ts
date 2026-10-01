import probe from "../../source-docs/observed/openapi/probe-2026-09-26.masked.json";
import type { Endpoint, Parameter, ResponseSpec } from "./types";

/**
 * Phase 8B Stage 3: what the masked, structure-only probe of the MiRTA
 * OpenAPI GETs observed on the test PBX (2026-09-26;
 * source-docs/DOCS_AUDIT.md §14, source-docs/observed/openapi/). The probe
 * stored only field names and value types, never values, so every example
 * built here is a synthetic placeholder derived from the observed type.
 *
 * Kept out of `Endpoint` (like src/content/examples.ts) so the client-side
 * sidebar, which imports the content registry, does not ship the observed
 * schemas. Reference pages read it on the server via `withObserved`.
 */

const PROBE_DATE = "2026-09-26";

/** Masked shape as stored in the probe file. */
type Shape = string | { [key: string]: Shape | Shape[] };

interface ProbeResult {
  status?: number;
  body?: Shape;
  note?: string;
}

const probeFile = probe as unknown as {
  probe: Record<string, ProbeResult>;
  followup: Record<string, ProbeResult>;
  errors: Record<string, ProbeResult>;
};

/** Success observation per operation id: main probe first, then the targeted follow-up. */
const FOLLOWUP_IDS: Record<string, string> = {
  "extensions-get (by list id)": "extensions-get",
  "extensions-get-by-number": "extensions-get-by-number",
  "extensions-state-get": "extensions-state-get",
  "phonebookentries-list (phonebook_id filter)": "phonebookentries-list",
  "phonebookentries-get": "phonebookentries-get",
  "aianalysis-get (uniqueid from simplecdrs)": "aianalysis-get",
};

const observed = new Map<string, ProbeResult>();
for (const [id, r] of Object.entries(probeFile.probe)) if (r.status === 200 && r.body) observed.set(id, r);
for (const [key, id] of Object.entries(FOLLOWUP_IDS)) {
  const r = probeFile.followup[key];
  if (r?.status === 200 && r.body) observed.set(id, r);
}

/** Error and edge-case observations, attached as notes to the operation they were made on. */
const OBSERVED_NOTES: Record<string, string[]> = {
  "extensions-list": [
    "Observed on the test PBX: an invalid key returned HTTP 401 with `{\"error\": {\"code\": \"invalid_api_key\", \"message\": ...}}`. Omitting `tenant`, or sending an unknown tenant, also returned 401 `invalid_api_key` — the source documents `tenant_required` and `tenant_not_found` for those cases (source-docs/DOCS_AUDIT.md OA-15).",
  ],
  "campaigns-get": [
    "Observed on the test PBX: a nonexistent ID returned HTTP 404 `object_not_found`, an error code the source does not list (source-docs/DOCS_AUDIT.md OA-16).",
  ],
  "aianalysis-get": [
    "Observed on the test PBX: a request without `uniqueid` returned HTTP 400 `uniqueid_required`; a request whose unique IDs have no analysis returned HTTP 200 with an empty array `[]` (the source does not show the all-miss case).",
  ],
  "extensions-state-get": [
    "Observed on the test PBX: an unknown extension number returned HTTP 404 in the `{\"error\": {\"code\", \"message\"}}` envelope. An existing extension returned the documented 8 keys; `UniqueID` and `LinkedID` were non-empty and the other six were empty strings.",
  ],
  "ailogs-list": [
    "Observed on the test PBX: `/ailogs` and the `/ailog` alias both returned HTTP 404 `not_found`, so AI Logs appears not to be available on that installation (source-docs/DOCS_AUDIT.md OA-17). The documented response below is from the official page only.",
  ],
  "simplecdrs-list": [
    "Observed on the test PBX: a JSON array of the 12 documented fields, every value a string (numbers included). A filter with no matching calls returned HTTP 200 with `[]`.",
  ],
  "phonebookentries-list": [
    "Observed on the test PBX: listing without `phonebook_id` did not answer before the probe's timeout; with `phonebook_id` it returned a JSON array (source-docs/DOCS_AUDIT.md OA-18).",
  ],
  "tenantvariables-list": ["Observed on the test PBX: HTTP 200 with an empty array `[]` (no variables on the test tenant)."],
};

// --- shape → schema ---

function typeLabel(s: Shape): { type: string; hint?: string } {
  if (typeof s !== "string") return { type: "object" };
  if (s === "null") return { type: "null" };
  if (s === "int") return { type: "integer" };
  if (s === "float") return { type: "number" };
  if (s === "bool") return { type: "boolean" };
  if (s.startsWith("[]")) return { type: "array", hint: "empty in every observed response" };
  const m = s.match(/^str\((.*)\)$/);
  if (m) {
    const hints = m[1].split(",");
    if (hints.includes("empty")) return { type: "string", hint: "empty in the observed response" };
    if (hints.includes("datetime")) return { type: "string", hint: "date-time string" };
    if (hints.includes("date")) return { type: "string", hint: "date string" };
    if (hints.includes("digits")) return { type: "string", hint: "numeric string" };
    if (hints.includes("decimal")) return { type: "string", hint: "decimal string" };
    if (hints.includes("json-text")) return { type: "string", hint: "JSON text" };
    return { type: "string" };
  }
  return { type: "unknown" };
}

function isArrayShape(s: Shape): s is { "[array]": string; items: Shape | Shape[] } {
  return typeof s === "object" && "[array]" in s;
}

function isKeyedShape(s: Shape): s is { "{object keyed by numeric ids}": string; value: Shape } {
  return typeof s === "object" && "{object keyed by numeric ids}" in s;
}

/** Object shapes seen for one field or row, flattening array unions. */
function variants(s: Shape | Shape[]): Shape[] {
  return Array.isArray(s) ? s : [s];
}

function mergeFields(rows: Shape[]): Map<string, Shape[]> {
  const fields = new Map<string, Shape[]>();
  for (const row of rows) {
    if (typeof row !== "object" || isArrayShape(row) || isKeyedShape(row)) continue;
    for (const [k, v] of Object.entries(row)) {
      const list = fields.get(k) ?? [];
      list.push(...variants(v as Shape | Shape[]));
      fields.set(k, list);
    }
  }
  return fields;
}

function fieldParam(name: string, shapes: Shape[]): Parameter {
  const objects = shapes.filter((s) => typeof s === "object");
  const scalars = shapes.filter((s): s is string => typeof s === "string");
  const labels = [...new Set(scalars.map((s) => typeLabel(s).type))];
  const hints = [...new Set(scalars.map((s) => typeLabel(s).hint).filter(Boolean))];
  let type = labels.join(" | ") || "object";
  let children: Parameter[] | undefined;
  if (objects.length) {
    const arrays = objects.filter(isArrayShape);
    const keyed = objects.filter(isKeyedShape);
    if (arrays.length) {
      type = [...new Set(["array", ...labels])].join(" | ");
      children = schemaOf(arrays.flatMap((a) => variants(a.items)));
    } else if (keyed.length) {
      type = "object (keyed by numeric IDs)";
      children = schemaOf(keyed.map((k) => k.value));
    } else {
      type = [...new Set(["object", ...labels])].join(" | ");
      children = schemaOf(objects);
    }
  }
  const description = hints.length ? `Observed: ${hints.join("; ")}.` : "Observed on the test PBX.";
  return {
    name,
    location: "body",
    type,
    required: "undocumented",
    description,
    ...(children?.length ? { children } : {}),
  };
}

function schemaOf(rows: Shape[]): Parameter[] {
  return [...mergeFields(rows)].map(([name, shapes]) => fieldParam(name, shapes));
}

// --- shape → synthetic example ---

const SECRET_NAME = /(pass|secret|pin$|_pin|pin_|securitypin|token|md5|imap|apikey|api_key)/i;

function exampleScalar(name: string, s: string): unknown {
  const { type, hint } = typeLabel(s);
  if (type === "null") return null;
  if (type === "integer") return 1;
  if (type === "number") return 0.5;
  if (type === "boolean") return false;
  if (type === "array") return [];
  if (hint?.startsWith("empty")) return "";
  if (SECRET_NAME.test(name) && !/validity|locked|meid$/i.test(name)) return "SYNTHETIC_SECRET";
  if (hint === "date-time string") return "2026-01-01 09:00:00";
  if (hint === "date string") return "2026-01-01";
  if (hint === "decimal string") return "0.00";
  if (hint === "JSON text") return "{}";
  if (/mac$/i.test(name)) return "00:00:5E:00:53:00";
  if (/email/i.test(name)) return "demo@example.com";
  if (/tenant_?code|^tenantcode$/i.test(name)) return "TESTTENANT";
  if (hint === "numeric string") {
    return /(num|number|phone|callerid|cid|did|dst|src|mailbox|dialed)/i.test(name) ? "5550100" : "100";
  }
  if (/name$/i.test(name)) return "Demo";
  return "example";
}

function exampleOf(s: Shape | Shape[], name = ""): unknown {
  const first = Array.isArray(s) ? s[0] : s;
  if (typeof first === "string") return exampleScalar(name, first);
  if (isArrayShape(first)) return [exampleOf(first.items, name)];
  if (isKeyedShape(first)) return { "1": exampleOf(first.value, name) };
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(first)) out[k] = exampleOf(v as Shape | Shape[], k);
  return out;
}

// --- public API ---

const GENERIC_FIELDS = ["id", "name", "object", "related"];

function observedResponse(endpoint: Endpoint, r: ProbeResult): ResponseSpec {
  const body = r.body as Shape;
  const isList = isArrayShape(body);
  const empty = body === "[] (empty)";
  const rows = isList ? variants(body.items) : [body];
  const envelope = empty
    ? "an empty JSON array `[]` (no records on the test tenant)"
    : isList
      ? "a top-level JSON array, one object per record, with no pagination wrapper"
      : "a single JSON object";
  const keys = new Set(rows.flatMap((row) => (typeof row === "object" ? Object.keys(row) : [])));
  const genericKeys = GENERIC_FIELDS.filter((k) => keys.has(k)).map((k) => `\`${k}\``);
  const generic = genericKeys.length
    ? ` Besides the source columns, ${isList ? "each row" : "the object"} carries generic ${genericKeys.join(", ")} field${genericKeys.length > 1 ? "s" : ""}.`
    : "";
  return {
    status: 200,
    description: `Observed on the test PBX (${PROBE_DATE}, one masked structure-only probe): HTTP 200 with ${envelope}.${generic} Field names and value types are observed; the example values are synthetic placeholders, and fields whose meaning the source does not document stay undocumented.`,
    format: "json",
    evidence: "observed-sanitized",
    ...(empty ? { example: [] } : { schema: schemaOf(rows), example: isList ? [exampleOf(rows)] : exampleOf(body) }),
    source: `source-docs/observed/openapi/probe-${PROBE_DATE}.masked.json`,
    verified: false,
  };
}

/** Ids of the OpenAPI operations that returned HTTP 200 to the probe. */
export function observedOperationIds(): string[] {
  return [...observed.keys()];
}

/**
 * The endpoint with what the probe observed merged in (server-side only).
 * An operation with no documented 2xx response gains the observed one;
 * one that already has a documented response keeps it, and the observation
 * is added as a note instead. Either way `verification.tested` becomes true.
 */
export function withObserved(apiId: string, endpoint: Endpoint): Endpoint {
  if (apiId !== "openapi") return endpoint;
  const r = observed.get(endpoint.id);
  const notes = OBSERVED_NOTES[endpoint.id] ?? [];
  if (!r && notes.length === 0) return endpoint;
  const hasDocumented2xx = endpoint.responses.some((x) => x.status >= 200 && x.status < 300);
  const responses = r && !hasDocumented2xx ? [observedResponse(endpoint, r), ...endpoint.responses] : endpoint.responses;
  return {
    ...endpoint,
    responses,
    verification: { ...endpoint.verification, tested: endpoint.verification.tested || !!r },
    notes: [...notes, ...(endpoint.notes ?? [])],
  };
}
