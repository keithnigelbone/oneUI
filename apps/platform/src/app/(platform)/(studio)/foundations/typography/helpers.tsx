/**
 * foundations/typography/helpers.tsx
 *
 * Constants, pure helper functions, and stateless sub-components
 * extracted from the typography foundation page to keep it lean.
 */

import React from 'react';
import { createPortal } from 'react-dom';
import {
  type TypographyRole,
  type FStep,
  type DensityId,
  type AvailableBreakpoint,
  type PlatformsFoundationConfig,
  type TypographyConfigV2,
  DEFAULT_FSTEP_ASSIGNMENTS,
  DEFAULT_LINE_HEIGHT_OFFSETS,
  FIXED_WEIGHT_ROLES,
  getDimensionValueFromConfig,
  viewportToBreakpointGroup,
  applyBreakpointGroupBump,
} from '@oneui/shared';
import {
  type FontMetadata,
  type FontCategory,
  buildFontFamilyString,
} from '@/design-tools/Foundations/Typography';
import { Badge } from '@oneui/ui/components/Badge';
import { Button } from '@oneui/ui/components/Button';
import { IconButton } from '@oneui/ui/components/IconButton';
import { Select } from '@oneui/ui/components/Select';
import { Surface } from '@oneui/ui/components/Surface';
import { Divider } from '@oneui/ui/components/Divider';
import { Icon } from '@oneui/ui/icons/Icon';

// ============================================================================
// Constants
// ============================================================================

/** Inline styles for font row hover effects */
export const fontRowHoverStyles = `
  .font-menu-btn:hover {
    background-color: var(--Surface-Subtle) !important;
  }
  .font-menu-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: var(--Spacing-2-5);
    min-width: 160px;
    padding: var(--Spacing-2) 0;
    background-color: var(--Surface-Main);
    border: 1px solid var(--Surface-Subtle);
    border-radius: var(--Shape-4);
    box-shadow: var(--Elevation-3);
    z-index: 50;
    overflow: hidden;
  }
  .font-menu-item {
    display: flex;
    align-items: center;
    gap: var(--Spacing-3-5);
    width: 100%;
    padding: var(--Spacing-3-5) var(--Spacing-4);
    border: none;
    background: none;
    color: var(--Text-High);
    font-size: var(--Typography-Size-S);
    text-align: left;
    cursor: pointer;
  }
  .font-menu-item:hover {
    background-color: var(--Surface-Subtle);
  }
  .font-menu-item.danger {
    color: var(--Negative-Bold, var(--Text-High));
  }
  .font-menu-item.danger:hover {
    background-color: var(--Negative-Subtle, var(--Surface-Subtle));
  }
  .font-menu-divider {
    height: 1px;
    background-color: var(--Surface-Subtle);
    margin: var(--Spacing-2-5) 0;
  }
`;

export type MainTab = 'fonts' | 'scripts' | 'typeScale' | 'lineHeight' | 'letterSpacing' | 'weights' | 'rendering' | 'opticalSizing' | 'preview';

export const MAIN_TAB_LABELS: Record<MainTab, string> = {
  fonts: 'Fonts',
  scripts: 'Scripts',
  typeScale: 'Type Scale',
  lineHeight: 'Line Height',
  letterSpacing: 'Letter Spacing',
  weights: 'Weights',
  rendering: 'Rendering',
  opticalSizing: 'Optical Size',
  preview: 'Preview',
};

export const FONT_CATEGORIES: { value: FontCategory | 'all' | 'uploaded'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'variable', label: 'Variable' },
  { value: 'sans-serif', label: 'Sans-Serif' },
  { value: 'serif', label: 'Serif' },
  { value: 'mono', label: 'Mono' },
  { value: 'script', label: 'Script Languages' },
  { value: 'uploaded', label: 'Custom Uploaded' },
];

/** Role display labels */
export const ROLE_LABELS: Record<TypographyRole, string> = {
  display: 'Display',
  headline: 'Headline',
  title: 'Title',
  body: 'Body',
  label: 'Label',
  code: 'Code',
};

/** Density labels for display */
export const DENSITY_LABELS: Record<DensityId, string> = {
  compact: 'Compact',
  default: 'Default',
  open: 'Open',
};

/** Category display labels (used when composing platform selector option labels) */
export const CATEGORY_LABELS: Record<AvailableBreakpoint['category'], string> = {
  'digital-responsive': 'Digital',
  'digital-fixed': 'Digital',
  print: 'Print',
  physical: 'Physical',
};

/** Stable ordering for categories inside the platform selector */
export const CATEGORY_ORDER: AvailableBreakpoint['category'][] = [
  'digital-responsive',
  'digital-fixed',
  'print',
  'physical',
];

// ============================================================================
// Pure helper functions
// ============================================================================

