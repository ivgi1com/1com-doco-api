# Design Research — Developer Portal

Status: **Approved (2026-09-24).** Resolved decisions recorded in `design-system/MASTER.md`.
Research date: 2026-09-24. Reference sites drift; re-verify before quoting specifics.

## Method

- Portals studied: Twilio, Vonage (extra weight), Stripe, GitHub, Cloudflare, Shopify. Plus 1com.co.il (brand cues) and Microsoft Learn he-il (RTL reference).
- Evidence: WebFetch/WebSearch text extraction, Playwright screenshots (desktop 1440x900, mobile 390x844, forced dark), `getComputedStyle` font checks, CSS extraction for 1com.
- Read-only: no logins, no form submission. Login-gated playgrounds (Twilio Console, Vonage Dashboard, Stripe Workbench) are described from their public docs only and marked UNVERIFIED.
- Screenshots live in the session scratchpad and are not committed. They can be regenerated.
- Confidence tags: **VERIFIED** (observed directly), **DOCUMENTED** (vendor text says so), **UNVERIFIED** (not observed).
- Substitute for UI/UX Pro Max (not installed): `impeccable` product-register rules.

## 1. Findings by dimension

### Information architecture
- Every vendor separates **Guides** (task-oriented) from **Reference** (spec). Twilio: per-product tree with Quickstart, then Guides, then Developer Reference. Stripe: separate API-reference sub-site with its own sidebar. VERIFIED.
- Reference sidebars start with cross-cutting concepts before resources. Stripe: Authentication, Errors, Pagination, Request IDs, Versioning, then resources. GitHub does the same (Rate limits, Pagination, Authentication). VERIFIED. https://docs.stripe.com/api, https://docs.github.com/en/rest
- Large catalogues are filtered by facet first. Cloudflare scopes the reference by protocol dropdown. Shopify splits the top nav by audience (Apps / Storefronts / Agents / References). VERIFIED.
- LLM-consumable pages are now standard: "Copy for LLM" / "View as Markdown" (Stripe), "Copy as markdown" (Twilio), "Copy Markdown" (Cloudflare), "Copy MD" (Shopify). VERIFIED.

### Global navigation
- The top bar is thin and consistent across docs, reference and changelog (Shopify is strongest). It holds logo, 3–5 sections, search, theme toggle and sign-in. VERIFIED.
- GitHub draws a 1px brand-color line under the header in both themes. It is a subtle identity device. VERIFIED (github-home, dark and light).

### Sidebar
- Collapsible tree, sticky, independently scrollable, active item shown with a filled background (Stripe, Twilio, Cloudflare). VERIFIED.
- The version picker sits **inside the sidebar**, scoped to the API, on GitHub ("API Version: 2026-03-10 (latest)") and Shopify ("2026-07 latest"). Stripe puts it in the top bar. VERIFIED.
- Shopify adds a tree-scoped **Filter** box, separate from global search. VERIFIED.
- Mobile: the sidebar goes to a hamburger or drawer everywhere. Stripe collapses it to a "current section" dropdown. VERIFIED.

### Endpoint-page layout
- Stripe uses three columns: nav, prose + parameters, sticky code + response. VERIFIED (stripe-api-charges).
- Cloudflare uses two columns: prose, plus a sticky request card with cURL and a "200 example" response. VERIFIED.
- GitHub uses two columns with code cards inline per operation. VERIFIED.
- Vonage's OpenAPI-generated page leaves about 2/3 of the desktop viewport empty. VERIFIED. https://developer.vonage.com/en/api/voice
- Mobile:
  - Stripe drops the code pane from the fold.
  - GitHub and Cloudflare stack code below the prose. Nothing is lost.
  - Vonage's reference rendered **blank at 390px** in two captures (cause UNVERIFIED).

### Search
- `/` or `Ctrl/⌘K` shortcut shown in the search field on Stripe, GitHub, Twilio and Cloudflare. VERIFIED.
- GitHub merges search and AI in one field ("Search or ask Copilot"). Stripe splits them into two controls. Vonage makes AI the primary entry point, plus a floating launcher. VERIFIED.
- Result types and AI behaviour are UNVERIFIED: cookie modals blocked interaction on Twilio and Vonage.

