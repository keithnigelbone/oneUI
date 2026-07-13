/**
 * ExperienceLabCanvas.tsx
 *
 * The isolated Experience Lab canvas — the RIGHT pane of the chat-first shell
 * (D-13). A scoped `<Tldraw>` instance with its OWN editor + persisted document
 * key (mirroring the Builder's isolation patterns — NEVER reusing the Builder's
 * store singleton or importing `ExperienceCanvas`, LAB-03). It registers the Lab's
 * custom card shapes + the Run #N frame override and DISPLAYS artifacts / gap
 * cards (D-02) — it no longer owns the run trigger or the docked
 * RequestPanel / RunInspectorPanel (both retired as docks, D-13). Generation is
 * driven by the chat pane (D-01); the chat hook invokes the canvas placement
 * callbacks on a terminal run frame (D-12).
 *
 * The canvas hands its `Editor` up to the shell via `onEditorMount` so the shell
 * can derive `useExperienceLabRun(editor)`'s `canvasCallbacks` and thread them to
 * the chat. The selection-observation handler is preserved (left intact for
 * Plan 05's chat↔canvas selection binding, D-02).
 *
 * Canvas background = `default` surface (White-Canvas rule). All shell chrome is
 * token-only Jio CSS (LAB-02). The default export is what the shell
 * dynamic-imports with `ssr: false`.
 */

'use client';

import { useCallback, useRef, useState } from 'react';
import {
  Tldraw,
  type Editor,
  type TLComponents,
} from 'tldraw';
import 'tldraw/tldraw.css';
import {
  PROMPT_CARD_SHAPE_TYPE,
  PromptCardShapeUtil,
} from './shapes/PromptCardShape';
import { ArtifactCardShapeUtil } from './shapes/ArtifactCardShape';
import { FoundationProfileCardShapeUtil } from './shapes/FoundationProfileCardShape';
import { ComponentReferenceCardShapeUtil } from './shapes/ComponentReferenceCardShape';
import { GenericPlaceholderShapeUtil } from './shapes/GenericPlaceholderShape';
import { RunGroupFrameShapeUtil } from './frames/RunGroupFrame';
import {
  DEFAULT_EXPERIENCE_LAB_CANVAS_DOCUMENT_ID,
  buildExperienceLabPersistenceKey,
  buildExperienceLabSessionId,
} from './canvasPersistence';
import styles from './ExperienceLabCanvas.module.css';

/**
 * Custom shape utils for the Lab canvas. `RunGroupFrameShapeUtil` overrides the
 * built-in `'frame'` type (it extends `FrameShapeUtil`) so Run #N frames render
 * with the bg-subtle fill. `PromptCardShapeUtil` stays REGISTERED for back-compat
 * of any existing canvas state, but the prompt card is no longer the run entry
 * surface (D-01).
 */
const labShapeUtils = [
  PromptCardShapeUtil,
  ArtifactCardShapeUtil,
  FoundationProfileCardShapeUtil,
  ComponentReferenceCardShapeUtil,
  GenericPlaceholderShapeUtil,
  RunGroupFrameShapeUtil,
] as const as unknown as Parameters<typeof Tldraw>[0]['shapeUtils'];

/** Hide tldraw's irrelevant default UI (style/color panels). */
const labComponents: Partial<TLComponents> = {
  StylePanel: null,
  HelpMenu: null,
};

export interface ExperienceLabCanvasProps {
  /**
   * Lifts the mounted `Editor` up to the shell so it can derive the canvas
   * placement callbacks (`useExperienceLabRun`) and thread them to the chat pane
   * (D-12). Optional so the canvas can also stand alone in a test/storybook.
   */
  onEditorMount?: (editor: Editor) => void;
  /** Durable tldraw document id. Defaults to the isolated local Lab canvas. */
  canvasDocumentId?: string;
  /** tldraw session id for local presence/persistence. */
  sessionId?: string;
}

export default function ExperienceLabCanvas({
  onEditorMount,
  canvasDocumentId = DEFAULT_EXPERIENCE_LAB_CANVAS_DOCUMENT_ID,
  sessionId,
}: ExperienceLabCanvasProps = {}) {
  const editorRef = useRef<Editor | null>(null);
  // The currently-selected artifact card (Plan 05 will map this → the
  // originating chat turn for the chat↔canvas selection binding, D-02).
  const [, setSelectedArtifactId] = useState<string | null>(null);

  /** Resolve the single selected shape, if any (selection-observation seam). */
  const resolveSelectedArtifactId = useCallback((ed: Editor): string | null => {
    const selected = ed.getSelectedShapeIds();
    if (selected.length !== 1) return null;
    const shape = ed.getShape(selected[0]);
    // Preserve the prompt-card type guard for back-compat; Plan 05 extends this
    // to map an ArtifactCardShape → its originating turn id.
    if (!shape) return null;
    return (shape.type as string) === PROMPT_CARD_SHAPE_TYPE
      ? null
      : (selected[0] as unknown as string);
  }, []);

  const handleMount = useCallback(
    (mountedEditor: Editor) => {
      editorRef.current = mountedEditor;
      onEditorMount?.(mountedEditor);
      // Track selection reactively (left intact for Plan 05's selection binding,
      // D-02 — ExperienceLabCanvas.tsx selection observation preserved).
      const sync = () => setSelectedArtifactId(resolveSelectedArtifactId(mountedEditor));
      sync();
      mountedEditor.sideEffects.registerAfterChangeHandler('instance_page_state', sync);
      mountedEditor.sideEffects.registerAfterChangeHandler('shape', sync);
    },
    [onEditorMount, resolveSelectedArtifactId],
  );

  return (
    <div className={styles.page} data-full-bleed data-testid="experience-lab-canvas">
      <div className={styles.canvasContainer}>
        <Tldraw
          shapeUtils={labShapeUtils}
          components={labComponents}
          persistenceKey={buildExperienceLabPersistenceKey(canvasDocumentId)}
          sessionId={sessionId ?? buildExperienceLabSessionId(canvasDocumentId)}
          onMount={handleMount}
        />
      </div>
    </div>
  );
}
