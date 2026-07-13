/**
 * useChatCanvasFocus.ts — the chat ↔ canvas two-way selection binding glue
 * (D-02 / CHAT-08). This is the genuinely net-new integration code of Plan 05;
 * everything around it is reuse (PATTERNS "No Analog Found" entry).
 *
 * It binds the tldraw canvas selection to the chat conversation's "focused
 * artifact" in BOTH directions, using the EXISTING reactive side-effect
 * registration already shipped in `ExperienceLabCanvas.tsx` (lines 84-96) — NOT
 * polling (RESEARCH Pattern 4 anti-pattern; T-04.1-14 DoS disposition = accept
 * only because the perf posture is identical to the already-shipped sync).
 *
 *   forward (canvas → chat): selecting an `ArtifactCardShape` resolves its
 *     originating chat turn id, sets `focusedArtifact`, and requests a
 *     scroll-to-turn so the conversation jumps to the message that produced it.
 *   reverse (chat → canvas): `focusOnCanvas(turnId)` maps the turn → its linked
 *     shape id and calls `editor.select(shapeId)` + `editor.zoomToSelection()`.
 *
 * Turn ↔ shape linkage: the chat hook is the single canvas caller (D-12), so it
 * also owns the linkage. When a run completes and a card is placed, the chat
 * calls `linkArtifact(turnId, shapeId)` to register the association; the binding
 * keeps a bidirectional map so neither direction has to mutate a frozen contract
 * (no new shape prop, no `runStream.ts`/`workflow.ts` change — D-10).
 *
 * The focused artifact ONLY seeds the next run's iterate target (T-04.1-13
 * Tampering = mitigate): the run still posts the UNCHANGED, `.strict()`-validated
 * `RunRequestBody`. The binding grants no new trust and no new fields.
 *
 * Isolation: no `(builder)` / `ExperienceCanvas` import; no `ai` / `@ai-sdk`
 * import. Only the `tldraw` `Editor` + the Lab's own shape-type constant.
 */

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Editor, TLShapeId } from 'tldraw';
import { ARTIFACT_CARD_SHAPE_TYPE } from '../_canvas/shapes/ArtifactCardShape';
import type { ChatMessage } from '@oneui/ui-internal/components/ChatSurface/ChatSurface.shared';

/** The focused-artifact descriptor surfaced to the chat indicator (UI-SPEC). */
export interface FocusedArtifact {
  /** The chat turn (assistant message) id this artifact descends from. */
  turnId: string;
  /** The tldraw shape id of the artifact card on the canvas. */
  shapeId: string;
  /** Human label for the indicator: `Editing: {name} · Run #{n}`. */
  name: string;
  /** The 1-based Run #N the artifact belongs to (for the indicator copy). */
  runNumber: number;
}

/** A single registered turn ↔ shape ↔ label association (D-12 linkage). */
export interface ArtifactLink {
  turnId: string;
  shapeId: string;
  name: string;
  runNumber: number;
}

export interface UseChatCanvasFocusOptions {
  /** The live chat transcript (used to validate a turn still exists). */
  messages: ChatMessage[];
  /** Request the chat scroll its transcript to a turn (caller owns the DOM). */
  scrollToTurn: (turnId: string) => void;
}

export interface UseChatCanvasFocusResult {
  /** The artifact currently in focus, or `null` when nothing is focused. */
  focusedArtifact: FocusedArtifact | null;
  /** reverse binding: select + zoom the canvas shape linked to a turn. */
  focusOnCanvas: (turnId: string) => void;
  /** Clear the chat-side focus (the `Clear focus` action). */
  clearFocus: () => void;
  /**
   * Register a turn ↔ shape association. Called by the chat hook (the single
   * canvas caller, D-12) when a run completes and its card is placed.
   */
  linkArtifact: (link: ArtifactLink) => void;
}

/** Narrow an unknown id to a tldraw shape id (it is a branded string). */
function asShapeId(id: string): TLShapeId {
  return id as unknown as TLShapeId;
}

