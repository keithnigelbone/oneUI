/**
 * foundations/typography/page.tsx
 *
 * Typography Foundation V2 — Relational type system editor.
 * Orchestrator: queries, mutations, state, handlers, and layout shell.
 * Heavy JSX lives in helpers.tsx / overlays.tsx / tabs.tsx.
 *
 * Structure: Fonts | Type Scale | Line Height | Letter Spacing | Weights | Rendering | Optical Size | Preview
 */

'use client';

import React, { useState, useCallback, useEffect, useInsertionEffect, useMemo, useRef, startTransition } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import { Id } from '@oneui/convex/_generated/dataModel';
import {
  // V2 relational typography system
  type TypographyConfigV2,
  type TypographyRole,
  type RoleFontSlot,
  type RoleFontSlotRole,
  type FStep,
  type DensityId,
  type AvailableBreakpoint,
  type PlatformsFoundationConfig,
  resolveTextFontId,
  resolveHeadingFontId,
  textSlotWrite,
  headingSlotWrite,
  DENSITY_IDS,
  getAllAvailableBreakpoints,
  formatBreakpointLabel,
  migrateLegacyPlatformsConfig,
  resolveTypographyScriptSupport,
} from '@oneui/shared';
import { useFoundationData } from '@/components/FoundationStyleProvider';
import {
  DEFAULT_FONT_SELECTION,
  FONT_COLLECTION,
  type FontCategory,
  type FontMetadata,
  getFontById,
  buildFontFamilyString,
  convertCustomFontToMetadata,
  getConvexIdFromFontId,
  type CustomFontData,
  type TypographyFoundationConfig,
  DEFAULT_TYPOGRAPHY_CONFIG,
} from '@/design-tools/Foundations/Typography';
import { useGoogleFonts } from '@oneui/ui/hooks/useGoogleFonts';
import { Select } from '@oneui/ui/components/Select';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { ToggleGroup } from '@oneui/ui/components/ToggleGroup';
import { Tabs } from '@oneui/ui/components/Tabs';
import { ChipGroup } from '@oneui/ui/components/ChipGroup';
import { Chip } from '@oneui/ui/components/Chip';
import { useAutoSave } from '@/hooks';
import styles from '../foundation.module.css';
import { ExportTokensButton } from '@/components/foundation/ExportTokensButton';
import typographyStyles from './typography.module.css';

import {
  fontRowHoverStyles,
  type MainTab,
  MAIN_TAB_LABELS,
  DENSITY_LABELS,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  fStepConfigKey,
} from './helpers';
import {
  setTypographyScriptPreset,
  applyTypographyScriptPatch,
  addTypographyScriptRow,
  removeTypographyScriptRow,
} from './scriptSupport';
import {
  FontSelectionToast,
  FontUploadModal,
  DeleteFontDialog,
} from './overlays';
import {
  FontsTab,
  ScriptsTab,
  TypeScaleTab,
  LineHeightTab,
  LetterSpacingTab,
  WeightsTab,
  OpticalSizingTab,
  RenderingTab,
  PreviewTab,
} from './tabs';

// ============================================================================
// Page Component
// ============================================================================

// Inject the static font-row hover stylesheet exactly once — `<style>{...}</style>`
// inside JSX would re-create the DOM node on every orchestrator render.
function useFontRowHoverStyles() {
  useInsertionEffect(() => {
    const el = document.createElement('style');
    el.setAttribute('data-typography-foundation', 'font-row-hover');
    el.textContent = fontRowHoverStyles;
    document.head.appendChild(el);
    return () => { el.remove(); };
  }, []);
}

