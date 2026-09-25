"use client";

import { useCallback, useState } from "react";
import type { RenderedSample } from "@/components/code/code-tabs";
import { getDemoFixtures } from "@/content/demo";
import type { ApiDefinition, Endpoint } from "@/content/types";
import { useRouter } from "@/i18n/navigation";
import { EndpointPicker } from "./endpoint-picker";
import { MobileSteps } from "./mobile-steps";
import { ModeBar } from "./mode-bar";
import { ModeConfirmDialog } from "./mode-confirm-dialog";
import { RequestBuilder } from "./request-builder";
import { ResponseViewer } from "./response-viewer";
import { usePlayground } from "./use-playground";

export function PlaygroundApp({
  api,
  initialEndpoint,
  samplesByEndpoint,
  liveEndpointIds,
}: {
  api: ApiDefinition;
  initialEndpoint: Endpoint;
  samplesByEndpoint: Record<string, RenderedSample[]>;
  /** Allowlisted `${api}/${endpoint}` ids; empty when Live is disabled server-side. */
  liveEndpointIds: string[];
}) {
  const router = useRouter();
  const [endpoint, setEndpoint] = useState(initialEndpoint);
  const liveAvailable = liveEndpointIds.includes(`${api.id}/${endpoint.id}`);
  const state = usePlayground(api, endpoint, liveAvailable);
  const samples = samplesByEndpoint[endpoint.id] ?? [];
  const demoFixtures = getDemoFixtures(api.id, endpoint.id);

  const selectEndpoint = useCallback(
    (next: Endpoint) => {
      setEndpoint(next);
      router.replace(`/playground?endpoint=${api.id}/${next.id}`, { scroll: false });
    },
    [api.id, router],
  );

  const endpointPane = <EndpointPicker api={api} selected={endpoint} onSelect={selectEndpoint} />;
  const requestPane = (
    <RequestBuilder
      endpoint={endpoint}
      samples={samples}
      state={state}
      synthetic={api.synthetic}
      liveAvailable={liveAvailable}
      demoFixtures={demoFixtures}
    />
  );
  const responsePane = <ResponseViewer state={state} endpoint={endpoint} />;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ModeBar mode={state.mode} sending={state.sending} onRequestSwitch={state.requestModeSwitch} />
      <ModeConfirmDialog target={state.pendingMode} onCancel={state.cancelModeSwitch} onConfirm={state.confirmModeSwitch} />

      <MobileSteps state={state} endpointPane={endpointPane} requestPane={requestPane} responsePane={responsePane} />

      <div className="hidden min-h-0 flex-1 md:grid md:grid-cols-[14rem_minmax(0,1fr)] lg:grid-cols-[13rem_minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="border-e border-border bg-surface-2 lg:sticky lg:top-[105px] lg:max-h-[calc(100dvh-105px)]">
          {endpointPane}
        </div>
        <div className="min-w-0 divide-y divide-border overflow-y-auto border-e border-border lg:sticky lg:top-[105px] lg:max-h-[calc(100dvh-105px)] lg:divide-y-0">
          {requestPane}
        </div>
        <div className="min-w-0 border-t border-border md:col-span-2 lg:sticky lg:top-[105px] lg:col-span-1 lg:max-h-[calc(100dvh-105px)] lg:border-t-0">
          {responsePane}
        </div>
      </div>
    </div>
  );
}
