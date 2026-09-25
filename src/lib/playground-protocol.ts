/**
 * Wire contract between the Playground (browser) and the portal's Live
 * proxy route (/api/playground). Shared by both sides; contains no logic.
 */

export const LIVE_ROUTE = "/api/playground";

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
  bodyText: string;
}

export type LiveResponseBody =
  | { ok: true; upstream: LiveUpstream }
  | { ok: false; error: { code: PortalErrorCode } };
