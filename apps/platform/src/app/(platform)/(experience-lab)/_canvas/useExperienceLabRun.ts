/**
 * useExperienceLabRun.ts
 *
 * The canvas-side placement reducer for the chat-first Experience Lab. In the
 * chat-first model (D-01/D-13) the CHAT hook (`useLabConversation`) owns the run
 * POST + NDJSON decode; this hook owns only the CANVAS side — it exposes the two
 * placement callbacks the chat hook invokes on a terminal run frame (D-12):
 *
 *   - `placeArtifact(result)` — on a VALID run, create (or reuse) a "Run #N"
 *     frame and place the linked artifact card inside it (CANVAS-04 / D-07).
 *   - `flipToGapState(gapEvent, result)` — on a REAL gap (a gap WITHOUT a
 *     campaignPlan), drop the typed foundation-profile / component-reference gap
 *     card and produce NO artifact card (FND-03 / REG-03 short-circuit).
 *
 * These are surfaced as a single `canvasCallbacks` object the shell threads up to
 * `ExperienceLabChat` → `useLabConversation` (the single caller). The
 * `PromptCardShape` is retired as the run entry surface (D-01) — placement now
 * anchors to the canvas viewport rather than a selected prompt card.
 *
 * The tldraw document can persist locally via the canvas persistence key, while
 * runs/IR persist server-side via the plan-04 Convex layer.
 */

import { useCallback, useMemo, useState } from 'react';
import { createShapeId, type Editor } from 'tldraw';
import {
  irToCompositionSpec,
  type CompositionSpecT,
  type JioExperienceIRT,
  type ExperienceBuilderEventT,
} from '@oneui/experience-builder-core';
import type { AgentTraceT } from '@oneui/experience-builder-agents';
import type { RunResultFrame } from './runStream';
import { ARTIFACT_CARD_SHAPE_TYPE, type ArtifactCardShape } from './shapes/ArtifactCardShape';
import {
  FOUNDATION_PROFILE_CARD_SHAPE_TYPE,
  type FoundationProfileCardShape,
} from './shapes/FoundationProfileCardShape';
import {
  COMPONENT_REFERENCE_CARD_SHAPE_TYPE,
  type ComponentReferenceCardShape,
} from './shapes/ComponentReferenceCardShape';

/**
 * Canvas layout constants for the Lab run frame and cards (WR-06).
 *
 * These tldraw shape coordinates are tightly coupled (the artifact offset must
 * sit inside the frame; successive runs step by the frame width + gutter), so
 * they live in one named block as the single source of truth rather than as
 * scattered inline literals. They are tldraw page-space units, NOT CSS tokens,
 * so `check:literals` does not (and should not) govern them.
 */
const CANVAS = {
  /** Run frame width / height. */
  FRAME_W: 360,
  FRAME_H: 320,
  /** Horizontal step between successive run frames (frame width + gutter). */
  FRAME_STEP_X: 460,
  /** Run anchor inset from the viewport top-left. */
  FRAME_ANCHOR_X: 120,
  FRAME_ANCHOR_Y: 120,
  /** Artifact card size + its offset within the run frame. */
  ARTIFACT_W: 360,
  ARTIFACT_H: 320,
  ARTIFACT_OFFSET_X: 0,
  ARTIFACT_OFFSET_Y: 0,
  /** Gap card size + its vertical offset below the run anchor. */
  GAP_CARD_W: 340,
  GAP_CARD_H_FOUNDATION: 220,
  GAP_CARD_H_COMPONENT: 200,
  GAP_CARD_OFFSET_Y: 64,
} as const;

/** The canvas placement seam (D-12) — what the chat hook invokes on terminal. */
export interface LabCanvasCallbacks {
  /** Create a pending artifact card immediately when a run starts. */
  beginArtifact: () => string | null;
  /** Place a produced artifact card inside a Run #N frame (artifact outcome). */
  placeArtifact: (result: RunResultFrame, pendingArtifactId?: string | null) => void;
  /** Flip the canvas to a typed gap card for a REAL gap (no campaignPlan). */
  flipToGapState: (
    gap: ExperienceBuilderEventT,
    result: RunResultFrame | null,
    pendingArtifactId?: string | null,
  ) => void;
}

/** Count existing Run frames so the next is "Run #N". */
function nextRunNumber(editor: Editor): number {
  const frames = editor
    .getCurrentPageShapes()
    .filter((s) => s.type === 'frame' && typeof (s.props as { name?: unknown }).name === 'string')
    .filter((s) => ((s.props as { name?: string }).name ?? '').startsWith('Run #'));
  return frames.length + 1;
}

/**
 * Resolve the placement anchor (x, y) for the next run. Anchors to the top-left
 * of the current viewport, stepping right per existing Run frame so successive
 * runs auto-arrange instead of stacking (D-03). Prompt-card-free (D-01).
 */
