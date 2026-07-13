/**
 * SelectionPanel.tsx
 *
 * The selection-aware inspector surface. Picks the right editor UI based on
 * what's currently selected:
 *   - Single component shape → <PropPanel>
 *   - 2+ shapes              → <MultiSelectionActions> (auto-layout wrap)
 *   - Single frame (or component inside a frame) → <FrameActions>
 *
 * Lives in its own file to break an import cycle: the right-docked
 * `CanvasChatPanel` embeds SelectionPanel inside its Edit tab. Previously
 * `CanvasChatPanel` imported SelectionPanel from `./ExperienceCanvas`, while
 * `ExperienceCanvas` in turn imported `CanvasChatPanel` — a two-file cycle.
 * Hoisting the wrapper here cuts that link. `MultiSelectionActions` and
 * `FrameActions` remain in `ExperienceCanvas` (they're ~800 lines combined
 * and depend on per-frame sub-brand + artboard state that lives there); a
 * future slice can hoist them once their dependencies shrink.
 */

'use client';

import React from 'react';
import { track, useEditor } from 'tldraw';
import { PropPanel } from './PropPanel';
import { MultiSelectionActions, FrameActions } from './ExperienceCanvas';
import { getSelectedComponentInfo } from './useCanvasEditor';
import styles from './ExperienceCanvas.module.css';

export const SelectionPanel = track(() => {
  const editor = useEditor();
  const selection = getSelectedComponentInfo(editor);

  const selectedIds = editor.getSelectedShapeIds();
  const multiSelected = selectedIds.length >= 2;

  const selectedShape = selectedIds.length === 1
    ? (editor.getShape(selectedIds[0]) as any)
    : null;
  const isFrame = selectedShape?.type === 'frame';

  // Check if selected component's parent is a frame
  const parentFrame = selectedShape && !isFrame
    ? (() => {
        const parentId = selectedShape.parentId;
        if (!parentId) return null;
        const parent = editor.getShape(parentId) as any;
        return parent?.type === 'frame' ? parent : null;
      })()
    : null;

  const frameToShow = isFrame ? selectedShape : parentFrame;

  if (!selection && !frameToShow && !multiSelected) return null;

  return (
    <div className={styles.propPanelContainer}>
      {selection && <PropPanel editor={editor} selection={selection} />}
      {multiSelected && <MultiSelectionActions editor={editor} count={selectedIds.length} />}
      {frameToShow && (
        <FrameActions
          editor={editor}
          frameId={frameToShow.id}
          frameName={frameToShow.props?.name}
        />
      )}
    </div>
  );
});
