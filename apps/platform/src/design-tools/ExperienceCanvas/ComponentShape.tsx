/**
 * ComponentShape.tsx
 *
 * Custom tldraw shape that renders real OneUI components on the canvas.
 * Detects parent Surface containers for automatic surface-context-awareness.
 */

'use client';

import {
  ShapeUtil,
  HTMLContainer,
  Rectangle2d,
  T,
  type Geometry2d,
  type RecordProps,
  useEditor,
  type TLShapeId,
} from 'tldraw';
import { useRef, useCallback, useLayoutEffect, useState, useEffect, useMemo, type CSSProperties } from 'react';
import { COMPONENT_REGISTRY } from '@oneui/ui-internal/registry/componentRegistry';
import { CONTAINER_SHAPE_TYPE, normalizeSurfaceModeForCanvas } from './ContainerShape';
import { useFrameArtboardSurfaceContext } from './FrameArtboardSurfaceContext';
import { useFrameThemeContext } from './FrameThemeContext';
import { getSubBrandIdForShape } from './artboardSubBrandUtils';
import { getFrameArtboardSurface, getArtboardFrameExportContext } from './artboardFrameSurfaceStore';
import { updateShapeProp } from './useCanvasEditor';
import { cleanSvgTree, collectFontFaceCss } from './svgCleanup';
import { buildFontFamilyById } from '../Foundations/Typography/fonts';

/**
 * Resolve the editing brand's primary font family for export.
 *
 * Why this exists:
 * - The platform may run in "Default Theme" (themeScope="preview") mode where
 *   `:root`'s `--Typography-Font-Primary` is the PLATFORM brand's font (Inter
 *   for One UI Theme), NOT the editing brand's font (e.g. JioType for Jio).
 * - Components on the canvas inherit `--Typography-Font-Primary` from `:root`,
 *   so the canvas DOM (and therefore the export) renders in Inter even when
 *   the user is "working in" a brand that has chosen JioType.
 * - At export time we want the brand's chosen font baked in regardless of the
 *   current theme scope, since the artboard represents a brand asset.
 *
 * Reads the editing brand's typography config from the export context (set by
 * `ExperienceCanvas` via `setArtboardFrameExportContext`) and returns a
 * fully-formed CSS `font-family` string ready to set on `--Typography-Font-Primary`.
 *
 * Falls back to:
 *   1. fontSelection.primaryFontId → static collection (Inter, Poppins, JioType, …)
 *   2. fontSelection.primaryFontId → uploaded custom fonts (`uploaded-{convexId}`)
 *   3. legacy typography.config.fontFamily plain string
 *   4. null when no brand font information is available — caller leaves the
 *      clone unchanged so the existing `:root` cascade still drives capture.
 */
