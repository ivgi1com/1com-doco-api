# Design System — MASTER

Status: **Approved (2026-09-24).** Evidence: `design-system/RESEARCH.md`.
Brand colours and font confirmed official by the user (2026-09-24). SVG logo availability still open.

## Target direction

80% clean professional developer portal, 20% subtle futuristic character drawn from telecom signal language (hairlines, telemetry, precise state motion), not glow.

## Avoid

- excessive glassmorphism, blur used as decoration
- neon overload, glow shadows
- giant gradients, gradient text (the header hairline is the only gradient)
- decorative blobs
- unnecessary motion, orchestrated page-load sequences
- oversized rounded cards, nested cards, identical card grids
- side-stripe (thick `border-inline-start`) callouts
- generic AI-generated visual language (uppercase eyebrows on every section, hero metrics)

## Color system

- Format: OKLCH in tokens, with hex listed for reference.
- Strategy: **Restrained**. Neutrals are tinted toward the brand hue 275 (chroma ≤ 0.02). The accent is used only for primary actions, links, selection, focus and current state.
- All pairs below were computed for WCAG 2.x contrast.

Brand (confirmed official, 2026-09-24):
- `brand-indigo` oklch(0.478 0.265 271.6) `#3731ee`. White on it: 7.41:1.
- `brand-violet` oklch(0.517 0.271 293.1) `#781df0`. White on it: 6.49:1.

Light theme:
- `bg` oklch(0.992 0.002 275) `#fcfcfe`. The content surface is a true near-white, not cream.
- `surface-2` oklch(0.972 0.005 275) `#f5f6f9`: sidebar, request panel chrome, table header.
- `border` oklch(0.905 0.008 275) `#dedfe5`: decorative dividers only (1.30:1).
- `border-control` oklch(0.60 0.016 275) `#7d808a`: inputs and controls (3.86:1, meets the 3:1 non-text requirement).
- `ink` oklch(0.235 0.02 275) `#1b1d28` (16.3:1 on bg).
- `ink-muted` oklch(0.47 0.02 275) `#575a66` (6.7:1 on bg, 6.3:1 on surface-2).
- `accent` = brand-indigo (6.8:1 as text on bg). `accent-hover` = brand-violet, matching the existing 1com button behaviour.
- `code-bg` oklch(0.20 0.018 275) `#14151e`. Code blocks are dark in both themes; ink on it is 15.4:1.

Dark theme:
- `bg` oklch(0.165 0.012 275) `#0d0e14`.
- `surface-2` oklch(0.145 0.012 275) `#090a0f`: sidebar, recessed.
- `raised` oklch(0.20 0.014 275) `#14161c`: panels, menus.
- `border` oklch(0.29 0.016 275) `#292b33`.
- `border-control` oklch(0.52 0.018 275): at least 3:1 on bg and raised.
- `ink` oklch(0.945 0.005 275) `#ecedf0` (16.4:1).
- `ink-muted` oklch(0.73 0.016 275) `#a4a7b2` (8.0:1).
- `accent` oklch(0.73 0.14 276) `#909fff`: a lightened brand tint (7.9:1 on bg), because the raw brand colours fail on dark at 2.0–3.0:1. Text on the accent uses `bg`.
- `code-bg` oklch(0.13 0.012 275) `#06070c`.

Semantic states (both themes, tint + ink pairs, each ≥ 4.5:1): `info` (brand hue), `success` (155), `warning` (80), `danger` (25). Standard interaction states for every control: hover, focus, active, disabled, selected, loading, error.

Mode colors (reserved, never used for anything else):
- `mode-live`: hue 40–55, amber/orange.
  - Light: solid oklch(0.55 0.17 40) `#bf4306` with white text (5.2:1). Tint oklch(0.965 0.03 40) with ink oklch(0.47 0.15 40) (6.5:1).
  - Dark: oklch(0.78 0.14 55) `#fb9d59` on tint oklch(0.24 0.05 45) (8.0:1).
- `mode-demo`: hue 195, teal.
  - Light: solid oklch(0.50 0.10 195) `#007475` with white text (5.6:1). Tint oklch(0.965 0.025 195) with ink oklch(0.43 0.08 195) (7.0:1).
  - Dark: oklch(0.80 0.10 195) `#65d2d2` on tint oklch(0.23 0.035 195) (9.3:1).

