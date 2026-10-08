/**
 * Wire contract between the Playground (browser) and the portal's Live
 * proxy route (/api/playground). Shared by both sides; contains no logic.
 */

import { withBasePath } from "./base-path";

export const LIVE_ROUTE = withBasePath("/api/playground");

export interface LiveRequestBody {
  /** `${api}/${endpoint}`, e.g. "proxy/info-extensions". */
  endpoint: string;
  params: Record<string, string>;
  /** Values for the operation's `{name}` path segments; omitted when it has none. */
  pathParams?: Record<string, string>;
  credential: string;
}

/**
 * What the Playground needs to know about one Live target to build the same
 * request the portal will make. Display only; the server enforces the policy.
 */
export interface LiveTargetHints {
  /** Documented query parameters the caller may not set in Live: hidden and never sent. */
  hiddenParams: string[];
  /** Query values the portal always sends upstream (shown in the Live request preview). */
  fixedQuery: Record<string, string>;
}

/** Portal-side failures. Each is shown as a portal error, never replaced by Demo data. */
export type PortalErrorCode =
  | "live_disabled"
  | "forbidden_origin"
  | "unsupported_media_type"
  | "payload_too_large"
  | "rate_limited"
  | "invalid_request"
  | "endpoint_not_allowed"
  | "missing_credential"
  /** The date range (start..end, with the documented defaults) exceeds the Live limit. */
  | "range_too_wide"
  /** The answer contained records of more than one tenant (an admin key); nothing is shown. */
  | "multi_tenant_blocked"
  | "upstream_timeout"
  | "upstream_too_large"
  | "upstream_redirect"
  | "upstream_unreachable";

export interface LiveUpstream {
  status: number;
  latencyMs: number;
  sizeBytes: number;
  contentType: string | null;
  headers: Record<string, string>;
  /** Upstream body after server-side redaction (src/server/playground/redact.ts). */
  bodyText: string;
  /**
   * Credential-like values the portal replaced; -1 when the whole body was
   * withheld because it could not be redacted safely. `sizeBytes` is always
   * the upstream size, before redaction.
   */
  redactedCount: number;
  /** Distinct upstream JSON fields dropped by the portal's field allowlist. */
  fieldsOmitted: number;
}

export type LiveResponseBody =
  | { ok: true; upstream: LiveUpstream }
  | { ok: false; error: { code: PortalErrorCode } };
