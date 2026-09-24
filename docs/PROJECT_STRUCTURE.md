# Project Structure

This document defines the intended repository organization and where new files should be placed.

It is a repository map, not an exhaustive listing of every generated file.

Claude must read this document before making significant structural changes.

---

## Repository Root

```text
project-root/
│
├── CLAUDE.md
├── AGENTS.md
├── BOOTSTRAP_PROMPT.md
├── README.md
├── package.json
│
├── docs/
├── design-system/
├── source-docs/
├── messages/
├── src/
├── tests/
├── scripts/
├── public/
│
├── .claude/
├── .vscode/
│
└── configuration files
```

---

# Root Files

## `CLAUDE.md`

Permanent operating instructions for Claude Code.

Contains:

- project-wide rules
- approval gates
- no-guessing protocol
- model-routing rules
- Git workflow
- security invariants
- testing requirements
- references to specialist documentation

Do not place detailed phase implementation instructions here.

---

## `BOOTSTRAP_PROMPT.md`

Startup instructions for a new Claude Code session.

Used to reconstruct project context safely.

It should point Claude toward:

- `CLAUDE.md`
- current project status
- current phase
- environment documentation
- decisions
- session handoff when present

---

## `README.md`

Human-facing project overview.

Contains:

- project purpose
- basic installation
- development startup instructions
- high-level architecture
- useful links

Detailed AI-agent instructions belong in `CLAUDE.md`, not `README.md`.

---

## `AGENTS.md`

Exists only so that `next dev` has a file to write its generated Next.js
agent-rules block into. Without it, that block would be appended to the
project `CLAUDE.md` instead. Do not put permanent operating rules here.

---

## `messages/`

next-intl message catalogs, one file per locale (`en.json`, `he.json`).
UI chrome strings only; API/reference prose lives in the content model
under `src/content/`, not here.

---

# `docs/`

Project knowledge and engineering documentation.

```text
docs/
│
├── PROJECT_PLAN.md
├── PROJECT_STRUCTURE.md
├── CURRENT_STATUS.md
├── SESSION_HANDOFF.md
├── DECISIONS.md
├── ENVIRONMENT.md
├── ARCHITECTURE.md
├── API_CONTENT_MODEL.md
├── SECURITY.md
├── TESTING.md
│
└── phases/
```

---

## `docs/PROJECT_PLAN.md`

High-level project roadmap.

Defines:

- project stages
- sequence
- milestones
- approval gates

It should not contain detailed implementation instructions for every phase.

---

## `docs/CURRENT_STATUS.md`

Short authoritative description of the current project state.

Keep this concise.

It should contain:

```text
Current phase
Current branch
Completed
In progress
Blocked
Exact next task
Next approval gate
```

This file should be updated whenever meaningful project progress occurs.

---

## `docs/SESSION_HANDOFF.md`

Temporary but authoritative handoff between Claude Code sessions.

Contains:

- what was done
- what remains
- files changed
- tests performed
- known issues
- exact next action

A fresh Claude session should read this before continuing unfinished work.

---

## `docs/DECISIONS.md`

Permanent decision log.

Record material decisions such as:

```text
Date
Decision
Reason
Scope
Consequences
```

Do not repeatedly ask questions whose answers are already recorded here.

---

## `docs/ENVIRONMENT.md`

Defines the development environment.

Include:

- Node version
- package manager
- development commands
- build commands
- lint commands
- test commands
- Playwright commands
- local ports
- required environment variables
- supported operating environment
- VS Code assumptions

Never guess environment details if this document or the repository can provide them.

---

## `docs/ARCHITECTURE.md`

System architecture.

Contains:

- major components
- component responsibilities
- data flows
- trust boundaries
- frontend/backend boundaries
- external integrations
- architecture constraints

Major architectural changes must update this document.

---

## `docs/API_CONTENT_MODEL.md`

Defines how APIs are represented inside the developer portal.

Examples:

- endpoint metadata
- request parameters
- examples
- authentication requirements
- response schemas
- error definitions
- Playground behavior

---

## `docs/SECURITY.md`

Security requirements and invariants.

Contains:

- authentication
- authorization
- secrets
- API keys
- credential handling
- production boundaries
- demo-mode isolation
- security review requirements

Security rules must not be weakened without explicit user approval.

---

