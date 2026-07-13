/**
 * useAgentChat.ts
 *
 * Mode-aware wrapper around Vercel AI SDK `useChat` + `DefaultChatTransport`.
 * Every chat surface in the platform (Home, Build, Design, Voice) calls
 * this hook with its mode; the hook posts to the unified `/api/agent`
 * dispatcher with `mode` injected into the body alongside whatever
 * mode-specific fields the caller supplies.
 *
 * Callers still provide a `body` callback so brand, compiled prompts,
 * voice config, etc. stay fresh via closure refs — the hook merges the
 * `mode` in automatically.
 */

'use client';

import { useMemo, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { AGENT_ROUTE, type AgentRouteMode } from '@/lib/agentRoutes';

export type AgentMode = AgentRouteMode;

export interface UseAgentChatOptions {
  mode: AgentMode;
  /**
   * Called at request time (not at render time) to compute the request
   * body. Return any extra fields the executor expects (brand, voice
   * prompt, tools config, etc.). `messages` and `mode` are added
   * automatically — callers must not include them.
   */
  body?: () => Record<string, unknown>;
  /** Pre-hydrated messages for resumed threads. */
  initialMessages?: UIMessage[];
  /** Fired when the transport or model errors. */
  onError?: (error: Error) => void;
}

/**
 * Returns a stable `useChat` result bound to `/api/agent`. The transport
 * is memoised on `mode` alone: the `body` callback closes over the
 * latest call-site refs (same pattern as HomeChat), so mode-specific
 * data stays fresh across renders without re-instantiating the
 * transport.
 */
export function useAgentChat({
  mode,
  body,
  initialMessages,
  onError,
}: UseAgentChatOptions) {
  // Hold the latest body provider in a ref so the transport's body
  // callback always reads the current closure. Without this, the
  // useMemo below captures the FIRST `body` function — stale values
  // land on the server whenever call-site state updates after mount
  // (e.g. Convex queries resolving post-first-render).
  const bodyRef = useRef(body);
  bodyRef.current = body;

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: AGENT_ROUTE,
        body: () => ({
          mode,
          ...(bodyRef.current ? bodyRef.current() : {}),
        }),
      }),
    // Mode changes warrant a new transport. `bodyRef` is stable and
    // reads the latest closure at request time — no dep needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode],
  );

  return useChat({
    transport,
    messages: initialMessages,
    onError:
      onError ??
      ((err) => {
        console.error(`[${mode} chat] error`, err);
      }),
  });
}
