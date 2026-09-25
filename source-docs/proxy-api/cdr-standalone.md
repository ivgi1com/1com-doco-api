# CDR (standalone reqtype) — historical only, not in the 2026-09-25 source

**Not documented by either the Site or the Doc.** Neither new source
mentions a bare `reqtype=CDR` (as opposed to `INFO&info=CDRS`, which is
documented — see `info.md`). This file exists only to record that gap and
preserve the prior (MiRTA-sourced, Phase 3) documentation as historical
evidence, because the portal's already-implemented `cdr-get` Live
endpoint (`src/content/proxy-api.ts`) is built on it and has been tested
against the real host (`../DOCS_AUDIT.md` §7–9).

## What the old (superseded) MiRTA source said

Reqtype `CDR`, purpose "Get or update fields on a CDR row." Two
operations, `action=GET` and `action=UPDATE`, both operating on one named
field of one CDR row (`field`, `uniqueid`). Full detail:
`../raw/proxyapi-legacy.html`/`.md` (historical evidence, superseded).

## What this means for the rebuild

- `cdr-get`'s current documentation provenance (its citation of
  `info.yaml`/`_common.yaml`, now removed — see the completion report's
  Findings) is now unsupported by any live source file. The old citation
  is stale.
- This is a **documentation-source gap, not a behavior change**: the
  endpoint's already-observed real behavior
  (`../DOCS_AUDIT.md` — verification state `tested`/`verified` flags in
  `src/content/proxy-api.ts`) is unaffected. Only what backs its written
  documentation changed.
- Re-mapping `cdr-get` against the new source (or deciding it has none
  and should cite historical MiRTA evidence going forward) is a decision
  for the user, not made here — this rebuild's scope is documentation
  only, and the exact 7 Demo examples (which may or may not include
  `cdr-get`) are being re-specified separately per the user's request.

## Source
Historical: `../raw/proxyapi-legacy.html`, `../raw/proxyapi-legacy.md`
(Phase 3 evidence, superseded — see `../raw/SOURCES.md`).
