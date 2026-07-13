/**
 * selectionBinding.test.tsx — Plan 05 fill (Wave 3).
 *
 * Owning requirements (VALIDATION test map 04.1-05-01, 04.1-05-02):
 *   - CHAT-08: two-way chat ↔ canvas selection binding.
 *              - Selecting an artifact card on the canvas focuses its chat turn
 *                (reactive `registerAfterChangeHandler`, NO polling) with proper
 *                cleanup on unmount.
 *              - Reverse: `focusOnCanvas(turnId)` selects + zooms the shape.
 *              - The focused artifact seeds the iterate target without changing
 *                the run body.
 *              - Focus indicator uses the Focus Halo via `--Surface-Halo-Gap`.
 *
 * tldraw is DOM-heavy and brittle to boot in jsdom (mirrors `canvas.test.tsx`),
 * so the binding is exercised against a lightweight in-memory fake editor that
 * implements exactly the `Editor` surface the hook touches — including the REAL
 * reactive `sideEffects.registerAfterChangeHandler` registration/cleanup
 * contract, so the no-poll + cleanup behaviour under test is the production path;
 * only the canvas-coordinate rendering is stubbed. The hook drives the REAL
 * `ARTIFACT_CARD_SHAPE_TYPE` constant.
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { makeMockRunFetch } from './labRunStreamFixtures';
import { ARTIFACT_CARD_SHAPE_TYPE } from '../_canvas/shapes/ArtifactCardShape';
import { useChatCanvasFocus } from '../_chat/useChatCanvasFocus';
import type { ChatMessage } from '@oneui/ui-internal/components/ChatSurface/ChatSurface.shared';

void makeMockRunFetch;

// ---------------------------------------------------------------------------
// Lightweight in-memory fake of the tldraw Editor surface the binding touches.
// Implements the REAL reactive side-effect registration contract so the
// no-poll + cleanup behaviour is exercised against the production code path.
// ---------------------------------------------------------------------------

interface FakeShape {
  id: string;
  type: string;
  props: Record<string, unknown>;
}

type ChangeType = 'instance_page_state' | 'shape';

function createFakeEditor(initial: FakeShape[] = []) {
  const shapes = new Map<string, FakeShape>();
  for (const s of initial) shapes.set(s.id, s);
  let selected: string[] = [];
  const handlers: Record<ChangeType, Array<() => void>> = {
    instance_page_state: [],
    shape: [],
  };

  const fire = (type: ChangeType) => {
    for (const h of handlers[type]) h();
  };

  return {
    _shapes: shapes,
    getShape: (id: string) => shapes.get(id),
    getSelectedShapeIds: () => selected,
    /** Test helper: drive a selection + fire the reactive page-state handler. */
    _setSelection(ids: string[]) {
      selected = ids;
      fire('instance_page_state');
    },
    select: vi.fn((id: string) => {
      selected = [id];
    }),
    zoomToSelection: vi.fn(),
    sideEffects: {
      registerAfterChangeHandler: (type: ChangeType, handler: () => void) => {
        handlers[type].push(handler);
        // Return the unregister fn (the real tldraw contract).
        return () => {
          handlers[type] = handlers[type].filter((h) => h !== handler);
        };
      },
    },
    /** Test introspection: how many handlers are still registered. */
    _handlerCount() {
      return handlers.instance_page_state.length + handlers.shape.length;
    },
  };
}

const ARTIFACT_SHAPE: FakeShape = {
  id: 'shape:artifact-1',
  type: ARTIFACT_CARD_SHAPE_TYPE,
  props: { ir: { artifactType: 'web-ui' } },
};

const MESSAGES: ChatMessage[] = [
  { id: 'user-1', role: 'user', parts: [{ type: 'text', text: 'a hero landing page' }] },
  { id: 'assistant-1', role: 'assistant', parts: [{ type: 'data-run-progress', events: [] }] },
];

