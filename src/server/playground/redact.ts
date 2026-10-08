import "server-only";

/**
 * Server-side redaction of credential-like fields in upstream responses
 * (decided 2026-09-25 after A-40: INFO EXTENSIONS returns a `Password`
 * column). The caller's own data, fetched with their own key — but the
 * Playground must never display, copy, or download SIP credentials.
 *
 * Response formats are undocumented (A-40), so this is best-effort by
 * structure and fails closed: if a sensitive column is found but rows can't
 * be aligned to it, the whole body is withheld rather than guessed at.
 * Matching is deliberately broad; over-redaction is acceptable, leaks are not.
 */

export const REDACTED = "[REDACTED]";
export const WITHHELD =
  "[Response withheld by the portal: it contains a credential-like column that could not be redacted safely.]";

// Includes 2FA/OTP params and PINs (observed in format=json output, A-40).
// `pin(?![a-z])` matches "lockpin"/"pin" but not "mapping".
const SENSITIVE_NAME = /pass(word|wd)?|pwd|secret|token|2fa|otp|mfa|pin(?![a-z])|api_?key/i;

// A secret this short (a 0/1 flag under a "2fa" name, say) is not worth
// hunting for in sibling fields: it would blank every matching flag.
const MIN_SIBLING_SECRET_LENGTH = 4;

export interface RedactionResult {
  text: string;
  /** Number of values replaced; -1 when the whole body was withheld. */
  redacted: number;
}

function isNonEmpty(value: unknown): boolean {
  return (typeof value === "string" && value !== "") || typeof value === "number";
}

function redactJsonValue(value: unknown, counter: { n: number }): unknown {
  if (Array.isArray(value)) return value.map((v) => redactJsonValue(v, counter));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    // The same secret under another key in this record — e.g. the positional
    // "0".."n" duplicates some endpoints add (A-43, SEC-REQ-01) — is a secret too.
    const secrets = new Set(
      Object.entries(value)
        .filter(([k, v]) => SENSITIVE_NAME.test(k) && isNonEmpty(v))
        .map(([, v]) => String(v))
        .filter((s) => s.length >= MIN_SIBLING_SECRET_LENGTH),
    );
    for (const [k, v] of Object.entries(value)) {
      if (isNonEmpty(v) && secrets.has(String(v))) {
        out[k] = REDACTED;
        counter.n++;
      } else if (SENSITIVE_NAME.test(k) && isNonEmpty(v)) {
        out[k] = REDACTED;
        counter.n++;
      } else if (SENSITIVE_NAME.test(k) && v && typeof v === "object") {
        // A container under a sensitive key: nothing inside is safe to show.
        out[k] = REDACTED;
        counter.n++;
      } else {
        out[k] = redactJsonValue(v, counter);
      }
    }
    return out;
  }
  return value;
}

function redactXml(text: string): RedactionResult {
  let n = 0;
  const tagName = "[A-Za-z_][\\w.:-]*";
  // <password>secret</password> (element content without nested tags)
  let out = text.replace(new RegExp(`<(${tagName})(\\s[^>]*)?>([^<]*)</\\1\\s*>`, "g"), (m, tag, attrs, body) => {
    if (!SENSITIVE_NAME.test(tag) || body.trim() === "") return m;
    n++;
    return `<${tag}${attrs ?? ""}>${REDACTED}</${tag}>`;
  });
  // password="secret" attributes
  out = out.replace(new RegExp(`(\\s)(${tagName})(\\s*=\\s*)("[^"]*"|'[^']*')`, "g"), (m, sp, attr, eq, val) => {
    if (!SENSITIVE_NAME.test(attr) || val.length <= 2) return m;
    n++;
    return `${sp}${attr}${eq}"${REDACTED}"`;
  });
  // A sensitive element whose content is more markup (nested elements,
  // CDATA) isn't handled by the rules above — fail closed.
  const openedWithMarkup = new RegExp(`<(${tagName})(\\s[^>]*)?>\\s*(?=<(?!/\\1\\s*>))`, "g");
  for (const [, tag] of out.matchAll(openedWithMarkup)) {
    if (SENSITIVE_NAME.test(tag)) return { text: WITHHELD, redacted: -1 };
  }
  return { text: out, redacted: n };
}

const DELIMITERS = ["|", "\t", ";", ","] as const;

