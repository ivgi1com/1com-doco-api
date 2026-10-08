"use client";

import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId } from "react";
import type { RenderedSample } from "@/components/code/code-tabs";
import { CodeTabs } from "@/components/code/code-tabs";
import { MethodBadge } from "@/components/ui/method-badge";
import type { DemoFixtureSet } from "@/content/demo";
import type { ApiDefinition, Endpoint } from "@/content/types";
import { authEnvVar } from "@/lib/code-samples";
import type { LiveTargetHints } from "@/lib/playground-protocol";
import { sanitizedRequest, substitutePathParams } from "./executor";
import { OperationHeader } from "./operation-header";
import { ParamField } from "./param-field";
import { RequestTab } from "./response-viewer";
import { fieldKey, type PlaygroundState } from "./use-playground";

function resolveLivePath(endpoint: Endpoint, values: Record<string, string>) {
  const path = substitutePathParams(endpoint, values);
  if (!endpoint.fixedQuery) return path;
  const fixed = Object.entries(endpoint.fixedQuery)
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  return `${path}?${fixed}`;
}

export function RequestBuilder({
  api,
  endpoint,
  samples,
  state,
  synthetic,
  liveAvailable,
  liveHints,
  demoFixtures,
}: {
  api: ApiDefinition;
  endpoint: Endpoint;
  samples: RenderedSample[];
  state: PlaygroundState;
  synthetic: boolean;
  /** False when this endpoint isn't allowlisted for Live, or Live is disabled server-side. */
  liveAvailable: boolean;
  /** Live target policy for this endpoint, when it is Live-capable (hidden params, forced query). */
  liveHints?: LiveTargetHints;
  /** Present when this endpoint has Demo scenario presets (src/content/demo). */
  demoFixtures?: DemoFixtureSet;
}) {
  const t = useTranslations("playground");
  const te = useTranslations("endpoint");
  const keyId = useId();
  const {
    mode,
    fieldValues,
    errors,
    apiKey,
    keyRevealed,
    simulateError,
    sending,
    setField,
    setApiKey,
    setKeyRevealed,
    setSimulateError,
    send,
    writeDemoSupported,
  } = state;

  const hasErrors = Object.keys(errors).length > 0;
  const envVar = authEnvVar(endpoint);
  const isWrite = endpoint.operationClass === "write";
  // SEC-REQ-27: a write is never sent in Live; in Demo it runs only from a
  // documented-example fixture set (writeDemoSupported).
  const writeOnly = isWrite && (mode === "live" || !writeDemoSupported);
  const liveBlocked = mode === "live" && !liveAvailable && !isWrite;
  // In Live, parameters the portal does not accept are hidden, not just ignored.
  const liveShape = mode === "live" ? liveHints : undefined;
  const queryParameters = endpoint.queryParameters.filter((p) => !liveShape?.hiddenParams.includes(p.name));

  const applyScenario = (preset: Readonly<Record<string, string>>) => {
    for (const [name, value] of Object.entries(preset)) setField(fieldKey("query", name), value);
  };

  return (
    <div className="space-y-5 p-4">
      <OperationHeader endpoint={endpoint} />

      <div dir="ltr" className="flex items-center gap-2 rounded-md border border-border bg-surface-2 px-3 py-2">
        <MethodBadge method={endpoint.method} />
        <code className="min-w-0 flex-1 truncate font-mono text-sm text-ink">{resolveLivePath(endpoint, fieldValues)}</code>
      </div>

      {isWrite && (
        <p
          data-testid="write-only-note"
          className="rounded-md border border-warning-ink/30 bg-warning-tint px-3 py-2 text-xs text-warning-ink"
        >
          {writeDemoSupported ? t("writeDemoNote") : t("writeOnlyNote")}
        </p>
      )}

      {/* No key field when this operation cannot be sent in Live: a key typed here would go nowhere. */}
      {mode === "live" && liveAvailable && (
        <div>
          <label htmlFor={keyId} className="mb-1 block text-xs font-semibold text-ink">
            {t("apiKey")}
          </label>
          <div className="flex items-center gap-2">
            <input
              id={keyId}
              type={keyRevealed ? "text" : "password"}
              dir="ltr"
              autoComplete="off"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`$${envVar}`}
              aria-invalid={!!errors.apiKey}
              aria-describedby={errors.apiKey ? `${keyId}-error` : undefined}
              className="h-8 w-full rounded-md border border-border-control bg-bg px-2.5 text-sm text-ink placeholder:text-ink-muted"
            />
            <button
              type="button"
              onClick={() => setKeyRevealed(!keyRevealed)}
              aria-label={keyRevealed ? t("hide") : t("reveal")}
              className="grid size-8 shrink-0 place-items-center rounded-md border border-border-control text-ink-muted hover:text-ink"
            >
              {keyRevealed ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
            </button>
          </div>
          {errors.apiKey && (
            <p id={`${keyId}-error`} className="mt-1 text-xs text-danger-ink">
              {t("requiredField", { name: t("apiKey") })}
            </p>
          )}
          <p className="mt-1 text-xs text-ink-muted">{t("apiKeyHelp")}</p>
        </div>
      )}

      {endpoint.pathParameters.length > 0 && (
        <fieldset className="space-y-3">
          <legend className="mb-1 text-xs font-semibold text-ink-muted">{te("pathParams")}</legend>
          {endpoint.pathParameters.map((p) => {
            const key = fieldKey("path", p.name);
            return (
              <ParamField
                key={key}
                param={p}
                value={fieldValues[key] ?? ""}
                onChange={(v) => setField(key, v)}
                error={errors[key] ? t("requiredField", { name: errors[key] }) : undefined}
              />
            );
          })}
        </fieldset>
      )}

      {queryParameters.length > 0 && (
        <fieldset className="space-y-3">
          <legend className="mb-1 text-xs font-semibold text-ink-muted">{te("queryParams")}</legend>
          {queryParameters.map((p) => {
            const key = fieldKey("query", p.name);
            return (
              <ParamField
                key={key}
                param={p}
                value={fieldValues[key] ?? ""}
                onChange={(v) => setField(key, v)}
                error={errors[key] ? t("requiredField", { name: errors[key] }) : undefined}
              />
            );
          })}
        </fieldset>
      )}

      {endpoint.requestBody && endpoint.requestBody.length > 0 && (
        <fieldset className="space-y-3">
          <legend className="mb-1 text-xs font-semibold text-ink-muted">{te("body")}</legend>
          {endpoint.requestBody.map((p) => {
            const key = fieldKey("body", p.name);
            return (
              <ParamField
                key={key}
                param={p}
                value={fieldValues[key] ?? ""}
                onChange={(v) => setField(key, v)}
                error={errors[key] ? t("requiredField", { name: errors[key] }) : undefined}
              />
            );
          })}
        </fieldset>
      )}

      <details data-testid="request-preview" className="group rounded-md border border-border">
        <summary className="flex h-9 cursor-pointer list-none items-center px-3 text-xs font-semibold text-ink-muted [&::-webkit-details-marker]:hidden">
          {t("requestPreview")}
        </summary>
        <div className="space-y-2 border-t border-border p-3">
          <p className="text-xs text-ink-muted">{t("requestPreviewNote")}</p>
          <RequestTab
            request={sanitizedRequest(api, endpoint, fieldValues, liveShape)}
            endpoint={endpoint}
            notSent={mode === "demo" || isWrite}
          />
        </div>
      </details>

      <details className="group rounded-md border border-border">
        <summary className="flex h-9 cursor-pointer list-none items-center px-3 text-xs font-semibold text-ink-muted [&::-webkit-details-marker]:hidden">
          {t("codePreview")}
        </summary>
        <div className="border-t border-border p-2">
          <CodeTabs samples={samples} />
        </div>
      </details>

      {mode === "demo" && demoFixtures && (
        <fieldset className="space-y-2">
          <legend className="mb-1 text-xs font-semibold text-ink-muted">{t("scenarios")}</legend>
          <div className="flex flex-wrap gap-1.5">
            {demoFixtures.cases.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => applyScenario(c.preset)}
                className="rounded-full border border-border-control px-2.5 py-1 text-xs font-medium text-ink transition-colors duration-150 hover:border-accent hover:text-accent"
              >
                {c.label}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="space-y-3 border-t border-border pt-4">
        {mode === "demo" && synthetic && !demoFixtures && (
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={simulateError}
              onChange={(e) => setSimulateError(e.target.checked)}
              className="size-4 rounded-sm border-border-control accent-accent"
            />
            {t("simulateError")}
          </label>
        )}
        {hasErrors && <p className="text-xs font-semibold text-danger-ink">{t("fixErrors")}</p>}
        <button
          type="button"
          onClick={send}
          disabled={sending || liveBlocked || writeOnly}
          className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-accent text-sm font-semibold text-accent-ink transition-colors duration-150 hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sending ? t("sending") : t("send")}
        </button>
        {mode === "demo" && !writeOnly && (
          <p className="text-xs text-ink-muted">
            {demoFixtures ? t("demoFixtureNote") : synthetic ? t("prototypeNote") : t("demoUnavailableNote")}
          </p>
        )}
        {liveBlocked && <p className="text-xs text-ink-muted">{t("liveUnavailable")}</p>}
      </div>
    </div>
  );
}
