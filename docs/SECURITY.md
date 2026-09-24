# Security Requirements

## Playground principles

Live and Demo modes must be strongly separated.

## Live Playground

Architecture:

Browser -> Developer Portal backend -> approved API infrastructure

The browser must not call production API infrastructure directly when that would expose credentials or weaken controls.

## Backend proxy requirements

The proxy must not accept arbitrary target URLs.

Define and enforce:
- allowed hosts
- allowed endpoints
- allowed methods
- request timeout
- response-size ceiling
- rate limit
- authentication/access policy
- sanitized error handling

## Credential policy

API keys and authorization values must never appear in:
- URLs
- analytics
- application logs
- error tracking
- telemetry
- request history

Credentials should remain session-scoped by default unless persistent storage is explicitly approved.

Any persistent credential storage requires a separate security decision.

## Demo mode guarantees

Demo mode:
- never contacts production APIs
- never requests a real API key
- never exposes real tenants
- never contains copied production records
- uses clearly synthetic data
- never silently replaces a Live failure with Demo output

## SSRF defense

The Live proxy must enforce destination allowlists and must not expose a general-purpose fetch endpoint.

Forbidden pattern:
`targetUrl=<arbitrary URL>`

## Logging

Sanitize:
- credentials
- auth headers
- cookies
- secrets
- sensitive payload fields

## Security review gate

Security review is mandatory before approving:
- credential handling
- Live proxying
- authentication
- session storage
- Demo/Live isolation
- production deployment

Use Opus 5.5 for the major security review.
