import "server-only";
import type { RenderedSample } from "@/components/code/code-tabs";
import type { RequestPanelData } from "@/components/reference/request-panel";
import type { ApiDefinition, Endpoint } from "@/content/types";
import { buildSample, sampleLanguages } from "./code-samples";
import { highlight } from "./highlight";

/** Pre-renders the request code samples (curl/JS/Python) for one endpoint. */
export async function buildSamples(api: ApiDefinition, endpoint: Endpoint): Promise<RenderedSample[]> {
  return Promise.all(
    sampleLanguages.map(async (lang) => {
      const code = buildSample(endpoint, api.baseUrl, lang.id);
      return {
        id: lang.id,
        label: lang.label,
        code,
        html: await highlight(code, lang.shiki),
        lines: code.split("\n").length,
      };
    }),
  );
}

/** Pre-renders request samples and response examples on the server. */
export async function buildPanelData(api: ApiDefinition, endpoint: Endpoint): Promise<RequestPanelData> {
  const samples = await buildSamples(api, endpoint);
  const responses = await Promise.all(
    endpoint.responses.map(async (r) => {
      if (r.example === undefined) return { status: r.status, code: null, html: null };
      const code = JSON.stringify(r.example, null, 2);
      return { status: r.status, code, html: await highlight(code, "json") };
    }),
  );
  return { samples, responses };
}
