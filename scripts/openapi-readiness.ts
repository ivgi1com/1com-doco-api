/**
 * Phase 8D readiness gate (docs/phases/08D-pre-stage6-readiness-gate.md):
 * the reconciled OpenAPI coverage table, mismatch classification and the
 * deterministic boundary checks. Writes source-docs/OPENAPI_READINESS.md and
 * exits non-zero on any unexplained gap or failed boundary check.
 *
 *   npm run readiness:openapi        (run `npm run build` first for the bundle scan)
 *
 * This is a readiness check, not the Stage 6 security review.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { getApi, listEndpoints } from "../src/content";
import { getDemoFixtures, isDemoSimulatedWrite } from "../src/content/demo";
import { observedOperationIds, withObserved } from "../src/content/observed";
import { listLiveTargetIds } from "../src/server/playground/allowlist";

const root = resolve(__dirname, "..");
const BASE_REF = "main"; // the last approved stable state (be23fb2 at 8D)

interface OpRow {
  id: string;
  operationClass: "read" | "write";
  file: string;
  securityReview: string;
}
interface Page {
  slug: string;
  pageType: string;
  docStatus: string;
  securityReview: string;
  file: string;
  unresolved: string[];
}

const rows = (JSON.parse(readFileSync(resolve(root, "source-docs/openapi/operations.json"), "utf8")) as { operations: OpRow[] })
  .operations;
const pages = (JSON.parse(readFileSync(resolve(root, "source-docs/openapi/resources.json"), "utf8")) as { pages: Page[] }).pages.filter(
  (p) => p.pageType === "resource",
);
const portalExclusions = JSON.parse(readFileSync(resolve(root, "source-docs/portal-exclusions.json"), "utf8")) as {
  reason: string;
  openapi: { operations: string[]; resources: string[] };
};
/** Baseline operations deliberately left out of the customer portal (Phase 8E). */
const EXCLUDED = new Set(portalExclusions.openapi.operations);
const api = getApi("openapi")!;
const eps = listEndpoints(api);
const epById = new Map(eps.map((e) => [e.id, e]));
const pageByFile = new Map(pages.map((p) => [p.file, p]));
const files = [...new Set(rows.map((r) => r.file))];

const has2xx = (e: { responses: { status: number; schema?: unknown[]; example?: unknown }[] }) =>
  e.responses.some((r) => r.status >= 200 && r.status < 300 && ((r.schema?.length ?? 0) > 0 || r.example !== undefined));

// --- per-surface sets -------------------------------------------------------
const referenceOps = rows.filter((r) => epById.has(r.id));
const playgroundOps = referenceOps; // the picker lists every content endpoint (EndpointPicker)
const vendorRaw = rows.filter((r) => {
  const e = epById.get(r.id);
  return e && has2xx(e);
});
const observedIds = new Set(observedOperationIds());
const refWithObserved = rows.filter((r) => {
  const e = epById.get(r.id);
  return e && has2xx(withObserved("openapi", e));
});
const refObservedOnly = rows.filter((r) => observedIds.has(r.id) && !vendorRaw.includes(r));
const baselineDocumentedFiles = new Set(pages.filter((p) => !p.unresolved.some((u) => /response schema/i.test(u))).map((p) => p.file));
const baselineDocumented = rows.filter((r) => baselineDocumentedFiles.has(r.file));
const demoReads = rows.filter((r) => r.operationClass === "read" && getDemoFixtures("openapi", r.id));
const demoWrites = rows.filter((r) => r.operationClass === "write" && isDemoSimulatedWrite("openapi", { id: r.id, operationClass: "write" }));
const demoOps = [...demoReads, ...demoWrites];
const live = listLiveTargetIds().filter((id) => id.startsWith("openapi/"));
const blockLive = rows.filter((r) => r.securityReview === "BLOCK LIVE");
const resourcesWith = (set: OpRow[]) => files.filter((f) => set.some((r) => r.file === f)).length;
const resourcesAll = (set: OpRow[]) => files.filter((f) => rows.filter((r) => r.file === f).every((r) => set.includes(r))).length;
const blockLiveCited = blockLive.filter((r) => (epById.get(r.id)?.notes ?? []).some((n) => /SEC-REQ/.test(n)));

// --- mismatch classification ------------------------------------------------
type Category =
  | "implementation gap"
  | "intentionally unsupported"
  | "security-blocked"
  | "documentation UNKNOWN"
  | "out of scope by explicit decision"
  | "UNEXPLAINED";

