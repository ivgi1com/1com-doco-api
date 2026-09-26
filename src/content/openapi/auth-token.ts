import type { Category } from "../types";
import { errors, f, openapiAuth, openapiOperation } from "./shared";

/**
 * Auth Token. Source: source-docs/openapi/auth-token.md (official page
 * `auth-token`, rev #9). Mints or resets a real login token for a web user
 * or extension web identity — credential issuance, not data exposure.
 * Categorically excluded from Live and Demo (SEC-REQ-05), not merely
 * allowlist-gated. No GET is documented.
 */

const authTokenAuth = openapiAuth("Global full API key", {
  extra: "Tenant keys and read-only keys are both rejected.",
});

const authTokenNotes = [
  "This is a credential-issuance endpoint: a generated token substitutes for a user's login password. MiRTA PBX stores only a SHA-256 hash of the token; the plaintext value is returned once, in the API response.",
  "The user value is resolved in this order: web user (`us_users.us_username`), extension web user (`ex_extensions.ex_webuser`), then — only when `ex_webuser` is empty — SIP extension username (`sipfriends.name`) or PJSIP endpoint ID (`ps_endpoints.id`). This matches the legacy Proxy API token feature.",
  "Scope limit: this endpoint manages login tokens only. It does not create or rotate OpenAPI API keys.",
  "Security (SEC-REQ-05): never reachable from Demo or Live, categorically. This is a write-and-credential-mint action, not a standard field-allowlist case.",
];

const authTokenCreate = openapiOperation({
  file: "auth-token.md",
  page: "auth-token",
  id: "auth-token-create",
  category: "auth-token",
  method: "POST",
  path: "/auth/token",
  title: "Generate login token",
  summary: "Creates a new login token for a resolved user identity, usable in place of the password on the MiRTA PBX login page.",
  authentication: authTokenAuth,
  queryParameters: [],
  requestBody: [
    f("user", "Value resolved through the identity table above.", { required: true }),
    f("validity", "`ONCE` for a single-use token, or a date/time string for a token valid until that time.", { required: true, example: "ONCE" }),
  ],
  requestExample: { user: "100", validity: "ONCE" },
  responses: [
    {
      status: 200,
      description:
        "The token was generated. Only the token value shown here is returned; it cannot be retrieved again afterward. A single-use token is cleared after a successful login. Generating a new token replaces any previous token for that identity. The HTTP status code itself is not documented.",
      format: "json",
      evidence: "vendor",
      schema: [
        { name: "token", location: "body", type: "string", required: true, description: "Generated token value. A credential: never log or echo it." },
        { name: "user", location: "body", type: "string", required: true, description: "The user value as resolved." },
        { name: "target_type", location: "body", type: "string", required: true, description: "The identity kind matched. `WEBPASSWORD` is the only documented value; others are undocumented." },
      ],
      example: { token: "generated-token-value", user: "100", target_type: "WEBPASSWORD" },
      source: "source-docs/raw/mirta-openapi/auth-token.md:31-37",
      verified: false,
    },
  ],
  errors: errors("admin_required", "missing_user", "user_not_found", "invalid_validity"),
  notes: authTokenNotes,
  related: ["auth-token-delete"],
});

const authTokenDelete = openapiOperation({
  file: "auth-token.md",
  page: "auth-token",
  id: "auth-token-delete",
  category: "auth-token",
  method: "DELETE",
  path: "/auth/token",
  title: "Reset login token",
  summary: "Clears the stored token hash and validity for the resolved user identity.",
  authentication: authTokenAuth,
  queryParameters: [],
  requestBody: [f("user", "Value resolved through the identity table above.", { required: true })],
  requestExample: { user: "100" },
  responses: [
    {
      status: 200,
      description: "The token was reset. The HTTP status code itself is not documented.",
      format: "json",
      evidence: "vendor",
      schema: [
        { name: "reset", location: "body", type: "boolean", required: true, description: "`true` on success." },
        { name: "user", location: "body", type: "string", required: true, description: "The user value as resolved." },
        { name: "target_type", location: "body", type: "string", required: true, description: "The identity kind matched. `WEBPASSWORD` is the only documented value; others are undocumented." },
      ],
      example: { reset: true, user: "100", target_type: "WEBPASSWORD" },
      source: "source-docs/raw/mirta-openapi/auth-token.md:61-68",
      verified: false,
    },
  ],
  errors: errors("admin_required", "missing_user", "user_not_found"),
  notes: authTokenNotes,
  related: ["auth-token-create"],
});

export const authTokenCategory: Category = { id: "auth-token", title: "Auth Token", endpoints: [authTokenCreate, authTokenDelete] };
