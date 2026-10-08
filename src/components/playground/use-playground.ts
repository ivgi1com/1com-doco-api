"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { isDemoSimulatedWrite } from "@/content/demo";
import type { ApiDefinition, Endpoint } from "@/content/types";
import type { LiveTargetHints } from "@/lib/playground-protocol";
import { demoProvider, liveProvider, type PlaygroundResponse } from "./executor";

export type PlaygroundMode = "live" | "demo";

export type { PlaygroundResponse } from "./executor";

const API_KEY_STORAGE = "portal-playground-api-key";
const API_KEY_EVENT = "portal-playground-api-key-change";

/** Field values are keyed `${location}:${name}`, e.g. "path:call_id". */
export function fieldKey(location: string, name: string) {
  return `${location}:${name}`;
}

/**
 * Query fields treated as shared Live-mode session context (like the API
 * key), not per-endpoint form state: once entered, they survive switching
 * endpoints instead of resetting to the new endpoint's default example.
 */
const SHARED_QUERY_FIELDS = new Set([fieldKey("query", "tenant")]);

function defaultFieldValues(endpoint: Endpoint): Record<string, string> {
  const values: Record<string, string> = {};
  for (const p of endpoint.pathParameters) values[fieldKey("path", p.name)] = String(p.example ?? "");
  for (const p of endpoint.queryParameters) values[fieldKey("query", p.name)] = p.example !== undefined ? String(p.example) : "";
  for (const p of endpoint.requestBody ?? []) {
    const example = (endpoint.requestExample as Record<string, unknown> | undefined)?.[p.name];
    // Array/object examples become JSON text, not "[object Object]".
    values[fieldKey("body", p.name)] =
      example === undefined ? "" : typeof example === "object" && example !== null ? JSON.stringify(example) : String(example);
  }
  return values;
}

function readApiKey(): string {
  try {
    return sessionStorage.getItem(API_KEY_STORAGE) ?? "";
  } catch {
    return "";
  }
}

function writeApiKey(value: string) {
  try {
    if (value) sessionStorage.setItem(API_KEY_STORAGE, value);
    else sessionStorage.removeItem(API_KEY_STORAGE);
  } catch {
    // Not persisted; still usable for this render.
  }
  window.dispatchEvent(new Event(API_KEY_EVENT));
}

function subscribeApiKey(cb: () => void) {
  window.addEventListener(API_KEY_EVENT, cb);
  return () => window.removeEventListener(API_KEY_EVENT, cb);
}

