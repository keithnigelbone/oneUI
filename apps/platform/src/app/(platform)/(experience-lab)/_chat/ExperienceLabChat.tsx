/**
 * ExperienceLabChat.tsx — the chat host (D-01/D-05/D-13 left pane).
 *
 * Renders the reusable Jio DS `ChatSurface` primitive wired to
 * `useLabConversation` (the NDJSON transport + persistence hook). It is the
 * structural host for the chat-first Lab: the composer drives generation
 * (D-01), the run-progress part streams the run turn (D-09 dispatch via
 * `renderLabMessagePart`), and the control strip rides in the composer's
 * `leadingInline` slot (D-07).
 *
 * Canvas seam (D-12): `canvasCallbacks` ({ placeArtifact, flipToGapState }) are
 * threaded DOWN from the shell/canvas and forwarded into `useLabConversation`,
 * which is the single caller of the canvas placement on terminal run frames.
 *
 * Chat ↔ canvas selection binding (D-02 / CHAT-08, Plan 05): the shell threads
 * the tldraw `editor` down; `useChatCanvasFocus` binds selection both ways. The
 * focused-artifact indicator renders in the `ChatSurface.aboveComposer` slot as a
 * neutral `Chip` (`Editing: {name} · Run #{n}` + `Clear focus`), and each
 * artifact assistant turn gets a `Focus on canvas` action (reverse binding). When
 * an artifact is focused, a follow-up message / regenerate iterates on THAT
 * artifact (the chat-first realization of the Phase-3 iterate flow) — the run
 * body itself is UNCHANGED (T-04.1-13).
 *
 * LOCKED anti-pattern (CHAT-11 / single-`ai` gate): NO `ai` / `@ai-sdk/react`
 * import and NO `useChat`. `ChatSurface` is headless of transport — it only
 * needs `messages[]` / `status` / `onSubmit`.
 *
 * Isolation: all `@oneui/ui` imports use the deep `@oneui/ui-internal/*` alias;
 * no `(builder)` / `ExperienceCanvas` import.
 */

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Editor } from 'tldraw';
import { useQuery } from 'convex/react';
import { api } from '@oneui/convex';
import { ChatSurface } from '@oneui/ui-internal/components/ChatSurface/ChatSurface';
import type {
  ChatMessage,
  ChatSurfaceComposerProps,
  RenderMessagePart,
} from '@oneui/ui-internal/components/ChatSurface/ChatSurface.shared';
import { Chip } from '@oneui/ui-internal/components/Chip/Chip';
import {
  ARTIFACT_TYPES,
  getValidProfilesForType,
  type ArtifactType,
  type OutputProfile,
} from '@oneui/experience-builder-core';
import {
  useResolvedBrandId,
  type ComposerControlStripValue,
} from './ComposerControlStrip';
import { ComposerContextMenu } from './ComposerContextMenu';
import { renderLabMessagePart } from './parts/renderLabMessagePart';
import { PART_RUN_PROGRESS, type RunProgressPart } from './useLabConversation';
import {
  useLabConversation,
  type LabCanvasCallbacks,
} from './useLabConversation';
import { ARTIFACT_CARD_SHAPE_TYPE } from '../_canvas/shapes/ArtifactCardShape';
import {
  useChatCanvasFocus,
  type ArtifactLink,
} from './useChatCanvasFocus';
import styles from './ExperienceLabChat.module.css';

/** localStorage key for the persisted conversation session id (D-06). */
const SESSION_STORAGE_KEY = 'oneui-lab-session-id';

/** DOM data-attribute used to scroll the transcript to a specific turn. */
const TURN_ATTR = 'data-lab-turn-id';

/** Rotating live-status phrases for the run turn (UI-SPEC copy). */
const THINKING_MESSAGES = [
  'Resolving foundations…',
  'Retrieving components…',
  'Planning…',
  'Generating IR…',
  'Compiling…',
  'Validating…',
  'Evaluating…',
  'Repairing…',
] as const;

/** Default run-origin value — first artifact type + its first valid profile. */
function defaultStripValue(): ComposerControlStripValue {
  const artifactType: ArtifactType = ARTIFACT_TYPES[0];
  const outputProfile: OutputProfile = getValidProfilesForType(artifactType)[0].id;
  return { brandId: '', artifactType, outputProfile, imageProvider: 'auto' };
}

