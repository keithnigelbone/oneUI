/**
 * brand/overview/FoundationSelections.tsx
 *
 * "Foundation Selections" list: one row per foundation, separated by a
 * horizontal divider. Each row shows the brand's current selection (where
 * meaningful) plus a Configured/Not-configured Badge.
 */

'use client';

import React, { useMemo } from 'react';
import { CircleDashed, Grid3x3, Layers2, Square, Type, Zap } from 'lucide-react';
import { Badge } from '@oneui/ui/components/Badge';
import { Button } from '@oneui/ui/components/Button';
import { Icon } from '@oneui/ui/icons/Icon';
import type { SemanticIconName } from '@oneui/shared';
import { buildAvailableScales } from '@oneui/shared/engine';
import { buildFontFamilyString } from '@/design-tools/Foundations/Typography';
import { usePlatformNavigation } from '@/contexts/PlatformNavigationContext';
import { usePlatformContext } from '@/contexts/PlatformContext';
import {
  ElevationPreview,
  GridPreview,
  MaterialsPreview,
  MotionPreview,
  ShapeLanguagePreview,
} from './FoundationTiles';
import styles from './page.module.css';

type FoundationType =
  | 'color'
  | 'typography'
  | 'appearance'
  | 'shape'
  | 'elevation'
  | 'motion'
  | 'grid'
  | 'materials'
  | 'icons';

const ROUTE_MAP: Record<FoundationType, string> = {
  color: 'color',
  typography: 'typography',
  appearance: 'appearance',
  shape: 'shapes',
  elevation: 'elevation',
  motion: 'motion',
  grid: 'grid',
  materials: 'materials',
  icons: 'icons',
};

const ICON_SIZE = 20;

interface PrimaryFont {
  id: string;
  name: string;
}

interface FoundationSelectionsSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  brandOverviewData: Record<string, any> | undefined | null;
  /** FontMetadata for built-in Google Fonts (used for font-family preview). */
  primaryFont: PrimaryFont | null | undefined;
  /** Resolved display name across built-in / uploaded / bare-family sources. */
  primaryFontName: string | null;
  loadedFonts: Set<string>;
}

export const FoundationSelectionsSection = React.memo(
  function FoundationSelectionsSection({
    brandOverviewData,
    primaryFont,
    primaryFontName,
    loadedFonts,
  }: FoundationSelectionsSectionProps) {
    const { theme } = usePlatformContext();
    const isDarkMode = theme === 'dark';
    const stats = brandOverviewData?.stats as
      | { configured?: Record<string, boolean> }
      | undefined;
    const configured = stats?.configured ?? {};
    const elevationConfig = brandOverviewData?.elevation?.config ?? null;
    const motionConfig = brandOverviewData?.motion?.config ?? null;
    const gridConfig = brandOverviewData?.grid?.config ?? null;
    const materialsConfig = brandOverviewData?.materials?.config ?? null;

    // Color row swatches mirror the brand's APPEARANCE selection: one swatch
    // per configured accent role, resolved at that accent's `scaleName` +
    // `baseStep`. So a brand with 4 appearances shows 4 swatches; 2 → 2.
    // This matches what the designer actually picked, not just "first three
    // scales in the palette".
    const colorPreviewSwatches = useMemo<string[]>(() => {
      const colorConfig = brandOverviewData?.color?.config;
      const presetSelection = brandOverviewData?.presetSelection;
      const accents = brandOverviewData?.appearanceConfig?.accents as
        | Array<{ scaleName: string; baseStep: number }>
        | undefined;
      if (!colorConfig || !accents?.length) return [];
      const scales = buildAvailableScales(colorConfig, presetSelection);
      return accents
        .map((accent) => {
          const scale = scales.find(
            (s) => s.name.toLowerCase() === accent.scaleName.toLowerCase(),
          );
          if (!scale) return null;
          const match = scale.colors?.find((c) => c.step === accent.baseStep);
          return match?.hex ?? null;
        })
        .filter((hex): hex is string => !!hex);
    }, [
      brandOverviewData?.color?.config,
      brandOverviewData?.presetSelection,
      brandOverviewData?.appearanceConfig?.accents,
    ]);

    const accentCount =
      (brandOverviewData?.appearanceConfig?.accents?.length as number | undefined) ??
      0;
    const isAppearanceConfigured = accentCount > 0;

    const iconSetName = (brandOverviewData?.icons?.config?.selectedSet ??
      '') as string;

    return (
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Foundation Selections</h2>
          <ViewAllButton href="/foundations" />
        </div>
        <div className={styles.selectionList}>
          <SelectionRow
            type="color"
            label="Color"
            semanticIcon="palette"
            isConfigured={!!configured.color}
          >
            <ColorPreview hexes={colorPreviewSwatches} />
          </SelectionRow>

          <SelectionRow
            type="typography"
            label="Typography"
            // No semantic typography icon in the registry; fall back to a
            // lucide glyph so the row still has something recognisable.
            fallbackIcon={Type}
            isConfigured={!!configured.typography}
          >
            <TypographyPreview
              primaryFont={primaryFont}
              primaryFontName={primaryFontName}
              loadedFonts={loadedFonts}
            />
          </SelectionRow>

          <SelectionRow
            type="appearance"
            label="Appearance"
            semanticIcon="layers"
            isConfigured={isAppearanceConfigured}
          >
            <span className={styles.previewLabel}>
              {accentCount > 0
                ? `${accentCount} ${accentCount === 1 ? 'role' : 'roles'} selected`
                : 'No roles selected'}
            </span>
          </SelectionRow>

          <SelectionRow
            type="shape"
            label="Shape"
            fallbackIcon={Square}
            // Shape language lives in componentThemeSelections; the swatches
            // read the live --Button/--Card/--InputField radius vars, so the
            // preview is always truthful. Configured = system default works,
            // so never flag shape as missing.
            isConfigured
          >
            <ShapeLanguagePreview />
          </SelectionRow>

          <SelectionRow
            type="elevation"
            label="Elevation"
            fallbackIcon={CircleDashed}
            isConfigured={!!configured.elevation}
          >
            <ElevationPreview config={elevationConfig} isDarkMode={isDarkMode} />
          </SelectionRow>

          <SelectionRow
            type="motion"
            label="Motion"
            fallbackIcon={Zap}
            isConfigured={!!configured.motion}
          >
            <MotionPreview config={motionConfig} />
          </SelectionRow>

          <SelectionRow
            type="grid"
            label="Grid"
            fallbackIcon={Grid3x3}
            isConfigured={!!configured.grid}
          >
            <GridPreview config={gridConfig} />
          </SelectionRow>

          <SelectionRow
            type="materials"
            label="Materials"
            fallbackIcon={Layers2}
            isConfigured={!!configured.materials}
          >
            <MaterialsPreview config={materialsConfig} />
          </SelectionRow>

          <SelectionRow
            type="icons"
            label="Icons"
            semanticIcon="image"
            isConfigured={!!configured.icons}
          >
            <span className={styles.previewLabel}>
              {iconSetName ? `${iconSetName} icon set` : 'No icon set selected'}
            </span>
          </SelectionRow>
        </div>
      </section>
    );
  },
);