### Code blocks
- GitHub (cURL / JavaScript / GitHub CLI) and Shopify use language **tabs**. Stripe uses a **dropdown**. Twilio has 9 tabs. VERIFIED/DOCUMENTED.
- Copy button in the header on every vendor. Cloudflare shows line numbers. VERIFIED.
- Whether the language choice persists across pages is UNVERIFIED on all vendors.
- Mono fonts: Source Code Pro (Stripe, 11.9px, which is small), Mona Sans Mono (GitHub), Geist Mono (Cloudflare), JetBrains Mono (Shopify), MonaspaceNeon (Vonage), TwilioSansMono. VERIFIED (computed).

### Authentication
- **Per-endpoint auth blocks** are the strongest pattern:
  - Cloudflare's "Security" section lists accepted schemes and required permission pills.
  - GitHub lists the fine-grained token types each endpoint accepts.
  - Shopify puts a scope lock icon on each field.
  - All VERIFIED.
- Samples use placeholders and environment variables (`$TWILIO_AUTH_TOKEN`, `<YOUR-TOKEN>`), never real-looking secrets. Stripe instead shows a realistic-shaped `sk_test_…`. VERIFIED.

### Request/response
- Realistic, fully populated example JSON next to the request (Stripe, Cloudflare). VERIFIED.
- Nested fields are collapsed by default, with deep-linkable expansion: Stripe's `?query=<field>` and Shopify's "+ Show fields". DOCUMENTED/VERIFIED.
- Status-code tables per operation: GitHub (201 / 204 / 404 / 422). Stripe centralizes errors on one page. DOCUMENTED.
- Cloudflare marks deprecated fields inline inside the schema. DOCUMENTED.

### Method badges
- Vonage: filled pills per verb (GET blue, POST green, PUT purple). VERIFIED.
- GitHub: filled blue pill. Cloudflare: small green pill. Stripe: coloured text only. Twilio: uniform grey pill, which is the weakest. VERIFIED.

### Parameter tables
- Nobody uses a literal wide `<table>`. Everyone uses a definition list: name, type pill, Required marker, description, enum values, default. VERIFIED.
- Only Stripe marks Required (red); optional is implied. Cloudflare prints "optional". GitHub prints "Default: 30" and "Can be one of…". VERIFIED/DOCUMENTED.
- Cloudflare has an **Expand all** toggle. VERIFIED.
- Vonage's webhook reference has **no** required/optional convention at all. DOCUMENTED. This inconsistency is exactly what to avoid.

### Webhooks/events
- Telecom vendors enumerate call-lifecycle states. DOCUMENTED.
  - Twilio StatusCallback: initiated / ringing / answered / completed.
  - Vonage: started / ringing / answered / busy / cancelled / unanswered / disconnected / rejected / failed / human / machine / timeout / completed.
- Presentation is prose plus field lists. **No sequence or state diagrams, and no E.164 guidance**, on any page captured. This is a gap 1com can fill.
- Vonage's conditional-field note ("appears only when `return_cps_on_started: true`") is a clean pattern. DOCUMENTED.
- Stripe lists relevant event names on each resource page. DOCUMENTED.

### Versioning and lifecycle
- Shopify has four explicit states: stable, release candidate, unstable, deprecated/unsupported. DOCUMENTED. https://shopify.dev/docs/api/usage/versioning
  - Guarantees at least 12 months of support.
  - Unsupported versions "fall forward".
  - The changelog shows "Latest" and "Release candidate" stat cards.
- Shopify shows a **whole-surface legacy banner** on REST Admin. Cloudflare marks **inline field-level** "Deprecated". VERIFIED.
- GitHub:
  - `X-GitHub-Api-Version` header, with a sidebar picker.
  - `Deprecation` and `Sunset` response headers, then `410 Gone`.
  - DOCUMENTED.
- Twilio versions in the URL only (`/2010-04-01/`) and has no picker. Vonage shows a "multiple versions available (v1 / v2)" callout. VERIFIED.

### Changelog
- Best: Shopify's three filter axes (post type, surface, version) with a "Breaking changes" pill. VERIFIED.
- GitHub has type badges (Release / Improvement / Retired), filter chips and RSS. VERIFIED.
- Vonage has a timeline with search and Technology / Type / Category filters, and a Subscribe button. VERIFIED.
- Stripe has a Breaking / Non-breaking column but no filters. Cloudflare has a flat feed with product tags and prominent RSS. VERIFIED.

### Responsive
- The standard is a structural collapse: sidebar to drawer, code stacks below the prose, and no content is lost (GitHub, Cloudflare, Twilio). VERIFIED.
- Anti-examples:
  - Vonage's blank mobile reference page.
  - Shopify dropping its "Map" panel on mobile with no substitute.

