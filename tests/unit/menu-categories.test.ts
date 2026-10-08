import { describe, expect, it } from "vitest";
import { apis, getApi, menuCategories } from "@/content";
import type { ApiDefinition } from "@/content/types";

const cat = (id: string) => ({ id, title: id, endpoints: [] });

describe("menuCategories", () => {
  it("puts menuOrder ids first in that order, keeps the rest in their own order", () => {
    const api = {
      categories: ["a", "b", "c", "d", "e"].map(cat),
      menuOrder: ["d", "b"],
    } as unknown as ApiDefinition;
    expect(menuCategories(api).map((c) => c.id)).toEqual(["d", "b", "a", "c", "e"]);
  });

  it("drops menuHidden ids and ignores ids that do not exist", () => {
    const api = {
      categories: ["a", "b", "c"].map(cat),
      menuOrder: ["missing", "c"],
      menuHidden: ["a", "also-missing"],
    } as unknown as ApiDefinition;
    expect(menuCategories(api).map((c) => c.id)).toEqual(["c", "b"]);
  });

  it("returns the declared order untouched when no menu config is set", () => {
    const api = { categories: ["a", "b"].map(cat) } as unknown as ApiDefinition;
    expect(menuCategories(api).map((c) => c.id)).toEqual(["a", "b"]);
  });

  it("Open API menu: Dial, Simple CDR, Extension, DID, Queue, Hunt List, Media File first", () => {
    const ids = menuCategories(getApi("openapi")!).map((c) => c.id);
    expect(ids.slice(0, 7)).toEqual(["dial", "simplecdr", "extension", "did", "queue", "huntlist", "mediafile"]);
  });

  it("Open API menu hides Provisioning Phone and Setting without removing their content", () => {
    const openapi = getApi("openapi")!;
    const menu = menuCategories(openapi).map((c) => c.id);
    expect(menu).not.toContain("provisioningphone");
    expect(menu).not.toContain("setting");
    const all = openapi.categories.map((c) => c.id);
    expect(all).toContain("provisioningphone");
    expect(all).toContain("setting");
  });

  it("every configured menu id names a real category", () => {
    for (const api of apis) {
      const ids = new Set(api.categories.map((c) => c.id));
      for (const id of [...(api.menuOrder ?? []), ...(api.menuHidden ?? [])]) {
        expect(ids.has(id), `${api.id}:${id}`).toBe(true);
      }
    }
  });
});