function runAnchor(editor: Editor): { x: number; y: number } {
  const bounds = editor.getViewportPageBounds();
  const runIndex = nextRunNumber(editor) - 1;
  // Step right by a frame-width-plus-gutter per existing run.
  return {
    x: bounds.x + CANVAS.FRAME_ANCHOR_X + runIndex * CANVAS.FRAME_STEP_X,
    y: bounds.y + CANVAS.FRAME_ANCHOR_Y,
  };
}

export function useExperienceLabRun(editor: Editor | null) {
  // Retained for back-compat with any caller observing run liveness; the chat
  // hook owns the authoritative run status now.
  const [isRunning, setIsRunning] = useState(false);

  /**
   * RUN START: create a "Run #N" frame and pending artifact card immediately so
   * the canvas gives feedback while the agents work.
   */
  const beginArtifact = useCallback((): string | null => {
    if (!editor) return null;
    return placeArtifactShape(editor, null, runAnchor(editor), emptyPreviewSeed());
  }, [editor]);

  /**
   * VALID run: create (or reuse) a "Run #N" frame at the viewport anchor and
   * place the linked artifact card inside it (CANVAS-04 / D-07). The live preview
   * seed comes from the terminal result frame; the card starts at the cheap
   * `thumbnail` lifecycle and escalates on focus (PREV-03).
   */
  const placeArtifact = useCallback(
    (result: RunResultFrame, pendingArtifactId?: string | null): void => {
      if (!editor) return;
      const preview = {
        previewUrl: result.previewUrl ?? '',
        previewSameOrigin: result.previewSameOrigin ?? false,
        thumbnailUrl: result.thumbnailUrl ?? '',
        compositionSpec: result.compositionSpec ?? null,
        variantGroupId: result.variantGroupId ?? '',
        agentTrace: result.agentTrace ?? null,
        previewErrorMessage:
          result.previewError?.message ??
          (result.ir ? '' : 'Generation did not produce a shippable preview.'),
        evaluationComposite: result.evaluation?.composite ?? 0,
        previewVerification: result.previewVerification ?? null,
      };
      if (pendingArtifactId) {
        const existing = editor.getShape(pendingArtifactId as never);
        if (existing && (existing.type as string) === ARTIFACT_CARD_SHAPE_TYPE) {
          editor.updateShape({
            id: pendingArtifactId as never,
            type: ARTIFACT_CARD_SHAPE_TYPE as never,
            props: artifactPropsFromSeed(result.ir ?? null, preview),
          } as never);
          return;
        }
      }
      if (!result.ir) return;
      placeArtifactShape(editor, result.ir, runAnchor(editor), preview);
    },
    [editor]
  );

  /**
   * REAL gap: flip the foundation-profile / component-reference card to its typed
   * gap state (FND-03 / REG-03). Produces NO artifact card. A gap CARRYING a
   * campaignPlan is a suspend handled by the chat run-turn — it never reaches
   * here (the chat hook branches on the plan first, D-12).
   */
  const flipToGapState = useCallback(
    (
      gap: ExperienceBuilderEventT,
      _result: RunResultFrame | null,
      pendingArtifactId?: string | null,
    ): void => {
      if (!editor || gap.type !== 'gap') return;
      removePendingArtifactRun(editor, pendingArtifactId);
      flipToGapShape(editor, gap, runAnchor(editor));
    },
    [editor]
  );

  const canvasCallbacks = useMemo<LabCanvasCallbacks>(
    () => ({ beginArtifact, placeArtifact, flipToGapState }),
    [beginArtifact, placeArtifact, flipToGapState]
  );

  return { canvasCallbacks, beginArtifact, placeArtifact, flipToGapState, isRunning, setIsRunning };
}

function emptyPreviewSeed(): {
  previewUrl: string;
  previewSameOrigin: boolean;
  thumbnailUrl: string;
  variantGroupId: string;
  compositionSpec: CompositionSpecT | null;
  agentTrace: AgentTraceT | null;
  previewErrorMessage: string;
  evaluationComposite: number;
  previewVerification: ArtifactCardShape['props']['previewVerification'];
} {
  return {
    previewUrl: '',
    previewSameOrigin: false,
    thumbnailUrl: '',
    compositionSpec: null,
    variantGroupId: '',
    agentTrace: null,
    previewErrorMessage: '',
    evaluationComposite: 0,
    previewVerification: null,
  };
}

