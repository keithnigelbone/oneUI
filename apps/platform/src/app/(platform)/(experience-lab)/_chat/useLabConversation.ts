/**
 * useLabConversation.ts — the chat-first Lab conversation state hook (D-01/D-05/
 * D-06/D-12).
 *
 * This is the transport + state layer behind `ExperienceLabChat`'s `ChatSurface`
 * host. It REUSES the existing NDJSON wire contract (`readNdjson` + the
 * `RunStreamFrame` discriminated union from `useExperienceLabRun`) but exposes
 * CHAT-shaped state instead of canvas-shaped state:
 *
 *   `{ messages, status, error, submit(text), stop(), regenerate(messageId) }`
 *
 * `submit` builds the run POST body from the composer-strip / session state.
 * The image-source selector adds an optional `imageGeneration` object only when
 * the strip carries a provider preference; callers that omit it retain the
 * older body shape. It appends a user message + a streaming assistant message
 * whose `parts` carry a `data-run-progress` part fed by the per-event NDJSON
 * accumulation (consumed by `RunTurn` via `renderLabMessagePart`).
 *
 * Canvas seam (D-12): the hook accepts an optional `canvasCallbacks`
 * (`{ placeArtifact, flipToGapState }`, threaded from the shell/canvas in Task 3)
 * and is the SINGLE caller of the canvas placement — on a terminal run frame it
 * invokes `placeArtifact(...)` for an artifact outcome and `flipToGapState(...)`
 * for a REAL gap (a gap WITHOUT a campaignPlan; a gap WITH a campaignPlan is a
 * suspend, handled by the run-turn / Plan-04 card, never a canvas gap card).
 *
 * Persistence (D-06): each user/assistant turn is appended through the Plan-01
 * `/api/experience-lab/conversation` route keyed by a `localStorage`-persisted
 * sessionId (resourceId = brandId). On mount the thread is rehydrated into
 * `messages[]`. The transport `fetch` and the persistence `fetch` are both
 * injectable so tests drive a mocked stream without a live backend.
 *
 * LOCKED anti-pattern (CHAT-11 / single-`ai` gate): this hook NEVER imports
 * `ai` / `@ai-sdk/react` and never uses `useChat`. `ChatSurface` is headless of
 * transport — it only needs `messages[]` / `status` / `onSubmit`.
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  parseRunStreamLine,
  isResultFrame,
  isEventFrame,
  type RunResultFrame,
} from '../_canvas/runStream';
import type { ExperienceBuilderEventT } from '@oneui/experience-builder-core';
import type { ChatMessage } from '@oneui/ui-internal/components/ChatSurface/ChatSurface.shared';
import type { ComposerControlStripValue } from './ComposerControlStrip';

const RUN_ENDPOINT = '/api/experience-lab/run';
const CONVERSATION_ENDPOINT = '/api/experience-lab/conversation';

/** The discriminator the run-turn message part is dispatched on (D-09). */
export const PART_RUN_PROGRESS = 'data-run-progress' as const;

/** The terminal run outcome carried on the run-progress part. */
export type RunProgressOutcome = 'artifact' | 'gap' | 'error' | 'pending';

/**
 * The `data-run-progress` message part payload (consumed by `RunTurn`). Mirrors
 * the AI-SDK `data-*` convention so `renderLabMessagePart` can dispatch on
 * `part.type`.
 */
export interface RunProgressPart {
  type: typeof PART_RUN_PROGRESS;
  /** Ordered `ExperienceBuilderEvent` timeline for this run. */
  events: ExperienceBuilderEventT[];
  /** Transport status of this specific run turn. */
  status: 'running' | 'done' | 'error';
  /** Terminal outcome — `pending` while running. */
  outcome: RunProgressOutcome;
  /** The terminal result frame (carries campaignPlan for a suspend, D-12). */
  result?: RunResultFrame;
}

/** Chat transport status (subset of the ChatSurface `ChatStatus` union). */
export type LabChatStatus = 'ready' | 'submitted' | 'streaming' | 'error';