/**
 * Get pixel value for an f-step on a given platform breakpoint and density.
 */
export function getPixelForFStep(
  fStep: FStep,
  platformId: string,
  breakpointId: string,
  density: DensityId = 'default',
  platformsConfig?: PlatformsFoundationConfig,
): number {
  return getDimensionValueFromConfig(platformsConfig, platformId, breakpointId, density, fStep);
}

/** Return brand-configured f-step overrides for a role from the V2 config. */
export function getRoleFStepsFromConfig(
  role: TypographyRole,
  v2Config: TypographyConfigV2,
): Partial<Record<string, FStep>> | undefined {
  switch (role) {
    case 'display':  return v2Config.displayFSteps;
    case 'headline': return v2Config.headlineFSteps;
    case 'title':    return v2Config.titleFSteps;
    case 'body':     return v2Config.bodyFSteps;
    case 'label':    return v2Config.labelFSteps;
    case 'code':     return v2Config.codeFSteps;
  }
}

/** Return the config key that holds f-step overrides for a role. */
export function fStepConfigKey(role: TypographyRole): keyof TypographyConfigV2 {
  switch (role) {
    case 'display':  return 'displayFSteps';
    case 'headline': return 'headlineFSteps';
    case 'title':    return 'titleFSteps';
    case 'body':     return 'bodyFSteps';
    case 'label':    return 'labelFSteps';
    case 'code':     return 'codeFSteps';
  }
}

/** Get the effective f-step assignment, considering V2 overrides for all roles. */
export function getEffectiveFStep(
  role: TypographyRole,
  size: string,
  v2Config: TypographyConfigV2,
): FStep {
  const overrides = getRoleFStepsFromConfig(role, v2Config);
  if (overrides?.[size]) return overrides[size] as FStep;
  return DEFAULT_FSTEP_ASSIGNMENTS[role][size];
}

/** Viewport width (px) of the selected platform breakpoint. */
export function resolveSelectedViewportWidth(
  platformId: string,
  breakpointId: string,
  config?: PlatformsFoundationConfig,
): number {
  // Representative viewport width (px) per S/M/L breakpoint.
  const widths: Record<string, number> = { S: 360, M: 768, L: 1440 };
  if (widths[platformId]) return widths[platformId];
  if (platformId === 'web' && widths[breakpointId]) return widths[breakpointId];
  const platform = config?.platforms.find((p) => p.id === platformId);
  const bp = platform?.breakpoints.find((b) => b.id === breakpointId);
  return bp?.viewportWidth ?? 360;
}

/**
 * Effective f-step at the selected platform: the brand's base (S/M) assignment
 * with the L-group bump applied for Display/Headline. Use this for previews and
 * px so they reflect what renders at the selected breakpoint.
 */
export function getEffectiveFStepForPlatform(
  role: TypographyRole,
  size: string,
  v2Config: TypographyConfigV2,
  platformId: string,
  breakpointId: string,
  config?: PlatformsFoundationConfig,
): FStep {
  const base = getEffectiveFStep(role, size, v2Config);
  const group = viewportToBreakpointGroup(resolveSelectedViewportWidth(platformId, breakpointId, config));
  return applyBreakpointGroupBump(role, size, base, group);
}

/** Get the effective line height offset, considering V2 overrides */
export function getEffectiveLHOffset(
  role: TypographyRole,
  v2Config: TypographyConfigV2,
): number {
  return v2Config.lineHeightOffsets?.[role] ?? DEFAULT_LINE_HEIGHT_OFFSETS[role];
}

/**
 * Build the role-specific font-family CSS var for a typography preview.
 * Code role resolves via the dedicated Code slot; everything else inherits
 * the brand's text font (with a per-role override slot for advanced configs).
 */
export function rolePreviewFontFamily(role: TypographyRole): string {
  if (role === 'code') return 'var(--Typography-Font-Code, monospace)';
  const cap = role.charAt(0).toUpperCase() + role.slice(1);
  return `var(--${cap}-FontFamily, var(--Typography-Font-Text))`;
}

/**
 * Build the role-specific font-weight CSS var for a typography preview.
 * Display/Headline/Title use fixed per-size weights (`--Display-M-FontWeight`);
 * Body/Label/Code use the emphasis ladder (`--Body-FontWeight-Medium`).
 * Without this, previews fall back to inherited weight (~400) and a Display
 * sample looks indistinguishable from a Body sample.
 */
export function rolePreviewFontWeight(role: TypographyRole, size: string): string {
  const cap = role.charAt(0).toUpperCase() + role.slice(1);
  if ((FIXED_WEIGHT_ROLES as readonly TypographyRole[]).includes(role)) {
    return `var(--${cap}-${size}-FontWeight)`;
  }
  return `var(--${cap}-FontWeight-Medium)`;
}