## Dark/light strategy

- The default follows `prefers-color-scheme`. A manual override (Light / Dark / System) is stored per viewer.
- Code blocks and the JSON viewer are dark in both themes, which matches IDE context.
- The brand accent is re-tinted for dark, never used raw.
- There must be no flash of the wrong theme. The theme is set before paint (implementation detail for Phase 2).

## Typography

Families (maximum 2):
- UI and prose: **Assistant** (confirmed brand font). Variable 200–800, native Hebrew + Latin, OFL. One family carries headings, body, labels and data.
  - Fallback: `"Assistant", "Noto Sans Hebrew", system-ui, -apple-system, "Segoe UI", Arial, sans-serif`.
- Mono: **JetBrains Mono** (OFL, Latin only). Used for code, paths, method pills, parameter names and telemetry.
  - Fallback: `"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`.
  - Hebrew never renders in mono. Code containers are `dir="ltr"`.
- Rejected: Inter, Geist and Open Sans have no Hebrew subset on Google Fonts (verified). Mono headings (the Shopify pattern) hurt scanning.

Scale: fixed rem, ratio about 1.2. Assistant has a small x-height, so base sizes sit one step above the vendor 14px norm.
- `text-xs` 12px/16 (labels, badges)
- `text-sm` 14px/20 (dense UI, parameter meta, sidebar)
- `text-base` 16px/26 (prose)
- `text-md` 18px/28 (lead)
- `text-lg` 20px/28 (H3)
- `text-xl` 24px/32 (H2)
- `text-2xl` 30px/38 (H1 on reference)
- `text-3xl` 36px/44 (H1 on guides and landing only)

Rules:
- Mono is set at 0.9em relative to the surrounding text, and code blocks at 14px (never 12px or smaller).
- Weights: 400 body, 600 headings and labels, 700 only for the H1. Hebrew headings use no negative tracking.
- Prose max 70ch. Tables and code can run wider.
- `text-wrap: balance` on h1–h3, `text-wrap: pretty` on prose.
- Uppercase only in badges (4 words or fewer).

## Spacing scale

4px base: `0.5 (2) · 1 (4) · 2 (8) · 3 (12) · 4 (16) · 5 (20) · 6 (24) · 8 (32) · 10 (40) · 12 (48) · 16 (64)`.
- Reference pages are dense: parameter rows use 12px vertical padding with a hairline separator.
- Guides are airy: 24–32px between blocks.
- Section rhythm varies by content, not a single uniform gap.
- Directional spacing only uses logical properties (`ms/me/ps/pe/start/end`).

## Radii

- `radius-sm` 4px: badges, inline code, method pills.
- `radius-md` 6px: inputs, buttons, code blocks, callouts.
- `radius-lg` 10px: panels, dialogs, menus.
- `radius-full`: toggles, the status dot, avatars.
- Nothing larger. This is a deliberate step down from the marketing site's 1–1.5rem cards (approved 2026-09-24).

## Borders

- 1px everywhere. Decorative dividers use `border`; interactive controls use `border-control`.
- Focus: a 2px `accent` ring with a 2px offset, `:focus-visible` only.
- No colored `border-inline-start` accents. Callouts use a tint, a full hairline and an icon instead.

## Shadows

- Surfaces are separated by tone and border, not shadow.
- `shadow-overlay` only for floating layers (menus, command palette, dialogs, toasts): `0 8px 24px oklch(0.2 0.02 275 / 0.12)` in light. In dark, a lighter `raised` surface plus a border replaces the shadow.

## Surface hierarchy

`surface-2` (sidebar and recessed) → `bg` (content) → `raised` (dark-theme panels and menus) → overlay. Code surfaces are separate (`code-bg`, dark in both themes). Cards never nest.

## Method badges