/** The artifact/gap canvas placement seam (D-12), threaded from the canvas. */
export interface LabCanvasCallbacks {
  /** Create a pending artifact card immediately when a run starts. */
  beginArtifact?: () => string | null;
  /** Place a produced artifact card on the canvas (artifact outcome). */
  placeArtifact: (result: RunResultFrame, pendingArtifactId?: string | null) => void;
  /** Flip the canvas to a typed gap card for a REAL gap (no campaignPlan). */
  flipToGapState: (
    gap: ExperienceBuilderEventT,
    result: RunResultFrame | null,
    pendingArtifactId?: string | null,
  ) => void;
}

export interface UseLabConversationOptions {
  /** The composer control-strip value (brand/sub-brand/type/profile). */
  stripValue: ComposerControlStripValue;
  /** Stable conversation session id (persisted in localStorage by the caller). */
  sessionId: string;
  /**
   * Whether `stripValue.brandId` is a REAL, currently-loaded `brands` doc id
   * (GAP-02). Computed by the host via `useResolvedBrandId` — the SAME
   * `brands.list` membership check the strip's `'skip'` sentinel uses. When
   * `false`, `submit` does NOT POST `/run` (which requires `brandId.min(1)`);
   * instead it appends the user's turn plus a friendly assistant ask-turn that
   * guides them to pick a brand in the composer strip, then resend. Defaults to
   * `true` so headless callers that already pass a resolved brand are unchanged.
   */
  hasResolvedBrand?: boolean;
  /** Canvas placement seam (D-12). Optional so the hook is testable headless. */
  canvasCallbacks?: LabCanvasCallbacks;
  /** Injectable run-stream fetch. Defaults to global fetch. */
  fetchImpl?: typeof fetch;
  /** Injectable persistence fetch. Defaults to global fetch. */
  persistFetchImpl?: typeof fetch;
}

/** The in-chat ask-turn copy shown when a user submits with no resolved brand. */
export const NO_BRAND_ASK_TEXT =
  'Pick a brand (and optionally a sub-brand) in the composer strip below, then resend your message — I generate every experience from a real Jio brand’s foundations, so I need one first.';

/** Generate a stable message id without an external dependency. */
function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Decode an NDJSON response body into ordered frames (shared decoder).
 *
 * The optional `signal` makes the body read abort-aware (CR-01): the raw
 * `ReadableStream` reader does not observe an `AbortController`, so on abort we
 * (a) cancel the reader to release the underlying connection, and (b) stop
 * yielding. Without this, `stop()` could not actually interrupt a mid-stream
 * read and the background loop kept running until the server closed the stream.
 */
async function* readNdjson(
  response: Response,
  signal?: AbortSignal,
): AsyncGenerator<ReturnType<typeof parseRunStreamLine>> {
  const body = response.body;
  if (!body) {
    if (signal?.aborted) return;
    const text = await response.text();
    for (const line of text.split('\n')) {
      if (signal?.aborted) return;
      const frame = parseRunStreamLine(line);
      if (frame) yield frame;
    }
    return;
  }
  const reader = body.getReader();
  // Cancel the in-flight read the instant the run is aborted so a blocked
  // `reader.read()` rejects/resolves and the loop unwinds promptly.
  const onAbort = () => {
    void reader.cancel().catch(() => {});
  };
  if (signal) {
    if (signal.aborted) {
      void reader.cancel().catch(() => {});
      return;
    }
    signal.addEventListener('abort', onAbort, { once: true });
  }
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    for (;;) {
      if (signal?.aborted) return;
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let nl: number;
      while ((nl = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, nl);
        buffer = buffer.slice(nl + 1);
        const frame = parseRunStreamLine(line);
        if (frame) yield frame;
      }
    }
    const tail = parseRunStreamLine(buffer);
    if (tail) yield tail;
  } finally {
    if (signal) signal.removeEventListener('abort', onAbort);
  }
}