// ============================================================================
// Stateless sub-components
// ============================================================================

/** Table header cell */
export function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ fontSize: 'var(--Label-XS-FontSize)', lineHeight: 'var(--Label-XS-LineHeight)', fontWeight: 'var(--Label-FontWeight-Medium)', color: 'var(--Text-Low)' }}>
      {children}
    </span>
  );
}

/** Rendering tab row: label + description + Select control */
export function RenderingControl({
  label,
  description,
  value,
  onChange,
  options,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 280px',
        gap: 'var(--Spacing-4-5)',
        alignItems: 'start',
        padding: 'var(--Spacing-4) var(--Spacing-0)',
        borderBottom: '1px solid var(--Surface-Subtle)',
      }}
    >
      <div>
        <div
          style={{
            fontSize: 'var(--Label-M-FontSize)',
            lineHeight: 'var(--Label-M-LineHeight)',
            fontFamily: 'var(--Label-FontFamily, var(--Typography-Font-Text))',
            fontWeight: 'var(--Label-FontWeight-Medium)',
            color: 'var(--Text-High)',
            marginBottom: 'var(--Spacing-2-5)',
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 'var(--Body-S-FontSize)',
            lineHeight: 'var(--Body-S-LineHeight)',
            fontFamily: 'var(--Body-FontFamily, var(--Typography-Font-Text))',
            color: 'var(--Text-Medium)',
          }}
        >
          {description}
        </div>
      </div>
      <Select
        value={value}
        onChange={onChange}
        options={options}
      />
    </div>
  );
}

/** Slot badge (Text, Heading, Script, Code) */
export function RoleBadge({ label }: { label: string }) {
  return <Badge size="xs" appearance="neutral" attention="medium">{label}</Badge>;
}

/** Font slot row in the selection table */
export function FontSlotRow({
  label,
  sublabel,
  fontId,
  getFontFromAllSources,
  loadedFonts,
  hasBorder,
}: {
  label: string;
  sublabel: string;
  fontId: string | null | undefined;
  getFontFromAllSources: (id: string) => FontMetadata | undefined;
  loadedFonts: Set<string>;
  hasBorder: boolean;
}) {
  const font = fontId ? getFontFromAllSources(fontId) : null;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '160px 1fr 200px',
        padding: 'var(--Spacing-4) var(--Spacing-0)',
        borderBottom: hasBorder ? '1px solid var(--Surface-Subtle)' : 'none',
        alignItems: 'center',
      }}
    >
      <div>
        <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Medium)' }}>{label}</span>
        <div style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)' }}>{sublabel}</div>
      </div>
      {font ? (
        <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-High)', fontWeight: 'var(--Typography-Weight-Medium)' }}>
          {font.name}
        </span>
      ) : (
        <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)' }}>Not set</span>
      )}
      <span
        style={{
          fontFamily: font && fontId && loadedFonts.has(fontId) ? buildFontFamilyString(font) : 'inherit',
          fontSize: 'var(--Typography-Size-2XL)',
          color: 'var(--Text-High)',
        }}
      >
        {font ? 'Aa Bb' : '—'}
      </span>
    </div>
  );
}

/** Font menu item */
export function FontMenuItem({ label, icon, onClick, danger }: { label: string; icon: React.ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <Button attention="low" size="small" onPress={onClick} leftIcon={icon as React.ReactElement} className={danger ? 'font-menu-item danger' : 'font-menu-item'}>
      {label}
    </Button>
  );
}