export function usePlayground(api: ApiDefinition, endpoint: Endpoint, liveAvailable: boolean, liveHints?: LiveTargetHints) {
  const [mode, setMode] = useState<PlaygroundMode>("demo");
  const [pendingMode, setPendingMode] = useState<PlaygroundMode | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(() => defaultFieldValues(endpoint));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const apiKey = useSyncExternalStore(subscribeApiKey, readApiKey, () => "");
  const [keyRevealed, setKeyRevealed] = useState(false);
  const [simulateError, setSimulateError] = useState(false);
  const [sending, setSending] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [response, setResponse] = useState<PlaygroundResponse | null>(null);
  const [mobileStep, setMobileStep] = useState<0 | 1 | 2>(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const abortRef = useRef<AbortController | undefined>(undefined);
  const endpointRef = useRef(endpoint);
  // Last-entered value of each shared field, kept across the resets below
  // (in-memory only — not sessionStorage; scoped to this hook instance).
  const sharedFieldsRef = useRef<Record<string, string>>({});
  // Bumped whenever an in-flight send should be abandoned (endpoint change,
  // mode switch, unmount), so a late result can no-op instead of applying a
  // stale response for the wrong endpoint/mode.
  const requestTokenRef = useRef(0);

  const abandonInFlightSend = useCallback(() => {
    requestTokenRef.current += 1;
    abortRef.current?.abort();
    clearInterval(timerRef.current);
    setSending(false);
  }, []);

  // Applies the endpoint's own defaults, then restores any shared field
  // (e.g. tenant) the user already entered, instead of the new endpoint's
  // example value — mirrors why the API key already survives this reset.
  const withSharedFields = useCallback((next: Record<string, string>) => {
    for (const key of SHARED_QUERY_FIELDS) {
      const shared = sharedFieldsRef.current[key];
      if (shared && key in next) next[key] = shared;
    }
    return next;
  }, []);

  // Reset per-request state when the selected endpoint changes.
  useEffect(() => {
    if (endpointRef.current.id === endpoint.id && endpointRef.current.api === endpoint.api) return;
    endpointRef.current = endpoint;
    abandonInFlightSend();
    setFieldValues(withSharedFields(defaultFieldValues(endpoint)));
    setErrors({});
    setResponse(null);
    setSimulateError(false);
  }, [endpoint, abandonInFlightSend, withSharedFields]);

  useEffect(
    () => () => {
      clearInterval(timerRef.current);
      abortRef.current?.abort();
    },
    [],
  );

  const setField = useCallback((key: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
    if (SHARED_QUERY_FIELDS.has(key)) sharedFieldsRef.current[key] = value;
    setErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const setApiKey = useCallback((value: string) => {
    writeApiKey(value);
  }, []);

  const requestModeSwitch = useCallback(
    (target: PlaygroundMode) => {
      if (target === mode) return;
      setPendingMode(target);
    },
    [mode],
  );

  const cancelModeSwitch = useCallback(() => setPendingMode(null), []);

  const confirmModeSwitch = useCallback(() => {
    if (!pendingMode) return;
    abandonInFlightSend();
    if (pendingMode === "live") {
      setFieldValues(withSharedFields(defaultFieldValues(endpointRef.current)));
      setErrors({});
      setResponse(null);
      setSimulateError(false);
    } else {
      setApiKey("");
      setKeyRevealed(false);
      setResponse(null);
    }
    setMode(pendingMode);
    setPendingMode(null);
  }, [pendingMode, setApiKey, abandonInFlightSend, withSharedFields]);

  const writeDemoSupported = isDemoSimulatedWrite(api.id, endpoint);

  const validate = useCallback((): Record<string, string> => {
    const next: Record<string, string> = {};
    if (mode === "live" && !apiKey.trim()) next.apiKey = "apiKey";
    for (const p of endpoint.pathParameters) {
      const key = fieldKey("path", p.name);
      if (!fieldValues[key]?.trim()) next[key] = p.name;
    }
    // Only a documented `required: true` blocks sending; "undocumented" must not.
    for (const p of endpoint.queryParameters) {
      if (p.required !== true) continue;
      const key = fieldKey("query", p.name);
      if (!fieldValues[key]?.trim()) next[key] = p.name;
    }
    for (const p of endpoint.requestBody ?? []) {
      if (p.required !== true) continue;
      const key = fieldKey("body", p.name);
      if (!fieldValues[key]?.trim()) next[key] = p.name;
    }
    return next;
  }, [apiKey, endpoint, fieldValues, mode]);

  const send = useCallback(() => {
    if (mode === "live" && !liveAvailable) return;
    // SEC-REQ-27: a write is never sent in Live, and runs in Demo only when
    // it has a documented-example fixture set.
    if (endpoint.operationClass === "write" && (mode === "live" || !writeDemoSupported)) return;
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setResponse(null);
    setSending(true);
    setElapsedMs(0);
    const start = performance.now();
    timerRef.current = setInterval(() => setElapsedMs(performance.now() - start), 60);
    const token = ++requestTokenRef.current;
    const controller = new AbortController();
    abortRef.current = controller;

    // One provider per mode; no fallback between them (docs/SECURITY.md).
    const provider = mode === "live" ? liveProvider : demoProvider;
    provider
      .execute(
        { api, endpoint, fieldValues, credential: apiKey, simulateError, liveHints: mode === "live" ? liveHints : undefined },
        controller.signal,
      )
      .then(
        (result: PlaygroundResponse) => {
          // The endpoint or mode changed (or the component unmounted) while
          // this request was in flight; abandonInFlightSend already reset
          // `sending`/timers. Applying this now would show the wrong response.
          if (token !== requestTokenRef.current) return;
          setResponse(result);
        },
        () => {
          // Only an abort rejects; abandonInFlightSend owns the cleanup.
        },
      )
      .finally(() => {
        if (token !== requestTokenRef.current) return;
        clearInterval(timerRef.current);
        setSending(false);
      });
  }, [api, apiKey, endpoint, fieldValues, liveAvailable, liveHints, mode, simulateError, validate, writeDemoSupported]);

  return {
    mode,
    pendingMode,
    fieldValues,
    errors,
    apiKey,
    keyRevealed,
    simulateError,
    sending,
    elapsedMs,
    response,
    writeDemoSupported,
    mobileStep,
    setField,
    setApiKey,
    setKeyRevealed,
    setSimulateError,
    requestModeSwitch,
    cancelModeSwitch,
    confirmModeSwitch,
    send,
    setMobileStep,
  };
}

export type PlaygroundState = ReturnType<typeof usePlayground>;
