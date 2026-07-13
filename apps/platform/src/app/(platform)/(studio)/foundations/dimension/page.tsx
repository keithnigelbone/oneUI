/**
 * foundations/dimension/page.tsx
 *
 * Dimension Foundation — the modular spacing/type scale computed from the
 * brand's Platforms foundation density configs.
 *
 * The scale uses FIXED per-step ratios (from ColourTool core) — NOT a single
 * exponential scaleFactor. All values are: base × multiplier[stepIndex]. The
 * live scale + viewport controls are rendered by <FluidDimensionPreview>, which
 * interpolates between the per-density fluid endpoints derived below.
 */

'use client';

import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@oneui/convex';
import { Id } from '@oneui/convex/_generated/dataModel';
import {
  type DensityId,
  type PlatformsFoundationConfig,
} from '@oneui/shared';
import { FoundationCard, FluidDimensionPreview, type FluidEndpoints } from '@/design-tools/Foundations/shared';
import { usePlatformContext } from '@/contexts/PlatformContext';
import styles from '../foundation.module.css';
import dimensionStyles from './dimension.module.css';

// ─── Component ─────────────────────────────────────────────────────────────

export default function DimensionFoundationPage() {
  const { currentBrand } = usePlatformContext();
  const brandId = currentBrand?.id as Id<'brands'> | undefined;

  const existingFoundation = useQuery(
    api.foundations.getByType,
    brandId ? { brandId, type: 'platforms' as const } : 'skip'
  );

  const platformsConfig = existingFoundation?.config as PlatformsFoundationConfig | undefined;

  // Per-density fluid endpoints (S-edge mobile base → L-edge desktop base) read
  // from the brand's responsive platform, falling back to the ColourTool defaults.
  const fluidEndpoints = useMemo((): Record<DensityId, FluidEndpoints> => {
    const fallback: Record<DensityId, FluidEndpoints> = {
      compact: { mobileBase: 14, desktopBase: 18 },
      default: { mobileBase: 16, desktopBase: 20 },
      open: { mobileBase: 18, desktopBase: 22 },
    };
    const web = platformsConfig?.platforms?.find(
      (p) => p.isEnabled && (p.category ?? 'digital-responsive') === 'digital-responsive',
    );
    if (!web) return fallback;
    const out: Record<DensityId, FluidEndpoints> = { ...fallback };
    for (const dc of web.densityConfigs) {
      out[dc.density as DensityId] = {
        mobileBase: dc.mobile.baseSize,
        desktopBase: dc.desktop.baseSize,
      };
    }
    return out;
  }, [platformsConfig]);

  return (
    <div className={`${styles.page} ${dimensionStyles.page}`}>
      <div className={`${styles.header} ${dimensionStyles.pageHeader}`}>
        <h1 className={`${styles.title} ${dimensionStyles.pageTitle}`}>Dimension</h1>
        <p className={styles.description}>
          A modular scale where each step is derived from a base size multiplied by a
          fixed ratio — keeping typography, spacing, layout, and shape consistently
          proportional across the system.
        </p>
        <p className={styles.description}>
          Fluid scaling transitions values smoothly between the minimum and maximum
          viewport widths; static scaling uses fixed values at the S, M, and L
          breakpoints. Base sizes are edited in Density &amp; Platforms.
        </p>
      </div>

      <div className={styles.content}>
        <div className={styles.tabPanelStack}>
        <FluidDimensionPreview endpoints={fluidEndpoints} showNegative />

        <div className={dimensionStyles.sectionDivider} aria-hidden="true" />

        <FoundationCard
          title="How it works"
          description="Token resolution and formula."
          className={dimensionStyles.minimalCard}
          headerClassName={dimensionStyles.minimalCardHeader}
          contentClassName={dimensionStyles.minimalCardContent}
          collapsible
        >
          <div className={dimensionStyles.infoGrid}>
            <div className={dimensionStyles.infoCard}>
              <div className={dimensionStyles.infoTitle}>Formula</div>
              <div className={dimensionStyles.infoBody}>
                Each f-step = <code>base × multiplier[step]</code>. Multipliers are fixed
                per step (not a single exponent). Example: f0 = ×1, f3 = ×1.5, f7 = ×2.5.
              </div>
            </div>
            <div className={dimensionStyles.infoCard}>
              <div className={dimensionStyles.infoTitle}>Spacing tokens</div>
              <div className={dimensionStyles.infoBody}>
                Numeric spacing tokens (<code>--Spacing-0</code> through <code>--Spacing-40</code>)
                alias the f-scale via{'  '}
                <code>var(--Dimension-f*)</code>. They automatically reflect
                the active breakpoint (S/M/L) and density. <code>--Spacing-Margin</code> and{' '}
                <code>--Spacing-Gutter</code> alias the derived grid tokens. Negative spacing
                tokens are defined from the matching positive token for CSS properties that
                allow negative lengths, such as margins and offsets.
              </div>
            </div>
            <div className={dimensionStyles.infoCard}>
              <div className={dimensionStyles.infoTitle}>CSS resolution</div>
              <div className={dimensionStyles.infoBody}>
                Static scaling resolves via <code>@media</code> width queries in{' '}
                <code>scale.css</code> (zero-JS, correct on first paint); fluid scaling
                uses <code>clamp()</code> to interpolate between breakpoints.{' '}
                <code>data-Breakpoint</code> (S/M/L) and <code>data-6-Density</code> drive
                forced/scoped contexts; brand overrides emit through the CSS injection pipeline.
              </div>
            </div>
          </div>
        </FoundationCard>
        </div>
      </div>
    </div>
  );
}
