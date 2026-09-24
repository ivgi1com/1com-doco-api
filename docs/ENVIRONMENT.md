# Development Environment

## Editor

VS Code with Claude Code.

Claude works from the repository root.

## Runtime

Bootstrapped in Phase 2 (see `docs/DECISIONS.md` "Phase 2 setup").

- Node.js `24.15.0` (LTS)
- npm `12.0.2`
- Next.js `16.3.6` (App Router, Turbopack, `src/`)
- React `19.2.8`
- TypeScript `5.9` (`^5` in `package.json`)
- Tailwind CSS `4.3.3` (`@tailwindcss/postcss`)
- next-intl `4.14.7` (`/en`, `/he` prefixes via `src/proxy.ts`)
- shiki `4.4.3` (server-side syntax highlighting)
- lucide-react `1.48.0` (icons)
- vitest `5.0.1`
- @playwright/test `1.63.0` (Chromium + WebKit installed locally)

## Standard commands

```
npm run dev        # next dev
npm run build       # next build
npm run start       # next start (after build)
npm run lint         # eslint .
npm run typecheck   # tsc --noEmit
npm run test        # vitest run (tests/unit/)
npm run test:e2e    # playwright test (tests/e2e/), builds+starts the app
npm run check       # typecheck && lint && test — the non-browser quality gate
```

Next.js 16 generates ambient `PageProps`/`LayoutProps` route types under
`.next/types/` from the route tree, produced by `next dev`, `next build`,
or explicitly `npx next typegen`. Run `next typegen` after adding or
removing a route before `tsc --noEmit`, or typecheck reports
`Cannot find name 'PageProps'`/`'LayoutProps'` for the new route (not a
code defect — first hit when Phase 2 was compiled for the first time).

## Local URL

`http://localhost:3000` (default Next.js dev/start port; nothing in
`next.config.ts` overrides it). `playwright.config.ts`'s `webServer`
also targets `:3000`.

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