/** Inline font preview expansion */
export function FontPreviewExpansion({ font, onClose, onRemoveWeight }: { font: FontMetadata; onClose: () => void; onRemoveWeight?: (font: FontMetadata, weight: number) => void }) {
  const fontFamily = buildFontFamilyString(font);
  // Render the header sample at a weight the font actually ships. A single-
  // weight upload (e.g. weights: [400]) has no 700 face, so a hardcoded 700
  // would faux-bold or fall back. Variable fonts can use any weight, so prefer
  // a bold-ish 700; static fonts use their heaviest available weight.
  const weights = font.weights.length > 0 ? font.weights : [400];
  const headerWeight = font.isVariable
    ? Math.min(700, Math.max(...weights))
    : (weights.includes(700) ? 700 : Math.max(...weights));
  const weightCount = weights.length;
  const sectionLabelStyle: React.CSSProperties = {
    fontSize: 'var(--Label-XS-FontSize)',
    lineHeight: 'var(--Label-XS-LineHeight)',
    color: 'var(--Text-Low)',
    fontWeight: 'var(--Label-FontWeight-Medium)',
    marginBottom: 'var(--Spacing-3-5)',
  };
  return (
    // Accordion body renders on a MINIMAL surface. This opts every descendant
    // into the [data-surface] cascade so Text / Divider / nested Surface tokens
    // remap for context-aware contrast (no hardcoded backgrounds).
    <Surface
      mode="minimal"
      style={{
        padding: 'var(--Spacing-4-5)',
        borderRadius: 'var(--Shape-4)',
      }}
    >
      {/* Header — title, badges below it, close button top-right */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--Spacing-4-5)' }}>
        <div>
          <div style={{ fontFamily, fontSize: 'var(--Title-L-FontSize)', lineHeight: 'var(--Title-L-LineHeight)', fontWeight: headerWeight, color: 'var(--Text-High)' }}>
            {font.name}
          </div>
          <div style={{ display: 'flex', gap: 'var(--Spacing-2-5)', alignItems: 'center', marginTop: 'var(--Spacing-3)' }}>
            {font.isVariable && (
              <Badge size="xs" appearance="primary" attention="high">Variable</Badge>
            )}
            <Badge size="xs" appearance="neutral" attention="medium">
              {weightCount} {weightCount === 1 ? 'weight' : 'weights'}
            </Badge>
          </div>
        </div>
        <IconButton
          attention="low"
          size="small"
          icon={<Icon name="close" size="sm" />}
          onPress={onClose}
          aria-label="Close preview"
        />
      </div>

      {/* Size variations */}
      <div style={{ marginBottom: 'var(--Spacing-4)' }}>
        <div style={sectionLabelStyle}>Size Variations</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[48, 32, 24, 18, 14].map((size, index) => (
            <React.Fragment key={size}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--Spacing-4)', paddingBlock: 'var(--Spacing-3)' }}>
                <div style={{ fontFamily, fontSize: `${size}px`, color: 'var(--Text-High)', lineHeight: 1.2, flex: 1 }}>
                  The quick brown fox
                </div>
                <div style={{ fontSize: 'var(--Label-XS-FontSize)', lineHeight: 'var(--Label-XS-LineHeight)', color: 'var(--Text-Low)', minWidth: '40px', textAlign: 'right' }}>
                  {size}px
                </div>
              </div>
              {index < 4 && <Divider />}
            </React.Fragment>
          ))}
        </div>
      </div>

      <Divider style={{ marginBottom: 'var(--Spacing-4)' }} />

      {/* Weight variations */}
      <div>
        <div style={sectionLabelStyle}>Weight Variations</div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(weightCount, 6)}, 1fr)`, gap: 'var(--Spacing-3)' }}>
          {weights.map(weight => {
            // Only allow removing a weight when more than one remains — removing
            // the last weight would delete the whole family, which the row's
            // Delete action already covers.
            const canRemove = onRemoveWeight != null && weightCount > 1;
            return (
              // Each swatch is an ELEVATED surface (lifts above the minimal
              // accordion). Text tokens inside remap to this surface's step so
              // "Aa" / the weight label stay accessible in light and dark.
              <Surface key={weight} mode="elevated" style={{ position: 'relative', padding: 'var(--Spacing-3-5) var(--Spacing-4)', borderRadius: 'var(--Shape-3-5)', textAlign: 'center' }}>
                {canRemove && (
                  <span style={{ position: 'absolute', top: 'var(--Spacing-1)', right: 'var(--Spacing-1)' }}>
                    <IconButton
                      attention="low"
                      appearance="negative"
                      size="small"
                      aria-label={`Remove weight ${weight}`}
                      onPress={() => onRemoveWeight?.(font, weight)}
                      icon={<Icon name="close" size="xs" />}
                    />
                  </span>
                )}
                <div style={{ fontFamily, fontSize: 'var(--Title-M-FontSize)', lineHeight: 'var(--Title-M-LineHeight)', fontWeight: weight, color: 'var(--Text-High)' }}>
                  Aa
                </div>
                <div style={{ fontSize: 'var(--Label-XS-FontSize)', lineHeight: 'var(--Label-XS-LineHeight)', color: 'var(--Text-Low)', marginTop: 'var(--Spacing-2-5)' }}>
                  {weight}
                </div>
              </Surface>
            );
          })}
        </div>
      </div>
    </Surface>
  );
}

/** Toast button */
export function ToastButton({ children, attention, onClick }: { children: React.ReactNode; attention: 'high' | 'medium' | 'low'; onClick: () => void }) {
  return (
    <Button attention={attention} size="small" onPress={onClick}>
      {children}
    </Button>
  );
}

/** Modal overlay */
export function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  // Portal to <body> so the fixed backdrop escapes any transformed/filtered
  // ancestor (the studio layout applies transforms). Without this, `position:
  // fixed` is contained by that ancestor — the backdrop only covers the content
  // column and renders under the sidebar/nav, which reads as a z-index bug.
  const overlay = (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      role="presentation"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose();
      }}
    >
      {children}
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(overlay, document.body);
}