function resolveEditingBrandPrimaryFont(): string | null {
  const ctx = getArtboardFrameExportContext();
  const data = ctx?.baseFoundationData as Record<string, unknown> | null | undefined;
  if (!data) return null;

  const typography = data.typography as { config?: Record<string, unknown> } | undefined;
  const config = typography?.config;
  if (!config) return null;

  const fontSelection = config.fontSelection as
    | { primaryFontId?: string | null }
    | undefined;
  const primaryFontId = fontSelection?.primaryFontId;

  if (primaryFontId) {
    // Path 1: uploaded font in the brand's customFonts table.
    if (primaryFontId.startsWith('uploaded-')) {
      const convexId = primaryFontId.replace('uploaded-', '');
      const customFonts = data.customFonts as
        | Array<{
            _id: string;
            name: string;
            fileUrl?: string;
            fallback?: string;
          }>
        | undefined;
      const cf = customFonts?.find((f) => f._id === convexId);
      if (cf?.name) {
        const quoted = cf.name.includes(' ') ? `'${cf.name}'` : cf.name;
        return `${quoted}, ${cf.fallback ?? 'system-ui, sans-serif'}`;
      }
    }
    // Path 2: bundled / Google Font in the static collection.
    const family = buildFontFamilyById(primaryFontId);
    if (family && family !== 'system-ui, sans-serif') return family;
  }

  // Path 3: legacy plain string field.
  const legacyFontFamily = config.fontFamily;
  if (typeof legacyFontFamily === 'string' && legacyFontFamily.trim()) {
    return legacyFontFamily;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Native-SVG capture helper (used by ComponentShapeUtil.toSvg)
//
// Clones the live rendered DOM element directly into the document body
// (positioned off-screen) and runs dom-to-svg's `elementToSVG()` over it.
// The result is a real SVG document with native primitives (text → <text>,
// divs → <rect>, embedded SVGs preserved as-is) — works in any SVG viewer
// (Illustrator, Sketch, Figma, image previewers) and remains editable.
//
// Two extra steps make the output portable + clean:
//   1. We inject a <style> with @font-face rules for every font used in
//      the subtree BEFORE calling inlineResources(). dom-to-svg's
//      inlineResources only inlines src: url(…) URLs from <style> elements
//      that already exist inside the SVG — by default there are none. This
//      step is what actually embeds fonts as base64 data URIs.
//   2. We run `cleanSvgTree` (shared with the final-export cleanup) to
//      strip dom-to-svg's debug attributes, auto-generated ids,
//      stacking-layer wrappers, empty groups, unreferenced masks, and
//      zero-contribution rects.
//
// Returns { innerSvg, viewBox } or null if capture fails.
// ---------------------------------------------------------------------------

async function captureElementAsNativeSvg(
  source: HTMLElement,
  width: number,
  height: number,
): Promise<{ innerSvg: string; viewBox: string } | null> {
  if (!source || width <= 0 || height <= 0) return null;

  const clone = source.cloneNode(true) as HTMLElement;

  // Clone styling. Critically, opacity stays at 1 — dom-to-svg reads
  // computed styles and would faithfully bake `opacity="0"` straight onto
  // the root <g> of the captured component, making the entire component
  // invisible after import to Figma. We hide the clone from the user
  // via the 0×0 overflow:hidden wrapper below instead.
  //
  // Background/border/shadow are forced to transparent on the root so
  // dom-to-svg doesn't emit a phantom container rect sized to the full
  // shape bounds. Use `setProperty(..., 'important')` to defeat any
  // `[data-surface]` brand-CSS rule that may otherwise re-introduce a
  // computed background-color on the clone.
  clone.style.position = 'absolute';
  clone.style.left = '0';
  clone.style.top = '0';
  clone.style.margin = '0';
  clone.style.padding = clone.style.padding || '0';
  clone.style.transform = 'none';
  clone.style.opacity = '1';
  clone.style.visibility = 'visible';
  clone.style.pointerEvents = 'none';
  clone.style.overflow = 'visible';
  clone.style.setProperty('background', 'transparent', 'important');
  clone.style.setProperty('background-color', 'transparent', 'important');
  clone.style.setProperty('background-image', 'none', 'important');
  clone.style.setProperty('border', '0', 'important');
  clone.style.setProperty('box-shadow', 'none', 'important');

  // Force the editing brand's primary font onto the clone subtree so the
  // export honours the brand even in Default Theme mode (where `:root`
  // resolves `--Typography-Font-Primary` to the platform brand's font, not
  // the editing brand's). Components inside read
  // `font-family: var(--Body-FontFamily, var(--Typography-Font-Text))` (and the
  // legacy `--Typography-Font-Primary` alias still emitted for back-compat), so overriding the
  // variable on the clone propagates to every text descendant via inheritance.
  // `collectFontFaceCss` then discovers the brand family in the computed
  // styles and embeds the matching `@font-face` (e.g. JioType from
  // globals.css) into the SVG `<style>`.
  const brandPrimaryFont = resolveEditingBrandPrimaryFont();
  if (brandPrimaryFont) {
    clone.style.setProperty('--Typography-Font-Primary', brandPrimaryFont, 'important');
  }

  // Strip dev-only affordances (selection labels etc.) from the clone.
  clone.querySelectorAll('[data-tldraw-export-skip="true"]').forEach((el) => el.remove());

  // Wrapper: a 0×0 fixed box at (0,0) with overflow:hidden. The clone
  // is positioned absolutely inside, so its getBoundingClientRect() (which
  // dom-to-svg uses to set the SVG viewBox) returns (0, 0, w, h) —
  // origin matches the wrapper, content is captured cleanly, and the
  // user never sees it because the wrapper clips everything to 0×0.
  // We call elementToSVG(clone), NOT the wrapper, so no extra layer is
  // captured.
  const wrapper = document.createElement('div');
  wrapper.setAttribute('aria-hidden', 'true');
  wrapper.style.cssText =
    'position:fixed;top:0;left:0;width:0;height:0;overflow:hidden;pointer-events:none;contain:strict;';
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    // Let layout settle (one rAF) so getBoundingClientRect on children is accurate.
    await new Promise<void>((r) => requestAnimationFrame(() => r()));

    const { elementToSVG, inlineResources } = await import('dom-to-svg');
    const svgDoc = elementToSVG(clone);
    const svgRoot = svgDoc.documentElement as unknown as SVGSVGElement;

    // Inject a <style> with @font-face rules for every font used in the
    // clone's subtree, so inlineResources can fetch the URLs and embed
    // them as base64 data URIs. Without this step fonts are referenced
    // by name only and won't render in viewers that don't have them
    // installed.
    const fontFaceCss = collectFontFaceCss(clone);
    if (fontFaceCss) {
      const styleEl = svgDoc.createElementNS(
        'http://www.w3.org/2000/svg',
        'style',
      );
      styleEl.textContent = fontFaceCss;
      svgRoot.insertBefore(styleEl, svgRoot.firstChild);
    }

    // Inline @font-face URLs as base64 data URIs (uses the <style> we just
    // injected). Failures are non-fatal — the SVG still works wherever the
    // font is available by name.
    try {
      await inlineResources(svgRoot);
    } catch (err) {
      console.warn('[captureElementAsNativeSvg] font inlining partially failed', err);
    }

    // Strip noise: debug attrs, auto-generated ids, empty groups, single-
    // child wrapper groups, unused masks/clipPaths, transparent rects.
    // ALSO strip any full-cover background rect dom-to-svg emitted for
    // the captured root — this is what shows up in Figma as a phantom
    // Frame fill (e.g. `bg-[#f9fafb]`) on the imported component.
    cleanSvgTree(svgRoot, { dropFullCoverRects: { width, height } });

    // dom-to-svg sets viewBox from the element's getBoundingClientRect
    // (origin is the clone's viewport position, which for fixed (0,0) is
    // 0,0 — but we read it back defensively).
    const rawViewBox = svgRoot.getAttribute('viewBox');
    let vbX = 0;
    let vbY = 0;
    let vbW = width;
    let vbH = height;
    if (rawViewBox) {
      const parts = rawViewBox.split(/\s+/).map(Number);
      if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
        [vbX, vbY, vbW, vbH] = parts;
      }
    }

    const serializer = new XMLSerializer();
    const inner = Array.from(svgRoot.childNodes)
      .map((n) => serializer.serializeToString(n))
      .join('');

    return {
      innerSvg: inner,
      viewBox: `${vbX} ${vbY} ${vbW} ${vbH}`,
    };
  } catch (err) {
    console.warn('[captureElementAsNativeSvg] failed', err);
    return null;
  } finally {
    if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
  }
}

