/**
 * ExperienceCanvas.tsx
 *
 * tldraw-powered infinite canvas for composing OneUI components.
 *
 * UI layout:
 * - Left sidebar: Artboard presets, Component library, Template library
 * - Canvas: tldraw with custom component shapes + frames
 * - Right overlay: PropPanel (on selection)
 * - tldraw's default style panel is hidden (irrelevant for components)
 */

'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  Tldraw,
  track,
  useEditor,
  createShapeId,
  type Editor,
  type TLUiComponents,
  type TLUiOverrides,
} from 'tldraw';
import 'tldraw/tldraw.css';
import { ComponentShapeUtil, COMPONENT_SHAPE_TYPE } from './ComponentShape';
import { ContainerShapeUtil, CONTAINER_SHAPE_TYPE, normalizeSurfaceModeForCanvas } from './ContainerShape';
import { PropPanel } from './PropPanel';
import { LayersPanelBody } from './LayersPanel';
// CanvasMode(Toolbar) was the old right-side vertical AI / Edit / Draw /
// Preview pill. It's been folded into CanvasControlsCluster at the bottom.
// Only the type alias survives so existing local state typing keeps working.
type CanvasWorkMode = 'ai' | 'edit' | 'draw' | 'preview';
import { Select } from '@oneui/ui-internal/components/Select/Select';
import { Button } from '@oneui/ui-internal/components/Button/Button';
import { IconButton } from '@oneui/ui-internal/components/IconButton/IconButton';
import { Input } from '@oneui/ui-internal/components/Input/Input';
import { ScrollArea } from '@oneui/ui-internal/components/ScrollArea/ScrollArea';
import { Collapsible } from '@oneui/ui-internal/components/Collapsible/Collapsible';
import { Menu } from '@oneui/ui-internal/components/Menu/Menu';
import { Icon } from '@oneui/ui-internal/icons/Icon';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import {
  enableAutoLayout, disableAutoLayout, hasAutoLayout, getLayoutConfig,
  setLayoutConfig, applyAutoLayout, DEFAULT_LAYOUT,
  type LayoutDirection, type LayoutAlign,
} from './autoLayout';
import {
  getSelectedComponentInfo,
  canvasToAST,
  validateCanvas,
  type ValidationError,
} from './useCanvasEditor';
import { getAllComponentMetas } from '@oneui/ui-internal/registry/componentRegistry';
import {
  TEMPLATE_REGISTRY,
  COMPOSITION_TEMPLATES,
} from '@oneui/shared/templates';
import { astToReact } from '@oneui/shared/codegen';
import type { ASTRoot } from '@oneui/shared';
import {
  collectComponents,
  sanitizeComponentPropsForTldraw,
  computeRibbonPosition,
  computeContentBlockPosition,
} from './canvasHelpers';
import { ContentBlockFoundationPlatformsContext } from './ContentBlockFoundationContext';
import { FrameThemeContext, type ArtboardSubBrandOption, type FrameThemeContextValue } from './FrameThemeContext';
import { FrameArtboardSurfaceContext } from './FrameArtboardSurfaceContext';
import { ArtboardSubBrandStyleTags } from './ArtboardSubBrandStyleTags';
import {
  type FrameArtboardSurface,
  putFrameArtboardSurface,
  setArtboardFrameExportContext,
  setArtboardFrameExportIncludeBackground,
} from './artboardFrameSurfaceStore';
import { OneUIFrameShapeUtil } from './OneUIFrameShapeUtil';
import { SketchHTMLShapeUtil } from './SketchHTMLShape';
import { ArtboardToolbar } from './ArtboardToolbar';
import { CanvasControlsCluster } from './CanvasControlsCluster';
import { CanvasChatPanel } from './CanvasChatPanel';
import { CanvasViewModeSwitch } from './CanvasViewModeSwitch';
import { cleanFinalSvgString } from './svgCleanup';
import {
  frameAppearanceOptionsFromFoundations,
  frameModesForAppearance,
  frameSurfaceSwatchCss,
  type AppearanceConfigLike,
} from './artboardSurfaces';
import {
  computeRibbonGeometry,
  resolveOrientation,
  defaultPlacement as ribbonDefaultPlacement,
  JIO_DEFAULT_COLORS,
  type JioRibbonSize,
} from '../JioRibbon/JioRibbon.shared';
import { PLATFORM_CONFIG_PRESETS } from '@oneui/shared';
import type { PlatformEntry } from '@oneui/shared';
import styles from './ExperienceCanvas.module.css';

/** Raw `getBrandOverviewData` (or subset) for appearance accents + surfaces — drives artboard Surface UI. */
export const ArtboardBrandOverviewContext = createContext<Record<string, unknown> | null>(null);

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

// Artboard presets derived from foundation platform breakpoints.
// Heights are standard device ratios for each breakpoint class.
const BREAKPOINT_HEIGHTS: Record<number, number> = {
  360: 780, 390: 844, 768: 1024, 1024: 768, 1440: 900, 1920: 1080,
};

const ARTBOARD_PRESETS = (() => {
  const webPreset = PLATFORM_CONFIG_PRESETS.find((p) => p.id === 'web');
  if (!webPreset) return [];
  return webPreset.defaultBreakpoints
    .filter((bp) => bp.isActive)
    .map((bp) => ({
      name: bp.id,
      w: bp.viewportWidth,
      h: BREAKPOINT_HEIGHTS[bp.viewportWidth] ?? Math.round(bp.viewportWidth * 0.625),
      label: bp.label,
    }));
})();

export type ArtboardPreset = { name: string; w: number; h: number; label: string };

export const ArtboardPresetsContext = createContext<ArtboardPreset[]>(ARTBOARD_PRESETS);

// Match actual intrinsic rendered sizes as closely as possible
const COMPONENT_DEFAULTS: Record<string, { w: number; h: number; text: string }> = {
  Button:        { w: 96,  h: 36,  text: 'Button' },
  IconButton:    { w: 36,  h: 36,  text: '' },
  Avatar:        { w: 32,  h: 32,  text: '' },
  Checkbox:      { w: 20,  h: 20,  text: '' },
  Radio:         { w: 20,  h: 20,  text: '' },
  Switch:        { w: 36,  h: 20,  text: '' },
  Stepper:       { w: 108, h: 36,  text: '' },
  IconContained: { w: 32,  h: 32,  text: '' },
  Icon:          { w: 24,  h: 24,  text: '' },
  Image:         { w: 160, h: 120, text: '' },
  CounterBadge:  { w: 24,  h: 24,  text: '' },
  IndicatorBadge:{ w: 12,  h: 12,  text: '' },
  Divider:       { w: 200, h: 2,   text: '' },
  Chip:          { w: 80,  h: 32,  text: 'Chip' },
  SelectableButton:          { w: 96,  h: 36,  text: 'Select' },
  SelectableIconButton:      { w: 36,  h: 36,  text: '' },
  SelectableSingleTextButton:{ w: 36,  h: 36,  text: 'A' },
  WebHeader:     { w: 390, h: 56,  text: '' },
  JioRibbon:     { w: 200, h: 200, text: '' },
  ContentBlock:  { w: 1080,h: 1080,text: '' },
};

// Static arrays — OneUIFrameShapeUtil extends FrameShapeUtil with patched fills; TS construct signatures differ slightly from tldraw’s exported util type.
const customShapeUtils = [
  ComponentShapeUtil,
  ContainerShapeUtil,
  OneUIFrameShapeUtil.configure({ showColors: true }),
  SketchHTMLShapeUtil,
] as const as unknown as Parameters<typeof Tldraw>[0]['shapeUtils'];

// Hide tldraw's irrelevant UI (color picker, fill, dash, size)
const tldrawComponents: Partial<TLUiComponents> = {
  StylePanel: null,
  HelpMenu: null,
};

// Prune the tldraw toolset to the set exposed by CanvasControlsCluster's
// bottom pill (select / hand / geo / text / draw). Removing eraser / arrow /
// note / asset / highlight / laser keeps tldraw's internal registrations
// minimal without hiding the tools the bottom cluster dispatches to.
const tldrawOverrides: TLUiOverrides = {
  tools: (_editor, tools) => {
    delete tools.eraser;
    delete tools.arrow;
    delete tools.note;
    delete tools.asset;
    delete tools.highlight;
    delete tools.laser;
    return tools;
  },
};

// ---------------------------------------------------------------------------
// Selection-aware prop panel + frame actions
// ---------------------------------------------------------------------------

// SelectionPanel moved to ./SelectionPanel.tsx — imported below to keep the
// single surface-aware inspector while breaking the ExperienceCanvas ↔
// CanvasChatPanel import cycle. `MultiSelectionActions` and `FrameActions`
// below are exported so SelectionPanel can mount them.

// ---------------------------------------------------------------------------
// Multi-selection actions — auto-layout wrap
// ---------------------------------------------------------------------------

