"use client";

import { useCallback, useState } from "react";
import type { RenderedSample } from "@/components/code/code-tabs";
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
}: {
  api: ApiDefinition;
  initialEndpoint: Endpoint;
  samplesByEndpoint: Record<string, RenderedSample[]>;
}) {
  const router = useRouter();
  const [endpoint, setEndpoint] = useState(initialEndpoint);
  const state = usePlayground(api, endpoint);
  const samples = samplesByEndpoint[endpoint.id] ?? [];

  const selectEndpoint = useCallback(
    (next: Endpoint) => {
      setEndpoint(next);
      router.replace(`/playground?endpoint=${api.id}/${next.id}`, { scroll: false });
    },
    [api.id, router],
  );

  const endpointPane = <EndpointPicker api={api} selected={endpoint} onSelect={selectEndpoint} />;
  const requestPane = (
    <RequestBuilder endpoint={endpoint} samples={samples} state={state} synthetic={api.synthetic} />
  );
  const responsePane = <ResponseViewer state={state} />;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ModeBar mode={state.mode} sending={state.sending} onRequestSwitch={state.requestModeSwitch} />
      <ModeConfirmDialog target={state.pendingMode} onCancel={state.cancelModeSwitch} onConfirm={state.confirmModeSwitch} />

      <MobileSteps state={state} endpointPane={endpointPane} requestPane={requestPane} responsePane={responsePane} />

      <div className="hidden min-h-0 flex-1 md:grid md:grid-cols-[14rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)_26rem]">
        <div className="border-e border-border bg-surface-2 xl:sticky xl:top-[105px] xl:max-h-[calc(100dvh-105px)]">
          {endpointPane}
        </div>
        <div className="min-w-0 divide-y divide-border overflow-y-auto border-e border-border xl:sticky xl:top-[105px] xl:max-h-[calc(100dvh-105px)] xl:divide-y-0 xl:border-e-0">
          {requestPane}
        </div>
        <div className="min-w-0 border-t border-border md:col-span-2 xl:sticky xl:top-[105px] xl:max-h-[calc(100dvh-105px)] xl:col-span-1 xl:border-t-0">
          {responsePane}
        </div>
      </div>
    </div>
  );
}
