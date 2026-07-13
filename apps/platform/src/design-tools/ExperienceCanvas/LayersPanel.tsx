/**
 * LayersPanel.tsx
 *
 * Shows the shape hierarchy of the canvas — frames and their
 * child components. Click to select, visibility indicators.
 */

'use client';

import React, { useCallback } from 'react';
import { track, useEditor } from 'tldraw';
import { COMPONENT_SHAPE_TYPE } from './ComponentShape';
import styles from './LayersPanel.module.css';

/**
 * LayersPanelBody — the embeddable body (no outer `.panel` wrapper). Designed
 * to drop into the left sidebar's "Layers" tab. Keeps all selection +
 * hierarchy logic; callers provide the scroll container.
 */
export const LayersPanelBody = track(() => {
  const editor = useEditor();
  const shapes = editor.getCurrentPageShapes() as any[];
  const selectedIds = new Set(editor.getSelectedShapeIds());

  // Build hierarchy: top-level shapes (no parent or parent is page)
  const pageId = editor.getCurrentPageId();
  const topLevel = shapes.filter((s) => s.parentId === pageId);

  const handleSelect = useCallback(
    (shapeId: string) => {
      editor.select(shapeId as any);
      editor.zoomToSelection({ animation: { duration: 200 } });
    },
    [editor],
  );

  if (topLevel.length === 0) {
    return <div className={styles.empty}>No shapes on canvas</div>;
  }

  return (
    <div className={styles.list}>
      {topLevel.map((shape) => {
        const isFrame = shape.type === 'frame';
        const isComponent = shape.type === COMPONENT_SHAPE_TYPE;
        const isSelected = selectedIds.has(shape.id);

        const children = isFrame
          ? shapes.filter((s) => s.parentId === shape.id)
          : [];

        return (
          <div key={shape.id}>
            <button
              className={styles.layerItem}
              data-selected={isSelected || undefined}
              data-type={isFrame ? 'frame' : 'component'}
              onClick={() => handleSelect(shape.id)}
            >
              <span className={styles.layerIcon}>
                {isFrame ? '▢' : '◆'}
              </span>
              <span className={styles.layerName}>
                {isFrame
                  ? shape.props?.name || 'Frame'
                  : isComponent
                    ? shape.props?.componentType || 'Component'
                    : shape.type}
              </span>
              {children.length > 0 && (
                <span className={styles.layerCount}>{children.length}</span>
              )}
            </button>

            {children.length > 0 && (
              <div className={styles.layerChildren}>
                {children.map((child) => {
                  const childSelected = selectedIds.has(child.id);
                  return (
                    <button
                      key={child.id}
                      className={styles.layerItem}
                      data-selected={childSelected || undefined}
                      data-type="component"
                      data-nested
                      onClick={() => handleSelect(child.id)}
                    >
                      <span className={styles.layerIcon}>◆</span>
                      <span className={styles.layerName}>
                        {child.type === COMPONENT_SHAPE_TYPE
                          ? child.props?.componentType || 'Component'
                          : child.type}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

/**
 * Legacy wrapper with the absolutely-positioned panel chrome. Kept for
 * callers that still render a standalone panel. New call sites should use
 * `<LayersPanelBody />` inside their own container.
 */
export const LayersPanel = track(() => {
  const editor = useEditor();
  const shapes = editor.getCurrentPageShapes() as any[];

  return (
    <div className={styles.panel}>
      <div className={styles.header}>Layers ({shapes.length})</div>
      <LayersPanelBody />
    </div>
  );
});
