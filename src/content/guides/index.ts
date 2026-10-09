import { apis } from "../index";
import { authentication } from "./authentication";
import { callHistory } from "./call-history";
import { glossary } from "./glossary";
import { mostUsedCases } from "./most-used-cases";
import { openapiAuthentication } from "./openapi-authentication";
import { quickstart } from "./quickstart";
import type { Guide } from "./types";

/**
 * Guide registry, in sidebar order: Open API first (Phase 8E), then the
 * legacy Proxy API. Each guide is a content module (types.ts); the Guides
 * sidebar shows one API's guides at a time.
 */
export const guides: Guide[] = [quickstart, openapiAuthentication, glossary, mostUsedCases, authentication, callHistory];

export function getGuide(slug: string) {
  return guides.find((g) => g.slug === slug);
}

export function guidesForApi(apiId: string) {
  return guides.filter((g) => g.apiId === apiId);
}

/** APIs that have at least one guide, in `apis` order (the Guides API selector's options). */
export function guideApis() {
  return apis.filter((a) => guides.some((g) => g.apiId === a.id));
}

export type { Guide, GuideBlock, GuideSection } from "./types";
