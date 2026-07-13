/**
 * PropPanel.tsx
 *
 * Interactive property editor driven by ComponentMeta.
 * Uses the project's own components (Select, Input, Switch)
 * instead of native HTML elements.
 */

'use client';

import React, { useCallback, useState, useMemo, useEffect, useContext, Fragment } from 'react';
import type { Editor } from 'tldraw';
import type { ComponentMeta, ASTRoot, PropDescriptor } from '@oneui/shared';
import { getEffectiveEnumOptions } from '@oneui/shared';
import { astToReact } from '@oneui/shared/codegen';
import { computeDimensionOverrides } from '@oneui/shared';
import type { DensityId } from '@oneui/shared';
import {
  dimensionFStepInlineVars,
  resolveContentBlockPlatform,
  type V2PlatformId,
  type ContentBlockDensityProp,
} from '../ContentBlock/ContentBlock.shared';
import { Select } from '@oneui/ui-internal/components/Select/Select';
import { InputField as Input } from '@oneui/ui-internal/components/Input';
import { Switch } from '@oneui/ui-internal/components/Switch/Switch';
import { getAllComponentMetas } from '@oneui/ui-internal/registry/componentRegistry';
import { getSemanticIconNames } from '@oneui/ui-internal/icons/IconRegistry';
import {
  type SelectedComponentInfo,
  updateShapeProp,
  updateShapeChildText,
} from './useCanvasEditor';
import {
  sanitizeComponentPropsForTldraw,
  COMPONENT_PLACE_DEFAULTS,
  computeContentBlockPosition,
  computeRibbonPosition,
} from './canvasHelpers';
import {
  computeRibbonGeometry,
  resolveOrientation,
  defaultPlacement as ribbonDefaultPlacement,
  JIO_DEFAULT_COLORS,
  type JioRibbonSize,
} from '../JioRibbon/JioRibbon.shared';
import { ContentBlockFoundationPlatformsContext } from './ContentBlockFoundationContext';
import { COMPONENT_SHAPE_TYPE } from './ComponentShape';
import {
  CONTENT_BLOCK_LABELS,
  CONTENT_BLOCK_PANEL_SKIP,
  CONTENT_BLOCK_SECTIONS,
} from './contentBlockPropPanel';
import styles from './PropPanel.module.css';

export interface PropPanelProps {
  editor: Editor;
  selection: SelectedComponentInfo;
}

function stableOverridesJson(o: Record<string, string> | undefined): string {
  if (!o || Object.keys(o).length === 0) return '';
  const keys = Object.keys(o).sort();
  return JSON.stringify(keys.map((k) => [k, o[k]]));
}

// ---------------------------------------------------------------------------
// Resolved px value helpers for ContentBlock token/spacing labels
// ---------------------------------------------------------------------------

/** Extract the px number from a CSS value like "20px" or "0" */
function parsePxValue(css: string | undefined): number | null {
  if (!css) return null;
  if (css === '0') return 0;
  const m = css.match(/^([\d.]+)px$/);
  return m ? parseFloat(m[1]) : null;
}

/** Read the resolved px for a dimension f-step from a dimension override map */
function fStepPx(overrides: Record<string, string>, fStep: string): string {
  const v = overrides[`--Dimension-${fStep}`];
  const px = parsePxValue(v);
  return px !== null ? `${Math.round(px * 10) / 10}px` : '';
}

/** Typography token → f-step mapping (mirrors ContentBlock.shared.ts) */
const HEADLINE_F_STEPS: Record<string, string> = {
  'Display-L': 'f7', 'Display-M': 'f6', 'Display-S': 'f5',
  'Headline-L': 'f3', 'Headline-M': 'f2', 'Headline-S': 'f0',
};
const CONTEXT_F_STEPS: Record<string, string> = {
  'Label-XS': 'f-2', 'Label-S': 'f-1', 'Label-M': 'f0', 'Label-L': 'f1',
};
const BODY_F_STEPS: Record<string, string> = {
  'Body-XS': 'f-2', 'Body-S': 'f-1', 'Body-M': 'f0', 'Body-L': 'f1',
};

/** Props whose enum options are f-step IDs (with auto) */
const F_STEP_PROPS = new Set([
  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'textGap', 'buttonGap', 'buttonRowGap',
]);

/** Props whose enum options are typography tokens (with auto) */
const TYPOGRAPHY_TOKEN_PROPS: Record<string, Record<string, string>> = {
  headlineToken: HEADLINE_F_STEPS,
  contextToken: CONTEXT_F_STEPS,
  bodyToken: BODY_F_STEPS,
};