/** Build the run POST body from strip/session state. */
function buildRunBody(strip: ComposerControlStripValue, prompt: string): Record<string, unknown> {
  const imageProvider = strip.imageProvider;
  return {
    brandId: strip.brandId,
    artifactType: strip.artifactType,
    outputProfile: strip.outputProfile,
    prompt,
    // Optional sub-brand (D-02) — conditional spread, never an empty string.
    ...(strip.subBrandConfigId ? { subBrandConfigId: strip.subBrandConfigId } : {}),
    ...(imageProvider
      ? {
          imageGeneration:
            imageProvider === 'none'
              ? { enabled: false, provider: 'none' }
              : { enabled: true, provider: imageProvider, count: 1 },
        }
      : {}),
  };
}

function normalizeCanvasGapEvent(
  gap: Extract<ExperienceBuilderEventT, { type: 'gap' }>,
  strip: ComposerControlStripValue,
): Extract<ExperienceBuilderEventT, { type: 'gap' }> {
  if (gap.componentGap) return gap;
  if (!gap.foundationGap) return gap;

  const artifactType = gap.foundationGap?.artifactType || strip.artifactType;
  const outputProfile = gap.foundationGap?.outputProfile || strip.outputProfile;
  const reason =
    gap.foundationGap?.reason ||
    `No Jio foundation profile is defined for ${artifactType} → ${outputProfile}. Generation stopped — no dimensions were invented. Pick a covered profile, or file this as a Jio system gap.`;

  if (
    gap.foundationGap?.artifactType === artifactType &&
    gap.foundationGap?.outputProfile === outputProfile &&
    gap.foundationGap?.reason === reason
  ) {
    return gap;
  }

  return {
    ...gap,
    foundationGap: {
      artifactType,
      outputProfile,
      reason,
    },
  };
}

/** Append a turn through the conversation persistence route (best-effort). */
async function persistTurn(
  persistFetch: typeof fetch,
  sessionId: string,
  brandId: string | undefined,
  messages: { role: 'user' | 'assistant'; text: string }[],
): Promise<void> {
  if (!sessionId || messages.length === 0) return;
  try {
    await persistFetch(CONVERSATION_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'append',
        sessionId,
        ...(brandId ? { brandId } : {}),
        messages,
      }),
    });
  } catch {
    // Persistence is non-fatal — the transcript still renders this session.
  }
}

/** Extract plain text from a (rehydrated) message's parts/text. */
function textOf(message: ChatMessage): string {
  const parts = message.parts ?? [];
  const textPart = parts.find((p) => p.type === 'text') as
    | { type: 'text'; text?: string }
    | undefined;
  return textPart?.text ?? '';
}

export interface UseLabConversationResult {
  messages: ChatMessage[];
  status: LabChatStatus;
  error: Error | null;
  submit: (text: string) => Promise<void>;
  stop: () => void;
  regenerate: (messageId: string) => Promise<void>;
}

