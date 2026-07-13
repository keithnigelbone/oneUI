/**
 * Shared helpers for placing component AST onto the tldraw canvas.
 * Used by AIPrompt and the Create section capture pipeline.
 */

import { createShapeId } from 'tldraw';
import type { Editor } from 'tldraw';
import { COMPONENT_SHAPE_TYPE } from './ComponentShape';
import {
  computeRibbonGeometry,
  resolveOrientation,
  defaultPlacement as ribbonDefaultPlacement,
  JIO_DEFAULT_COLORS,
  type JioRibbonSize,
} from '../JioRibbon/JioRibbon.shared';

/**
 * tldraw's T.jsonValue only accepts JSON-serializable **plain** objects (Object.prototype or null
 * prototype). Nested values like Date, Map, or class instances fail with
 * "Expected json serializable value, got object".
 */
export function sanitizeComponentPropsForTldraw(props: Record<string, unknown>): Record<string, unknown> {
  try {
    const json = JSON.stringify(props, (_key, value) => {
      if (value === undefined) return undefined;
      if (typeof value === 'function' || typeof value === 'symbol') return undefined;
      if (typeof value === 'bigint') return Number(value);
      if (value instanceof Date) return value.toISOString();
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        const proto = Object.getPrototypeOf(value);
        if (proto !== Object.prototype && proto !== null) {
          return undefined;
        }
      }
      return value;
    });
    if (json === undefined) return {};
    const parsed = JSON.parse(json) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    /* ignore */
  }
  return {};
}

export const COMPONENT_PLACE_DEFAULTS: Record<string, { w: number; h: number }> = {
  Button: { w: 96, h: 36 },
  IconButton: { w: 36, h: 36 },
  Avatar: { w: 32, h: 32 },
  Checkbox: { w: 20, h: 20 },
  Radio: { w: 20, h: 20 },
  Switch: { w: 36, h: 20 },
  Stepper: { w: 108, h: 36 },
  IconContained: { w: 32, h: 32 },
  Icon: { w: 24, h: 24 },
  Image: { w: 160, h: 120 },
  CounterBadge: { w: 24, h: 24 },
  IndicatorBadge: { w: 12, h: 12 },
  Divider: { w: 200, h: 2 },
  Chip: { w: 80, h: 32 },
  SelectableButton: { w: 96, h: 36 },
  SelectableIconButton: { w: 36, h: 36 },
  SelectableSingleTextButton: { w: 36, h: 36 },
  WebHeader: { w: 390, h: 56 },
  JioRibbon: { w: 200, h: 200 },
  ContentBlock: { w: 600, h: 300 },
};

const FULL_WIDTH_TYPES = new Set(['Button', 'Checkbox', 'Switch', 'Divider', 'SelectableButton']);

const NEEDS_TEXT = new Set(['Button', 'Checkbox', 'Chip', 'SelectableButton', 'SelectableSingleTextButton']);

export function collectComponents(node: unknown): Array<{
  type: string;
  props: Record<string, unknown>;
  text: string;
}> {
  if (!node || typeof node !== 'object') return [];
  const n = node as Record<string, unknown>;
  if (n.kind === 'text') return [];
  if (n.kind === 'component') {
    const children = Array.isArray(n.children) ? n.children : [];
    const textChild = children.find((c: unknown) => (c as { kind?: string })?.kind === 'text') as
      | { text?: string }
      | undefined;
    let text = textChild?.text || '';
    const type = String(n.type ?? '');
    if (!text && NEEDS_TEXT.has(type)) text = type;
    return [{ type, props: (n.props as Record<string, unknown>) || {}, text }];
  }
  const children = Array.isArray(n.children) ? n.children : [];
  return children.flatMap(collectComponents);
}

