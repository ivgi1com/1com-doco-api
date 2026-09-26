// Usage: node scripts/openapi-examples.mjs [--dump]
// Generates source-docs/openapi/examples.json from the official page
// snapshots in source-docs/raw/mirta-openapi/*.md (Phase 8A). Every
// heading whose first code block is a curl call becomes one named example:
// title, description, method, path, query, body and key kind, matched to an
// operation in source-docs/openapi/operations.json.
//
// Values that look like real data are normalized before anything is written
// (docs/OPENAPI_DOCUMENTATION_INSTRUCTIONS.md, "normalize them before
// committing"): see NORMALIZE below. `--dump` prints every distinct string
// value found in queries and bodies, for reviewing that map.
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAW = "source-docs/raw/mirta-openapi";
const OUT = "source-docs/openapi/examples.json";
const { operations } = JSON.parse(readFileSync("source-docs/openapi/operations.json", "utf8"));
const { pages } = JSON.parse(readFileSync("source-docs/openapi/resources.json", "utf8"));

/**
 * Exact-value replacements, applied to every query value and every string
 * inside a body (recursively), and to substrings of the tenant wildcard.
 * Keys are the official page's own example values.
 */
const NORMALIZE = JSON.parse(readFileSync("scripts/openapi-examples-normalize.json", "utf8"));
/** Body keys whose value is a credential: always replaced, whatever the source shows. */
const SECRET_KEYS = /(password|secret|pin|pincode|token)$/i;

function normalizeString(s) {
  if (Object.hasOwn(NORMALIZE.exact, s)) return NORMALIZE.exact[s];
  let out = s;
  for (const [from, to] of Object.entries(NORMALIZE.substring)) out = out.split(from).join(to);
  return out;
}

function normalizeValue(v, key) {
  if (typeof v === "string") return key && SECRET_KEYS.test(key) ? "SYNTHETIC_SECRET" : normalizeString(v);
  if (Array.isArray(v)) return v.map((x) => normalizeValue(x, key));
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, normalizeValue(x, k)]));
  return v;
}

