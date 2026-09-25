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
export function authEnvVar(endpoint: Endpoint): string {
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
  // Authorization header, so they get their own branch per language rather
  // than threading query-vs-header auth through every line below.
  if (queryAuth) return buildQueryAuthSample(endpoint, `${baseUrl}${path}`, envVar, language);

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
 * How a sample reads the response: from the first documented response's
 * format. With no documented response the body is read as text — the
 * Proxy API's default output is plain text (DOCS_AUDIT.md A-40, A-43).
 */
function responseKind(endpoint: Endpoint): "json" | "binary" | "text" {
  const format = endpoint.responses[0]?.format;
  if (format === "json") return "json";
  if (format === "binary") return "binary";
  return "text";
}

/** Shell single-quote escaping for a literal argument. */
function shellQuote(value: string): string {
  return `'${value.replaceAll("'", `'\\''`)}'`;
}

/**
 * Query-parameter auth. The credential and every operation selector travel
 * in the query string (as the Proxy API source shows them); a POST body,
 * when the operation has one, carries only the documented body field.
 */
function buildQueryAuthSample(
  endpoint: Endpoint,
  url: string,
  envVar: string,
  language: SampleLanguage,
): string {
  const pairs = queryEntries(endpoint);
  const encoding = endpoint.requestBodyEncoding;
  const formField = encoding?.kind === "form-json-field" ? encoding.field : null;
  const multipart = encoding?.kind === "multipart" ? encoding : null;
  const hasBody = endpoint.method !== "GET" && (formField !== null || multipart !== null);
  const kind = responseKind(endpoint);

  switch (language) {
    case "curl": {
      const value = (v: string) => (v === "__AUTH_KEY__" ? `$${envVar}` : v);
      if (!hasBody) {
        const lines = [
          `curl -G "${url}"`,
          ...pairs.map(([k, v]) => `  --data-urlencode "${k}=${value(v)}"`),
        ];
        if (kind === "binary") lines.push(`  --output response.bin`);
        return lines.join(" \\\n");
      }
      // --url-query (curl 7.87+) adds query parameters without turning the
      // request into a GET, so the body below still goes out as a POST.
      const lines = [
        `curl "${url}"`,
        ...pairs.map(([k, v]) => `  --url-query "${k}=${value(v)}"`),
      ];
      if (formField) {
        lines.push(`  --data-urlencode ${shellQuote(`${formField}=${JSON.stringify(endpoint.requestExample ?? {})}`)}`);
      }
      if (multipart) lines.push(`  -F "${multipart.fileField}=@${multipart.exampleFile}"`);
      if (kind === "binary") lines.push(`  --output response.bin`);
      return lines.join(" \\\n");
    }
    case "javascript": {
      const paramLines = pairs.map(
        ([k, v]) =>
          `  ${JSON.stringify(k)}: ${v === "__AUTH_KEY__" ? `process.env.${envVar}` : JSON.stringify(v)},`,
      );
      const lines: string[] = [];
      if (multipart) lines.push(`import { openAsBlob } from "node:fs";`, ``);
      lines.push(`const params = new URLSearchParams({`, ...paramLines, `});`);
      if (formField) {
        const json = JSON.stringify(endpoint.requestExample ?? {}, null, 2).replace(/\n/g, "\n  ");
        lines.push(
          `const body = new URLSearchParams({`,
          `  ${JSON.stringify(formField)}: JSON.stringify(${json}),`,
          `});`,
        );
      }
      if (multipart) {
        lines.push(
          `const body = new FormData();`,
          `body.append(${JSON.stringify(multipart.fileField)}, await openAsBlob(${JSON.stringify(multipart.exampleFile)}), ${JSON.stringify(multipart.exampleFile)});`,
        );
      }
      lines.push(
        hasBody
          ? `const response = await fetch(\`${url}?\${params}\`, { method: "POST", body });`
          : `const response = await fetch(\`${url}?\${params}\`);`,
      );
      if (kind === "json") lines.push(`const data = await response.json();`, `console.log(data);`);
      else if (kind === "binary") lines.push(`const bytes = new Uint8Array(await response.arrayBuffer());`, `console.log(bytes.length);`);
      else lines.push(`const text = await response.text();`, `console.log(text);`);
      return lines.join("\n");
    }
    case "python": {
      const indent = multipart ? "    " : "";
      const paramLines = pairs.map(
        ([k, v]) =>
          `${indent}        ${JSON.stringify(k)}: ${v === "__AUTH_KEY__" ? `os.environ[${JSON.stringify(envVar)}]` : JSON.stringify(v)},`,
      );
      const call = [
        `${indent}response = requests.${hasBody ? "post" : "get"}(`,
        `${indent}    "${url}",`,
        `${indent}    params={`,
        ...paramLines,
        `${indent}    },`,
        ...(formField
          ? [`${indent}    data={${JSON.stringify(formField)}: json.dumps(${pythonLiteral(endpoint.requestExample ?? {})})},`]
          : []),
        ...(multipart ? [`${indent}    files={${JSON.stringify(multipart.fileField)}: file},`] : []),
        `${indent}    timeout=10,`,
        `${indent})`,
      ];
      const tail =
        kind === "json"
          ? `print(response.json())`
          : kind === "binary"
            ? `with open("response.bin", "wb") as out:\n    out.write(response.content)`
            : `print(response.text)`;
      return [
        ...(formField ? [`import json`] : []),
        `import os`,
        `import requests`,
        ``,
        ...(multipart ? [`with open(${JSON.stringify(multipart.exampleFile)}, "rb") as file:`] : []),
        ...call,
        tail,
      ].join("\n");
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