function artifactPropsFromSeed(
  ir: JioExperienceIRT | null,
  preview: {
    previewUrl: string;
    previewSameOrigin: boolean;
    thumbnailUrl: string;
    compositionSpec: CompositionSpecT | null;
    variantGroupId: string;
    agentTrace: AgentTraceT | null;
    previewErrorMessage: string;
    evaluationComposite: number;
    previewVerification: ArtifactCardShape['props']['previewVerification'];
  },
): ArtifactCardShape['props'] {
  return {
    w: CANVAS.ARTIFACT_W,
    h: CANVAS.ARTIFACT_H,
    ir,
    compositionSpec: preview.compositionSpec ?? (ir ? irToCompositionSpec(ir) : null),
    sourcePromptId: '',
    previewUrl: preview.previewUrl,
    previewSameOrigin: preview.previewSameOrigin,
    thumbnailUrl: preview.thumbnailUrl,
    variantGroupId: preview.variantGroupId,
    lifecycle: 'thumbnail',
    agentTrace: preview.agentTrace,
    previewErrorMessage: preview.previewErrorMessage,
    evaluationComposite: preview.evaluationComposite,
    previewVerification: preview.previewVerification,
  };
}

/**
 * Create a "Run #N" frame at the anchor and place the artifact card inside it.
 * Exported-shape-free helper so the hook stays small and testable.
 */
function placeArtifactShape(
  editor: Editor,
  ir: JioExperienceIRT | null,
  anchor: { x: number; y: number },
  preview: {
    previewUrl: string;
    previewSameOrigin: boolean;
    thumbnailUrl: string;
    compositionSpec: CompositionSpecT | null;
    variantGroupId: string;
    agentTrace: AgentTraceT | null;
    previewErrorMessage: string;
    evaluationComposite: number;
    previewVerification: ArtifactCardShape['props']['previewVerification'];
  }
): string {
  const runNumber = nextRunNumber(editor);
  const frameId = createShapeId();
  const frameX = anchor.x;
  const frameY = anchor.y;
  const frameW = CANVAS.FRAME_W;
  const frameH = CANVAS.FRAME_H;

  editor.createShape({
    id: frameId,
    type: 'frame',
    x: frameX,
    y: frameY,
    props: { w: frameW, h: frameH, name: `Run #${runNumber}` },
  });

  const artifactId = createShapeId();
  const artifactProps = artifactPropsFromSeed(ir, preview);
  editor.createShape({
    id: artifactId,
    type: ARTIFACT_CARD_SHAPE_TYPE as never,
    x: frameX + CANVAS.ARTIFACT_OFFSET_X,
    y: frameY + CANVAS.ARTIFACT_OFFSET_Y,
    props: artifactProps,
  });
  // Parent the artifact to the run frame so the lineage is structural.
  editor.reparentShapes([artifactId], frameId);
  return artifactId as unknown as string;
}

function removePendingArtifactRun(editor: Editor, pendingArtifactId?: string | null): void {
  if (!pendingArtifactId) return;
  const pending = editor.getShape(pendingArtifactId as never);
  if (!pending || (pending.type as string) !== ARTIFACT_CARD_SHAPE_TYPE) return;

  const ids = [pendingArtifactId as never];
  const parentId = (pending as { parentId?: unknown }).parentId;
  if (parentId) {
    const parent = editor.getShape(parentId as never);
    if (
      parent &&
      (parent.type as string) === 'frame' &&
      typeof (parent.props as { name?: unknown }).name === 'string' &&
      ((parent.props as { name?: string }).name ?? '').startsWith('Run #')
    ) {
      ids.push(parentId as never);
    }
  }

  (editor as unknown as { deleteShapes?: (ids: unknown[]) => void }).deleteShapes?.(ids);
}

/**
 * Flip a typed gap card for a REAL gap. Reads the gap detail off the gap EVENT
 * (`foundationGap` / `componentGap`) — the prompt card is no longer the source
 * (D-01). Produces NO artifact card.
 */
function flipToGapShape(
  editor: Editor,
  gap: Extract<ExperienceBuilderEventT, { type: 'gap' }>,
  anchor: { x: number; y: number }
): void {
  // Place the gap card just below the run anchor.
  const gapX = anchor.x;
  const gapY = anchor.y + CANVAS.GAP_CARD_OFFSET_Y;

  if (gap.componentGap) {
    const id = createShapeId();
    const props: ComponentReferenceCardShape['props'] = {
      w: CANVAS.GAP_CARD_W,
      h: CANVAS.GAP_CARD_H_COMPONENT,
      state: 'gap',
      componentId: gap.componentGap.componentType,
      gapReason: gap.componentGap.reason,
    };
    editor.createShape({
      id,
      type: COMPONENT_REFERENCE_CARD_SHAPE_TYPE as never,
      x: gapX,
      y: gapY,
      props,
    });
    return;
  }

  const id = createShapeId();
  const props: FoundationProfileCardShape['props'] = {
    w: CANVAS.GAP_CARD_W,
    h: CANVAS.GAP_CARD_H_FOUNDATION,
    state: 'gap',
    artifactType: gap.foundationGap?.artifactType ?? '',
    outputProfile: gap.foundationGap?.outputProfile ?? '',
    gapReason: gap.foundationGap?.reason ?? '',
  };
  editor.createShape({
    id,
    type: FOUNDATION_PROFILE_CARD_SHAPE_TYPE as never,
    x: gapX,
    y: gapY,
    props,
  });
}