function demoGap(r: OpRow): { category: Category; reason: string } | null {
  if (demoOps.includes(r)) return null;
  if (EXCLUDED.has(r.id)) return { category: "out of scope by explicit decision", reason: "excluded from the customer portal (administrative API Key; source-docs/portal-exclusions.json)" };
  if (r.operationClass === "write") {
    return /^(auth-token|dial)/.test(r.id)
      ? { category: "security-blocked", reason: "SEC-REQ-06: categorically never Demo- or Live-reachable" }
      : { category: "documentation UNKNOWN", reason: "no documented success response to simulate (SEC-REQ-27, amended 8C)" };
  }
  if (r.id === "cdrs-list") return { category: "intentionally unsupported", reason: "not probed: documented possible side effect (CDR metadata repair)" };
  if (r.id === "ailogs-list") return { category: "documentation UNKNOWN", reason: "HTTP 404 on the test PBX, no observable success response" };
  if (/^tenantvariables-/.test(r.id)) return { category: "documentation UNKNOWN", reason: "empty on the test PBX, no fixturable data" };
  return { category: "UNEXPLAINED", reason: "read without Demo data and no recorded reason" };
}
const gaps = rows.map((r) => ({ r, g: demoGap(r) })).filter((x): x is { r: OpRow; g: { category: Category; reason: string } } => x.g !== null);
const byCategory = new Map<Category, number>();
for (const { g } of gaps) byCategory.set(g.category, (byCategory.get(g.category) ?? 0) + 1);

const implGaps: string[] = [];
for (const r of rows) {
  if (!epById.has(r.id) && !EXCLUDED.has(r.id)) implGaps.push(`${r.id}: no Reference/Playground endpoint`);
  if (epById.has(r.id) && EXCLUDED.has(r.id)) implGaps.push(`${r.id}: excluded from the customer portal but still present`);
}
for (const f of files) if (!pageByFile.has(f)) implGaps.push(`${f}: no baseline resource page`);

const schemaDiscrepancies = rows.filter((r) => vendorRaw.includes(r) && !baselineDocumentedFiles.has(r.file));
const unexplained = gaps.filter(({ g }) => g.category === "UNEXPLAINED").map(({ r }) => r.id);

// --- boundary checks --------------------------------------------------------
const checks: { name: string; ok: boolean; detail: string }[] = [];
const git = (...args: string[]) => execFileSync("git", args, { cwd: root, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });

checks.push({
  name: "No OpenAPI id on the Live allowlist",
  ok: live.length === 0,
  detail: `Live allowlist: ${listLiveTargetIds().join(", ")}`,
});
checks.push({
  name: "Live allowlist is exactly the three approved Proxy reads",
  ok: [...listLiveTargetIds()].sort().join() === "proxy/cdr-get,proxy/info-agents,proxy/info-extensions",
  detail: "no new Live entry since approval",
});
const serverDiff = git("diff", "--name-only", BASE_REF, "--", "src/server", "src/app/api", "src/lib/playground-protocol.ts").trim();
checks.push({
  name: `Server / Live / tenant-isolation code unchanged since ${BASE_REF}`,
  ok: serverDiff === "",
  detail: serverDiff === "" ? "src/server, src/app/api, src/lib/playground-protocol.ts: no diff" : `CHANGED: ${serverDiff.split("\n").join(", ")}`,
});

const diff = git("diff", BASE_REF, "--", ".", ":(exclude)source-docs/raw", ":(exclude)package-lock.json");
const added = diff.split("\n").filter((l) => l.startsWith("+") && !l.startsWith("+++"));
const SECRET_PATTERNS: [string, RegExp][] = [
  ["private key", /BEGIN (RSA |EC |OPENSSH |)PRIVATE KEY/],
  ["provider token", /\b(sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{12,}|xox[bp]-[A-Za-z0-9-]{10,}|ghp_[A-Za-z0-9]{20,})\b/],
  ["JWT", /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\./],
  // A quoted 20+ char value after a key/secret/token name. Documentation
  // placeholders ("generated-token-value", "REPLACE_WITH_A_STRONG_SECRET", "SYNTHETIC_SECRET", ...) are not credentials.
  [
    "inline key value",
    /\b(api[_-]?key|x-api-key|secret|token)\b["']?\s*[:=]\s*["'](?![A-Za-z0-9+/_-]*(generated|example|placeholder|synthetic|redacted|sample|value|replace))[A-Za-z0-9+/_-]{20,}["']/i,
  ],
];
const CUSTOMER_PATTERNS: [string, RegExp][] = [
  // example/test domains and the project's own sender are documentation, not customer data
  ["email address", /\b[A-Za-z0-9._%+-]+@(?!example\.|demo\.|test\.|anthropic\.com|users\.noreply)[A-Za-z0-9.-]+\.[a-z]{2,}\b/i],
  ["Israeli mobile/E.164 number", /(\+972|\b972)[0-9]{8,9}\b|\b05[0-9][-\s]?[0-9]{7}\b/],
];
function scan(patterns: [string, RegExp][]) {
  const hits: string[] = [];
  for (const line of added) for (const [name, re] of patterns) if (re.test(line)) hits.push(`${name}: ${line.slice(0, 90)}`);
  return hits;
}
const secretHits = scan(SECRET_PATTERNS);
const customerHits = scan(CUSTOMER_PATTERNS);
checks.push({ name: `Secret scan of the Phase 8 diff (${added.length} added lines vs ${BASE_REF})`, ok: secretHits.length === 0, detail: secretHits.length ? secretHits.slice(0, 5).join(" | ") : "no hits" });
checks.push({ name: "Customer-data scan of the Phase 8 diff (emails, Israeli numbers)", ok: customerHits.length === 0, detail: customerHits.length ? customerHits.slice(0, 5).join(" | ") : "no hits" });