export function MultiSelectionActions({ editor, count }: { editor: Editor; count: number }) {
  const handleAutoLayout = useCallback(
    (direction: 'column' | 'row') => {
      const selectedIds = editor.getSelectedShapeIds();
      const shapes = selectedIds
        .map((id) => editor.getShape(id))
        .filter(Boolean) as any[];

      if (shapes.length < 2) return;

      // Calculate bounding box of all selected shapes
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      for (const shape of shapes) {
        minX = Math.min(minX, shape.x);
        minY = Math.min(minY, shape.y);
        maxX = Math.max(maxX, shape.x + (shape.props?.w ?? 100));
        maxY = Math.max(maxY, shape.y + (shape.props?.h ?? 44));
      }

      const padding = 16;
      const gap = 12;

      // Sort shapes by position (top-to-bottom for column, left-to-right for row)
      const sorted = [...shapes].sort((a, b) =>
        direction === 'column' ? a.y - b.y : a.x - b.x
      );

      // Calculate frame dimensions
      let totalW = 0, totalH = 0;
      if (direction === 'column') {
        totalW = Math.max(...sorted.map((s) => s.props?.w ?? 100));
        totalH = sorted.reduce((sum, s) => sum + (s.props?.h ?? 44), 0) + gap * (sorted.length - 1);
      } else {
        totalW = sorted.reduce((sum, s) => sum + (s.props?.w ?? 100), 0) + gap * (sorted.length - 1);
        totalH = Math.max(...sorted.map((s) => s.props?.h ?? 44));
      }

      // Create wrapping frame
      const frameId = createShapeId();
      editor.createShape({
        id: frameId,
        type: 'frame',
        x: minX - padding,
        y: minY - padding,
        props: {
          w: totalW + padding * 2,
          h: totalH + padding * 2,
          name: `${direction === 'column' ? 'V' : 'H'}-Stack`,
          color: 'white',
        },
      });

      // Reparent shapes into the frame and arrange them.
      // Coordinates are RELATIVE to the frame origin after reparenting.
      let relX = padding;
      let relY = padding;

      for (const shape of sorted) {
        editor.updateShape({
          id: shape.id,
          type: shape.type,
          x: relX,
          y: relY,
          parentId: frameId,
        } as any);

        if (direction === 'column') {
          relY += (shape.props?.h ?? 44) + gap;
        } else {
          relX += (shape.props?.w ?? 100) + gap;
        }
      }

      // Select the new frame
      editor.select(frameId);
    },
    [editor],
  );

  const handleAlignSelected = useCallback(
    (align: 'left' | 'center' | 'right') => {
      const selectedIds = editor.getSelectedShapeIds();
      const shapes = selectedIds
        .map((id) => editor.getShape(id))
        .filter(Boolean) as any[];

      if (shapes.length < 2) return;

      if (align === 'left') {
        const minX = Math.min(...shapes.map((s) => s.x));
        for (const shape of shapes) {
          editor.updateShape({ id: shape.id, type: shape.type, x: minX } as any);
        }
      } else if (align === 'right') {
        const maxRight = Math.max(...shapes.map((s) => s.x + (s.props?.w ?? 100)));
        for (const shape of shapes) {
          editor.updateShape({ id: shape.id, type: shape.type, x: maxRight - (shape.props?.w ?? 100) } as any);
        }
      } else {
        const avgX = shapes.reduce((sum, s) => sum + s.x + (s.props?.w ?? 100) / 2, 0) / shapes.length;
        for (const shape of shapes) {
          editor.updateShape({ id: shape.id, type: shape.type, x: avgX - (shape.props?.w ?? 100) / 2 } as any);
        }
      }
    },
    [editor],
  );

  const handleDistribute = useCallback(
    (direction: 'vertical' | 'horizontal') => {
      const selectedIds = editor.getSelectedShapeIds();
      const shapes = selectedIds
        .map((id) => editor.getShape(id))
        .filter(Boolean) as any[];

      if (shapes.length < 3) return; // Need at least 3 to distribute

      if (direction === 'vertical') {
        const sorted = [...shapes].sort((a, b) => a.y - b.y);
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        const totalSpan = (last.y + (last.props?.h ?? 40)) - first.y;
        const totalH = sorted.reduce((sum, s) => sum + (s.props?.h ?? 40), 0);
        const gap = (totalSpan - totalH) / (sorted.length - 1);

        let y = first.y;
        for (const shape of sorted) {
          editor.updateShape({ id: shape.id, type: shape.type, y } as any);
          y += (shape.props?.h ?? 40) + gap;
        }
      } else {
        const sorted = [...shapes].sort((a, b) => a.x - b.x);
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        const totalSpan = (last.x + (last.props?.w ?? 100)) - first.x;
        const totalW = sorted.reduce((sum, s) => sum + (s.props?.w ?? 100), 0);
        const gap = (totalSpan - totalW) / (sorted.length - 1);

        let x = first.x;
        for (const shape of sorted) {
          editor.updateShape({ id: shape.id, type: shape.type, x } as any);
          x += (shape.props?.w ?? 100) + gap;
        }
      }
    },
    [editor],
  );

  return (
    <div className={styles.frameActions}>
      <div className={styles.frameHeader}>
        <span className={styles.frameTitle}>{count} selected</span>
      </div>

      <div className={styles.frameSection}>
        <span className={styles.frameSectionTitle}>Auto Layout</span>
        <div className={styles.frameButtons}>
          <button className={styles.frameButton} onClick={() => handleAutoLayout('column')}>
            Wrap Vertical
          </button>
          <button className={styles.frameButton} onClick={() => handleAutoLayout('row')}>
            Wrap Horizontal
          </button>
        </div>
      </div>

      <div className={styles.frameSection}>
        <span className={styles.frameSectionTitle}>Align</span>
        <div className={styles.frameButtons}>
          <button className={styles.frameButton} onClick={() => handleAlignSelected('left')}>Left</button>
          <button className={styles.frameButton} onClick={() => handleAlignSelected('center')}>Center</button>
          <button className={styles.frameButton} onClick={() => handleAlignSelected('right')}>Right</button>
        </div>
      </div>

      <div className={styles.frameSection}>
        <span className={styles.frameSectionTitle}>Distribute</span>
        <div className={styles.frameButtons}>
          <button className={styles.frameButton} onClick={() => handleDistribute('vertical')}>Vertical</button>
          <button className={styles.frameButton} onClick={() => handleDistribute('horizontal')}>Horizontal</button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Export panel — multi-format artboard export (PNG, JPEG, WebP, SVG)
// ---------------------------------------------------------------------------

type ExportFormat = 'png' | 'jpeg' | 'webp' | 'svg';
type ExportScale = 0.5 | 1 | 2 | 3 | 4;

const EXPORT_FORMATS: { value: ExportFormat; label: string }[] = [
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'webp', label: 'WebP' },
  { value: 'svg', label: 'SVG' },
];

const EXPORT_SCALES: ExportScale[] = [0.5, 1, 2, 3, 4];

function sanitizeFilename(name: string): string {
  return name.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').trim() || 'artboard';
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function ExportPanel({
  editor,
  frameId,
  frameName,
}: {
  editor: Editor;
  frameId: string;
  frameName?: string;
}) {
  const [format, setFormat] = useState<ExportFormat>('png');
  const [scale, setScale] = useState<ExportScale>(2);
  const [quality, setQuality] = useState(0.9);
  const [includeBackground, setIncludeBackground] = useState(true);
  const [exporting, setExporting] = useState(false);

  const effectiveBackground = format === 'jpeg' ? true : includeBackground;

  const handleExport = useCallback(async () => {
    setExporting(true);
    // Tell `OneUIFrameShapeUtil.toSvg()` whether to emit the artboard fill
    // rect for this export. Restored in `finally` so authoring/preview
    // (and any subsequent export) is unaffected.
    setArtboardFrameExportIncludeBackground(effectiveBackground);
    try {
      // Finalize any in-progress interaction (dragging, text editing, etc.)
      editor.complete();

      // Double-rAF: wait for React render cycle + tldraw re-render
      await new Promise<void>((r) => {
        requestAnimationFrame(() => requestAnimationFrame(() => r()));
      });

      // Collect the frame + all descendant shape IDs. Passing multiple IDs
      // prevents tldraw's single-frame optimisation which skips the frame shape
      // (and its OneUI surface fill) and uses props.color for the background
      // instead. With multiple IDs, OneUIFrameShapeUtil.toSvg() is called and
      // correctly patches the artboard fill.
      const descendantIds = [...editor.getShapeAndDescendantIds([frameId as any])];
      const shapeIds = descendantIds.length > 1 ? descendantIds : [frameId as any];

      // Use the frame's page bounds so the output is clipped to the artboard
      const frameBounds = editor.getShapePageBounds(frameId as any);

      const baseName = sanitizeFilename(frameName || 'artboard');
      const boundsOpt = frameBounds ? { bounds: frameBounds, padding: 0 } : { padding: 0 };

      if (format === 'svg') {
        const result = await editor.getSvgString(shapeIds, {
          scale,
          background: effectiveBackground,
          ...boundsOpt,
        });
        if (!result) return;
        // Final cleanup pass: strips tldraw's per-shape clipPath wrappers
        // (each frame-sized clip becomes a "Clip path group" + "Vector"
        // pair in Figma, with no visual effect since the frame already
        // clips), removes leftover dom-to-svg debug attributes that
        // escaped per-shape cleanup, drops auto-generated ids that show
        // as noise layer names ("div1", "Group", etc.), and unwraps
        // single-child structural <g> nests for a flat, importable SVG.
        const cleanedSvg = cleanFinalSvgString(result.svg);
        const blob = new Blob([cleanedSvg], { type: 'image/svg+xml' });
        downloadBlob(blob, `${baseName}.svg`);
      } else {
        const result = await editor.toImage(shapeIds, {
          format,
          scale,
          background: effectiveBackground,
          ...boundsOpt,
          ...(format !== 'png' ? { quality } : {}),
        } as any);
        if (!result) return;
        const blob = 'blob' in result ? result.blob : result;
        const ext = format === 'jpeg' ? 'jpg' : format;
        downloadBlob(blob as Blob, `${baseName}.${ext}`);
      }
    } catch (err) {
      console.warn('Export failed:', err);
    } finally {
      setArtboardFrameExportIncludeBackground(true);
      setExporting(false);
    }
  }, [editor, frameId, frameName, format, scale, quality, effectiveBackground]);

  const showQuality = format === 'jpeg' || format === 'webp';

  return (
    <div className={styles.exportPanel}>
      {/* Format */}
      <div className={styles.exportRow}>
        <span className={styles.exportRowLabel}>Format</span>
        <div className={styles.exportChips}>
          {EXPORT_FORMATS.map((f) => (
            <button
              key={f.value}
              className={styles.exportChip}
              data-active={format === f.value || undefined}
              onClick={() => setFormat(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Scale */}
      <div className={styles.exportRow}>
        <span className={styles.exportRowLabel}>Scale</span>
        <div className={styles.exportChips}>
          {EXPORT_SCALES.map((s) => (
            <button
              key={s}
              className={styles.exportChip}
              data-active={scale === s || undefined}
              onClick={() => setScale(s)}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Quality (JPEG/WebP only) */}
      {showQuality && (
        <div className={styles.exportRow}>
          <span className={styles.exportRowLabel}>Quality</span>
          <input
            type="range"
            className={styles.exportQualitySlider}
            min={0.1}
            max={1}
            step={0.05}
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
          />
          <span className={styles.exportQualityValue}>{Math.round(quality * 100)}%</span>
        </div>
      )}

      {/* Background */}
      <div className={styles.exportRow}>
        <input
          type="checkbox"
          className={styles.exportBackgroundCheck}
          checked={effectiveBackground}
          disabled={format === 'jpeg'}
          onChange={(e) => setIncludeBackground(e.target.checked)}
          id={`export-bg-${frameId}`}
        />
        <label className={styles.exportBackgroundLabel} htmlFor={`export-bg-${frameId}`}>
          Background
        </label>
        {format === 'jpeg' && (
          <span className={styles.exportBackgroundNote}>Required for JPEG</span>
        )}
      </div>

      {/* Export button */}
      <button
        className={styles.exportActionButton}
        onClick={handleExport}
        disabled={exporting}
      >
        {exporting ? 'Exporting…' : `Export ${format.toUpperCase()}`}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Frame actions — auto-layout + quick add components into frame
// ---------------------------------------------------------------------------

export function FrameActions({ editor, frameId, frameName }: { editor: Editor; frameId: string; frameName?: string }) {
  const artboardPresets = useContext(ArtboardPresetsContext);
  const frameSubBrandCtx = useContext(FrameThemeContext);
  const surfaceApi = useContext(FrameArtboardSurfaceContext);
  const brandOverview = useContext(ArtboardBrandOverviewContext);
  const appearanceConfig = brandOverview?.appearanceConfig as AppearanceConfigLike;
  const appearanceOptions = useMemo(
    () => frameAppearanceOptionsFromFoundations(appearanceConfig ?? null),
    [appearanceConfig],
  );

  const metas = useMemo(() => getAllComponentMetas(), []);
  const [gap, setGap] = useState(12);
  const [padding, setPadding] = useState(16);

  const defaultAppearance = useMemo(() => {
    if (appearanceOptions.includes('primary')) return 'primary';
    return appearanceOptions[0] ?? 'primary';
  }, [appearanceOptions]);

  const defaultMode = useMemo(() => {
    const modes = frameModesForAppearance(defaultAppearance);
    return modes[0] ?? 'default';
  }, [defaultAppearance]);

  const [frameAppearance, setFrameAppearance] = useState<string>(defaultAppearance);
  const [frameSurfaceMode, setFrameSurfaceMode] = useState<string>(defaultMode);

  useEffect(() => {
    if (appearanceOptions.length === 0) return;
    if (!appearanceOptions.includes(frameAppearance)) {
      const next = appearanceOptions.includes('primary') ? 'primary' : appearanceOptions[0];
      setFrameAppearance(next);
      const modes = frameModesForAppearance(next);
      setFrameSurfaceMode(modes[0] ?? 'default');
    }
  }, [appearanceOptions, frameAppearance]);

  const surfaceForFrame = surfaceApi?.surfaces[frameId];

  useEffect(() => {
    if (surfaceForFrame) {
      setFrameAppearance(surfaceForFrame.appearance);
      setFrameSurfaceMode(surfaceForFrame.rawMode);
    } else {
      setFrameAppearance(defaultAppearance);
      setFrameSurfaceMode(defaultMode);
    }
  }, [frameId, surfaceForFrame?.appearance, surfaceForFrame?.rawMode, defaultAppearance, defaultMode]);

  // Artboard fill is painted on the frame (OneUIFrameShapeUtil), not a separate child shape.
  const handleSetSurface = useCallback(
    (appearance: string, mode: string) => {
      const allowed = [...frameModesForAppearance(appearance)];
      const nextMode = allowed.includes(mode) ? mode : (allowed[0] ?? 'default');
      setFrameAppearance(appearance);
      setFrameSurfaceMode(nextMode);

      const shouldHaveSurface = nextMode !== 'default' || appearance === 'brand-bg';

      if (!surfaceApi) return;
      if (!shouldHaveSurface) {
        surfaceApi.setFrameArtboardSurface(frameId, null);
      } else {
        surfaceApi.setFrameArtboardSurface(frameId, { appearance, rawMode: nextMode });
      }

      const frame = editor.getShape(frameId as any) as any;
      if (frame) {
        editor.updateShape({ id: frameId as any, type: 'frame', props: { ...frame.props } } as any);
      }
    },
    [editor, frameId, surfaceApi],
  );

  useEffect(() => {
    if (!surfaceApi) return;
    const shouldHaveSurface = defaultMode !== 'default' || defaultAppearance === 'brand-bg';
    if (!shouldHaveSurface) return;
    if (surfaceApi.surfaces[frameId]) return;
    surfaceApi.setFrameArtboardSurface(frameId, { appearance: defaultAppearance, rawMode: defaultMode });
  }, [surfaceApi, frameId, defaultAppearance, defaultMode]);

  const handleAutoLayout = useCallback(
    (direction: 'column' | 'row') => {
      const childIds = [...editor.getSortedChildIdsForParent(frameId as any)];
      const children = childIds
        .map((id) => editor.getShape(id))
        .filter(Boolean) as any[];

      if (children.length === 0) return;

      // Children inside a frame use frame-relative coordinates
      let relX = padding;
      let relY = padding;

      for (const child of children) {
        editor.updateShape({
          id: child.id,
          type: child.type,
          x: relX,
          y: relY,
        } as any);

        if (direction === 'column') {
          relY += (child.props?.h ?? 40) + gap;
        } else {
          relX += (child.props?.w ?? 100) + gap;
        }
      }
    },
    [editor, frameId],
  );

  const handleAddToFrame = useCallback(
    (componentType: string) => {
      const meta = metas.find((m) => m.name === componentType);
      const defaultProps = meta
        ? Object.fromEntries(meta.props.filter((p) => p.defaultValue !== undefined).map((p) => [p.name, p.defaultValue]))
        : {};
      const defaults = COMPONENT_DEFAULTS[componentType] ?? { w: 160, h: 44, text: '' };

      // Frame-relative coordinates: place below last child or at top
      const childIds = [...editor.getSortedChildIdsForParent(frameId as any)];
      const lastChild = childIds.length > 0 ? editor.getShape(childIds[childIds.length - 1]) as any : null;

      const x = padding;
      const y = lastChild ? (lastChild.y + (lastChild.props?.h ?? 40) + gap) : padding;

      const shapeId = createShapeId();
      editor.createShape({
        id: shapeId,
        type: COMPONENT_SHAPE_TYPE as any,
        x,
        y,
        parentId: frameId as any,
        props: {
          w: defaults.w,
          h: defaults.h,
          componentType,
          componentProps: sanitizeComponentPropsForTldraw(defaultProps as Record<string, unknown>),
          childText: defaults.text,
        },
      });
    },
    [editor, frameId, metas],
  );

  const handleZoomToFrame = useCallback(() => {
    editor.select(frameId as any);
    editor.zoomToSelection({ animation: { duration: 200 } });
  }, [editor, frameId]);

  const [showExport, setShowExport] = useState(false);

  // Count children in frame
  const childCount = [...editor.getSortedChildIdsForParent(frameId as any)].length;

  return (
    <div className={styles.frameActions}>
      <div className={styles.frameHeader}>
        <span className={styles.frameTitle}>{frameName || 'Frame'}</span>
        <span className={styles.frameChildCount}>{childCount}</span>
        <button className={styles.frameZoomButton} onClick={handleZoomToFrame} title="Zoom to fit">
          Fit
        </button>
        <button
          className={styles.frameZoomButton}
          onClick={() => setShowExport((v) => !v)}
          title="Export artboard"
          data-active={showExport || undefined}
        >
          Export
        </button>
      </div>

      {showExport && (
        <ExportPanel
          editor={editor}
          frameId={frameId}
          frameName={frameName}
        />
      )}

      {frameSubBrandCtx && frameSubBrandCtx.availableSubBrands.length > 0 ? (
        <div className={styles.frameSection}>
          <span className={styles.frameSectionTitle}>Sub-brand</span>
          <div className={styles.frameSubBrandSelectWrap}>
            <Select
              value={frameSubBrandCtx.frameSubBrandByFrameId[frameId] ?? ''}
              onChange={(val) => {
                frameSubBrandCtx.setFrameSubBrand(frameId, val ? val : null);
                if (!appearanceOptions.includes('brand-bg')) return;
                if (val) {
                  handleSetSurface('brand-bg', 'bold');
                } else {
                  handleSetSurface('primary', 'default');
                }
              }}
              options={[
                { value: '', label: 'Base brand' },
                ...frameSubBrandCtx.availableSubBrands.map((s) => ({ value: s.id, label: s.name })),
              ]}
              size="sm"
              aria-label="Artboard sub-brand theme"
            />
          </div>
        </div>
      ) : null}

      {/* Surface — appearance + modes (fill is the frame background via OneUIFrameShapeUtil). */}
      <div className={styles.frameSection}>
        <span className={styles.frameSectionTitle}>Surface</span>
        <Select
          value={frameAppearance}
          onChange={(val) => handleSetSurface(val, frameSurfaceMode)}
          options={appearanceOptions.map((a) => ({
            value: a,
            label: a === 'brand-bg' ? 'Brand BG' : a,
          }))}
          size="sm"
        />
        {/* data-oneui-subbrand scopes the subbrand CSS so --Brand-Bg-* tokens resolve on swatches */}
        <div
          className={styles.sectionList}
          style={{ marginTop: 'var(--Spacing-2)' }}
          {...(frameSubBrandCtx?.frameSubBrandByFrameId[frameId]
            ? { 'data-oneui-subbrand': frameSubBrandCtx.frameSubBrandByFrameId[frameId] as string }
            : {})}
        >
          {frameModesForAppearance(frameAppearance).map((mode) => {
            const bgToken = frameSurfaceSwatchCss(frameAppearance, mode);
            return (
              <button
                key={mode}
                className={styles.sidebarItem}
                data-active={frameSurfaceMode === mode || undefined}
                onClick={() => handleSetSurface(frameAppearance, mode)}
                title={`${frameAppearance}/${mode}`}
              >
                <span
                  className={styles.surfaceSwatch}
                  style={{ background: bgToken }}
                />
                <span className={styles.itemName}>{mode}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Responsive resize — driven by foundation breakpoints */}
      <div className={styles.frameSection}>
        <span className={styles.frameSectionTitle}>Resize</span>
        <div className={styles.frameButtons}>
          {artboardPresets.map((bp) => (
            <button
              key={`${bp.name}-${bp.w}-${bp.h}`}
              className={styles.frameButton}
              onClick={() => {
                editor.updateShape({ id: frameId as any, type: 'frame', props: { w: bp.w, h: bp.h } } as any);
                const childIds = [...editor.getSortedChildIdsForParent(frameId as any)];
                for (const cid of childIds) {
                  const child = editor.getShape(cid) as any;
                  if (!child) continue;
                  // Sync JioRibbon / ContentBlock to new frame dimensions
                  if (
                    child.type === COMPONENT_SHAPE_TYPE &&
                    (child.props?.componentType === 'JioRibbon' ||
                      child.props?.componentType === 'ContentBlock')
                  ) {
                    const cp = child.props.componentProps as Record<string, unknown> ?? {};
                    editor.updateShape({
                      id: child.id,
                      type: COMPONENT_SHAPE_TYPE as any,
                      props: {
                        w: bp.w,
                        h: bp.h,
                        componentProps: sanitizeComponentPropsForTldraw({
                          ...cp,
                          canvasWidth: bp.w,
                          canvasHeight: bp.h,
                        }),
                      },
                    } as any);
                  }
                }
              }}
              title={bp.label}
            >
              {bp.w}
            </button>
          ))}
        </div>
      </div>

      {/* Auto-layout — persistent */}
      <div className={styles.frameSection}>
        <span className={styles.frameSectionTitle}>Auto Layout</span>
        <div className={styles.frameButtons}>
          <button
            className={styles.frameButton}
            data-active={hasAutoLayout(frameId) && getLayoutConfig(frameId)?.direction === 'column' || undefined}
            onClick={() => {
              enableAutoLayout(frameId, { direction: 'column' });
              applyAutoLayout(editor, frameId);
            }}
          >
            Column ↓
          </button>
          <button
            className={styles.frameButton}
            data-active={hasAutoLayout(frameId) && getLayoutConfig(frameId)?.direction === 'row' || undefined}
            onClick={() => {
              enableAutoLayout(frameId, { direction: 'row' });
              applyAutoLayout(editor, frameId);
            }}
          >
            Row →
          </button>
          {hasAutoLayout(frameId) && (
            <button className={styles.frameButton} onClick={() => disableAutoLayout(frameId)}>
              Off
            </button>
          )}
        </div>
        {hasAutoLayout(frameId) && (
          <div className={styles.frameButtons} style={{ marginTop: 'var(--Spacing-2)' }}>
            {(['start', 'center', 'end', 'stretch'] as const).map((a) => (
              <button
                key={a}
                className={styles.frameButton}
                data-active={getLayoutConfig(frameId)?.align === a || undefined}
                onClick={() => {
                  setLayoutConfig(frameId, { align: a });
                  applyAutoLayout(editor, frameId);
                }}
              >
                {a === 'stretch' ? 'Fill' : a.charAt(0).toUpperCase() + a.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* One-shot layout actions */}
      <div className={styles.frameSection}>
        <span className={styles.frameSectionTitle}>Actions</span>
        <div className={styles.frameButtons}>
          <button className={styles.frameButton} onClick={() => handleAutoLayout('column')}>
            Stack ↓
          </button>
          <button className={styles.frameButton} onClick={() => handleAutoLayout('row')}>
            Stack →
          </button>
          <button className={styles.frameButton} onClick={() => {
            const childIds = [...editor.getSortedChildIdsForParent(frameId as any)];
            if (childIds.length === 0) return;
            let maxBottom = 0;
            for (const cid of childIds) {
              const child = editor.getShape(cid) as any;
              if (child) {
                const bottom = child.y + (child.props?.h ?? 40);
                if (bottom > maxBottom) maxBottom = bottom;
              }
            }
            editor.updateShape({ id: frameId as any, type: 'frame', props: { h: maxBottom + padding } } as any);
          }}>
            Fit ↕
          </button>
        </div>
      </div>

      {/* Alignment */}
      <div className={styles.frameSection}>
        <span className={styles.frameSectionTitle}>Align Children</span>
        <div className={styles.frameButtons}>
          <button className={styles.frameButton} onClick={() => {
            const childIds = [...editor.getSortedChildIdsForParent(frameId as any)];
            childIds.forEach((cid) => {
              editor.updateShape({ id: cid, type: editor.getShape(cid)?.type as any, x: padding } as any);
            });
          }}>Left</button>
          <button className={styles.frameButton} onClick={() => {
            const frame = editor.getShape(frameId as any) as any;
            const fw = frame?.props?.w ?? 390;
            const childIds = [...editor.getSortedChildIdsForParent(frameId as any)];
            childIds.forEach((cid) => {
              const child = editor.getShape(cid) as any;
              const cw = child?.props?.w ?? 100;
              editor.updateShape({ id: cid, type: child?.type as any, x: (fw - cw) / 2 } as any);
            });
          }}>Center</button>
          <button className={styles.frameButton} onClick={() => {
            const frame = editor.getShape(frameId as any) as any;
            const fw = frame?.props?.w ?? 390;
            const childIds = [...editor.getSortedChildIdsForParent(frameId as any)];
            childIds.forEach((cid) => {
              const child = editor.getShape(cid) as any;
              const cw = child?.props?.w ?? 100;
              editor.updateShape({ id: cid, type: child?.type as any, x: fw - padding - cw } as any);
            });
          }}>Right</button>
          <button className={styles.frameButton} onClick={() => {
            // Stretch all children to fill frame width
            const frame = editor.getShape(frameId as any) as any;
            const fw = frame?.props?.w ?? 390;
            const contentW = fw - padding * 2;
            const childIds = [...editor.getSortedChildIdsForParent(frameId as any)];
            childIds.forEach((cid) => {
              const child = editor.getShape(cid) as any;
              editor.updateShape({ id: cid, type: child?.type as any, x: padding, props: { ...child?.props, w: contentW } } as any);
            });
          }}>Fill ↔</button>
        </div>
      </div>

      {/* Spacing controls */}
      <div className={styles.frameSection}>
        <span className={styles.frameSectionTitle}>Spacing</span>
        <div className={styles.spacingRow}>
          <label className={styles.spacingLabel}>
            Gap
            <input
              className={styles.spacingInput}
              type="number"
              value={gap}
              min={0}
              max={100}
              onChange={(e) => setGap(Number(e.target.value))}
            />
          </label>
          <label className={styles.spacingLabel}>
            Pad
            <input
              className={styles.spacingInput}
              type="number"
              value={padding}
              min={0}
              max={100}
              onChange={(e) => setPadding(Number(e.target.value))}
            />
          </label>
        </div>
      </div>

      {/* Quick add into frame */}
      <div className={styles.frameSection}>
        <span className={styles.frameSectionTitle}>Add to Frame</span>
        <div className={styles.frameButtons}>
          {['Button', 'Switch', 'Checkbox', 'Avatar', 'Stepper', 'Image'].map((type) => (
            <button key={type} className={styles.frameButton} onClick={() => handleAddToFrame(type)}>
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Left sidebar: Artboards + Components + Templates
// ---------------------------------------------------------------------------

interface LeftSidebarProps {
  /** When true, collapses to a 48px rail that only shows the expand button. */
  collapsed: boolean;
  /** Fired when the user clicks the collapse/expand affordance. */
  onToggleCollapsed: () => void;
}

const LeftSidebar = track(function LeftSidebar({
  collapsed,
  onToggleCollapsed,
}: LeftSidebarProps) {
  const editor = useEditor();
  const artboardPresets = useContext(ArtboardPresetsContext);
  const brandOverview = useContext(ArtboardBrandOverviewContext);
  const appearanceConfig = brandOverview?.appearanceConfig as AppearanceConfigLike;
  const looseSurfaceAppearanceOptions = useMemo(
    () => frameAppearanceOptionsFromFoundations(appearanceConfig ?? null),
    [appearanceConfig],
  );
  const metas = useMemo(() => getAllComponentMetas(), []);
  const slugEntries = useMemo(() => Object.entries(TEMPLATE_REGISTRY), []);
  const [search, setSearch] = useState('');

  const filteredMetas = useMemo(() => {
    if (!search) return metas;
    const q = search.toLowerCase();
    return metas.filter((m) => m.displayName.toLowerCase().includes(q) || m.category.includes(q));
  }, [metas, search]);

  const filteredTemplates = useMemo(() => {
    if (!search) return slugEntries;
    const q = search.toLowerCase();
    return slugEntries
      .map(([slug, templates]) => [slug, templates.filter((t) => t.name.toLowerCase().includes(q) || slug.includes(q))] as const)
      .filter(([, templates]) => templates.length > 0);
  }, [slugEntries, search]);

  const handleAddArtboard = useCallback(
    (preset: ArtboardPreset) => {
      const bounds = editor.getViewportPageBounds();
      const cx = bounds.x + bounds.w / 2;
      const cy = bounds.y + bounds.h / 2;
      editor.createShape({
        id: createShapeId(),
        type: 'frame',
        x: cx - preset.w / 2,
        y: cy - preset.h / 2,
        props: { w: preset.w, h: preset.h, name: preset.label, color: 'white' },
      });
    },
    [editor],
  );

  const [surfaceAppearance, setSurfaceAppearance] = useState<string>('primary');

  useEffect(() => {
    if (looseSurfaceAppearanceOptions.length === 0) return;
    if (!looseSurfaceAppearanceOptions.includes(surfaceAppearance)) {
      const next = looseSurfaceAppearanceOptions.includes('primary')
        ? 'primary'
        : looseSurfaceAppearanceOptions[0];
      setSurfaceAppearance(next);
    }
  }, [looseSurfaceAppearanceOptions, surfaceAppearance]);

  const handleAddSurface = useCallback(
    (mode: string) => {
      const bounds = editor.getViewportPageBounds();
      editor.createShape({
        id: createShapeId(),
        type: CONTAINER_SHAPE_TYPE as any,
        x: bounds.x + bounds.w / 2 - 150,
        y: bounds.y + bounds.h / 2 - 100,
        props: { w: 300, h: 200, surfaceMode: mode, appearance: surfaceAppearance, label: `${surfaceAppearance}/${mode}` },
      });
    },
    [editor, surfaceAppearance],
  );

  const handleAddComponent = useCallback(
    (componentType: string) => {
      const meta = metas.find((m) => m.name === componentType);
      const defaultProps = meta
        ? Object.fromEntries(
            meta.props.filter((p) => p.defaultValue !== undefined).map((p) => [p.name, p.defaultValue]),
          )
        : {};
      const defaults = COMPONENT_DEFAULTS[componentType] ?? { w: 160, h: 44, text: '' };

      // Check if a frame is selected — place inside it
      const selectedIds = editor.getSelectedShapeIds();
      const selectedShape = selectedIds.length === 1 ? editor.getShape(selectedIds[0]) as any : null;
      const allShapes = editor.getCurrentPageShapes() as any[];
      const frames = allShapes.filter((s) => s.type === 'frame');
      const targetFrame = selectedShape?.type === 'frame' ? selectedShape : frames[0] ?? null;

      const frameW = targetFrame?.props?.w ?? 390;
      const frameH = targetFrame?.props?.h ?? 844;
      let mergedProps: Record<string, unknown> = { ...defaultProps };
      if (componentType === 'JioRibbon' && targetFrame) {
        mergedProps = {
          ...mergedProps,
          canvasWidth: frameW,
          canvasHeight: frameH,
          variant: mergedProps.variant ?? 'dots-with-symbol',
        };
      }
      if (componentType === 'ContentBlock' && targetFrame) {
        mergedProps = {
          ...mergedProps,
          canvasWidth: frameW,
          canvasHeight: frameH,
        };
      }

      if (targetFrame) {
        const padding = 20;
        const gap = 12;
        const contentW = frameW - padding * 2;
        const useFullWidth = ['Button', 'Checkbox', 'Switch', 'Divider', 'SelectableButton'].includes(componentType);
        const ribbonFullBleed = componentType === 'JioRibbon';
        const contentBlockFullBleed = componentType === 'ContentBlock';

        const childIds = [...editor.getSortedChildIdsForParent(targetFrame.id as any)];
        const lastChild = childIds.length > 0 ? editor.getShape(childIds[childIds.length - 1]) as any : null;
        const relY = lastChild ? (lastChild.y + (lastChild.props?.h ?? 40) + gap) : padding;

        const shapeW = ribbonFullBleed || contentBlockFullBleed ? frameW : useFullWidth ? contentW : defaults.w;
        const shapeH = ribbonFullBleed || contentBlockFullBleed ? frameH : defaults.h;
        const shapeX = ribbonFullBleed || contentBlockFullBleed ? 0 : padding;
        const shapeY = ribbonFullBleed || contentBlockFullBleed ? 0 : relY;

        editor.createShape({
          type: COMPONENT_SHAPE_TYPE as any,
          x: shapeX,
          y: shapeY,
          parentId: targetFrame.id as any,
          props: {
            w: shapeW,
            h: shapeH,
            componentType,
            componentProps: sanitizeComponentPropsForTldraw({
              ...mergedProps,
              ...(useFullWidth && !ribbonFullBleed && !contentBlockFullBleed ? { fullWidth: true } : {}),
            }),
            childText: defaults.text,
            _surfaceContext: '',
          },
        });
      } else {
        const bounds = editor.getViewportPageBounds();
        editor.createShape({
          type: COMPONENT_SHAPE_TYPE as any,
          x: bounds.x + bounds.w / 2 - defaults.w / 2,
          y: bounds.y + bounds.h / 2 - defaults.h / 2,
          props: {
            w: defaults.w,
            h: defaults.h,
            componentType,
            componentProps: sanitizeComponentPropsForTldraw(mergedProps),
            childText: defaults.text,
            _surfaceContext: '',
          },
        });
      }
    },
    [editor, metas],
  );

  const handleInsertTemplate = useCallback(
    (template: ASTRoot) => {
      const components = collectComponents(template.root);
      const bounds = editor.getViewportPageBounds();
      const cx = bounds.x + bounds.w / 2;
      const cy = bounds.y + bounds.h / 2;
      const spacing = 70;
      const startY = cy - ((components.length - 1) * spacing) / 2;
      components.forEach((comp, i) => {
        const defaults = COMPONENT_DEFAULTS[comp.type] ?? { w: 160, h: 44, text: '' };
        editor.createShape({
          type: COMPONENT_SHAPE_TYPE as any,
          x: cx - defaults.w / 2,
          y: startY + i * spacing,
          props: {
            w: defaults.w,
            h: defaults.h,
            componentType: comp.type,
            componentProps: sanitizeComponentPropsForTldraw(comp.props as Record<string, unknown>),
            childText: comp.text,
          },
        });
      });
    },
    [editor],
  );

  // Sidebar tab state is obsolete — Components / Micro Patterns are now
  // independent Collapsible sections so the user can close either and keep
  // Layers visible at the bottom.

  // Page-level editor state — drives the header controls (page picker, undo/
  // redo, selection-dependent delete/duplicate). track() keeps it reactive.
  const pages = editor.getPages();
  const currentPageId = editor.getCurrentPageId();
  const currentPage = pages.find((p) => p.id === currentPageId);
  const canUndo = editor.getCanUndo();
  const canRedo = editor.getCanRedo();
  const selectedIds = editor.getSelectedShapeIds();
  const hasSelection = selectedIds.length > 0;

  // Collapsed rail — a single expand affordance. Width is handled by the
  // wrapper CSS modifier .sidebarCollapsed, so this block stays minimal.
  if (collapsed) {
    return (
      <div className={`${styles.sidebar} ${styles.sidebarCollapsed}`}>
        <IconButton
          icon={<PanelLeftOpen size={18} />}
          appearance="neutral"
          attention="low"
          size="s"
          onPress={onToggleCollapsed}
          aria-label="Expand sidebar"
        />
      </div>
    );
  }

  return (
    <div className={styles.sidebar}>
      {/* Header — integrates the editor's page controls (hamburger / page
          dropdown / undo / redo / delete / duplicate) so we can retire
          tldraw's native MenuPanel. Keeps the whole canvas chrome inside
          this one top-to-bottom sidebar. */}
      <div className={styles.sidebarHeader}>
        <Menu>
          <Menu.Trigger
            render={
              <IconButton
                icon={<Icon name="menu" />}
                appearance="neutral"
                attention="low"
                size="s"
                aria-label="Canvas menu"
              />
            }
          />
          <Menu.Portal side="bottom" align="start">
            <Menu.Item
              onClick={() => {
                const name = window.prompt('New page name', `Page ${pages.length + 1}`);
                if (name && name.trim()) {
                  editor.createPage({ name: name.trim() });
                }
              }}
            >
              New page
            </Menu.Item>
            <Menu.Item
              onClick={() => {
                if (!currentPage) return;
                const name = window.prompt('Rename page', currentPage.name);
                if (name && name.trim()) {
                  editor.renamePage(currentPage.id, name.trim());
                }
              }}
            >
              Rename page
            </Menu.Item>
            <Menu.Item
              disabled={pages.length <= 1}
              onClick={() => {
                if (currentPage && pages.length > 1) {
                  editor.deletePage(currentPage.id);
                }
              }}
            >
              Delete page
            </Menu.Item>
          </Menu.Portal>
        </Menu>

        <Menu>
          <Menu.Trigger
            render={
              <Button
                appearance="neutral"
                attention="low"
                size="s"
                end={<Icon name="chevronDown" />}
                className={styles.pagePickerBtn}
              >
                {currentPage?.name ?? 'Page'}
              </Button>
            }
          />
          <Menu.Portal side="bottom" align="start">
            {pages.map((p) => (
              <Menu.Item key={p.id} onClick={() => editor.setCurrentPage(p.id)}>
                {p.name}
              </Menu.Item>
            ))}
          </Menu.Portal>
        </Menu>

        <span className={styles.headerSpacer} aria-hidden />

        <IconButton
          icon={<Icon name="refresh" />}
          appearance="neutral"
          attention="low"
          size="s"
          disabled={!canUndo}
          onPress={() => editor.undo()}
          aria-label="Undo"
          style={{ transform: 'scaleX(-1)' }}
        />
        <IconButton
          icon={<Icon name="refresh" />}
          appearance="neutral"
          attention="low"
          size="s"
          disabled={!canRedo}
          onPress={() => editor.redo()}
          aria-label="Redo"
        />
        <IconButton
          icon={<Icon name="delete" />}
          appearance="neutral"
          attention="low"
          size="s"
          disabled={!hasSelection}
          onPress={() => editor.deleteShapes(selectedIds)}
          aria-label="Delete selection"
        />
        <IconButton
          icon={<Icon name="copy" />}
          appearance="neutral"
          attention="low"
          size="s"
          disabled={!hasSelection}
          onPress={() => editor.duplicateShapes(selectedIds)}
          aria-label="Duplicate selection"
        />
        <IconButton
          icon={<PanelLeftClose size={18} />}
          appearance="neutral"
          attention="low"
          size="s"
          onPress={onToggleCollapsed}
          aria-label="Collapse sidebar"
        />
      </div>

      {/* Search — pill-shape variant of the DS Input component. */}
      <div className={styles.sidebarSearch}>
        <Input
          size="s"
          appearance="neutral"
          attention="high"
          shape="pill"
          type="search"
          placeholder="Search components and patterns…"
          value={search}
          onChange={setSearch}
          start={<Icon name="search" />}
          aria-label="Search"
        />
      </div>

      {/* Artboards live on the bottom toolbar now (next to the tool icons)
          so the sidebar focuses purely on component + surface authoring. */}

      {/* Surfaces — Collapsible with: role Menu (active swatch + name) and
          a mode list below. Collapsing hides everything under the heading
          so Layers stays visible. */}
      {!search && (
        <Collapsible defaultOpen className={styles.sidebarCollapsible}>
          <Collapsible.Trigger className={styles.sidebarCollapsibleTrigger}>
            Surfaces
          </Collapsible.Trigger>
          <Collapsible.Panel className={styles.sidebarCollapsiblePanel}>
            <div className={styles.sidebarRow}>
              <Menu>
                <Menu.Trigger
                  render={
                    <Button
                      appearance="neutral"
                      attention="low"
                      size="xs"
                      condensed
                      fullWidth
                      start={(
                        <span
                          className={styles.surfaceModeSwatch}
                          style={{ background: frameSurfaceSwatchCss(surfaceAppearance, 'bold') }}
                        />
                      )}
                      end={<Icon name="chevronDown" />}
                      className={styles.sidebarItem}
                    >
                      {surfaceAppearance === 'brand-bg' ? 'Brand BG' : surfaceAppearance}
                    </Button>
                  }
                />
                <Menu.Portal side="bottom" align="start">
                  {looseSurfaceAppearanceOptions.map((role) => (
                    <Menu.Item
                      key={role}
                      onClick={() => setSurfaceAppearance(role)}
                      className={styles.sidebarMenuItem}
                    >
                      <span
                        className={styles.surfaceModeSwatch}
                        style={{ background: frameSurfaceSwatchCss(role, 'bold') }}
                      />
                      <span className={styles.menuItemLabel}>
                        {role === 'brand-bg' ? 'Brand BG' : role}
                      </span>
                    </Menu.Item>
                  ))}
                </Menu.Portal>
              </Menu>
            </div>
            <div className={`${styles.sidebarList} ${styles.surfaceModeList}`}>
              {frameModesForAppearance(surfaceAppearance).map((mode) => (
                <Button
                  key={mode}
                  appearance="neutral"
                  attention="low"
                  size="xs"
                  condensed
                  fullWidth
                  onPress={() => handleAddSurface(mode)}
                  start={(
                    <span
                      className={styles.surfaceModeSwatch}
                      style={{ background: frameSurfaceSwatchCss(surfaceAppearance, mode) }}
                    />
                  )}
                  className={styles.sidebarItem}
                  aria-label={`Add ${surfaceAppearance}/${mode} surface`}
                >
                  {mode}
                </Button>
              ))}
            </div>
          </Collapsible.Panel>
        </Collapsible>
      )}

      {/* Components — Collapsible list grouped by category. Scrolls
          internally when long so Layers remains reachable below. */}
      <Collapsible defaultOpen className={styles.sidebarCollapsible}>
        <Collapsible.Trigger className={styles.sidebarCollapsibleTrigger}>
          Components
        </Collapsible.Trigger>
        <Collapsible.Panel className={styles.sidebarCollapsiblePanel}>
          <ScrollArea className={styles.sidebarCollapsibleScroll}>
            {filteredMetas.length > 0 && (() => {
              const categories = new Map<string, typeof filteredMetas>();
              for (const meta of filteredMetas) {
                const cat = meta.category;
                if (!categories.has(cat)) categories.set(cat, []);
                categories.get(cat)!.push(meta);
              }
              return [...categories.entries()].map(([category, items]) => (
                <div key={category} className={styles.sidebarCategory}>
                  <div className={styles.sidebarCategoryHeading}>
                    <span>{category}</span>
                    <span className={styles.sidebarItemMeta}>{items.length}</span>
                  </div>
                  <div className={styles.sidebarList}>
                    {items.map((meta) => (
                      <Button
                        key={meta.name}
                        appearance="neutral"
                        attention="low"
                        size="xs"
                        condensed
                        fullWidth
                        onPress={() => handleAddComponent(meta.name)}
                        className={styles.sidebarItem}
                        aria-label={`Add ${meta.displayName}`}
                      >
                        {meta.displayName}
                      </Button>
                    ))}
                  </div>
                </div>
              ));
            })()}
          </ScrollArea>
        </Collapsible.Panel>
      </Collapsible>

      {/* Micro Patterns — Collapsible. Defaults closed so Components is
          the primary focus when the sidebar first opens. */}
      <Collapsible defaultOpen={false} className={styles.sidebarCollapsible}>
        <Collapsible.Trigger className={styles.sidebarCollapsibleTrigger}>
          Micro Patterns
        </Collapsible.Trigger>
        <Collapsible.Panel className={styles.sidebarCollapsiblePanel}>
          <ScrollArea className={styles.sidebarCollapsibleScroll}>
            <div className={styles.sidebarList}>
              {filteredTemplates.map(([slug, templates]) =>
                templates.map((t, i) => (
                  <Button
                    key={`${slug}-${i}`}
                    appearance="neutral"
                    attention="low"
                    size="xs"
                    condensed
                    fullWidth
                    onPress={() => handleInsertTemplate(t)}
                    end={<span className={styles.sidebarItemMeta}>{slug}</span>}
                    className={styles.sidebarItem}
                    aria-label={`Insert ${t.name}`}
                  >
                    {t.name}
                  </Button>
                )),
              )}
              {COMPOSITION_TEMPLATES.map((t, i) => (
                <Button
                  key={`comp-${i}`}
                  appearance="neutral"
                  attention="low"
                  size="xs"
                  condensed
                  fullWidth
                  onPress={() => handleInsertTemplate(t)}
                  end={<span className={styles.sidebarItemMeta}>composition</span>}
                  className={styles.sidebarItem}
                  aria-label={`Insert ${t.name}`}
                >
                  {t.name}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </Collapsible.Panel>
      </Collapsible>

      {/* Layers — pinned to the bottom as a Collapsible. Opens to reveal
          the shape hierarchy of the current page. */}
      <Collapsible defaultOpen={false} className={`${styles.sidebarCollapsible} ${styles.layersCollapsible}`}>
        <Collapsible.Trigger className={styles.sidebarCollapsibleTrigger}>
          Layers
        </Collapsible.Trigger>
        <Collapsible.Panel className={styles.sidebarCollapsiblePanel}>
          <ScrollArea className={styles.sidebarCollapsibleScroll}>
            <LayersPanelBody />
          </ScrollArea>
        </Collapsible.Panel>
      </Collapsible>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Main ExperienceCanvas
// ---------------------------------------------------------------------------

/** Keeps shape `_surfaceContext` aligned with frame artboard + overlapping Surface containers (export/preview). */
function syncOneUIComponentSurfaceContexts(
  ed: Editor,
  resolveFrameSurface: (frameId: string) => FrameArtboardSurface | undefined,
) {
  const allShapes = ed.getCurrentPageShapes() as any[];
  const containers = allShapes.filter(
    (s) => s.type === CONTAINER_SHAPE_TYPE && s.props?.surfaceMode && s.props.surfaceMode !== 'default',
  );
  const components = allShapes.filter((s) => s.type === COMPONENT_SHAPE_TYPE);

  for (const comp of components) {
    let detectedMode = '';

    const parentId = comp.parentId;
    if (parentId) {
      const parent = ed.getShape(parentId) as any;
      if (parent?.type === 'frame') {
        const fs = resolveFrameSurface(parentId);
        if (fs) {
          const n = normalizeSurfaceModeForCanvas(fs.rawMode);
          detectedMode = n === 'default' ? '' : n;
        }
      }
    }

    if (!detectedMode) {
      const cb = ed.getShapePageBounds(comp.id) as any;
      if (cb) {
        const cw = cb.w ?? cb.width ?? 0;
        const ch = cb.h ?? cb.height ?? 0;
        const cx = cb.x + cw / 2;
        const cy = cb.y + ch / 2;

        for (const container of containers) {
          const sb = ed.getShapePageBounds(container.id) as any;
          if (!sb) continue;
          const sw = sb.w ?? sb.width ?? 0;
          const sh = sb.h ?? sb.height ?? 0;
          if (cx >= sb.x && cx <= sb.x + sw && cy >= sb.y && cy <= sb.y + sh) {
            const n = normalizeSurfaceModeForCanvas(container.props.surfaceMode);
            detectedMode = n === 'default' ? '' : n;
            break;
          }
        }
      }
    }

    const currentMode = (comp.props as any)._surfaceContext ?? '';
    if (currentMode !== detectedMode) {
      ed.updateShape({
        id: comp.id,
        type: COMPONENT_SHAPE_TYPE as any,
        props: { _surfaceContext: detectedMode },
      } as any);
    }
  }
}

export interface ExperienceCanvasProps {
  onASTChange?: (ast: ReturnType<typeof canvasToAST>) => void;
  onValidationChange?: (errors: ValidationError[]) => void;
  onEditorReady?: (editor: Editor) => void;
  canvasBackground?: string;
  className?: string;
  /** When set, replaces default web breakpoint artboard presets (e.g. social sizes). */
  artboardPresets?: ArtboardPreset[];
  /**
   * Enabled Density & Platforms foundation entries (typically from platform brand overview).
   * Drives ContentBlock foundation platform picker and dimension token resolution.
   */
  foundationPlatforms?: readonly PlatformEntry[];
  /**
   * Sub-brands for the editing brand — enables per-frame artboard colour theming in Frame actions.
   */
  availableSubBrands?: readonly ArtboardSubBrandOption[];
  /**
   * Raw `getBrandOverviewData` for the current brand (not merged with TopBar sub-brand).
   * Used to generate scoped CSS per selected frame sub-brand.
   */
  brandFoundationDataForSubBrands?: Record<string, unknown> | null;
  /** App light/dark — must match `data-mode` for correct surface steps in scoped brand CSS */
  mode?: 'light' | 'dark';
}

export function ExperienceCanvas({
  onASTChange,
  onValidationChange,
  onEditorReady,
  canvasBackground = 'neutral',
  className,
  artboardPresets: artboardPresetsProp,
  foundationPlatforms: foundationPlatformsProp,
  availableSubBrands: availableSubBrandsProp,
  brandFoundationDataForSubBrands = null,
  mode: documentMode = 'light',
}: ExperienceCanvasProps) {
  const [mode, setMode] = useState<CanvasWorkMode>('edit');
  // Edit ↔ Preview toggle lives here so the sidebar + chat panel can hide
  // in preview. CanvasControlsCluster is the only writer.
  const [isPreview, setIsPreview] = useState(false);
  const handlePreviewChange = useCallback((next: boolean) => {
    setIsPreview(next);
    setMode(next ? 'preview' : 'edit');
  }, []);
  // Left sidebar collapse state — persisted to localStorage so it survives
  // reload. SSR-safe: this file is only rendered with ssr:false.
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem('oneui-canvas-left-collapsed') === '1';
  });
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('oneui-canvas-left-collapsed', leftSidebarCollapsed ? '1' : '0');
  }, [leftSidebarCollapsed]);
  const toggleLeftSidebar = useCallback(() => {
    setLeftSidebarCollapsed((v) => !v);
  }, []);
  const [frameSubBrandByFrameId, setFrameSubBrandByFrameId] = useState<Record<string, string | null>>(
    {},
  );

  const setFrameSubBrand = useCallback((frameId: string, subBrandId: string | null) => {
    setFrameSubBrandByFrameId((prev) => ({ ...prev, [frameId]: subBrandId }));
  }, []);

  const [frameArtboardSurfaces, setFrameArtboardSurfaces] = useState<Record<string, FrameArtboardSurface>>({});
  const frameArtboardSurfacesRef = useRef(frameArtboardSurfaces);
  frameArtboardSurfacesRef.current = frameArtboardSurfaces;
  const editorRef = useRef<Editor | null>(null);

  const setFrameArtboardSurface = useCallback((frameId: string, surface: FrameArtboardSurface | null) => {
    putFrameArtboardSurface(frameId, surface);
    setFrameArtboardSurfaces((prev) => {
      const next = { ...prev };
      if (surface === null) delete next[frameId];
      else next[frameId] = surface;
      return next;
    });
  }, []);

  const frameArtboardSurfaceContextValue = useMemo(
    () => ({ surfaces: frameArtboardSurfaces, setFrameArtboardSurface }),
    [frameArtboardSurfaces, setFrameArtboardSurface],
  );

  const availableSubBrands = availableSubBrandsProp ?? [];

  const frameThemeContextValue = useMemo(
    () => ({
      frameSubBrandByFrameId,
      setFrameSubBrand,
      availableSubBrands,
      baseFoundationData: brandFoundationDataForSubBrands,
      mode: documentMode,
    }),
    [frameSubBrandByFrameId, setFrameSubBrand, availableSubBrands, brandFoundationDataForSubBrands, documentMode],
  );

  const activeSubBrandIds = useMemo(
    () =>
      Object.values(frameSubBrandByFrameId).filter((v): v is string => Boolean(v && v.length > 0)),
    [frameSubBrandByFrameId],
  );

  const effectivePresets = useMemo(
    () => (artboardPresetsProp?.length ? artboardPresetsProp : ARTBOARD_PRESETS),
    [artboardPresetsProp],
  );

  const foundationPlatformsValue = useMemo(
    () => (foundationPlatformsProp?.length ? foundationPlatformsProp : null),
    [foundationPlatformsProp],
  );

  useEffect(() => {
    setArtboardFrameExportContext({
      frameSubBrandByFrameId,
      baseFoundationData: brandFoundationDataForSubBrands,
      theme: documentMode,
      availableSubBrands,
    });
    return () => setArtboardFrameExportContext(null);
  }, [frameSubBrandByFrameId, brandFoundationDataForSubBrands, documentMode, availableSubBrands]);

  // Keep refs up to date so the export provider can read current context values
  const surfaceCtxRef = useRef(frameArtboardSurfaceContextValue);
  surfaceCtxRef.current = frameArtboardSurfaceContextValue;
  const subBrandCtxRef = useRef(frameThemeContextValue);
  subBrandCtxRef.current = frameThemeContextValue;
  const foundationPlatformsRef = useRef(foundationPlatformsValue);
  foundationPlatformsRef.current = foundationPlatformsValue;

  const OneUIExportProvider = useMemo(() => {
    const surfRef = surfaceCtxRef;
    const sbRef = subBrandCtxRef;
    const fpRef = foundationPlatformsRef;
    return function OneUIExportProviderInner({ children }: { children: React.ReactNode }) {
      return (
        <FrameArtboardSurfaceContext.Provider value={surfRef.current}>
          <FrameThemeContext.Provider value={sbRef.current}>
            <ContentBlockFoundationPlatformsContext.Provider value={fpRef.current}>
              {children}
            </ContentBlockFoundationPlatformsContext.Provider>
          </FrameThemeContext.Provider>
        </FrameArtboardSurfaceContext.Provider>
      );
    };
  }, []);

  const tldrawOptions = useMemo(
    () => ({ exportProvider: OneUIExportProvider }),
    [OneUIExportProvider],
  );

  const handleMount = useCallback(
    (ed: Editor) => {
      editorRef.current = ed;
      onEditorReady?.(ed);

      // Reset readonly in case it was stuck from a previous session
      try { ed.updateInstanceState({ isReadonly: false }); } catch {}
      (ed as any).__oneui_preview = false;

      // Sync tldraw's dark mode with our app theme (not system preference)
      const syncTheme = () => {
        const isDark = document.documentElement.getAttribute('data-mode') === 'dark';
        ed.user.updateUserPreferences({ colorScheme: isDark ? 'dark' : 'light' });
      };
      syncTheme();
      const observer = new MutationObserver(syncTheme);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] });
      // Store for cleanup — tldraw doesn't expose unmount hook, but the observer is lightweight
      (ed as any).__themeObserver = observer;

      // Legacy: artboard fill used to be a full-bleed ContainerShape child — remove so layers stay clean.
      for (const s of ed.getCurrentPageShapes() as any[]) {
        if (s.type === CONTAINER_SHAPE_TYPE && s.props?.label?.startsWith('_frame-surface')) {
          ed.deleteShape(s.id);
        }
      }

      let updatingSurface = false;
      const frameSizeCache = new Map<string, string>();

      ed.sideEffects.registerAfterChangeHandler('shape', () => {
        if (onASTChange) onASTChange(canvasToAST(ed));
        if (onValidationChange) onValidationChange(validateCanvas(ed));

        // Skip if we're already inside a reactive update
        if (updatingSurface) return;

        try {
          updatingSurface = true;

          const allShapes = ed.getCurrentPageShapes() as any[];

          // --- Surface context detection (frame artboard surface + overlapping ContainerShapes) ---
          syncOneUIComponentSurfaceContexts(ed, (frameId) =>
            frameArtboardSurfacesRef.current[frameId],
          );

          // --- Frame → JioRibbon / ContentBlock sync: when frame resized, update full-bleed children ---
          const allFrames = allShapes.filter((s) => s.type === 'frame');
          for (const frame of allFrames) {
            const fw = frame.props?.w ?? 0;
            const fh = frame.props?.h ?? 0;
            if (fw <= 0 || fh <= 0) continue;

            const frameSizeKey = `${fw}:${fh}`;
            const prevFrameSize = frameSizeCache.get(frame.id);
            frameSizeCache.set(frame.id, frameSizeKey);

            // Only sync when frame dimensions actually changed
            if (prevFrameSize !== undefined && prevFrameSize !== frameSizeKey) {
              const childIds = [...ed.getSortedChildIdsForParent(frame.id as any)];
              for (const cid of childIds) {
                const child = ed.getShape(cid) as any;
                if (child?.type !== COMPONENT_SHAPE_TYPE) continue;
                const ct = child.props?.componentType;
                if (ct !== 'JioRibbon' && ct !== 'ContentBlock') continue;

                const cp = (child.props.componentProps as Record<string, unknown>) ?? {};

                if (ct === 'JioRibbon') {
                  const variant = (cp.variant as string) ?? 'dots-with-symbol';
                  const orientationProp = cp.orientation as string | undefined;
                  const orientation = orientationProp ?? resolveOrientation(fw, fh);
                  const placement = (cp.placement as string) ?? ribbonDefaultPlacement(orientation as any);
                  const colors: [string, string, string] = [
                    (cp.color1 as string) ?? JIO_DEFAULT_COLORS.color1,
                    (cp.color2 as string) ?? JIO_DEFAULT_COLORS.color2,
                    (cp.color3 as string) ?? JIO_DEFAULT_COLORS.color3,
                  ];
                  const geo = computeRibbonGeometry({
                    variant: variant as any,
                    orientation: orientation as any,
                    canvasWidth: fw,
                    canvasHeight: fh,
                    colors,
                    placement: placement as any,
                    symbolPosition: cp.symbolPosition as number | undefined,
                    size: cp.size as JioRibbonSize | undefined,
                  });
                  const shapeW = orientation === 'vertical' ? geo.containerWidth : fw;
                  const shapeH = geo.containerHeight;
                  const { x, y } = computeRibbonPosition(orientation, placement, fw, fh, shapeW, shapeH, geo.margin);
                  ed.updateShape({
                    id: child.id, type: COMPONENT_SHAPE_TYPE as any,
                    x, y,
                    props: {
                      w: shapeW, h: shapeH,
                      componentProps: sanitizeComponentPropsForTldraw({ ...cp, canvasWidth: fw, canvasHeight: fh }),
                    },
                  } as any);
                } else {
                  const position = (cp.position as string) ?? 'bottom';
                  const alignment = (cp.alignment as string) ?? 'left';
                  const nextProps = sanitizeComponentPropsForTldraw({ ...cp, canvasWidth: fw, canvasHeight: fh });
                  const shapeW = child.props.w;
                  const shapeH = child.props.h;
                  const { x, y } = computeContentBlockPosition(position, alignment, fw, fh, shapeW, shapeH);
                  ed.updateShape({
                    id: child.id, type: COMPONENT_SHAPE_TYPE as any,
                    x, y,
                    props: { componentProps: nextProps },
                  } as any);
                }
              }
            }

            // Auto-layout: re-layout frames that have auto-layout enabled
            if (hasAutoLayout(frame.id)) {
              applyAutoLayout(ed, frame.id);
            }
          }
        } catch {
          // Surface/layout detection failed — don't break other functionality
        } finally {
          updatingSurface = false;
        }
      });

      // Auto-reparent removed — was disrupting drag operations by
      // reparenting + repositioning components mid-drag.
      // Components are placed inside frames via sidebar click or AI generation.
      // Manual drag into frames uses tldraw's built-in frame parenting.

      // Default artboard on first load
      const existingFrames = ed.getCurrentPageShapes().filter((s) => s.type === 'frame');
      if (existingFrames.length === 0 && effectivePresets[0]) {
        const preset = effectivePresets[0];
        ed.createShape({
          id: createShapeId(),
          type: 'frame',
          x: 0, y: 0,
          props: { w: preset.w, h: preset.h, name: preset.label, color: 'white' },
        });
        ed.zoomToFit({ animation: { duration: 0 } });
      }
    },
    [onASTChange, onValidationChange, onEditorReady, effectivePresets],
  );

  // Re-sync component _surfaceContext when frame artboard surface changes (no shape edit → handler alone would miss it).
  useEffect(() => {
    const ed = editorRef.current;
    if (!ed) return;
    syncOneUIComponentSurfaceContexts(ed, (frameId) =>
      frameArtboardSurfaces[frameId],
    );
  }, [frameArtboardSurfaces]);

  const BG_MAP: Record<string, string> = {
    neutral: 'var(--Neutral-Minimal)',
    white: 'var(--Neutral-Default)',
    dark: 'var(--Neutral-Bold)',
    subtle: 'var(--Neutral-Subtle)',
  };

  const classNames = [styles.canvas, className].filter(Boolean).join(' ');

  // Dynamic tldraw UI based on mode. Toolbar, MenuPanel, AND NavigationPanel
  // are hidden at all times — the CanvasControlsCluster (bottom pill) owns
  // tool switching + zoom, and the custom sidebar header owns page controls
  // (page picker, undo/redo, delete/duplicate). Without this the left panel
  // can't reach the bottom of the viewport because tldraw's zoom readout
  // floats above it.
  const modeComponents = useMemo((): Partial<TLUiComponents> => {
    const base: Partial<TLUiComponents> = {
      StylePanel: null,
      HelpMenu: null,
      Toolbar: null,
      MenuPanel: null,
      NavigationPanel: null,
    };
    return base;
  }, []);

  // Same pruning as the static `tldrawOverrides` above — kept as a useMemo
  // so tldraw gets a stable reference. We intentionally retain `draw`,
  // `geo`, `text`, and `hand` so the bottom cluster can dispatch to them.
  const modeOverrides = useMemo((): TLUiOverrides => ({
    tools: (_editor, tools) => {
      delete tools.eraser;
      delete tools.arrow;
      delete tools.note;
      delete tools.asset;
      delete tools.highlight;
      delete tools.laser;
      return tools;
    },
  }), []);

  return (
    <div
      className={classNames}
      style={{ '--canvas-bg': BG_MAP[canvasBackground] ?? BG_MAP.neutral } as any}
      data-canvas-mode={mode}
    >
      <ArtboardBrandOverviewContext.Provider value={brandFoundationDataForSubBrands}>
      <ContentBlockFoundationPlatformsContext.Provider value={foundationPlatformsValue}>
        <FrameArtboardSurfaceContext.Provider value={frameArtboardSurfaceContextValue}>
        <FrameThemeContext.Provider value={frameThemeContextValue}>
          <ArtboardPresetsContext.Provider value={effectivePresets}>
            <Tldraw
              shapeUtils={customShapeUtils}
              components={modeComponents}
              overrides={modeOverrides}
              onMount={handleMount}
              options={tldrawOptions}
            >
              {/* Left sidebar — hidden in preview mode */}
              {mode !== 'preview' && (
                <LeftSidebar
                  collapsed={leftSidebarCollapsed}
                  onToggleCollapsed={toggleLeftSidebar}
                />
              )}

              {/* Right-docked Chat / Edit / Code panel.
                  Subsumes the old bottom-floating AIPrompt and the top-right SelectionPanel. */}
              {mode !== 'preview' && <CanvasChatPanel />}

              {/* Always-visible Edit/Preview switch at the top-right.
                  Rendered unconditionally so flipping into preview
                  mode (which hides the sidebar + chat panel) does NOT
                  orphan the user without a way back to Edit. */}
              <CanvasViewModeSwitch
                isPreview={isPreview}
                onPreviewChange={handlePreviewChange}
              />

              {/* Floating Magic Path-style toolbar for the selected artboard. */}
              {mode !== 'preview' && <ArtboardToolbar />}

              {/*
                Bottom-centre canvas controls (tools / zoom / theme / preview).
                The MagicPath-style cluster is the single bottom toolbar —
                the legacy vertical CanvasModeToolbar pill on the right has
                been removed; tool selection and Edit/Preview now live here.
              */}
              <CanvasControlsCluster />
            </Tldraw>
          </ArtboardPresetsContext.Provider>
          <ArtboardSubBrandStyleTags
            activeSubBrandIds={activeSubBrandIds}
            availableSubBrands={availableSubBrands}
            baseFoundationData={brandFoundationDataForSubBrands}
            theme={documentMode}
          />
        </FrameThemeContext.Provider>
        </FrameArtboardSurfaceContext.Provider>
      </ContentBlockFoundationPlatformsContext.Provider>
      </ArtboardBrandOverviewContext.Provider>

      {/* Portal target for AIPrompt — must be OUTSIDE tldraw's DOM tree
          so backdrop-filter works (tldraw uses transform/will-change that breaks it) */}
      <div data-ai-prompt-portal className={styles.aiPortalTarget} />
    </div>
  );
}
