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
  credential: string;
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
