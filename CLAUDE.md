# CLAUDE.md

## Project purpose

Build a professional developer portal for the company's VoIP API ecosystem.

Initial focus:
1. Research and lock the design direction.
2. Audit and normalize the existing Proxy API documentation.
3. Implement one real Proxy API endpoint end-to-end.
4. Build a secure Live Playground for that one endpoint.
5. Build a fully isolated Demo mode for that same endpoint.
6. Stop for explicit approval.
7. Only after approval, scale to the remaining Proxy API.
8. Open API comes later using the same reusable architecture.

## Permanent operating rules

### 1. No-guessing protocol

If anything material is unclear, incomplete, contradictory, undocumented, or open to multiple reasonable interpretations:

STOP.

Do not:
- guess
- invent behavior
- silently choose an implementation
- assume what the user probably meant
- migrate undocumented assumptions into the new portal

Ask the user before proceeding with that part.

Structure clarification requests as:
- What is unclear
- Why it matters
- Available options
- Recommended option
- Wait for the user's decision

Trivial and fully reversible implementation details do not require approval.

### 2. Existing documentation is evidence, not guaranteed truth

For API behavior, distinguish:

DOCUMENTED -> IMPLEMENTED -> TESTED -> VERIFIED

If the documentation conflicts with observed API behavior:
- record the discrepancy
- do not silently fix or reinterpret it
- update `source-docs/DOCS_AUDIT.md`
- ask the user when a material decision is required

### 3. Approval gates are mandatory

Do not automatically start the next major phase.

When a phase reaches its completion gate:
- run required checks
- summarize results
- stop
- wait for explicit user approval

### 4. Git workflow

- `main` represents the latest approved stable state.
- Never implement a major phase directly on `main`.
- Create one branch per major phase or approval gate.
- Never merge into `main` without explicit user approval.
- Never push unless explicitly requested.
- Never force-push.
- Never discard uncommitted user changes.
- Never delete an unmerged branch without user approval.
- Small feature/fix branches are allowed when useful.
- Tag approved milestones.

Suggested tags:
- `v0.1-design-approved`
- `v0.2-shell-approved`
- `v0.3-proxy-prototype-approved`
- `v0.4-demo-approved`
- `v0.5-proxy-complete`
- `v1.0-developer-portal`

### 5. Terminal safety

Before any destructive command, STOP and ask.

Examples:
- `rm -rf`
- `git reset --hard`
- `git clean`
- database reset
- dropping tables
- deleting migrations
- overwriting environment files
- force-push
- mass file deletion

Do not kill unrelated processes.

### 6. Visual validation

A user-facing UI change is not complete when the code compiles.

For meaningful UI changes:
1. Start the local application.
2. Open it with Playwright.
3. Inspect the rendered UI.
4. Test desktop and mobile layouts.
5. Check browser console errors.
6. Exercise the affected interaction.
7. Fix visual or functional problems found.
8. Re-run validation.

Never claim a UI issue is fixed based only on source inspection.

### 7. Security invariants

Never expose or log:
- API keys
- Authorization headers
- tenant secrets
- production credentials
- sensitive request payloads

The Live Playground must call an approved backend proxy, not arbitrary hosts.

The backend proxy must:
- enforce an allowlist
- restrict methods
- restrict endpoints
- enforce request timeout
- enforce response-size limits
- rate-limit requests
- sanitize logs and telemetry

Demo mode must:
- never call production APIs
- never require real credentials
- never use real customer data
- never silently replace a Live failure with Demo data
- use clearly synthetic fixtures derived from verified schemas

### 8. Model routing policy

Default:
- Claude Sonnet 5

Use Opus 5.5 for:
- architecture decisions
- security-sensitive decisions
- API content-model design
- authentication and credential handling
- backend proxy boundaries
- major refactors
- hard debugging after evidence-based Sonnet investigation
- final code review
- final security review

Use Haiku 4.5 only for:
- bulk classification
- indexing
- metadata extraction
- repetitive formatting
- low-risk inventory generation

Never use Haiku for:
- security
- architecture
- undocumented API interpretation
- credentials
- production behavior
- major UX decisions

### 9. Skill/tool routing

Use phase-specific skills rather than loading everything.

Preferred:
- UI/UX Pro Max: design research and design-system generation
- Anthropic `frontend-design`: frontend implementation
- Vercel `react-best-practices`: React/Next.js engineering quality
- Vercel `web-design-guidelines`: UI/UX audit
- Vercel `writing-guidelines`: documentation writing quality
- Microsoft Playwright skill/CLI: browser and E2E validation
- Anthropic `code-review`: major code-review gate
- Anthropic `security-review`: playground/security gate

Use specialist libraries only when a concrete need appears.

### 10. Session startup

Before substantial work:
1. Read `docs/CURRENT_STATUS.md`.
2. Read the active phase file.
3. Read only the specialist docs required by that phase.
4. Inspect Git status and current branch.
5. Do not re-read unrelated future-phase documents unless necessary.

### 11. Scope ownership

Claude may normally modify:
- application source
- components
- tests
- documentation
- public assets
- project-local configuration

Ask before materially changing:
- CI/CD
- deployment
- production infrastructure
- DNS
- external services
- database schemas
- authentication architecture
- security policy

## Standard checks

Before an approval gate, run the project's configured equivalents of:
- typecheck
- lint
- unit/integration tests
- production build
- required Playwright checks

Do not invent missing commands. If the project is not bootstrapped yet, create or propose them during the appropriate setup phase.
