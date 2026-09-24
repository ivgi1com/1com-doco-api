# Session Handoff

Last updated: 2026-09-24

## State
- Branch: `phase/design-research` (off `main` baseline `d12cc39`). No remote, nothing pushed.
- Phase 1 (Design Research) is **approved** and tagged `v0.1-design-approved`.
- Not merged to `main` yet (needs explicit approval). **Phase 2 not started.**

## Done (do not repeat)
- `design-system/RESEARCH.md` and `design-system/MASTER.md`: Approved. MASTER.md "Resolved decisions" records:
  - brand `#3731ee` / `#781df0` + Assistant are official
  - radii 4/6/10px
  - amber Live / teal Demo
  - dedicated Playground route
- `docs/DECISIONS.md`: design direction marked Approved, with the deferred items listed.

## Next step
1. Ask the user whether to merge `phase/design-research` into `main`.
2. Start Phase 2 (`docs/phases/02-design-prototype.md`) only on the user's explicit go-ahead, on a new branch (e.g. `phase/design-prototype`).

## Open items (deferred, non-blocking)
- SVG logo availability. Only a raster PNG is known. Do not invent or trace a logo.
- Sign-in / Console link destination. Ask before finalizing Phase 2 nav.
- Hebrew content scope. Decide before the Phase 3/4 content model.
- Whether to commit reference screenshots (currently no).

## Context a fresh session needs
- Inter, Geist, Geist Mono, JetBrains Mono and Open Sans have **no Hebrew subset** on Google Fonts. Assistant does.
- The 1com.co.il site is Hebrew RTL only and has no public API docs.
- UI/UX Pro Max is not installed. `impeccable` (global skill) was used for its rules only.
  - Its `init` step (PRODUCT.md) was skipped.
  - An impeccable update (v3.5.0 to v4.3.1) is available; the user has not been asked.
- Playwright + Chromium are installed only outside the repo (`%LOCALAPPDATA%\ms-playwright`). The repo has no app or package.json yet.
- Model routing: Phase 1 research ran on Sonnet subagents; synthesis and approval close-out ran on Opus.
