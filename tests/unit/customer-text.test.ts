import { describe, expect, it } from "vitest";
import { apis, listEndpoints } from "@/content";
import { withObserved } from "@/content/observed";
import { customerText, INTERNAL_REF, isInternalNote } from "@/lib/customer-text";

/**
 * Phase 8 Stage 6 (finding C-1): internal evidence references stay in the
 * content files but never reach a customer. `customerText` and
 * `isInternalNote` are applied where content renders (InlineMarkup, the
 * Notes list); this guard runs every rendered string through them.
 */

describe("customerText", () => {
  it("drops audit-id parentheticals but keeps the sentence", () => {
    expect(customerText("Observed (A-40): the default is plain.")).toBe("Observed: the default is plain.");
    expect(customerText("formats are observed (source-docs/DOCS_AUDIT.md A-40): the default")).toBe("formats are observed: the default");
    expect(customerText("an array (observed from one record, A-50). csv is")).toBe("an array (observed from one record). csv is");
  });

  it("drops several references in one parenthetical, with or without a SECURITY label", () => {
    expect(customerText("password (SECURITY, source-docs/DOCS_AUDIT.md A-77, docs/SECURITY.md SEC-REQ-02). Null")).toBe("password. Null");
    expect(customerText("keys (A-55, docs/SECURITY.md SEC-REQ-01).")).toBe("keys.");
  });

  it("drops source line citations, keeping any quotation they introduced", () => {
    expect(customerText("Doc-only purpose line (Doc line 127): \"list of queues\".")).toBe('Doc-only purpose line: "list of queues".');
    expect(customerText('Site line 155: "Based on your browser settings"')).toBe('"Based on your browser settings"');
    expect(customerText("Doc line 137 lists id, uniqueid together")).toBe("The documentation lists id, uniqueid together");
    expect(customerText("Doc line 179: start and stop only")).toBe("Start and stop only");
  });

  it("drops pointers, audit sentences and phase names", () => {
    expect(customerText("not 4 — see A-72).")).toBe("not 4).");
    expect(customerText("One operation of INFO (info=DIDS). Full audit: source-docs/proxy-api/info.md.")).toBe("One operation of INFO (info=DIDS).");
    expect(customerText("an earlier interrupted Phase 6 probe")).toBe("an earlier interrupted check");
    expect(customerText("Response observed by probe (source-docs/DOCS_AUDIT.md A-72).")).toBe("Response observed.");
    expect(customerText("a 15-second probe timed out; the probe's retry worked")).toBe("a 15-second check timed out; the check's retry worked");
    expect(customerText("a mailbox's state (user decision, Phase 7 Stage 1).")).toBe("a mailbox's state (user decision).");
    expect(customerText("Without extension (A-68, refining A-41's earlier finding): both")).toBe("Without extension: both");
  });

  it("leaves text without references byte-for-byte unchanged", () => {
    for (const s of ['"message": ...}}`', "Plain sentence ( with spaces ) , kept.", "Send the key in the X-API-Key header."]) {
      expect(customerText(s)).toBe(s);
    }
  });
});

describe("isInternalNote", () => {
  it("hides security-review notes, provenance lines and implementation paths", () => {
    expect(isInternalNote("Security (SEC-REQ-07): fields include `clid`. Before Live: a default-deny allowlist.")).toBe(true);
    expect(isInternalNote("SECURITY: the format=json response includes a plaintext credential.")).toBe(true);
    expect(isInternalNote("Source: source-docs/openapi/cdrs.md.")).toBe(true);
    expect(isInternalNote("Doc-only purpose line (Doc line 120): \"list of queues\".")).toBe(true);
    expect(isInternalNote("Site-only action (Site line 148); not in the action list.")).toBe(true);
    expect(isInternalNote("Not offered on Live: src/server/playground/allowlist.ts has no entry.")).toBe(true);
  });

  it("hides a note whose references cannot be removed cleanly", () => {
    expect(isInternalNote("Not offered on Live until docs/SECURITY.md SEC-REQ-01 is implemented and validated.")).toBe(true);
  });

  it("keeps customer-useful notes that merely cite a reference", () => {
    expect(isInternalNote("This places a real phone call. It is never sent from the Playground (SEC-REQ-06).")).toBe(false);
    expect(isInternalNote("Response formats are observed (source-docs/DOCS_AUDIT.md A-40): the default is plain.")).toBe(false);
  });
});

describe("no internal reference reaches a customer (C-1)", () => {
  const SKIP = new Set(["sourceUrl", "source", "sources", "file", "page"]);
  const leaks: string[] = [];
  let shown = 0;
  let hidden = 0;

  function walk(v: unknown, path: string, inNotes = false) {
    if (typeof v === "string") {
      if (inNotes && isInternalNote(v)) {
        hidden++;
        return;
      }
      shown++;
      if (INTERNAL_REF.test(customerText(v))) leaks.push(`${path}: ${customerText(v).slice(0, 120)}`);
    } else if (Array.isArray(v)) v.forEach((x, i) => walk(x, `${path}[${i}]`, inNotes));
    else if (v && typeof v === "object") {
      for (const [k, x] of Object.entries(v as Record<string, unknown>)) if (!SKIP.has(k)) walk(x, `${path}.${k}`, k === "notes");
    }
  }
  for (const api of apis) for (const e of listEndpoints(api)) walk(withObserved(api.id, e), `${api.id}/${e.id}`);

  it("checks a meaningful amount of text and hides the internal notes", () => {
    expect(shown).toBeGreaterThan(10000);
    expect(hidden).toBeGreaterThan(100);
  });

  it("leaves no audit id, SEC-REQ, source-docs path, line citation, phase name or src/ path in rendered text", () => {
    expect(leaks).toEqual([]);
  });
});
