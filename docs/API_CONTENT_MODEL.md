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