/**
 * Build an option label annotated with the resolved px value.
 * e.g. "f2" → "f2 (20px)"  or  "Display-L" → "Display-L (40px)"
 */
function annotatedLabel(
  optionValue: string,
  propName: string,
  overrides: Record<string, string>,
): string {
  if (optionValue === 'auto') return 'auto';

  if (F_STEP_PROPS.has(propName)) {
    const px = fStepPx(overrides, optionValue);
    return px ? `${optionValue} (${px})` : optionValue;
  }

  const tokenMap = TYPOGRAPHY_TOKEN_PROPS[propName];
  if (tokenMap) {
    const fStep = tokenMap[optionValue];
    if (fStep) {
      const px = fStepPx(overrides, fStep);
      return px ? `${optionValue} (${px})` : optionValue;
    }
  }

  return optionValue;
}

const CONTENT_BLOCK_ANNOTATED_PROPS = new Set([
  ...F_STEP_PROPS,
  ...Object.keys(TYPOGRAPHY_TOKEN_PROPS),
]);

/** Components that use JSX children for their text label */
const COMPONENTS_WITH_TEXT_CHILDREN = new Set([
  'Button', 'Chip', 'Checkbox',
  'SelectableButton', 'SelectableSingleTextButton',
]);

// ---------------------------------------------------------------------------
// JioRibbon tab constants
// ---------------------------------------------------------------------------

const RIBBON_DIRECTION_TABS = [
  { value: undefined as string | undefined, label: 'Auto' },
  { value: 'horizontal', label: 'Horiz.' },
  { value: 'vertical', label: 'Vert.' },
];
const RIBBON_VERTICAL_PLACEMENTS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
];
const RIBBON_HORIZONTAL_PLACEMENTS = [
  { value: 'top', label: 'Top' },
  { value: 'center', label: 'Center' },
  { value: 'bottom', label: 'Bottom' },
];

const RIBBON_SIZE_OPTIONS: { value: JioRibbonSize; label: string }[] = [
  { value: 'XXS', label: 'XXS' },
  { value: 'XS', label: 'XS' },
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
];

const RIBBON_SIZE_SET = new Set<JioRibbonSize>(['XXS', 'XS', 'S', 'M', 'L']);

function normalizeRibbonSize(raw: unknown): JioRibbonSize {
  const s = String(raw ?? 'L');
  return RIBBON_SIZE_SET.has(s as JioRibbonSize) ? (s as JioRibbonSize) : 'L';
}

