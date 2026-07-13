/**
 * AdvancedEditor.tsx
 *
 * Full-page token editor experience with dot grid canvas
 * and property panel. Mode is controlled via context (activeTabMode).
 */

'use client';

import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { SlidersHorizontal, Eye, Scan, BookOpen } from 'lucide-react';
import { IconButton } from '@oneui/ui-internal/components/IconButton';
import { useComponentTokenEditor } from '../ComponentTokenEditorContext';
import { generateBrandCSS, overridesToArray } from '../utils/cssExporter';
import { filterLocalColorOverrideMap } from '../utils/colorOverrideFilters';
import { EditorCanvas } from './EditorCanvas';
import { EditorPanelRouter } from './EditorPanelRouter';
import type { PanelMode } from './EditorPanelRouter';
import { useComponentDecoration, DecorationProvider } from '@oneui/ui-internal/hooks/useDecorationContext';
import { useDraftOverrideCSS } from '@oneui/ui-internal/hooks/useDraftOverrideCSS';
import { useStyleInjection } from '@oneui/ui-internal/hooks/useStyleInjection';
import { buildAllComponentCSS } from '@oneui/ui/utils/buildComponentOverrideCSS';
import {
  COMPONENT_THEME_FAMILIES,
  generateOrnamentCSSProperties,
  resolveComponentThemeToOverrides,
} from '@oneui/shared';
import type { DecorationConfig } from '@oneui/shared';
import type { ComponentTokenManifest, ComponentRecipeDefinition } from '@oneui/shared';
import type { SurfaceToken } from '@oneui/shared/engine';
import type { ParityDashboardProps } from '../../FigmaParity';
import { Separator } from '@oneui/ui-internal/components/Separator';
import styles from './AdvancedEditor.module.css';

