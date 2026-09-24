# API Content Model

## Purpose

Provide one normalized schema that can power:
- documentation pages
- Playground request forms
- Demo fixtures
- search
- examples
- validation
- versioning

## Suggested normalized endpoint shape

```yaml
api: proxy
version: current
category: TBD
status: stable
method: GET
path: /TBD
title: TBD
summary: TBD
sourceUrl: TBD
verification:
  documented: true
  implemented: false
  tested: false
  verified: false
authentication:
  type: TBD
headers: []
pathParameters: []
queryParameters: []
requestBody: null
responses: []
errors: []
examples: []
related: []
```

## Parameter fields

Each parameter should support:
- name
- location
- type
- required
- description
- default
- enum
- example
- constraints
- source

## Response fields

Each response should support:
- status
- description
- schema
- example
- headers
- source
- verified

## Lifecycle metadata

Support:
- stable
- experimental
- deprecated
- legacy

Deprecated content should support:
- deprecation date
- replacement endpoint
- migration note

## Verification states

For each endpoint:

DOCUMENTED
- exists in existing source material

IMPLEMENTED
- represented in the new portal

TESTED
- exercised in a controlled test

VERIFIED
- observed behavior matches the published model

Do not promote an endpoint to VERIFIED without evidence.
