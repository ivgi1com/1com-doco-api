# MiRTA OpenAPI Documentation Instructions

> **Purpose:** Permanent repository instructions for discovering, documenting, verifying, reviewing, and preparing MiRTA PBX OpenAPI resources for future implementation.
>
> **Scope:** Documentation and API-contract analysis only unless a separate, explicitly approved implementation task says otherwise.
>
> **Audience:** Developers and AI coding agents, including Claude Code.

---

## 1. Objective

Maintain a clean, evidence-based, implementation-ready local reference for the MiRTA PBX OpenAPI.

The documentation must allow a future developer or AI agent to understand an API resource without rediscovering its contract from scratch.

**Accuracy is more important than completeness. Never fill documentation gaps by guessing.**

This file defines permanent OpenAPI documentation rules. Current phase, branch, checkpoint, and resume information belongs in the project's status/handoff files, not here.

---

## 2. Sources of Truth

### 2.1 Official MiRTA OpenAPI documentation

Primary human-readable source:

`https://manual.mirtapbx.com/books/api/chapter/openapi`

The official OpenAPI chapter currently contains **38 clickable documentation pages**. Treat 38 as the expected page-coverage count when auditing this documentation set.

Do **not** assume:

`38 pages = 38 resources = 38 endpoint paths = 38 operations`

Track these concepts separately.

Official resource pages should be used for explanations, endpoint behavior, parameters, examples, authentication notes, restrictions, aliases, and operational details.

### 2.2 PBX-generated OpenAPI specification

MiRTA documents a machine-readable **OpenAPI 3.0.3 JSON** specification exposed by an actual PBX through forms such as:

- `openapi.php?spec=1`
- `openapi.php/openapi.json`
- `openapi.php/swagger.json`

When an authorized specification from the target/test PBX is available, use it as the preferred machine-readable contract for:

- `paths`
- HTTP operations
- parameters
- request bodies
- response definitions
- schemas
- components
- security schemes
- required fields
- enums
- data types

The PBX specification is an additional verification layer. Its absence must not cause undocumented behavior to be invented.

### 2.3 Local wrapper/reference

A local file such as:

`mirta-openapi-claude-reference.md`

may provide structure, terminology, security policy, and an initial catalog.

It is **not automatically authoritative for individual API facts**.

### 2.4 Authority and conflict handling

For API facts, prefer current official MiRTA evidence over local assumptions.

If the local wrapper conflicts with official MiRTA documentation:

1. Official MiRTA documentation wins for the documentation baseline.
2. Correct the local reference.
3. Record the discrepancy.

If two official sources disagree:

1. Do not silently choose one.
2. Mark the item `CONFLICT`.
3. Preserve references to both sources.
4. Use an authorized PBX specification or observed test behavior later to help resolve the conflict.

---

## 3. Evidence States

Use the following states consistently.

### `DOCUMENTED`

Explicitly established by official MiRTA documentation or an authorized official OpenAPI specification.

### `OBSERVED`

Established through an explicitly authorized API test against a designated test PBX/tenant.

### `DOCUMENTED+OBSERVED`

Official documentation/specification and authorized observed behavior agree.

### `CONFLICT`

Authoritative sources disagree, or observed behavior contradicts documented behavior.

### `UNKNOWN`

Available evidence does not establish the behavior.

`UNKNOWN` is a valid and useful result.

**Never convert `UNKNOWN` into an assumption merely to make documentation appear complete.**

---

## 4. Required Resource Documentation

For every documented MiRTA OpenAPI resource, capture the following where the official evidence supports it.

### 4.1 Identity

- resource name
- purpose
- official source URL
- primary endpoint/path
- path aliases
- object name
- table/database information, only when officially documented
- ID field
- label/display field
- evidence status

### 4.2 HTTP contract

Document only operations that are actually supported:

- `GET`
- `POST`
- `PATCH`
- `PUT`
- `DELETE`
- special actions

Never infer CRUD support from another resource.

### 4.3 Authentication and scope

Document:

- supported authentication mechanisms
- API-key requirements
- tenant-key behavior
- global/admin-key behavior
- read-only vs writable/full-key requirements
- tenant isolation requirements
- tenant requirement
- global mode, when supported
- IP restrictions, when documented
- permission/scope restrictions

### 4.4 Parameters

Distinguish:

- path parameters
- query parameters
- required parameters
- optional parameters
- aliases
- accepted values
- enums
- defaults
- filters
- pagination
- date/time formats
- output formats
- compatibility parameters

### 4.5 Request body

For mutating operations, document where known:

- required fields
- optional fields
- aliases
- field types
- accepted values
- nested structures
- validation rules
- destination structures
- special behavior

### 4.6 Response contract

Where established by evidence, document:

- success status/behavior
- JSON object/array structure
- field names
- field types
- nesting
- pagination metadata
- empty-result behavior
- documented errors
- special response behavior