### Dark/light
- GitHub follows `prefers-color-scheme` automatically and keeps its brand accent line. VERIFIED.
- Cloudflare and Shopify have a manual toggle. VERIFIED.
- Stripe ignores the OS setting and is toggle-only. VERIFIED.
- Twilio and Vonage have **no dark mode**. VERIFIED.

### Typography
- Body text is 14px on Stripe, GitHub, Twilio and Vonage. VERIFIED.
- Line-height: Twilio 24/14 (1.71, spacious), Vonage 20/14 (1.43, dense). VERIFIED.
- Headings are one sans family (Cloudflare Geist, Stripe/GitHub system). Shopify uses JetBrains Mono for headings, which hurts scanning. VERIFIED.

### Spacing/density
- Reference pages are dense, with hairline separators and 5+ parameters visible (Stripe).
- Guides are airy (Twilio, GitHub).
- The two registers coexist on every site.

### Motion
- UNVERIFIED on every vendor: static capture only. Nothing decorative observed on reference pages.

### Playground / API testing
- **No vendor has a live in-page "Try it" runner on its current reference pages.** VERIFIED.
  - GitHub removed its GraphQL Explorer on 2025-11-11.
  - Cloudflare offers copy-paste plus "open in Claude/ChatGPT/Cursor".
- Playgrounds live behind login (DOCUMENTED, UNVERIFIED visually):
  - Twilio "Try out Voice": verified numbers only.
  - Vonage Voice Playground and Voice Inspector: fixed test caller ID.
  - Stripe Workbench.
- Shopify GraphiQL documents a **read-only public demo** alongside an authenticated mode. DOCUMENTED. This is the closest analogue to Live/Demo.
- Stripe signals test vs live only through the key prefix (`sk_test_` / `sk_live_`) and its syntax colour. VERIFIED. That is too weak for our "never confuse Live and Demo" rule.

### 1com brand (colours + font confirmed official 2026-09-24)
Source: https://www.1com.co.il/ HTML + bundled CSS.
- Primary `#3731ee` (oklch 0.478 0.265 271.6): button fill, active menu item.
- Accent `#781df0` (oklch 0.517 0.271 293.1): button hover, bordered buttons, emphasized heading spans. Buttons shift blue to violet on hover.
- Ink `#282828` (neutral, with no hue) for text and dark bands.
- Font: **Assistant** (Google Fonts, native Hebrew + Latin, variable 200–800).
- Radii: pill buttons, cards at 0.5–1.5rem.
- Logo: raster PNG only (`/wp-content/uploads/2025/10/logo.png`, 236x134). White "1com" wordmark on the hero. No SVG found.
- Site is Hebrew RTL only. No English version. No public developer or API docs anywhere on it.
- Contrast: both brand colours pass on white (7.41:1 and 6.49:1). Both **fail on dark** surfaces (2.0–3.0:1), so dark mode needs lightened tints.
- `#0048fe` belongs to a third-party accessibility widget. It is not a brand colour.

### RTL / Hebrew
- The strongest real reference is Microsoft Learn he-il. VERIFIED.
  - The chrome is mirrored: nav, breadcrumb and TOC rail.
  - URLs, code, HTTP methods and product names stay LTR inside Hebrew chrome.
  - An honest banner says when content isn't translated: "תוכן זה אינו זמין בשפה שלך…"
- Mirror: sidebar side, breadcrumb and chevrons, TOC rail, directional icons, table column order. https://m2.material.io/design/usability/bidirectionality.html
- Never mirror: code blocks, JSON, URLs and paths, method badges, parameter names, E.164 numbers.
- Wrap inline LTR tokens in Hebrew prose with `<bdi>` or `dir="ltr"`, not with `unicode-bidi` alone. https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/bdi
- Tailwind logical utilities (`ms/me/ps/pe/start/end/rounded-s/e`) are available since v3.3. https://tailwindcss.com/blog/tailwindcss-v3-3
- Fonts, verified from the Google Fonts CSS subsets:
  - Hebrew-capable: Assistant, Heebo, Rubik, Noto Sans Hebrew (all variable), IBM Plex Sans Hebrew (static only).
  - **No Hebrew subset**: Inter, Geist, Geist Mono, JetBrains Mono, Open Sans.
- No monday.com, Wix or 1com Hebrew developer docs exist to learn from.

## 2. Ten patterns to adopt

