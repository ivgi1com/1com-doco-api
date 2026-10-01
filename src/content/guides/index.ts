import { authentication } from "./authentication";
import { callHistory } from "./call-history";
import { gettingStarted } from "./getting-started";
import { openapiAuthentication } from "./openapi-authentication";
import type { Guide } from "./types";

/** Guide registry, in sidebar order. Each guide is a content module (types.ts). */
export const guides: Guide[] = [gettingStarted, authentication, callHistory, openapiAuthentication];

export function getGuide(slug: string) {
  return guides.find((g) => g.slug === slug);
}

export type { Guide, GuideBlock, GuideSection } from "./types";