export function useLabConversation(
  options: UseLabConversationOptions,
): UseLabConversationResult {
  const {
    stripValue,
    sessionId,
    hasResolvedBrand = true,
    canvasCallbacks,
    fetchImpl,
    persistFetchImpl,
  } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<LabChatStatus>('ready');
  const [error, setError] = useState<Error | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const lastPromptRef = useRef<string>('');
  // GAP-03: seed-once guard. The set holds every sessionId whose history has
  // already been rehydrated into `messages[]`. Under React StrictMode (effects
  // double-invoke), remounts, or a history-load that races a live submit, this
  // ensures the rehydration effect seeds a session's transcript AT MOST ONCE —
  // so a double-invoked effect can never duplicate restored turns.
  const seededSessionsRef = useRef<Set<string>>(new Set());
  // Keep callbacks/strip in refs so `submit`'s identity stays stable while it
  // always reads the freshest values.
  const stripRef = useRef(stripValue);
  stripRef.current = stripValue;
  // GAP-02: keep the resolved-brand gate in a ref so `submit`/`runStream` read
  // the freshest value without re-creating their (memoised) identities.
  const hasResolvedBrandRef = useRef(hasResolvedBrand);
  hasResolvedBrandRef.current = hasResolvedBrand;
  const canvasRef = useRef(canvasCallbacks);
  canvasRef.current = canvasCallbacks;

  // Stabilise the injectable fetch references in refs (mirrors the stripRef /
  // canvasRef pattern) so the rehydration effect's deps stay identity-stable
  // even when a test passes an inline `fetchImpl`/`persistFetchImpl` literal
  // that changes identity every render (WR-04). In production these are global
  // `fetch`, already stable.
  const fetchRef = useRef(fetchImpl);
  fetchRef.current = fetchImpl;
  const persistFetchRef = useRef(persistFetchImpl);
  persistFetchRef.current = persistFetchImpl;

  const hasFetch =
    Boolean(sessionId) && (fetchImpl !== undefined || (typeof fetch !== 'undefined'));

  const doFetch = useCallback(
    (...args: Parameters<typeof fetch>): ReturnType<typeof fetch> =>
      (fetchRef.current ?? fetch)(...args),
    [],
  );
  const persistFetch = useCallback(
    (...args: Parameters<typeof fetch>): ReturnType<typeof fetch> =>
      (persistFetchRef.current ?? fetchRef.current ?? fetch)(...args),
    [],
  );

  // -------------------------------------------------------------------------
  // D-06d — rehydrate the thread on mount / sessionId change.
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!hasFetch || !sessionId) return;
    // GAP-03 seed-once guard: if this sessionId's history has already been
    // rehydrated (StrictMode double-invoke, remount, or a re-render that re-runs
    // the effect), do NOT load + seed again. This is the primary defence against
    // duplicate restored turns; the `prev.length === 0` check below is the
    // second line of defence against clobbering an in-flight live transcript.
    if (seededSessionsRef.current.has(sessionId)) return;
    // Mark BEFORE the await so a synchronously double-invoked effect (StrictMode)
    // sees the flag and bails before its own fetch can race in.
    seededSessionsRef.current.add(sessionId);
    let cancelled = false;
    (async () => {
      try {
        const res = await persistFetch(CONVERSATION_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'load', sessionId }),
        });
        const data = (await res.json()) as {
          messages?: { role: 'user' | 'assistant'; text: string }[];
        };
        if (cancelled || !data.messages || data.messages.length === 0) return;
        const restored: ChatMessage[] = data.messages.map((m, i) => ({
          // Restored ids stay deterministic so a re-seed (different session)
          // never collides and ChatSurface's `key={m.id}` stays stable.
          id: `restored-${sessionId}-${i}`,
          role: m.role,
          parts: [{ type: 'text', text: m.text }],
        }));
        // Second line of defence: only seed from history when the live transcript
        // is still empty so we never clobber an in-flight session that submitted
        // a turn between mount and the history-load resolving.
        setMessages((prev) => (prev.length === 0 ? restored : prev));
      } catch {
        /* rehydrate is best-effort */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [persistFetch, hasFetch, sessionId]);

  /** Mutate the run-progress part of a specific assistant message in place. */
  const patchRunPart = useCallback(
    (assistantId: string, patch: (prev: RunProgressPart) => RunProgressPart) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== assistantId) return m;
          const parts = (m.parts ?? []).map((p) =>
            p.type === PART_RUN_PROGRESS ? (patch(p as unknown as RunProgressPart) as unknown as typeof p) : p,
          );
          return { ...m, parts };
        }),
      );
    },
    [],
  );

  const runStream = useCallback(
    async (prompt: string): Promise<void> => {
      if (!hasFetch) return;
      // WR-03: guard against concurrent runs. A non-null abort ref means a run
      // is already streaming — a suggestion chip / second submit fired mid-stream
      // must not start a second AbortController + fetch (which would interleave
      // garbled state across two message ids). Drop the duplicate invocation.
      if (abortRef.current) return;
      const strip = stripRef.current;
      lastPromptRef.current = prompt;

      const userId = newId('user');
      const assistantId = newId('assistant');
      const userMessage: ChatMessage = {
        id: userId,
        role: 'user',
        parts: [{ type: 'text', text: prompt }],
      };
      const initialRunPart: RunProgressPart = {
        type: PART_RUN_PROGRESS,
        events: [],
        status: 'running',
        outcome: 'pending',
      };
      const assistantMessage: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        parts: [initialRunPart as unknown as { type: string } & Record<string, unknown>],
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setStatus('streaming');
      setError(null);
      const pendingArtifactId = canvasRef.current?.beginArtifact?.() ?? null;

      // Persist the user turn immediately (D-06).
      void persistTurn(persistFetch as typeof fetch, sessionId, strip.brandId, [
        { role: 'user', text: prompt },
      ]);

      const controller = new AbortController();
      abortRef.current = controller;

      let response: Response;
      try {
        response = await doFetch(RUN_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildRunBody(strip, prompt)),
          signal: controller.signal,
        });
      } catch (err) {
        // CR-01: distinguish a user-initiated stop (AbortError, fired while the
        // fetch was in-flight) from a real failure. On abort, end the turn in a
        // neutral cancelled state and return to 'ready' — `stop()` must win over
        // the async catch, never leave the UI stuck on 'error'.
        const isAbort = err instanceof Error && err.name === 'AbortError';
        patchRunPart(assistantId, (p) => ({
          ...p,
          status: isAbort ? 'done' : 'error',
          outcome: isAbort ? 'gap' : 'error',
        }));
        setStatus(isAbort ? 'ready' : 'error');
        setError(isAbort ? null : err instanceof Error ? err : new Error('Run request failed'));
        abortRef.current = null;
        return;
      }

      let result: RunResultFrame | null = null;
      let gapEvent: ExperienceBuilderEventT | null = null;
      const events: ExperienceBuilderEventT[] = [];

      try {
        for await (const frame of readNdjson(response, controller.signal)) {
          // CR-01: the ReadableStream reader is not abort-aware, so check the
          // signal each iteration and exit the loop early when `stop()` aborts
          // mid-stream — otherwise the background read keeps running and emits a
          // second spurious state transition when the server finally closes.
          if (controller.signal.aborted) break;
          if (!frame) continue;
          if (isEventFrame(frame)) {
            events.push(frame.event);
            if (frame.event.type === 'gap') gapEvent = frame.event;
            const snapshot = [...events];
            patchRunPart(assistantId, (p) => ({ ...p, events: snapshot }));
          } else if (isResultFrame(frame)) {
            result = frame;
          }
        }
      } catch (err) {
        const isAbort = err instanceof Error && err.name === 'AbortError';
        patchRunPart(assistantId, (p) => ({
          ...p,
          status: isAbort ? 'done' : 'error',
          outcome: isAbort ? 'gap' : 'error',
        }));
        setStatus(isAbort ? 'ready' : 'error');
        setError(isAbort ? null : err instanceof Error ? err : new Error('Run stream failed'));
        abortRef.current = null;
        return;
      }

      // CR-01: a clean mid-stream stop (signal aborted, loop broke without
      // throwing) ends the turn neutrally and returns to 'ready'. Do NOT run the
      // terminal disposition / placement below — there is no complete result.
      if (controller.signal.aborted) {
        patchRunPart(assistantId, (p) => ({ ...p, status: 'done', outcome: 'gap' }));
        setStatus('ready');
        setError(null);
        abortRef.current = null;
        return;
      }

      // D-12 terminal disposition. A gap carrying a campaignPlan is a SUSPEND,
      // NOT a failure — it does NOT drop a canvas gap card (the campaign card is
      // rendered separately by Plan 04). Only a REAL gap (no plan) flips the
      // canvas gap card.
      const hasCampaignPlan = Boolean(result?.campaignPlan);
      const canvasGapEvent =
        gapEvent && gapEvent.type === 'gap'
          ? normalizeCanvasGapEvent(gapEvent, strip)
          : result?.outcome === 'gap'
            ? normalizeCanvasGapEvent(
                { type: 'gap', runId: assistantId, at: Date.now() },
                strip,
              )
            : null;
      let outcome: RunProgressOutcome;
      if (result && result.outcome === 'artifact') {
        outcome = 'artifact';
        canvasRef.current?.placeArtifact(result, pendingArtifactId);
      } else if (canvasGapEvent && !hasCampaignPlan) {
        outcome = 'gap';
        canvasRef.current?.flipToGapState(canvasGapEvent, result, pendingArtifactId);
      } else if (hasCampaignPlan) {
        // Suspend — surfaced as a gap outcome on the wire but treated as a
        // (successful) plan checkpoint; no canvas gap card.
        outcome = 'gap';
        if (result) canvasRef.current?.placeArtifact(result, pendingArtifactId);
      } else {
        outcome = 'error';
        if (result) canvasRef.current?.placeArtifact(result, pendingArtifactId);
      }

      patchRunPart(assistantId, (p) => ({
        ...p,
        events: [...events],
        status: outcome === 'error' ? 'error' : 'done',
        outcome,
        result: result ?? undefined,
      }));
      setStatus(outcome === 'error' ? 'error' : 'ready');
      abortRef.current = null;

      // Persist the assistant turn — a compact, markup-free outcome line (D-06 /
      // T-04.1-02: only role + text, never the raw IR or stream).
      const summary =
        outcome === 'artifact'
          ? `Generated ${strip.artifactType}.`
          : outcome === 'gap'
            ? hasCampaignPlan
              ? 'Campaign plan ready.'
              : 'Generation refused — Jio system gap.'
            : 'Generation failed.';
      void persistTurn(persistFetch as typeof fetch, sessionId, strip.brandId, [
        { role: 'assistant', text: summary },
      ]);
    },
    [doFetch, persistFetch, hasFetch, sessionId, patchRunPart],
  );

  const submit = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      // GAP-02: graceful ask/plan mode. With NO resolved brand we must NOT POST
      // `/run` (its schema requires `brandId.min(1)`, so an empty id 400s and
      // generation silently can't start). Instead append the user's turn PLUS a
      // friendly assistant ask-turn (a normal text part) that guides them to
      // pick a brand in the composer strip below, then resend. Never starts a
      // fetch / AbortController, so the `/run` and `/resume` contracts are
      // untouched.
      if (!hasResolvedBrandRef.current) {
        const userMessage: ChatMessage = {
          id: newId('user'),
          role: 'user',
          parts: [{ type: 'text', text: trimmed }],
        };
        const askMessage: ChatMessage = {
          id: newId('assistant'),
          role: 'assistant',
          parts: [{ type: 'text', text: NO_BRAND_ASK_TEXT }],
        };
        setMessages((prev) => [...prev, userMessage, askMessage]);
        setStatus('ready');
        setError(null);
        // Persist the user's turn like any other (best-effort). Brand is still
        // unset, so no brandId is sent. The SYNTHETIC ask-turn is intentionally
        // NOT persisted — it is regenerated client-side whenever a brand-less
        // submit happens, so persisting it would duplicate guidance on reload.
        void persistTurn(persistFetch as typeof fetch, sessionId, undefined, [
          { role: 'user', text: trimmed },
        ]);
        return;
      }

      await runStream(trimmed);
    },
    [runStream, persistFetch, sessionId],
  );

  const stop = useCallback(() => {
    // WR-02: no active run → no-op. Never clobber an existing 'error' state (or
    // its error signal) when there is nothing to stop.
    const controller = abortRef.current;
    if (!controller) return;
    // CR-01: do NOT call setStatus here. Aborting unwinds `runStream` (its
    // fetch-catch / NDJSON loop / post-loop abort guard), which is the single
    // owner of the terminal status transition — that path sets 'ready' and
    // clears the error, so `stop()` wins cleanly over any in-flight catch.
    controller.abort();
  }, []);

  const regenerate = useCallback(
    async (_messageId: string) => {
      const last = lastPromptRef.current;
      if (last) await runStream(last);
    },
    [runStream],
  );

  // Keep the lint-free reference to textOf available to consumers that want a
  // plain-text projection of a message (used by Plan 05 focus binding).
  void textOf;

  return { messages, status, error, submit, stop, regenerate };
}

export { textOf as labMessageText };
