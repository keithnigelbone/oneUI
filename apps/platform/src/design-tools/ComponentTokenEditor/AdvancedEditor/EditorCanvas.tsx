/**
 * EditorCanvas.tsx
 *
 * Dot grid canvas for the Advanced Editor.
 * Shows component preview centered on canvas with drag-to-reposition.
 * Bottom toolbar shows 4 modes: Preview / Variations / Editor / Inspect.
 */

'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Crosshair } from 'lucide-react';
import type { SurfaceToken } from '@oneui/shared/engine';
import { useComponentTokenEditor } from '../ComponentTokenEditorContext';
import { PaddingInspector } from './PaddingInspector';
import { CanvasContext, type CanvasContextValue } from '@oneui/ui-internal/contexts/CanvasContext';
import styles from './EditorCanvas.module.css';

const CANVAS_CONTEXT_VALUE: CanvasContextValue = {
  isCanvas: true,
  suppressInteractions: false,
  suppressSideEffects: true,
};

export interface EditorCanvasProps {
  /** Currently selected mode for display */
  selectedMode: 'light' | 'dark' | 'dim';
  /** Current platform for viewport simulation */
  platform?: string;
  /** Platform dimension token overrides (CSS custom properties) */
  platformTokens?: Record<string, string>;
  /** Current density mode for preview */
  previewDensity?: string;
  /** Whether the canvas shows surface preview (removes card background/border) */
  isSurfacePreview?: boolean;
  /** Actual breakpoint viewport width (from the platform/breakpoint selector) */
  breakpointViewport?: number | null;
  /** Children to render inside the preview card */
  children: React.ReactNode;
  /** Active surface context mode (applied to previewCard for edge-to-edge surface + text token cascade) */
  surfaceContextMode?: SurfaceToken;
  /** Background color for the active surface context */
  surfaceContextBgColor?: string;
}

export function EditorCanvas({
  children,
  platform,
  platformTokens,
  previewDensity,
  isSurfacePreview,
  breakpointViewport,
  surfaceContextMode,
  surfaceContextBgColor,
}: EditorCanvasProps) {
  const { activeTabMode } = useComponentTokenEditor();

  const viewportWidth = breakpointViewport ?? null;
  const isConstrained = viewportWidth !== null;
  // Position state for drag-and-drop (offset from center)
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const positionStartRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);
  const isPendingDragRef = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const showInspector = activeTabMode === 'inspect';
  const hasSurfaceContext = !!surfaceContextBgColor && !!surfaceContextMode;

  const DRAG_THRESHOLD = 3;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Only initiate on the card itself, not its children with data-draggable="false"
    if (e.target === cardRef.current || (cardRef.current?.contains(e.target as Node) && (e.target as HTMLElement).dataset.draggable !== 'false')) {
      dragStartRef.current = { x: e.clientX, y: e.clientY };
      positionStartRef.current = { x: position.x, y: position.y };
      hasDraggedRef.current = false;
      isPendingDragRef.current = true;
      // Don't preventDefault — let clicks propagate to children
    }
  }, [position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isPendingDragRef.current && !isDragging) return;

    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Only start dragging after exceeding threshold
    if (!isDragging && distance > DRAG_THRESHOLD) {
      setIsDragging(true);
      hasDraggedRef.current = true;
    }

    if (isDragging || distance > DRAG_THRESHOLD) {
      setPosition({
        x: positionStartRef.current.x + deltaX,
        y: positionStartRef.current.y + deltaY,
      });
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    isPendingDragRef.current = false;
  }, []);

  // Double-click to reset position
  const handleDoubleClick = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  // Attach global mouse listeners for drag (including pending state for threshold detection)
  useEffect(() => {
    if (isDragging || isPendingDragRef.current) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
    return undefined;
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      className={styles.canvas}
      data-inspector-mode={showInspector || undefined}
      data-surface-mode={isSurfacePreview || undefined}
    >
      <div
        ref={cardRef}
        className={`${styles.previewCard} editor-preview-scope`}
        data-platform={platform}
        data-density={previewDensity}
        data-brand-scope=""
        data-surface-preview={isSurfacePreview || undefined}
        data-inspector={showInspector || undefined}
        data-surface-context={hasSurfaceContext || undefined}
        data-surface={hasSurfaceContext ? surfaceContextMode : undefined}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          cursor: isDragging ? 'grabbing' : 'grab',
          ...(isConstrained && viewportWidth
            ? {
                width: `${viewportWidth}px`,
                maxWidth: `${viewportWidth}px`,
                containerType: 'inline-size',
              }
            : {}),
          transition: 'width var(--Motion-Duration-Expressive-Short) var(--Motion-Easing-Standard), background-color var(--Motion-Duration-Discreet-Short) var(--Motion-Easing-Standard)',
          ...(hasSurfaceContext ? { backgroundColor: surfaceContextBgColor } : {}),
          ...platformTokens,
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        title="Drag to reposition, double-click to center"
      >
        <CanvasContext.Provider value={CANVAS_CONTEXT_VALUE}>
          {children}
        </CanvasContext.Provider>
        {showInspector && (
          <PaddingInspector containerRef={cardRef} active={showInspector} />
        )}
      </div>
      {/* Platform viewport indicator */}
      {isConstrained && viewportWidth && (
        <div className={styles.viewportBadge}>
          {viewportWidth}px
        </div>
      )}
      {/* Recenter button — bottom-left icon, shown when offset from center */}
      {(position.x !== 0 || position.y !== 0) && (
        <button
          className={styles.resetPositionButton}
          onClick={() => setPosition({ x: 0, y: 0 })}
          title="Recenter component"
          aria-label="Recenter component"
        >
          <Crosshair size={14} />
        </button>
      )}
    </div>
  );
}

export default EditorCanvas;
