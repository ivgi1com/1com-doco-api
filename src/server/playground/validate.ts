import "server-only";

import { getLiveTarget, type LiveTarget } from "./allowlist";

export interface LiveRequest {
  target: LiveTarget;
  /** Only non-empty, allowlisted parameters. */
  params: Record<string, string>;
  credential: string;
}

export type ValidationCode = "invalid_request" | "endpoint_not_allowed" | "missing_credential" | "range_too_wide";

export type ValidationResult = { ok: true; value: LiveRequest } | { ok: false; code: ValidationCode };

const MAX_PARAM_LENGTH = 128;
const MAX_CREDENTIAL_LENGTH = 256;
const MAX_PARAM_COUNT = 16;
const TOP_LEVEL_KEYS = new Set(["endpoint", "params", "credential"]);
// C0 controls, DEL, and C1 controls: never legitimate in a query value.
const CONTROL_CHARS = /[\u0000-\u001f\u007f-\u009f]/;
// A key sent as an HTTP header: visible ASCII only (no spaces, no header splitting).
const HEADER_CREDENTIAL = /^[\x21-\x7e]+$/;
const DAY_MS = 86_400_000;

/**
 * Parses the documented `YYYY-MM-DD HH:MM:SS` wall-clock value (no timezone:
 * both bounds are in the PBX's local time, so comparing them as UTC is exact).
 * Rejects impossible dates instead of letting Date roll them over.
 */
function parseWallClock(value: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(value);
  if (!m) return null;
  const [y, mo, d, h, mi, s] = m.slice(1).map(Number);
  const t = Date.UTC(y, mo - 1, d, h, mi, s);
  const back = new Date(t);
  const exact =
    back.getUTCFullYear() === y && back.getUTCMonth() === mo - 1 && back.getUTCDate() === d &&
    back.getUTCHours() === h && back.getUTCMinutes() === mi && back.getUTCSeconds() === s;
  return exact ? t : null;
}

/**
 * Today's documented defaults (start 00:00:00, end 23:59:59) in the portal's
 * local date. The portal runs on the PBX host, so its local date is the PBX's.
 */
function todayBound(which: "start" | "end", now: Date): number {
  const base = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return which === "start" ? base : base + DAY_MS - 1000;
}

function checkDateRange(
  range: NonNullable<LiveTarget["dateRange"]>,
  params: Record<string, string>,
  now: Date,
): ValidationCode | null {
  const start = params[range.start] !== undefined ? parseWallClock(params[range.start]) : todayBound("start", now);
  const end = params[range.end] !== undefined ? parseWallClock(params[range.end]) : todayBound("end", now);
  if (start === null || end === null || end < start) return "invalid_request";
  return end - start > range.maxDays * DAY_MS ? "range_too_wide" : null;
}

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
export function validateLiveRequest(input: unknown, now: Date = new Date()): ValidationResult {
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
    const allowedValues = target.paramEnums.get(name);
    if (allowedValues && !allowedValues.has(value)) return invalid;
    const pattern = target.paramPatterns.get(name);
    if (pattern && !pattern.test(value)) return invalid;
    clean[name] = value;
  }

  if (target.dateRange) {
    const code = checkDateRange(target.dateRange, clean, now);
    if (code) return { ok: false, code };
  }

  if (credential === undefined || credential === "") return { ok: false, code: "missing_credential" };
  if (typeof credential !== "string") return invalid;
  if (credential.length > MAX_CREDENTIAL_LENGTH || CONTROL_CHARS.test(credential)) return invalid;
  if (credential.trim() === "") return { ok: false, code: "missing_credential" };
  if (target.credential.location === "header" && !HEADER_CREDENTIAL.test(credential)) return invalid;

  return { ok: true, value: { target, params: clean, credential } };
}
