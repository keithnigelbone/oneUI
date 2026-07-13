/**
 * autoLayout.ts
 *
 * Persistent auto-layout engine for frames.
 * When enabled on a frame, automatically arranges children
 * on every change (add, remove, resize).
 *
 * Stores layout config per frame ID in a Map (not persisted in tldraw).
 */

import type { Editor } from 'tldraw';
import { COMPONENT_SHAPE_TYPE } from './ComponentShape';

export type LayoutDirection = 'column' | 'row';
export type LayoutAlign = 'start' | 'center' | 'end' | 'stretch';

export interface LayoutConfig {
  direction: LayoutDirection;
  gap: number;
  paddingX: number;
  paddingY: number;
  align: LayoutAlign;
  /** Whether to auto-resize frame height to fit content */
  hugContent: boolean;
}

export const DEFAULT_LAYOUT: LayoutConfig = {
  direction: 'column',
  gap: 12,
  paddingX: 20,
  paddingY: 20,
  align: 'stretch',
  hugContent: true,
};

// Store layout configs per frame ID
const layoutConfigs = new Map<string, LayoutConfig>();

export function getLayoutConfig(frameId: string): LayoutConfig | null {
  return layoutConfigs.get(frameId) ?? null;
}

export function setLayoutConfig(frameId: string, config: Partial<LayoutConfig>) {
  const existing = layoutConfigs.get(frameId) ?? { ...DEFAULT_LAYOUT };
  layoutConfigs.set(frameId, { ...existing, ...config });
}

export function enableAutoLayout(frameId: string, config?: Partial<LayoutConfig>) {
  setLayoutConfig(frameId, config ?? {});
}

export function disableAutoLayout(frameId: string) {
  layoutConfigs.delete(frameId);
}

export function hasAutoLayout(frameId: string): boolean {
  return layoutConfigs.has(frameId);
}

/**
 * Apply auto-layout to a frame's children.
 * Call this after any child change (add, remove, move, resize).
 */
export function applyAutoLayout(editor: Editor, frameId: string) {
  const config = layoutConfigs.get(frameId);
  if (!config) return;

  const childIds = [...editor.getSortedChildIdsForParent(frameId as any)];
  const children = childIds
    .map((id) => editor.getShape(id))
    .filter(Boolean) as any[];

  if (children.length === 0) return;

  const frame = editor.getShape(frameId as any) as any;
  if (!frame) return;

  const frameW = frame.props?.w ?? 390;
  const contentW = frameW - config.paddingX * 2;

  if (config.direction === 'column') {
    let y = config.paddingY;

    for (const child of children) {
      const childW = child.props?.w ?? 100;
      let x: number;

      switch (config.align) {
        case 'start':
          x = config.paddingX;
          break;
        case 'center':
          x = (frameW - childW) / 2;
          break;
        case 'end':
          x = frameW - config.paddingX - childW;
          break;
        case 'stretch':
          x = config.paddingX;
          // Stretch width to fill
          editor.updateShape({
            id: child.id, type: child.type,
            props: { w: contentW },
          } as any);
          break;
        default:
          x = config.paddingX;
      }

      editor.updateShape({
        id: child.id, type: child.type,
        x, y,
      } as any);

      y += (child.props?.h ?? 40) + config.gap;
    }

    // Hug content — resize frame height
    if (config.hugContent) {
      const totalH = y - config.gap + config.paddingY;
      editor.updateShape({
        id: frameId as any, type: 'frame',
        props: { h: Math.max(totalH, 100) },
      } as any);
    }
  } else {
    // Row layout
    let x = config.paddingX;

    for (const child of children) {
      const childH = child.props?.h ?? 40;
      let y: number;

      switch (config.align) {
        case 'start':
          y = config.paddingY;
          break;
        case 'center':
          y = config.paddingY + (frame.props?.h - config.paddingY * 2 - childH) / 2;
          break;
        case 'end':
          y = (frame.props?.h ?? 200) - config.paddingY - childH;
          break;
        default:
          y = config.paddingY;
      }

      editor.updateShape({
        id: child.id, type: child.type,
        x, y,
      } as any);

      x += (child.props?.w ?? 100) + config.gap;
    }
  }
}