If the source does not establish the response schema, mark it `UNKNOWN`.

Do not invent response fields or example structures.

---

## 5. Examples

Add useful examples where the official documentation/specification supports the behavior.

Examples may include:

- cURL
- GET requests
- POST bodies
- PATCH bodies
- DELETE requests
- authentication examples
- synthetic response examples

Use obviously synthetic values such as:

- `TEST_API_KEY`
- `TESTTENANT`
- `100`
- `200`
- `pbx.example.com`
- `Demo User`

Example:

```bash
curl \
  -H "X-API-Key: TEST_API_KEY" \
  "https://pbx.example.com/pbx/openapi.php/extensions?tenant=TESTTENANT"
```

Example synthetic body:

```json
{
  "number": "100",
  "name": "Demo User"
}
```

Never commit real:

- API keys
- passwords
- SIP secrets
- authentication tokens
- tenant credentials
- phone numbers
- DIDs
- caller IDs
- customer names
- customer email addresses
- recordings
- production identifiers
- customer information

If official documentation contains example values that resemble real data, normalize them before committing unless exact preservation is necessary as evidence and has been explicitly approved.

---

## 6. Coverage and Indexing

Maintain a central OpenAPI coverage/index document.

Track at minimum:

- official page title
- source URL
- page type: overview/general/resource
- resource
- primary path
- methods
- scope
- documentation status
- security-review status
- unresolved items

Maintain aggregate counts for:

- TOTAL OFFICIAL PAGES
- PROCESSED PAGES
- OVERVIEW/GENERAL PAGES
- RESOURCE PAGES
- UNIQUE RESOURCES
- ENDPOINT PATHS
- HTTP OPERATIONS
- DOCUMENTED
- PARTIAL
- UNKNOWN
- CONFLICT

For the current official MiRTA chapter, all **38 pages** must be accounted for before claiming chapter-level documentation coverage.

Do not manufacture or remove resources simply to make counts match.

---

## 7. Documentation Quality Standard

Do not merely scrape official pages into Markdown.

Transform source material into a structured engineering reference while preserving source traceability.

For each resource, a future developer or AI agent should be able to answer:

- What does this resource do?
- What is the exact path?
- Which HTTP methods are supported?
- What authentication is required?
- Is tenant context required?
- Is the resource tenant-scoped, global, or administrative?
- Is it read-only or mutating?
- Which parameters exist?
- Which parameters are required?
- Which are optional?
- What aliases and accepted values exist?
- What request body is accepted?
- What response is documented?
- What errors are documented?
- What examples are available?
- What remains `UNKNOWN`?
- Are there security concerns?
- Is the resource suitable for Demo?
- What safeguards would be required before Live exposure?
- Which official source supports each important contract claim?

Prefer structured Markdown, tables, concise explanations, and normalized examples over large unstructured text dumps.

---

## 8. Security Review Requirements

Perform a documentation-level security review for each resource.

Look specifically for possible exposure of:

- passwords
- SIP secrets
- authentication tokens
- web passwords
- PINs
- 2FA information
- provisioning credentials
- private email/contact data
- internal identifiers
- private PBX configuration
- database rows
- nested database records
- numeric/positional duplicate fields
- other sensitive information

### Response filtering principle

A previous Proxy API review demonstrated that sensitive information can appear under both named fields and duplicated positional/numeric fields.

For future browser-facing Live functionality, prefer:

**explicit response allowlists / default-deny response filtering**

over sensitive-field blacklists.

If an OpenAPI endpoint may expose sensitive information, record the finding as a future Live security requirement.

Documentation of an endpoint does **not** authorize Live exposure.

---

## 9. Demo vs Live

Keep documentation, Demo support, and Live authorization separate.

### Demo

Future Demo implementations must:

- use synthetic data only
- require no production credentials
- make no production PBX calls
- reproduce verified API structure
- never contain copied customer data

### Live

Future Live implementations must:

- keep credentials server-side
- preserve tenant isolation
- validate requests
- expose only explicitly approved operations
- enforce method/parameter restrictions
- apply appropriate response-field security
- prevent credentials and private PBX data from reaching browser code

An endpoint being documented does **not** automatically place it on a Live allowlist.

---

## 10. Real PBX Testing Policy

Do not make real PBX API calls merely because an endpoint is documented.

Real testing requires explicit authorization and designated test credentials/context.

When authorized, read-only operations may be used to verify actual response schemas and behavior.

Any evidence saved to the repository must be sanitized first.

For mutating operations, including:

- `POST`
- `PATCH`
- `PUT`
- `DELETE`
- Dial/origination
- token generation/reset
- other state-changing actions

do not execute without explicit user approval for that testing task.

Before an approved mutation:

1. identify the target test tenant/object;
2. state the expected mutation;
3. confirm the operation is safe for the designated test environment;
4. plan cleanup/rollback where applicable;
5. never use production/customer data merely to discover behavior.

---

