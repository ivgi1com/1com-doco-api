# Session Handoff

Last updated: 2026-09-24

## State
- Branch: `phase/design-prototype` (off `main` @ `dc5f5bc`). No remote, nothing pushed.
- Phase 1 is approved, tagged `v0.1-design-approved`, and merged to `main`.
- Phase 2 (Design Prototype) is mid-implementation. There is a WIP checkpoint commit on the branch.
- **The code has never been compiled or run.** Run `npx tsc --noEmit` and `npm run build` first, and expect errors to fix.

## Done (do not repeat)
- The scaffold was copied from `create-next-app` (generated in the scratchpad, not in the repo).
- Default public SVGs were removed.
- `AGENTS.md` exists on purpose. Without it, `next dev` would append its agent-rules block into the project `CLAUDE.md`.
- Logo:
  - The official PNG was fetched from 1com.co.il into `public/brand/1com-logo.png`. It is a white wordmark on transparent.
  - It is rendered as a CSS mask (`.brand-mark`), so it takes the theme ink colour.
  - `src/app/icon.png` is the same logo on brand indigo.
- Tokens:
  - Tokens live in `src/app/globals.css`.
  - Dark theme is set via `html[data-theme]`, resolved before paint by `THEME_INIT_SCRIPT` (`src/components/shell/theme.ts`).
  - Syntax colours are in `src/lib/highlight.ts`. They were computed at >= 6.8:1 on code-bg and avoid the Live/Demo hues.
- The file and component inventory is in `docs/CURRENT_STATUS.md`.

## Key design and implementation choices already made
- Breakpoints:
  - The sidebar is visible from `xl` up; below that it is a drawer (native `<dialog>`).
  - The endpoint request panel sits beside the content from `md` up; below `md` it is a `<details>` after the summary.
- Content prose stays English with `lang="en" dir="auto"`. The Hebrew locale shows the "not translated yet" banner.
- Synthetic content is always labelled with `PrototypeBanner`.
  - The host is `api.example.com`.
  - Phone numbers are fictional (`+1555555 01xx`).
  - The key placeholder is `$SAMPLE_API_KEY`.
- Playground plan (not written yet):
  - Route `/[locale]/playground?endpoint=<api>/<endpointId>`, with a persistent mode bar (amber Live, teal Demo).
  - Switching mode goes through a confirm dialog.
  - Demo returns the synthetic `responses[].example` in the browser, with simulated latency and a request id. A "Simulate error" toggle returns the 4xx example.
  - Live has no backend yet (that is Phase 5). In Live, Send shows a **Live error state** and never falls back to Demo.
  - Includes a masked API key field (session-only), required-field validation, and a mobile step flow.
- The planned `Proxy API` and `Open API` entries appear as disabled options in the sidebar API switcher.
- The heredoc + node `-e` combination fails in this Bash tool (a quote-parsing issue). Write files with the Write tool.

## Next step
1. Finish the routes and components listed as unfinished in `CURRENT_STATUS.md`.
2. Add scripts and configs: `typecheck` (`tsc --noEmit`), `test` (vitest), `test:e2e` (playwright), `check`.
3. Make typecheck, lint and build pass.
4. Run a Playwright visual pass at 1440 / 1024 / 768 / 390 px, en + he, light + dark, and check console errors. Fix issues.
5. Run the impeccable audit and a React review. Record the versions in `ENVIRONMENT.md`.
6. Commit, then STOP at the Phase 2 gate for user approval.

## Open items (carried)
- SVG logo (only the PNG exists).
- Console link destination. The button is currently inert.
- Hebrew content scope (Phase 3/4). The Hebrew UI strings are a DRAFT and need native review.
- Whether to commit reference screenshots (currently not committed).
- npm 12 has blocked install scripts for `@parcel/watcher`, `@swc/core` and `unrs-resolver`. Their scripts were not approved. Ask the user if the build or lint needs them.
- An impeccable update (v3.5.0 to v4.3.1) is available; the user has not been asked.
