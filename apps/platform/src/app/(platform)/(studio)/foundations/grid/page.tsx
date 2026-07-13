/**
 * foundations/grid/page.tsx
 *
 * Grid Foundation — per-platform column count + max-width + default container variant.
 *
 * Column count is NOT density-scaled (unlike margin/gutter). Each brand can set
 * 5 breakpoint-specific column counts and choose whether the `fixed` container
 * caps at a brand-configured max-width or grows unbounded (software-tool mode).
 *
 * Saves via api.foundations.upsertByType with type: 'grid'.
 * Emitted CSS: [data-Breakpoint="..."] { --Grid-Columns: N; --Grid-MaxWidth: Npx|none; }
 */

'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@oneui/convex';
import { Id } from '@oneui/convex/_generated/dataModel';
import {
  BREAKPOINT_IDS,
  GRID_LAYOUT,
  normalizeGridConfig,
  type BreakpointId,
  type DensityId,
  type BrandGridConfig,
  type ContainerDefaultVariant,
  type GridPlatformConfig,
  type PlatformsFoundationConfig,
} from '@oneui/shared';
import { GridScalePreview, Sheet, type GridBreakpointSpec, type FluidEndpoints } from '@/design-tools/Foundations/shared';
import { GridEditSheet, GridEditTabs } from './GridEditSheet';
import { Button } from '@oneui/ui/components/Button';
import { Pencil } from 'lucide-react';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { useAutoSave } from '@/hooks';
import styles from '../foundation.module.css';
import gridStyles from './grid.module.css';
import { ExportTokensButton } from '@/components/foundation/ExportTokensButton';

type BreakpointGridConfig = Required<Pick<BrandGridConfig, 'breakpoints'>> & {
  defaultVariant: ContainerDefaultVariant;
};

function defaultBreakpointEntry(bp: BreakpointId): GridPlatformConfig {
  return { columns: GRID_LAYOUT[bp].columns, maxWidth: GRID_LAYOUT[bp].maxWidth };
}

function getDefaultConfig(): BreakpointGridConfig {
  const breakpoints: Partial<Record<BreakpointId, GridPlatformConfig>> = {};
  for (const bp of BREAKPOINT_IDS) breakpoints[bp] = defaultBreakpointEntry(bp);
  return { breakpoints, defaultVariant: 'fluid' };
}

/** Read-time migration: coerce legacy 5-platform configs to S/M/L + fill defaults. */
function safeConfig(raw: unknown): BreakpointGridConfig {
  if (!raw || typeof raw !== 'object') return getDefaultConfig();
  const incoming = raw as Partial<BrandGridConfig>;
  const coerced = normalizeGridConfig(incoming);
  const breakpoints: Partial<Record<BreakpointId, GridPlatformConfig>> = {};
  for (const bp of BREAKPOINT_IDS) {
    breakpoints[bp] = coerced[bp] ?? defaultBreakpointEntry(bp);
  }
  return {
    breakpoints,
    defaultVariant: incoming.defaultVariant ?? 'fluid',
  };
}