// ---------------------------------------------------------------------------
// Dynamic size from DOM — tldraw's official pattern (size-from-dom)
//
// Stores measured component sizes in a Map keyed by shape ID.
// getGeometry() reads from this map so tldraw's selection bounds,
// hit-testing, and indicators always match the real rendered size.
// ---------------------------------------------------------------------------

/**
 * Global map of shape ID → measured { width, height }.
 *
 * Bounded LRU: deleted shapes never explicitly clear themselves from the map,
 * so without a cap a long canvas session (lots of add/remove cycles) lets the
 * map grow unbounded. 512 is well above any realistic per-canvas shape count
 * and keeps the working set negligible.
 */
const MEASURED_SIZES_LIMIT = 512;
const _measuredSizes = new Map<string, { width: number; height: number }>();
function _setMeasuredSize(id: string, size: { width: number; height: number }) {
  if (_measuredSizes.has(id)) _measuredSizes.delete(id);
  _measuredSizes.set(id, size);
  if (_measuredSizes.size > MEASURED_SIZES_LIMIT) {
    const oldest = _measuredSizes.keys().next().value;
    if (oldest !== undefined) _measuredSizes.delete(oldest);
  }
}

/**
 * React hook: attaches a ResizeObserver to measure the rendered component
 * and stores the result in the global _measuredSizes map.
 * When the size changes, it tells the editor to update the shape's geometry.
 */
function useDynamicComponentSize(shapeId: string) {
  const ref = useRef<HTMLDivElement>(null);
  const editor = useEditor();

  const updateSize = useCallback(() => {
    if (!ref.current) return;
    const width = ref.current.offsetWidth;
    const height = ref.current.offsetHeight;
    if (width <= 0 || height <= 0) return;

    const existing = _measuredSizes.get(shapeId);
    if (existing && existing.width === width && existing.height === height) return;

    _setMeasuredSize(shapeId, { width, height });

    try {
      const shape = editor.getShape(shapeId as any) as any;
      if (shape) {
        const isWidthControlled = WIDTH_RESIZABLE_COMPONENTS.has(shape.props.componentType);
        if (isWidthControlled) {
          const dh = Math.abs(height - shape.props.h);
          if (dh > 2) {
            editor.updateShape({
              id: shapeId as any,
              type: COMPONENT_SHAPE_TYPE as any,
              props: { h: height },
            } as any);
          }
        } else {
          const dw = Math.abs(width - shape.props.w);
          const dh = Math.abs(height - shape.props.h);
          if (dw > 2 || dh > 2) {
            editor.updateShape({
              id: shapeId as any,
              type: COMPONENT_SHAPE_TYPE as any,
              props: { w: width, h: height },
            } as any);
          }
        }
      }
    } catch {
      // Safe to ignore during SVG export rendering
    }
  }, [editor, shapeId]);

  useLayoutEffect(() => { updateSize(); });

  useLayoutEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(updateSize);
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [updateSize]);

  return ref;
}

