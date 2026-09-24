# Phase 5 — Live Playground

## Goal

Build a production-quality Live Playground for the single approved prototype endpoint.

## Request side

Support:
- tenant
- API key
- endpoint context
- endpoint parameters
- send request

The UI should be generated from the normalized endpoint definition where practical.

## Response side

Display:
- HTTP status
- latency
- response size
- Body
- Headers
- sanitized Request
- Code example area

JSON viewer should support:
- syntax highlighting
- pretty formatting
- collapsible objects/arrays
- expand/collapse
- search
- copy response
- copy values where practical
- download JSON

## Security

Browser -> portal backend -> approved API infrastructure

Never:
- expose credentials
- accept arbitrary target URLs
- log API keys
- silently fall back to Demo mode

## Preferred tools

- React best practices
- Microsoft Playwright
- Anthropic security review

## Model

Sonnet 5 for implementation.
Opus 5.5 for security-sensitive architecture and final security review.

## Gate

STOP after one real endpoint works end-to-end and passes required checks.