## 11. OpenAPI Specification Verification

When an authorized PBX OpenAPI JSON specification becomes available:

1. identify the PBX/version it came from;
2. preserve the raw specification or a controlled snapshot according to repository policy;
3. inspect `paths`;
4. inspect methods/operations;
5. inspect parameters;
6. inspect `requestBody`;
7. inspect responses;
8. inspect schemas/components;
9. inspect security schemes;
10. compare the specification against the human-readable documentation;
11. record matches, omissions, and conflicts;
12. do not silently overwrite contradictory evidence.

Use the specification to strengthen field-level precision, not to erase useful operational notes from the human-readable documentation.

Version-specific differences should be recorded explicitly.

---

## 12. Validation and Second-Pass Audit

Before declaring an OpenAPI documentation baseline complete, perform a separate audit.

Compare:

`official chapter/index`
↕
`local coverage index`
↕
`individual resource documentation`
↕
`PBX OpenAPI specification`, when available

Verify:

- expected official pages are accounted for
- no resource page was skipped
- paths
- HTTP methods
- authentication
- tenant/global/admin scope
- required parameters
- optional parameters
- aliases
- request bodies
- response information
- CRUD support
- examples
- errors
- `UNKNOWN` items
- `CONFLICT` items
- security findings
- source URLs

Also scan repository documentation/evidence for accidental:

- API keys
- passwords
- tokens
- secrets
- real customer email addresses
- real phone numbers
- real DIDs
- real tenant/customer data

Review the final Git diff and confirm that only intended files changed.

Do not claim completeness when material remains unverified.

---

## 13. Documentation-Only Boundary

Unless a separate explicitly approved implementation task says otherwise, OpenAPI documentation work must **not**:

- implement application functionality
- modify Developer Portal behavior
- modify Demo Playground behavior
- modify Live Playground behavior
- expand Live endpoint allowlists
- modify Proxy API functionality
- perform unauthorized real API testing
- mutate a PBX
- merge a development phase automatically
- push automatically
- create release tags automatically

Proxy API and OpenAPI are separate API families. Do not mix their contracts.

---

## 14. Completion Report

At the end of a substantial OpenAPI documentation/audit task, report:

1. official pages expected
2. official pages discovered
3. official pages processed
4. overview/general pages
5. resource pages
6. unique resources
7. endpoint paths
8. HTTP operations
9. files created
10. files updated
11. fully documented resources
12. partially documented resources
13. `UNKNOWN` items
14. `CONFLICT` items
15. corrections to previous local assumptions
16. security findings
17. resources requiring future Live safeguards
18. validation/audit results
19. secret/customer-data scan results
20. Git branch
21. Git status
22. commits created, if any
23. whether the PBX OpenAPI JSON is needed to resolve remaining uncertainty
24. recommended next step

Completion is not approval.

Follow the repository's normal phase/approval gate before implementation, merge, push, tagging, or progression to another phase.

---

## 15. Per-Resource Contract Template

Use this template, adapting it only when the resource requires additional sections.

```markdown
# <Resource Name>

## Status

- Evidence: DOCUMENTED | OBSERVED | DOCUMENTED+OBSERVED | CONFLICT | UNKNOWN
- Scope: Tenant | Global | Admin/System | Unknown
- Access: Read-only | Mutating | Mixed | Unknown
- Security review: PASS | REVIEW REQUIRED | BLOCK LIVE | UNKNOWN

## Purpose

<Concise evidence-based description>

## Official Sources

- <Official MiRTA URL>
- <Specification reference, if available>

## Endpoint

| Property | Value |
|---|---|
| Primary path | `<path>` |
| Path aliases | `<aliases or none documented>` |
| ID field | `<field or UNKNOWN>` |
| Label field | `<field or UNKNOWN>` |

## Authentication and Scope

<Authentication, tenant/global/admin behavior, key requirements>

## Operations

### GET <path>

**Purpose:**  
...

**Parameters:**

| Parameter | Location | Required | Type | Description | Evidence |
|---|---|---:|---|---|---|

**Response:**  
...

**Errors:**  
...

**Example:**

```bash
...
```

### POST/PATCH/PUT/DELETE

<Include only when documented>

## Request Schema

...

## Response Schema

...

## Aliases / Accepted Values

...

## Security Notes

...

## Demo Considerations

...

## Live Considerations

...

## Unknowns

- ...

## Conflicts

- ...

## Verification Notes

- ...
```

---

## 16. Core Principles

1. **Official evidence over assumptions.**
2. **Accuracy over artificial completeness.**
3. **Unknown is better than invented.**
4. **Preserve source traceability.**
5. **Separate documentation from authorization.**
6. **Separate Demo from Live.**
7. **Default-deny sensitive browser-facing responses.**
8. **Never expose or commit credentials/customer data.**
9. **Do not mutate a PBX without explicit authorization.**
10. **Do not treat task completion as phase approval.**