// ---------------------------------------------------------------------------
// Shape type
// ---------------------------------------------------------------------------

export const COMPONENT_SHAPE_TYPE = 'oneui-component' as const;

export type ComponentShapeProps = {
  w: number;
  h: number;
  componentType: string;
  componentProps: Record<string, unknown>;
  childText: string;
  /** Auto-detected surface context from overlap with Surface containers ('' = none) */
  _surfaceContext: string;
};

export type ComponentShape = {
  id: string;
  type: typeof COMPONENT_SHAPE_TYPE;
  x: number;
  y: number;
  props: ComponentShapeProps;
  [key: string]: unknown;
};

/** Components where the user can drag-resize width (height follows content). */
const WIDTH_RESIZABLE_COMPONENTS = new Set(['ContentBlock']);

/** Components whose size is fully driven by their own geometry (both w and h follow DOM). */
const GEOMETRY_DRIVEN_COMPONENTS = new Set(['JioRibbon']);

// ---------------------------------------------------------------------------
// ShapeUtil
// ---------------------------------------------------------------------------

export class ComponentShapeUtil extends ShapeUtil<any> {
  static override type = COMPONENT_SHAPE_TYPE;

  static override props: RecordProps<any> = {
    w: T.number,
    h: T.number,
    componentType: T.string,
    componentProps: T.jsonValue as any,
    childText: T.string,
    _surfaceContext: T.string,
  };

  getDefaultProps() {
    return {
      w: 200,
      h: 60,
      componentType: 'Button',
      componentProps: { attention: 'high' },
      childText: 'Button',
      _surfaceContext: '',
    };
  }

  override canEdit() { return true; }

  override canResize(shape: any) {
    return WIDTH_RESIZABLE_COMPONENTS.has(shape.props.componentType);
  }
  override isAspectRatioLocked() { return false; }

  // Don't cull off-screen shapes — breaks ResizeObserver measurement
  override canCull() { return false; }

  getGeometry(shape: any): Geometry2d {
    const measured = _measuredSizes.get(shape.id);
    const isGeoDriven = GEOMETRY_DRIVEN_COMPONENTS.has(shape.props.componentType);
    return new Rectangle2d({
      width: isGeoDriven ? shape.props.w : (measured?.width ?? shape.props.w),
      height: isGeoDriven ? shape.props.h : (measured?.height ?? shape.props.h),
      isFilled: true,
    });
  }

  override onResize(shape: any, info: any) {
    if (!WIDTH_RESIZABLE_COMPONENTS.has(shape.props.componentType)) return shape;
    return {
      ...shape,
      props: {
        ...shape.props,
        w: Math.max(100, info.initialShape.props.w * info.scaleX),
      },
    };
  }

  /**
   * SVG export: convert the live rendered component into NATIVE SVG
   * primitives (text → <text>, divs/backgrounds → <rect>, embedded SVG
   * preserved as <circle>/<path>/<linearGradient>/etc). Output works in
   * Illustrator, Sketch, Figma, image previewers, and any other SVG viewer
   * — and remains editable as vector graphics.
   *
   * Implementation: clone the live DOM into a normalised wrapper at (0,0),
   * temporarily attach to the document so layout/styles compute correctly,
   * then run `dom-to-svg`'s `elementToSVG()` over it. The returned SVG is
   * embedded as a nested <svg> with its own viewBox so coordinates land in
   * the shape's local space.
   *
   * If conversion fails we return null and let tldraw fall back to its
   * default foreignObject rendering path.
   */
  override async toSvg(shape: any, _ctx: any) {
    const editor: any = this.editor;
    const container: HTMLElement | undefined = editor.getContainer?.();
    if (!container) return null;

    const shapeEl = container.querySelector(
      `[data-shape-id="${shape.id}"]`,
    ) as HTMLElement | null;
    if (!shapeEl) return null;

    const liveTarget =
      (shapeEl.querySelector('[data-component-type]') as HTMLElement | null) ?? shapeEl;

    const measured = _measuredSizes.get(shape.id);
    const isGeoDriven = GEOMETRY_DRIVEN_COMPONENTS.has(shape.props.componentType);
    const w = isGeoDriven
      ? shape.props.w
      : measured?.width ?? liveTarget.offsetWidth ?? shape.props.w;
    const h = isGeoDriven
      ? shape.props.h
      : measured?.height ?? liveTarget.offsetHeight ?? shape.props.h;

    const result = await captureElementAsNativeSvg(liveTarget, w, h);
    if (!result) return null;

    return (
      <svg
        x={0}
        y={0}
        width={w}
        height={h}
        viewBox={result.viewBox}
        preserveAspectRatio="xMinYMin meet"
        overflow="visible"
        dangerouslySetInnerHTML={{ __html: result.innerSvg }}
      />
    );
  }

