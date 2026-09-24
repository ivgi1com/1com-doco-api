# Developer Portal — Claude Code Project Control Pack

This repository control pack is designed to bootstrap a developer portal for the company's VoIP APIs using Claude Code inside VS Code.

## Goal

Build a professional developer portal that supports:

- Proxy API documentation first
- Open API later
- A real API Playground
- A fully isolated Demo mode
- Guides and reference documentation
- Search, feedback, observability, versioning, and deprecation
- Strong security boundaries
- Explicit user approval gates before scope expansion

## Recommended stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- MDX
- OpenAPI-compatible internal content model
- Playwright for browser/E2E validation

## Start here

1. Open this repository root in VS Code.
2. Open Claude Code from the repository root.
3. Give Claude the startup instruction from `BOOTSTRAP_PROMPT.md`.
4. Claude must read `CLAUDE.md` and `docs/CURRENT_STATUS.md` before substantial work.
5. The active phase is Phase 1: Design Research.
6. Claude must stop at every approval gate.

## Important

The existing API documentation is evidence, not automatically ground truth.
Do not invent undocumented API behavior.
Material ambiguity must be raised to the user.
