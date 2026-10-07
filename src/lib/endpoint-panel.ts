import "server-only";
import type { RenderedSample } from "@/components/code/code-tabs";
import type { RequestPanelData } from "@/components/reference/request-panel";
import { getEndpointExamples } from "@/content/examples";
import type { ApiDefinition, Endpoint } from "@/content/types";
import { buildSample, exampleEndpoint, sampleLanguages } from "./code-samples";
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

/** A named official example with its request samples pre-rendered. */
export interface RenderedExample {
  title: string;
  description: string;
  keyKind: "tenant" | "global";
  samples: RenderedSample[];
}

/** Pre-renders every named official example for one endpoint (none for most APIs). */
export async function buildExamples(api: ApiDefinition, endpoint: Endpoint): Promise<RenderedExample[]> {
  return Promise.all(
    getEndpointExamples(api.id, endpoint.id).map(async (ex) => ({
      title: ex.title,
      description: ex.description,
      keyKind: ex.keyKind,
      samples: await buildSamples(api, exampleEndpoint(endpoint, ex)),
    })),
  );
}

/** Pre-renders request samples and response examples on the server. */
export async function buildPanelData(api: ApiDefinition, endpoint: Endpoint): Promise<RequestPanelData> {
  const samples = await buildSamples(api, endpoint);
  const responses = await Promise.all(
    endpoint.responses.map(async (r) => {
      const base = {
        status: r.status,
        evidence: r.evidence,
        binary: r.format === "binary",
        schemaOnly: r.example === undefined && (r.schema?.length ?? 0) > 0,
      };
      if (r.example === undefined) return { ...base, code: null, html: null };
      // A non-JSON response's example (plain, csv, xml) is the body itself, not a JSON string literal.
      const raw = typeof r.example === "string" && r.format !== undefined && r.format !== "json";
      const code = raw ? (r.example as string) : JSON.stringify(r.example, null, 2);
      const lang = raw ? (r.format === "xml" ? "xml" : "text") : "json";
      return { ...base, code, html: await highlight(code, lang) };
    }),
  );
  const examples = await buildExamples(api, endpoint);
  return { samples, responses, examples };
}