export default function GridFoundationPage() {
  const { currentBrand, density } = usePlatformContext();
  const brandId = currentBrand?.id as Id<'brands'> | undefined;
  const isSystemBrand = !!(currentBrand as { isSystem?: boolean })?.isSystem;

  const existingFoundation = useQuery(
    api.foundations.getByType,
    brandId ? { brandId, type: 'grid' as const } : 'skip',
  );

  // Grid margin/gutter px derive from the brand's responsive platform base sizes
  // (same source as the Dimension page), so the preview reflects real per-density
  // scaling rather than ColourTool defaults.
  const platformsFoundation = useQuery(
    api.foundations.getByType,
    brandId ? { brandId, type: 'platforms' as const } : 'skip',
  );
  const platformsConfig = platformsFoundation?.config as PlatformsFoundationConfig | undefined;

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

  const [config, setConfig] = useState<BreakpointGridConfig>(getDefaultConfig());
  const [hasInitialized, setHasInitialized] = useState(false);
  const prevBrandIdRef = useRef(brandId);
  // Remember the last explicit max-width per breakpoint so toggling Uncapped
  // off restores the user's most recent (possibly unsaved) drag instead of
  // snapping back to the saved config.
  const lastCappedWidthRef = useRef<Partial<Record<BreakpointId, number>>>({});

  const { isSaving } = useAutoSave({
    config,
    brandId,
    type: 'grid',
    enabled: hasInitialized && !isSystemBrand,
  });

  useEffect(() => {
    if (prevBrandIdRef.current !== brandId) {
      prevBrandIdRef.current = brandId;
      setHasInitialized(false);
      return;
    }
    if (existingFoundation?.config && !hasInitialized) {
      setConfig(safeConfig(existingFoundation.config));
      setHasInitialized(true);
    } else if (existingFoundation === null && !hasInitialized) {
      setHasInitialized(true);
    }
  }, [existingFoundation, hasInitialized, brandId]);

  const updateBreakpoint = useCallback((bp: BreakpointId, patch: Partial<GridPlatformConfig>) => {
    setConfig((prev) => {
      const existing = prev.breakpoints[bp] ?? defaultBreakpointEntry(bp);
      return {
        ...prev,
        breakpoints: {
          ...prev.breakpoints,
          [bp]: { ...existing, ...patch },
        },
      };
    });
  }, []);

  const isReadOnly = isSystemBrand;

  // ── Brand-config editing via the side sheet (draft → Save) ──────────────
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState<
    { breakpoints: Record<BreakpointId, GridBreakpointSpec>; defaultVariant: ContainerDefaultVariant } | null
  >(null);

  const resolvedBreakpoints = useMemo(
    () =>
      BREAKPOINT_IDS.reduce((acc, bp) => {
        acc[bp] = config.breakpoints[bp] ?? defaultBreakpointEntry(bp);
        return acc;
      }, {} as Record<BreakpointId, GridBreakpointSpec>),
    [config.breakpoints],
  );

  // While the sheet is open, the read-only viewer previews the draft live.
  const displayBreakpoints = draft?.breakpoints ?? resolvedBreakpoints;

  const openEdit = useCallback(() => {
    setDraft({
      breakpoints: BREAKPOINT_IDS.reduce((acc, bp) => {
        acc[bp] = config.breakpoints[bp] ?? defaultBreakpointEntry(bp);
        return acc;
      }, {} as Record<BreakpointId, GridBreakpointSpec>),
      defaultVariant: config.defaultVariant ?? 'fluid',
    });
    setSheetOpen(true);
  }, [config.breakpoints, config.defaultVariant]);

  const discardEdit = useCallback(() => {
    setSheetOpen(false);
    setDraft(null);
  }, []);

  const saveEdit = useCallback(() => {
    if (draft) {
      setConfig((prev) => ({ ...prev, breakpoints: draft.breakpoints, defaultVariant: draft.defaultVariant }));
    }
    setDraft(null);
    setSheetOpen(false);
  }, [draft]);

  const updateDraftBp = useCallback((bp: BreakpointId, patch: Partial<GridBreakpointSpec>) => {
    setDraft((d) =>
      d ? { ...d, breakpoints: { ...d.breakpoints, [bp]: { ...d.breakpoints[bp], ...patch } } } : d,
    );
  }, []);

  return (
    <div className={`${styles.page} ${sheetOpen ? gridStyles.pageWithSheet : ''}`}>
      <div className={gridStyles.pageHeaderRow}>
        <div className={styles.header}>
          <h1 className={styles.title}>Grid</h1>
          <p className={styles.description}>
            Column count and max-width per breakpoint. Column count is a layout contract —
            it does not shift with density. Use Fluid for software/dashboards, Fixed for
            marketing/reading.
          </p>
        </div>
        {!isReadOnly && (
          <Button
            attention="high"
            size="small"
            start={<Pencil size={14} />}
            onPress={openEdit}
            /* Block editing until the real config has loaded — opening on
               default state and saving would overwrite the brand's saved
               grid (useAutoSave's baseline is captured at hasInitialized). */
            disabled={brandId != null && !hasInitialized}
          >
            Edit
          </Button>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.tabPanelStack}>
        <GridScalePreview breakpoints={displayBreakpoints} endpoints={fluidEndpoints} />
        </div>
      </div>

      <Sheet
        open={sheetOpen}
        title="Grid"
        onClose={discardEdit}
        onDiscard={discardEdit}
        onSave={saveEdit}
        tabs={
          draft && (
            <GridEditTabs
              variant={draft.defaultVariant}
              onVariantChange={(v) => setDraft((d) => (d ? { ...d, defaultVariant: v } : d))}
            />
          )
        }
      >
        {draft && (
          <GridEditSheet
            draft={draft}
            onColumnsChange={(bp, columns) => updateDraftBp(bp, { columns })}
            onMaxWidthChange={(bp, maxWidth) => {
              if (maxWidth != null) lastCappedWidthRef.current[bp] = maxWidth;
              updateDraftBp(bp, { maxWidth });
            }}
            onUncappedChange={(bp, uncapped) => {
              if (uncapped) {
                // Capture the live width before clearing so re-capping can restore it.
                const current = draft?.breakpoints[bp]?.maxWidth;
                if (current != null) lastCappedWidthRef.current[bp] = current;
                updateDraftBp(bp, { maxWidth: null });
              } else {
                const restored =
                  draft?.breakpoints[bp]?.maxWidth ??
                  lastCappedWidthRef.current[bp] ??
                  config.breakpoints[bp]?.maxWidth ??
                  GRID_LAYOUT[bp].maxWidth ??
                  1280;
                updateDraftBp(bp, { maxWidth: restored });
              }
            }}
          />
        )}
      </Sheet>

      <div className={styles.foundationFooterActions}>
        <ExportTokensButton foundation="grid" />
      </div>

      {isSaving && (
        <div className={gridStyles.savingIndicator}>Saving…</div>
      )}

    </div>
  );
}