/** Splits a page into headings, each with its prose and its code blocks. */
function sections(text) {
  const out = [];
  let cur = null;
  let inCode = false;
  let code = [];
  for (const line of text.split("\n")) {
    if (line.startsWith("```")) {
      if (inCode) {
        cur?.blocks.push(code.join("\n"));
        code = [];
      }
      inCode = !inCode;
      continue;
    }
    if (inCode) {
      code.push(line);
      continue;
    }
    const h = line.match(/^(#{2,3})\s+(.+)$/);
    if (h) {
      cur = { level: h[1].length, title: h[2].trim(), prose: [], blocks: [] };
      out.push(cur);
    } else if (cur && cur.blocks.length === 0 && line.trim()) {
      cur.prose.push(line.trim());
    }
  }
  return out;
}

function parseCurl(block) {
  const flat = block.replace(/\\\n/g, " ");
  const url = flat.match(/"(https:\/\/pbx\.example\.com\/pbx\/openapi\.php[^"]*)"/)?.[1];
  if (!url) return null;
  const method = flat.match(/-X\s+(GET|POST|PATCH|PUT|DELETE)/)?.[1] ?? "GET";
  const keyKind = /GLOBAL_API_KEY/.test(flat) ? "global" : "tenant";
  let body;
  const d = flat.match(/-d\s+'([\s\S]*?)'(\s|$)/);
  if (d) body = JSON.parse(d[1]);
  const u = new URL(url);
  const path = decodeURIComponent(u.pathname.replace(/^\/pbx\/openapi\.php/, ""));
  const query = Object.fromEntries(u.searchParams.entries());
  return { method, path, query, body, keyKind };
}

/** Converts an operation path template into a matcher. */
function templateRe(path) {
  return new RegExp(`^${path.replace(/\{[^}]+\}/g, "[^/]+")}$`);
}

/** Documented path aliases per resource file, from each raw page's "Path aliases" row. */
const aliasesByFile = {};

function matchOperation(ex, file) {
  const own = operations.filter((o) => o.file === file && o.method === ex.method);
  const exact = own.find((o) => templateRe(o.path).test(ex.path));
  if (exact) return { id: exact.id };
  // A documented alias path, e.g. /call for /cdrs: map it onto the primary path.
  for (const alias of aliasesByFile[file] ?? []) {
    for (const o of own) {
      const primary = o.path.split("/")[1];
      const rewritten = ex.path.replace(new RegExp(`^${alias}(?=/|$)`), `/${primary}`);
      if (rewritten !== ex.path && templateRe(o.path).test(rewritten)) return { id: o.id, alias };
    }
  }
  // Reporting endpoints document that a path segment maps to the `id` filter (e.g. /cdrs/123).
  const list = own.find((o) => ex.path.startsWith(`${o.path}/`) && !o.path.includes("{"));
  if (list && own.length === 1) return { id: list.id, pathFilter: true };
  return null;
}

const resourceFileFor = Object.fromEntries(pages.map((p) => [p.slug, p.file]));
const examples = [];
const unmatched = [];
const strings = new Map();

for (const raw of readdirSync(RAW).filter((f) => f.endsWith(".md")).sort()) {
  const slug = raw.replace(/\.md$/, "");
  const file = resourceFileFor[slug];
  if (!file) continue; // overview-and-examples: cross-resource, not tied to one operation
  const text = readFileSync(join(RAW, raw), "utf8").replace(/\r\n/g, "\n");
  const aliasCell = text.match(/Path aliases<\/td><td>([^<]*)</)?.[1] ?? "";
  aliasesByFile[file] = [...aliasCell.matchAll(/`(\/[^`]+)`/g)].map((m) => m[1]);
  for (const s of sections(text)) {
    const curlBlock = s.blocks.find((b) => b.includes("curl"));
    if (!curlBlock) continue;
    const parsed = parseCurl(curlBlock);
    if (!parsed) continue;
    for (const v of Object.values(parsed.query)) strings.set(v, (strings.get(v) ?? 0) + 1);
    (function walk(v) {
      if (typeof v === "string") strings.set(v, (strings.get(v) ?? 0) + 1);
      else if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === "object") Object.values(v).forEach(walk);
    })(parsed.body);
    const match = matchOperation(parsed, file);
    const title = s.title.replace(/\\_/g, "_");
    const entry = {
      operationId: match?.id ?? null,
      title,
      description: s.prose.join(" ").replace(/\\_/g, "_"),
      method: parsed.method,
      path: normalizeString(parsed.path),
      query: normalizeValue(parsed.query),
      ...(parsed.body !== undefined ? { body: normalizeValue(parsed.body) } : {}),
      keyKind: parsed.keyKind,
      ...(match?.alias ? { viaAlias: match.alias } : {}),
      source: `${RAW}/${raw}`,
    };
    if (match) examples.push(entry);
    else unmatched.push(entry);
  }
}

if (process.argv.includes("--dump")) {
  for (const [v, n] of [...strings].sort((a, b) => b[1] - a[1])) console.log(`${n}\t${JSON.stringify(v)}`);
  console.log(`\n${examples.length} matched, ${unmatched.length} unmatched`);
  for (const u of unmatched) console.log(`UNMATCHED ${u.source}: ${u.title} — ${u.method} ${u.path}`);
  process.exit(0);
}

const doc = {
  $comment:
    "Generated by scripts/openapi-examples.mjs from source-docs/raw/mirta-openapi (Phase 8A). One entry per named official example, matched to an operation in operations.json. Values that look like real data are normalized (scripts/openapi-examples-normalize.json). Do not edit by hand.",
  counts: { matched: examples.length, unmatched: unmatched.length },
  examples,
  unmatched,
};
writeFileSync(OUT, `${JSON.stringify(doc, null, 2)}\n`);
console.log(`${OUT}: ${examples.length} matched, ${unmatched.length} unmatched`);
