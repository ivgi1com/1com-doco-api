import type { Endpoint } from "@/content/types";

export type SampleLanguage = "curl" | "javascript" | "python";

export const sampleLanguages: { id: SampleLanguage; label: string; shiki: string }[] = [
  { id: "curl", label: "cURL", shiki: "bash" },
  { id: "javascript", label: "JavaScript", shiki: "javascript" },
  { id: "python", label: "Python", shiki: "python" },
];

/** Placeholder, never a realistic-looking secret (MASTER.md "Code blocks"). */
export const API_KEY_ENV = "SAMPLE_API_KEY";

/** Env var name for an endpoint's credential. Header-auth endpoints keep the original constant. */
function authEnvVar(endpoint: Endpoint): string {
  if (endpoint.authentication.location === "query") return `${endpoint.api.toUpperCase()}_API_KEY`;
  return API_KEY_ENV;
}

/**
 * Query-parameter pairs for a request: the auth key (if sent as a query
 * parameter, using the `__AUTH_KEY__` placeholder so each language renders
 * its own env-var syntax), fixed operation selectors, then documented
 * example query values. Order mirrors how the source's own examples read.
 */
function queryEntries(endpoint: Endpoint): [string, string][] {
  const pairs: [string, string][] = [];
  if (endpoint.authentication.location === "query" && endpoint.authentication.parameter) {
    pairs.push([endpoint.authentication.parameter, "__AUTH_KEY__"]);
  }
  if (endpoint.fixedQuery) pairs.push(...Object.entries(endpoint.fixedQuery));
  for (const p of endpoint.queryParameters) {
    if (p.example !== undefined) pairs.push([p.name, String(p.example)]);
  }
  return pairs;
}

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
  const path = resolvePath(endpoint);
  const queryAuth = endpoint.authentication.location === "query";
  const envVar = authEnvVar(endpoint);
  const body = endpoint.requestExample
    ? JSON.stringify(endpoint.requestExample, null, 2)
    : null;

  // Query-auth endpoints (e.g. the Proxy API's `key` query parameter) send no
  // Authorization header and have no request body in this portal yet, so
  // they get their own simpler branch per language rather than threading
  // query-vs-header auth through every line below.
  if (queryAuth) {
    const pairs = queryEntries(endpoint);
    switch (language) {
      case "curl": {
        const lines = [
          `curl -G "${baseUrl}${path}"`,
          ...pairs.map(
            ([k, v]) => `  --data-urlencode "${k}=${v === "__AUTH_KEY__" ? `$${envVar}` : v}"`,
          ),
        ];
        return lines.join(" \\\n");
      }
      case "javascript": {
        const paramLines = pairs.map(
          ([k, v]) =>
            `  ${JSON.stringify(k)}: ${v === "__AUTH_KEY__" ? `process.env.${envVar}` : JSON.stringify(v)},`,
        );
        return [
          `const params = new URLSearchParams({`,
          ...paramLines,
          `});`,
          `const response = await fetch(\`${baseUrl}${path}?\${params}\`);`,
          `const data = await response.json();`,
          `console.log(data);`,
        ].join("\n");
      }
      case "python": {
        const paramLines = pairs.map(
          ([k, v]) =>
            `        ${JSON.stringify(k)}: ${v === "__AUTH_KEY__" ? `os.environ[${JSON.stringify(envVar)}]` : JSON.stringify(v)},`,
        );
        return [
          `import os`,
          `import requests`,
          ``,
          `response = requests.get(`,
          `    "${baseUrl}${path}",`,
          `    params={`,
          ...paramLines,
          `    },`,
          `    timeout=10,`,
          `)`,
          `print(response.json())`,
        ].join("\n");
      }
    }
  }

  const url = `${baseUrl}${path}${exampleQuery(endpoint)}`;

  switch (language) {
    case "curl": {
      const lines = [
        `curl -X ${endpoint.method} "${url}"`,
        `  -H "Authorization: Bearer $${envVar}"`,
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
        `    Authorization: \`Bearer \${process.env.${envVar}}\`,`,
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
        `    headers={"Authorization": f"Bearer {os.environ['${envVar}']}"},`,
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