function redactDelimited(text: string): RedactionResult {
  const lines = text.split(/\r?\n/);
  const headerIndex = lines.findIndex((l) => l.trim() !== "");
  if (headerIndex === -1) return { text, redacted: 0 };
  const header = lines[headerIndex];
  const delimiter = DELIMITERS.find((d) => header.includes(d));
  // Single-column or unstructured text (e.g. "Password: x" lines): if any line
  // names a secret, we can't locate the value.
  if (!delimiter) return SENSITIVE_NAME.test(text) ? { text: WITHHELD, redacted: -1 } : { text, redacted: 0 };
  const columns = header.split(delimiter).map((c) => c.trim().replace(/^"|"$/g, ""));
  const sensitive = columns.flatMap((c, i) => (SENSITIVE_NAME.test(c) ? [i] : []));
  // No secret column, but a data row names one (a name|value listing, say):
  // the value sits in an ordinary column, so fail closed.
  if (sensitive.length === 0) {
    const named = lines.slice(headerIndex + 1).some((l) => SENSITIVE_NAME.test(l));
    return named ? { text: WITHHELD, redacted: -1 } : { text, redacted: 0 };
  }
  // Quoted fields may contain the delimiter; naive splitting could misalign
  // columns, so any quote in the data means fail closed.
  if (lines.slice(headerIndex + 1).some((l) => l.includes('"'))) return { text: WITHHELD, redacted: -1 };

  let n = 0;
  const out = lines.map((line, i) => {
    if (i <= headerIndex || line.trim() === "") return line;
    const cells = line.split(delimiter);
    // Allow one trailing empty cell (a trailing delimiter); anything else misaligned fails closed.
    const aligned =
      cells.length === columns.length ||
      (cells.length === columns.length + 1 && cells[cells.length - 1] === "");
    if (!aligned) throw new MisalignedError();
    for (const idx of sensitive) {
      if (cells[idx] !== undefined && cells[idx].trim() !== "") {
        cells[idx] = REDACTED;
        n++;
      }
    }
    return cells.join(delimiter);
  });
  return { text: out.join(text.includes("\r\n") ? "\r\n" : "\n"), redacted: n };
}

class MisalignedError extends Error {}

export interface ProjectionResult {
  text: string;
  /** Distinct upstream field names dropped by the allowlist. */
  omittedFields: number;
  withheld: boolean;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Keeps only allowlisted fields of each JSON item. Accepts an array of
 * objects or an object whose values are objects (keyed shape). Any other JSON
 * shape is withheld: we can't tell which parts are safe. Non-JSON is
 * returned unchanged (redactSensitive handles text formats).
 */
export function projectJsonFields(text: string, allowed: ReadonlySet<string>): ProjectionResult {
  const trimmed = text.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) return { text, omittedFields: 0, withheld: false };
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { text, omittedFields: 0, withheld: false };
  }
  const dropped = new Set<string>();
  const pick = (item: Record<string, unknown>) => {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(item)) {
      if (allowed.has(k)) out[k] = v;
      else dropped.add(k);
    }
    return out;
  };
  let projected: unknown;
  if (Array.isArray(parsed) && parsed.every(isPlainRecord)) {
    projected = parsed.map(pick);
  } else if (isPlainRecord(parsed) && Object.values(parsed).every(isPlainRecord)) {
    projected = Object.fromEntries(Object.entries(parsed).map(([k, v]) => [k, pick(v as Record<string, unknown>)]));
  } else {
    return { text: WITHHELD, omittedFields: 0, withheld: true };
  }
  return { text: JSON.stringify(projected), omittedFields: dropped.size, withheld: false };
}

/**
 * For APIs whose errors are `{"error":{"code":…,"message":…}}`: if the body is
 * exactly that shape, returns it with only string `code` and `message` kept.
 * Anything else returns null and goes through the normal field allowlist.
 */
export function projectErrorEnvelope(text: string): ProjectionResult | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text.trim());
  } catch {
    return null;
  }
  if (!isPlainRecord(parsed) || Object.keys(parsed).length !== 1 || !isPlainRecord(parsed.error)) return null;
  const out: Record<string, string> = {};
  let omitted = 0;
  for (const [k, v] of Object.entries(parsed.error)) {
    if ((k === "code" || k === "message") && typeof v === "string") out[k] = v;
    else omitted++;
  }
  return { text: JSON.stringify({ error: out }), omittedFields: omitted, withheld: false };
}

/**
 * Distinct values of `field` across the records of an (already projected)
 * JSON array or keyed object. Non-JSON or other shapes count as 0.
 */
export function countDistinctField(text: string, field: string): number {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text.trim());
  } catch {
    return 0;
  }
  const records = Array.isArray(parsed) ? parsed : isPlainRecord(parsed) ? Object.values(parsed) : [];
  const seen = new Set<string>();
  for (const r of records) {
    if (isPlainRecord(r) && r[field] !== undefined && r[field] !== null) seen.add(String(r[field]));
  }
  return seen.size;
}

export function redactSensitive(text: string): RedactionResult {
  const trimmed = text.trim();
  if (trimmed === "") return { text, redacted: 0 };

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const counter = { n: 0 };
      const redactedValue = redactJsonValue(JSON.parse(trimmed), counter);
      return counter.n > 0 ? { text: JSON.stringify(redactedValue), redacted: counter.n } : { text, redacted: 0 };
    } catch {
      // Not valid JSON after all — fall through to the text rules.
    }
  }

  if (trimmed.startsWith("<")) return redactXml(text);

  try {
    return redactDelimited(text);
  } catch (err) {
    if (err instanceof MisalignedError) return { text: WITHHELD, redacted: -1 };
    throw err;
  }
}
