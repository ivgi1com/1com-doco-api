# Proxy API Source Normalization

Normalized, structured record of what the vendor page documents about
MiRTA PBX `proxyapi.php` (source snapshot and hashes: `../raw/SOURCES.md`).
This is audit data (DOCUMENTED state only), not portal content. Nothing here
has been implemented, tested, or verified.

## Layout

- `_common.yaml` — base URL, auth, common parameters, `jsondata` convention,
  destination tags, vendor security notes.
- `<reqtype>.yaml` — one file per reqtype in the vendor's reqtype table
  (39 files, lowercase names). Operations (sub-actions) are nested inside.
  The per-reqtype split mirrors the source structure and is reversible.

## Conventions

- `sourceAnchor` — BookStack heading id in `../raw/proxyapi-legacy.html`.
  `bkmrk-request-types` means the item comes only from the reqtype table.
- `documentation` (per reqtype):
  - `examples` — at least one request example exists
  - `table_only` — only the one-line purpose in the reqtype table
- `not_documented` — the page does not state this. Never replaced by a
  guess. Where an example shows a value, it is recorded under `example`,
  and nothing about requiredness/type/allowed values is inferred from it.
- `method.value` is recorded with a `basis`:
  - `example_url` — a bare URL example only (GET is the natural reading, but
    the page never states a method)
  - `example_curl_post` / `example_curl_multipart` — an explicit curl example
  - `stated_jsondata` — the page states the POST `jsondata` convention for
    this kind of write
- `purpose` fields paraphrase the vendor text; exact wording is quoted only
  where it matters for an audit finding.
- `issues` lists IDs from `../DOCS_AUDIT.md` (`A-nn`) and `../unresolved.md`
  (`U-nn`).
- Example values (`APIKEY`, `TENANTCODE`, `pbx.example.com`, sample numbers
  and passwords) are the vendor's placeholders, copied as evidence. They are
  not fixtures: Demo fixtures must be generated separately (Phase 6).
- `category` is `not_documented` everywhere: the source has no categories.
  A proposed grouping is in `../DOCS_AUDIT.md` for the Phase 4 decision.
