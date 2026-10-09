# Project Plan

## Objective

Create a modern developer portal for the company's VoIP APIs, beginning with Proxy API and later expanding to Open API.

The portal must support both:
- developers who are already customers and can test against the Live API
- prospects/non-clients who can explore a fully isolated Demo environment

## Phase map

1. Design research
2. Design prototype
3. Proxy API audit
4. One real endpoint
5. Live Playground
6. Demo mode
7. Proxy API rollout
8. Open API rollout
9. Open API Live pilot (`openapi/simplecdrs-list`)
10. Live for every read (pass-through + redaction)
11. Verify against the real PBX, merge, deploy
12. Proxy API real-PBX check

Smaller approved changes between phases: English-only portal, side menus
(`v1.2-side-menus`), evidence badge, menu groups (`v1.4-menu-groups`).

Each phase has a separate file under `docs/phases/`.

## Cross-cutting requirements

### Developer experience
- clean information architecture
- fast navigation
- strong search
- readable endpoint references
- useful guides
- clear error documentation
- copyable examples
- professional JSON response viewer
- responsive design

### Design direction
Target:
- 80% clean professional developer portal
- 20% subtle futuristic character

Avoid:
- excessive glassmorphism
- neon overload
- giant gradients
- decorative blobs
- unnecessary animation
- oversized rounded cards
- generic AI-site appearance

### Reference portals to research
Primary:
- Twilio
- Vonage
- Stripe
- GitHub
- Cloudflare
- Shopify

Give extra weight to Twilio and Vonage because their communication/telecom workflows are closer to this project.

### API architecture principle

Do not build Proxy-specific UI components when a reusable API-neutral component can be used.

Prefer:
- `ApiEndpointPage`
- `ApiNavigation`
- `ParameterTable`
- `RequestExample`
- `ResponseViewer`
- `AuthenticationBlock`
- `ErrorBlock`
- `DeprecationBanner`

Avoid:
- `ProxyApiEndpointPage`
- `ProxyApiParameterTable`

### Reference + Guides

The portal must support both:

Reference:
- exact technical specification

Guides:
- task-oriented integration help

Examples of future guides:
- Getting started
- Authentication
- First Proxy API request
- Handling JSON responses
- Handling errors
- CRM integration
- Click-to-call
- Working with extensions
- Working with calls
- Common integration patterns

### Versioning and lifecycle

The internal model must support:
- current
- deprecated
- legacy
- experimental

Design for multiple API versions even if only one exists initially.

### Search

Search should eventually index:
- endpoint names
- paths
- parameters
- errors
- guides
- concepts
- code examples

Track zero-result searches as a documentation-quality signal.

### Feedback

Documentation pages should eventually support:
- Was this page helpful? Yes / No
- Report documentation issue

### Observability

Track sanitized metrics such as:
- Playground request count
- Playground success/error rate
- latency
- timeout rate
- most-used endpoints
- documentation searches
- zero-result searches
- frontend errors
- backend errors
- documentation feedback

Never include credentials or sensitive payloads in telemetry.

### Request history

Optional later feature:
- method
- endpoint
- status
- latency

Never store:
- API keys
- authorization headers
- secrets
- sensitive payload fields

Persistence beyond the active session requires an explicit decision.

## Final architecture goal

Developer Portal
- Guides (human-written MDX)
- API Reference (normalized API model)
  - Proxy API
  - Open API
- Playground
  - Live provider
  - Demo provider
- Secure backend proxy
- Approved API infrastructure

## Completion philosophy

Prove one real endpoint first.
Do not scale before the prototype is validated and explicitly approved.