// ---------------------------------------------------------------------------
// ViewAllButton — shared between Foundation Selections and Agents
// ---------------------------------------------------------------------------

function ViewAllButton({ href }: { href: string }) {
  const { handleNavigate } = usePlatformNavigation();
  return (
    <Button
      contained={false}
      attention="low"
      appearance="primary"
      size="s"
      onPress={() => handleNavigate(href)}
    >
      View all
    </Button>
  );
}

// ---------------------------------------------------------------------------
// SelectionRow
// ---------------------------------------------------------------------------

interface SelectionRowProps {
  type: FoundationType;
  label: string;
  /** Semantic icon name — resolved against the active brand's icon set. */
  semanticIcon?: SemanticIconName;
  /** Lucide component fallback when no semantic equivalent exists. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fallbackIcon?: any;
  isConfigured: boolean;
  children?: React.ReactNode;
}

function SelectionRow({
  type,
  label,
  semanticIcon,
  fallbackIcon: FallbackIcon,
  isConfigured,
  children,
}: SelectionRowProps) {
  const { handleNavigate } = usePlatformNavigation();
  // Plain button, not <Button> — Button wraps children in its own label span,
  // which breaks the row's flex layout (values can't reach the row end).
  return (
    <button
      type="button"
      className={styles.selectionRow}
      onClick={() => handleNavigate(`/foundations/${ROUTE_MAP[type]}`)}
    >
      <span className={styles.selectionRowIcon}>
        {semanticIcon ? (
          <Icon name={semanticIcon} size={ICON_SIZE} aria-hidden />
        ) : FallbackIcon ? (
          <FallbackIcon size={ICON_SIZE} aria-hidden="true" />
        ) : null}
      </span>
      <span className={styles.selectionLabel}>{label}</span>
      <span className={styles.selectionBadgeCol}>
        {!isConfigured && (
          <Badge attention="medium" size="s" appearance="negative">
            Not configured
          </Badge>
        )}
      </span>
      <span className={styles.selectionPreview}>{children}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Preview pieces
// ---------------------------------------------------------------------------

function ColorPreview({ hexes }: { hexes: string[] }) {
  if (!hexes.length) {
    return <span className={styles.previewLabel}>No scales yet</span>;
  }
  return (
    <>
      {hexes.map((hex, i) => (
        <span
          key={`${hex}-${i}`}
          className={styles.previewSwatch}
          style={{ backgroundColor: hex }}
        />
      ))}
    </>
  );
}

function TypographyPreview({
  primaryFont,
  primaryFontName,
  loadedFonts,
}: {
  primaryFont: PrimaryFont | null | undefined;
  primaryFontName: string | null;
  loadedFonts: Set<string>;
}) {
  // `primaryFontName` covers built-in / uploaded / bare-family sources, so
  // the row shows the selected font even when the registry lookup fails.
  if (!primaryFontName) {
    return <span className={styles.previewLabel}>No typeface selected</span>;
  }
  // Only apply font-family inline when the FontMetadata is a Google Font we
  // have loaded — otherwise let the page font render the label.
  const fontFamily =
    primaryFont && loadedFonts.has(primaryFont.id)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? buildFontFamilyString(primaryFont as any)
      : 'inherit';
  return (
    <span className={styles.previewFontSample} style={{ fontFamily }}>
      Aa · {primaryFontName}
    </span>
  );
}
