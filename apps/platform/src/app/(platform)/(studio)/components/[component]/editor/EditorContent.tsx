/**
 * [component]/editor/page.tsx
 *
 * Advanced Token Editor inside the shell.
 * Fills the content area while keeping navigation visible.
 */

'use client';

import React, { use, useMemo, useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useAction } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import {
  AdvancedEditor,
  ComponentTokenEditorProvider,
  ButtonSurfacePreview,
  VariationsPreview,
  useComponentTokenEditor,
  type SavedTokenOverride,
  type SurfaceStackingUnavailableReason,
  type SurfaceDisplayMode,
} from '@/design-tools/ComponentTokenEditor';
import {
  Button,
  ButtonPreview,
  type ButtonSize,
} from '@oneui/ui/components/Button';
import { Surface } from '@oneui/ui/components/Surface';
import { InputField, InputFeedback } from '@oneui/ui/components/Input';
import type { MultiRoleTokenSets, MediaContext } from '@oneui/shared/engine';
import {
  VISIBLE_METALLIC_PRESETS,
  getMetallicTokenLabel,
  normalizeActiveMetallicMap,
} from '@oneui/shared/engine';
import {
  Avatar,
  AvatarPreview,
} from '@oneui/ui/components/Avatar';
import {
  Radio,
  RadioGroup,
  RadioPreview,
} from '@oneui/ui/components/Radio';
import {
  Checkbox,
  CheckboxPreview,
} from '@oneui/ui/components/Checkbox';
import {
  CheckboxField,
  CheckboxFieldPreview,
} from '@oneui/ui/components/CheckboxField';
import {
  RadioField,
  RadioFieldPreview,
} from '@oneui/ui/components/RadioField';
import { Chip } from '@oneui/ui/components/Chip';
import { Card } from '@oneui/ui/components/Card';
import { Badge } from '@oneui/ui/components/Badge';
import { CounterBadge } from '@oneui/ui/components/CounterBadge';
import { IndicatorBadge } from '@oneui/ui/components/IndicatorBadge';
import { Slider } from '@oneui/ui/components/Slider';
import {
  IconContained,
  IconContainedPreview,
} from '@oneui/ui/components/IconContained';
import {
  IconButton,
  IconButtonPreview,
} from '@oneui/ui/components/IconButton';
import {
  CircularProgressIndicator,
  CircularProgressIndicatorPreview,
} from '@oneui/ui/components/CircularProgressIndicator';
import {
  Switch,
  SwitchPreview,
} from '@oneui/ui/components/Switch';
import {
  Stepper,
  StepperPreview,
} from '@oneui/ui/components/Stepper';
import {
  Image as ImageComponent,
  ImagePreview,
} from '@oneui/ui/components/Image';
import { getComponentBySlug } from '@oneui/ui/registry/componentRegistry';
import {
  type SurfaceToken,
  type MultiRoleStackingResultV4,
} from '@/design-tools/Foundations/Surfaces';
import { getFontById, buildFontFamilyById } from '@/design-tools/Foundations/Typography';
import { useGoogleFonts } from '@oneui/ui/hooks/useGoogleFonts';
import { useDensityDimensionOverrides } from '@oneui/ui/hooks/useDensityDimensionOverrides';
import { useSurfaceTokenVarsNew as useSurfaceTokenVars } from '@oneui/ui/hooks/useSurfaceTokenVarsNew';
import type { ParityEntry } from '@oneui/shared';
import { checkComponentParityFromBindings, getComponentThemeFamiliesForComponent, summarizeParity } from '@oneui/shared';
import type {
  ComponentThemeFamilyId,
  ComponentThemeSelections,
  RecipeSelections,
} from '@oneui/shared';
import type { PlatformsFoundationConfig, PlatformEntry, PlatformBreakpoint } from '@oneui/shared';
import type { DecorationConfig } from '@oneui/shared';
import type { FigmaConnectionInfo } from '@/design-tools/FigmaParity';
import { usePlatformNavigation } from '@/contexts/PlatformNavigationContext';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { useComponentControls } from '@/contexts/ComponentControlsContext';
import { useFoundationData } from '@/components/FoundationStyleProvider';
import { PageLoader } from '@/components/PageLoader';
import { useMigratedPlatformsConfig } from '@/hooks';

/** Components that use t-shirt sizes and state-based attention */
const T_SHIRT_SIZE_COMPONENTS = new Set(['radio', 'radio-field', 'checkbox', 'checkbox-field', 'icon-contained']);

/**
 * Registry-driven label resolver.
 * Returns variantLabels / sizeLabels from the component's meta if available,
 * falls back to undefined (AdvancedEditor uses its own defaults).
 */
function getMetaLabels(slug: string): {
  attentionLabels: Record<string, string> | undefined;
  sizeLabels: Record<string, string> | undefined;
} {
  const entry = getComponentBySlug(slug);
  const meta = entry?.meta;
  if (!meta) return { attentionLabels: undefined, sizeLabels: undefined };
  return {
    attentionLabels: meta.previewMatrix.variantLabels,
    sizeLabels: meta.previewMatrix.sizeLabels,
  };
}

const themePreviewStack: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-4-5)',
  width: '100%',
};

const themePreviewSection: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-3-5)',
};

const themePreviewTitle: React.CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Title-M-FontSize)',
  lineHeight: 'var(--Title-M-LineHeight)',
  fontWeight: 'var(--Title-M-FontWeight)',
  color: 'var(--Text-High)',
  margin: 'var(--Spacing-0)',
};

const themePreviewDescription: React.CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Body-S-FontSize)',
  lineHeight: 'var(--Body-S-LineHeight)',
  fontWeight: 'var(--Body-FontWeight-Low)',
  color: 'var(--Text-Medium)',
  margin: 'var(--Spacing-0)',
};

const themePreviewRow: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: 'var(--Spacing-3-5)',
};

const themePreviewGroup: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-2)',
};

const themePreviewGroupLabel: React.CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Label-XS-FontSize)',
  lineHeight: 'var(--Label-XS-LineHeight)',
  fontWeight: 'var(--Label-FontWeight-Low)',
  color: 'var(--Text-Low)',
};

const themePreviewTitleRow: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 'var(--Spacing-1-5)',
};

const themePreviewOverrideMarker: React.CSSProperties = {
  width: 'var(--Spacing-0-5)',
  height: 'var(--Spacing-0-5)',
  borderRadius: 'var(--Shape-Pill)',
  backgroundColor: 'var(--Negative-Bold)',
  flexShrink: 0,
};

const themePreviewSurface: React.CSSProperties = {
  padding: 'var(--Spacing-4)',
  borderRadius: 'var(--Shape-4)',
};

