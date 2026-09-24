# Architecture

## Target frontend stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- MDX
- OpenAPI-compatible internal data model

Exact versions are not hardcoded here. Use a current supported stable version at bootstrap time and record the actual choice in `docs/DECISIONS.md`.

## Main architectural boundaries

### Presentation layer

Reusable UI:
- portal shell
- sidebar/navigation
- search
- endpoint reference pages
- parameter tables
- code examples
- JSON response viewer
- guides
- feedback UI
- environment selector

### API content layer

Normalized endpoint metadata should be API-agnostic.

Example fields:
- api
- version
- category
- status
- method
- path
- title
- description
- authentication
- headers
- path parameters
- query parameters
- request body
- responses
- errors
- examples
- source URL
- verification state

### Execution layer

`ApiExecutor`
- `LiveProvider`
- `DemoProvider`

The UI consumes one execution contract.

### Live provider

Browser -> Developer Portal backend -> approved API infrastructure

Never allow arbitrary target URLs.

### Demo provider

Browser -> Developer Portal Demo provider -> synthetic fixture response

Demo provider must never call production systems.

## API-neutral design

The UI and content model must be reusable by both Proxy API and Open API.

## Documentation source strategy

Existing docs are imported into:
- source inventory
- normalized content model
- audit trail
- unresolved issues

Where an OpenAPI specification exists later, use it as structured input while preserving human-written guides separately.

## Data ownership

No database is required by default for the initial prototype unless a concrete feature requires one.

If persistence is introduced, document:
- purpose
- schema
- retention
- sensitive-data handling
- migration strategy
- rollback

before implementation.
