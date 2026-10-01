import exclusions from "../../../source-docs/portal-exclusions.json";

/**
 * Baseline operations deliberately left out of the customer portal
 * (source-docs/portal-exclusions.json, Phase 8E). Tests reconcile the
 * untouched baseline inventories against the content model through these
 * sets instead of editing the approved baseline files.
 */
export const EXCLUDED_OPENAPI_OPS: ReadonlySet<string> = new Set(exclusions.openapi.operations);
export const EXCLUDED_OPENAPI_RESOURCE_FILES: ReadonlySet<string> = new Set(exclusions.openapi.resources);
export const EXCLUDED_PROXY_OPS: ReadonlySet<string> = new Set(exclusions.proxy.operations);
export const EXCLUDED_GUIDES: ReadonlySet<string> = new Set(exclusions.guides);
