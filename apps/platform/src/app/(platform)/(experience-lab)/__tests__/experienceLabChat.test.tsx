/**
 * experienceLabChat.test.tsx — Plan 03 fill (Wave 2).
 *
 * Owning requirements (VALIDATION test map 04.1-03-01):
 *   - CHAT-01: the chat host POSTs the run with the UNCHANGED `RunRequestBody`
 *              (no extra/renamed fields) — the run contract is untouched.
 *   - CHAT-11: no `ai`/`@ai-sdk` import anywhere in the Lab chat path
 *              (single-`ai` gate) — `ChatSurface` is driven only by
 *              messages[]/status/onSubmit.
 *   - persistence: each user + assistant turn is appended to the conversation
 *              thread (mocked store) and a reload re-reads them into messages[].
 *
 * The hook (`useLabConversation`) is the unit under test: it owns the NDJSON
 * transport (reusing `readNdjson`) and exposes chat-shaped state. The
 * `/api/experience-lab/run` fetch is driven by the Plan-01 fixture
 * (`makeMockRunFetch`); the persistence store is a mocked `fetchImpl`-style
 * conversation persistor so no live backend runs.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { makeMockRunFetch } from './labRunStreamFixtures';

// ---------------------------------------------------------------------------
// localStorage shim (jsdom provides one, but guard for headless runs).
// ---------------------------------------------------------------------------

beforeEach(() => {
  try {
    window.localStorage.clear();
  } catch {
    /* no-op */
  }
});

// Imported AFTER any mocks so the hook picks up doubles.
import { useLabConversation } from '../_chat/useLabConversation';
import type { ComposerControlStripValue } from '../_chat/ComposerControlStrip';

const STRIP_VALUE: ComposerControlStripValue = {
  brandId: 'brand-jio',
  artifactType: 'web-ui',
  outputProfile: 'web-desktop',
};

/** A capturing fetch double that records the run POST body, then delegates. */
function makeCapturingRunFetch(scenario: Parameters<typeof makeMockRunFetch>[0]) {
  const captured: { url?: string; body?: Record<string, unknown> } = {};
  const inner = makeMockRunFetch(scenario);
  const fetchImpl = (async (url: string, init?: RequestInit) => {
    captured.url = url;
    if (init?.body) captured.body = JSON.parse(init.body as string);
    return (inner as unknown as (u: string, i?: RequestInit) => Promise<Response>)(url, init);
  }) as unknown as typeof fetch;
  return { fetchImpl, captured };
}

/** An in-memory persistence double mirroring the conversation-route contract. */
function makeMemoryPersistence() {
  const threads = new Map<string, { role: string; text: string }[]>();
  const appendCalls: { sessionId: string; messages: { role: string; text: string }[] }[] = [];
  const persistFetch = (async (_url: string, init?: RequestInit) => {
    const body = JSON.parse((init?.body as string) ?? '{}');
    if (body.action === 'append') {
      appendCalls.push({ sessionId: body.sessionId, messages: body.messages });
      const cur = threads.get(body.sessionId) ?? [];
      const next = [...cur, ...body.messages];
      threads.set(body.sessionId, next);
      return new Response(JSON.stringify({ sessionId: body.sessionId, messages: next }), {
        status: 200,
      });
    }
    // action === 'load'
    const messages = threads.get(body.sessionId) ?? [];
    return new Response(JSON.stringify({ sessionId: body.sessionId, messages }), { status: 200 });
  }) as unknown as typeof fetch;
  return { persistFetch, threads, appendCalls };
}