- Filled pill in monospace, `text-xs`, 600 weight, uppercase, fixed width (about 4.5ch) so paths align. The verb text is always present.
- Light: white text. Dark: text in `bg` colour. All values are ≥ 4.7:1.
  - GET: hue 245, light oklch(0.52 0.16 245), dark oklch(0.78 0.11 245).
  - POST: hue 155, light oklch(0.52 0.14 155), dark oklch(0.80 0.13 155).
  - PUT: hue 70/80, light oklch(0.56 0.13 70), dark oklch(0.83 0.12 80).
  - PATCH: hue 300, light oklch(0.50 0.20 300), dark oklch(0.78 0.13 300).
  - DELETE: hue 25, light oklch(0.52 0.19 25), dark oklch(0.76 0.13 25).
- The badge and path always render `dir="ltr"`, never mirrored.

Lifecycle badges: outline style, so they never compete with method pills.
- `Current`: hidden by default.
- `Experimental`: info hue.
- `Deprecated`: warning hue, plus a sunset date when one is known.
- `Legacy`: neutral, with a "use X instead" link.
- Surface-level deprecation or legacy status shows a full-width banner at the top of the page.

## Code blocks

- Dark in both themes. Header row: language tabs (the chosen language persists per viewer, applied site-wide), then a copy button with a "Copied" state.
- Optional filename or title. Line numbers only for more than 10 lines. Line highlight supported.
- Placeholders are always visibly marked (`<YOUR_API_KEY>`, `$ONECOM_API_KEY`); samples never contain a realistic-looking secret.
- Horizontal scroll inside the block, never page overflow.
- Always `dir="ltr"`, including on Hebrew pages.

## Tables

- **Parameters**: a definition list, not a table.
  - Row: `name` (mono, 600), a type pill, then `Required` (danger ink) or `Optional` (muted). Both are always printed.
  - Then the description, `Default:`, `One of:` enum chips, and any conditional note ("Only present when …").
  - Nested objects: "Show child attributes" disclosure, deep-linkable by field path. "Expand all" per section.
- **Data tables** (status codes, error codes, changelog):
  - Sticky header in `surface-2`, hairline row separators, no zebra striping.
  - Numbers are tabular.
  - On mobile, rows stack as label/value pairs (no horizontal scroll for tables of 4 columns or fewer).

## Navigation

- Header height 56px, sticky, `bg` with a bottom border plus a 1px brand hairline (indigo to violet).
- Contents: logo, Guides / API Reference / Changelog, search (`⌘K`/`Ctrl K`, `/`), theme, account. (The `EN | עב` language switch was removed 2026-10-08: English only.)
- Sidebar:
  - 16rem, sticky, scrolls independently.
  - Active item: `accent` text on an accent tint at about 10%. No side stripe.
  - Groups use chevron disclosure. The API reference sidebar contains the API switcher, version picker and tree filter.
- Command palette: an overlay with results grouped by type (Endpoint / Guide / Parameter / Error), keyboard-first. Zero-result queries are logged (sanitized).
- Mobile: header (logo, search icon, menu), a drawer from the inline-start side, and a breadcrumb row.

## Cards

- Used only for navigational entry points (docs landing: API and guide entries), and never in grids of identical icon + heading + text.
- Hairline border, `radius-lg`, no shadow. Hover changes the border to `border-control` and the title to `accent`.

## Callouts

- Four kinds: `note` (info), `tip` (success), `warning`, `danger`, plus `rate-limit` (info with a gauge icon) for telecom limits.
- Structure: a tinted background, a full 1px border in the same hue, a leading icon and a bold label.
- No side stripe.

## Forms

- Controls 36px tall (32px in dense Playground mode), with a `border-control` border and a label always visible above. No placeholder-as-label.
- Placeholder contrast is ≥ 4.5:1.
- States: default, hover, focus, disabled, read-only, error (message below, linked via `aria-describedby`), loading.
- Credential fields: masked by default with a reveal toggle, `autocomplete="off"`, never echoed into URLs, logs or history. Security behaviour is specified in Phase 5.
- LTR-typed fields (URLs, IDs, E.164, JSON) render `dir="ltr"` with the text aligned to the start even on Hebrew pages.

## Playground

- A dedicated route with three panes (endpoints / request builder / response viewer). Mobile uses a step flow. Deep-linked from each endpoint.
- **Mode bar**: full width, persistent, never scrolls away.
  - Pairs a colour tint (`mode-live` / `mode-demo`), an icon, a text label ("LIVE: requests reach your tenant" / "DEMO: synthetic data, no real requests") and a mode switch.
  - Switching requires an explicit action and confirmation.
