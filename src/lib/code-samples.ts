import type { Endpoint } from "@/content/types";

export type SampleLanguage = "curl" | "javascript" | "python";

export const sampleLanguages: { id: SampleLanguage; label: string; shiki: string }[] = [
  { id: "curl", label: "cURL", shiki: "bash" },
  { id: "javascript", label: "JavaScript", shiki: "javascript" },
  { id: "python", label: "Python", shiki: "python" },
];

/** Placeholder, never a realistic-looking secret (MASTER.md "Code blocks"). */
export const API_KEY_ENV = "SAMPLE_API_KEY";

/** Substitutes path parameters with their documented example values. */
export function resolvePath(endpoint: Endpoint): string {
  return endpoint.pathParameters.reduce(
    (path, param) =>
      path.replaceAll(`{${param.name}}`, String(param.example ?? `<${param.name}>`)),
    endpoint.path,
  );
}

export function exampleQuery(endpoint: Endpoint): string {
  const pairs = endpoint.queryParameters
    .filter((p) => p.example !== undefined)
    .map((p) => `${encodeURIComponent(p.name)}=${encodeURIComponent(String(p.example))}`);
  return pairs.length ? `?${pairs.join("&")}` : "";
}

export function buildSample(
  endpoint: Endpoint,
  baseUrl: string,
  language: SampleLanguage,
): string {
  const url = `${baseUrl}${resolvePath(endpoint)}${exampleQuery(endpoint)}`;
  const body = endpoint.requestExample
    ? JSON.stringify(endpoint.requestExample, null, 2)
    : null;

  switch (language) {
    case "curl": {
      const lines = [
        `curl -X ${endpoint.method} "${url}"`,
        `  -H "Authorization: Bearer $${API_KEY_ENV}"`,
      ];
      if (body) {
        lines.push(`  -H "Content-Type: application/json"`);
        lines.push(`  -d '${JSON.stringify(endpoint.requestExample)}'`);
      }
      return lines.join(" \\\n");
    }
    case "javascript": {
      const opts = [
        `  method: "${endpoint.method}",`,
        `  headers: {`,
        `    Authorization: \`Bearer \${process.env.${API_KEY_ENV}}\`,`,
        ...(body ? [`    "Content-Type": "application/json",`] : []),
        `  },`,
        ...(body ? [`  body: JSON.stringify(${body.replace(/\n/g, "\n  ")}),`] : []),
      ];
      const tail =
        endpoint.responses[0]?.status === 204
          ? `console.log(response.status);`
          : `const data = await response.json();\nconsole.log(data);`;
      return `const response = await fetch("${url}", {\n${opts.join("\n")}\n});\n${tail}`;
    }
    case "python": {
      const args = [
        `    "${url}",`,
        `    headers={"Authorization": f"Bearer {os.environ['${API_KEY_ENV}']}"},`,
        ...(body ? [`    json=${pythonLiteral(endpoint.requestExample)},`] : []),
        `    timeout=10,`,
      ];
      const tail =
        endpoint.responses[0]?.status === 204
          ? `print(response.status_code)`
          : `print(response.json())`;
      return `import os\nimport requests\n\nresponse = requests.${endpoint.method.toLowerCase()}(\n${args.join("\n")}\n)\n${tail}`;
    }
  }
}

/**
 * Serializes a plain JSON-ish value as a Python literal. A regex over
 * `JSON.stringify` output would also rewrite `true`/`false`/`null` found
 * inside string values; walking the structure keeps string content intact.
 */
function pythonLiteral(value: unknown): string {
  if (value === null || value === undefined) return "None";
  if (typeof value === "boolean") return value ? "True" : "False";
  if (typeof value === "number") return String(value);
  if (typeof value === "string") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(pythonLiteral).join(", ")}]`;
  const entries = Object.entries(value as Record<string, unknown>);
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}: ${pythonLiteral(v)}`).join(", ")}}`;
}