export interface AdvancedEditorProps {
  /** Name of the component being edited */
  componentName: string;
  /** Token manifest for the component */
  manifest: ComponentTokenManifest;
  /** Current platform identifier for canvas display */
  platform?: string;
  /** Pre-computed platform dimension token overrides (from usePlatformTokens) */
  platformTokens?: Record<string, string>;
  /** Always-populated platform tokens for pixel value display in property panel */
  panelPlatformTokens?: Record<string, string>;
  /** Current density mode for preview */
  previewDensity?: string;
  /** Render the component preview with token overrides */
  renderComponent: (tokens: Record<string, string>) => React.ReactNode;
  /** Render a brand-level component theme preview across key components */
  renderComponentThemePreview?: (tokens: Record<string, string>) => React.ReactNode;
  /** Currently selected variant for editing */
  selectedVariant?: string;
  /** Callback when variant changes */
  onVariantChange?: (variant: string) => void;
  /** Currently selected size for editing */
  selectedSize?: string;
  /** Callback when size changes */
  onSizeChange?: (size: string) => void;
  /** Whether to show left icon in preview */
  showLeftIcon?: boolean;
  /** Callback when left icon toggle changes */
  onLeftIconChange?: (show: boolean) => void;
  /** Whether to show right icon in preview */
  showRightIcon?: boolean;
  /** Callback when right icon toggle changes */
  onRightIconChange?: (show: boolean) => void;
  /** Whether to show all variations in preview */
  showAllVariations?: boolean;
  /** Callback when show all variations toggle changes */
  onShowAllVariationsChange?: (show: boolean) => void;
  /** Whether to show surface preview mode */
  showSurfacePreview?: boolean;
  /** Callback when surface preview toggle changes */
  onShowSurfacePreviewChange?: (show: boolean) => void;
  /** Set of enabled surfaces for preview */
  enabledSurfaces?: Set<SurfaceToken>;
  /** Callback when a surface is toggled */
  onSurfaceToggle?: (surface: SurfaceToken) => void;
  /** Whether to show interaction states in surface preview */
  showInteractionStates?: boolean;
  /** Callback when interaction states toggle changes */
  onShowInteractionStatesChange?: (show: boolean) => void;
  /** @deprecated Legacy surface stacking — V4 uses multiRoleStacking via render props */
  surfaceStacking?: unknown;
  /** Render surface preview component */
  renderSurfacePreview?: (tokens: Record<string, string>) => React.ReactNode;
  /** Render variations preview component (condensed, normal, full-width) */
  renderVariationsPreview?: (tokens: Record<string, string>) => React.ReactNode;
  /** Selected accent role */
  selectedAccentRole?: string;
  /** Callback when accent role changes */
  onAccentRoleChange?: (role: string) => void;
  /** Available accent role options (shown when 2+ accents configured) */
  accentRoleOptions?: Array<{ value: string; label: string; color?: string }> | null;
  /** Selected metallic material for the active state (e.g. CPI arc) */
  selectedMaterial?: string;
  /** Callback when material changes — when provided, the Material control renders */
  onMaterialChange?: (material: string) => void;
  /** Available material options (None + active metals) */
  materialOptions?: Array<{ value: string; label: string; color?: string }> | null;
  /** Surface compositing mode for the whole preview (solid vs transparent/glass). */
  previewSurfaceMaterial?: 'solid' | 'transparent';
  /** Callback when surface material changes — when provided, the control renders. */
  onPreviewSurfaceMaterialChange?: (material: 'solid' | 'transparent') => void;
  /** Media context for transparent compositing (only meaningful when transparent). */
  previewMediaContext?: 'dynamic' | 'dark' | 'light';
  /** Callback when media context changes. */
  onPreviewMediaContextChange?: (context: 'dynamic' | 'dark' | 'light') => void;
  /** Actual breakpoint viewport width for canvas width simulation */
  breakpointViewport?: number | null;
  /** Whether to show condensed variant in preview */
  showCondensed?: boolean;
  /** Callback when condensed toggle changes */
  onShowCondensedChange?: (show: boolean) => void;
  /** Whether to show fullWidth button in preview */
  showFullWidth?: boolean;
  /** Callback when fullWidth toggle changes */
  onShowFullWidthChange?: (show: boolean) => void;
  /** Whether to show disabled state in preview */
  showDisabled?: boolean;
  /** Callback when disabled toggle changes */
  onShowDisabledChange?: (show: boolean) => void;
  /** Render a single isolated component for inspector mode */
  renderInspectorComponent?: (tokens: Record<string, string>) => React.ReactNode;
  /** Selected typography font ('primary', 'secondary', 'script') */
  selectedTypographyFont?: string;
  /** Callback when typography font changes */
  onTypographyFontChange?: (font: string) => void;
  /** Available typography font options */
  typographyFontOptions?: Array<{ value: string; label: string }> | null;
  /** CSS variable string for selected typography font (e.g., var(--Typography-Font-Text)) */
  typographyFontVariable?: string | null;
  /** Recipe definition for the component (enables recipe panel in Design tab) */
  recipeDefinition?: ComponentRecipeDefinition;
  /** V4 role surface CSS vars for all accent roles (injected as inline styles for appearance switching) */
  allRoleSurfaceVars?: Record<string, string>;
  /** Scoped [data-surface] remapping CSS for the edited brand preview */
  surfaceContextCSS?: string | null;
  /** [data-surface-step] step-lookup CSS (full per-step role remapping) so
   *  nested <Surface> containers in the preview adapt their descendants. */
  surfaceStepLookupCSS?: string | null;
  /** Callback when decoration placement or mirror changes */
  onDecorationUpdate?: (update: { placement?: 'edges' | 'left' | 'right'; mirror?: boolean }) => void;
  /** Whether ornament decoration is enabled in preview */
  ornamentEnabled?: boolean;
  /** Callback to toggle ornament decoration on/off */
  onOrnamentEnabledChange?: (enabled: boolean) => void;
  /** Selected surface for inspect mode background (V4 mode name) */
  selectedInspectSurface?: SurfaceToken;
  /** Callback when inspect surface changes */
  onInspectSurfaceChange?: (surface: SurfaceToken) => void;
  /** Background color hex for inspect surface */
  inspectSurfaceBgColor?: string;
  /** Props for the Figma Parity dashboard (optional — only shown when parity tab is active) */
  parityProps?: ParityDashboardProps;
  /** Override attention labels for component-specific inspector controls */
  attentionLabelOverrides?: Record<string, string>;
  /** Override size labels for component-specific inspector controls */
  sizeLabelOverrides?: Record<string, string>;
  /** Component metadata for documentation panel */
  componentMeta?: import('@oneui/shared').ComponentMeta;
}