1. **Guides / Reference split with concept-first reference nav.** Authentication, Errors, Rate limits and Versioning come before resources (Stripe, GitHub).
2. **Sticky request/response panel on endpoint pages.** Method + path, language tabs, copy, realistic example response. Stacks below the prose on mobile, never hidden (Cloudflare, Stripe, GitHub mobile).
3. **Per-endpoint Security block.** Accepted auth scheme and required permissions, on the endpoint page itself (Cloudflare, GitHub).
4. **Colour-coded, filled method pills in monospace, with text always present.** Colour is never the only signal (Vonage, GitHub).
5. **Definition-list parameter rows.** Name, type pill, explicit Required/Optional, default, enum values, conditional-field note. Nested objects collapsed with deep links, plus Expand all (Stripe, Cloudflare, Vonage conditional fields).
6. **Four-state lifecycle.** current / deprecated / legacy / experimental, communicated at two granularities: a whole-surface banner plus inline badges. Sunset dates shown (Shopify, Cloudflare, GitHub).
7. **Version picker inside the API-scoped sidebar**, with "latest" labelled (GitHub, Shopify).
8. **Command-palette search** (`⌘K` / `Ctrl K` and `/`) with the shortcut visible. One field that can later host AI answers, not two controls (GitHub).
9. **Filterable changelog.** Filter by API, version and type, with a Breaking pill and RSS (Shopify, GitHub).
10. **Telecom-native content devices.** A canonical call-state diagram reused across reference, webhooks and Playground; E.164 guidance; inline rate/CPS callouts; conditional payload fields. Twilio and Vonage cover parts of this, and none has diagrams or E.164 guidance: a real gap to fill.

Supporting patterns (lower priority):
- OS-following dark mode with a manual override (GitHub).
- "Copy as Markdown" on every page (all vendors).
- Honest "not translated yet" banner for Hebrew (MS Learn).

## 3. Five patterns to avoid

1. **Weak Live/Test signalling** (Stripe docs: key prefix plus syntax colour only). Our mode must be unmistakable and persistent.
2. **Hiding or dropping content on mobile.** Stripe hides the code pane, Shopify drops its Map panel, Vonage's reference page is blank. Everything must reflow, not disappear.
3. **Neglected auto-generated reference templates.** Vonage leaves 2/3 of the page empty. Generated pages must use the same designed components as hand-written ones.
4. **Inconsistent field conventions within one site.** Vonage has no required/optional marking on webhooks, and Stripe's optional is implicit. We use one enforced schema.
5. **Uniform grey method badges and a mono font for headings.** Twilio's badges and Shopify's JetBrains Mono H1s reduce scannability.

Also avoided: stacked cookie modals (Twilio, Vonage), split Search vs Ask AI controls (Stripe), and fonts without fallbacks (Vonage Spezia).

## 4. Proposed navigation

Top bar, identical on every page:
- Logo, then `Guides · API Reference · Changelog`, then the search field (`⌘K`), then locale switch `EN | עב`, theme toggle and Sign in / Console (the destination is pending, see open questions).
- A 1px brand hairline under the header.

Sidebar, scoped to the section:
- **Guides**: Getting started, Authentication, First Proxy API request, Handling responses, Handling errors, then use-case guides (CRM, click-to-call, extensions, calls).
- **API Reference**, in this order:
  - API switcher: Proxy API, later Open API.
  - Version picker, with a "latest" label.
  - Tree filter, once the catalogue exceeds about 30 endpoints.
  - Concepts: Overview, Authentication, Errors, Rate limits, Versioning & lifecycle.
  - Resource groups, each endpoint row showing a method pill and name, with lifecycle badges inline.
- Desktop: sticky and independently scrolling, collapsible to a rail.
- Tablet: overlay drawer. Mobile: drawer, plus a "current section" breadcrumb.
- In RTL the sidebar moves to the inline-start side (the right) automatically.

On-page TOC rail (inline-end), only on guides wider than 1280px. Reference pages use that width for the request panel instead.

## 5. Proposed endpoint layout

Desktop (1280px and up) uses three columns. Proportions are fixed rem tracks, not fluid type: nav 16rem, content 1fr (max about 44rem prose), and a sticky request panel of 26–30rem.