function ComponentThemePreview({ componentName, tokens }: { componentName: string; tokens: Record<string, string> }) {
  const { draftOverrides, recipeOwnedKeys } = useComponentTokenEditor();
  const affectedFamilyIds = new Set(
    getComponentThemeFamiliesForComponent(componentName).map((family) => family.id)
  );
  const hasRecipeOverride = recipeOwnedKeys.size > 0;
  const hasAdvancedOverride = Array.from(draftOverrides.keys()).some((key) => !recipeOwnedKeys.has(key));
  const hasLocalOverride = hasRecipeOverride || hasAdvancedOverride;
  const showActionsOverride = hasLocalOverride && affectedFamilyIds.has('actions');
  const showInputsOverride = hasLocalOverride && affectedFamilyIds.has('inputs');
  const showDisplayOverride = hasLocalOverride && affectedFamilyIds.has('display');
  const showCardsOverride = hasLocalOverride && affectedFamilyIds.has('cards');
  const scopedTokens: Record<string, string> = {};
  for (const [key, value] of Object.entries(tokens)) {
    if (key.startsWith('--Button-')) continue;
    scopedTokens[key] = value;
  }

  return (
    <div style={{ ...scopedTokens, ...themePreviewStack }}>
      <section style={themePreviewSection}>
        <div>
          <span style={themePreviewTitleRow}>
            <h2 style={themePreviewTitle}>Actions</h2>
            {showActionsOverride && (
              <span style={themePreviewOverrideMarker} aria-label="Local overrides active" />
            )}
          </span>
          <p style={themePreviewDescription}>
            Button-like controls should change together while preserving attention levels and appearances.
          </p>
        </div>
        <div style={themePreviewGroup}>
          <span style={themePreviewGroupLabel}>Attention levels</span>
          <div style={themePreviewRow}>
            <Button attention="high" onPress={() => {}}>
              Continue
            </Button>
            <Button attention="medium" onPress={() => {}}>
              Save draft
            </Button>
            <Button attention="low" onPress={() => {}}>
              Learn more
            </Button>
            <Button attention="high" appearance="secondary" onPress={() => {}}>
              Secondary
            </Button>
            <Button attention="high" appearance="neutral" onPress={() => {}}>
              Neutral
            </Button>
          </div>
        </div>
        <div style={themePreviewGroup}>
          <span style={themePreviewGroupLabel}>Icon, link, and selection controls</span>
          <div style={themePreviewRow}>
            <IconButton
              icon={
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              }
              aria-label="Add"
              attention="high"
            />
            <IconButton
              icon={
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              }
              aria-label="Remove"
              attention="medium"
              appearance="secondary"
            />
            <Chip selected appearance="secondary">
              Selected
            </Chip>
            <Chip appearance="neutral">Filter</Chip>
          </div>
        </div>
        <Surface mode="bold" style={themePreviewSurface}>
          <div style={themePreviewGroup}>
            <span style={themePreviewGroupLabel}>On bold surface</span>
            <div style={themePreviewRow}>
              <Button attention="high" onPress={() => {}}>
                On bold
              </Button>
              <Button attention="medium" onPress={() => {}}>
                Medium
              </Button>
              <Button attention="low" onPress={() => {}}>
                Low
              </Button>
              <IconButton
                icon={
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                }
                aria-label="Add on bold"
                attention="high"
              />
            </div>
          </div>
        </Surface>
      </section>

      <section style={themePreviewSection}>
        <div>
          <span style={themePreviewTitleRow}>
            <h2 style={themePreviewTitle}>Inputs</h2>
            {showInputsOverride && (
              <span style={themePreviewOverrideMarker} aria-label="Local overrides active" />
            )}
          </span>
          <p style={themePreviewDescription}>
            Form controls keep a common shape and density without forcing radio and switch internals to behave like text fields.
          </p>
        </div>
        <div style={themePreviewGroup}>
          <span style={themePreviewGroupLabel}>Field sizes</span>
          <div style={themePreviewRow}>
            <InputField
              label="Email"
              defaultValue="user@jio.com"
              size={10}
            />
            <InputField
              label="Search"
              placeholder="Find components"
              size={10}
            />
          </div>
        </div>
        <div style={themePreviewGroup}>
          <span style={themePreviewGroupLabel}>Selection and value controls</span>
          <div style={themePreviewRow}>
            <Checkbox checked appearance="secondary" label="Checked" />
            <Checkbox appearance="neutral" label="Unchecked" />
            <RadioGroup value="preview" aria-label="Theme preview radio">
              <Radio value="preview" appearance="secondary">
                Selected radio
              </Radio>
              <Radio value="other" appearance="neutral">
                Option
              </Radio>
            </RadioGroup>
            <Switch checked appearance="secondary" />
            <Switch appearance="neutral" />
            <Stepper value={1} min={0} max={10} appearance="secondary" />
          </div>
        </div>
      </section>

      <section style={themePreviewSection}>
        <div>
          <span style={themePreviewTitleRow}>
            <h2 style={themePreviewTitle}>Display</h2>
            {showDisplayOverride && (
              <span style={themePreviewOverrideMarker} aria-label="Local overrides active" />
            )}
          </span>
          <p style={themePreviewDescription}>
            Badges, counters, indicators, and sliders share their corner-radius family and label casing across the brand.
          </p>
        </div>
        <div style={themePreviewGroup}>
          <span style={themePreviewGroupLabel}>Badges and counters</span>
          <div style={themePreviewRow}>
            <Badge attention="high">New</Badge>
            <Badge attention="medium" appearance="positive">Active</Badge>
            <Badge attention="low" appearance="negative">Failed</Badge>
            <CounterBadge value={3} appearance="primary" />
            <CounterBadge value={42} appearance="secondary" />
            <IndicatorBadge appearance="positive" aria-label="Positive indicator" />
            <IndicatorBadge appearance="warning" aria-label="Warning indicator" />
          </div>
        </div>
        <div style={themePreviewGroup}>
          <span style={themePreviewGroupLabel}>Slider</span>
          <div style={themePreviewRow}>
            <Slider defaultValue={40} aria-label="Theme preview slider" />
          </div>
        </div>
      </section>

      <section style={themePreviewSection}>
        <div>
          <span style={themePreviewTitleRow}>
            <h2 style={themePreviewTitle}>Cards</h2>
            {showCardsOverride && (
              <span style={themePreviewOverrideMarker} aria-label="Local overrides active" />
            )}
          </span>
          <p style={themePreviewDescription}>
            Cards and panels share corner radius, stroke, elevation, fill tone, and density across the brand.
          </p>
        </div>
        <div style={themePreviewGroup}>
          <span style={themePreviewGroupLabel}>Card variants</span>
          <div style={{ ...themePreviewRow, alignItems: 'stretch' }}>
            <Card style={{ flex: 1, minWidth: 'var(--Spacing-32)' }}>
              <h3 style={themePreviewTitle}>Default card</h3>
              <p style={themePreviewDescription}>Brand-configured fill and stroke.</p>
            </Card>
            <Card surface="subtle" style={{ flex: 1, minWidth: 'var(--Spacing-32)' }}>
              <h3 style={themePreviewTitle}>Subtle card</h3>
              <p style={themePreviewDescription}>Tinted via surface context.</p>
            </Card>
            <Card surface="elevated" style={{ flex: 1, minWidth: 'var(--Spacing-32)' }}>
              <h3 style={themePreviewTitle}>Elevated card</h3>
              <p style={themePreviewDescription}>Lifted with the elevation token.</p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

interface PreviewOptions {
  selectedVariant: string;
  onVariantSelect: (variant: string) => void;
  selectedSize: string;
  onSizeSelect: (size: string) => void;
  showLeftIcon: boolean;
  showRightIcon: boolean;
  showAllVariations: boolean;
  showCondensed: boolean;
  showFullWidth: boolean;
  showDisabled: boolean;
  selectedAccentRole: string;
  /** Metallic material for the active state (currently CircularProgressIndicator). */
  selectedMaterial: string;
  /**
   * Surface compositing mode for the whole preview. 'transparent' wraps the
   * previewed component in a <Surface material="transparent"> so the brand
   * engine's [data-material="transparent"][data-media] remap reaches it (plain
   * components never emit data-material — only <Surface> does).
   */
  previewSurfaceMaterial: 'solid' | 'transparent';
  /** Media context for transparent compositing (ignored when material is solid). */
  previewMediaContext: MediaContext;
  onCellSelect?: (variant: string, size: string) => void;
}

/**
 * Token-driven transparency checkerboard. A genuinely-translucent fill composited
 * over a flat tone can still read as "white"; the checkerboard is the universal
 * "this is see-through" cue so transparent material is unambiguous. All colours
 * are tokens (no hardcoded backgrounds) per the design-system rules.
 */
const TRANSPARENCY_BACKDROP_STYLE: React.CSSProperties = {
  ['--_chk' as string]: 'color-mix(in srgb, var(--Text-Low) 14%, transparent)',
  backgroundColor: 'var(--Surface-Main)',
  backgroundImage:
    'conic-gradient(var(--_chk) 25%, transparent 0 50%, var(--_chk) 0 75%, transparent 0)',
  backgroundSize: 'var(--Spacing-4) var(--Spacing-4)',
  borderRadius: 'var(--Shape-4)',
  padding: 'var(--Spacing-4)',
};

/**
 * Wrap a preview node in a transparent <Surface> when transparent material is
 * selected, so [data-material="transparent"][data-media] role-token remapping
 * cascades to every previewed component (Button/IconButton/CircularProgress).
 * A checkerboard backdrop sits behind it so the translucency reads honestly.
 * Solid material is a no-op passthrough — zero overhead for the default case.
 */
function withPreviewMaterial(
  node: React.ReactNode,
  opts: Pick<PreviewOptions, 'previewSurfaceMaterial' | 'previewMediaContext'>,
): React.ReactNode {
  if (opts.previewSurfaceMaterial !== 'transparent') return node;
  return (
    <div style={TRANSPARENCY_BACKDROP_STYLE}>
      <Surface mode="default" material="transparent" mediaContext={opts.previewMediaContext}>
        {node}
      </Surface>
    </div>
  );
}

const BUTTON_EDITOR_ATTENTIONS = [
  { variant: 'bold', label: 'High' },
  { variant: 'subtle', label: 'Medium' },
  { variant: 'ghost', label: 'Low' },
] as const;

const BUTTON_EDITOR_STATES = [
  { state: undefined, label: 'Rest' },
  { state: 'hover', label: 'Hover' },
  { state: 'pressed', label: 'Pressed' },
] as const;

/** Neutral placeholder glyph for the IconButton state-grid preview (reusable). */
const EDITOR_ICON_GLYPH = (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
  </svg>
);

// Two-column, left-aligned preview layout: the state/variant preview sits on the
// LEFT and the surface-context ladder on the RIGHT. Wraps to stacked columns when
// the canvas is too narrow. Replaces the old centered single column.
const buttonEditorPreviewStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  columnGap: 'var(--Spacing-12)',
  rowGap: 'var(--Spacing-8)',
  width: '100%',
};

// One titled column inside the two-column preview layout.
const editorPreviewSectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-4)',
};

const editorPreviewSectionHeaderStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-0-5)',
};

const editorPreviewSectionTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Title-S-FontSize)',
  lineHeight: 'var(--Title-S-LineHeight)',
  fontWeight: 'var(--Title-FontWeight-High)',
  color: 'var(--Text-High)',
  margin: 'var(--Spacing-0)',
};

const editorPreviewSectionDescStyle: React.CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Body-S-FontSize)',
  lineHeight: 'var(--Body-S-LineHeight)',
  fontWeight: 'var(--Body-FontWeight-Low)',
  color: 'var(--Text-Medium)',
  margin: 'var(--Spacing-0)',
};

/** Titled header (title + supporting line) shared by both preview columns. */
function EditorPreviewSectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div style={editorPreviewSectionHeaderStyle}>
      <h3 style={editorPreviewSectionTitleStyle}>{title}</h3>
      <p style={editorPreviewSectionDescStyle}>{description}</p>
    </div>
  );
}

const buttonEditorLabelStyle: React.CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Label-S-FontSize)',
  lineHeight: 'var(--Label-S-LineHeight)',
  fontWeight: 'var(--Label-FontWeight-Medium)',
  color: 'var(--Text-Medium)',
};

const buttonEditorStateGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(var(--Spacing-18), auto) repeat(3, minmax(var(--Spacing-24), 1fr))',
  gap: 'var(--Spacing-3)',
  alignItems: 'center',
};

const buttonEditorHeaderStyle: React.CSSProperties = {
  ...buttonEditorLabelStyle,
  color: 'var(--Text-Low)',
  textAlign: 'center',
};

const buttonEditorRowLabelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-0-5)',
};

const buttonEditorRowTitleStyle: React.CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Title-S-FontSize)',
  lineHeight: 'var(--Title-S-LineHeight)',
  fontWeight: 'var(--Title-FontWeight-High)',
  color: 'var(--Text-High)',
};

const buttonEditorRowMetaStyle: React.CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Label-XS-FontSize)',
  lineHeight: 'var(--Label-XS-LineHeight)',
  fontWeight: 'var(--Label-FontWeight-Low)',
  color: 'var(--Text-Low)',
};

/**
 * Surface-context ladder — mirrors the Storybook "Surface Context" story. Each
 * cell is a real <Surface mode="…">; components inside use appearance="auto" and
 * adapt automatically through the brand engine's [data-surface] remapping (no JS).
 * This is how we prove a component is genuinely context-aware in the editor.
 */
const SURFACE_CONTEXT_MODES = [
  { mode: 'default', label: 'default', desc: 'page background' },
  { mode: 'minimal', label: 'minimal', desc: 'light tint' },
  { mode: 'subtle', label: 'subtle', desc: 'medium tint' },
  { mode: 'moderate', label: 'moderate', desc: 'heavier tint' },
  { mode: 'bold', label: 'bold', desc: 'full accent colour' },
  { mode: 'elevated', label: 'elevated', desc: 'floating card / popover' },
] as const;

const surfaceLadderStyle: React.CSSProperties = {
  ...editorPreviewSectionStyle,
};

// Single grid so every step label shares one column width and the surface cells
// line up. Step labels on the LEFT; the cell column hugs its content
// (max-content) so each Surface embraces the preview and the whole ladder stays
// compact enough to read in one viewport (no full-width stacked cells).
const surfaceLadderGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(var(--Spacing-16), max-content) max-content',
  columnGap: 'var(--Spacing-5)',
  rowGap: 'var(--Spacing-2-5)',
  alignItems: 'center',
};

const surfaceLadderLabelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-0-5)',
};

const surfaceLadderCellStyle: React.CSSProperties = {
  display: 'inline-flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 'var(--Spacing-4)',
  padding: 'var(--Spacing-4)',
  // Same radius logic as cards (brand-overridable --Card-borderRadius) so the
  // surface embraces the preview consistently with the card system.
  borderRadius: 'var(--Card-borderRadius, var(--Shape-4))',
};

/** Render the 6-step surface ladder; `renderCell` produces the (auto) contents per cell. */
function renderSurfaceContextLadder(renderCell: () => React.ReactNode) {
  return (
    <section style={surfaceLadderStyle} aria-label="Surface context preview">
      <EditorPreviewSectionHeader
        title="Surface context"
        description="Appearance auto — each control adapts to the surface behind it."
      />
      <div style={surfaceLadderGridStyle}>
        {SURFACE_CONTEXT_MODES.map(({ mode, label, desc }) => (
          <React.Fragment key={mode}>
            <span style={surfaceLadderLabelStyle}>
              <span style={buttonEditorRowTitleStyle}>{label}</span>
              <span style={buttonEditorRowMetaStyle}>{desc}</span>
            </span>
            <Surface mode={mode} style={surfaceLadderCellStyle}>
              {renderCell()}
            </Surface>
          </React.Fragment>
        ))}
      </div>
    </section>
  );
}