export function extractScreens(ast: unknown): Array<{
  name: string;
  components: ReturnType<typeof collectComponents>;
}> {
  const a = ast as { name?: string; root?: unknown } | null;
  const root = a?.root;
  if (!root || typeof root !== 'object') return [];
  const r = root as Record<string, unknown>;
  if (r.kind === 'component') {
    return [{ name: a?.name || 'Screen', components: collectComponents(root) }];
  }
  if (r.kind === 'element' && Array.isArray(r.children)) {
    const els = r.children.filter(
      (c: unknown) =>
        (c as { kind?: string })?.kind === 'element' &&
        Array.isArray((c as { children?: unknown[] }).children) &&
        ((c as { children: unknown[] }).children?.length ?? 0) > 0
    );
    if (els.length > 1) {
      return els.map((s: unknown, i: number) => ({
        name: String((s as { props?: { 'data-screen'?: string } }).props?.['data-screen'] || `Screen ${i + 1}`),
        components: collectComponents(s),
      }));
    }
  }
  return [{ name: a?.name || 'Screen', components: collectComponents(root) }];
}

export function placeComponents(
  editor: Editor,
  frameId: string,
  frameW: number,
  components: Array<{ type: string; props: Record<string, unknown>; text: string }>
): void {
  const padding = 20;
  const gap = 12;
  const contentW = frameW - padding * 2;
  const eIds = [...editor.getSortedChildIdsForParent(frameId as never)];
  let relY = padding;
  if (eIds.length > 0) {
    const last = editor.getShape(eIds[eIds.length - 1]) as { props?: { h?: number }; y?: number } | undefined;
    if (last) relY = (last.y ?? 0) + (last.props?.h ?? 40) + gap * 2;
  }
  for (const c of components) {
    const d = COMPONENT_PLACE_DEFAULTS[c.type] ?? { w: 100, h: 40 };
    const fw = FULL_WIDTH_TYPES.has(c.type);
    editor.createShape({
      id: createShapeId(),
      type: COMPONENT_SHAPE_TYPE as never,
      x: padding,
      y: relY,
      parentId: frameId as never,
      props: {
        w: fw ? contentW : d.w,
        h: d.h,
        componentType: c.type,
        componentProps: sanitizeComponentPropsForTldraw({
          ...c.props,
          ...(fw ? { fullWidth: true } : {}),
        }),
        childText: c.text,
        _surfaceContext: '',
      },
    } as never);
    relY += d.h + gap;
  }
}

/** Clear top-level shapes on the current page (frames cascade-delete children). */
export function clearTopLevelShapes(editor: Editor): void {
  const pageId = editor.getCurrentPageId();
  const shapes = editor.getCurrentPageShapes() as Array<{ id: string; parentId: string }>;
  for (const s of shapes) {
    if (s.parentId === pageId) {
      editor.deleteShape(s.id as never);
    }
  }
}

export function createMarketingFrame(
  editor: Editor,
  opts: { w: number; h: number; name: string }
): string {
  const frameId = createShapeId();
  editor.createShape({
    id: frameId,
    type: 'frame',
    x: 0,
    y: 0,
    props: { w: opts.w, h: opts.h, name: opts.name, color: 'white' },
  } as never);
  return frameId as unknown as string;
}

export function placeJioRibbonOnFrame(
  editor: Editor,
  frameId: string,
  canvasWidth: number,
  canvasHeight: number,
  ribbonProps?: Record<string, unknown>
): void {
  const variant = (ribbonProps?.variant as string) ?? 'dots-with-symbol';
  const orientationProp = ribbonProps?.orientation as string | undefined;
  const orientation = orientationProp ?? resolveOrientation(canvasWidth, canvasHeight);
  const placement = (ribbonProps?.placement as string) ?? ribbonDefaultPlacement(orientation as any);

  const colors: [string, string, string] = [
    (ribbonProps?.color1 as string) ?? JIO_DEFAULT_COLORS.color1,
    (ribbonProps?.color2 as string) ?? JIO_DEFAULT_COLORS.color2,
    (ribbonProps?.color3 as string) ?? JIO_DEFAULT_COLORS.color3,
  ];
  const geo = computeRibbonGeometry({
    variant: variant as any,
    orientation: orientation as any,
    canvasWidth,
    canvasHeight,
    colors,
    placement: placement as any,
    symbolPosition: ribbonProps?.symbolPosition as number | undefined,
    size: ribbonProps?.size as JioRibbonSize | undefined,
  });

  const shapeW = orientation === 'vertical' ? geo.containerWidth : canvasWidth;
  const shapeH = geo.containerHeight;

  const { x, y } = computeRibbonPosition(
    orientation,
    placement,
    canvasWidth,
    canvasHeight,
    shapeW,
    shapeH,
    geo.margin,
  );

  editor.createShape({
    id: createShapeId(),
    type: COMPONENT_SHAPE_TYPE as never,
    x,
    y,
    parentId: frameId as never,
    props: {
      w: shapeW,
      h: shapeH,
      componentType: 'JioRibbon',
      componentProps: sanitizeComponentPropsForTldraw({
        canvasWidth,
        canvasHeight,
        variant,
        ...(ribbonProps ?? {}),
      }),
      childText: '',
      _surfaceContext: '',
    },
  } as never);
}