- Every response header shows `source: LIVE|DEMO`, status, latency, size and request ID in mono telemetry style.
- Live errors (auth, timeout, rate limit, proxy rejection) have distinct error states and never fall back to Demo.

## JSON viewer

- Dark `code-bg`, mono 14px, collapsible tree with a per-node caret.
- Toolbar: "Expand all / Collapse all", search, copy.
- Per-node actions: copy value, copy path (`$.data[0].id`).
- Type-coloured tokens: string, number, boolean, null, key. Hues are distinct from the method pills where they sit side by side, at ≥ 4.5:1 on `code-bg`. Exact syntax-token values are computed during the Phase 2 prototype.
- Long strings truncate with an expand control. Large arrays paginate (show the first N).
- Raw / Tree toggle. Always `dir="ltr"`.

## Empty / error / loading states

- **Loading**: skeletons shaped like the final content. The Playground's in-flight request shows a pulsing signal dot plus elapsed milliseconds. No centered spinners over content.
- **Empty**: explain what goes here and give the next action (for example, "Send a request to see the response").
- **Error**: what happened, why (when known), and what to do next. Include the status code and request ID. Never expose secrets or raw upstream internals.
- ~~**Not translated yet** (Hebrew): an info banner~~ — removed 2026-10-08 with Hebrew.

## Responsive rules

Breakpoints (min-width): `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 · `2xl` 1536.

Layout by width:
- Below `md`: single column, sidebar in a drawer. The endpoint request panel is inlined after the summary as a disclosure. The Playground is a step flow.
- `md` to `xl`: content plus request panel. Sidebar in a drawer, or a rail at `lg`.
- `xl` and up: three columns. The guide TOC rail appears only at `xl` and up.

Rules:
- Nothing is hidden at small widths; content only reflows.
- No horizontal page scroll at 320px.
- Touch targets ≥ 40px on touch devices.

## Motion rules

- Duration 150–200ms (up to 250ms for drawers and dialogs).
- Easing is ease-out-quart `cubic-bezier(0.25, 1, 0.5, 1)`. No bounce or elastic.
- Allowed only for state changes: disclosure open/close, drawer, palette, copy confirmation, tab indicator, mode switch, the in-flight signal dot.
- No page-load choreography, parallax or scroll-triggered reveals.
- Transform and opacity only. Height transitions via `grid-template-rows` when needed.
- `prefers-reduced-motion: reduce` falls back to instant changes or crossfades. The signal dot becomes static.

## Accessibility rules

- WCAG 2.2 AA minimum:
  - Text ≥ 4.5:1, large text and UI components ≥ 3:1. The pairs in this document were computed.
  - Colour is never the only signal: method, lifecycle and mode all carry text.
- Full keyboard operation: skip link, visible `:focus-visible` ring, roving focus in trees and tabs, palette shortcuts that don't hijack inputs.
- Semantic landmarks. Code tabs use the ARIA tabs pattern. Disclosures use `aria-expanded`. The Playground response uses a polite live region.
- `<html lang="en" dir="ltr">` (English only since 2026-10-08).
- Respect reduced motion and forced colors (`forced-colors: active`: badges keep their borders).

## RTL / bilingual rules

> **Superseded 2026-10-08:** Hebrew was removed; the portal is English-only and left-to-right. Kept as history. Logical properties remain in use as ordinary CSS.

- Locales: `en` (LTR) and `he` (RTL). The whole chrome mirrors through logical properties. No physical `left`/`right` in components.
- Never mirrored: code, JSON, URLs and paths, method pills, parameter names, E.164 numbers, telemetry.
- Directional icons mirror (chevrons, arrows). Object icons do not.
- Hebrew typography: no letter-spacing changes, and line-height on the high end of the scale.

## Resolved decisions (2026-09-24)

1. Brand values: `#3731ee` / `#781df0` / Assistant are official.
2. Radii: 4/6/10px (developer-tool restraint) retained.
3. Mode hues: amber for Live, teal for Demo.
4. Playground: dedicated route; endpoint pages link into it.

## Still open

- SVG logo: availability not yet confirmed. Only a raster PNG is known. Do not invent or trace a logo.