```
┌ header ───────────────────────────────────────────────────────────────┐
├ nav ┬ content ──────────────────────────────┬ request panel (sticky) ─┤
│     │ breadcrumb · lifecycle banner (if any)│ [POST] /path  copy      │
│     │ H1 Endpoint name  [Deprecated]        │ tabs: cURL | JS | Py…   │
│     │ POST /v1/path   (mono, LTR)           │ ─ request code ─        │
│     │ summary (≤2 lines)                    │ [Try in Playground →]   │
│     │ Security: scheme · permissions        │ Response  200 ▾         │
│     │ Path / Query / Body params (dl rows)  │ ─ example JSON ─        │
│     │ Responses: status list + schema tree  │                         │
│     │ Errors: codes specific to endpoint    │                         │
│     │ Webhooks/events triggered (if any)    │                         │
│     │ Changelog for this endpoint           │                         │
│     │ Was this helpful? · Report issue      │                         │
└─────┴───────────────────────────────────────┴─────────────────────────┘
```

- Tablet (768–1279px): nav becomes a drawer; content and request panel sit side by side at 1fr / 22rem.
- Mobile: a single column. The request panel moves directly after the summary, collapsed to a "Request example" disclosure. It is never removed.
- RTL: columns mirror and the prose is RTL. The request panel's contents, the method/path line and parameter names stay `dir="ltr"`.

## 6. Proposed Playground layout

- A **dedicated Playground route**, deep-linked from each endpoint's "Try in Playground" button, with the same endpoint preselected.
- Not an in-page runner in the first iteration. That keeps credential entry off documentation pages and gives the backend proxy one entry point.
- The embedding decision is reversible later.

```
┌ header ───────────────────────────────────────────────────────────────┐
├ MODE BAR (full width, persistent): ● DEMO  synthetic data · no real   │
│   requests  [Switch to Live]     |  ● LIVE  requests hit your tenant  │
├ endpoint list ┬ request builder ──────────────┬ response viewer ───────┤
│ (search,      │ [POST] /v1/path  (read-only)  │ status 200 · 142 ms ·  │
│  method pills)│ Auth: credential field (Live  │ 1.2 KB · source: DEMO  │
│               │   only, masked, session-only) │ tabs: Body | Headers   │
│               │ Params form from schema       │ JSON tree viewer       │
│               │ (required first, validation)  │ (collapse, copy path,  │
│               │ Code preview: cURL | JS | Py  │  copy value, search)   │
│               │ [Send request]                │ error/timeout states   │
└───────────────┴───────────────────────────────┴────────────────────────┘
```

Mode rules. These are a visual proposal; behaviour is defined in Phases 5 and 6.
- The mode bar is always visible. It pairs colour, icon, text label and a surface tint, and never relies on colour alone.
- Live uses amber/orange. Demo uses teal. Both are distinct from the brand blue and from the method-pill hues.
- Switching mode is an explicit action with a confirmation that the credential/request context changes.
- Every response carries a `source: LIVE | DEMO` stamp in the viewer header.
- A Live failure renders as a Live error state. It never falls back to Demo.
- Mobile uses a step flow (Endpoint, then Request, then Response) with the mode bar pinned to the top.

## 7. Design-system direction

A physical scene to anchor the design: an integration developer at a CRM or ISV partner, at a desk in daylight, alternating between the portal, an IDE (often dark) and a terminal, copy-pasting requests and reading JSON under time pressure. Neither theme can be the only one, so both are first-class and the default follows the OS.

- **80% clean professional.** Restrained colour strategy: tinted neutrals toward the brand hue (275), with the brand indigo used only for primary actions, links, selection and focus. Density comes in two registers: dense reference, airy guides. One UI family (Assistant), one mono family. Fixed rem type scale. Hairline borders. Minimal shadows.
- **20% subtle futuristic**, from telecom signal language rather than glow:
  - A 1px header hairline (brand indigo to violet, the only gradient in the system).
  - Mono "telemetry" metadata in the Playground (status, latency, size, request ID).
  - A pulsing signal dot for an in-flight request.
  - A fine dotted grid on the docs landing hero only.
  - Precise 150–200ms state transitions.
- Explicitly excluded: glassmorphism, neon, blobs, gradient text, large radii, side-stripe callouts, hero metrics, identical card grids.

Full token proposal: `design-system/MASTER.md`.

## 8. Open items (non-blocking for visual approval; deferred)

- RESOLVED: brand colours and Assistant confirmed official. Still open: SVG logo availability.
- Hebrew scope: chrome only, guides, or guides + reference descriptions? Whether reference prose is translated drives the content model (Phase 3/4). This is not needed to approve the visual direction.
- The Sign-in / Console link destination (is there a customer console?) is unknown.
- Whether screenshots should be committed as evidence (currently not, to avoid storing third-party imagery in the repo).
