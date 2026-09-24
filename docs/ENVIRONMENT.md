# Development Environment

## Editor

VS Code with Claude Code.

Claude works from the repository root.

## Runtime

The application has not been bootstrapped yet.

During the setup phase:
- choose a current supported Node.js LTS
- choose the package manager
- record exact versions in this file and `docs/DECISIONS.md`
- do not guess if the user has an environment constraint that is not documented

## Standard commands

Once bootstrapped, configure consistent scripts such as:

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run test:e2e`
- `npm run check`

`npm run check` should eventually cover the standard non-browser quality gate.

## Local URL

Default expectation for a standard Next.js dev server is typically `http://localhost:3000`, but verify the actual configured port before documenting or relying on it.

Do not assume another port without checking.

## Environment variables

Use local environment files appropriate to the selected framework.

Rules:
- local secret files must not be committed
- `.env.example` documents names only
- never put real credentials in documentation
- never print secrets unnecessarily

## Browser testing

Use Playwright for functional and visual validation.

For user-facing changes:
- inspect the actual running app
- test desktop
- test mobile
- include tablet where useful
- check console errors
- exercise the changed behavior

## Git

- never implement major phases directly on `main`
- never merge without explicit approval
- never push unless explicitly requested
- never force-push
- never discard uncommitted user changes

## Process safety

Before starting a dev server, check whether one is already running.

Do not kill unrelated processes.

Before destructive commands, stop and ask.

## Scope

Before substantial work:
- read `docs/CURRENT_STATUS.md`
- read the active phase document
- work only within the current phase
- do not automatically continue to the next phase
