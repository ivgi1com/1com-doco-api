// Usage: node scripts/openapi-operations.mjs source-docs/openapi source-docs/openapi/operations.json
// Generates source-docs/openapi/operations.json from each resource file's
// "## Operations" section (see extract-ops.mjs). Endpoint ids follow the
// src/content/openapi convention: <slug>-list|get|create|update|delete for
// the standard set; named ids for the rest.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2];
const outFile = process.argv[3];
const resources = JSON.parse(readFileSync(join(dir, "resources.json"), "utf8")).pages;

const SPECIAL = {
  "GET /extensions/number/{number}": "extensions-get-by-number",
  "GET /extensions/state": "extensions-state-get",
  "POST /dial": "dial",
  "POST /auth/token": "auth-token-create",
  "DELETE /auth/token": "auth-token-delete",
  "GET /cdrs": "cdrs-list",
  "GET /simplecdrs": "simplecdrs-list",
  "GET /ailogs": "ailogs-list",
  "GET /aianalysis": "aianalysis-get",
};

const operations = [];
for (const file of readdirSync(dir).filter((f) => f.endsWith(".md") && !f.startsWith("_") && f !== "README.md").sort()) {
  const text = readFileSync(join(dir, file), "utf8");
  const start = text.indexOf("## Operations");
  const end = text.indexOf("\n## ", start + 5);
  const section = text.slice(start, end === -1 ? undefined : end);
  const found = [];
  for (const line of section.split("\n")) {
    const m = line.match(/^\|\s*([^|]+?)\s*\|\s*`(GET|POST|PATCH|PUT|DELETE) (\/[^`?\s]*)[^`]*`/);
    if (m) found.push({ method: m[2], path: m[3] });
  }
  if (found.length === 0) {
    for (const line of section.split("\n")) {
      const m = line.match(/^###\s+(GET|POST|PATCH|PUT|DELETE)\s+(\/[^\s(]*)/);
      if (m) found.push({ method: m[1], path: m[2] });
    }
  }
  const page = resources.find((p) => p.file === `source-docs/openapi/${file}`);
  if (!page) throw new Error(`no resources.json entry for ${file}`);
  const slug = file.replace(/\.md$/, "");
  for (const { method, path } of found) {
    const key = `${method} ${path}`;
    let id = SPECIAL[key];
    if (!id) {
      const item = path !== `/${slug}`;
      id = {
        GET: item ? `${slug}-get` : `${slug}-list`,
        POST: `${slug}-create`,
        PATCH: `${slug}-update`,
        PUT: `${slug}-replace`,
        DELETE: `${slug}-delete`,
      }[method];
    }
    operations.push({
      id,
      method,
      path,
      operationClass: method === "GET" ? "read" : "write",
      file: `source-docs/openapi/${file}`,
      page: page.slug,
      securityReview: page.securityReview,
    });
  }
}

const ids = operations.map((o) => o.id);
const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
if (dup.length) throw new Error(`duplicate ids: ${dup.join(", ")}`);

const doc = {
  $comment:
    "Generated from the 'Operations' section of each source-docs/openapi/<resource>.md (Phase 8 Stage 1). One entry per documented method + path. tests/unit/openapi-coverage.test.ts checks src/content/openapi against it.",
  counts: {
    resources: new Set(operations.map((o) => o.file)).size,
    operations: operations.length,
    read: operations.filter((o) => o.operationClass === "read").length,
    write: operations.filter((o) => o.operationClass === "write").length,
  },
  operations,
};
writeFileSync(outFile, JSON.stringify(doc, null, 2) + "\n");
console.log(doc.counts);
