import { describe, expect, it } from "vitest";
import { apis, getApi, menuCategories, menuGroups } from "@/content";
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

describe("menuGroups", () => {
  const api = (extra: Partial<ApiDefinition>) =>
    ({ categories: ["a", "b", "c", "d", "e"].map(cat), ...extra }) as unknown as ApiDefinition;
  const shape = (a: ApiDefinition, opts?: { includeHidden?: boolean }) =>
    menuGroups(a, opts).map((g) => `${g.title}:${g.categories.map((c) => c.id).join("+")}`);

  it("without groups, every menu category is a group of one, in menu order", () => {
    expect(shape(api({ menuOrder: ["c"] }))).toEqual(["c:c", "a:a", "b:b", "d:d", "e:e"]);
  });

  it("folds a group at the place of its first defined member, members in the group's order", () => {
    // "e" is the first member although "b" comes earlier in menu order.
    expect(shape(api({ menuGroups: [{ title: "G", categories: ["e", "b"] }] }))).toEqual(["a:a", "c:c", "d:d", "G:e+b"]);
  });

  it("follows menuOrder for the anchor member", () => {
    expect(shape(api({ menuOrder: ["d"], menuGroups: [{ title: "G", categories: ["d", "a"] }] }))).toEqual(["G:d+a", "b:b", "c:c", "e:e"]);
  });

  it("drops hidden members; an all-hidden group disappears", () => {
    const a = api({
      menuHidden: ["a", "c", "d"],
      menuGroups: [
        { title: "G1", categories: ["a", "b"] },
        { title: "G2", categories: ["c", "d"] },
      ],
    });
    expect(shape(a)).toEqual(["G1:b", "e:e"]);
    expect(shape(a, { includeHidden: true })).toEqual(["G1:a+b", "G2:c+d", "e:e"]);
  });

  it("uses the anchor's category id as the group id", () => {
    expect(menuGroups(api({ menuGroups: [{ title: "G", categories: ["c", "a"] }] })).map((g) => g.id)).toEqual(["b", "c", "d", "e"]);
  });

  it("every group member names a real category, and no category is in two groups", () => {
    for (const a of apis) {
      const ids = new Set(a.categories.map((c) => c.id));
      const seen = new Set<string>();
      for (const g of a.menuGroups ?? []) {
        expect(g.categories.length, `${a.id}:${g.title}`).toBeGreaterThan(1);
        for (const id of g.categories) {
          expect(ids.has(id), `${a.id}:${g.title}:${id}`).toBe(true);
          expect(seen.has(id), `${a.id}:${id} is in two groups`).toBe(false);
          seen.add(id);
        }
      }
    }
  });

  it("menu groups never lose or duplicate a menu category", () => {
    for (const a of apis) {
      const fromGroups = menuGroups(a).flatMap((g) => g.categories.map((c) => c.id));
      expect([...fromGroups].sort(), a.id).toEqual(menuCategories(a).map((c) => c.id).sort());
      const withHidden = menuGroups(a, { includeHidden: true }).flatMap((g) => g.categories.map((c) => c.id));
      expect([...withHidden].sort(), a.id).toEqual(a.categories.map((c) => c.id).sort());
    }
  });

  it("Open API: Dial, then CDR (Simple CDR, CDR); Campaign, Phone Book and AI Analysis groups", () => {
    const groups = shape(getApi("openapi")!);
    expect(groups.slice(0, 2)).toEqual(["Dial:dial", "CDR:simplecdr+cdr"]);
    expect(groups).toContain("Campaign:campaign+campaignnumber");
    expect(groups).toContain("Phone Book:phonebook+phonebookentry");
    expect(groups).toContain("AI Analysis:aianalysis+ailogs");
  });

  it("Proxy API: CHANNELS, PEERS, QUEUE and FLOWS groups at their first member's place; COUNTCALLS alone", () => {
    const proxy = getApi("proxy")!;
    const groups = shape(proxy);
    expect(groups).toContain("CHANNELS:channel+channels+countchannels");
    expect(groups).toContain("PEERS:peers+countpeers");
    expect(groups).toContain("QUEUE:queue+queuereset");
    expect(groups).toContain("FLOWS:flows+setflow");
    expect(groups).toContain("COUNTCALLS:countcalls");
    const ids = menuGroups(proxy).map((g) => g.id);
    const menu = menuCategories(proxy).map((c) => c.id).filter((id) => ids.includes(id));
    expect(ids).toEqual(menu);
  });
});