export function AdvancedEditor({
  componentName,
  manifest,
  platform,
  platformTokens = {},
  panelPlatformTokens,
  previewDensity,
  renderComponent,
  selectedVariant = 'all',
  onVariantChange,
  selectedSize = 'all',
  onSizeChange,
  showLeftIcon = false,
  onLeftIconChange,
  showRightIcon = false,
  onRightIconChange,
  renderSurfacePreview,
  selectedAccentRole,
  onAccentRoleChange,
  accentRoleOptions,
  selectedMaterial,
  onMaterialChange,
  materialOptions,
  previewSurfaceMaterial,
  onPreviewSurfaceMaterialChange,
  previewMediaContext,
  onPreviewMediaContextChange,
  breakpointViewport,
  showCondensed = false,
  onShowCondensedChange,
  showFullWidth = false,
  onShowFullWidthChange,
  showDisabled = false,
  onShowDisabledChange,
  renderInspectorComponent,
  selectedTypographyFont,
  onTypographyFontChange,
  typographyFontOptions,
  typographyFontVariable,
  recipeDefinition,
  allRoleSurfaceVars,
  surfaceContextCSS,
  surfaceStepLookupCSS,
  onDecorationUpdate,
  ornamentEnabled,
  onOrnamentEnabledChange,
  selectedInspectSurface,
  onInspectSurfaceChange,
  inspectSurfaceBgColor,
  attentionLabelOverrides,
  sizeLabelOverrides,
  componentMeta,
}: AdvancedEditorProps) {
  const {
    selectedBrandId,
    selectedMode,
    draftOverrides,
    activeTabMode,
    setActiveTabMode,
    setTokenOverride,
    resetTokenOverride,
    resetAllOverrides,
    componentThemeSelections,
  } = useComponentTokenEditor();

  // --- Right toolbar panel state ---
  const [activePanel, setActivePanel] = useState<PanelMode | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const handleToolbarClick = useCallback((panel: PanelMode) => {
    setActivePanel(prev => prev === panel ? null : panel);
    // Sync canvas mode for panels that change the canvas rendering
    if (panel === 'overrides') {
      setActiveTabMode('design');
    } else if (panel === 'inspect') {
      setActiveTabMode('inspect');
    }
    // 'controls' doesn't change canvas mode — it configures what's displayed
  }, [setActiveTabMode]);

  // Click-outside to close floating panel
  const handleClickOutside = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;
    if (panelRef.current?.contains(target) || toolbarRef.current?.contains(target)) return;
    // Clicks inside any Base UI portaled popup (Select listbox, etc.) must not
    // collapse the panel. The popup renders in a portal OUTSIDE panelRef, so a
    // bare presence-query (the old approach) closed the panel whenever the click
    // landed on a portaled option. BrandScopePortal stamps data-oneui-brand-portal
    // on every portaled subtree — the most robust closest() target — and the
    // listbox/positioner attributes are kept as defense-in-depth.
    if (
      target.closest('[data-oneui-brand-portal]')
      || target.closest('[role="listbox"]')
      || target.closest('[role="option"]')
      || target.closest('[data-side]')
    ) {
      return;
    }
    setActivePanel(null);
  }, []);

  useEffect(() => {
    if (activePanel) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
    return undefined;
  }, [activePanel, handleClickOutside]);

  // Handle token change with optional variant and size
  const handleTokenChange = useCallback(
    (tokenName: string, selectedTokenValue: string, variant?: string, size?: string) => {
      if (manifest.tokens[tokenName]?.category === 'color') return;

      const options: { variant?: string; size?: string } = {};
      if (variant) options.variant = variant;
      if (size) options.size = size;
      const resolvedOptions = Object.keys(options).length > 0 ? options : undefined;
      setTokenOverride(tokenName, selectedTokenValue, resolvedOptions);

      // Companion behaviour: a visible border needs both colour AND width.
      // When the user picks a non-transparent borderColor, bump borderWidth
      // to Stroke-M if it's still at the manifest default of 0px. Without
      // this the stroke stays invisible and the picker feels broken.
      if (
        tokenName === 'borderColor'
        && selectedTokenValue !== 'transparent'
        && manifest.tokens.borderWidth
      ) {
        const widthKey = variant ? `borderWidth.${variant}` : 'borderWidth';
        const widthDef = manifest.tokens.borderWidth;
        const currentWidth =
          draftOverrides.get(widthKey)?.selectedToken
          ?? (variant ? widthDef.variants?.[variant] : undefined)
          ?? widthDef.defaultToken;
        if (currentWidth === '0px' || currentWidth === '0' || currentWidth === 'none') {
          setTokenOverride('borderWidth', 'Stroke-M', resolvedOptions);
        }
      }

      // Companion behaviour: paddingHorizontal is the shared fallback for
      // Start/End, but the per-size CSS chain for Start/End resolves its
      // own size-specific var (e.g. --Button-paddingHorizontalStart-10)
      // before the Button-paddingHorizontal fallback ever fires, and
      // `expandManifestDefaults` populates those size-specific vars, so a
      // bare paddingHorizontal override appears to do nothing. Mirror the
      // new value into Start and End in the same scope so the override
      // takes effect without the user having to edit three fields.
      if (tokenName === 'paddingHorizontal') {
        if (manifest.tokens.paddingHorizontalStart) {
          setTokenOverride('paddingHorizontalStart', selectedTokenValue, resolvedOptions);
        }
        if (manifest.tokens.paddingHorizontalEnd) {
          setTokenOverride('paddingHorizontalEnd', selectedTokenValue, resolvedOptions);
        }
      }
    },
    [setTokenOverride, manifest, draftOverrides]
  );

  const nonColorDraftOverrides = useMemo(
    () => filterLocalColorOverrideMap(draftOverrides, manifest.tokens),
    [draftOverrides, manifest.tokens]
  );

  // Handle token reset
  const handleTokenReset = useCallback(
    (tokenName: string) => {
      resetTokenOverride(tokenName);
    },
    [resetTokenOverride]
  );

  // Handle export CSS
  const handleExportCSS = useCallback(() => {
    const css = generateBrandCSS({
      brandSlug: selectedBrandId || 'custom',
      componentName,
      overrides: overridesToArray(nonColorDraftOverrides),
      includeComments: true,
    });

    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${componentName.toLowerCase()}-${selectedBrandId || 'custom'}-overrides.css`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [componentName, selectedBrandId, nonColorDraftOverrides]);

  const componentThemePreviewCSS = useMemo(() => {
    const selections = Object.entries(componentThemeSelections).map(([familyId, familySelections]) => ({
      familyId,
      selections: familySelections,
    }));

    return buildAllComponentCSS(
      {
        componentThemeSelections: selections,
        recipeSelections: [],
        tokenOverrides: [],
      },
      { selector: '.editor-preview-scope' }
    );
  }, [componentThemeSelections]);
  useStyleInjection('oneui-component-theme-preview', componentThemePreviewCSS);

  const cssComponentName = manifest.componentName || componentName;

  const currentComponentThemeOverrides = useMemo(() => {
    const merged = new Map<string, { selectedToken: string }>();
    const applicableComponentNames = new Set([componentName, cssComponentName]);
    if (componentName === 'Input' || componentName === 'InputField' || cssComponentName === 'Input') {
      applicableComponentNames.add('InputField');
      applicableComponentNames.add('Input');
    }

    for (const [familyId, familySelections] of Object.entries(componentThemeSelections)) {
      const family = COMPONENT_THEME_FAMILIES.find((definition) => definition.id === familyId);
      if (!family) continue;

      for (const override of resolveComponentThemeToOverrides(family, familySelections)) {
        if (!applicableComponentNames.has(override.componentName)) continue;

        merged.set(override.tokenName, { selectedToken: override.value });
      }
    }
    return merged;
  }, [componentName, componentThemeSelections, cssComponentName]);

  const effectiveDraftOverrides = useMemo(() => {
    if (currentComponentThemeOverrides.size === 0) {
      return nonColorDraftOverrides;
    }
    return new Map([...currentComponentThemeOverrides, ...nonColorDraftOverrides]);
  }, [currentComponentThemeOverrides, nonColorDraftOverrides]);

  const scopedSurfaceContextCSS = useMemo(() => {
    if (!surfaceContextCSS) return '';
    const scoped = surfaceContextCSS.replace(
      /(\[data-surface="[^"]+"\])\s*\{([^}]*)\}/g,
      (_match, selector: string, body: string) =>
        `.editor-preview-scope${selector},\n.editor-preview-scope ${selector} {${body}}`
    );
    return scoped ? `@layer brand {\n${scoped}\n}` : '';
  }, [surfaceContextCSS]);
  useStyleInjection('oneui-editor-surface-context', scopedSurfaceContextCSS);

  // The step-lookup ([data-surface-step="N"]) carries the FULL per-step role
  // remapping (--Primary-Bold, --Primary-Subtle, …) that makes a nested
  // <Surface> actually adapt its descendants. `surfaceContextCSS` above only
  // carries the focus/halo bits, so without this the preview's surface ladder
  // shows no context adaptation. Prefix every [data-surface-step="N"] occurrence
  // (handles grouped selector lists too) so each rule is scoped to the preview
  // at specificity 0,2,0 — winning over the editing brand's root role vars on
  // .editor-preview-scope (0,1,0) and the platform's global step-lookup.
  const scopedStepLookupCSS = useMemo(() => {
    if (!surfaceStepLookupCSS) return '';
    const scoped = surfaceStepLookupCSS.replace(
      /\[data-surface-step="(\d+)"\]/g,
      '.editor-preview-scope [data-surface-step="$1"]'
    );
    return scoped ? `@layer brand {\n${scoped}\n}` : '';
  }, [surfaceStepLookupCSS]);
  useStyleInjection('oneui-editor-step-lookup', scopedStepLookupCSS);

  // Editing-brand role surface vars as scoped CSS — NOT inline. Inline vars on
  // the canvas content wrapper would shadow the .editor-preview-scope[data-surface]
  // remap blocks above for every descendant, pinning components to root-resolved
  // colours and breaking surface context awareness in the editor preview.
  // As element-level declarations on the previewCard they win over inherited
  // global brand CSS, while the higher-specificity [data-surface] blocks (and
  // inner [data-surface] containers) still remap descendants correctly.
  const scopedRoleSurfaceCSS = useMemo(() => {
    if (!allRoleSurfaceVars) return '';
    const entries = Object.entries(allRoleSurfaceVars);
    if (entries.length === 0) return '';
    const declarations = entries.map(([prop, value]) => `    ${prop}: ${value};`).join('\n');
    return `@layer brand {\n  .editor-preview-scope {\n${declarations}\n  }\n}`;
  }, [allRoleSurfaceVars]);
  useStyleInjection('oneui-editor-role-surface-vars', scopedRoleSurfaceCSS);

  // Inject component token overrides (manifest defaults + user draft edits) as scoped CSS.
  // This uses the same CSS cascade path as Storybook's brand CSS injection, eliminating
  // inline style overrides that bypass CSS intermediate variable architecture.
  // The CSS is scoped to .editor-preview-scope (added to EditorCanvas previewCard).
  useDraftOverrideCSS(cssComponentName, effectiveDraftOverrides, manifest.tokens);

  // Generate ornament CSS vars directly from decoration context.
  // This ensures ornament SVGs render in the preview canvas regardless of injection mode.
  const decoration = useComponentDecoration(componentName);
  const previewOrnamentEnabled = ornamentEnabled !== false;
  const ornamentVars = useMemo<Record<string, string>>(() => {
    if (!decoration || !previewOrnamentEnabled) return {};
    return generateOrnamentCSSProperties(
      decoration.componentName,
      decoration.svgContent,
      decoration.aspectRatio,
      decoration.mirror,
      decoration.placement,
    );
  }, [decoration, previewOrnamentEnabled]);

  // Override the app-level DecorationProvider for the preview canvas.
  // When ornamentEnabled is false, provide an empty map so the Button component
  // does not render inline SVG ornaments (the context is the source of truth).
  const emptyDecorationMap = useMemo(() => new Map<string, DecorationConfig>(), []);
  const activeDecorationMap = useMemo(() => {
    if (!decoration) return emptyDecorationMap;
    return new Map<string, DecorationConfig>([[componentName, decoration]]);
  }, [decoration, componentName, emptyDecorationMap]);
  const previewDecorationMap = previewOrnamentEnabled ? activeDecorationMap : emptyDecorationMap;

  // Inline styles for the editor preview.
  // Component token defaults/overrides → injected via useDraftOverrideCSS as scoped CSS
  // Platform dimension tokens → inline on EditorCanvas previewCard (per-breakpoint)
  // Surface role vars → injected as .editor-preview-scope CSS (scopedRoleSurfaceCSS
  //   above) so [data-surface] context remapping still works for descendants.
  // Do not inline component color vars here: they would outrank scoped recipe/theme
  // CSS and make brand-level emphasis decisions appear broken.
  const inlinePreviewVars = useMemo(() => {
    const vars: Record<string, string> = {
      ...ornamentVars,
    };
    if (typographyFontVariable) {
      vars['--Typography-Font-Primary'] = typographyFontVariable;
      vars['--Typography-Font-Text'] = typographyFontVariable;
      vars['--Display-FontFamily'] = typographyFontVariable;
      vars['--Headline-FontFamily'] = typographyFontVariable;
      vars['--Title-FontFamily'] = typographyFontVariable;
      vars['--Body-FontFamily'] = typographyFontVariable;
      vars['--Label-FontFamily'] = typographyFontVariable;
    }
    return vars;
  }, [typographyFontVariable, ornamentVars]);

  // Whether surface context is active in design mode (surface applied to previewCard via EditorCanvas).
  // Skip 'default' — that mode represents the page surface, so painting a white card over the dot
  // grid just re-creates the old framed-panel look we removed. Any non-default mode still applies.
  const designSurfaceActive =
    activeTabMode === 'design'
    && !!inspectSurfaceBgColor
    && !!selectedInspectSurface
    && selectedInspectSurface !== 'default';

  // Canvas content determined by activeTabMode from context.
  // Component token overrides come from CSS (.editor-preview-scope), not inline styles.
  // Only preview-specific vars (ornaments, typography font) are passed inline here.
  const canvasContent = useMemo(() => {
    if (activeTabMode === 'inspect' && renderInspectorComponent) {
      return renderInspectorComponent(inlinePreviewVars);
    }
    if (activeTabMode === 'preview' && renderSurfacePreview) {
      return renderSurfacePreview(inlinePreviewVars);
    }
    // Design mode — surface context applied at the EditorCanvas previewCard level
    // (edge-to-edge bg, data-surface for text token cascade)
    return renderComponent(inlinePreviewVars);
  }, [renderSurfacePreview, renderComponent, renderInspectorComponent, inlinePreviewVars, activeTabMode]);

  // Surface mode uses different canvas styling (no card background etc.)
  const isSurfacePreviewActive = activeTabMode === 'preview' && !!renderSurfacePreview;

  return (
    <div className={styles.editor}>
      {/* Main Body: Canvas + Panel */}
      <div className={styles.editorBody}>
        {/* Canvas with component preview */}
        <EditorCanvas
          selectedMode={selectedMode}
          platform={platform}
          platformTokens={platformTokens}
          previewDensity={previewDensity}
          isSurfacePreview={isSurfacePreviewActive}
          breakpointViewport={breakpointViewport}
          surfaceContextMode={designSurfaceActive ? selectedInspectSurface : undefined}
          surfaceContextBgColor={designSurfaceActive ? inspectSurfaceBgColor : undefined}
        >
          <DecorationProvider decorations={previewDecorationMap}>
            {canvasContent}
          </DecorationProvider>
        </EditorCanvas>

        {/* Floating panel — overlays canvas when open */}
        {activePanel && (
          <div ref={panelRef}>
            <EditorPanelRouter
              componentName={componentName}
              manifest={manifest}
              onResetAll={resetAllOverrides}
              onExportCSS={handleExportCSS}
              panelMode={activePanel}
              editorPanelProps={{
                onTokenChange: handleTokenChange,
                onTokenReset: handleTokenReset,
                platformTokens: panelPlatformTokens || platformTokens,
                previewDensity,
                selectedVariant,
                selectedSize,
                onVariantChange,
                selectedAccentRole,
                selectedTypographyFont,
                onTypographyFontChange,
                typographyFontOptions,
                onDecorationUpdate,
                ornamentEnabled,
                onOrnamentEnabledChange,
              }}
              inspectPanelProps={{
                platformTokens: panelPlatformTokens || platformTokens,
                previewDensity,
                selectedVariant,
                selectedSize,
              }}
              recipeDefinition={recipeDefinition}
              colorVars={allRoleSurfaceVars}
              componentMeta={componentMeta}
              controlsProps={{
                selectedVariant,
                onVariantChange,
                selectedSize,
                onSizeChange,
                selectedAccentRole,
                onAccentRoleChange,
                accentRoleOptions,
                selectedMaterial,
                onMaterialChange,
                materialOptions,
                previewSurfaceMaterial,
                onPreviewSurfaceMaterialChange,
                previewMediaContext,
                onPreviewMediaContextChange,
                showLeftIcon,
                onLeftIconChange,
                showRightIcon,
                onRightIconChange,
                showCondensed,
                onShowCondensedChange,
                showFullWidth,
                onShowFullWidthChange,
                showDisabled,
                onShowDisabledChange,
                selectedInspectSurface,
                onInspectSurfaceChange,
                hasSurfaceStacking: !!inspectSurfaceBgColor,
                attentionLabelOverrides,
                sizeLabelOverrides,
              }}
            />
          </div>
        )}

        {/* Floating toolbar pill — vertically centered on right edge */}
        <div ref={toolbarRef} className={styles.rightToolbar}>
          <IconButton
            icon={<SlidersHorizontal size={16} />}
            appearance="neutral"
            attention={activePanel === 'overrides' ? 'high' : 'low'}
            size="s"
            onPress={() => handleToolbarClick('overrides')}
            aria-label="Component Overrides"
            className={styles.toolbarIcon}
          />
          <Separator orientation="vertical" />
          <IconButton
            icon={<Eye size={16} />}
            appearance="neutral"
            attention={activePanel === 'controls' ? 'high' : 'low'}
            size="s"
            onPress={() => handleToolbarClick('controls')}
            aria-label="Preview Controls"
            className={styles.toolbarIcon}
          />
          <IconButton
            icon={<Scan size={16} />}
            appearance="neutral"
            attention={activePanel === 'inspect' ? 'high' : 'low'}
            size="s"
            onPress={() => handleToolbarClick('inspect')}
            aria-label="Inspector"
            className={styles.toolbarIcon}
          />
          <IconButton
            icon={<BookOpen size={16} />}
            appearance="neutral"
            attention={activePanel === 'docs' ? 'high' : 'low'}
            size="s"
            onPress={() => handleToolbarClick('docs')}
            aria-label="Documentation"
            className={styles.toolbarIcon}
          />
        </div>
      </div>
    </div>
  );
}

export default AdvancedEditor;