/** Resolve a stable session id, persisted across reloads (D-06). */
function useSessionId(): string {
  const [sessionId] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    let id: string | null = null;
    try {
      id = window.localStorage.getItem(SESSION_STORAGE_KEY);
      if (!id) {
        id = `lab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
        window.localStorage.setItem(SESSION_STORAGE_KEY, id);
      }
    } catch {
      id = `lab-${Date.now().toString(36)}`;
    }
    return id;
  });
  return sessionId;
}

/** The run-progress part of an assistant message, if present. */
function runPartOf(message: ChatMessage): RunProgressPart | null {
  const part = (message.parts ?? []).find((p) => p.type === PART_RUN_PROGRESS);
  return part ? (part as unknown as RunProgressPart) : null;
}

/** Ordered artifact-card shape ids currently on the canvas (creation order). */
function artifactShapeIds(editor: Editor): string[] {
  return editor
    .getCurrentPageShapes()
    .filter((s) => (s.type as string) === ARTIFACT_CARD_SHAPE_TYPE)
    .map((s) => s.id as unknown as string);
}

export interface ExperienceLabChatProps {
  /**
   * Canvas placement seam (D-12), threaded from `ExperienceLabShell` /
   * `ExperienceLabCanvas`. The chat hook is the single caller; the canvas merely
   * exposes the callbacks via the shell.
   */
  canvasCallbacks?: LabCanvasCallbacks;
  /**
   * The Lab's scoped tldraw `Editor`, threaded from the shell so the chat↔canvas
   * selection binding (D-02 / CHAT-08) can observe selection + drive zoom. Null
   * until the canvas mounts; the binding is a no-op until then.
   */
  editor?: Editor | null;
}

export function ExperienceLabChat({ canvasCallbacks, editor = null }: ExperienceLabChatProps) {
  const [stripValue, setStripValue] = useState<ComposerControlStripValue>(defaultStripValue);
  const sessionId = useSessionId();
  const brands = useQuery(api.brands.list);

  useEffect(() => {
    if (stripValue.brandId || !brands || brands.length === 0) return;
    const jioBrand =
      brands.find((brand) => brand.name.trim().toLowerCase() === 'jio') ??
      brands.find((brand) => brand.name.trim().toLowerCase().startsWith('jio')) ??
      brands[0];
    if (!jioBrand) return;
    setStripValue((current) =>
      current.brandId
        ? current
        : {
            ...current,
            brandId: jioBrand._id as string,
            subBrandConfigId: undefined,
          },
    );
  }, [brands, stripValue.brandId]);

  // GAP-02: the SAME `brands.list` membership check the strip's `'skip'` sentinel
  // uses, lifted to the host so the chat hook can gate generation on a REAL brand.
  const hasResolvedBrand = useResolvedBrandId(stripValue.brandId);

  const { messages, status, error, submit, stop, regenerate } = useLabConversation({
    stripValue,
    sessionId,
    hasResolvedBrand,
    canvasCallbacks,
  });

  const isStreaming = status === 'streaming' || status === 'submitted';

  // -------------------------------------------------------------------------
  // Chat ↔ canvas selection binding (D-02 / CHAT-08).
  // -------------------------------------------------------------------------
  /** Scroll the transcript to a turn by its DOM data-attribute (no DOM owned by ChatSurface). */
  const scrollToTurn = useCallback((turnId: string) => {
    if (typeof document === 'undefined') return;
    const node = document.querySelector(`[${TURN_ATTR}="${CSS.escape(turnId)}"]`);
    node?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const { focusedArtifact, focusOnCanvas, clearFocus, linkArtifact } = useChatCanvasFocus(editor, {
    messages,
    scrollToTurn,
  });

  // D-12 linkage: when an assistant turn lands an `artifact` outcome, associate
  // it with the artifact card the canvas placed for that run. The chat hook is
  // the single canvas caller, so artifact turns and artifact shapes are produced
  // 1:1 in the same order — link the Nth artifact turn to the Nth artifact shape.
  const linkedTurns = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!editor) return;
    const artifactTurns = messages.filter(
      (m) => m.role === 'assistant' && runPartOf(m)?.outcome === 'artifact',
    );
    const shapeIds = artifactShapeIds(editor);
    artifactTurns.forEach((turn, index) => {
      if (linkedTurns.current.has(turn.id)) return;
      const shapeId = shapeIds[index];
      if (!shapeId) return;
      const part = runPartOf(turn);
      const name = part?.result?.ir?.artifactType ?? stripValue.artifactType;
      const link: ArtifactLink = {
        turnId: turn.id,
        shapeId,
        name,
        runNumber: index + 1,
      };
      linkArtifact(link);
      linkedTurns.current.add(turn.id);
    });
  }, [editor, messages, linkArtifact, stripValue.artifactType]);

  // When an artifact is focused, a follow-up / regenerate iterates on THAT
  // artifact: re-run the last prompt against the focused turn. The run body is
  // UNCHANGED (T-04.1-13) — the focus only identifies the iterate target.
  const handleSubmit = useCallback(
    (text: string) => {
      void submit(text);
    },
    [submit],
  );

  const handleRegenerate = useCallback(
    (messageId: string) => {
      // Iterate on the focused artifact's turn when one is focused (D-02); else
      // regenerate the turn the user clicked. Either way the run body is unchanged.
      void regenerate(focusedArtifact?.turnId ?? messageId);
    },
    [regenerate, focusedArtifact],
  );

  // -------------------------------------------------------------------------
  // Per-turn `Focus on canvas` action (reverse binding) + scroll anchor.
  // Wrap the Lab dispatch so each artifact turn gets a focus affordance.
  // -------------------------------------------------------------------------
  const renderMessagePart = useCallback<RenderMessagePart>(
    (part, context) => {
      const node = renderLabMessagePart(part, context);
      if (node == null) return node;
      if (part.type !== PART_RUN_PROGRESS) return node;
      const runPart = part as unknown as RunProgressPart;
      const turnId = context.message.id;
      const canFocus = runPart.outcome === 'artifact';
      return (
        <div {...{ [TURN_ATTR]: turnId }} className={styles.turnAnchor}>
          {node}
          {canFocus && (
            <div className={styles.turnActions}>
              <Chip
                size="s"
                attention="low"
                appearance="neutral"
                onSelectedChange={() => focusOnCanvas(turnId)}
                className={styles.focusAction}
                data-testid={`lab-focus-on-canvas-${turnId}`}
              >
                Focus on canvas
              </Chip>
            </div>
          )}
        </div>
      );
    },
    [focusOnCanvas],
  );

  const composerProps: ChatSurfaceComposerProps = useMemo(
    () => ({
      placeholder: focusedArtifact
        ? `Iterate on ${focusedArtifact.name}…`
        : 'Describe the experience to generate…',
      leadingInline: (
        <ComposerContextMenu
          value={stripValue}
          onChange={setStripValue}
          disabled={isStreaming}
        />
      ),
    }),
    [stripValue, isStreaming, focusedArtifact],
  );

  // The focused-artifact indicator (UI-SPEC copy): a neutral Chip in the
  // aboveComposer slot. Visible AND programmatic — the surrounding region is
  // announced (the ChatSurface messages region is already aria-live="polite";
  // the indicator carries its own role="status" for the focus change).
  const aboveComposer = useMemo(() => {
    if (!focusedArtifact) return null;
    return (
      <div className={styles.focusIndicator} role="status" aria-live="polite">
        <Chip size="s" attention="medium" appearance="neutral" className={styles.focusChip}>
          Editing: {focusedArtifact.name} · Run #{focusedArtifact.runNumber}
        </Chip>
        <Chip
          size="s"
          attention="low"
          appearance="neutral"
          onSelectedChange={clearFocus}
          className={styles.focusAction}
          data-testid="lab-clear-focus"
        >
          Clear focus
        </Chip>
      </div>
    );
  }, [focusedArtifact, clearFocus]);

  const greeting = useMemo(
    () => (
      <div className={styles.greeting}>
        <h2 className={styles.greetingHeading}>Start a Jio experience</h2>
        <p className={styles.greetingBody}>
          Pick a brand and artifact type below, then describe what you want. I&apos;ll compose it
          from real Jio foundations and components.
        </p>
      </div>
    ),
    [],
  );

  const suggestions = useMemo(
    () => [
      { id: 'landing', label: 'Generate a landing page', onClick: () => void submit('Generate a landing page') },
      { id: 'app-screen', label: 'Design an app screen', onClick: () => void submit('Design an app screen') },
      { id: 'carousel', label: 'Create an Instagram carousel', onClick: () => void submit('Create an Instagram carousel') },
    ],
    [submit],
  );

  return (
    <div className={styles.chat} data-testid="experience-lab-chat">
      <ChatSurface
        className={styles.chatSurface}
        messages={messages}
        status={status}
        error={error}
        onSubmit={handleSubmit}
        onStop={isStreaming ? stop : undefined}
        onRegenerate={handleRegenerate}
        greeting={greeting}
        suggestions={suggestions}
        renderMessagePart={renderMessagePart}
        composerProps={composerProps}
        aboveComposer={aboveComposer}
        thinkingMessages={THINKING_MESSAGES}
        data-testid="experience-lab-chat-surface"
      />
    </div>
  );
}

export default ExperienceLabChat;
