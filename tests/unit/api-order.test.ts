import { describe, expect, it } from "vitest";
import { apis, defaultEndpoint, listEndpoints } from "@/content";
import en from "../../messages/en.json";
import he from "../../messages/he.json";

/** Phase 8E Stage 5 (brief item 8): Open API first and default, Proxy legacy, Sample last. */
describe("API order and defaults (8E)", () => {
  it("lists Open API first, Proxy second, Sample last", () => {
    expect(apis.map((a) => a.id)).toEqual(["openapi", "proxy", "sample"]);
  });

  it("marks only the Proxy API as legacy", () => {
    expect(apis.filter((a) => a.legacy).map((a) => a.id)).toEqual(["proxy"]);
    expect(en.nav.legacyApi).toContain("{name}");
    expect(he.nav.legacyApi).toContain("{name}");
  });

  it("opens the Open API Playground on Simple CDR, a documented read", () => {
    const openapi = apis[0];
    expect(openapi.defaultEndpoint).toBe("simplecdrs-list");
    const endpoint = defaultEndpoint(openapi);
    expect(endpoint.id).toBe("simplecdrs-list");
    expect(endpoint.method).toBe("GET");
  });

  it("every declared defaultEndpoint exists; others fall back to the first endpoint", () => {
    for (const api of apis) {
      const ids = listEndpoints(api).map((e) => e.id);
      if (api.defaultEndpoint) expect(ids).toContain(api.defaultEndpoint);
      else expect(defaultEndpoint(api).id).toBe(ids[0]);
    }
  });
});