function walk(dir: string, out: string[]) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(js|css|html|json|map|txt)$/.test(name)) out.push(p);
  }
}
const staticDir = resolve(root, ".next/static");
if (existsSync(staticDir)) {
  const envFile = resolve(root, ".env.local");
  const envValues: [string, string][] = existsSync(envFile)
    ? readFileSync(envFile, "utf8")
        .split(/\r?\n/)
        .map((l) => /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(l))
        .filter((m): m is RegExpExecArray => !!m)
        .map((m) => [m[1], m[2].replace(/^["']|["']$/g, "")] as [string, string])
        .filter(([, v]) => v.length >= 8 && !/^(true|false)$/i.test(v))
    : [];
  const bundle: string[] = [];
  walk(staticDir, bundle);
  const text = bundle.map((f) => readFileSync(f, "utf8"));
  const leaked = envValues.filter(([, v]) => text.some((t) => t.includes(v))).map(([k]) => k);
  const generic = SECRET_PATTERNS.flatMap(([name, re]) => (text.some((t) => re.test(t)) ? [name] : []));
  const probeShipped = text.some((t) => t.includes("probe-2026-09-26"));
  checks.push({
    name: `Client bundle scan (.next/static, ${bundle.length} files, ${envValues.length} env values checked, values never printed)`,
    ok: leaked.length === 0 && generic.length === 0 && !probeShipped,
    detail: leaked.length || generic.length || probeShipped ? `LEAK: ${[...leaked, ...generic, probeShipped ? "probe file name" : ""].filter(Boolean).join(", ")}` : "no env value, key pattern or probe file in the client bundle",
  });
} else {
  checks.push({ name: "Client bundle scan", ok: false, detail: "no .next/static — run `npm run build` first" });
}

// --- report -----------------------------------------------------------------
const table = [
  "| Metric | Baseline | API Reference | Demo | Playground | Live |",
  "|---|---:|---:|---:|---:|---:|",
  `| Resources | ${pages.length} | ${resourcesAll(referenceOps)} | ${resourcesWith(demoOps)} with ≥1 operation | ${resourcesAll(playgroundOps)} | ${resourcesWith(rows.filter((r) => live.includes(`openapi/${r.id}`)))} |`,
  `| Excluded from the customer portal (explicit decision) | ${EXCLUDED.size} operations, ${portalExclusions.openapi.resources.length} resources | — | — | — | — |`,
  `| Operations | ${rows.length} | ${referenceOps.length} | ${demoOps.length} (reads ${demoReads.length}, writes ${demoWrites.length}) | ${playgroundOps.length} | ${live.length} |`,
  `| Response schemas documented (vendor) | ${baselineDocumented.length} (resource-level, see note) | ${vendorRaw.length} | n/a (fixtures are synthetic) | ${vendorRaw.length} | 0 |`,
  `| Response schemas observed (sanitized probe) | 0 | ${refObservedOnly.length} (Reference only) | ${demoReads.filter((r) => observedIds.has(r.id)).length} fixtures mirror an observed shape | 0 (observed layer not applied) | 0 |`,
  `| UNKNOWN response schemas | ${rows.length - baselineDocumented.length} | ${rows.length - refWithObserved.length} | ${rows.length - demoOps.length} no Demo data | ${rows.length - vendorRaw.length} | ${rows.length} (no Live) |`,
  `| Security-blocked operations (BLOCK LIVE label) | ${blockLive.length} | ${blockLiveCited.length} cite a SEC-REQ in their notes | ${blockLive.filter((r) => demoOps.includes(r)).length} have Demo data (secret fields masked, test-enforced) | ${blockLive.filter((r) => playgroundOps.includes(r)).length} visible, none sendable in Live | ${blockLive.filter((r) => live.includes(`openapi/${r.id}`)).length} enabled (all ${rows.length} Live-disabled) |`,
];

const lines = [
  "# OpenAPI readiness gate (Phase 8D)",
  "",
  "Generated by `npm run readiness:openapi` from `source-docs/openapi/{operations,resources}.json`, `src/content` (+ the observed layer), the Demo registry and the real Live allowlist. Do not edit by hand. This is a readiness check, not the Stage 6 security review.",
  "",
  "## Reconciled coverage",
  "",
  ...table,
  "",
  "Definitions:",
  "- *Reference* = the content model plus the render-time observed layer (`withObserved`); *Playground* and *Demo* read the raw content model, so they carry only vendor-documented schemas.",
  `- *Baseline documented* counts operations whose resource page does not list "response schema" among its unresolved items (the baseline records this per resource, not per operation).`,
  "- *UNKNOWN* = no 2xx response schema or example available on that surface.",
  "",
  "## Mismatches and their classification",
  "",
  `- Implementation gaps: ${implGaps.length ? "" : "none"}`,
  ...implGaps.map((g) => `  - ${g}`),
  ...[...byCategory.entries()].map(([c, n]) => `- ${c}: ${n} operation${n === 1 ? "" : "s"} without Demo data`),
  ...(schemaDiscrepancies.length
    ? [
        `- Baseline predates 8A (out of scope by explicit decision — baseline left untouched): ${[...new Set(schemaDiscrepancies.map((r) => r.id))].join(", ")} are documented in the Reference but listed PARTIAL/no response schema in the baseline.`,
      ]
    : []),
  `- Unexplained gaps: ${unexplained.length ? unexplained.join(", ") : "none"}`,
  "",
  "<details><summary>Operations without Demo data, with reason</summary>",
  "",
  ...gaps.map(({ r, g }) => `- ${r.id}: ${g.category} — ${g.reason}`),
  "",
  "</details>",
  "",
  "## Boundary checks",
  "",
  ...checks.map((c) => `- ${c.ok ? "PASS" : "FAIL"} — ${c.name}: ${c.detail}`),
  "",
  "Also enforced by unit tests (`tests/unit/phase8-readiness.test.ts`, `openapi-coverage.test.ts`, `executor.test.ts`, `playground-server.test.ts`, `live-endpoints.test.ts`): Demo never fetches for any of the 159 operations; Live refuses every write before any request; SEC-REQ-05/06 operations have no Demo data and are not Live-allowlisted; secret-named fields in OpenAPI Demo fixtures are placeholders; baseline ↔ inventory ↔ content counts and security labels agree.",
  "",
  "## Remaining limitations (not gate blockers, by decision 2026-10-01)",
  "",
  "- `CONFLICT`: none in the baseline (0 of 37). One observed conflict recorded in `source-docs/DOCS_AUDIT.md` OA-15 (tenant-error codes: observed 401 `invalid_api_key` vs documented `tenant_required`/`tenant_not_found`); decision: record both.",
  `- \`UNKNOWN\`: ${rows.length - refWithObserved.length} operations have no response schema on the Reference; ${pages.filter((p) => p.unresolved.some((u) => /response schema/i.test(u))).length} of ${pages.length} resource pages list the response schema as unresolved.`,
  "- Open items: U-18 (OpenAPI spec not supplied; not fetched by decision), U-17 (base URL confirmed by the user, never called), TEST API key rotation (`docs/SECURITY.md`), Proxy-era U-03/05/06/15.",
  `- Security-blocked: ${blockLive.length} operations labelled BLOCK LIVE; every operation (${rows.length}) is Live-disabled by default-deny (SEC-REQ-27/28).`,
  "",
];

writeFileSync(resolve(root, "source-docs/OPENAPI_READINESS.md"), lines.join("\n"));
console.log(table.join("\n"));
console.log("");
for (const c of checks) console.log(`${c.ok ? "PASS" : "FAIL"}  ${c.name} — ${c.detail}`);
console.log(`\nMismatch categories: ${[...byCategory.entries()].map(([c, n]) => `${c}=${n}`).join("; ")}; implementation gaps=${implGaps.length}; unexplained=${unexplained.length}`);

const failed = checks.filter((c) => !c.ok).length;
if (implGaps.length || unexplained.length || failed) {
  console.error(`\nREADINESS: FAIL (implementation gaps ${implGaps.length}, unexplained ${unexplained.length}, failed checks ${failed})`);
  process.exit(1);
}
console.log("\nREADINESS: no unexplained gaps, all boundary checks pass.");