describe('useLabConversation — chat host drives generation (CHAT-01/11)', () => {
  // -------------------------------------------------------------------------
  // Test 1 (CHAT-01) — submit POSTs the exact RunRequestBody field set
  // -------------------------------------------------------------------------
  it('CHAT-01: POSTs /api/experience-lab/run with the unchanged RunRequestBody fields', async () => {
    const { fetchImpl, captured } = makeCapturingRunFetch('web-run');
    const { persistFetch } = makeMemoryPersistence();

    const { result } = renderHook(() =>
      useLabConversation({
        stripValue: { ...STRIP_VALUE, subBrandConfigId: 'sub-1' },
        sessionId: 'sess-1',
        fetchImpl,
        persistFetchImpl: persistFetch,
      }),
    );

    await act(async () => {
      await result.current.submit('a hero landing page');
    });

    expect(captured.url).toBe('/api/experience-lab/run');
    expect(captured.body).toEqual({
      brandId: 'brand-jio',
      artifactType: 'web-ui',
      outputProfile: 'web-desktop',
      prompt: 'a hero landing page',
      subBrandConfigId: 'sub-1',
    });
    // No extra/renamed fields — exactly the RunRequestBody set.
    expect(Object.keys(captured.body ?? {}).sort()).toEqual(
      ['artifactType', 'brandId', 'outputProfile', 'prompt', 'subBrandConfigId'].sort(),
    );
  });

  it('CHAT-01: omits the optional sub-brand field when unset (conditional spread)', async () => {
    const { fetchImpl, captured } = makeCapturingRunFetch('web-run');
    const { persistFetch } = makeMemoryPersistence();
    const { result } = renderHook(() =>
      useLabConversation({ stripValue: STRIP_VALUE, sessionId: 's', fetchImpl, persistFetchImpl: persistFetch }),
    );
    await act(async () => {
      await result.current.submit('a page');
    });
    expect(captured.body).not.toHaveProperty('subBrandConfigId');
    expect(captured.body).toEqual({
      brandId: 'brand-jio',
      artifactType: 'web-ui',
      outputProfile: 'web-desktop',
      prompt: 'a page',
    });
  });

  it('CHAT-01: includes imageGeneration when the image provider is selected', async () => {
    const { fetchImpl, captured } = makeCapturingRunFetch('web-run');
    const { persistFetch } = makeMemoryPersistence();
    const { result } = renderHook(() =>
      useLabConversation({
        stripValue: { ...STRIP_VALUE, imageProvider: 'auto' },
        sessionId: 's',
        fetchImpl,
        persistFetchImpl: persistFetch,
      }),
    );
    await act(async () => {
      await result.current.submit('a page with generated topic imagery');
    });
    expect(captured.body).toMatchObject({
      imageGeneration: { enabled: true, provider: 'auto', count: 1 },
    });
  });

  // -------------------------------------------------------------------------
  // Test 1b — a web-run renders a user turn + a streaming assistant turn whose
  // parts carry a `data-run-progress` part fed by NDJSON events.
  // -------------------------------------------------------------------------
  it('CHAT-01: decodes the web-run NDJSON stream into a user turn + a run-progress assistant turn', async () => {
    const fetchImpl = makeMockRunFetch('web-run');
    const { persistFetch } = makeMemoryPersistence();
    const { result } = renderHook(() =>
      useLabConversation({ stripValue: STRIP_VALUE, sessionId: 's', fetchImpl, persistFetchImpl: persistFetch }),
    );

    await act(async () => {
      await result.current.submit('a hero landing page');
    });

    const messages = result.current.messages;
    const user = messages.find((m) => m.role === 'user');
    const assistant = messages.find((m) => m.role === 'assistant');
    expect(user).toBeTruthy();
    expect(assistant).toBeTruthy();

    const runPart = (assistant?.parts ?? []).find((p) => p.type === 'data-run-progress') as
      | (Record<string, unknown> | undefined);
    expect(runPart).toBeTruthy();
    // Accumulated the ordered events from the stream.
    expect(Array.isArray(runPart?.events)).toBe(true);
    expect((runPart?.events as unknown[]).length).toBeGreaterThan(0);
    expect(runPart?.outcome).toBe('artifact');
    expect(result.current.status).toBe('ready');
  });

  it('keeps generic gap results generic before flipping the canvas gap card', async () => {
    const encoder = new TextEncoder();
    const fetchImpl = (async () =>
      new Response(
        new ReadableStream<Uint8Array>({
          start(controller) {
            controller.enqueue(
              encoder.encode(
                `${JSON.stringify({
                  kind: 'event',
                  event: { type: 'run-completed', runId: 'r-generic-gap', outcome: 'gap', at: 1 },
                })}\n`,
              ),
            );
            controller.enqueue(encoder.encode(`${JSON.stringify({ kind: 'result', outcome: 'gap' })}\n`));
            controller.close();
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/x-ndjson' } },
      )) as unknown as typeof fetch;
    const { persistFetch } = makeMemoryPersistence();
    const placeArtifact = vi.fn();
    const flipToGapState = vi.fn();

    const { result } = renderHook(() =>
      useLabConversation({
        stripValue: STRIP_VALUE,
        sessionId: 's',
        fetchImpl,
        persistFetchImpl: persistFetch,
        canvasCallbacks: {
          placeArtifact,
          flipToGapState,
        },
      }),
    );

    await act(async () => {
      await result.current.submit('a page');
    });

    expect(flipToGapState).toHaveBeenCalledTimes(1);
    expect(placeArtifact).not.toHaveBeenCalled();
    expect(flipToGapState.mock.calls[0]?.[0]).toMatchObject({ type: 'gap' });
    expect(flipToGapState.mock.calls[0]?.[0]).not.toHaveProperty('foundationGap');
    expect(flipToGapState.mock.calls[0]?.[0]).not.toHaveProperty('componentGap');
  });

  // -------------------------------------------------------------------------
  // Test 2 (CHAT-11) — single-`ai` gate: the hook + chat host import no `ai`.
  // -------------------------------------------------------------------------
  it('CHAT-11: the chat host path imports no `ai` / `@ai-sdk` module (single-ai gate)', () => {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const chatDir = path.resolve(here, '../_chat');
    const files = ['useLabConversation.ts', 'ExperienceLabChat.tsx'];
    for (const f of files) {
      const src = readFileSync(path.join(chatDir, f), 'utf8');
      // Strip line + block comments so anti-pattern documentation in the file
      // header (which legitimately names `ai`/`useChat`) does not trip the gate.
      const code = src
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '');
      // No `import … from 'ai'` / `@ai-sdk/*`, and no `useChat` call.
      expect(code).not.toMatch(/from\s+['"]ai['"]/);
      expect(code).not.toMatch(/from\s+['"]@ai-sdk\//);
      expect(code).not.toMatch(/\buseChat\s*\(/);
    }
  });

  // -------------------------------------------------------------------------
  // Test 3 (persistence) — turns persist + rehydrate across a fresh mount.
  // -------------------------------------------------------------------------
  it('persistence: each turn is appended to the thread and a reload re-reads them into messages[]', async () => {
    const fetchImpl = makeMockRunFetch('web-run');
    const { persistFetch, appendCalls } = makeMemoryPersistence();

    const first = renderHook(() =>
      useLabConversation({ stripValue: STRIP_VALUE, sessionId: 'sess-persist', fetchImpl, persistFetchImpl: persistFetch }),
    );

    await act(async () => {
      await first.result.current.submit('a hero landing page');
    });

    // User + assistant turn both appended through the persistence route.
    const appendedRoles = appendCalls.flatMap((c) => c.messages.map((m) => m.role));
    expect(appendedRoles).toContain('user');
    expect(appendedRoles).toContain('assistant');

    // A fresh mount with the same sessionId rehydrates the thread.
    const second = renderHook(() =>
      useLabConversation({ stripValue: STRIP_VALUE, sessionId: 'sess-persist', fetchImpl, persistFetchImpl: persistFetch }),
    );
    await waitFor(() => {
      expect(second.result.current.messages.length).toBeGreaterThan(0);
    });
    expect(second.result.current.messages.some((m) => m.role === 'user')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// GAP-02 — no-brand submit shows an in-chat ask instead of POSTing a 400 run.
// ---------------------------------------------------------------------------
describe('useLabConversation — GAP-02 ask/plan mode (no resolved brand)', () => {
  /** A capturing run fetch that records whether the run endpoint was hit. */
  function makeRunSpy() {
    const inner = makeMockRunFetch('web-run');
    const calls: { url: string; body?: Record<string, unknown> }[] = [];
    const fetchImpl = (async (url: string, init?: RequestInit) => {
      calls.push({ url, body: init?.body ? JSON.parse(init.body as string) : undefined });
      return (inner as unknown as (u: string, i?: RequestInit) => Promise<Response>)(url, init);
    }) as unknown as typeof fetch;
    const runPosts = () => calls.filter((c) => c.url === '/api/experience-lab/run');
    return { fetchImpl, calls, runPosts };
  }

  it('GAP-02: a no-brand submit does NOT POST /run and surfaces an assistant ask-turn', async () => {
    const { fetchImpl, runPosts } = makeRunSpy();
    const { persistFetch } = makeMemoryPersistence();

    const { result } = renderHook(() =>
      useLabConversation({
        // Empty brandId — the route schema would 400 on `brandId.min(1)`.
        stripValue: { ...STRIP_VALUE, brandId: '' },
        sessionId: 'sess-no-brand',
        hasResolvedBrand: false,
        fetchImpl,
        persistFetchImpl: persistFetch,
      }),
    );

    await act(async () => {
      await result.current.submit('a hero landing page');
    });

    // No POST to the run endpoint — generation never started.
    expect(runPosts()).toHaveLength(0);

    const messages = result.current.messages;
    const user = messages.find((m) => m.role === 'user');
    const assistant = messages.find((m) => m.role === 'assistant');
    expect(user).toBeTruthy();
    expect(assistant).toBeTruthy();

    // The assistant ask-turn is a plain TEXT part (not a run-progress part) that
    // guides the user to pick a brand in the composer strip.
    const parts = assistant?.parts ?? [];
    expect(parts.some((p) => p.type === 'data-run-progress')).toBe(false);
    const text = parts.find((p) => p.type === 'text') as { text?: string } | undefined;
    expect((text?.text ?? '').toLowerCase()).toContain('brand');

    // Status returns to ready, no error surfaced — this is graceful, not a failure.
    expect(result.current.status).toBe('ready');
    expect(result.current.error).toBeNull();
  });

  it('GAP-02: once a brand is resolved, submit POSTs /run normally', async () => {
    const { fetchImpl, runPosts } = makeRunSpy();
    const { persistFetch } = makeMemoryPersistence();

    const { result } = renderHook(() =>
      useLabConversation({
        stripValue: STRIP_VALUE,
        sessionId: 'sess-with-brand',
        hasResolvedBrand: true,
        fetchImpl,
        persistFetchImpl: persistFetch,
      }),
    );

    await act(async () => {
      await result.current.submit('a hero landing page');
    });

    const posts = runPosts();
    expect(posts).toHaveLength(1);
    expect(posts[0].body).toMatchObject({ brandId: 'brand-jio', prompt: 'a hero landing page' });
    // A real run produces a run-progress assistant turn.
    const assistant = result.current.messages.find((m) => m.role === 'assistant');
    expect((assistant?.parts ?? []).some((p) => p.type === 'data-run-progress')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// GAP-03 — seed-once rehydration guard: no duplicate restored turns.
// ---------------------------------------------------------------------------
describe('useLabConversation — GAP-03 seed-once rehydration', () => {
  /** Seed a persistence store with a non-empty thread for `sessionId`. */
  function seededPersistence(sessionId: string) {
    const { persistFetch, threads, appendCalls } = makeMemoryPersistence();
    threads.set(sessionId, [
      { role: 'user', text: 'first message' },
      { role: 'assistant', text: 'first reply' },
    ]);
    return { persistFetch, threads, appendCalls };
  }

  it('GAP-03: a double-invoked rehydration effect (rerender) does not duplicate restored turns', async () => {
    const sessionId = 'sess-dupe';
    const { persistFetch } = seededPersistence(sessionId);
    const fetchImpl = makeMockRunFetch('web-run');

    const { result, rerender } = renderHook(() =>
      useLabConversation({ stripValue: STRIP_VALUE, sessionId, fetchImpl, persistFetchImpl: persistFetch }),
    );

    await waitFor(() => {
      expect(result.current.messages.length).toBeGreaterThan(0);
    });

    // Force re-renders that re-run effects (StrictMode double-invoke analog).
    await act(async () => {
      rerender();
      rerender();
    });
    // Give any racing async loads a chance to (incorrectly) re-seed.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    const ids = result.current.messages.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length); // unique ids, no dupes
    expect(result.current.messages).toHaveLength(2);
    expect(ids).toEqual([`restored-${sessionId}-0`, `restored-${sessionId}-1`]);
  });

  it('GAP-03: persist-then-remount stays single-copy (deterministic restored ids)', async () => {
    const sessionId = 'sess-remount';
    const { persistFetch } = seededPersistence(sessionId);
    const fetchImpl = makeMockRunFetch('web-run');

    const first = renderHook(() =>
      useLabConversation({ stripValue: STRIP_VALUE, sessionId, fetchImpl, persistFetchImpl: persistFetch }),
    );
    await waitFor(() => {
      expect(first.result.current.messages.length).toBe(2);
    });
    first.unmount();

    const second = renderHook(() =>
      useLabConversation({ stripValue: STRIP_VALUE, sessionId, fetchImpl, persistFetchImpl: persistFetch }),
    );
    await waitFor(() => {
      expect(second.result.current.messages.length).toBe(2);
    });
    const ids = second.result.current.messages.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toEqual([`restored-${sessionId}-0`, `restored-${sessionId}-1`]);
  });
});