/**
 * Two-way chat ↔ canvas selection binding (D-02 / CHAT-08).
 *
 * @param editor   the Lab's scoped tldraw editor (null until the canvas mounts)
 * @param options  `{ messages, scrollToTurn }`
 */
export function useChatCanvasFocus(
  editor: Editor | null,
  options: UseChatCanvasFocusOptions,
): UseChatCanvasFocusResult {
  const { messages, scrollToTurn } = options;

  const [focusedArtifact, setFocusedArtifact] = useState<FocusedArtifact | null>(null);

  // Bidirectional linkage map. Refs (not state) so the reactive `sync` handler
  // always reads the freshest associations without re-registering the handler.
  const shapeToLink = useRef<Map<string, ArtifactLink>>(new Map());
  const turnToLink = useRef<Map<string, ArtifactLink>>(new Map());

  // Keep `scrollToTurn` / `messages` in refs so the side-effect handler stays
  // registered once (no re-subscribe churn) while always seeing fresh values.
  const scrollToTurnRef = useRef(scrollToTurn);
  scrollToTurnRef.current = scrollToTurn;
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  /** Register a turn ↔ shape association (D-12 linkage from the chat hook). */
  const linkArtifact = useCallback((link: ArtifactLink) => {
    shapeToLink.current.set(link.shapeId, link);
    turnToLink.current.set(link.turnId, link);
  }, []);

  /**
   * forward (canvas → chat): resolve the single selected shape; if it is an
   * `ArtifactCardShape` with a registered turn linkage, focus that turn and
   * request a scroll-to-turn. A non-artifact / multi / empty selection clears.
   */
  const syncSelectionToChat = useCallback((ed: Editor) => {
    const selected = ed.getSelectedShapeIds();
    if (selected.length !== 1) {
      setFocusedArtifact(null);
      return;
    }
    const shapeId = selected[0] as unknown as string;
    const shape = ed.getShape(asShapeId(shapeId));
    if (!shape || (shape.type as string) !== ARTIFACT_CARD_SHAPE_TYPE) {
      setFocusedArtifact(null);
      return;
    }
    const link = shapeToLink.current.get(shapeId);
    if (!link) {
      setFocusedArtifact(null);
      return;
    }
    setFocusedArtifact({
      turnId: link.turnId,
      shapeId: link.shapeId,
      name: link.name,
      runNumber: link.runNumber,
    });
    scrollToTurnRef.current(link.turnId);
  }, []);

  // -------------------------------------------------------------------------
  // Reactive selection observation (NO polling) — mirrors ExperienceLabCanvas
  // 84-96: `registerAfterChangeHandler('instance_page_state'|'shape', sync)`.
  // The handlers are unregistered on cleanup (no leak, T-04.1-14).
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!editor) return;
    const sync = () => syncSelectionToChat(editor);
    sync();
    const offPageState = editor.sideEffects.registerAfterChangeHandler(
      'instance_page_state',
      sync,
    );
    const offShape = editor.sideEffects.registerAfterChangeHandler('shape', sync);
    return () => {
      offPageState();
      offShape();
    };
  }, [editor, syncSelectionToChat]);

  /**
   * reverse (chat → canvas): map a turn → its linked shape and select + zoom it.
   * No-op when the editor is unmounted or the turn has no linked shape.
   */
  const focusOnCanvas = useCallback(
    (turnId: string) => {
      if (!editor) return;
      const link = turnToLink.current.get(turnId);
      if (!link) return;
      editor.select(asShapeId(link.shapeId));
      editor.zoomToSelection();
    },
    [editor],
  );

  /** Clear the chat-side focus (the `Clear focus` action). */
  const clearFocus = useCallback(() => {
    setFocusedArtifact(null);
  }, []);

  return useMemo(
    () => ({ focusedArtifact, focusOnCanvas, clearFocus, linkArtifact }),
    [focusedArtifact, focusOnCanvas, clearFocus, linkArtifact],
  );
}
