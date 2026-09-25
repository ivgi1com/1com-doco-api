# API Content Model

## Purpose

Provide one normalized, API-neutral schema that can power:
- documentation pages
- Playground request forms
- Demo fixtures
- search
- examples
- validation
- versioning

The canonical definition is `src/content/types.ts`. This file explains it.

## Endpoint shape

```yaml
api: proxy
version: legacy
category: extensions
status: legacy                  # stable | experimental | deprecated | legacy
deprecation:                    # also carries the note for status: legacy
  note: ...
method: GET
methodBasis: inferred           # documented | inferred (source never states it)
path: /pbx/proxyapi.php
fixedQuery:                     # operation selectors on a shared path (non-REST)
  reqtype: INFO
  info: EXTENSIONS
title: ...
summary: ...
sourceUrl: ...
verification: { documented: true, implemented: true, tested: false, verified: false }
authentication:
  type: API key
  description: ...
  location: query               # header (default) | query
  parameter: key
  scope: Tenant key (read-only is sufficient)
headers: []
pathParameters: []
queryParameters: []
requestBody: null
responses: []
errors: undocumented            # ErrorSpec[] | "undocumented"
notes: []
related: []
```

### Supporting both REST and reqtype-style APIs

- REST APIs (Sample API, later Open API): `method` + `path` identify the
  operation, and `fixedQuery` is absent.
- Reqtype-style APIs (Proxy API): every operation shares one `path`, and
  the operation is selected by `fixedQuery`. The UI shows fixed params on
  the path line. Code samples always send them, and the Playground shows
  them read-only.
- There are no Proxy-specific components. The same components render both
  kinds.

### Request body encoding and operation class (Phase 7)

Both fields are optional and additive; the Sample API sets neither.

- `requestBodyEncoding`: how the body travels.
  - `json` (the default when omitted): a JSON document body.
  - `form-json-field` + `field`: a form-urlencoded body with one field
    whose value is `requestExample` encoded as JSON (Proxy ManageDB
    `jsondata`, PHONEBOOK `values`).
  - `multipart` + `fileField` + `exampleFile`: a file upload (FAX, ManageDB
    `updatebinary`).
- Code samples follow it. Query-auth POSTs keep the credential and
  selectors in the query string (curl `--url-query`) and put only the
  body field in the body.
- `requestExample` may be an array (ManageDB destination-tag lists).
- `operationClass: "write"` marks an operation that changes state. Such
  operations are Reference-only:
  - the reference page shows a warning callout and no "Try in Playground"
    link;
  - the Playground disables Send in both modes;
  - `demoProvider` refuses them even if a fixture exists;
  - `tests/unit/proxy-coverage.test.ts` asserts that no write operation
    has fixtures or a Live policy.
- Response examples: a non-JSON string example (`plain`/`csv`/`xml`) is
  shown raw, and a `binary` response with no example reads "Binary body".
  `evidence: "vendor"` gets its own badge.
- Proxy content lives in `src/content/proxy/`: one module per reqtype,
  plus `shared.ts` (auth variants, the `proxyOperation()` defaults factory,
  and the `q()`/`b()` parameter helpers). The operation inventory,
  `source-docs/proxy-api/operations.json`, is checked against this content
  by `tests/unit/proxy-coverage.test.ts`.

## "Undocumented" states (no-guessing rule)

Where the source is silent, the model records that instead of guessing:

- `Parameter.required: true | false | "undocumented"`. Only `true` blocks
  sending in the Playground.
- `Endpoint.errors: "undocumented"` is rendered as "Not documented by the
  source".
- `Endpoint.methodBasis: "inferred"` renders a note that the method comes
  from the source's examples.

## Parameter fields

- name
- location (path | query | header | body)
- type
- required (true | false | "undocumented")
- description
- default
- enum
- example
- constraints
- condition
- children (nested objects)
- source (anchor/URL of the evidence)

## Response fields

- status
- description
- schema
- example
- format (json | xml | csv | plain | binary)
- evidence (vendor | observed-sanitized | synthetic)
- headers
- source
- verified

Evidence rule: only `synthetic` examples may be replayed by Demo mode. An
`observed-sanitized` example is real traffic with identifying values
replaced. It is published as evidence, labelled as such, and never served
as Demo data.

### Demo fixtures are a separate model (Phase 6)

A synthetic, replayable Demo response is **not** an `Endpoint.responses`
entry — it lives in `src/content/demo/` as a `DemoFixtureSet` (see
`docs/ARCHITECTURE.md` "Demo fixture system"), keyed to the endpoint by id
rather than embedded in its content. This keeps the endpoint's own
`responses` reserved for real evidence (`vendor` / `observed-sanitized`),
never mixed with fabricated data, and lets Demo coverage be partial:
a `DemoFixtureSet` only ever covers the parameter combinations someone has
actually observed (each case cites the `DOCS_AUDIT.md` finding it
reproduces); anything else is "Not simulated" rather than a guess.

Three operations so far (`info-agents`, `info-simplecdrs`,
`info-queuelogs`) were independently observed to duplicate every JSON field
under a second, bare positional key (`"0"`, `"1"`, ...) alongside its name.
This is a recurring shape in this vendor's API, not an isolated quirk — a
new operation with named JSON fields should be checked for it before
assuming a plain object.

## Authentication

`location` and `parameter` drive the code samples: a header credential, or
a query parameter such as the Proxy API's `key`. `scope` states the minimum
key scope. Samples always read the credential from an environment variable
and never contain a realistic value.

## Lifecycle metadata

Supported states:
- stable
- experimental
- deprecated
- legacy

Deprecated content supports a deprecation date, a replacement endpoint, and
a migration note. Legacy content reuses `deprecation.note` for its
explanatory note.

## Verification states

For each endpoint:

- **DOCUMENTED**: exists in existing source material
- **IMPLEMENTED**: represented in the new portal
- **TESTED**: exercised in a controlled test
- **VERIFIED**: observed behavior matches the published model

Do not promote an endpoint to VERIFIED without evidence.
