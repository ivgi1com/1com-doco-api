import "server-only";

import { getLiveTarget, type LiveTarget } from "./allowlist";

export interface LiveRequest {
  target: LiveTarget;
  /** Only non-empty, allowlisted parameters. */
  params: Record<string, string>;
  credential: string;
}

export type ValidationCode = "invalid_request" | "endpoint_not_allowed" | "missing_credential";

export type ValidationResult = { ok: true; value: LiveRequest } | { ok: false; code: ValidationCode };

const MAX_PARAM_LENGTH = 128;
const MAX_CREDENTIAL_LENGTH = 256;
const MAX_PARAM_COUNT = 16;
const TOP_LEVEL_KEYS = new Set(["endpoint", "params", "credential"]);
// C0 controls, DEL, and C1 controls: never legitimate in a query value.
const CONTROL_CHARS = /[\u0000-\u001f\u007f-\u009f]/;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * Strict parser for the browser -> portal request. Rejects rather than
 * repairs: unknown fields, non-string values, parameters outside the
 * target's allowlist (which excludes the fixed operation selectors and the
 * credential parameter, so neither can be overridden or smuggled).
 */
export function validateLiveRequest(input: unknown): ValidationResult {
  const invalid = { ok: false, code: "invalid_request" } as const;
  if (!isPlainObject(input)) return invalid;
  for (const key of Object.keys(input)) if (!TOP_LEVEL_KEYS.has(key)) return invalid;

  const { endpoint, params, credential } = input;
  if (typeof endpoint !== "string" || endpoint.length > 128) return invalid;
  const target = getLiveTarget(endpoint);
  if (!target) return { ok: false, code: "endpoint_not_allowed" };

  if (params !== undefined && !isPlainObject(params)) return invalid;
  const entries = Object.entries(params ?? {});
  if (entries.length > MAX_PARAM_COUNT) return invalid;

  const clean: Record<string, string> = {};
  for (const [name, value] of entries) {
    if (!target.allowedParams.has(name)) return invalid;
    if (typeof value !== "string") return invalid;
    if (value.length > MAX_PARAM_LENGTH || CONTROL_CHARS.test(value)) return invalid;
    if (value.trim() === "") continue;
    clean[name] = value;
  }

  if (credential === undefined || credential === "") return { ok: false, code: "missing_credential" };
  if (typeof credential !== "string") return invalid;
  if (credential.length > MAX_CREDENTIAL_LENGTH || CONTROL_CHARS.test(credential)) return invalid;
  if (credential.trim() === "") return { ok: false, code: "missing_credential" };

  return { ok: true, value: { target, params: clean, credential } };
}