export default function TypographyFoundationPage() {
  useFontRowHoverStyles();
  const { currentBrand } = usePlatformContext();
  const brandId = currentBrand?.id as Id<'brands'> | undefined;

  // ── Convex queries & mutations ──
  const existingFoundation = useQuery(
    api.foundations.getByType,
    brandId ? { brandId, type: 'typography' as const } : 'skip'
  );
  const customFonts = useQuery(api.customFonts.list) || [];
  const generateUploadUrl = useMutation(api.customFonts.generateUploadUrl);
  const saveFont = useMutation(api.customFonts.saveFont);
  const deleteCustomFont = useMutation(api.customFonts.remove);
  const removeFontWeight = useMutation(api.customFonts.removeWeight);

  // ── Config state ──
  const [config, setConfig] = useState<TypographyFoundationConfig>(DEFAULT_TYPOGRAPHY_CONFIG);
  const [v2Config, setV2Config] = useState<TypographyConfigV2>({});
  const [hasInitialized, setHasInitialized] = useState(false);

  // Combined config for auto-save (V2 nested inside V1 for backward compat)
  const combinedConfig = useMemo(() => ({
    ...config,
    typographyV2: v2Config,
  }), [config, v2Config]);

  const { isSaving } = useAutoSave({
    config: combinedConfig,
    brandId,
    type: 'typography',
    enabled: hasInitialized,
  });

  // ── Live platforms foundation (drives the selector + pixel readouts) ──
  const foundationData = useFoundationData();
  const platformsConfig = useMemo<PlatformsFoundationConfig | undefined>(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = (foundationData as any)?.platforms?.config as PlatformsFoundationConfig | undefined;
    if (!raw) return undefined;
    return migrateLegacyPlatformsConfig(raw);
  }, [foundationData]);

  const availableBreakpoints = useMemo<AvailableBreakpoint[]>(
    () => getAllAvailableBreakpoints(platformsConfig),
    [platformsConfig],
  );

  // ── UI state ──
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('fonts');
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>('web');
  const [selectedBreakpointId, setSelectedBreakpointId] = useState<string>('S');
  const [selectedDensity, setSelectedDensity] = useState<DensityId>('default');

  // Snap to first available when platform list changes
  useEffect(() => {
    if (availableBreakpoints.length === 0) return;
    const exists = availableBreakpoints.some(
      (bp) => bp.platformId === selectedPlatformId && bp.breakpointId === selectedBreakpointId,
    );
    if (!exists) {
      const first = availableBreakpoints[0];
      setSelectedPlatformId(first.platformId);
      setSelectedBreakpointId(first.breakpointId);
    }
  }, [availableBreakpoints, selectedPlatformId, selectedBreakpointId]);

  const hasMultiplePlatformKinds = useMemo(() => {
    const platformIds = new Set(availableBreakpoints.map((bp) => bp.platformId));
    return platformIds.size > 1;
  }, [availableBreakpoints]);

  const [fontCategoryFilter, setFontCategoryFilter] = useState<FontCategory | 'all' | 'uploaded'>('all');
  const [pendingFont, setPendingFont] = useState<FontMetadata | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [fontToDelete, setFontToDelete] = useState<FontMetadata | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Font collection (built-in + uploaded) ──
  const allFonts = useMemo(() => {
    const uploadedFonts = customFonts.map((cf) =>
      convertCustomFontToMetadata(cf as unknown as CustomFontData)
    );
    return [...FONT_COLLECTION, ...uploadedFonts];
  }, [customFonts]);

  // ── Google Fonts loading ──
  const { loadedFonts, loadingFonts, loadFont } = useGoogleFonts(['inter']);

  // Auto-load brand's selected fonts
  useEffect(() => {
    if (!hasInitialized) return;
    const scriptFontIds = resolveTypographyScriptSupport(v2Config.scriptSupport)
      .filter((script) => script.enabled)
      .flatMap((script) => [script.uiFontId, script.readingFontId]);
    const fontIds = [
      resolveTextFontId(config.fontSelection),
      resolveHeadingFontId(config.fontSelection),
      ...(config.fontSelection?.fallbackFontIds || []),
      v2Config.fontSelection?.codeFontId,
      ...scriptFontIds,
    ].filter((id): id is string => Boolean(id));
    for (const fontId of fontIds) {
      if (!loadedFonts.has(fontId) && !loadingFonts.has(fontId)) {
        const font = allFonts.find(f => f.id === fontId) || getFontById(fontId);
        if (font) loadFont(font);
      }
    }
  }, [config.fontSelection, v2Config.fontSelection, v2Config.scriptSupport, hasInitialized, loadedFonts, loadingFonts, loadFont, allFonts]);

  // ── Initialize from Convex / reset on brand change ──
  const prevBrandIdRef = useRef<string | undefined>(brandId);

  useEffect(() => {
    if (prevBrandIdRef.current !== brandId) {
      prevBrandIdRef.current = brandId;
      startTransition(() => {
        setHasInitialized(false);
      });
      return;
    }

    if (existingFoundation?.config && !hasInitialized) {
      const loadedConfig = existingFoundation.config as TypographyFoundationConfig & { typographyV2?: TypographyConfigV2 };
      const configWithDefaults: TypographyFoundationConfig = {
        ...loadedConfig,
        fontSelection: loadedConfig.fontSelection || DEFAULT_FONT_SELECTION,
      };
      startTransition(() => {
        setConfig(configWithDefaults);
        setV2Config(loadedConfig.typographyV2 || {});
        setHasInitialized(true);
      });
    } else if (existingFoundation === null && !hasInitialized) {
      startTransition(() => {
        setHasInitialized(true);
      });
    }
  }, [existingFoundation, hasInitialized, brandId]);

  // ── Derived state ──
  const isLoading = brandId != null && existingFoundation === undefined;

  const filteredFonts = useMemo(() => {
    if (fontCategoryFilter === 'all') return allFonts;
    if (fontCategoryFilter === 'uploaded') return allFonts.filter(f => f.source === 'uploaded');
    return allFonts.filter(f => f.category === fontCategoryFilter);
  }, [fontCategoryFilter, allFonts]);

  const getFontFromAllSources = useCallback((fontId: string): FontMetadata | undefined => {
    return allFonts.find(f => f.id === fontId);
  }, [allFonts]);

  const selectedFont = useMemo(() => {
    const fontId = resolveTextFontId(config.fontSelection);
    if (!fontId) return null;
    return getFontFromAllSources(fontId) || null;
  }, [config.fontSelection, getFontFromAllSources]);

  // ── Font handlers ──
  const handleAddFont = useCallback((asPrimary: boolean) => {
    if (!pendingFont) return;
    setConfig(prev => ({
      ...prev,
      ...(asPrimary ? { fontFamily: buildFontFamilyString(pendingFont) } : {}),
      fontSelection: {
        ...(prev.fontSelection || DEFAULT_FONT_SELECTION),
        ...(asPrimary
          ? textSlotWrite(pendingFont.id)
          : { ...headingSlotWrite(pendingFont.id), scope: 'dual' as const }),
      },
    }));
    setPendingFont(null);
  }, [pendingFont]);

  const handleAddFontAsFallback = useCallback(() => {
    if (!pendingFont) return;
    setConfig(prev => {
      const currentFallbacks = prev.fontSelection?.fallbackFontIds || [];
      if (currentFallbacks.includes(pendingFont.id)) {
        setPendingFont(null);
        return prev;
      }
      return {
        ...prev,
        fontSelection: {
          ...(prev.fontSelection || DEFAULT_FONT_SELECTION),
          fallbackFontIds: [...currentFallbacks, pendingFont.id],
        },
      };
    });
    setPendingFont(null);
  }, [pendingFont]);

  const handleAddFontAsCode = useCallback(() => {
    if (!pendingFont) return;
    setV2Config(prev => ({
      ...prev,
      fontSelection: {
        ...prev.fontSelection,
        codeFontId: pendingFont.id,
      },
    }));
    setPendingFont(null);
  }, [pendingFont]);

  // Stable wrappers so the React.memo'd overlays in overlays.tsx actually bail
  // on parent re-renders. Inline `() => handleAddFont(true)` would defeat memo.
  const handleAddFontAsText = useCallback(() => handleAddFont(true), [handleAddFont]);
  const handleAddFontAsHeading = useCallback(() => handleAddFont(false), [handleAddFont]);
  const handleCloseUploadModal = useCallback(() => setShowUploadModal(false), []);
  const handleCancelDeleteFont = useCallback(() => setFontToDelete(null), []);

  const handleCancelFontSelection = useCallback(() => {
    setPendingFont(null);
  }, []);

  // Font upload handler
  const handleFontUpload = useCallback(
    async (args: {
      file: File;
      name: string;
      familyName: string;
      format: 'ttf' | 'otf' | 'woff' | 'woff2';
      category: FontCategory;
      weights: number[];
      isVariable: boolean;
      variableAxes?: Array<{
        tag: string;
        minValue: number;
        maxValue: number;
        defaultValue: number;
      }>;
      fallback: string;
    }) => {
      const uploadUrl = await generateUploadUrl();
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': args.file.type || 'application/octet-stream' },
        body: args.file,
      });
      if (!response.ok) throw new Error('Failed to upload font file');
      const { storageId } = await response.json();
      const result = await saveFont({
        name: args.name,
        familyName: args.familyName,
        fileId: storageId,
        fileName: args.file.name,
        fileFormat: args.format,
        fileSize: args.file.size,
        category: args.category,
        weights: args.weights,
        isVariable: args.isVariable,
        variableAxes: args.variableAxes,
        fallback: args.fallback,
      });
      return { fontId: result.id, updated: result.updated };
    },
    [generateUploadUrl, saveFont]
  );

  // Delete font handler
  const handleDeleteFont = useCallback(async () => {
    if (!fontToDelete) return;
    const convexId = getConvexIdFromFontId(fontToDelete.id);
    if (!convexId) {
      setFontToDelete(null);
      return;
    }
    setIsDeleting(true);
    try {
      await deleteCustomFont({ id: convexId as Id<'customFonts'> });
      const sel = config.fontSelection;
      if (resolveTextFontId(sel) === fontToDelete.id) {
        setConfig(prev => ({
          ...prev,
          fontSelection: { ...prev.fontSelection!, ...textSlotWrite('') },
        }));
      }
      if (resolveHeadingFontId(sel) === fontToDelete.id) {
        setConfig(prev => ({
          ...prev,
          fontSelection: { ...prev.fontSelection!, headingFontId: null, displayFontId: null, secondaryFontId: null },
        }));
      }
      if (v2Config.fontSelection?.codeFontId === fontToDelete.id) {
        setV2Config(prev => ({
          ...prev,
          fontSelection: { ...prev.fontSelection, codeFontId: null },
        }));
      }
    } catch (error) {
      console.error('Failed to delete font:', error);
    } finally {
      setIsDeleting(false);
      setFontToDelete(null);
    }
  }, [fontToDelete, deleteCustomFont, config.fontSelection, v2Config.fontSelection]);

  // Remove a single weight file from an uploaded multi-weight family.
  const handleRemoveFontWeight = useCallback(async (font: FontMetadata, weight: number) => {
    const convexId = getConvexIdFromFontId(font.id);
    if (!convexId) return;
    try {
      await removeFontWeight({ id: convexId as Id<'customFonts'>, weight });
    } catch (error) {
      console.error('Failed to remove font weight:', error);
    }
  }, [removeFontWeight]);

  // ── V2 type scale handlers ──
  const handleFStepChange = useCallback((role: TypographyRole, size: string, fStep: FStep) => {
    setV2Config(prev => {
      const key = fStepConfigKey(role);
      return {
        ...prev,
        [key]: {
          ...(prev[key] as Partial<Record<string, FStep>> | undefined),
          [size]: fStep,
        },
      };
    });
  }, []);

  const handleRoleFontSlotChange = useCallback((role: RoleFontSlotRole, slot: RoleFontSlot) => {
    setV2Config(prev => ({
      ...prev,
      roleFontSlots: {
        ...prev.roleFontSlots,
        [role]: slot,
      },
    }));
  }, []);

  const handleLineHeightOffsetChange = useCallback((role: TypographyRole, offset: number) => {
    setV2Config(prev => ({
      ...prev,
      lineHeightOffsets: {
        ...prev.lineHeightOffsets,
        [role]: offset,
      },
    }));
  }, []);

  const handleWeightOverride = useCallback((key: string, weight: number) => {
    setV2Config(prev => ({
      ...prev,
      weightOverrides: {
        ...prev.weightOverrides,
        [key]: weight,
      },
    }));
  }, []);

  // Available weights for a role = the weights shipped by the font assigned to
  // that role's slot (Text vs Heading). Lets the Type Scale offer a weight
  // picker limited to weights the font can actually render.
  const getRoleWeights = useCallback((role: RoleFontSlotRole): number[] => {
    const slot = v2Config.roleFontSlots?.[role] ?? 'primary';
    const fontId = slot === 'secondary'
      ? resolveHeadingFontId(config.fontSelection)
      : resolveTextFontId(config.fontSelection);
    const font = fontId ? getFontFromAllSources(fontId) : undefined;
    return font?.weights ?? [];
  }, [v2Config.roleFontSlots, config.fontSelection, getFontFromAllSources]);

  const handleFontFeatureToggle = useCallback(
    (slot: 'primary' | 'secondary' | 'code', feature: 'ligatures' | 'contextualAlternates', value: boolean) => {
      setV2Config(prev => ({
        ...prev,
        fontFeatures: {
          ...prev.fontFeatures,
          [slot]: {
            ...prev.fontFeatures?.[slot],
            [feature]: value,
          },
        },
      }));
    },
    [],
  );

  const handleLetterSpacingChange = useCallback((role: TypographyRole, value: number) => {
    setV2Config(prev => ({
      ...prev,
      letterSpacing: {
        ...prev.letterSpacing,
        [role]: value,
      },
    }));
  }, []);

  const handleLetterSpacingReset = useCallback((role: TypographyRole) => {
    setV2Config(prev => {
      if (!prev.letterSpacing) return prev;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [role]: _dropped, ...rest } = prev.letterSpacing;
      return { ...prev, letterSpacing: rest };
    });
  }, []);

  const handleOpticalSizingChange = useCallback(
    (role: TypographyRole, mode: 'auto' | 'disabled' | 'manual', opszValue?: number) => {
      setV2Config(prev => ({
        ...prev,
        opticalSizing: {
          ...prev.opticalSizing,
          [role]: { mode, ...(opszValue !== undefined ? { opszValue } : {}) },
        },
      }));
    },
    [],
  );

  const handleRenderingChange = useCallback(
    (key: 'textRendering' | 'webkitFontSmoothing' | 'fontSynthesis', value: string) => {
      setV2Config(prev => ({
        ...prev,
        rendering: {
          ...prev.rendering,
          [key]: value,
        },
      }));
    },
    [],
  );

  const handleScriptPresetChange = useCallback((preset: 'india-core-v1' | 'custom') => {
    setV2Config(prev => setTypographyScriptPreset(prev, preset));
  }, []);

  const handleScriptChange = useCallback<React.ComponentProps<typeof ScriptsTab>['onScriptChange']>((scriptId, patch) => {
    setV2Config(prev => applyTypographyScriptPatch(prev, scriptId, patch));
  }, []);

  const handleScriptAdd = useCallback((scriptId: string) => {
    setV2Config(prev => addTypographyScriptRow(prev, scriptId));
  }, []);

  const handleScriptRemove = useCallback((scriptId: string) => {
    setV2Config(prev => removeTypographyScriptRow(prev, scriptId));
  }, []);

  // Stable options + onChange for the platform-breakpoint <Select> so it doesn't
  // rebuild a new array on every render of the orchestrator.
  const breakpointSelectOptions = useMemo(
    () =>
      [...availableBreakpoints]
        .sort((a, b) => {
          const ca = CATEGORY_ORDER.indexOf(a.category);
          const cb = CATEGORY_ORDER.indexOf(b.category);
          if (ca !== cb) return ca - cb;
          if (a.platformLabel !== b.platformLabel) return a.platformLabel.localeCompare(b.platformLabel);
          // Order breakpoints by ascending width (Mobile 360 → Desktop Large 1920),
          // not alphabetically, so the dropdown reads as a size progression.
          return a.widthPx - b.widthPx;
        })
        .map((bp) => ({
          value: `${bp.platformId}::${bp.breakpointId}`,
          label: `${CATEGORY_LABELS[bp.category]} · ${bp.platformLabel} · ${formatBreakpointLabel(bp)}`,
        })),
    [availableBreakpoints],
  );

  const handleBreakpointSelectChange = useCallback((next: string | number) => {
    const [pid, bpid] = String(next).split('::');
    if (pid && bpid) {
      setSelectedPlatformId(pid);
      setSelectedBreakpointId(bpid);
    }
  }, []);

  const platformDensityControls = (
    <div className={typographyStyles.metricControls}>
      <div className={typographyStyles.metricControlGroup}>
        <span className={typographyStyles.metricControlLabel}>Platform</span>
        {hasMultiplePlatformKinds ? (
          <Select
            value={`${selectedPlatformId}::${selectedBreakpointId}`}
            onChange={handleBreakpointSelectChange}
            options={breakpointSelectOptions}
            size="sm"
            aria-label="Platform breakpoint"
          />
        ) : (
          <ToggleGroup
            value={[selectedBreakpointId]}
            onValueChange={(values) => {
              const next = values[0];
              if (!next) return;
              const match = availableBreakpoints.find((bp) => bp.breakpointId === next);
              if (match) {
                setSelectedPlatformId(match.platformId);
                setSelectedBreakpointId(match.breakpointId);
              }
            }}
            variant="subtool"
            size="small"
          >
            {availableBreakpoints.map((bp) => (
              <ToggleGroup.Item key={bp.breakpointId} value={bp.breakpointId}>
                {bp.breakpointLabel}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup>
        )}
      </div>

      <div className={typographyStyles.metricControlGroup}>
        <span className={typographyStyles.metricControlLabel}>Density</span>
        <ChipGroup
          value={[selectedDensity]}
          onValueChange={(values) => {
            const next = values[0] as DensityId | undefined;
            if (next) setSelectedDensity(next);
          }}
          required
          size="s"
        >
          {DENSITY_IDS.map((id) => (
            <Chip key={id} value={id}>{DENSITY_LABELS[id]}</Chip>
          ))}
        </ChipGroup>
      </div>
    </div>
  );

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className={`${styles.page} ${activeMainTab === 'scripts' ? typographyStyles.scriptPageWide : ''}`}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.title}>Typography Foundation</h1>
        <p className={styles.description}>
          Configure typefaces, type scales, line heights, and font weights.
          {currentBrand && (
            <span className={styles.brandIndicator}>
              {' '}Configuring for <strong>{currentBrand.name}</strong>
            </span>
          )}
        </p>
      </div>

      <div className={styles.content}>
        {/* Main Navigation Tabs */}
        {/* Negative margin aligns the first tab flush-left while preserving state-layer padding,
            which keeps the indicator offset calculation correct. */}
        <div className={typographyStyles.mainTabsRow}>
          <Tabs.Root
            value={activeMainTab}
            onValueChange={(v) => setActiveMainTab((v as MainTab) ?? 'fonts')}
          >
            <Tabs.List className={typographyStyles.mainTabsList}>
              {(Object.keys(MAIN_TAB_LABELS) as MainTab[]).map(tab => (
                <Tabs.Item key={tab} value={tab}>{MAIN_TAB_LABELS[tab]}</Tabs.Item>
              ))}
              <Tabs.Indicator />
            </Tabs.List>
          </Tabs.Root>
        </div>

        <div className={typographyStyles.tabPanelStack}>
        {activeMainTab === 'fonts' && (
          <FontsTab
            config={config}
            v2Config={v2Config}
            allFonts={allFonts}
            filteredFonts={filteredFonts}
            fontCategoryFilter={fontCategoryFilter}
            loadedFonts={loadedFonts}
            loadingFonts={loadingFonts}
            pendingFont={pendingFont}
            getFontFromAllSources={getFontFromAllSources}
            loadFont={loadFont}
            setConfig={setConfig}
            setV2Config={setV2Config}
            setFontCategoryFilter={setFontCategoryFilter}
            setPendingFont={setPendingFont}
            setFontToDelete={setFontToDelete}
            setShowUploadModal={setShowUploadModal}
            onFontFeatureToggle={handleFontFeatureToggle}
            onRemoveWeight={handleRemoveFontWeight}
            isLoading={isLoading}
          />
        )}

        {activeMainTab === 'scripts' && (
          <ScriptsTab
            v2Config={v2Config}
            allFonts={allFonts}
            loadedFonts={loadedFonts}
            getFontFromAllSources={getFontFromAllSources}
            selectedPlatformId={selectedPlatformId}
            selectedBreakpointId={selectedBreakpointId}
            selectedDensity={selectedDensity}
            platformsConfig={platformsConfig}
            onPresetChange={handleScriptPresetChange}
            onScriptChange={handleScriptChange}
            onScriptAdd={handleScriptAdd}
            onScriptRemove={handleScriptRemove}
          />
        )}

        {activeMainTab === 'typeScale' && (
          <TypeScaleTab
            v2Config={v2Config}
            selectedPlatformId={selectedPlatformId}
            selectedBreakpointId={selectedBreakpointId}
            selectedDensity={selectedDensity}
            availableBreakpoints={availableBreakpoints}
            platformsConfig={platformsConfig}
            actions={platformDensityControls}
            onFStepChange={handleFStepChange}
            onRoleFontSlotChange={handleRoleFontSlotChange}
            onWeightOverride={handleWeightOverride}
            getRoleWeights={getRoleWeights}
          />
        )}

        {activeMainTab === 'lineHeight' && (
          <LineHeightTab
            v2Config={v2Config}
            selectedPlatformId={selectedPlatformId}
            selectedBreakpointId={selectedBreakpointId}
            selectedDensity={selectedDensity}
            platformsConfig={platformsConfig}
            actions={platformDensityControls}
            onLineHeightOffsetChange={handleLineHeightOffsetChange}
          />
        )}

        {activeMainTab === 'letterSpacing' && (
          <LetterSpacingTab
            v2Config={v2Config}
            selectedPlatformId={selectedPlatformId}
            selectedBreakpointId={selectedBreakpointId}
            selectedDensity={selectedDensity}
            platformsConfig={platformsConfig}
            onLetterSpacingChange={handleLetterSpacingChange}
            onLetterSpacingReset={handleLetterSpacingReset}
          />
        )}

        {activeMainTab === 'weights' && (
          <WeightsTab
            v2Config={v2Config}
            onWeightOverride={handleWeightOverride}
          />
        )}

        {activeMainTab === 'opticalSizing' && (
          <OpticalSizingTab
            v2Config={v2Config}
            onOpticalSizingChange={handleOpticalSizingChange}
          />
        )}

        {activeMainTab === 'rendering' && (
          <RenderingTab
            v2Config={v2Config}
            onRenderingChange={handleRenderingChange}
          />
        )}

        {activeMainTab === 'preview' && (
          <PreviewTab
            v2Config={v2Config}
            selectedPlatformId={selectedPlatformId}
            selectedBreakpointId={selectedBreakpointId}
            selectedDensity={selectedDensity}
            availableBreakpoints={availableBreakpoints}
            platformsConfig={platformsConfig}
            actions={platformDensityControls}
          />
        )}
        </div>
      </div>

      <div className={styles.foundationFooterActions}>
        <ExportTokensButton foundation="typography" />
      </div>

      {/* Overlays */}
      <FontSelectionToast
        pendingFont={pendingFont}
        loadedFonts={loadedFonts}
        selectedFontId={resolveTextFontId(config.fontSelection)}
        onAddAsText={handleAddFontAsText}
        onAddAsHeading={handleAddFontAsHeading}
        onAddAsScript={handleAddFontAsFallback}
        onAddAsCode={handleAddFontAsCode}
        onCancel={handleCancelFontSelection}
      />

      {showUploadModal && (
        <FontUploadModal
          onClose={handleCloseUploadModal}
          onUpload={handleFontUpload}
        />
      )}

      {fontToDelete && (
        <DeleteFontDialog
          font={fontToDelete}
          isDeleting={isDeleting}
          onConfirm={handleDeleteFont}
          onCancel={handleCancelDeleteFont}
        />
      )}

      {/* Auto-save indicator */}
      {isSaving && (
        <div
          style={{
            position: 'fixed',
            bottom: 'var(--Spacing-4-5)',
            right: 'var(--Spacing-4-5)',
            padding: 'var(--Spacing-3-5) var(--Spacing-4)',
            backgroundColor: 'var(--Primary-Bold)',
            color: 'var(--Primary-Bold-High)',
            borderRadius: 'var(--Shape-4)',
            fontSize: 'var(--Label-XS-FontSize)',
            lineHeight: 'var(--Label-XS-LineHeight)',
            fontFamily: 'var(--Typography-Font-Primary)',
            fontWeight: 'var(--Label-FontWeight-Medium)',
            opacity: 0.9,
          }}
        >
          Saving...
        </div>
      )}
    </div>
  );
}