  /**
   * Detect if this shape is inside a Surface container.
   * Walks up the parent chain to find a ContainerShape with a surfaceMode.
   */
  /**
   * Detect surface context: check tldraw parent chain AND visual overlap
   * with any container shape on the canvas (since tldraw doesn't auto-parent
   * into custom shapes, only into frames).
   */
  private getParentSurfaceMode(shape: any): string | null {
    // 1. Check direct parent (works if manually parented or inside a frame)
    const parentId = shape.parentId;
    if (parentId) {
      const parent = this.editor.getShape(parentId) as any;
      if (parent?.type === CONTAINER_SHAPE_TYPE && parent.props?.surfaceMode) {
        return normalizeSurfaceModeForCanvas(parent.props.surfaceMode);
      }
      // Parent is a frame — check frame's parent
      if (parent?.type === 'frame' && parent.parentId) {
        const grandparent = this.editor.getShape(parent.parentId) as any;
        if (grandparent?.type === CONTAINER_SHAPE_TYPE && grandparent.props?.surfaceMode) {
          return normalizeSurfaceModeForCanvas(grandparent.props.surfaceMode);
        }
      }
    }

    // 2. Visual overlap detection — find any container that encloses this shape
    const shapeBounds = this.editor.getShapePageBounds(shape.id) as any;
    if (!shapeBounds) return null;

    const allShapes = this.editor.getCurrentPageShapes() as any[];
    const containers = allShapes.filter(
      (s) => s.type === CONTAINER_SHAPE_TYPE && s.props?.surfaceMode && s.props.surfaceMode !== 'default'
    );

    // Use whichever property exists (tldraw Box2d uses w/h or width/height depending on version)
    const sw = shapeBounds.w ?? shapeBounds.width ?? 0;
    const sh = shapeBounds.h ?? shapeBounds.height ?? 0;

    for (const container of containers) {
      const cb = this.editor.getShapePageBounds(container.id) as any;
      if (!cb) continue;

      const cw = cb.w ?? cb.width ?? 0;
      const ch = cb.h ?? cb.height ?? 0;

      // Check if the shape's center is inside the container
      const cx = shapeBounds.x + sw / 2;
      const cy = shapeBounds.y + sh / 2;
      if (
        cx >= cb.x &&
        cx <= cb.x + cw &&
        cy >= cb.y &&
        cy <= cb.y + ch
      ) {
        return normalizeSurfaceModeForCanvas(container.props.surfaceMode);
      }
    }

    return null;
  }

  component(shape: any) {
    const isEditing = this.editor.getEditingShapeId() === shape.id;
    const isSelected = this.editor.getSelectedShapeIds().includes(shape.id);
    const isPreview = (this.editor as any).__oneui_preview ?? false;
    const entry = COMPONENT_REGISTRY[shape.props.componentType];
    const componentType = shape.props.componentType;

    const interactive = isPreview || isEditing;

    if (!entry) {
      return <ComponentShapeFallback shape={shape} interactive={interactive} componentType={componentType} />;
    }

    const Component = entry.component;
    const props = shape.props.componentProps as Record<string, any>;

    if (Component) {
      return (
        <ComponentShapeRenderer
          shape={shape}
          Component={Component}
          componentProps={props}
          componentType={componentType}
          entry={entry}
          isEditing={isEditing}
          isSelected={isSelected}
          interactive={interactive}
          editor={this.editor}
        />
      );
    }

    return null;
  }

  indicator(shape: any) {
    const isGeoDriven = GEOMETRY_DRIVEN_COMPONENTS.has(shape.props.componentType);
    const measured = _measuredSizes.get(shape.id);
    const w = isGeoDriven ? shape.props.w : (measured?.width ?? shape.props.w);
    const h = isGeoDriven ? shape.props.h : (measured?.height ?? shape.props.h);
    return <rect width={w} height={h} />;
  }
}

// ---------------------------------------------------------------------------
// React component for rendering — allows hooks (useDynamicComponentSize)
// ---------------------------------------------------------------------------

