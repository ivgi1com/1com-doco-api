/**
 * Phase 8 Stage 6 (finding C-1): internal evidence references are kept in the
 * content files and tests, but never shown to customers. Content strings cite
 * audit entries (A-40, OA-15, U-11), security requirements (SEC-REQ-07),
 * source snapshots (source-docs/...), source line numbers (Doc line 127) and
 * implementation paths (src/server/...). Everything that renders content text
 * goes through `customerText`; the Notes list also drops whole internal notes
 * with `isInternalNote`.
 */

const REF = String.raw`(?:source-docs\/[^\s),;]*|docs\/SECURITY\.md|DOCS_AUDIT(?:\.md)?(?:#[\w-]+)?|SEC-REQ-[\d/-]+|\b(?:OA|A|U)-\d+\b|\b(?:Site|Doc) lines? \d+(?:\s*[–-]\s*\d+)?)`;
const PHASE = String.raw`Phase \d+(?: Stage \d+)?`;
const SEP = String.raw`(?:\s*[,;]\s*|\s+)`;
const TOKEN = String.raw`(?:${REF}|${PHASE})`;

/** "(A-40)", "(source-docs/DOCS_AUDIT.md A-40)", "(SECURITY, A-77, docs/SECURITY.md SEC-REQ-02)", "(Phase 7)": a parenthetical that holds only references. */
const REF_ONLY_PAREN = new RegExp(String.raw`\s*\((?:SECURITY${SEP})?${TOKEN}(?:${SEP}${TOKEN})*\)`, "g");
/** "(A-68, refining A-41's earlier finding)": references plus a short "refining ..." aside. */
const REFINING_PAREN = new RegExp(String.raw`\s*\(${TOKEN}(?:${SEP}${TOKEN})*,\s*refining [^)]*\)`, "g");
/** "Full audit: source-docs/proxy-api/info.md." */
const FULL_AUDIT = /\s*Full audit: source-docs\/\S*?\.md\.?/g;
/** A trailing reference inside a longer parenthetical: "(observed from one record, A-50)", "(user decision, Phase 7 Stage 1)". */
const TRAILING_IN_PAREN = new RegExp(String.raw`\s*,\s*${TOKEN}(?=\))`, "g");
/** "— see A-54", ", see A-72": a pointer to an audit entry. */
const SEE_REF = new RegExp(String.raw`\s*(?:[—–-]\s*)?\bsee ${REF}(?:${SEP}${REF})*`, "g");
/** A line citation used as a sentence subject: "Doc line 137 lists ..." reads "The source lists ...". */
const LINE_SUBJECT = /(^|[.!?]\s+)(?:Site|Doc) lines? \d+(?:\s*[–-]\s*\d+)?(?= [a-z])/g;
/** A leading line citation before a lowercase clause: "Doc line 179: start and stop ..." reads "Start and stop ...". */
const LINE_LEAD = /(^|[.!?]\s+)(?:Site|Doc) lines? \d+(?:\s*[–-]\s*\d+)?:\s*([a-z])/g;
/** A bare line citation that introduces a quotation: `Site line 155: "..."`, `(Doc line 151: "...")`. */
const LINE_CITE = /\b(?:Site|Doc) lines? \d+(?:\s*[–-]\s*\d+)?(?::\s*|(?=\)))/g;
/** "Response observed by probe" reads "Response observed": how a finding was made is internal. */
const BY_PROBE = /\s+by probes?\b/g;
/** "a structure-only probe", "the probe's timeout": customers read "check". */
const PROBE_WORD = /\bprobes?(?=\b)/g;
/** "an earlier interrupted Phase 6 probe" reads "an earlier interrupted probe". */
const PHASE_BARE = /\bPhase \d+(?: Stage \d+)? (?=[a-z])/g;

/** What must not survive in rendered customer text. */
export const INTERNAL_REF = /source-docs|SEC-REQ|DOCS_AUDIT|\b(?:OA|A|U)-\d+\b|\b(?:Site|Doc) lines?\b|\bPhase \d|\bsrc\/|docs\/SECURITY/;

/** `text` without internal evidence references. Customer-facing text without any is returned unchanged. */
export function customerText(text: string): string {
  const stripped = text
    .replace(FULL_AUDIT, "")
    .replace(REFINING_PAREN, "")
    .replace(REF_ONLY_PAREN, "")
    .replace(TRAILING_IN_PAREN, "")
    .replace(SEE_REF, "")
    .replace(LINE_SUBJECT, "$1The source")
    .replace(LINE_LEAD, (_m, lead: string, c: string) => lead + c.toUpperCase())
    .replace(LINE_CITE, "")
    .replace(PHASE_BARE, "")
    .replace(BY_PROBE, "")
    .replace(PROBE_WORD, (m) => (m.endsWith("s") ? "checks" : "check"));
  if (stripped === text) return text;
  return stripped
    .replace(/[ 	]{2,}/g, " ")
    .replace(/\(\s+/g, "(")
    .replace(/\s+([.,:;)])/g, "$1")
    .trim();
}

/**
 * True for a whole note that only exists for internal review or provenance:
 * a security-review note, a provenance line, or one whose references cannot be
 * removed without leaving a broken sentence.
 */
export function isInternalNote(note: string): boolean {
  return (
    /^(?:Security \(SEC-REQ-|SECURITY:|Source: source-docs\/|(?:Doc|Site)-only\b)/.test(note) ||
    /\bsrc\/[\w./-]+/.test(note) ||
    INTERNAL_REF.test(customerText(note))
  );
}