/** Compute ribbon shape x/y within the artboard from placement + orientation. */
export function computeRibbonPosition(
  orientation: string,
  placement: string,
  canvasWidth: number,
  canvasHeight: number,
  shapeW: number,
  shapeH: number,
  _margin: number,
): { x: number; y: number } {
  let x = 0;
  let y = 0;

  if (orientation === 'vertical') {
    y = 0;
    if (placement === 'left') {
      x = 0;
    } else if (placement === 'center') {
      x = (canvasWidth - shapeW) / 2;
    } else {
      x = canvasWidth - shapeW;
    }
  } else {
    x = 0;
    if (placement === 'top') {
      y = 0;
    } else if (placement === 'center') {
      y = (canvasHeight - shapeH) / 2;
    } else {
      y = canvasHeight - shapeH;
    }
  }

  return { x, y };
}

/**
 * Content block placed as a hug-content shape inside a marketing frame.
 * Width = maxWidth% of canvas; height follows content (DOM-measured).
 * Position (x/y) derived from the `position` and `alignment` props.
 */
export function placeContentBlockOnFrame(
  editor: Editor,
  frameId: string,
  canvasWidth: number,
  canvasHeight: number,
  blockProps?: Record<string, unknown>
): void {
  const maxWidthPct = Math.min(100, Math.max(10, Number(blockProps?.maxWidth) || 60));
  const shapeW = Math.round(canvasWidth * maxWidthPct / 100);
  const estimatedH = Math.round(canvasHeight * 0.35);

  const position = (blockProps?.position as string) ?? 'bottom';
  const alignment = (blockProps?.alignment as string) ?? 'left';

  const { x, y } = computeContentBlockPosition(
    position,
    alignment,
    canvasWidth,
    canvasHeight,
    shapeW,
    estimatedH,
  );

  editor.createShape({
    id: createShapeId(),
    type: COMPONENT_SHAPE_TYPE as never,
    x,
    y,
    parentId: frameId as never,
    props: {
      w: shapeW,
      h: estimatedH,
      componentType: 'ContentBlock',
      componentProps: sanitizeComponentPropsForTldraw({
        canvasWidth,
        canvasHeight,
        ...(blockProps ?? {}),
      }),
      childText: '',
      _surfaceContext: '',
    },
  } as never);
}

/** Compute content block shape x/y from position + alignment within the artboard. */
export function computeContentBlockPosition(
  position: string,
  alignment: string,
  canvasWidth: number,
  canvasHeight: number,
  shapeW: number,
  shapeH: number,
): { x: number; y: number } {
  let x: number;
  let y: number;

  if (alignment === 'center') {
    x = (canvasWidth - shapeW) / 2;
  } else {
    x = 0;
  }

  if (position === 'top') {
    y = 0;
  } else if (position === 'bottom') {
    y = Math.max(0, canvasHeight - shapeH);
  } else {
    y = Math.max(0, (canvasHeight - shapeH) / 2);
  }

  return { x, y };
}

