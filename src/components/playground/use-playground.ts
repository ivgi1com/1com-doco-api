"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Endpoint } from "@/content/types";
import { byteSize } from "@/lib/json-path";

export type PlaygroundMode = "live" | "demo";

export type PlaygroundResponse =
  | {
      source: "DEMO";
      status: number;
      latencyMs: number;
      sizeBytes: number;
      requestId: string;
      body: unknown;
    }
  | {
      source: "LIVE";
      error: true;
    };

const API_KEY_STORAGE = "portal-playground-api-key";
const API_KEY_EVENT = "portal-playground-api-key-change";

/** Field values are keyed `${location}:${name}`, e.g. "path:call_id". */
export function fieldKey(location: string, name: string) {
  return `${location}:${name}`;
}

function randomId(prefix: string) {
  const bytes = new Uint8Array(6);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(bytes);
  return `${prefix}_${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}

function defaultFieldValues(endpoint: Endpoint): Record<string, string> {
  const values: Record<string, string> = {};
  for (const p of endpoint.pathParameters) values[fieldKey("path", p.name)] = String(p.example ?? "");
  for (const p of endpoint.queryParameters) values[fieldKey("query", p.name)] = p.example !== undefined ? String(p.example) : "";
  for (const p of endpoint.requestBody ?? []) {
    const example = (endpoint.requestExample as Record<string, unknown> | undefined)?.[p.name];
    values[fieldKey("body", p.name)] = example !== undefined ? String(example) : "";
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

export function usePlayground(endpoint: Endpoint) {
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
  const sendTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const endpointRef = useRef(endpoint);
  // Bumped whenever an in-flight send should be abandoned (endpoint change,
  // mode switch, unmount), so its setTimeout callback can no-op instead of
  // applying a stale response for the wrong endpoint/mode.
  const requestTokenRef = useRef(0);

  const abandonInFlightSend = useCallback(() => {
    requestTokenRef.current += 1;
    clearTimeout(sendTimeoutRef.current);
    clearInterval(timerRef.current);
    setSending(false);
  }, []);

  // Reset per-request state when the selected endpoint changes.
  useEffect(() => {
    if (endpointRef.current.id === endpoint.id && endpointRef.current.api === endpoint.api) return;
    endpointRef.current = endpoint;
    abandonInFlightSend();
    setFieldValues(defaultFieldValues(endpoint));
    setErrors({});
    setResponse(null);
    setSimulateError(false);
  }, [endpoint, abandonInFlightSend]);

  useEffect(
    () => () => {
      clearInterval(timerRef.current);
      clearTimeout(sendTimeoutRef.current);
    },
    [],
  );

  const setField = useCallback((key: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
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
      setFieldValues(defaultFieldValues(endpointRef.current));
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
  }, [pendingMode, setApiKey, abandonInFlightSend]);

  const validate = useCallback((): Record<string, string> => {
    const next: Record<string, string> = {};
    for (const p of endpoint.pathParameters) {
      const key = fieldKey("path", p.name);
      if (!fieldValues[key]?.trim()) next[key] = p.name;
    }
    for (const p of endpoint.queryParameters) {
      if (!p.required) continue;
      const key = fieldKey("query", p.name);
      if (!fieldValues[key]?.trim()) next[key] = p.name;
    }
    for (const p of endpoint.requestBody ?? []) {
      if (!p.required) continue;
      const key = fieldKey("body", p.name);
      if (!fieldValues[key]?.trim()) next[key] = p.name;
    }
    return next;
  }, [endpoint, fieldValues]);

  const send = useCallback(() => {
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

    const finish = () => {
      // The endpoint or mode changed (or the component unmounted) while this
      // request was in flight; abandonInFlightSend already bumped the token
      // and reset `sending`/timers. Applying this response now would silently
      // repopulate the response pane with data for the wrong endpoint/mode.
      if (token !== requestTokenRef.current) return;
      clearInterval(timerRef.current);
      setSending(false);
      if (mode === "live") {
        setResponse({ source: "LIVE", error: true });
        return;
      }
      const success = endpoint.responses.find((r) => r.status < 300);
      const failure = endpoint.responses.find((r) => r.status >= 400);
      const chosen = (simulateError && failure) || success || endpoint.responses[0];
      const body = chosen?.example ?? null;
      setResponse({
        source: "DEMO",
        status: chosen?.status ?? 200,
        latencyMs: Math.round(180 + Math.random() * 460),
        sizeBytes: byteSize(body),
        requestId: randomId("req_demo"),
        body,
      });
    };

    const delay = mode === "live" ? 500 : 400 + Math.random() * 500;
    sendTimeoutRef.current = setTimeout(finish, delay);
  }, [endpoint, mode, simulateError, validate]);

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
