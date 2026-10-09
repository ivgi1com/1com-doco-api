import { describe, expect, it } from "vitest";
import { apis, getApi, getEndpoint, menuCategories } from "@/content";
import { guides } from "@/content/guides";
import { sampleLanguages } from "@/lib/code-samples";
import { buildSearchIndex } from "@/lib/search-index";

/**
 * Guide content model integrity (src/content/guides/types.ts): every
 * reference a guide makes into the content model must resolve, so the
 * generic guide page's non-null assertions can never fail at render time.
 */

describe("guide registry", () => {
  it("slugs are unique", () => {
    const slugs = guides.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  for (const guide of guides) {
    describe(guide.slug, () => {
      it("references an existing API", () => {
        expect(getApi(guide.apiId), guide.apiId).toBeDefined();
      });

      it("has at least one section, with unique ids", () => {
        expect(guide.sections.length).toBeGreaterThan(0);
        const ids = guide.sections.map((s) => s.id);
        expect(new Set(ids).size).toBe(ids.length);
      });

      it("every sample and endpoints block resolves to an endpoint of its API", () => {
        for (const section of guide.sections) {
          for (const block of section.blocks) {
            if (block.kind === "sample") {
              expect(getEndpoint(guide.apiId, block.endpoint), `${section.id}: ${block.endpoint}`).toBeDefined();
              expect(sampleLanguages.map((l) => l.id)).toContain(block.language);
            }
            if (block.kind === "endpoints") {
              expect(block.ids.length).toBeGreaterThan(0);
              for (const id of block.ids) expect(getEndpoint(guide.apiId, id), `${section.id}: ${id}`).toBeDefined();
            }
          }
        }
      });

      it("inline code spans are balanced (an even number of backticks per string)", () => {
        const strings = guide.sections.flatMap((s) =>
          s.blocks.flatMap((b) =>
            b.kind === "paragraph" || b.kind === "callout" ? [b.text] : b.kind === "list" ? b.items : [],
          ),
        );
        for (const text of [guide.summary, ...strings]) {
          expect((text.match(/`/g) ?? []).length % 2, text).toBe(0);
        }
      });

      it("a non-synthetic guide cites its evidence", () => {
        if (!guide.synthetic) expect(guide.sources.length).toBeGreaterThan(0);
      });
    });
  }
});

describe("search index", () => {
  it("covers every menu-visible endpoint of every API plus every guide", () => {
    const endpointCount = apis.reduce((n, api) => n + menuCategories(api).flatMap((c) => c.endpoints).length, 0);
    const index = buildSearchIndex();
    expect(index.filter((i) => i.kind === "endpoint")).toHaveLength(endpointCount);
    expect(index.filter((i) => i.kind === "guide")).toHaveLength(guides.length);
    expect(index).toHaveLength(endpointCount + guides.length);
  });
});