/** First frame on the current page (marketing artboard). */
export function getPrimaryFrameId(editor: Editor): string | null {
  const frames = editor.getCurrentPageShapes().filter((s) => (s as { type?: string }).type === 'frame');
  const first = frames[0] as { id?: string } | undefined;
  return first?.id ?? null;
}

/**
 * Migrate legacy full-bleed ContentBlock/JioRibbon shapes to hug-content sizing.
 * Old shapes had w/h = frame size and x/y = 0,0. This function detects them
 * and repositions using the placement logic from their componentProps.
 */
export function migrateFullBleedShapes(editor: Editor): void {
  const frames = editor.getCurrentPageShapes().filter((s) => (s as any).type === 'frame') as any[];
  for (const frame of frames) {
    const frameW = frame.props?.w ?? 0;
    const frameH = frame.props?.h ?? 0;
    if (frameW <= 0 || frameH <= 0) continue;

    const childIds = [...editor.getSortedChildIdsForParent(frame.id as never)];
    for (const childId of childIds) {
      const shape = editor.getShape(childId as never) as any;
      if (!shape || shape.type !== COMPONENT_SHAPE_TYPE) continue;

      const ct = shape.props?.componentType;
      const cp = (shape.props?.componentProps ?? {}) as Record<string, unknown>;

      if (ct === 'ContentBlock') {
        const isLegacy = shape.props.w >= frameW * 0.95 && shape.props.h >= frameH * 0.95;
        if (!isLegacy) continue;

        const maxWidthPct = Math.min(100, Math.max(10, Number(cp.maxWidth) || 60));
        const newW = Math.round(frameW * maxWidthPct / 100);
        const estimatedH = Math.round(frameH * 0.35);
        const position = (cp.position as string) ?? 'bottom';
        const alignment = (cp.alignment as string) ?? 'left';
        const { x, y } = computeContentBlockPosition(position, alignment, frameW, frameH, newW, estimatedH);
        editor.updateShape({
          id: childId as any,
          type: COMPONENT_SHAPE_TYPE as any,
          x, y,
          props: { w: newW, h: estimatedH },
        } as any);
      }

      if (ct === 'JioRibbon') {
        const isLegacy = shape.props.w >= frameW * 0.95 && shape.props.h >= frameH * 0.95;
        if (!isLegacy) continue;

        const orientation = (cp.orientation as string) ?? resolveOrientation(frameW, frameH);
        const placement = (cp.placement as string) ?? ribbonDefaultPlacement(orientation as any);
        const colors: [string, string, string] = [
          (cp.color1 as string) ?? JIO_DEFAULT_COLORS.color1,
          (cp.color2 as string) ?? JIO_DEFAULT_COLORS.color2,
          (cp.color3 as string) ?? JIO_DEFAULT_COLORS.color3,
        ];
        const geo = computeRibbonGeometry({
          variant: (cp.variant as any) ?? 'dots-with-symbol',
          orientation: orientation as any,
          canvasWidth: frameW,
          canvasHeight: frameH,
          colors,
          placement: placement as any,
          symbolPosition: cp.symbolPosition as number | undefined,
          size: cp.size as JioRibbonSize | undefined,
        });
        const newW = orientation === 'vertical' ? geo.containerWidth : frameW;
        const newH = geo.containerHeight;
        const { x, y } = computeRibbonPosition(orientation, placement, frameW, frameH, newW, newH, geo.margin);
        editor.updateShape({
          id: childId as any,
          type: COMPONENT_SHAPE_TYPE as any,
          x, y,
          props: { w: newW, h: newH },
        } as any);
      }
    }
  }
}

/** Remove component shapes of a given React component type inside a frame. */
export function removeChildComponentsOfType(
  editor: Editor,
  frameId: string,
  componentType: string
): void {
  const ids = [...editor.getSortedChildIdsForParent(frameId as never)];
  for (const id of ids) {
    const sh = editor.getShape(id as never) as {
      type?: string;
      props?: { componentType?: string };
    } | null;
    if (sh?.type === COMPONENT_SHAPE_TYPE && sh.props?.componentType === componentType) {
      editor.deleteShape(id as never);
    }
  }
}