function ComponentShapeRenderer({
  shape, Component, componentProps, componentType, entry,
  isEditing, isSelected, interactive, editor,
}: {
  shape: any; Component: any; componentProps: Record<string, any>;
  componentType: string; entry: any;
  isEditing: boolean; isSelected: boolean; interactive: boolean; editor: any;
}) {
  const frameSurfaceCtx = useFrameArtboardSurfaceContext();
  const frameSurfaces = frameSurfaceCtx?.surfaces;
  const frameSubCtx = useFrameThemeContext();

  /** Parent frame artboard surface first, then overlapping ContainerShapes (same order as before). */
  let surfaceModeForDataAttr = '';
  let surfaceContainerAppearance = '';
  let normalizedCanvasSurfaceMode = '';
  let frameSurfaceResolved = false;
  try {
    const parentId = shape.parentId;
    if (parentId) {
      const parent = editor.getShape(parentId) as any;
      if (parent?.type === 'frame') {
        // Try React context first, then fall back to the module-level store
        // (the store persists across React roots and works during tldraw export)
        const fs = frameSurfaces?.[parentId] ?? getFrameArtboardSurface(parentId);
        if (fs) {
          const n = normalizeSurfaceModeForCanvas(fs.rawMode);
          normalizedCanvasSurfaceMode = n;
          surfaceContainerAppearance = fs.appearance;
          surfaceModeForDataAttr = n === 'default' ? '' : n;
          frameSurfaceResolved = true;
        }
      }
    }

    if (!frameSurfaceResolved) {
      const shapeBounds = editor.getShapePageBounds(shape.id) as any;
      if (shapeBounds) {
        const sw = shapeBounds.w ?? shapeBounds.width ?? 0;
        const sh = shapeBounds.h ?? shapeBounds.height ?? 0;
        const cx = shapeBounds.x + sw / 2;
        const cy = shapeBounds.y + sh / 2;

        const allShapes = editor.getCurrentPageShapes() as any[];
        for (const s of allShapes) {
          if (s.type !== CONTAINER_SHAPE_TYPE) continue;
          const app = s.props?.appearance ?? '';
          const sm = s.props?.surfaceMode ?? '';
          if (app !== 'brand-bg' && (!sm || sm === 'default')) continue;

          const cb = editor.getShapePageBounds(s.id) as any;
          if (!cb) continue;
          const cw = cb.w ?? cb.width ?? 0;
          const ch = cb.h ?? cb.height ?? 0;

          if (cx >= cb.x && cx <= cb.x + cw && cy >= cb.y && cy <= cb.y + ch) {
            const n = normalizeSurfaceModeForCanvas(sm);
            normalizedCanvasSurfaceMode = n;
            surfaceContainerAppearance = app;
            surfaceModeForDataAttr = n === 'default' ? '' : n;
            break;
          }
        }
      }
    }

    // No persisted-_surfaceContext fallback: that path applied data-surface
    // without a matching surfaceContainerAppearance, so the brand CSS
    // [data-surface="bold"] block remapped --Text-High to the bold on-colour
    // (white) even when the frame fill was still white. Result: invisible
    // text on a white frame in the wizard capture pipeline. The active
    // detection above (frame artboard surface via React context / module
    // store + overlapping ContainerShape) covers both edit mode and the
    // export render — OneUIExportProvider re-supplies the contexts during
    // ed.toImage(), so we don't need a stale-prop fallback.
  } catch {
    // Detection failed — leave empty
  }

  // Sub-brand: try React context first, then module-level export context store
  const exportCtx = getArtboardFrameExportContext();
  const subBrandLookup = frameSubCtx?.frameSubBrandByFrameId ?? exportCtx?.frameSubBrandByFrameId;
  const subBrandId = subBrandLookup
    ? getSubBrandIdForShape(editor, shape.id, subBrandLookup)
    : null;
  const subBrandDataAttr =
    subBrandId && subBrandId.length > 0 ? ({ 'data-oneui-subbrand': subBrandId } as const) : {};

  /** Brand-BG artboard surface: ContentBlock CTAs stay Primary (button colouring). */
  const effectiveComponentProps = useMemo(() => {
    if (componentType !== 'ContentBlock') return componentProps;
    if (surfaceContainerAppearance === 'brand-bg') {
      return { ...componentProps, buttonAppearance: 'primary' };
    }
    return componentProps;
  }, [componentProps, componentType, surfaceContainerAppearance]);

  const isWidthResizable = WIDTH_RESIZABLE_COMPONENTS.has(componentType);
  const isGeometryDriven = GEOMETRY_DRIVEN_COMPONENTS.has(componentType);

  // JioRibbon with symbol: allow direct symbol drag on the canvas when selected.
  const isJioRibbonWithSymbol =
    componentType === 'JioRibbon' && componentProps.variant === 'dots-with-symbol';

  // ContentBlock: allow direct text editing when selected.
  const isContentBlock = componentType === 'ContentBlock';

  const finalInteractive =
    interactive || (isJioRibbonWithSymbol && isSelected) || (isContentBlock && isSelected);

  // JioRibbon: symbol drag → update symbolPosition prop.
  const handleSymbolPositionChange = useCallback(
    (position: number) => {
      updateShapeProp(editor, shape.id as TLShapeId, 'symbolPosition', position);
    },
    [editor, shape.id],
  );

  // ContentBlock inline editing state.
  const [cbEditField, setCbEditField] = useState<string | null>(null);
  const [cbEditInitialValue, setCbEditInitialValue] = useState('');
  const [cbEditBounds, setCbEditBounds] = useState<{
    top: number; left: number; width: number; height: number;
  } | null>(null);
  const [cbEditStyle, setCbEditStyle] = useState<CSSProperties>({});
  const cbDivRef = useRef<HTMLDivElement>(null);

  // When a field starts editing: set textContent, focus, select-all.
  useEffect(() => {
    const el = cbDivRef.current;
    if (!cbEditField || !el) return;
    el.textContent = cbEditInitialValue;
    el.focus();
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(el);
    sel?.removeAllRanges();
    sel?.addRange(range);
  }, [cbEditField, cbEditInitialValue]);

  const commitCbEdit = useCallback(() => {
    if (!cbEditField || !cbDivRef.current) return;
    const value = cbDivRef.current.textContent ?? '';
    updateShapeProp(editor, shape.id as TLShapeId, cbEditField, value);
    setCbEditField(null);
  }, [editor, shape.id, cbEditField]);

  const cancelCbEdit = useCallback(() => setCbEditField(null), []);

  const handleContentBlockClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelected) return;

    // Walk up from click target to find data-cb-field.
    let el: Element | null = e.target as Element;
    let field: string | null = null;
    while (el && el !== e.currentTarget) {
      const f = el.getAttribute('data-cb-field');
      if (f) { field = f; break; }
      el = el.parentElement;
    }
    if (!field || !el) return;

    const container = e.currentTarget;
    const containerRect = container.getBoundingClientRect();

    // Derive CSS zoom: container.offsetWidth is CSS px; containerRect.width is screen px.
    const zoom = containerRect.width / (container.offsetWidth || 1);

    const elRect = (el as HTMLElement).getBoundingClientRect();
    const cs = getComputedStyle(el as HTMLElement);

    // If clicking a different field while editing, commit the current one first.
    if (cbEditField && cbEditField !== field) {
      commitCbEdit();
    }

    setCbEditField(field);
    setCbEditInitialValue(String((componentProps as Record<string, unknown>)[field] ?? ''));
    setCbEditBounds({
      top: (elRect.top - containerRect.top) / zoom,
      left: (elRect.left - containerRect.left) / zoom,
      width: (el as HTMLElement).offsetWidth,
      height: (el as HTMLElement).offsetHeight,
    });
    setCbEditStyle({
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      fontFamily: cs.fontFamily,
      lineHeight: cs.lineHeight,
      color: cs.color,
      textAlign: cs.textAlign as CSSProperties['textAlign'],
      letterSpacing: cs.letterSpacing,
      whiteSpace: cs.whiteSpace,
      wordBreak: cs.wordBreak as CSSProperties['wordBreak'],
    });
  }, [isSelected, cbEditField, commitCbEdit, componentProps]);

  const measureRef = useDynamicComponentSize(shape.id);

  const measured = _measuredSizes.get(shape.id);
  const w = isWidthResizable ? shape.props.w : (measured?.width ?? shape.props.w);
  const h = measured?.height ?? shape.props.h;

  let wrapperStyle: CSSProperties;
  if (isWidthResizable) {
    wrapperStyle = { width: w };
  } else if (isGeometryDriven) {
    wrapperStyle = { display: 'inline-block' };
  } else {
    wrapperStyle = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };
  }

  return (
    <HTMLContainer
      style={{
        width: isWidthResizable ? w : undefined,
        height: isWidthResizable ? undefined : (isGeometryDriven ? undefined : h),
        overflow: 'visible',
        pointerEvents: finalInteractive ? 'all' : 'none',
        position: 'relative',
      }}
      onPointerDown={finalInteractive ? editor.markEventAsHandled : undefined}
      {...(surfaceModeForDataAttr ? { 'data-surface': surfaceModeForDataAttr } : {})}
      {...subBrandDataAttr}
    >
      <div
        ref={measureRef}
        role="region"
        aria-label={`${entry.meta?.displayName ?? componentType}`}
        data-component-type={componentType}
        data-testid={shape.id}
        style={wrapperStyle}
        {...(surfaceModeForDataAttr ? { 'data-surface': surfaceModeForDataAttr } : {})}
        {...subBrandDataAttr}
      >
        {isEditing && componentType !== 'ContentBlock' ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <Component {...componentProps}>
              {shape.props.childText || undefined}
            </Component>
            <input
              type="text"
              value={shape.props.childText || ''}
              onChange={(e) => {
                editor.updateShape({
                  id: shape.id,
                  type: COMPONENT_SHAPE_TYPE as any,
                  props: { childText: e.target.value },
                } as any);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Escape') {
                  editor.setEditingShape(null);
                }
                e.stopPropagation();
              }}
              autoFocus
              style={{
                width: '100%',
                padding: '2px 6px',
                fontSize: 'var(--Code-S-FontSize)',
                fontFamily: 'var(--Typography-Font-Code)',
                border: 'var(--Stroke-M) solid var(--Neutral-Tinted)',
                borderRadius: 'var(--Shape-2)',
                background: 'var(--Surface-Elevated)',
                color: 'var(--Text-High)',
                outline: 'none',
                textAlign: 'center',
              }}
            />
          </div>
        ) : isContentBlock ? (
          <div
            style={{ position: 'relative', width: '100%' }}
            onClick={handleContentBlockClick}
          >
            <Component
              {...effectiveComponentProps}
              _cbEditField={cbEditField ?? undefined}
              {...(componentType === 'ContentBlock'
                ? {
                    _canvasSurfaceAppearance: surfaceContainerAppearance || undefined,
                    _canvasSurfaceMode: normalizedCanvasSurfaceMode || undefined,
                  }
                : {})}
            />
            {cbEditField && cbEditBounds && (
              <div
                ref={cbDivRef}
                contentEditable
                suppressContentEditableWarning
                onBlur={commitCbEdit}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') { cancelCbEdit(); }
                  else if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitCbEdit(); }
                  e.stopPropagation();
                }}
                onPaste={(e) => {
                  // Strip formatting — paste as plain text only.
                  e.preventDefault();
                  const text = e.clipboardData.getData('text/plain');
                  document.execCommand('insertText', false, text);
                }}
                style={{
                  position: 'absolute',
                  top: cbEditBounds.top,
                  left: cbEditBounds.left,
                  width: cbEditBounds.width,
                  minHeight: cbEditBounds.height,
                  ...cbEditStyle,
                  background: 'transparent',
                  border: 'none',
                  outline: '1.5px solid var(--Primary-Default, var(--Neutral-Tinted))',
                  outlineOffset: '3px',
                  borderRadius: '1px',
                  padding: 0,
                  margin: 0,
                  zIndex: 20,
                  cursor: 'text',
                  overflow: 'visible',
                }}
              />
            )}
          </div>
        ) : (
          <Component
            {...componentProps}
            {...(isJioRibbonWithSymbol && isSelected
              ? { onSymbolPositionChange: handleSymbolPositionChange }
              : {})}
          >
            {shape.props.childText || undefined}
          </Component>
        )}
      </div>
      {/* Type label — filtered out of SVG export rasterisation */}
      <span
        data-component-type-label="true"
        data-tldraw-export-skip="true"
        style={{
          position: 'absolute',
          top: -14,
          left: 0,
          fontSize: 'var(--Code-XS-FontSize)',
          fontFamily: 'var(--Typography-Font-Code)',
          color: 'var(--Neutral-Tinted)',
          opacity: isSelected ? 1 : 0,
          transition: 'opacity 0.15s',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
        }}
      >
        {entry.meta?.displayName ?? componentType}
      </span>
    </HTMLContainer>
  );
}

// ---------------------------------------------------------------------------
// Fallback renderer (no entry in registry)
// ---------------------------------------------------------------------------

function ComponentShapeFallback({ shape, interactive, componentType }: { shape: any; interactive: boolean; componentType: string }) {
  return (
    <HTMLContainer
      style={{
        width: shape.props.w,
        height: shape.props.h,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--Neutral-Minimal)',
        borderRadius: 'var(--Shape-3-5)',
        border: 'var(--Stroke-M) dashed var(--Neutral-Stroke-Low)',
        color: 'var(--Text-Medium)',
        fontSize: 'var(--Body-S-FontSize)',
        pointerEvents: interactive ? 'all' : 'none',
      }}
    >
      {componentType}
    </HTMLContainer>
  );
}