## `docs/TESTING.md`

Testing strategy.

Contains:

- unit tests
- integration tests
- browser tests
- Playwright requirements
- required checks before approval
- regression expectations

---

# `docs/phases/`

Detailed instructions for individual project phases.

Example:

```text
docs/phases/
├── 01-design-research.md
├── 02-design-prototype.md
├── 03-proxy-api-audit.md
├── 04-one-endpoint.md
├── 05-live-playground.md
├── 06-demo-mode.md
├── 07-proxy-api-rollout.md
└── 08-open-api.md
```

Each phase document should define:

```text
Objective
Scope
Inputs
Required work
Out of scope
Required skills/tools
Required model
Validation
Acceptance criteria
Completion gate
Stop condition
```

Claude must not begin a later phase before the current phase reaches its approval gate.

---

# `design-system/`

Approved UI/UX system.

```text
design-system/
├── RESEARCH.md
└── MASTER.md
```

`RESEARCH.md` is the Phase 1 research record (patterns studied, adopted,
and rejected). `MASTER.md` becomes the source of truth for:

- spacing
- typography
- colors
- cards
- tables
- navigation
- responsive behavior
- form controls
- code blocks
- API documentation UI
- Playground UI

Once approved, normal implementation should follow this system rather than independently redesigning components.

---

# `source-docs/`

Raw documentation and source material used to build the portal.

Example:

```text
source-docs/
├── inventory.json
├── DOCS_AUDIT.md
├── unresolved.md
└── imported/
```

This area may contain:

- legacy API documentation
- endpoint inventories
- source schemas
- audit findings
- unresolved documentation questions

Raw source documentation must not be confused with finalized public documentation.

---

# Application Source

Application implementation belongs under `src/`.

Exact subdirectories should follow the framework actually used by the repository.

Example only:

```text
src/
├── components/
├── pages/
├── layouts/
├── features/
├── services/
├── hooks/
├── utils/
├── types/
└── styles/
```

Do not create directories merely because they appear in this example.

Inspect the existing application architecture first.

New code should follow existing repository conventions unless there is an approved reason to change them.

---

# Tests

```text
tests/
```

or the testing convention already established by the application.

Tests should remain logically close to the functionality they validate.

Do not create duplicate testing structures without justification.

---

# Scripts

```text
scripts/
```

Use for:

- maintenance utilities
- migration helpers
- validation scripts
- documentation-generation helpers
- repository tooling

Do not place application runtime logic here.

---

# `.claude/`

Claude-specific project configuration.

Example:

```text
.claude/
├── skills/
└── commands/
```

Only Claude Code configuration or project-specific Claude resources belong here.

---

# `.vscode/`

Shared VS Code project configuration.

Recommended:

```text
.vscode/
├── settings.json
├── tasks.json
└── extensions.json
```

Prefer reusable VS Code tasks for standard development commands.

---

# File Placement Rules

Before creating a new file, Claude must determine:

1. Does an existing file already serve this purpose?
2. Does an existing directory already own this responsibility?
3. Would adding this file duplicate existing documentation or logic?
4. Is this file temporary or permanent?
5. Is the proposed location consistent with repository conventions?

Avoid unnecessary files and directories.

---

# Structural Change Rule

Whenever Claude:

- adds a significant directory
- removes a significant directory
- moves a major component
- introduces a new subsystem
- changes architecture ownership
- changes the documentation hierarchy

Claude must check whether `docs/PROJECT_STRUCTURE.md` needs updating.

Minor implementation files do not require an update to this document.

---

# No Invented Paths

Never assume that a documented example path exists.

Before modifying or referencing a file:

1. inspect the repository
2. verify the actual path
3. use the real repository structure

If documentation and the repository disagree, report the discrepancy before restructuring anything.

---

# Generated and Dependency Directories

Do not document individual contents of generated/dependency directories such as:

```text
node_modules/
dist/
build/
coverage/
.git/
.cache/
```

These are not part of the architectural repository map.

---

# Organization Principle

Every important project artifact should have one clear authoritative location.

Avoid:

```text
security-notes.md
security-new.md
security-final.md
security-final-v2.md
```

Prefer:

```text
docs/SECURITY.md
```

with Git history preserving previous versions.

The same principle applies to architecture, testing, decisions, status, and project planning.
