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

See "Model Routing and Transition Rules" at the end of this document for model
assignments and the mandatory transition check. That section is canonical;
this entry is a pointer only, to avoid two diverging copies of the same rule.

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


## Model Routing and Transition Rules

The project uses different Claude models according to task complexity and risk.

### Default model assignments

**Sonnet 5 — default implementation model**
Use for:
- normal frontend implementation
- normal backend implementation
- API integration
- routine debugging
- tests
- Playwright work
- documentation
- ordinary refactoring
- UI fixes
- repetitive development work that still requires coding judgment

**Opus 5.5 — specialist / high-consequence model**
Use for:
- system architecture
- major architectural changes
- security-sensitive implementation
- API content-model design
- authentication or authorization design
- credential or secret handling
- backend proxy boundaries
- major database/schema decisions
- major refactors
- complex debugging where the cause is unclear (after evidence-based Sonnet investigation)
- high-risk migrations
- final architecture review
- final code review
- final security review
- difficult code review where mistakes could have significant consequences

**Haiku 4.5 — low-risk mechanical work only**
Use only for:
- bulk/simple repetitive transformations
- basic file classification
- indexing
- metadata extraction
- straightforward/repetitive formatting
- low-risk documentation cleanup
- low-risk inventory generation
- other clearly mechanical tasks

Never use Haiku for: security, architecture, undocumented API interpretation,
credentials, production behavior, major UX decisions, important implementation
decisions, debugging with uncertain causes, or final reviews.

### Mandatory model transition check

Before beginning every materially different task, sub-task, phase, or review:

1. Determine which model is appropriate for the upcoming work.
2. Compare that requirement with the currently selected model.
3. If the current model is appropriate, continue.
4. If the current model is not appropriate, STOP before beginning the work.
5. Tell the user:
   - which model should be selected
   - why that model is appropriate
   - what task will be performed after the switch
6. Wait for the user to change the model before proceeding.

Do not silently continue using the wrong model.

### Cost and usage protection

Do not remain on Opus for routine implementation merely because the session was originally started with Opus.

When an Opus-specific architecture, security, debugging, or review task is complete, explicitly tell the user when the remaining work can safely return to Sonnet.

Example:

> Architecture review is complete. The next work is routine implementation, so switch to Sonnet before continuing.

Likewise, if Sonnet reaches work requiring Opus-level reasoning:

> The next task affects authentication architecture and security boundaries. Switch to Opus before I continue.

### Phase boundaries

At every project approval gate and before starting a new phase:

- re-evaluate the required model
- tell the user if a model change is recommended
- do not begin the next phase using an inappropriate model

### Final review

A final critical code/security review should be performed with Opus when the phase includes:
- authentication
- authorization
- credentials
- externally exposed APIs
- production infrastructure
- security boundaries
- significant architectural changes

After the review is complete, return to Sonnet for ordinary remediation unless the fixes themselves remain high risk.

## Mandatory Phase Completion and Approval Gate

When the current phase appears complete, STOP before beginning the next phase.

Do not automatically continue to the next phase.

Before asking for approval:

1. Verify the current phase against its acceptance criteria.
2. Run the required tests and validation for this phase.
3. Review the relevant Git diff and working-tree state.
4. Identify:
   - completed work
   - failed or incomplete requirements
   - known limitations
   - regressions or unresolved issues
   - tests performed and results
5. Do not hide, minimize, or silently fix issues just to reach the approval gate.
6. Do not start planning or implementing the next phase yet.

Then present a concise Phase Completion Report containing:

- Phase number and name
- Completion status
- Acceptance criteria status
- Tests/validation performed and results
- Important files/components changed
- Known issues or limitations
- Current Git branch
- Current working-tree state
- Recommended model for the next phase, if model-routing rules require a change

Then explicitly ask the user to choose ONE of these actions:

**A — Approve, save, and continue**
The current phase is approved.
Create the final phase checkpoint, update all required status/handoff/decision documentation, commit the completed phase safely, then enter PLAN MODE for the next phase.
Do not implement the next phase until its plan is reviewed and separately approved.

**B — Approve, save, and stop**
The current phase is approved.
Create the final phase checkpoint, update all required status/handoff/decision documentation, commit the completed phase safely, then STOP.
Record that the next phase has not started and is waiting for user approval.

**C — Do not approve yet**
Do not mark the phase complete.
Do not create a final phase-completion checkpoint.
Wait for the user's requested fixes, questions, or changes.

**D — Review only**
Do not save the phase as complete and do not continue.
Remain at the approval gate so the user can inspect the results.

Never interpret silence as approval.
Never start the next phase automatically.
Never change phase status from active to completed without explicit user approval.

### After the user selects A or B

Before creating the checkpoint:

- update the current phase document if required
- update `docs/CURRENT_STATUS.md` if present
- update `docs/SESSION_HANDOFF.md` if present
- update `docs/DECISIONS.md` only for material new decisions
- update architecture/security/testing/project-structure documentation only when genuinely affected
- inspect the final Git diff
- exclude secrets, temporary files, generated junk, dependency directories, and unrelated changes
- create a descriptive phase-completion commit when safe
- verify `git status` afterward

For option A:
After saving the completed phase, enter PLAN MODE for the next phase and stop at its planning approval gate.

For option B:
After saving the completed phase, stop completely. Do not inspect, research, plan, or implement the next phase.

### Required approval-gate question

At the end of every completed phase, ask:

`Phase <N> appears complete and has passed its required validation. What would you like me to do?`

`A — Approve, save, and continue to planning the next phase`
`B — Approve, save, and stop here`
`C — Do not approve yet; I want changes`
`D — Keep it at the review gate without saving completion`

Wait for the user's choice before proceeding.


## Agent skills

### Issue tracker

GitHub Issues (`ivgi1com/1com-doco-api`, via `gh`). See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: root `GLOSSARY.md` + `docs/adr/`. See `docs/agents/domain.md`.
