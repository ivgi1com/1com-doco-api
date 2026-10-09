# Testing Strategy

## Standard quality gate

Before an approval gate, run the configured equivalents of:
1. TypeScript/typecheck
2. Lint
3. Unit/integration tests
4. Production build
5. Required Playwright tests
6. Code review
7. Security review where applicable

## Browser validation

Use Playwright for meaningful user-facing changes.

Check:
- desktop
- tablet when relevant
- mobile
- navigation
- sidebar
- endpoint page
- Playground inputs
- JSON viewer
- loading state
- empty state
- error state
- keyboard interactions where relevant
- browser console errors

## One-endpoint prototype acceptance

The prototype is not complete until:
- documentation is accurate to known evidence
- real request reaches the approved API path
- correct response renders
- HTTP status renders
- latency renders
- validation works
- invalid credentials produce an appropriate error
- missing input is handled
- loading state works
- timeout behavior works
- JSON is readable
- credentials are not logged
- responsive UI works
- Try It integration works

## Destructive API tests

Do not execute destructive or state-changing endpoint tests unless specifically approved and a safe test target is defined.

Prefer a read-only endpoint for the first prototype.

## Real-PBX checks (env-gated)

`tests/e2e/live-real.spec.ts` is the only test that reaches the real PBX. It
is skipped unless the user exports test credentials in their own shell
(`docs/ENVIRONMENT.md`); never commit or log them. Run it alone:

```
npx playwright test tests/e2e/live-real.spec.ts --project=chromium-desktop --reporter=list
```

- Phase 9: `openapi/simplecdrs-list` field allowlist and error envelope.
- Phase 11: Open API pass-through reads (queues, extensions, voicemails),
  path parameters, a blocked read.
- Phase 12: every Proxy Live read, paced 7 s apart (about 5 minutes).

Assertions are counts and booleans only; trace, screenshot and video are off.

## Menu tests

- Unit: `tests/unit/menu-categories.test.ts` (`menuCategories`, `menuGroups`).
- E2E: the side-menu and "menu groups" tests in `tests/e2e/smoke.spec.ts`.