describe('selectionBinding — chat ↔ canvas focus (CHAT-08)', () => {
  // -------------------------------------------------------------------------
  // forward: selecting an artifact card focuses its chat turn (no polling).
  // -------------------------------------------------------------------------
  it('CHAT-08: selecting an artifact card focuses its chat turn via registerAfterChangeHandler', () => {
    const editor = createFakeEditor([ARTIFACT_SHAPE]);
    const scrollToTurn = vi.fn();
    const { result } = renderHook(() =>
      useChatCanvasFocus(editor as never, { messages: MESSAGES, scrollToTurn }),
    );

    // Register the turn ↔ shape linkage the chat hook owns (D-12).
    act(() => {
      result.current.linkArtifact({
        turnId: 'assistant-1',
        shapeId: ARTIFACT_SHAPE.id,
        name: 'web-ui',
        runNumber: 1,
      });
    });

    // Selecting the artifact card fires the reactive page-state handler.
    act(() => {
      editor._setSelection([ARTIFACT_SHAPE.id]);
    });

    expect(result.current.focusedArtifact).toEqual({
      turnId: 'assistant-1',
      shapeId: ARTIFACT_SHAPE.id,
      name: 'web-ui',
      runNumber: 1,
    });
    // It requested a scroll to the originating turn.
    expect(scrollToTurn).toHaveBeenCalledWith('assistant-1');

    // Clearing the selection clears the focus.
    act(() => {
      editor._setSelection([]);
    });
    expect(result.current.focusedArtifact).toBeNull();
  });

  // -------------------------------------------------------------------------
  // reverse: focusOnCanvas selects + zooms the linked shape.
  // -------------------------------------------------------------------------
  it('CHAT-08: focusOnCanvas(turnId) selects + zooms the linked shape (reverse binding)', () => {
    const editor = createFakeEditor([ARTIFACT_SHAPE]);
    const { result } = renderHook(() =>
      useChatCanvasFocus(editor as never, { messages: MESSAGES, scrollToTurn: vi.fn() }),
    );
    act(() => {
      result.current.linkArtifact({
        turnId: 'assistant-1',
        shapeId: ARTIFACT_SHAPE.id,
        name: 'web-ui',
        runNumber: 1,
      });
    });

    act(() => {
      result.current.focusOnCanvas('assistant-1');
    });

    expect(editor.select).toHaveBeenCalledWith(ARTIFACT_SHAPE.id);
    expect(editor.zoomToSelection).toHaveBeenCalledTimes(1);
  });

  // -------------------------------------------------------------------------
  // cleanup: the after-change handlers unregister on unmount (no leak/no poll).
  // -------------------------------------------------------------------------
  it('CHAT-08: the after-change handler is unregistered on unmount (no leak / no polling)', () => {
    const editor = createFakeEditor([ARTIFACT_SHAPE]);
    const { unmount } = renderHook(() =>
      useChatCanvasFocus(editor as never, { messages: MESSAGES, scrollToTurn: vi.fn() }),
    );
    // Both 'instance_page_state' + 'shape' handlers are registered.
    expect(editor._handlerCount()).toBe(2);
    unmount();
    // Cleanup unregisters both — no leaked subscriptions, no polling timers.
    expect(editor._handlerCount()).toBe(0);

    // The binding source uses reactive registration, NOT polling.
    const here = path.dirname(fileURLToPath(import.meta.url));
    const src = readFileSync(
      path.resolve(here, '../_chat/useChatCanvasFocus.ts'),
      'utf8',
    );
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    expect(code).not.toMatch(/setInterval/);
    expect(code).not.toMatch(/setTimeout\s*\([^)]*poll/i);
    expect(code).toMatch(/registerAfterChangeHandler/);
  });

  // -------------------------------------------------------------------------
  // iterate target: the focused artifact does NOT change the run body — it only
  // identifies the turn/shape to iterate on (T-04.1-13).
  // -------------------------------------------------------------------------
  it('CHAT-08: the focused artifact seeds the iterate target without changing the run body', async () => {
    const editor = createFakeEditor([ARTIFACT_SHAPE]);
    const { result } = renderHook(() =>
      useChatCanvasFocus(editor as never, { messages: MESSAGES, scrollToTurn: vi.fn() }),
    );
    act(() => {
      result.current.linkArtifact({
        turnId: 'assistant-1',
        shapeId: ARTIFACT_SHAPE.id,
        name: 'web-ui',
        runNumber: 1,
      });
      editor._setSelection([ARTIFACT_SHAPE.id]);
    });

    // The focus state carries ONLY identifiers (turn/shape/name/run) — no run
    // body fields (brandId/artifactType/outputProfile/prompt/subBrandConfigId).
    const focus = result.current.focusedArtifact;
    expect(focus).not.toBeNull();
    const RUN_BODY_FIELDS = [
      'brandId',
      'artifactType',
      'outputProfile',
      'prompt',
      'subBrandConfigId',
    ];
    for (const field of RUN_BODY_FIELDS) {
      expect(focus).not.toHaveProperty(field);
    }
    expect(Object.keys(focus ?? {}).sort()).toEqual(
      ['name', 'runNumber', 'shapeId', 'turnId'].sort(),
    );
  });

  // -------------------------------------------------------------------------
  // Focus Halo: the indicator styles use --Surface-Halo-Gap, never --Surface-Main.
  // -------------------------------------------------------------------------
  it('CHAT-08: the focus indicator uses --Surface-Halo-Gap (Focus Halo pattern)', () => {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const css = readFileSync(
      path.resolve(here, '../_chat/ExperienceLabChat.module.css'),
      'utf8',
    );
    // The focus halo on the clear/focus actions uses the surface-adaptive gap
    // token; it must NEVER hardcode the page background --Surface-Main as the gap.
    expect(css).toMatch(/--Surface-Halo-Gap/);
    const haloRules = css
      .split('}')
      .filter((rule) => /focus-visible/.test(rule));
    for (const rule of haloRules) {
      // A focus-visible rule may reference --Surface-Main ONLY as the inline
      // fallback of --Surface-Halo-Gap, never as the primary gap colour.
      if (/--Surface-Main/.test(rule)) {
        expect(rule).toMatch(/var\(\s*--Surface-Halo-Gap\s*,\s*var\(\s*--Surface-Main/);
      }
    }
  });
});
