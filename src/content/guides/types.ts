import type { SampleLanguage } from "@/lib/code-samples";

/**
 * Guide content model (Phase 7 Stage 6). A guide is API-scoped data rendered
 * by one generic page (`src/app/[locale]/guides/[slug]/page.tsx`); the page
 * holds no API-specific logic, so a new API's guides need only a new content
 * module here.
 *
 * Prose strings support one inline syntax: `backticks` for inline code. No
 * HTML, no markdown — links to the reference go through the `endpoints`
 * block, which resolves ids against the content model (and is checked by
 * tests/unit/guides.test.ts), so a guide can never link to a page that
 * doesn't exist.
 */

export type GuideBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "callout"; tone: "note" | "tip" | "warning" | "danger"; title?: string; text: string }
  /** A literal code block, for content that isn't a single endpoint call (shell setup, a response body). */
  | { kind: "code"; lang: string; title?: string; code: string }
  /**
   * A request sample generated from an endpoint of the guide's API with
   * `buildSample` — the same generator the reference uses, so the guide and
   * the reference cannot drift apart.
   */
  | { kind: "sample"; endpoint: string; language: SampleLanguage; title?: string }
  /** Links to reference pages of the guide's API, by endpoint id. */
  | { kind: "endpoints"; ids: string[] };

export interface GuideSection {
  /** Anchor id, unique within the guide. */
  id: string;
  title: string;
  blocks: GuideBlock[];
}

export interface Guide {
  slug: string;
  title: string;
  summary: string;
  /** Written for the prototype Sample API; shows the prototype banner. */
  synthetic: boolean;
  /** The API whose endpoints `sample`/`endpoints` blocks reference. */
  apiId: string;
  /** Evidence the prose is derived from (source-docs paths). Required for non-synthetic guides. */
  sources: string[];
  sections: GuideSection[];
}