function getComponentPreview(
  component: string,
  options: PreviewOptions
) {
  switch (component) {
    case 'button':
      return (tokens: Record<string, string>) => {
        // If the user explicitly opted into the variant×size grid, keep the
        // full-matrix preview. Otherwise render ONE button reflecting every
        // inspector control (variant, size, appearance, icons, disabled) so
        // overrides are unambiguous.
        if (options.showAllVariations) {
          return (
            <ButtonPreview
              tokens={tokens}
              selectedVariant={options.selectedVariant === 'all' ? undefined : options.selectedVariant}
              onVariantSelect={options.onVariantSelect}
              selectedSize={options.selectedSize === 'all' ? undefined : options.selectedSize}
              onSizeSelect={options.onSizeSelect}
              showLeftIcon={options.showLeftIcon}
              showRightIcon={options.showRightIcon}
              showAllVariations
              showCondensed={options.showCondensed}
              showFullWidth={options.showFullWidth}
              disabled={options.showDisabled}
              appearance={options.selectedAccentRole as any}
              onCellSelect={options.onCellSelect}
            />
          );
        }
        const singleSize = (Number(options.selectedSize === 'all' ? '10' : options.selectedSize) || 10) as ButtonSize;
        const renderButton = (
          variant: 'bold' | 'subtle' | 'ghost',
          label: string,
          forceState?: 'hover' | 'pressed',
        ) => (
          <div data-force-state={forceState} style={{ display: 'inline-flex' }}>
            <Button
              attention={({ bold: 'high', subtle: 'medium', ghost: 'low' } as const)[variant]}
              size={singleSize}
              appearance="primary"
              leftIcon={options.showLeftIcon ? 'star' : undefined}
              rightIcon={options.showRightIcon ? 'chevronRight' : undefined}
              condensed={options.showCondensed}
              fullWidth={options.showFullWidth}
              disabled={options.showDisabled}
            >
              {label}
            </Button>
          </div>
        );
        return (
          <div style={{ ...tokens, ...buttonEditorPreviewStyle }}>
            {/* LEFT column — Rest / Hover / Pressed state grid. The Rest column is
                the real interactive button, so no separate "Interactive" hero is
                needed. */}
            <section style={editorPreviewSectionStyle}>
              <EditorPreviewSectionHeader
                title="States"
                description="Attention levels across rest, hover, and pressed."
              />
              <div style={buttonEditorStateGridStyle} aria-label="Button state preview">
                <span aria-hidden="true" />
                {BUTTON_EDITOR_STATES.map(({ label }) => (
                  <span key={label} style={buttonEditorHeaderStyle}>{label}</span>
                ))}
                {BUTTON_EDITOR_ATTENTIONS.map(({ variant, label }) => (
                  <React.Fragment key={variant}>
                    <span style={buttonEditorRowLabelStyle}>
                      <span style={buttonEditorRowTitleStyle}>{label}</span>
                      <span style={buttonEditorRowMetaStyle}>{variant}</span>
                    </span>
                    {BUTTON_EDITOR_STATES.map(({ state, label: stateLabel }) => (
                      <span key={`${variant}-${stateLabel}`} style={{ display: 'inline-flex', justifyContent: 'center' }}>
                        {renderButton(variant, stateLabel, state)}
                      </span>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </section>
            {/* RIGHT column — surface-context ladder (appearance auto). */}
            {renderSurfaceContextLadder(() => (
              <>
                <Button attention="high" size={singleSize} appearance="auto">High</Button>
                <Button attention="medium" size={singleSize} appearance="auto">Medium</Button>
                <Button attention="low" size={singleSize} appearance="auto">Low</Button>
              </>
            ))}
          </div>
        );
      };
    case 'avatar':
      return (tokens: Record<string, string>) => (
        <AvatarPreview
          tokens={tokens}
          selectedVariant={options.selectedVariant === 'all' ? undefined : options.selectedVariant}
          onVariantSelect={options.onVariantSelect}
          selectedSize={options.selectedSize === 'all' ? undefined : options.selectedSize}
          onSizeSelect={options.onSizeSelect}
          showAllVariations={options.showAllVariations}
          disabled={options.showDisabled}
          appearance={options.selectedAccentRole as any}
          onCellSelect={options.onCellSelect}
        />
      );
    case 'radio':
      return (tokens: Record<string, string>) => (
        <RadioPreview
          tokens={tokens}
          showAllVariations={options.showAllVariations}
          disabled={options.showDisabled}
          appearance={options.selectedAccentRole as any}
        />
      );
    case 'checkbox':
      return (tokens: Record<string, string>) => (
        <CheckboxPreview
          tokens={tokens}
          showAllVariations={options.showAllVariations}
          disabled={options.showDisabled}
          appearance={options.selectedAccentRole as any}
        />
      );
    case 'checkbox-field':
      return (tokens: Record<string, string>) => (
        <CheckboxFieldPreview
          tokens={tokens}
          showAllVariations={options.showAllVariations}
          disabled={options.showDisabled}
          appearance={options.selectedAccentRole as any}
        />
      );
    case 'radio-field':
      return (tokens: Record<string, string>) => (
        <RadioFieldPreview
          tokens={tokens}
          showAllVariations={options.showAllVariations}
          disabled={options.showDisabled}
          appearance={options.selectedAccentRole as any}
        />
      );
    case 'icon-contained':
      return (tokens: Record<string, string>) => (
        <IconContainedPreview
          tokens={tokens}
          selectedVariant={options.selectedVariant === 'all' ? undefined : options.selectedVariant}
          onVariantSelect={options.onVariantSelect}
          selectedSize={options.selectedSize === 'all' ? undefined : options.selectedSize}
          showAllVariations={options.showAllVariations}
          disabled={options.showDisabled}
          appearance={options.selectedAccentRole as any}
          onCellSelect={options.onCellSelect}
        />
      );
    case 'icon-button':
      return (tokens: Record<string, string>) => {
        // Full size × attention matrix when explicitly requested.
        if (options.showAllVariations) {
          return (
            <IconButtonPreview
              tokens={tokens}
              showAllVariations
              disabled={options.showDisabled}
              appearance={options.selectedAccentRole as any}
            />
          );
        }
        // Otherwise mirror the Button: an attention × Rest/Hover/Pressed state
        // grid. The Rest column is the real interactive icon button (hover/press
        // it live); Hover/Pressed are forced via data-force-state so every state
        // is visible at once. No separate "Interactive" hero — the grid is it.
        const singleSize = (Number(options.selectedSize === 'all' ? '10' : options.selectedSize) || 10) as any;
        const renderIconButton = (
          variant: 'bold' | 'subtle' | 'ghost',
          label: string,
          forceState?: 'hover' | 'pressed',
        ) => (
          <div data-force-state={forceState} style={{ display: 'inline-flex' }}>
            <IconButton
              icon={EDITOR_ICON_GLYPH}
              attention={({ bold: 'high', subtle: 'medium', ghost: 'low' } as const)[variant]}
              size={singleSize}
              appearance={options.selectedAccentRole as any}
              disabled={options.showDisabled}
              aria-label={`${label} ${variant}`}
            />
          </div>
        );
        return (
          <div style={{ ...tokens, ...buttonEditorPreviewStyle }}>
            {/* LEFT column — attention × Rest/Hover/Pressed state grid. */}
            <section style={editorPreviewSectionStyle}>
              <EditorPreviewSectionHeader
                title="States"
                description="Attention levels across rest, hover, and pressed."
              />
              <div style={buttonEditorStateGridStyle} aria-label="Icon button state preview">
                <span aria-hidden="true" />
                {BUTTON_EDITOR_STATES.map(({ label }) => (
                  <span key={label} style={buttonEditorHeaderStyle}>{label}</span>
                ))}
                {BUTTON_EDITOR_ATTENTIONS.map(({ variant, label }) => (
                  <React.Fragment key={variant}>
                    <span style={buttonEditorRowLabelStyle}>
                      <span style={buttonEditorRowTitleStyle}>{label}</span>
                      <span style={buttonEditorRowMetaStyle}>{variant}</span>
                    </span>
                    {BUTTON_EDITOR_STATES.map(({ state, label: stateLabel }) => (
                      <span key={`${variant}-${stateLabel}`} style={{ display: 'inline-flex', justifyContent: 'center' }}>
                        {renderIconButton(variant, stateLabel, state)}
                      </span>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </section>
            {/* RIGHT column — surface-context ladder (appearance auto). */}
            {renderSurfaceContextLadder(() => (
              <>
                <IconButton icon={EDITOR_ICON_GLYPH} attention="high" size={singleSize} appearance="auto" aria-label="High" />
                <IconButton icon={EDITOR_ICON_GLYPH} attention="medium" size={singleSize} appearance="auto" aria-label="Medium" />
                <IconButton icon={EDITOR_ICON_GLYPH} attention="low" size={singleSize} appearance="auto" aria-label="Low" />
              </>
            ))}
          </div>
        );
      };
    case 'switch':
      return (tokens: Record<string, string>) => (
        <SwitchPreview
          tokens={tokens}
          showAllVariations={options.showAllVariations}
          disabled={options.showDisabled}
          appearance={options.selectedAccentRole as any}
        />
      );
    case 'stepper':
      return (tokens: Record<string, string>) => (
        <StepperPreview
          tokens={tokens}
          showAllVariations={options.showAllVariations}
          disabled={options.showDisabled}
          appearance={options.selectedAccentRole as any}
        />
      );
    case 'image':
      return (tokens: Record<string, string>) => (
        <ImagePreview tokens={tokens} />
      );
    case 'circular-progress-indicator':
      // Mirrors the generic registry wiring (tokens + material + appearance) and
      // appends the surface-context ladder so the arc/track adaptation is visible.
      return (tokens: Record<string, string>) => (
        <div style={{ ...tokens, ...buttonEditorPreviewStyle }}>
          {/* LEFT column — variants / states preview. */}
          <section style={editorPreviewSectionStyle}>
            <EditorPreviewSectionHeader
              title="Preview"
              description="Determinate and indeterminate progress across sizes."
            />
            <CircularProgressIndicatorPreview
              tokens={tokens}
              appearance={options.selectedAccentRole === 'auto' ? undefined : (options.selectedAccentRole as any)}
              material={options.selectedMaterial as any}
              showAllVariations={options.showAllVariations}
              disabled={options.showDisabled}
            />
          </section>
          {/* RIGHT column — surface-context ladder (appearance auto). */}
          {!options.showAllVariations && renderSurfaceContextLadder(() => (
            <>
              <CircularProgressIndicator value={65} size="2XL" appearance="auto" aria-label="Determinate 65 percent" />
              <CircularProgressIndicator variant="indeterminate" size="2XL" appearance="auto" aria-label="Loading" />
            </>
          ))}
        </div>
      );
    default: {
      // Registry-driven fallback: any component that registered a
      // previewComponent gets a working editor canvas without a bespoke
      // case. Preview components share the minimal contract
      // { tokens, appearance?, showAllVariations?, disabled? } — extras
      // are ignored by previews that don't declare them.
      const GenericPreview = getComponentBySlug(component)?.previewComponent;
      if (GenericPreview) {
        return (tokens: Record<string, string>) => (
          <GenericPreview
            tokens={tokens}
            appearance={
              options.selectedAccentRole === 'auto' ? undefined : options.selectedAccentRole
            }
            showAllVariations={options.showAllVariations}
            disabled={options.showDisabled}
          />
        );
      }
      // Last resort: render the real component in a simple row.
      const RealComponent = getComponentBySlug(component)?.component;
      if (RealComponent) {
        return (tokens: Record<string, string>) => (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--Spacing-4)', ...tokens }}>
            <RealComponent>Preview</RealComponent>
          </div>
        );
      }
      return (tokens: Record<string, string>) => (
        <div style={{ color: 'var(--Text-Medium)', ...tokens }}>
          Preview for {component} coming soon
        </div>
      );
    }
  }
}

interface PageProps {
  params: Promise<{ component: string }>;
}

interface AdvancedEditorContentProps {
  component: string;
  foundationData: unknown;
  /** Callback for decoration placement/mirror changes (wired to Convex in parent) */
  onDecorationUpdate?: (update: { placement?: 'edges' | 'left' | 'right'; mirror?: boolean }) => void;
  /** Whether ornament decoration is enabled in preview */
  ornamentEnabled?: boolean;
  /** Callback to toggle ornament decoration on/off */
  onOrnamentEnabledChange?: (enabled: boolean) => void;
  /** Figma connection info for parity tab */
  figmaConnection?: FigmaConnectionInfo | null;
  /** Navigate to Figma settings */
  onOpenFigmaSettings?: () => void;
  /** Brand ID for running parity checks */
  brandId?: string | null;
}

function AdvancedEditorContent({ component, foundationData, onDecorationUpdate, ornamentEnabled, onOrnamentEnabledChange, figmaConnection, onOpenFigmaSettings, brandId }: AdvancedEditorContentProps) {
  const { theme, breakpointId } = usePlatformContext();
  // Registry-driven lookup (replaces COMPONENT_MANIFESTS + COMPONENT_RECIPES maps)
  const registryEntry = useMemo(() => getComponentBySlug(component), [component]);
  const manifest = registryEntry?.manifest ?? null;
  const recipeDefinition = registryEntry?.recipe;

  // Read component controls from shared context (TopBar controls)
  const {
    previewDensity,
    selectedPlatformId,
    selectedBreakpointId,
    setPlatformsConfig,
  } = useComponentControls();
  // Platforms config — extracted from foundation data, migrated, memoized.
  const platformsConfig = useMigratedPlatformsConfig(foundationData);

  // Sync platforms config to context when foundation data loads
  useEffect(() => {
    setPlatformsConfig(platformsConfig);
  }, [platformsConfig, setPlatformsConfig]);

  // Resolve PlatformEntry and breakpoint viewport from context selection
  const selectedPlatformEntry = useMemo<PlatformEntry | null>(() => {
    if (!selectedPlatformId) return null;
    return platformsConfig.platforms.find((p) => p.id === selectedPlatformId) ?? null;
  }, [selectedPlatformId, platformsConfig]);

  const breakpointViewport = useMemo<number | null>(() => {
    if (!selectedPlatformEntry || !selectedBreakpointId) return null;
    const bp = selectedPlatformEntry.breakpoints.find(
      (b: PlatformBreakpoint) => b.id === selectedBreakpointId
    );
    return bp?.viewportWidth ?? null;
  }, [selectedPlatformEntry, selectedBreakpointId]);

  // Density-isolated dimension overrides (for canvas preview)
  // Uses preview density (TopBar DensitySelector), NOT global density (Settings sidebar)
  const platformTokens = useDensityDimensionOverrides(previewDensity, selectedPlatformEntry, breakpointViewport, breakpointId);

  // Always-populated tokens for pixel value display in property panel.
  // When a specific breakpoint is selected, use those tokens.
  // In responsive mode (null breakpoint), show mobile endpoint values as baseline.
  // When no platform is selected at all, fall back to the default platform.
  const panelPlatformEntry = selectedPlatformEntry
    ?? platformsConfig.platforms.find((p) => p.id === platformsConfig.defaultPlatform && p.isEnabled)
    ?? platformsConfig.platforms.find((p) => p.isEnabled)
    ?? null;
  const mobileFallbackTokens = useDensityDimensionOverrides(
    previewDensity,
    panelPlatformEntry,
    panelPlatformEntry?.viewportMin ?? null,
    breakpointId
  );
  const panelPlatformTokens = useMemo(() => {
    if (Object.keys(platformTokens).length > 0) return platformTokens;
    return mobileFallbackTokens;
  }, [platformTokens, mobileFallbackTokens]);

  // Derive platform name for canvas display
  const platformName = selectedPlatformEntry?.label?.toLowerCase();
  const [selectedVariant, setSelectedVariant] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [showLeftIcon, setShowLeftIcon] = useState<boolean>(false);
  const [showRightIcon, setShowRightIcon] = useState<boolean>(false);
  // showAllVariations starts true and remains true even after cell selection
  // (selecting a cell on the grid should not collapse the grid)
  // Default to single-preview mode. Users can opt into the 3×3 variant×size grid
  // from the Controls panel when they need to compare variants side-by-side.
  const [showAllVariations, setShowAllVariations] = useState(false);
  const [showCondensed, setShowCondensed] = useState<boolean>(false);
  const [showFullWidth, setShowFullWidth] = useState<boolean>(false);
  const [showDisabled, setShowDisabled] = useState<boolean>(false);

  // Multi-accent support
  const [selectedAccentRole, setSelectedAccentRole] = useState<string>('primary');
  // Metallic material for the active state (e.g. CircularProgressIndicator arc).
  const [selectedMaterial, setSelectedMaterial] = useState<string>('none');
  // Surface compositing mode for the whole preview (solid vs transparent/glass).
  // Distinct from selectedMaterial (metallic fill) — this drives the <Surface
  // material="transparent"> wrapper that makes role tokens composite over media.
  const [previewSurfaceMaterial, setPreviewSurfaceMaterial] = useState<'solid' | 'transparent'>('solid');
  const [previewMediaContext, setPreviewMediaContext] = useState<MediaContext>('dynamic');

  // Typography font selection
  const [selectedTypographyFont, setSelectedTypographyFont] = useState<'primary' | 'secondary' | 'script'>('primary');

  // Extract typography font options from foundation data
  const typographyConfig = useMemo(() => {
    return (foundationData as any)?.typography?.config || null;
  }, [foundationData]);

  // Load brand fonts dynamically (Google Fonts / custom / uploaded)
  const { loadedFonts, loadingFonts, loadFont } = useGoogleFonts(['inter']);

  // Auto-load all configured brand fonts when typography config is available
  useEffect(() => {
    if (!typographyConfig?.fontSelection) return;
    const fontIds = [
      typographyConfig.fontSelection.primaryFontId,
      typographyConfig.fontSelection.secondaryFontId,
      ...(typographyConfig.fontSelection.fallbackFontIds || []),
    ].filter(Boolean) as string[];
    for (const fontId of fontIds) {
      if (!loadedFonts.has(fontId) && !loadingFonts.has(fontId)) {
        const font = getFontById(fontId);
        if (font) loadFont(font);
      }
    }
  }, [typographyConfig?.fontSelection, loadedFonts, loadingFonts, loadFont]);

  // Resolve actual font-family string for the selected typography font
  // This injects the concrete value (e.g., "'Geo', system-ui, sans-serif")
  // rather than a self-referencing var() which would just resolve to the static default
  const typographyFontVariable = useMemo(() => {
    const selection = typographyConfig?.fontSelection;
    switch (selectedTypographyFont) {
      case 'secondary': {
        if (selection?.secondaryFontId) {
          return buildFontFamilyById(selection.secondaryFontId);
        }
        // Fall through to primary
        if (typographyConfig?.fontFamily) return typographyConfig.fontFamily;
        if (selection?.primaryFontId) return buildFontFamilyById(selection.primaryFontId);
        return null;
      }
      case 'script': {
        if (selection?.fallbackFontIds?.length) {
          return buildFontFamilyById(selection.fallbackFontIds[0]);
        }
        // Fall through to primary
        if (typographyConfig?.fontFamily) return typographyConfig.fontFamily;
        if (selection?.primaryFontId) return buildFontFamilyById(selection.primaryFontId);
        return null;
      }
      case 'primary':
      default: {
        // Explicit fontFamily string takes precedence (uploaded fonts)
        if (typographyConfig?.fontFamily) return typographyConfig.fontFamily;
        if (selection?.primaryFontId) return buildFontFamilyById(selection.primaryFontId);
        return null;
      }
    }
  }, [selectedTypographyFont, typographyConfig]);

  // Extract available typography font options based on what's configured
  // Show role + font name: "Primary (Geo)", "Secondary (Inter)", "Script (Noto Sans)"
  const typographyFontOptions = useMemo(() => {
    const selection = typographyConfig?.fontSelection;
    const primaryFontName = selection?.primaryFontId
      ? getFontById(selection.primaryFontId)?.name
      : null;

    const options: Array<{ value: string; label: string }> = [
      { value: 'primary', label: primaryFontName ? `Primary (${primaryFontName})` : 'Primary' }
    ];
    // Add secondary if it's configured (has a secondaryFontId)
    if (selection?.secondaryFontId) {
      const secondaryFontName = getFontById(selection.secondaryFontId)?.name;
      options.push({
        value: 'secondary',
        label: secondaryFontName ? `Secondary (${secondaryFontName})` : 'Secondary',
      });
    }
    // Add script if it's configured (has fallbackFontIds)
    if (selection?.fallbackFontIds?.length) {
      const scriptFontName = getFontById(selection.fallbackFontIds[0])?.name;
      options.push({
        value: 'script',
        label: scriptFontName ? `Script (${scriptFontName})` : 'Script',
      });
    }
    return options;
  }, [typographyConfig]);

  // Surface preview state - surfaces are always shown
  const [enabledSurfaces, setEnabledSurfaces] = useState<Set<SurfaceToken>>(
    new Set(['default', 'minimal', 'subtle', 'moderate', 'bold', 'elevated'])
  );
  const [showInteractionStates, setShowInteractionStates] = useState<boolean>(false);
  const [surfaceDisplayMode, setSurfaceDisplayMode] = useState<SurfaceDisplayMode>('all');
  const [selectedSurface, setSelectedSurface] = useState<SurfaceToken>('default');

  // Handle surface toggle
  const handleSurfaceToggle = useCallback((surface: SurfaceToken) => {
    setEnabledSurfaces((prev) => {
      const next = new Set(prev);
      if (next.has(surface)) {
        next.delete(surface);
      } else {
        next.add(surface);
      }
      return next;
    });
  }, []);

  // Centralized surface token computation — same pipeline as useBrandCSS
  const resolvedTheme: 'light' | 'dark' = theme === 'dark' ? 'dark' : 'light';
  const {
    surfaceVars: allRoleSurfaceVars,
    tokenSets,
    contextCSS: surfaceContextCSS,
    stepLookupCSS: surfaceStepLookupCSS,
  } = useSurfaceTokenVars({
    foundationData: foundationData as Record<string, unknown> | undefined | null,
    theme: resolvedTheme,
    includeTokenSets: true,
    includeContextCSS: true,
    // Needed so the surface-context ladder's nested <Surface> cells actually
    // remap role tokens (--Primary-Bold etc.) and adapt per surface.
    includeStepLookupCSS: true,
  });

  // Build accent tab options with hex colors from token sets (no separate palette query)
  const appearanceConfig = (foundationData as any)?.appearanceConfig;
  const accentTabOptions = useMemo(() => {
    if (!appearanceConfig?.accents?.length) return null;
    return appearanceConfig.accents.map((accent: { role: string; label: string; scaleName: string; baseStep: number }) => {
      const rolePrefix = accent.role.charAt(0).toUpperCase() + accent.role.slice(1);
      const color = tokenSets?.roles?.[accent.role]?.surfaces?.bold?.hex;
      return {
        value: accent.role,
        label: accent.label,
        color: color || `var(--${rolePrefix}-Bold)`,
      };
    });
  }, [appearanceConfig, tokenSets]);

  // ButtonSurfacePreview requires V4 MultiRoleStackingResultV4 — not available from new hook.
  // Pass null to show unavailable state until ButtonSurfacePreview is migrated.
  const multiRoleStackingV4 = null as MultiRoleStackingResultV4 | null;

  // Derive unavailable reason from token set availability
  const surfaceStackingUnavailableReason: SurfaceStackingUnavailableReason =
    foundationData === undefined ? 'loading' : (tokenSets && Object.keys(tokenSets.roles).length > 0 ? null : 'no-surfaces-config');

  // Inspect mode surface selector state.
  const [selectedInspectSurface, setSelectedInspectSurface] = useState<SurfaceToken>('default');

  // Inspector container's own background. The container carries `data-surface`, so
  // its fill must come from a root-only `--{Role}-Fill-{Mode}` token that is not
  // remapped inside [data-surface] blocks (see CLAUDE.md § Surface). Hex fallback
  // covers FOUC and the ghost/default cases that have no Fill token.
  const inspectSurfaceBgColor = useMemo<string | undefined>(() => {
    const roleTokenSet = tokenSets?.roles?.[selectedAccentRole];
    if (!roleTokenSet) return undefined;
    const hex = roleTokenSet.surfaces[selectedInspectSurface]?.hex;
    if (!hex) return undefined;
    const roleTokenCasing = selectedAccentRole === 'brand-bg'
      ? 'Brand-Bg'
      : selectedAccentRole.charAt(0).toUpperCase() + selectedAccentRole.slice(1);
    const modeCasing = selectedInspectSurface.charAt(0).toUpperCase() + selectedInspectSurface.slice(1);
    // default / ghost don't have --{Role}-Fill-* tokens, so fall back straight to the hex.
    if (selectedInspectSurface === 'default' || selectedInspectSurface === 'ghost') return hex;
    return `var(--${roleTokenCasing}-Fill-${modeCasing}, ${hex})`;
  }, [tokenSets, selectedInspectSurface, selectedAccentRole]);

  const handleCellSelect = useCallback((variant: string, size: string) => {
    setSelectedVariant(variant);
    setSelectedSize(size);
  }, []);

  // Material/metal control — surfaced for components whose preview can paint a
  // metallic active state. CircularProgressIndicator routes the chosen metal to
  // an SVG gradient on its arc; other components rely on brand-level role
  // material assignment, so the picker stays scoped here.
  const supportsMaterialControl = component === 'circular-progress-indicator';
  const materialOptions = useMemo(() => {
    const config = (foundationData as { materials?: { config?: unknown } } | null)?.materials?.config;
    const active = normalizeActiveMetallicMap(config);
    const presets = active
      ? VISIBLE_METALLIC_PRESETS.filter((preset) => active[preset] === true)
      : VISIBLE_METALLIC_PRESETS.filter((preset) => preset !== 'custom');
    return [
      { value: 'none', label: 'None' },
      ...presets.map((preset) => ({
        value: preset,
        label: getMetallicTokenLabel(preset),
        color: `var(--Material-Metallic-${getMetallicTokenLabel(preset)}-Base)`,
      })),
    ];
  }, [foundationData]);

  const previewOptions: PreviewOptions = useMemo(() => ({
    selectedVariant,
    onVariantSelect: setSelectedVariant,
    selectedSize,
    onSizeSelect: setSelectedSize,
    showLeftIcon,
    showRightIcon,
    showAllVariations,
    showCondensed,
    showFullWidth,
    showDisabled,
    selectedAccentRole,
    selectedMaterial,
    previewSurfaceMaterial,
    previewMediaContext,
    onCellSelect: showAllVariations ? handleCellSelect : undefined,
  }), [selectedVariant, selectedSize, showLeftIcon, showRightIcon, showAllVariations, showCondensed, showFullWidth, showDisabled, selectedAccentRole, selectedMaterial, previewSurfaceMaterial, previewMediaContext, handleCellSelect]);

  const renderComponent = useMemo(() => {
    const base = getComponentPreview(component, previewOptions);
    // Wrap once at the single render site so transparent material reaches every
    // component variant without editing each switch case in getComponentPreview.
    return (tokens: Record<string, string>) => withPreviewMaterial(base(tokens), previewOptions);
  }, [component, previewOptions]);

  // Render surface preview for the enabled set of surface tokens.
  const renderSurfacePreview = useCallback((tokens: Record<string, string>) => (
    <ButtonSurfacePreview
      tokens={tokens}
      enabledSurfaces={enabledSurfaces}
      multiRoleStacking={multiRoleStackingV4 as MultiRoleTokenSets | null}
      selectedAccentRole={selectedAccentRole}
      theme={resolvedTheme}
      showInteractionStates={showInteractionStates}
      showLeftIcon={showLeftIcon}
      showRightIcon={showRightIcon}
      showCondensed={showCondensed}
      showFullWidth={showFullWidth}
      selectedSize={selectedSize === 'all' ? '10' : selectedSize}
      unavailableReason={surfaceStackingUnavailableReason}
      displayMode={surfaceDisplayMode}
      selectedSurface={selectedSurface as unknown as SurfaceToken}
      onSurfaceSelect={setSelectedSurface as unknown as (surface: SurfaceToken) => void}
      onDisplayModeChange={setSurfaceDisplayMode}
    />
  ), [enabledSurfaces, multiRoleStackingV4, resolvedTheme, showInteractionStates, showLeftIcon, showRightIcon, showCondensed, showFullWidth, selectedSize, selectedAccentRole, surfaceStackingUnavailableReason, surfaceDisplayMode, selectedSurface]);

  // Render a single isolated component for inspector mode — centered with room for labels.
  // tokens already contain inspect surface vars from AdvancedEditor.
  const renderInspectorComponent = useCallback((tokens: Record<string, string>) => {
    const containerStyle: React.CSSProperties = {
      ...tokens,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      minHeight: '200px',
      padding: 'var(--Spacing-7)',
      borderRadius: 'var(--Shape-4)',
      ...(inspectSurfaceBgColor ? { backgroundColor: inspectSurfaceBgColor } : {}),
      transition: 'background-color var(--Motion-Duration-Discreet-Short) var(--Motion-Easing-Standard)',
    };

    if (component === 'avatar') {
      const avatarSize = selectedSize === 'all' ? 'xl' : selectedSize;
      return (
        <div
          data-surface={selectedInspectSurface !== 'default' ? selectedInspectSurface : undefined}
          style={containerStyle}
        >
          <Avatar
            content="text"
            attention={(selectedVariant === 'all' ? 'high' : selectedVariant) as 'high' | 'medium' | 'low'}
            size={avatarSize as any}
            appearance={selectedAccentRole as any}
            alt="JD"
            disabled={showDisabled}
            customSize={avatarSize === 'custom' ? 60 : undefined}
          />
        </div>
      );
    }

    if (component === 'radio') {
      const radioSize = (selectedSize === 'all' ? 'm' : selectedSize) as 's' | 'm' | 'l';
      const isSelected = selectedVariant !== 'unselected';
      return (
        <div
          data-surface={selectedInspectSurface !== 'default' ? selectedInspectSurface : undefined}
          style={containerStyle}
        >
          <RadioGroup
            value={isSelected ? 'demo' : ''}
            aria-label="Inspector preview"
          >
            <Radio
              value="demo"
              size={radioSize}
              appearance={selectedAccentRole as any}
              disabled={showDisabled}
            >
              Radio Label
            </Radio>
          </RadioGroup>
        </div>
      );
    }

    if (component === 'checkbox') {
      const checkboxSize = (selectedSize === 'all' ? 'm' : selectedSize) as 's' | 'm' | 'l';
      return (
        <div
          data-surface={selectedInspectSurface !== 'default' ? selectedInspectSurface : undefined}
          style={containerStyle}
        >
          <Checkbox
            checked={selectedVariant !== 'unselected'}
            size={checkboxSize}
            appearance={selectedAccentRole as any}
            disabled={showDisabled}
            label="Checkbox Label"
          />
        </div>
      );
    }

    if (component === 'checkbox-field') {
      const checkboxSize = (selectedSize === 'all' ? 'm' : selectedSize) as 's' | 'm' | 'l';
      return (
        <div
          data-surface={selectedInspectSurface !== 'default' ? selectedInspectSurface : undefined}
          style={{ ...containerStyle, alignItems: 'flex-start' }}
        >
          <CheckboxField
            checked={selectedVariant !== 'unselected' && selectedVariant !== 'unchecked'}
            size={checkboxSize}
            appearance={selectedAccentRole as any}
            disabled={showDisabled}
            label="Checkbox field label"
            feedback={
              <InputFeedback attention="low">Supporting copy for inspector preview.</InputFeedback>
            }
          />
        </div>
      );
    }

    if (component === 'radio-field') {
      const radioSize = (selectedSize === 'all' ? 'm' : selectedSize) as 's' | 'm' | 'l';
      const defaultValue = selectedVariant !== 'unselected' ? 'b' : 'a';
      return (
        <div
          key={`${selectedVariant}-${radioSize}`}
          data-surface={selectedInspectSurface !== 'default' ? selectedInspectSurface : undefined}
          style={{ ...containerStyle, alignItems: 'flex-start' }}
        >
          <RadioField
            label="Radio field label"
            description="Pick one option for the inspector preview."
            name="radio-field-inspector"
            defaultValue={defaultValue}
            size={radioSize}
            appearance={selectedAccentRole as any}
            disabled={showDisabled}
            feedback={
              <InputFeedback attention="low">Supporting copy for inspector preview.</InputFeedback>
            }
          >
            <Radio value="a">Option A</Radio>
            <Radio value="b">Option B</Radio>
          </RadioField>
        </div>
      );
    }

    if (component === 'icon-contained') {
      const iconSize = (selectedSize === 'all' ? 'm' : selectedSize) as any;
      return (
        <div
          data-surface={selectedInspectSurface !== 'default' ? selectedInspectSurface : undefined}
          style={containerStyle}
        >
          <IconContained
            icon={
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path fill="currentColor" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            }
            attention={(selectedVariant === 'all' ? 'high' : selectedVariant) as any}
            size={iconSize}
            appearance={selectedAccentRole as any}
            disabled={showDisabled}
          />
        </div>
      );
    }

    if (component === 'switch') {
      return (
        <div
          data-surface={selectedInspectSurface !== 'default' ? selectedInspectSurface : undefined}
          style={containerStyle}
        >
          <Switch
            checked={selectedVariant !== 'unselected'}
            size={(selectedSize === 'all' ? 'm' : selectedSize) as any}
            appearance={selectedAccentRole as any}
            disabled={showDisabled}
          />
        </div>
      );
    }

    if (component === 'stepper') {
      return (
        <div
          data-surface={selectedInspectSurface !== 'default' ? selectedInspectSurface : undefined}
          style={containerStyle}
        >
          <Stepper
            value={1}
            min={0}
            max={10}
            size={(selectedSize === 'all' ? 'm' : selectedSize) as any}
            attention={(selectedVariant === 'all' ? 'medium' : selectedVariant) as any}
            appearance={selectedAccentRole as any}
            disabled={showDisabled}
          />
        </div>
      );
    }

    if (component === 'icon-button') {
      return (
        <div
          data-surface={selectedInspectSurface !== 'default' ? selectedInspectSurface : undefined}
          style={containerStyle}
        >
          <IconButton
            icon={
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path fill="currentColor" d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            }
            attention={({ bold: 'high', subtle: 'medium', ghost: 'low' } as const)[(selectedVariant === 'all' ? 'bold' : selectedVariant) as 'bold' | 'subtle' | 'ghost']}
            size={(Number(selectedSize === 'all' ? '10' : selectedSize) || 10) as any}
            appearance={selectedAccentRole as any}
            disabled={showDisabled}
            aria-label="Add"
          />
        </div>
      );
    }

    if (component === 'image') {
      return (
        <div
          data-surface={selectedInspectSurface !== 'default' ? selectedInspectSurface : undefined}
          style={{ ...containerStyle, padding: 'var(--Spacing-4)' }}
        >
          <ImageComponent
            src="https://placehold.co/300x200"
            alt="Preview"
            aspectRatio="3:2"
            style={{ width: '100%', maxWidth: '300px' }}
          />
        </div>
      );
    }

    return (
      <div
        data-surface={selectedInspectSurface !== 'default' ? selectedInspectSurface : undefined}
        style={containerStyle}
      >
        <Button
          attention={({ bold: 'high', subtle: 'medium', ghost: 'low' } as const)[(selectedVariant === 'all' ? 'bold' : selectedVariant) as 'bold' | 'subtle' | 'ghost']}
          size={(Number(selectedSize === 'all' ? '10' : selectedSize) || 10) as ButtonSize}
          appearance={selectedAccentRole as any}
          leftIcon={showLeftIcon ? 'star' : undefined}
          rightIcon={showRightIcon ? 'chevronRight' : undefined}
          condensed={showCondensed}
          disabled={showDisabled}
        >
          Button
        </Button>
      </div>
    );
  }, [component, selectedVariant, selectedSize, selectedAccentRole, showLeftIcon, showRightIcon, showCondensed, showDisabled, inspectSurfaceBgColor, selectedInspectSurface]);

  // Render variations preview (all layout modes at once)
  const handleMatrixCellSelect = useCallback((variant: string, size: string) => {
    setSelectedVariant(variant);
    setSelectedSize(size);
  }, []);

  // VariationsPreview inherits component token overrides from .editor-preview-scope CSS.
  // Surface vars come from brand CSS. Only inline-specific vars (ornaments etc.) pass through.
  const renderVariationsPreview = useCallback((tokens: Record<string, string>) => (
    <VariationsPreview
      tokens={tokens}
      selectedVariant={selectedVariant === 'all' ? 'bold' : selectedVariant}
      selectedSize={selectedSize === 'all' ? '10' : selectedSize}
      selectedAccentRole={selectedAccentRole}
      showLeftIcon={showLeftIcon}
      showRightIcon={showRightIcon}
      onCellSelect={handleMatrixCellSelect}
    />
  ), [selectedVariant, selectedSize, selectedAccentRole, showLeftIcon, showRightIcon, handleMatrixCellSelect]);

  // ====================================================================
  // Parity: component-scoped Figma binding check
  // ====================================================================
  const fetchComponentBindings = useAction(api.figmaParity.fetchComponentBindings);
  const [parityEntries, setParityEntries] = useState<ParityEntry[] | null>(null);
  const [isCheckingParity, setIsCheckingParity] = useState(false);
  const [parityError, setParityError] = useState<string | null>(null);
  const [parityNodeId, setParityNodeId] = useState<string>('');
  const [lastParityCheckAt, setLastParityCheckAt] = useState<number | undefined>();

  const handleRunParityCheck = useCallback(async (nodeId: string) => {
    if (!brandId || !manifest) return;
    setIsCheckingParity(true);
    setParityError(null);
    try {
      const result = await fetchComponentBindings({
        brandId: brandId as any,
        nodeId,
      });
      // Run component-scoped parity check using bindings from the Figma component
      const entries = checkComponentParityFromBindings(manifest, result.bindings);
      setParityEntries(entries);
      setLastParityCheckAt(Date.now());
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Parity check failed';
      setParityError(message);
      setParityEntries(null);
    } finally {
      setIsCheckingParity(false);
    }
  }, [brandId, manifest, fetchComponentBindings]);

  const paritySummary = useMemo(() => {
    if (!parityEntries) return undefined;
    return summarizeParity(parityEntries);
  }, [parityEntries]);

  if (!manifest) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        flexDirection: 'column',
        gap: 'var(--Spacing-4)',
        color: 'var(--Text-Medium)',
      }}>
        <h2 style={{ color: 'var(--Text-High)', margin: 0 }}>Component Not Found</h2>
        <p style={{ margin: 0 }}>Token editor for &quot;{component}&quot; is not available yet.</p>
        <Button attention="medium">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <AdvancedEditor
      componentName={manifest.componentName}
      componentMeta={registryEntry?.meta}
      manifest={manifest}
      platform={platformName}
      platformTokens={platformTokens}
      panelPlatformTokens={panelPlatformTokens}
      previewDensity={previewDensity}
      renderComponent={renderComponent}
      renderComponentThemePreview={(tokens) => <ComponentThemePreview componentName={manifest.componentName} tokens={tokens} />}
      selectedVariant={selectedVariant}
      onVariantChange={setSelectedVariant}
      selectedSize={selectedSize}
      onSizeChange={setSelectedSize}
      showLeftIcon={component === 'button' ? showLeftIcon : undefined}
      onLeftIconChange={component === 'button' ? setShowLeftIcon : undefined}
      showRightIcon={component === 'button' ? showRightIcon : undefined}
      onRightIconChange={component === 'button' ? setShowRightIcon : undefined}
      showAllVariations={showAllVariations}
      onShowAllVariationsChange={setShowAllVariations}
      enabledSurfaces={enabledSurfaces}
      onSurfaceToggle={handleSurfaceToggle}
      showInteractionStates={showInteractionStates}
      onShowInteractionStatesChange={setShowInteractionStates}
      renderSurfacePreview={renderSurfacePreview}
      renderVariationsPreview={component === 'button' ? renderVariationsPreview : undefined}

      selectedAccentRole={selectedAccentRole}
      onAccentRoleChange={setSelectedAccentRole}
      accentRoleOptions={accentTabOptions}
      selectedMaterial={selectedMaterial}
      onMaterialChange={supportsMaterialControl ? setSelectedMaterial : undefined}
      materialOptions={supportsMaterialControl ? materialOptions : undefined}
      previewSurfaceMaterial={previewSurfaceMaterial}
      onPreviewSurfaceMaterialChange={setPreviewSurfaceMaterial}
      previewMediaContext={previewMediaContext}
      onPreviewMediaContextChange={setPreviewMediaContext}
      showCondensed={component === 'button' ? showCondensed : undefined}
      onShowCondensedChange={component === 'button' ? setShowCondensed : undefined}
      showFullWidth={component === 'button' ? showFullWidth : undefined}
      onShowFullWidthChange={component === 'button' ? setShowFullWidth : undefined}
      showDisabled={showDisabled}
      onShowDisabledChange={setShowDisabled}
      breakpointViewport={breakpointViewport}
      renderInspectorComponent={manifest
        ? (tokens) => withPreviewMaterial(renderInspectorComponent(tokens), { previewSurfaceMaterial, previewMediaContext })
        : undefined}
      selectedTypographyFont={selectedTypographyFont}
      onTypographyFontChange={(font: string) => setSelectedTypographyFont(font as 'primary' | 'secondary' | 'script')}
      typographyFontOptions={typographyFontOptions}
      typographyFontVariable={typographyFontVariable}
      recipeDefinition={recipeDefinition}
      allRoleSurfaceVars={allRoleSurfaceVars}
      surfaceContextCSS={surfaceContextCSS}
      surfaceStepLookupCSS={surfaceStepLookupCSS}
      onDecorationUpdate={onDecorationUpdate}
      ornamentEnabled={ornamentEnabled}
      onOrnamentEnabledChange={onOrnamentEnabledChange}
      selectedInspectSurface={selectedInspectSurface}
      onInspectSurfaceChange={setSelectedInspectSurface}
      inspectSurfaceBgColor={inspectSurfaceBgColor}
      attentionLabelOverrides={getMetaLabels(component).attentionLabels}
      sizeLabelOverrides={getMetaLabels(component).sizeLabels}
      parityProps={{
        figmaConnection,
        onOpenFigmaSettings,
        entries: parityEntries ?? undefined,
        summary: paritySummary,
        isChecking: isCheckingParity,
        lastCheckedAt: lastParityCheckAt,
        onRunCheck: handleRunParityCheck,
        figmaNodeId: parityNodeId,
        onNodeIdChange: setParityNodeId,
        checkError: parityError,
      }}
    />
  );
}

export default function EditorContent({ params }: PageProps) {
  const { component } = use(params);
  const { theme, currentBrand } = usePlatformContext();

  // Defer secondary queries until after first render to reduce initial load
  const [deferredQueriesReady, setDeferredQueriesReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setDeferredQueriesReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  // Read foundation data from shared context (avoids duplicate subscription)
  const foundationData = useFoundationData();

  // Query Figma connection for this brand (used by parity tab)
  const figmaConnectionData = useQuery(
    api.figmaConnections.getByBrand,
    currentBrand?.id ? { brandId: currentBrand.id as Id<'brands'> } : 'skip'
  );

  // Count synced Figma tokens for this brand
  const figmaTokensData = useQuery(
    api.tokens.list,
    deferredQueriesReady && currentBrand?.id
      ? { brandId: currentBrand.id as Id<'brands'> }
      : 'skip'
  );

  // Build FigmaConnectionInfo for parity dashboard
  const figmaConnection = useMemo<FigmaConnectionInfo | null>(() => {
    if (figmaConnectionData === undefined) return null; // loading
    if (!figmaConnectionData) return { status: 'disconnected' as const };
    const tokenCount = figmaTokensData
      ? figmaTokensData.filter((t: any) => t.figmaId).length
      : undefined;
    return {
      status: figmaConnectionData.status as FigmaConnectionInfo['status'],
      fileKey: figmaConnectionData.fileKey,
      fileName: figmaConnectionData.fileName,
      lastSyncedAt: figmaConnectionData.lastSyncedAt,
      tokenCount,
    };
  }, [figmaConnectionData, figmaTokensData]);

  // Deferred: Fetch recipe selections (not needed for initial render)
  const savedRecipeSelectionsData = useQuery(
    api.componentRecipeSelections.getRecipeSelections,
    deferredQueriesReady && currentBrand?.id
      ? { brandId: currentBrand.id as Id<'brands'>, componentName: component }
      : 'skip'
  );

  const upsertRecipeSelections = useMutation(api.componentRecipeSelections.upsertRecipeSelections);
  const savedComponentThemeSelectionsData = useQuery(
    api.componentTokenOverrides.getComponentThemeSelections,
    deferredQueriesReady && currentBrand?.id
      ? { brandId: currentBrand.id as Id<'brands'> }
      : 'skip'
  );
  const upsertComponentThemeSelections = useMutation(
    api.componentTokenOverrides.upsertComponentThemeSelections
  );
  const deleteComponentThemeSelectionsMutation = useMutation(
    api.componentTokenOverrides.deleteComponentThemeSelections
  );

  // Transform Convex data to RecipeSelections format
  const savedRecipeSelections: RecipeSelections | null = useMemo(() => {
    if (!savedRecipeSelectionsData) return null;
    return {
      selections: (savedRecipeSelectionsData.selections || {}) as Record<string, string>,
    };
  }, [savedRecipeSelectionsData]);

  const savedComponentThemeSelections: ComponentThemeSelections[] | null = useMemo(() => {
    if (!savedComponentThemeSelectionsData) return null;
    return savedComponentThemeSelectionsData.map((selection) => ({
      familyId: selection.familyId as ComponentThemeFamilyId,
      selections: (selection.selections || {}) as Record<string, string>,
    }));
  }, [savedComponentThemeSelectionsData]);

  // Handle saving recipe selections to Convex
  const handleSaveRecipeSelections = useCallback(
    async (selections: RecipeSelections) => {
      if (!currentBrand?.id) {
        throw new Error('No brand selected');
      }
      await upsertRecipeSelections({
        brandId: currentBrand.id as Id<'brands'>,
        componentName: component,
        selections: selections.selections,
      });
    },
    [upsertRecipeSelections, currentBrand?.id, component]
  );

  const handleSaveComponentThemeSelections = useCallback(
    async (familyId: ComponentThemeFamilyId, selections: ComponentThemeSelections) => {
      if (!currentBrand?.id) {
        throw new Error('No brand selected');
      }
      await upsertComponentThemeSelections({
        brandId: currentBrand.id as Id<'brands'>,
        familyId,
        selections: selections.selections,
      });
    },
    [upsertComponentThemeSelections, currentBrand?.id]
  );

  const handleDeleteComponentThemeSelections = useCallback(
    async (familyId: ComponentThemeFamilyId) => {
      if (!currentBrand?.id) {
        throw new Error('No brand selected');
      }
      await deleteComponentThemeSelectionsMutation({
        brandId: currentBrand.id as Id<'brands'>,
        familyId,
      });
    },
    [deleteComponentThemeSelectionsMutation, currentBrand?.id]
  );

  // Deferred: Fetch saved token overrides (not needed for initial render)
  const savedOverridesData = useQuery(
    api.componentTokenOverrides.getComponentOverrides,
    deferredQueriesReady && currentBrand?.id
      ? { brandId: currentBrand.id as Id<'brands'>, componentName: component }
      : 'skip'
  );

  // Transform Convex data to SavedTokenOverride format
  const savedOverrides: SavedTokenOverride[] | null = useMemo(() => {
    if (!savedOverridesData) return null;
    return savedOverridesData.map((override) => ({
      tokenName: override.tokenName,
      mode: override.mode,
      value: override.value,
      scope: override.scope as SavedTokenOverride['scope'],
      target: override.target as SavedTokenOverride['target'],
      channel: override.channel,
      valueKind: override.valueKind,
    }));
  }, [savedOverridesData]);

  // Mutations for saving/clearing overrides
  const batchUpsertOverrides = useMutation(api.componentTokenOverrides.batchUpsertOverrides);
  const removeAllForComponent = useMutation(api.componentTokenOverrides.removeAllForComponent);

  // Handle saving overrides to Convex
  const handleSaveOverrides = useCallback(
    async (overrides: SavedTokenOverride[]) => {
      if (!currentBrand?.id) {
        throw new Error('No brand selected');
      }

      await batchUpsertOverrides({
        brandId: currentBrand.id as Id<'brands'>,
        componentName: component,
        overrides: overrides.map((o) => ({
          tokenName: o.tokenName,
          value: o.value,
          scope: o.scope,
          target: o.target,
          channel: o.channel,
          valueKind: o.valueKind,
        })),
      });
    },
    [batchUpsertOverrides, currentBrand?.id, component]
  );

  // Handle clearing all overrides from Convex
  const handleClearOverrides = useCallback(async () => {
    if (!currentBrand?.id) {
      throw new Error('No brand selected');
    }

    await removeAllForComponent({
      brandId: currentBrand.id as Id<'brands'>,
      componentName: component,
    });
  }, [removeAllForComponent, currentBrand?.id, component]);

  // ====================================================================
  // Decoration: query + mutation for placement/mirror changes
  // ====================================================================
  const componentTitle = component.charAt(0).toUpperCase() + component.slice(1); // "button" → "Button"

  const decorationQuery = useQuery(
    api.brandOrnaments.getDecoration,
    currentBrand?.id
      ? { brandId: currentBrand.id as Id<'brands'>, componentName: componentTitle }
      : 'skip'
  );

  const upsertDecoration = useMutation(api.brandOrnaments.upsertDecoration);

  const handleDecorationUpdate = useCallback(
    async (update: { placement?: 'edges' | 'left' | 'right'; mirror?: boolean }) => {
      if (!currentBrand?.id || !decorationQuery) return;
      await upsertDecoration({
        brandId: currentBrand.id as Id<'brands'>,
        componentName: componentTitle,
        ornamentId: decorationQuery.ornamentId as Id<'brandOrnaments'>,
        placement: update.placement ?? decorationQuery.placement,
        mirror: update.mirror ?? decorationQuery.mirror,
      });
    },
    [upsertDecoration, currentBrand?.id, decorationQuery, componentTitle]
  );

  // Ornament enable/disable toggle (defaults to ON when a decoration exists)
  const [ornamentEnabled, setOrnamentEnabled] = useState(true);

  // Navigate to Figma sync settings page
  const { handleNavigate } = usePlatformNavigation();
  const handleOpenFigmaSettings = useCallback(() => {
    handleNavigate('/brand/sync');
  }, [handleNavigate]);

  // Keep the editor reload path calm: the app already has a shared spinner
  // fallback, so avoid swapping to the large animated editor shimmer here.
  if (!foundationData) {
    return <PageLoader />;
  }

  return (
    <ComponentTokenEditorProvider
      mode={theme}
      brandId={currentBrand?.id || null}
      foundationData={foundationData || null}
      componentName={component}
      savedOverrides={savedOverrides}
      onSaveOverrides={handleSaveOverrides}
      onClearOverrides={handleClearOverrides}
      recipeDefinition={getComponentBySlug(component)?.recipe}
      savedRecipeSelections={savedRecipeSelections}
      onSaveRecipeSelections={handleSaveRecipeSelections}
      savedComponentThemeSelections={savedComponentThemeSelections}
      onSaveComponentThemeSelections={handleSaveComponentThemeSelections}
      onDeleteComponentThemeSelections={handleDeleteComponentThemeSelections}
    >
      <AdvancedEditorContent
        component={component}
        foundationData={foundationData}
        onDecorationUpdate={decorationQuery ? handleDecorationUpdate : undefined}
        ornamentEnabled={ornamentEnabled}
        onOrnamentEnabledChange={setOrnamentEnabled}
        figmaConnection={figmaConnection}
        onOpenFigmaSettings={handleOpenFigmaSettings}
        brandId={currentBrand?.id}
      />
    </ComponentTokenEditorProvider>
  );
}
