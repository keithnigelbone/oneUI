/**
 * CanvasViewModeSwitch.tsx
 *
 * Tiny always-visible Edit ↔ Preview switch. Lives at the top-right of
 * the canvas viewport so toggling to Preview (which hides the sidebar +
 * chat panel) does NOT hide the affordance that flips back to Edit.
 *
 * No pill background, no box — just two text buttons side-by-side with
 * a subtle active indicator. Minimal chrome, maximum legibility.
 */
'use client';

import React, { useCallback } from 'react';
import { useEditor } from 'tldraw';
import { Button } from '@oneui/ui-internal/components/Button/Button';
import { COMPONENT_SHAPE_TYPE } from './ComponentShape';
import styles from './CanvasViewModeSwitch.module.css';

interface CanvasViewModeSwitchProps {
  /** Whether the canvas is currently in preview mode. */
  isPreview: boolean;
  /** Fired when the user flips Edit ↔ Preview. Parent mirrors into React
   *  state so sidebar + chat panel visibility updates accordingly. */
  onPreviewChange: (next: boolean) => void;
}

export function CanvasViewModeSwitch({
  isPreview,
  onPreviewChange,
}: CanvasViewModeSwitchProps) {
  const editor = useEditor();

  const setPreview = useCallback(
    (shouldPreview: boolean) => {
      if (shouldPreview === isPreview) return;
      // Mirror onto the editor so ComponentShape can read it synchronously
      // in its render method (pointer-events gating for preview mode).
      (editor as any).__oneui_preview = shouldPreview;
      const shapes = editor.getCurrentPageShapes() as any[];
      for (const comp of shapes) {
        if (comp.type !== COMPONENT_SHAPE_TYPE) continue;
        editor.updateShape({
          id: comp.id,
          type: COMPONENT_SHAPE_TYPE as any,
          props: { _surfaceContext: comp.props._surfaceContext || '' },
        } as any);
      }
      onPreviewChange(shouldPreview);
    },
    [editor, isPreview, onPreviewChange],
  );

  return (
    <div
      className={styles.wrap}
      role="group"
      aria-label="Canvas view mode"
    >
      <Button
        appearance="neutral"
        attention="low"
        size="s"
        onPress={() => setPreview(false)}
        className={styles.btn}
        data-active={!isPreview || undefined}
        aria-pressed={!isPreview}
      >
        Edit
      </Button>
      <Button
        appearance="neutral"
        attention="low"
        size="s"
        onPress={() => setPreview(true)}
        className={styles.btn}
        data-active={isPreview || undefined}
        aria-pressed={isPreview}
      >
        Preview
      </Button>
    </div>
  );
}