export function PropPanel({ editor, selection }: PropPanelProps) {
  const { shapeId, componentType, props, childText, meta } = selection;
  const foundationPlatforms = useContext(ContentBlockFoundationPlatformsContext);

  const handlePropChange = useCallback(
    (propName: string, value: unknown) => {
      updateShapeProp(editor, shapeId, propName, value);
    },
    [editor, shapeId],
  );

  const handleTextChange = useCallback(
    (text: string) => {
      updateShapeChildText(editor, shapeId, text);
    },
    [editor, shapeId],
  );

  const handleTypeChange = useCallback(
    (newType: string) => {
      const allMetas = getAllComponentMetas();
      const newMeta = allMetas.find((m) => m.name === newType);
      editor.updateShape({
        id: shapeId as any,
        type: 'oneui-component' as any,
        props: {
          componentType: newType,
          componentProps: sanitizeComponentPropsForTldraw(
            newMeta
              ? Object.fromEntries(
                  newMeta.props
                    .filter((p) => p.defaultValue !== undefined)
                    .map((p) => [p.name, p.defaultValue]),
                )
              : {},
          ),
          childText: '',
        },
      });
    },
    [editor, shapeId],
  );

  const componentOptions = getAllComponentMetas().map((m) => ({
    value: m.name,
    label: m.displayName,
  }));

  // Get current shape dimensions
  const currentShape = editor.getShape(shapeId as any) as any;
  const shapeW = currentShape?.props?.w ?? 0;
  const shapeH = currentShape?.props?.h ?? 0;

  const resolvedDimOverrides = useMemo((): Record<string, string> => {
    if (componentType !== 'ContentBlock') return {};
    const stored = props.foundationDimensionOverrides as Record<string, string> | undefined;
    if (stored && typeof stored === 'object' && Object.keys(stored).length > 0) {
      return stored;
    }
    const canvasW = Number(props.canvasWidth) || shapeW || 1080;
    const densityRaw = props.density;
    const density: ContentBlockDensityProp =
      densityRaw === 'compact' || densityRaw === 'open' || densityRaw === 'default'
        ? densityRaw
        : 'default';
    const plat = resolveContentBlockPlatform(
      (props.platform as V2PlatformId | 'auto' | undefined) ?? 'auto',
      canvasW,
    );
    return dimensionFStepInlineVars(plat, density);
  }, [componentType, props.foundationDimensionOverrides, props.canvasWidth, props.density, props.platform, shapeW]);

  const selectedPlatformEntry = useMemo(() => {
    const fpId = String(props.foundationPlatformId ?? '').trim();
    if (!fpId || !foundationPlatforms?.length) return null;
    return foundationPlatforms.find((p) => p.id === fpId && p.isEnabled) ?? null;
  }, [props.foundationPlatformId, foundationPlatforms]);

  const recomputeOverrides = useCallback(
    (entry: NonNullable<typeof selectedPlatformEntry>, breakpointId: string) => {
      const shape = editor.getShape(shapeId as any) as any;
      if (!shape || shape.type !== COMPONENT_SHAPE_TYPE) return {};
      const prevProps = (shape.props.componentProps ?? {}) as Record<string, unknown>;
      const densityRaw = prevProps.density;
      const density: DensityId =
        densityRaw === 'compact' || densityRaw === 'open' || densityRaw === 'default'
          ? densityRaw
          : 'default';
      const bp = breakpointId
        ? entry.breakpoints.find((b) => b.id === breakpointId)
        : null;
      const viewportW = bp ? bp.viewportWidth : (Number(prevProps.canvasWidth) || shapeW || 1080);
      return computeDimensionOverrides(entry, viewportW, density);
    },
    [editor, shapeId, shapeW],
  );

  const handleFoundationPlatformChange = useCallback(
    (val: string) => {
      const shape = editor.getShape(shapeId as any) as any;
      if (!shape || shape.type !== COMPONENT_SHAPE_TYPE) return;
      const prevProps = (shape.props.componentProps ?? {}) as Record<string, unknown>;

      if (!val) {
        const nextProps = sanitizeComponentPropsForTldraw({
          ...prevProps,
          foundationPlatformId: '',
          foundationBreakpointId: '',
          foundationDimensionOverrides: {},
        });
        editor.updateShape({
          id: shapeId as any,
          type: COMPONENT_SHAPE_TYPE as any,
          props: { componentProps: nextProps },
        } as any);
        return;
      }

      const entry = foundationPlatforms?.find((p) => p.id === val && p.isEnabled);
      if (!entry) return;

      const densityRaw = prevProps.density;
      const density: DensityId =
        densityRaw === 'compact' || densityRaw === 'open' || densityRaw === 'default'
          ? densityRaw
          : 'default';
      const canvasW = Number(prevProps.canvasWidth) || shapeW || 1080;
      const overrides = computeDimensionOverrides(entry, canvasW, density);
      const nextProps = sanitizeComponentPropsForTldraw({
        ...prevProps,
        foundationPlatformId: val,
        foundationBreakpointId: '',
        foundationDimensionOverrides: overrides,
      });
      editor.updateShape({
        id: shapeId as any,
        type: COMPONENT_SHAPE_TYPE as any,
        props: { componentProps: nextProps },
      } as any);
    },
    [editor, foundationPlatforms, shapeId, shapeW],
  );

  const handleBreakpointChange = useCallback(
    (breakpointId: string) => {
      if (!selectedPlatformEntry) return;
      const shape = editor.getShape(shapeId as any) as any;
      if (!shape || shape.type !== COMPONENT_SHAPE_TYPE) return;
      const prevProps = (shape.props.componentProps ?? {}) as Record<string, unknown>;
      const overrides = recomputeOverrides(selectedPlatformEntry, breakpointId);
      const nextProps = sanitizeComponentPropsForTldraw({
        ...prevProps,
        foundationBreakpointId: breakpointId,
        foundationDimensionOverrides: overrides,
      });
      editor.updateShape({
        id: shapeId as any,
        type: COMPONENT_SHAPE_TYPE as any,
        props: { componentProps: nextProps },
      } as any);
    },
    [editor, shapeId, selectedPlatformEntry, recomputeOverrides],
  );

  // Keep dimension overrides in sync when density or canvas size changes while a foundation platform is selected.
  useEffect(() => {
    if (componentType !== 'ContentBlock') return;
    if (!selectedPlatformEntry) return;

    const bpId = String(props.foundationBreakpointId ?? '').trim();
    const overrides = recomputeOverrides(selectedPlatformEntry, bpId);
    const prev = props.foundationDimensionOverrides as Record<string, string> | undefined;
    if (stableOverridesJson(prev) === stableOverridesJson(overrides)) return;

    updateShapeProp(editor, shapeId, 'foundationDimensionOverrides', overrides);
  }, [
    componentType,
    selectedPlatformEntry,
    props.foundationBreakpointId,
    props.density,
    props.canvasWidth,
    props.foundationDimensionOverrides,
    recomputeOverrides,
    editor,
    shapeId,
  ]);

  const [copied, setCopied] = useState(false);

  // Generate JSX for this single component
  const componentJSX = useMemo(() => {
    const ast: ASTRoot = {
      version: 1,
      name: componentType,
      root: {
        id: 'copy',
        kind: 'component',
        type: componentType,
        props: props as Record<string, any>,
        children: childText
          ? [{ id: 'copy-text', kind: 'text', text: childText }]
          : [],
      },
    };
    return astToReact(ast, { indent: 2, importSource: '@oneui/ui' });
  }, [componentType, props, childText]);

  const handleCopyJSX = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(componentJSX);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = componentJSX;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [componentJSX]);

  const handleResetSize = useCallback(() => {
    const defaults = COMPONENT_PLACE_DEFAULTS[componentType] ?? { w: 100, h: 40 };
    editor.updateShape({
      id: shapeId as any,
      type: 'oneui-component' as any,
      props: { w: defaults.w, h: defaults.h },
    } as any);
  }, [editor, shapeId, componentType]);

  // -- Frame dimensions for artboard-level positioning ----------------------
  const parentFrame = useMemo(() => {
    const shape = editor.getShape(shapeId as any) as any;
    if (!shape?.parentId) return null;
    const parent = editor.getShape(shape.parentId) as any;
    if (parent?.type !== 'frame') return null;
    return { id: parent.id, w: parent.props?.w ?? 0, h: parent.props?.h ?? 0 };
  }, [editor, shapeId]);

  const shapeX = currentShape?.x ?? 0;
  const shapeY = currentShape?.y ?? 0;

  /** Move the shape to a new x/y inside its parent frame. Optionally resize. */
  const moveShape = useCallback(
    (x: number, y: number, w?: number, h?: number) => {
      const update: Record<string, unknown> = { id: shapeId, type: COMPONENT_SHAPE_TYPE, x, y };
      if (w !== undefined || h !== undefined) {
        update.props = {
          ...(w !== undefined ? { w } : {}),
          ...(h !== undefined ? { h } : {}),
        };
      }
      editor.updateShape(update as any);
    },
    [editor, shapeId],
  );

  /** ContentBlock position/alignment preset: update prop + reposition shape. */
  const handleContentBlockPositionPreset = useCallback(
    (propName: 'position' | 'alignment', value: string) => {
      updateShapeProp(editor, shapeId, propName, value);
      if (!parentFrame) return;
      const nextPos = propName === 'position' ? value : (props.position as string) ?? 'bottom';
      const nextAlign = propName === 'alignment' ? value : (props.alignment as string) ?? 'left';
      const { x, y } = computeContentBlockPosition(
        nextPos, nextAlign, parentFrame.w, parentFrame.h, shapeW, shapeH,
      );
      moveShape(x, y);
    },
    [editor, shapeId, props, parentFrame, shapeW, shapeH, moveShape],
  );

  /** JioRibbon preset: update prop + recompute geometry + reposition and resize shape. */
  const handleRibbonPlacementPreset = useCallback(
    (propName: string, value: unknown) => {
      if (!parentFrame) {
        updateShapeProp(editor, shapeId, propName, value);
        return;
      }

      const canvasW = Number(props.canvasWidth) || parentFrame.w;
      const canvasH = Number(props.canvasHeight) || parentFrame.h;

      const nextVariant = propName === 'variant'
        ? (value as string)
        : ((props.variant as string) ?? 'dots-with-symbol');
      const nextOrientation = propName === 'orientation'
        ? ((value as string) ?? resolveOrientation(canvasW, canvasH))
        : ((props.orientation as string) ?? resolveOrientation(canvasW, canvasH));

      const VERT_PLACEMENTS = new Set(['left', 'center', 'right']);
      const HORIZ_PLACEMENTS = new Set(['top', 'center', 'bottom']);
      const validPlacements = nextOrientation === 'vertical' ? VERT_PLACEMENTS : HORIZ_PLACEMENTS;

      let nextPlacement: string;
      if (propName === 'placement') {
        nextPlacement = value as string;
      } else {
        const currentPlacement = (props.placement as string) ?? '';
        nextPlacement = validPlacements.has(currentPlacement)
          ? currentPlacement
          : ribbonDefaultPlacement(nextOrientation as any);
      }

      if (propName === 'orientation') {
        updateShapeProp(editor, shapeId, 'placement', nextPlacement);
      }
      updateShapeProp(editor, shapeId, propName, value);

      const colors: [string, string, string] = [
        (props.color1 as string) ?? JIO_DEFAULT_COLORS.color1,
        (props.color2 as string) ?? JIO_DEFAULT_COLORS.color2,
        (props.color3 as string) ?? JIO_DEFAULT_COLORS.color3,
      ];

      const nextSize = normalizeRibbonSize(
        propName === 'size' ? value : props.size,
      );

      const geo = computeRibbonGeometry({
        variant: nextVariant as any,
        orientation: nextOrientation as any,
        canvasWidth: canvasW,
        canvasHeight: canvasH,
        colors,
        placement: nextPlacement as any,
        symbolPosition: props.symbolPosition as number | undefined,
        size: nextSize,
      });

      const ribbonW = nextOrientation === 'vertical' ? geo.containerWidth : canvasW;
      const ribbonH = geo.containerHeight;
      const { x, y } = computeRibbonPosition(
        nextOrientation, nextPlacement, canvasW, canvasH, ribbonW, ribbonH, geo.margin,
      );
      moveShape(x, y, ribbonW, ribbonH);
    },
    [editor, shapeId, props, parentFrame, moveShape],
  );

  const propLabel = useCallback(
    (propDef: PropDescriptor) =>
      componentType === 'ContentBlock'
        ? (CONTENT_BLOCK_LABELS[propDef.name] ?? propDef.name)
        : propDef.name,
    [componentType],
  );

  const renderPropControl = useCallback(
    (propDef: PropDescriptor): React.ReactNode => {
      const value = props[propDef.name];
      const label = propLabel(propDef);

      if (propDef.type === 'ReactNode' || propDef.type === 'function' || propDef.type === 'object') {
        return null;
      }

      if (propDef.type === 'enum') {
        const enumOptions = getEffectiveEnumOptions(propDef, props as Record<string, unknown>);
        if (enumOptions.length === 0) return null;
        const useAnnotatedLabels =
          componentType === 'ContentBlock' && CONTENT_BLOCK_ANNOTATED_PROPS.has(propDef.name);
        return (
          <div key={propDef.name} className={styles.field}>
            <span className={styles.label} title={propDef.description}>
              {label}
            </span>
            <Select
              value={value != null ? String(value) : String(propDef.defaultValue ?? '')}
              onChange={(val) => {
                const numVal = Number(val);
                handlePropChange(propDef.name, isNaN(numVal) ? val : numVal);
              }}
              options={enumOptions.map((o) => ({
                value: String(o),
                label: useAnnotatedLabels
                  ? annotatedLabel(String(o), propDef.name, resolvedDimOverrides)
                  : String(o),
              }))}
              size="sm"
              aria-label={label}
            />
          </div>
        );
      }

      if (propDef.type === 'boolean') {
        return (
          <div key={propDef.name} className={styles.switchField}>
            <span className={styles.switchLabel} title={propDef.description}>
              {label}
            </span>
            <Switch
              checked={Boolean(value ?? propDef.defaultValue)}
              onCheckedChange={(checked) => handlePropChange(propDef.name, checked)}
              size="s"
              aria-label={label}
            />
          </div>
        );
      }

      if (propDef.type === 'string' && propDef.name.toLowerCase().includes('icon')) {
        const iconNames = getSemanticIconNames();
        return (
          <div key={propDef.name} className={styles.field}>
            <span className={styles.label}>{label}</span>
            <Select
              value={String(value ?? propDef.defaultValue ?? 'star')}
              onChange={(val) => handlePropChange(propDef.name, val)}
              options={iconNames.map((name) => ({ value: name, label: name }))}
              size="sm"
              searchable
              aria-label={label}
            />
          </div>
        );
      }

      if (propDef.type === 'string') {
        return (
          <div key={propDef.name} className={styles.field} title={propDef.description}>
            <Input
              label={label}
              value={String(value ?? propDef.defaultValue ?? '')}
              onChange={(val) => handlePropChange(propDef.name, val)}
              size="s"
              placeholder={componentType === 'ContentBlock' ? undefined : propDef.description}
            />
          </div>
        );
      }

      if (propDef.type === 'number') {
        return (
          <div key={propDef.name} className={styles.field}>
            <Input
              label={label}
              type="number"
              value={String(value ?? propDef.defaultValue ?? 0)}
              onChange={(val) => handlePropChange(propDef.name, Number(val))}
              size="s"
            />
          </div>
        );
      }

      return null;
    },
    [
      componentType,
      handlePropChange,
      props,
      propLabel,
      resolvedDimOverrides,
    ],
  );

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.title}>{meta?.displayName ?? componentType}</span>
        <button className={styles.copyJSXButton} onClick={handleCopyJSX} title="Copy JSX">
          {copied ? '✓' : '</>'}
        </button>
        <span className={styles.dimensions} title="Click to reset size">
          <button className={styles.dimensionButton} onClick={handleResetSize}>
            {Math.round(shapeW)}×{Math.round(shapeH)}
          </button>
        </span>
      </div>

      {/* Quick variant presets — ContentBlock: position + alignment → shape x/y */}
      {meta?.previewMatrix && meta.previewMatrix.variants.length > 1 && meta.name === 'ContentBlock' && (
        <>
          <div className={styles.presets}>
            {meta.previewMatrix.variants.map((variant) => (
              <button
                key={String(variant)}
                className={styles.presetButton}
                data-active={props['position'] === variant || undefined}
                onClick={() => handleContentBlockPositionPreset('position', String(variant))}
              >
                {meta.previewMatrix.variantLabels[String(variant)] ?? String(variant)}
              </button>
            ))}
          </div>
          {meta.previewMatrix.sizes && meta.previewMatrix.sizes.length > 1 && (
            <div className={styles.presets}>
              {meta.previewMatrix.sizes?.map((size) => (
                <button
                  key={String(size)}
                  className={styles.presetButton}
                  data-active={props['alignment'] === size || undefined}
                  onClick={() => handleContentBlockPositionPreset('alignment', String(size))}
                >
                  {meta.previewMatrix.sizeLabels?.[String(size)] ?? String(size)}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {meta?.previewMatrix && meta.previewMatrix.variants.length > 1 && meta.name !== 'ContentBlock' && meta.name !== 'JioRibbon' && (() => {
        // Determine which prop the previewMatrix variants map to:
        // 1. Enum values matching a 'variant' prop → set variant
        // 2. Enum values matching an 'attention' prop → set attention
        // 3. State labels ('selected'/'unselected') → toggle a boolean prop (checked/selected)
        const firstVal = String(meta.previewMatrix!.variants[0]);
        const variantProp = meta.props.find((p) => p.name === 'variant');
        const attentionProp = meta.props.find((p) => p.name === 'attention');
        const isStateToggle =
          firstVal === 'selected' ||
          firstVal === 'unselected' ||
          firstVal === 'checked' ||
          firstVal === 'unchecked';
        const boolPropName = isStateToggle
          ? (meta.props.find((p) => p.name === 'checked')?.name ??
             meta.props.find((p) => p.name === 'selected')?.name)
          : undefined;

        const enumPropName = !isStateToggle
          ? (variantProp?.options?.some((o) => String(o) === firstVal) ? 'variant'
            : attentionProp?.options?.some((o) => String(o) === firstVal) ? 'attention'
            : variantProp ? 'variant'
            : attentionProp ? 'attention'
            : null)
          : null;

        return (
          <div className={styles.presets}>
            {meta.previewMatrix!.variants.map((v) => {
              const isOn =
                String(v) === 'selected' || String(v) === 'checked';
              const isActive = isStateToggle
                ? isOn === Boolean(props[boolPropName!])
                : props['variant'] === v || props['attention'] === v;

              return (
                <button
                  key={String(v)}
                  className={styles.presetButton}
                  data-active={isActive || undefined}
                  onClick={() => {
                    if (isStateToggle && boolPropName) {
                      handlePropChange(boolPropName, String(v) === 'selected' || String(v) === 'checked');
                    } else if (enumPropName) {
                      handlePropChange(enumPropName, v);
                    }
                  }}
                >
                  {meta.previewMatrix!.variantLabels[String(v)] ?? String(v)}
                </button>
              );
            })}
          </div>
        );
      })()}

      {/* JioRibbon — Variant / Direction / Position preset rows (repositions shape) */}
      {componentType === 'JioRibbon' && (() => {
        const canvasW = Number(props.canvasWidth) || shapeW || 1080;
        const canvasH = Number(props.canvasHeight) || shapeH || 1080;
        const explicitOrientation = props.orientation as string | undefined;
        const effectiveOrientation = explicitOrientation
          ? explicitOrientation
          : canvasW > canvasH ? 'vertical' : 'horizontal';
        const placementTabs =
          effectiveOrientation === 'vertical'
            ? RIBBON_VERTICAL_PLACEMENTS
            : RIBBON_HORIZONTAL_PLACEMENTS;
        const activePlacement =
          (props.placement as string | undefined) ??
          (effectiveOrientation === 'vertical' ? 'right' : 'bottom');
        const activeVariant = (props.variant as string | undefined) ?? 'dots';
        const activeSize = normalizeRibbonSize(props.size);

        return (
          <>
            <div className={styles.presets}>
              {[{ value: 'dots', label: 'Dots' }, { value: 'dots-with-symbol', label: 'Dots + Symbol' }].map(({ value, label }) => (
                <button
                  key={value}
                  className={styles.presetButton}
                  data-active={activeVariant === value || undefined}
                  onClick={() => handleRibbonPlacementPreset('variant', value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className={styles.presets}>
              {RIBBON_DIRECTION_TABS.map(({ value, label }) => (
                <button
                  key={label}
                  className={styles.presetButton}
                  data-active={explicitOrientation === value || undefined}
                  onClick={() => handleRibbonPlacementPreset('orientation', value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className={styles.presets}>
              {placementTabs.map(({ value, label }) => (
                <button
                  key={value}
                  className={styles.presetButton}
                  data-active={activePlacement === value || undefined}
                  onClick={() => handleRibbonPlacementPreset('placement', value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className={styles.presets}>
              {RIBBON_SIZE_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  className={styles.presetButton}
                  data-active={activeSize === value || undefined}
                  onClick={() => handleRibbonPlacementPreset('size', value)}
                  title="Ribbon thickness: L=1, M=0.8, S=0.7, XS=0.6, XXS=0.5"
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        );
      })()}

      {/* Component type selector */}
      <div className={styles.field}>
        <span className={styles.label}>Component</span>
        <Select
          value={componentType}
          onChange={handleTypeChange}
          options={componentOptions}
          size="sm"
        />
      </div>

      {/* X / Y position — hug-content shapes */}
      {(componentType === 'ContentBlock' || componentType === 'JioRibbon') ? (
        <div className={styles.positionFields}>
          <div className={styles.field}>
            <Input
              label="X"
              type="number"
              value={String(Math.round(shapeX))}
              onChange={(val) => moveShape(Number(val), shapeY)}
              size="s"
            />
          </div>
          <div className={styles.field}>
            <Input
              label="Y"
              type="number"
              value={String(Math.round(shapeY))}
              onChange={(val) => moveShape(shapeX, Number(val))}
              size="s"
            />
          </div>
        </div>
      ) : null}

      {/* Child text — only for components that use text children as their label */}
      {COMPONENTS_WITH_TEXT_CHILDREN.has(componentType) && (
        <div className={styles.field}>
          <Input
            label="Text"
            value={childText}
            onChange={handleTextChange}
            placeholder="Content text"
            size="s"
          />
        </div>
      )}

      {/* Meta-driven props — ContentBlock uses grouped sections + friendly labels */}
      {componentType === 'ContentBlock' && meta ? (
        <div className={styles.cbSections}>
          {/* Platform & Scale section — always shown for ContentBlock */}
          <section className={styles.cbSection}>
            <h3 className={styles.cbSectionTitle}>Scale</h3>
            <div className={styles.cbScaleRow}>
              {meta.props.find((p) => p.name === 'platform') && renderPropControl(meta.props.find((p) => p.name === 'platform')!)}
              {meta.props.find((p) => p.name === 'density') && renderPropControl(meta.props.find((p) => p.name === 'density')!)}
            </div>
            {foundationPlatforms && foundationPlatforms.length > 0 && (
              <>
                <div className={styles.field}>
                  <span className={styles.label}>Platform</span>
                  <Select
                    value={String(props.foundationPlatformId ?? '').trim() || ''}
                    onChange={handleFoundationPlatformChange}
                    options={[
                      { value: '', label: 'Default (viewport)' },
                      ...foundationPlatforms
                        .filter((p) => p.isEnabled)
                        .map((p) => ({ value: p.id, label: p.label })),
                    ]}
                    size="sm"
                    aria-label="Foundation platform"
                  />
                </div>
                {selectedPlatformEntry && selectedPlatformEntry.breakpoints.length > 0 && (() => {
                  const activeBpId = String(props.foundationBreakpointId ?? '').trim();
                  const activeBreakpoints = selectedPlatformEntry.breakpoints.filter((b) => b.isActive);
                  if (activeBreakpoints.length === 0) return null;
                  return (
                    <div className={styles.field}>
                      <span className={styles.label}>Breakpoint</span>
                      <div className={styles.breakpointList}>
                        <button
                          className={styles.breakpointButton}
                          data-active={!activeBpId || undefined}
                          onClick={() => handleBreakpointChange('')}
                        >
                          Auto
                        </button>
                        {activeBreakpoints.map((bp) => (
                          <button
                            key={bp.id}
                            className={styles.breakpointButton}
                            data-active={activeBpId === bp.id || undefined}
                            onClick={() => handleBreakpointChange(bp.id)}
                          >
                            <span className={styles.breakpointLabel}>{bp.label}</span>
                            <span className={styles.breakpointWidth}>
                              {bp.viewportWidth}{bp.units === 'mm' ? 'mm' : 'px'}
                              {bp.viewportHeight ? ` × ${bp.viewportHeight}${bp.units === 'mm' ? 'mm' : 'px'}` : ''}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
            {/* Width % */}
            {meta.props.find((p) => p.name === 'maxWidth') && renderPropControl(meta.props.find((p) => p.name === 'maxWidth')!)}
          </section>

          {CONTENT_BLOCK_SECTIONS.map((section) => {
            const cells = section.propNames
              .map((name) => {
                const propDef = meta.props.find((p) => p.name === name);
                if (!propDef) return null;
                return <Fragment key={name}>{renderPropControl(propDef)}</Fragment>;
              })
              .filter(Boolean);

            if (cells.length === 0) return null;

            const heading = (
              <>
                <h3 className={styles.cbSectionTitle} id={`cb-sec-${section.id}`}>
                  {section.title}
                </h3>
                {section.hint ? <p className={styles.cbHint}>{section.hint}</p> : null}
              </>
            );

            if (section.layout === 'visibility') {
              return (
                <section
                  key={section.id}
                  className={styles.cbSection}
                  aria-labelledby={`cb-sec-${section.id}`}
                >
                  {heading}
                  <div className={styles.cbVisibilityGrid}>{cells}</div>
                </section>
              );
            }

            if (section.layout === 'details') {
              return (
                <details key={section.id} className={styles.cbDetails}>
                  <summary className={styles.cbDetailsSummary}>{section.title}</summary>
                  {section.hint ? <p className={styles.cbHint}>{section.hint}</p> : null}
                  <div className={styles.cbDetailsBody}>{cells}</div>
                </details>
              );
            }

            return (
              <section
                key={section.id}
                className={styles.cbSection}
                aria-labelledby={`cb-sec-${section.id}`}
              >
                {heading}
                <div className={styles.cbSectionFields}>{cells}</div>
              </section>
            );
          })}
        </div>
      ) : (
        meta?.props.map((propDef) => {
          if (propDef.type === 'ReactNode' || propDef.type === 'function' || propDef.type === 'object') {
            return null;
          }

          if (
            componentType === 'ContentBlock' &&
            CONTENT_BLOCK_PANEL_SKIP.has(propDef.name)
          ) {
            return null;
          }

          if (
            componentType === 'ContentBlock' &&
            (propDef.name === 'position' ||
              propDef.name === 'alignment' ||
              propDef.name === 'foundationPlatformId' ||
              propDef.name === 'foundationBreakpointId' ||
              propDef.name === 'foundationDimensionOverrides')
          ) {
            return null;
          }

          if (
            componentType === 'JioRibbon' &&
            (propDef.name === 'orientation' ||
              propDef.name === 'placement' ||
              propDef.name === 'variant' ||
              propDef.name === 'size' ||
              propDef.name === 'symbolPosition')
          ) {
            return null;
          }

          return renderPropControl(propDef);
        })
      )}
    </div>
  );
}
