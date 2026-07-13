/**
 * foundations/color/page.tsx
 *
 * Color Foundation - Manage color scales for your brand
 * Three-tab flow:
 * - Brand Scales: Current active scales for the brand (mix of preset + custom)
 * - Preset Scales: Select from uploaded collections to add to brand
 * - Custom Scales: Create custom scales to add to brand
 */

'use client';

import { useState, useCallback, useEffect, useMemo, startTransition, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import { Id } from '@oneui/convex/_generated/dataModel';
import {
  generateColorScale,
  generateColorScaleWithLightnessScale,
  createDefaultLightnessScale,
  applyLightnessOffsets,
  type GeneratedColorScale,
  type LightnessScaleConfig,
  type LockedBaseOklch,
  HUE_PRESETS,
  CHROMA_PRESETS,
  oklchToHex,
  hexToOklch,
  BUILT_IN_NEUTRAL_SCALE_NAME,
  BUILT_IN_NEUTRAL_BASE_COLOR,
  getContrastRatioHex,
} from '@oneui/shared';
import { getReadableTextColor, extractResolvedTokens, sliceExportByFoundation } from '@oneui/shared/engine';
import {
  FoundationCard,
  SliderControl,
} from '@/design-tools/Foundations/shared';
import {
  LightnessScaleEditor,
  PresetColorScaleUploader,
  ColorScaleRow,
} from '@/design-tools/Foundations/Color';
import { Button } from '@oneui/ui/components/Button';
import { Badge } from '@oneui/ui/components/Badge';
import { IconButton } from '@oneui/ui/components/IconButton';
import { Icon } from '@oneui/ui/icons/Icon';
import { Input, InputField } from '@oneui/ui/components/Input';
import { Select } from '@oneui/ui/components/Select';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { useAutoSave } from '@/hooks';
import { useFoundationData } from '@/components/FoundationStyleProvider';
import { downloadJSON } from '@/utils/downloadJSON';
import { PageSkeleton } from '@/components/PageSkeleton';
import { Tabs } from '@oneui/ui/components/Tabs';
import { ToggleGroup } from '@oneui/ui/components/ToggleGroup';
import { Surface } from '@oneui/ui/components/Surface';
import { Switch } from '@oneui/ui/components/Switch';
import styles from '../foundation.module.css';
import colorStyles from './color.module.css';

/**
 * Brand scale entry - can be from preset or custom
 */
interface BrandScaleEntry {
  id: string;
  name: string;
  source: 'preset' | 'custom';
  // For preset scales
  presetCollectionId?: string;
  // For custom scales
  baseColor?: string;
  lightnessOffsets?: LightnessOffsets;
  scaleHue?: number;
  scaleChroma?: number;
  chromaRetention?: number;
  /**
   * When true, the scale's base step is pinned to `lockedBaseOklch`. See the
   * "lock base color" feature — locked scales guarantee the user's brand hex
   * never drifts when the Chroma/Hue sliders move.
   */
  lockBase?: boolean;
  lockedBaseOklch?: LockedBaseOklch;
  // Generated scale data
  steps: Array<{ step: string | number; hex: string; isBase?: boolean }>;
  baseStep: string;
}

/**
 * Lightness offsets for fine-tuning the scale
 */
interface LightnessOffsets {
  dark: number;  // -10 to +10, affects steps below the base
  light: number; // -10 to +10, affects steps above the base
}

/**
 * Custom scale being edited
 */
interface CustomScale {
  id: string;
  name: string;
  baseColor: string;
  lightnessOffsets: LightnessOffsets;
  chromaRetention: number; // 0-1, how much chroma to retain at extremes
  scaleHue?: number;
  scaleChroma?: number;
  /**
   * When true, the base step's {l, c, h, hex} is frozen to `lockedBaseOklch`.
   * Defaults to `true` for freshly created custom scales (per the UX plan).
   */
  lockBase: boolean;
  lockedBaseOklch?: LockedBaseOklch;
  scale: GeneratedColorScale | null;
}

/**
 * Saved custom scale configuration
 */
interface SavedCustomScale {
  id: string;
  name: string;
  baseColor: string;
  lightnessOffsets: LightnessOffsets;
  chromaRetention: number;
  scaleHue?: number;
  scaleChroma?: number;
  lockBase?: boolean;
  lockedBaseOklch?: LockedBaseOklch;
}

/**
 * Color foundation configuration stored in Convex
 */
interface ColorFoundationConfig {
  /** Brand's active scales */
  brandScales: Array<{
    name: string;
    source: 'preset' | 'custom';
    presetCollectionId?: string;
    baseColor?: string;
    lightnessOffsets?: LightnessOffsets;
    scaleHue?: number;
    scaleChroma?: number;
    chromaRetention?: number;
    /** Lock the base step's OkLCH so Chroma/Hue sliders don't rewrite the
     *  user's brand hex. See `LockedBaseOklch` for the snapshot shape. */
    lockBase?: boolean;
    lockedBaseOklch?: LockedBaseOklch;
  }>;
  /** Saved custom scales (persisted even if not in brand) */
  savedCustomScales?: SavedCustomScale[];
  /** Lightness scale configuration for custom scales */
  lightnessScale?: LightnessScaleConfig;
}

type TabMode = 'brand' | 'preset' | 'custom';

const MENU_Z_INDEX = 100;

/** Deterministic ID for the built-in Neutral custom scale entry */
const BUILTIN_NEUTRAL_ID = `builtin-${BUILT_IN_NEUTRAL_SCALE_NAME.toLowerCase()}`;

/**
 * Generate a color scale using the full lightness pipeline (offsets + chroma retention).
 * Falls back to flat generation if no lightness scale is provided.
 *
 * When `lockBase` + `lockedBaseOklch` are supplied, both pipelines pin the
 * base step to the locked OkLCH. This mirrors the engine contract so the
 * editor preview, auto-save payload, and brand CSS pipeline stay in sync.
 */
function generateFullScale(
  name: string,
  baseColor: string,
  lightnessScale?: LightnessScaleConfig,
  offsets?: { dark: number; light: number },
  chromaRetention: number = 0,
  lockBase?: boolean,
  lockedBaseOklch?: LockedBaseOklch,
  scaleHue?: number,
  scaleChroma?: number,
): GeneratedColorScale {
  const lockedOpts = lockBase && lockedBaseOklch
    ? { lockBase: true as const, lockedBaseOklch }
    : undefined;

  // Seed H/C/L from the locked snapshot when locked so stored-hex rounding
  // can't drift into the non-base steps.
  const seed = lockBase && lockedBaseOklch
    ? lockedBaseOklch
    : hexToOklch(baseColor);
  const resolvedHue = scaleHue ?? seed.h;
  const resolvedChroma = scaleChroma ?? seed.c;

  if (lightnessScale && offsets && (offsets.dark !== 0 || offsets.light !== 0)) {
    const modified = applyLightnessOffsets(lightnessScale, offsets, 1300);
    return generateColorScaleWithLightnessScale(
      name, resolvedHue, resolvedChroma, modified, seed.l, chromaRetention, lockedOpts,
    );
  }
  if (lightnessScale) {
    return generateColorScaleWithLightnessScale(
      name, resolvedHue, resolvedChroma, lightnessScale, seed.l, chromaRetention, lockedOpts,
    );
  }
  const flatOptions = lockedOpts
    ? { ...lockedOpts, scaleHue: resolvedHue, scaleChroma: resolvedChroma }
    : scaleHue !== undefined || scaleChroma !== undefined
      ? { scaleHue: resolvedHue, scaleChroma: resolvedChroma }
      : undefined;
  return generateColorScale(name, baseColor, 'linear', 0, chromaRetention, flatOptions);
}

/**
 * Generate the built-in Neutral brand scale entry.
 * Uses the provided baseColor or falls back to the default mid-gray.
 *
 * Default-locked: the user's chosen neutral hex is the brand contract, so we
 * capture a `lockedBaseOklch` snapshot from the hex on creation.
 */
function generateNeutralScaleEntry(
  baseColor?: string,
  lightnessScale?: LightnessScaleConfig,
  offsets?: { dark: number; light: number },
  lockBase: boolean = true,
  lockedBaseOklch?: LockedBaseOklch,
): BrandScaleEntry {
  const hex = baseColor || BUILT_IN_NEUTRAL_BASE_COLOR;
  const locked = lockBase
    ? lockedBaseOklch ?? hexToOklch(hex)
    : undefined;
  const generated = generateFullScale(
    BUILT_IN_NEUTRAL_SCALE_NAME, hex, lightnessScale, offsets, 0, lockBase, locked,
  );
  return {
    id: BUILTIN_NEUTRAL_ID,
    name: BUILT_IN_NEUTRAL_SCALE_NAME,
    source: 'custom',
    baseColor: hex,
    lightnessOffsets: offsets || { dark: 0, light: 0 },
    lockBase,
    lockedBaseOklch: locked,
    steps: generated.steps.map(step => ({
      step: step.step,
      hex: step.hex,
      isBase: step.isBase,
    })),
    baseStep: generated.config.baseStep.toString(),
  };
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function getContrastText(hex: string): string {
  // Use WCAG contrast ratio: pick whichever (black or white) has higher contrast
  const contrastWithWhite = getContrastRatioHex(hex, '#ffffff');
  const contrastWithBlack = getContrastRatioHex(hex, '#000000');
  return contrastWithBlack > contrastWithWhite ? '#000000' : '#ffffff';
}

function parseOklchToHex(oklch: string): string {
  const match = oklch.match(/oklch\((\d+(?:\.\d+)?)[%\s]+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\)/);
  if (!match) return '#808080';
  const l = parseFloat(match[1]);
  const c = parseFloat(match[2]);
  const h = parseFloat(match[3]);
  return oklchToHex(l, c, h);
}

function triggerBlobDownload(content: string, mimeType: string, filename: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ColorContent() {
  const { currentBrand } = usePlatformContext();
  const brandId = currentBrand?.id as Id<'brands'> | undefined;
  const brandName = currentBrand?.name || 'Brand';
  const foundationData = useFoundationData();

  // Nav-level export/download menu (single icon → context menu with all export options)
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!exportMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && exportMenuRef.current.contains(event.target as Node)) return;
      setExportMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [exportMenuOpen]);

  // Defer secondary queries until after first render to reduce initial load
  const [deferredQueriesReady, setDeferredQueriesReady] = useState(false);
  useEffect(() => {
    // Allow first render to complete before enabling secondary queries
    const timer = requestAnimationFrame(() => setDeferredQueriesReady(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  // Convex queries and mutations
  const existingFoundation = useQuery(
    api.foundations.getByType,
    brandId ? { brandId, type: 'color' as const } : 'skip'
  );
  const upsertFoundation = useMutation(api.foundations.upsertByType);

  // Preset color scale queries - deferred to reduce initial render blocking
  const presetCollections = useQuery(
    api.presetColorScales.listCollections,
    deferredQueriesReady ? {} : 'skip'
  );

  // Lightweight query for brand's preset scale summaries (base colors only, ~10KB vs 1MB+)
  // This allows generating approximate colors without fetching full scale data
  const brandPresetSummary = useQuery(
    api.presetColorScales.getBrandSelectionLightweight,
    brandId ? { brandId } : 'skip'
  );

  const uploadPresetCollection = useMutation(api.presetColorScales.uploadCollection);
  const deletePresetCollection = useMutation(api.presetColorScales.deleteCollection);
  const renamePresetCollection = useMutation(api.presetColorScales.renameCollection);
  const selectScalesForBrand = useMutation(api.presetColorScales.selectScalesForBrand);

  // Query for export (only when needed)
  const [exportCollectionId, setExportCollectionId] = useState<string | null>(null);
  const exportCollectionData = useQuery(
    api.presetColorScales.getCollectionWithScales,
    exportCollectionId ? { collectionId: exportCollectionId as Id<'presetColorScaleCollections'> } : 'skip'
  );

  // Collection menu state
  const [collectionMenuOpen, setCollectionMenuOpen] = useState(false);
  const [isRenamingCollection, setIsRenamingCollection] = useState(false);
  const [renameCollectionName, setRenameCollectionName] = useState('');
  const [renameCollectionVersion, setRenameCollectionVersion] = useState('');
  const collectionMenuRef = useRef<HTMLDivElement>(null);

  // Close collection menu when clicking outside
  useEffect(() => {
    if (!collectionMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (collectionMenuRef.current && !collectionMenuRef.current.contains(event.target as Node)) {
        setCollectionMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [collectionMenuOpen]);

  const [openScaleMenuId, setOpenScaleMenuId] = useState<string | null>(null);
  const scaleMenuRef = useRef<HTMLDivElement | null>(null);

  // Close scale row menu when clicking outside — ref-based so clicks inside the menu
  // (e.g. Delete) don't close it before the button's press event fires (mousedown
  // fires before click/press). The previous unconditional handler dismissed the menu
  // on the same mousedown, so Delete never ran.
  useEffect(() => {
    if (!openScaleMenuId) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (scaleMenuRef.current && scaleMenuRef.current.contains(event.target as Node)) return;
      setOpenScaleMenuId(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openScaleMenuId]);

  const [openBrandScaleMenuId, setOpenBrandScaleMenuId] = useState<string | null>(null);
  const [selectedBrandScaleIds, setSelectedBrandScaleIds] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const brandScaleMenuRef = useRef<HTMLDivElement | null>(null);

  // Close brand scale row menu when clicking outside — ref-based so clicks inside the menu
  // don't close it before the button's press event fires (mousedown fires before click/press).
  useEffect(() => {
    if (!openBrandScaleMenuId) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (brandScaleMenuRef.current && brandScaleMenuRef.current.contains(event.target as Node)) return;
      setOpenBrandScaleMenuId(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openBrandScaleMenuId]);

  // Saved lightness scales queries - deferred
  const savedLightnessScales = useQuery(
    api.savedLightnessScales.list,
    deferredQueriesReady ? {} : 'skip'
  );
  const saveLightnessScale = useMutation(api.savedLightnessScales.save);
  const deleteLightnessScale = useMutation(api.savedLightnessScales.remove);

  // State
  const [activeTab, setActiveTab] = useState<TabMode>('brand');
  const [hasInitialized, setHasInitialized] = useState(false);
  // Ref mirror of hasInitialized — set synchronously to prevent race conditions
  // where startTransition hasn't committed but the Convex subscription fires,
  // causing the init effect to run twice and trigger duplicate saves.
  const hasInitializedRef = useRef(false);
  const [isSettled, setIsSettled] = useState(false);

  // Brand scales state
  const [brandScales, setBrandScales] = useState<BrandScaleEntry[]>([]);

  // Drop stale selection IDs when brandScales changes (e.g. after a remove)
  useEffect(() => {
    const liveIds = new Set(brandScales.map(s => s.id));
    setSelectedBrandScaleIds(prev => {
      const next = prev.filter(id => liveIds.has(id));
      return next.length === prev.length ? prev : next;
    });
  }, [brandScales]);

  // Preset mode state
  const [viewingCollectionId, setViewingCollectionId] = useState<string | null>(null);
  const [selectedPresetScales, setSelectedPresetScales] = useState<string[]>([]);

  // Custom mode state
  const [customScales, setCustomScales] = useState<CustomScale[]>([]);
  const [savedCustomScalesState, setSavedCustomScalesState] = useState<SavedCustomScale[]>([]);
  const [selectedCustomScaleId, setSelectedCustomScaleId] = useState<string>('');
  const [inputMode, setInputMode] = useState<'hex' | 'sliders'>('hex');
  const [isRenaming, setIsRenaming] = useState(false);
  const [showAddScaleForm, setShowAddScaleForm] = useState(false);
  const [showFadeAdjustment, setShowFadeAdjustment] = useState(false);
  const [showLightnessScale, setShowLightnessScale] = useState(false);
  const [newScaleName, setNewScaleName] = useState('');
  const [newScaleColor, setNewScaleColor] = useState('#FF5500');
  const colorPickerRef = useRef<HTMLInputElement>(null);
  const [lightnessScale, setLightnessScale] = useState<LightnessScaleConfig>(createDefaultLightnessScale());
  // Only load heavy collection data when user actively opens preset section
  const [presetSectionExpanded, setPresetSectionExpanded] = useState(false);

  // Fetch full collection - when preset section is expanded OR when we have unpopulated preset scales
  // This ensures brand scales get proper color data even if brandPresetSummary hasn't synced yet
  const hasUnpopulatedPresetScales = brandScales.some(s => s.source === 'preset' && s.steps.length === 0);
  const viewingCollection = useQuery(
    api.presetColorScales.getCollection,
    viewingCollectionId && (presetSectionExpanded || hasUnpopulatedPresetScales) ? { collectionId: viewingCollectionId as any } : 'skip'
  );

  // Track previous brandId to detect changes
  const prevBrandIdRef = useRef<string | undefined>(brandId);
  // Guard refs to prevent infinite loops in effects
  const populatedFromSummaryRef = useRef(false);
  const loadedExactColorsFromRef = useRef<string | null>(null);

  // CONSOLIDATED EFFECT: Initialize from Convex + auto-select collection + populate presets + mark settled
  // This replaces 5 separate effects to prevent cascading re-renders
  useEffect(() => {
    // Detect brand change - reset all state
    if (prevBrandIdRef.current !== brandId) {
      prevBrandIdRef.current = brandId;
      // Reset effect guard refs for the new brand
      hasInitializedRef.current = false;
      populatedFromSummaryRef.current = false;
      loadedExactColorsFromRef.current = null;
      // Batch all resets together using startTransition for non-blocking update
      startTransition(() => {
        setHasInitialized(false);
        setIsSettled(false);
        setBrandScales([]);
        setCustomScales([]);
        setViewingCollectionId(null);
      });
      return;
    }

    // Skip if already initialized or no data yet.
    // Use BOTH the ref (synchronous, prevents race with startTransition)
    // and state (triggers re-render when Convex data arrives).
    if (hasInitializedRef.current || hasInitialized || existingFoundation === undefined) {
      return;
    }

    const config = existingFoundation?.config as ColorFoundationConfig | undefined;

    // Prepare all state updates
    const loadedLightnessScale = config?.lightnessScale
      ? JSON.parse(JSON.stringify(config.lightnessScale)) as LightnessScaleConfig
      : createDefaultLightnessScale();

    // Load brand scales
    let entries: BrandScaleEntry[] = [];
    if (config?.brandScales && config.brandScales.length > 0) {
      entries = config.brandScales.map(s => {
        const normalizedOffsets: LightnessOffsets = s.lightnessOffsets
          ? { dark: s.lightnessOffsets.dark || 0, light: s.lightnessOffsets.light || 0 }
          : { dark: 0, light: 0 };

        if (s.source === 'custom' && s.baseColor) {
          // Default legacy scales to locked; snapshot from baseColor when no
          // explicit snapshot was stored so the brand hex is preserved going forward.
          const lockBase = s.lockBase !== false;
          const lockedBaseOklch = lockBase
            ? s.lockedBaseOklch ?? hexToOklch(s.baseColor)
            : undefined;
          const chromaRetention = typeof s.chromaRetention === 'number' ? s.chromaRetention : 0;
          const generated = generateFullScale(
            s.name, s.baseColor, loadedLightnessScale, normalizedOffsets, chromaRetention, lockBase, lockedBaseOklch, s.scaleHue, s.scaleChroma,
          );
          return {
            id: s.name,
            name: s.name,
            source: 'custom' as const,
            baseColor: s.baseColor,
            lightnessOffsets: normalizedOffsets,
            scaleHue: generated.config.hue,
            scaleChroma: generated.config.chroma,
            chromaRetention,
            lockBase,
            lockedBaseOklch,
            steps: generated.steps.map(step => ({
              step: step.step,
              oklch: step.oklch, // Include OKLCH for accurate color display
              hex: step.hex,
              isBase: step.isBase,
            })),
            baseStep: generated.config.baseStep.toString(),
          };
        }
        return {
          id: s.name,
          name: s.name,
          source: 'preset' as const,
          presetCollectionId: s.presetCollectionId,
          steps: [],
          baseStep: '',
        };
      });
    }

    // Ensure Neutral scale is always present
    const hasNeutral = entries.some(
      s => s.name.toLowerCase() === BUILT_IN_NEUTRAL_SCALE_NAME.toLowerCase()
    );
    if (!hasNeutral) {
      entries.unshift(generateNeutralScaleEntry(undefined, loadedLightnessScale));
    }

    // Load saved custom scales
    let customs: CustomScale[] = [];
    let firstCustomId = '';
    if (config?.savedCustomScales && config.savedCustomScales.length > 0) {
      const normalizedSaved: SavedCustomScale[] = config.savedCustomScales.map(s => {
        const offsets: LightnessOffsets = (s as any).lightnessOffsets
          ? { dark: (s as any).lightnessOffsets.dark || 0, light: (s as any).lightnessOffsets.light || 0 }
          : { dark: 0, light: 0 };
        return {
          id: s.id,
          name: s.name,
          baseColor: s.baseColor,
          lightnessOffsets: offsets,
          chromaRetention: typeof (s as any).chromaRetention === 'number' ? (s as any).chromaRetention : 0,
          scaleHue: typeof (s as any).scaleHue === 'number' ? (s as any).scaleHue : undefined,
          scaleChroma: typeof (s as any).scaleChroma === 'number' ? (s as any).scaleChroma : undefined,
          lockBase: s.lockBase,
          lockedBaseOklch: s.lockedBaseOklch,
        };
      });

      customs = normalizedSaved.map(s => {
        // Legacy scales (missing lockBase) are opted in to locking — the base
        // hex is treated as contractual. We derive the snapshot from the hex.
        const lockBase = s.lockBase !== false;
        const lockedBaseOklch = lockBase
          ? s.lockedBaseOklch ?? hexToOklch(s.baseColor)
          : undefined;
        return {
          id: s.id,
          name: s.name,
          baseColor: s.baseColor,
          lightnessOffsets: s.lightnessOffsets,
          chromaRetention: s.chromaRetention,
          scaleHue: s.scaleHue,
          scaleChroma: s.scaleChroma,
          lockBase,
          lockedBaseOklch,
          scale: generateFullScale(
            s.name, s.baseColor, loadedLightnessScale, s.lightnessOffsets, s.chromaRetention, lockBase, lockedBaseOklch, s.scaleHue, s.scaleChroma,
          ),
        };
      });
      if (customs.length > 0) {
        firstCustomId = customs[0].id;
      }
    }

    // Ensure Neutral is always tracked in customScales so the lightness scale editor
    // can affect it and changes are synced back to brandScales via the sync effect.
    const hasNeutralInCustoms = customs.some(
      c => c.name.toLowerCase() === BUILT_IN_NEUTRAL_SCALE_NAME.toLowerCase()
    );
    if (!hasNeutralInCustoms) {
      const neutralEntry = entries.find(
        e => e.name.toLowerCase() === BUILT_IN_NEUTRAL_SCALE_NAME.toLowerCase()
      );
      if (neutralEntry) {
        const neutralBaseColor = neutralEntry.baseColor || BUILT_IN_NEUTRAL_BASE_COLOR;
        const neutralOffsets = neutralEntry.lightnessOffsets || { dark: 0, light: 0 };
        const neutralLockBase = neutralEntry.lockBase !== false;
        const neutralLocked = neutralLockBase
          ? neutralEntry.lockedBaseOklch ?? hexToOklch(neutralBaseColor)
          : undefined;
        customs.unshift({
          id: BUILTIN_NEUTRAL_ID,
          name: neutralEntry.name,
          baseColor: neutralBaseColor,
          lightnessOffsets: neutralOffsets,
          chromaRetention: 0,
          lockBase: neutralLockBase,
          lockedBaseOklch: neutralLocked,
          scale: generateFullScale(
            neutralEntry.name, neutralBaseColor, loadedLightnessScale, neutralOffsets, 0, neutralLockBase, neutralLocked,
          ),
        });
        // If no other custom scales exist, select Neutral so edits are correctly attributed.
        // Without this, selectedCustomScaleId stays '' but selectedCustomScale falls back to
        // customScales[0] (Neutral) — the editor shows it but handleBaseColorChange matches
        // s.id === '' which updates nothing and changes are silently lost.
        if (!firstCustomId) {
          firstCustomId = BUILTIN_NEUTRAL_ID;
        }
      }
    }

    // Set ref SYNCHRONOUSLY before startTransition to prevent race condition:
    // Without this, the Convex subscription update (from a save) could fire
    // between scheduling and committing the transition, causing the init effect
    // to run again with hasInitialized still false.
    hasInitializedRef.current = true;

    // Batch all state updates together in startTransition for non-blocking render
    startTransition(() => {
      setLightnessScale(loadedLightnessScale);
      setBrandScales(entries);
      setCustomScales(customs);
      if (firstCustomId) {
        setSelectedCustomScaleId(firstCustomId);
      }
      setHasInitialized(true);
    });
  }, [existingFoundation, hasInitialized, brandId]);

  // EFFECT 2: Auto-select collection when presetCollections loads
  // Prioritizes the collection that brand's preset scales are from
  // Waits for initialization to ensure brandScales is available
  useEffect(() => {
    if (!hasInitialized || !presetCollections || presetCollections.length === 0) return;
    if (viewingCollectionId) return; // Already set

    // Check if brand has preset scales with a collection ID
    const brandPresetCollectionId = brandScales.find(s => s.source === 'preset' && s.presetCollectionId)?.presetCollectionId;

    // Use brand's collection if it exists in the list, otherwise fall back to first
    const targetCollectionId = brandPresetCollectionId && presetCollections.some(c => c._id.toString() === brandPresetCollectionId)
      ? brandPresetCollectionId
      : presetCollections[0]._id.toString();

    startTransition(() => {
      setViewingCollectionId(targetCollectionId);
    });
  }, [hasInitialized, presetCollections, viewingCollectionId, brandScales]);

  // Track if we've synced the brand selection
  const hasSyncedBrandSelectionRef = useRef(false);

  // EFFECT 2.5: Sync existing preset scales to brandPresetScaleSelections if needed
  // This handles scales that were saved before the sync mechanism was added
  useEffect(() => {
    if (!hasInitialized || !brandId || hasSyncedBrandSelectionRef.current) return;

    // Only sync if we have preset scales but no brand selection data
    const hasPresetScales = brandScales.some(s => s.source === 'preset');
    const hasBrandSelection = brandPresetSummary !== undefined && brandPresetSummary !== null;

    if (hasPresetScales && !hasBrandSelection) {
      // Find the collection ID from the first preset scale
      const presetScaleWithCollection = brandScales.find(s => s.source === 'preset' && s.presetCollectionId);
      if (presetScaleWithCollection?.presetCollectionId) {
        const presetNames = brandScales
          .filter(s => s.source === 'preset')
          .map(s => s.name);

        // Sync to brandPresetScaleSelections table
        hasSyncedBrandSelectionRef.current = true;
        selectScalesForBrand({
          brandId,
          collectionId: presetScaleWithCollection.presetCollectionId as Id<'presetColorScaleCollections'>,
          selectedScales: presetNames,
        }).catch(err => {
          console.warn('[Color] Failed to sync brand selection:', err);
          hasSyncedBrandSelectionRef.current = false; // Allow retry on error
        });
      }
    }
  }, [hasInitialized, brandId, brandScales, brandPresetSummary, selectScalesForBrand]);

  // EFFECT 3: Populate preset scales from lightweight summary (generates approximate colors)
  // This runs early and provides immediate visual feedback without fetching 1MB+ collection data
  useEffect(() => {
    if (!hasInitialized) return;

    // Populate preset scales from lightweight summary (base color + generated scale)
    // Only run once to prevent infinite loops
    if (brandPresetSummary?.selectedScales && !populatedFromSummaryRef.current) {
      const needsPopulation = brandScales.some(s => s.source === 'preset' && s.steps.length === 0);

      if (needsPopulation) {
        populatedFromSummaryRef.current = true; // Mark before updating to prevent re-entry
        startTransition(() => {
          setBrandScales(prev => prev.map(scale => {
            if (scale.source === 'preset' && scale.steps.length === 0) {
              const summaryScale = brandPresetSummary.selectedScales.find((s: { name: string }) => s.name === scale.name);
              if (summaryScale && summaryScale.baseColor) {
                // Generate approximate colors from base color (lightweight)
                // Note: This is an approximation - full preset data provides exact colors
                const baseHex = parseOklchToHex(summaryScale.baseColor);
                const generated = generateColorScale(scale.name, baseHex, 'linear', 0);
                return {
                  ...scale,
                  steps: generated.steps.map(s => ({
                    step: s.step.toString(),
                    oklch: s.oklch, // Include OKLCH for accurate display
                    hex: s.hex,
                    isBase: s.step.toString() === summaryScale.baseStep,
                  })),
                  baseStep: summaryScale.baseStep,
                };
              }
            }
            return scale;
          }));
        });
      }
    }

    // Mark as settled if conditions are met (no longer waits for viewingCollection)
    if (!isSettled) {
      const hasUnpopulatedPresets = brandScales.some(s => s.source === 'preset' && s.steps.length === 0);
      const hasPresetScales = brandScales.some(s => s.source === 'preset');

      // Settle when: no preset scales, OR all presets are populated, OR we have summary data
      if (!hasPresetScales || !hasUnpopulatedPresets || brandPresetSummary !== undefined) {
        const timer = setTimeout(() => {
          startTransition(() => {
            setIsSettled(true);
          });
        }, 50);
        return () => clearTimeout(timer);
      }
    }
    return undefined;
  }, [hasInitialized, isSettled, brandScales, brandPresetSummary]);

  // EFFECT 4: Update preset scales with exact colors when full collection data loads
  // Runs when preset section is expanded OR when we have unpopulated preset scales
  useEffect(() => {
    if (!hasInitialized) return;
    if (!viewingCollection?.scales || !viewingCollectionId) return;

    // Check if we have scales that need population
    const needsPopulation = brandScales.some(s => s.source === 'preset' && s.steps.length === 0);

    // Only run if preset section is expanded OR we have scales that need population
    if (!presetSectionExpanded && !needsPopulation) return;

    // Only update once per collection (prevent infinite loop)
    if (loadedExactColorsFromRef.current === viewingCollectionId && !needsPopulation) return;

    // Mark as loaded before updating to prevent re-entry
    loadedExactColorsFromRef.current = viewingCollectionId;

    // Update preset scales with exact colors from full collection data
    startTransition(() => {
      setBrandScales(prev => prev.map(scale => {
        if (scale.source === 'preset') {
          const presetScale = viewingCollection.scales.find(s => s.name === scale.name);
          if (presetScale) {
            return {
              ...scale,
              steps: presetScale.steps.map(s => ({
                step: s.step,
                oklch: s.oklch, // Preserve OKLCH for accurate color display
                hex: parseOklchToHex(s.oklch),
                isBase: s.step === presetScale.baseStep,
              })),
              baseStep: presetScale.baseStep,
            };
          }
        }
        return scale;
      }));
    });
  }, [hasInitialized, presetSectionExpanded, viewingCollection, viewingCollectionId, brandScales]);

  // Convert current custom scales to saveable format. We persist both the
  // lock flag and the snapshot so subsequent page loads and the brand CSS
  // engine regenerate the scale with exactly the same base step.
  const currentCustomScalesForSave: SavedCustomScale[] = useMemo(() =>
    customScales.map(s => ({
      id: s.id,
      name: s.name,
      baseColor: s.baseColor,
      lightnessOffsets: s.lightnessOffsets,
      chromaRetention: s.chromaRetention,
      scaleHue: s.scale?.config.hue ?? s.scaleHue,
      scaleChroma: s.scale?.config.chroma ?? s.scaleChroma,
      lockBase: s.lockBase,
      lockedBaseOklch: s.lockedBaseOklch,
    })),
    [customScales]
  );

  // Combined config for auto-save
  const config = useMemo<ColorFoundationConfig>(() => ({
    brandScales: brandScales.map(s => ({
      name: s.name,
      source: s.source,
      presetCollectionId: s.presetCollectionId,
      baseColor: s.baseColor,
      lightnessOffsets: s.lightnessOffsets,
      scaleHue: s.scaleHue,
      scaleChroma: s.scaleChroma,
      chromaRetention: s.chromaRetention,
      lockBase: s.lockBase,
      lockedBaseOklch: s.lockedBaseOklch,
    })),
    savedCustomScales: currentCustomScalesForSave,
    lightnessScale,
  }), [brandScales, currentCustomScalesForSave, lightnessScale]);

  // Auto-save to Convex with debouncing (only after settled)
  const { isSaving } = useAutoSave({
    config,
    brandId,
    type: 'color',
    enabled: isSettled,
  });

  // Selected custom scale for editing
  const selectedCustomScale = useMemo(() =>
    customScales.find(s => s.id === selectedCustomScaleId) || customScales[0],
    [customScales, selectedCustomScaleId]
  );

  // Add preset scales to brand
  const handleAddPresetsToBrand = useCallback(async () => {
    if (!viewingCollection?.scales || !brandId || !viewingCollectionId) return;

    const newEntries: BrandScaleEntry[] = [];
    const newScaleNames: string[] = [];

    for (const name of selectedPresetScales) {
      if (brandScales.some(s => s.name === name)) continue;
      const presetScale = viewingCollection.scales.find(s => s.name === name);
      if (!presetScale) continue;
      newEntries.push({
        id: name,
        name,
        source: 'preset' as const,
        presetCollectionId: viewingCollectionId || undefined,
        steps: presetScale.steps.map(s => ({
          step: s.step,
          oklch: s.oklch, // Preserve OKLCH for accurate color display
          hex: parseOklchToHex(s.oklch),
          isBase: s.step === presetScale.baseStep,
        })),
        baseStep: presetScale.baseStep,
      });
      newScaleNames.push(name);
    }

    if (newEntries.length > 0) {
      // Collect all preset scale names (existing + new) for the brand selection
      const existingPresetNames = brandScales
        .filter(s => s.source === 'preset')
        .map(s => s.name);
      const allPresetNames = [...existingPresetNames, ...newScaleNames];

      // Sync selection to Convex (required for surfaces page)
      await selectScalesForBrand({
        brandId,
        collectionId: viewingCollectionId as Id<'presetColorScaleCollections'>,
        selectedScales: allPresetNames,
      });

      setBrandScales(prev => [...prev, ...newEntries]);
      setSelectedPresetScales([]);
      setActiveTab('brand');
    }
  }, [selectedPresetScales, viewingCollection, viewingCollectionId, brandScales, brandId, selectScalesForBrand]);

  // Add custom scale to brand
  const handleAddCustomToBrand = useCallback((customScale: CustomScale) => {
    if (!customScale.scale) return;
    if (brandScales.some(s => s.name === customScale.name)) return;

    const newEntry: BrandScaleEntry = {
      id: customScale.id,
      name: customScale.name,
      source: 'custom',
      baseColor: customScale.baseColor,
      lightnessOffsets: customScale.lightnessOffsets,
      scaleHue: customScale.scale.config.hue,
      scaleChroma: customScale.scale.config.chroma,
      chromaRetention: customScale.chromaRetention,
      lockBase: customScale.lockBase,
      lockedBaseOklch: customScale.lockedBaseOklch,
      steps: customScale.scale.steps.map(s => ({
        step: s.step,
        oklch: s.oklch, // Include OKLCH for accurate color display
        hex: s.hex,
        isBase: s.isBase,
      })),
      baseStep: customScale.scale.config.baseStep.toString(),
    };

    setBrandScales(prev => [...prev, newEntry]);
    setActiveTab('brand');
  }, [brandScales]);

  // Remove multiple scales from brand at once without N+1 mutations
  const handleBulkRemoveFromBrand = useCallback(async (names: string[]) => {
    const toRemove = new Set(names.map(n => n.toLowerCase()));
    toRemove.delete(BUILT_IN_NEUTRAL_SCALE_NAME.toLowerCase());
    if (toRemove.size === 0) return;

    // Group preset scales to remove by collection (one mutation per collection)
    const byCollection = new Map<string, { collectionId: string; remaining: string[] }>();
    for (const scale of brandScales) {
      if (scale.source !== 'preset' || !scale.presetCollectionId) continue;
      if (!byCollection.has(scale.presetCollectionId)) {
        byCollection.set(scale.presetCollectionId, { collectionId: scale.presetCollectionId, remaining: [] });
      }
      if (!toRemove.has(scale.name.toLowerCase())) {
        byCollection.get(scale.presetCollectionId)!.remaining.push(scale.name);
      }
    }

    if (brandId) {
      await Promise.all(
        Array.from(byCollection.values()).map(({ collectionId, remaining }) =>
          selectScalesForBrand({
            brandId,
            collectionId: collectionId as Id<'presetColorScaleCollections'>,
            selectedScales: remaining,
          })
        )
      );
    }

    // Custom-source scales need no Convex mutation here — removing them from
    // brandScales state is enough; useAutoSave persists the updated list.
    setBrandScales(prev => prev.filter(s => !toRemove.has(s.name.toLowerCase())));
  }, [brandScales, brandId, selectScalesForBrand]);

  // Remove scale from brand (Neutral cannot be removed)
  const handleRemoveFromBrand = useCallback(async (name: string) => {
    if (name.toLowerCase() === BUILT_IN_NEUTRAL_SCALE_NAME.toLowerCase()) return;
    const scaleToRemove = brandScales.find(s => s.name === name);

    // If removing a preset scale, update the brand selection in Convex
    if (scaleToRemove?.source === 'preset' && brandId && scaleToRemove.presetCollectionId) {
      const remainingPresetNames = brandScales
        .filter(s => s.source === 'preset' && s.name !== name)
        .map(s => s.name);

      await selectScalesForBrand({
        brandId,
        collectionId: scaleToRemove.presetCollectionId as Id<'presetColorScaleCollections'>,
        selectedScales: remainingPresetNames,
      });
    }

    setBrandScales(prev => prev.filter(s => s.name !== name));
  }, [brandScales, brandId, selectScalesForBrand]);

  // Sync customScales changes to brandScales
  // When a custom scale is edited, update the matching entry in brandScales if it exists
  useEffect(() => {
    if (!hasInitialized) return;

    // Check each custom scale and sync to brandScales if it exists there
    // Use startTransition for non-blocking update
    startTransition(() => {
      setBrandScales(prev => {
        let hasChanges = false;
        const updated = prev.map(brandScale => {
          if (brandScale.source !== 'custom') return brandScale;

          // Find matching custom scale by name
          const matchingCustom = customScales.find(cs => cs.name === brandScale.name);
          if (!matchingCustom?.scale) return brandScale;

          // Check if anything changed. Lock state also flows through so the
          // brand scales entry (what the Convex save actually persists)
          // stays in sync with the custom-scale editor state.
          const needsUpdate =
            brandScale.baseColor !== matchingCustom.baseColor ||
            JSON.stringify(brandScale.lightnessOffsets) !== JSON.stringify(matchingCustom.lightnessOffsets) ||
            brandScale.scaleHue !== matchingCustom.scale.config.hue ||
            brandScale.scaleChroma !== matchingCustom.scale.config.chroma ||
            brandScale.chromaRetention !== matchingCustom.chromaRetention ||
            brandScale.lockBase !== matchingCustom.lockBase ||
            JSON.stringify(brandScale.lockedBaseOklch) !== JSON.stringify(matchingCustom.lockedBaseOklch);

          if (needsUpdate) {
            hasChanges = true;
            return {
              ...brandScale,
              baseColor: matchingCustom.baseColor,
              lightnessOffsets: matchingCustom.lightnessOffsets,
              scaleHue: matchingCustom.scale.config.hue,
              scaleChroma: matchingCustom.scale.config.chroma,
              chromaRetention: matchingCustom.chromaRetention,
              lockBase: matchingCustom.lockBase,
              lockedBaseOklch: matchingCustom.lockedBaseOklch,
              steps: matchingCustom.scale.steps.map(s => ({
                step: s.step,
                oklch: s.oklch, // Include OKLCH for accurate color display
                hex: s.hex,
                isBase: s.isBase,
              })),
              baseStep: matchingCustom.scale.config.baseStep.toString(),
            };
          }
          return brandScale;
        });

        return hasChanges ? updated : prev;
      });
    });
  }, [customScales, hasInitialized]);

  // Helper function to regenerate scale with current settings.
  // When `lockBase` is on and a `lockedBaseOklch` snapshot is supplied, the
  // generator pins the base step to that OkLCH and caps non-base chroma. If
  // no snapshot is passed but `lockBase` is true, we derive one from the hex
  // so legacy scales migrate cleanly on first edit.
  //
  // `previousChromaCap` carries the user's existing slider cap forward so
  // edits that don't touch chroma (lightness offsets, chroma retention, etc.)
  // don't silently reset the cap to `locked.c`. When omitted we fall back to
  // `seed.c`, which is the right behaviour for fresh / lock-toggle / new-hex
  // flows.
  const regenerateScale = useCallback((
    name: string,
    baseColor: string,
    offsets: LightnessOffsets,
    chromaRetention: number,
    lockBase: boolean = false,
    lockedBaseOklch?: LockedBaseOklch,
    previousChromaCap?: number,
    previousHue?: number,
  ): GeneratedColorScale => {
    const locked = lockBase
      ? lockedBaseOklch ?? hexToOklch(baseColor)
      : undefined;
    const seed = locked ?? hexToOklch(baseColor);

    const modifiedLightnessScale = applyLightnessOffsets(
      lightnessScale,
      { dark: offsets.dark, light: offsets.light },
      1300, // Default base step, will be recalculated based on color
    );

    // The cap we actually feed the generator. The generator itself clamps
    // this to [0, locked.c] when locked, so we don't have to here.
    const chromaForGenerator = previousChromaCap ?? seed.c;
    const hueForGenerator = previousHue ?? seed.h;

    return generateColorScaleWithLightnessScale(
      name,
      hueForGenerator,
      chromaForGenerator,
      modifiedLightnessScale,
      seed.l,
      chromaRetention,
      locked ? { lockBase: true, lockedBaseOklch: locked } : undefined,
    );
  }, [lightnessScale]);

  // Custom scale handlers
  // Changing the base hex while locked is treated as the user explicitly
  // choosing a new brand colour, so we re-snapshot `lockedBaseOklch` from the
  // incoming hex. Unlocked scales just regenerate without a snapshot.
  const handleBaseColorChange = useCallback((color: string) => {
    setCustomScales(prev => prev.map(s => {
      if (s.id !== selectedCustomScaleId) return s;
      const nextLocked = s.lockBase ? hexToOklch(color) : undefined;
      const newScale = regenerateScale(s.name, color, s.lightnessOffsets, s.chromaRetention, s.lockBase, nextLocked);
      return {
        ...s,
        baseColor: color,
        lockedBaseOklch: nextLocked,
        scaleHue: newScale.config.hue,
        scaleChroma: newScale.config.chroma,
        scale: newScale,
      };
    }));
  }, [selectedCustomScaleId, regenerateScale]);

  const handleHueChange = useCallback((hue: number) => {
    setCustomScales(prev => prev.map(s => {
      if (s.id !== selectedCustomScaleId || !s.scale) return s;
      const newScale = regenerateScale(
        s.name,
        s.baseColor,
        s.lightnessOffsets,
        s.chromaRetention,
        s.lockBase,
        s.lockedBaseOklch,
        s.scale.config.chroma,
        hue,
      );
      return {
        ...s,
        baseColor: newScale.config.baseColor,
        scaleHue: newScale.config.hue,
        scaleChroma: newScale.config.chroma,
        scale: newScale,
      };
    }));
  }, [selectedCustomScaleId, regenerateScale]);

  const handleChromaChange = useCallback((chroma: number) => {
    setCustomScales(prev => prev.map(s => {
      if (s.id !== selectedCustomScaleId || !s.scale) return s;
      const newScale = regenerateScale(
        s.name,
        s.baseColor,
        s.lightnessOffsets,
        s.chromaRetention,
        s.lockBase,
        s.lockedBaseOklch,
        chroma,
        s.scale.config.hue,
      );
      return {
        ...s,
        baseColor: newScale.config.baseColor,
        scaleHue: newScale.config.hue,
        scaleChroma: newScale.config.chroma,
        scale: newScale,
      };
    }));
  }, [selectedCustomScaleId, regenerateScale]);

  const handleDarkOffsetChange = useCallback((darkOffset: number) => {
    setCustomScales(prev => prev.map(s => {
      if (s.id !== selectedCustomScaleId) return s;
      const newOffsets = { ...s.lightnessOffsets, dark: darkOffset };
      const newScale = regenerateScale(s.name, s.baseColor, newOffsets, s.chromaRetention, s.lockBase, s.lockedBaseOklch, s.scale?.config.chroma, s.scale?.config.hue);
      return { ...s, lightnessOffsets: newOffsets, scaleHue: newScale.config.hue, scaleChroma: newScale.config.chroma, scale: newScale };
    }));
  }, [selectedCustomScaleId, regenerateScale]);

  const handleLightOffsetChange = useCallback((lightOffset: number) => {
    setCustomScales(prev => prev.map(s => {
      if (s.id !== selectedCustomScaleId) return s;
      const newOffsets = { ...s.lightnessOffsets, light: lightOffset };
      const newScale = regenerateScale(s.name, s.baseColor, newOffsets, s.chromaRetention, s.lockBase, s.lockedBaseOklch, s.scale?.config.chroma, s.scale?.config.hue);
      return { ...s, lightnessOffsets: newOffsets, scaleHue: newScale.config.hue, scaleChroma: newScale.config.chroma, scale: newScale };
    }));
  }, [selectedCustomScaleId, regenerateScale]);

  const handleChromaRetentionChange = useCallback((retention: number) => {
    setCustomScales(prev => prev.map(s => {
      if (s.id !== selectedCustomScaleId) return s;
      const newScale = regenerateScale(s.name, s.baseColor, s.lightnessOffsets, retention, s.lockBase, s.lockedBaseOklch, s.scale?.config.chroma, s.scale?.config.hue);
      return { ...s, chromaRetention: retention, scaleHue: newScale.config.hue, scaleChroma: newScale.config.chroma, scale: newScale };
    }));
  }, [selectedCustomScaleId, regenerateScale]);

  // Flip lockBase. Turning lock ON snapshots the current base hex as the
  // contract; turning lock OFF drops the snapshot so sliders can organically
  // rewrite the base step again (legacy behaviour).
  const handleToggleLockBase = useCallback((locked: boolean) => {
    setCustomScales(prev => prev.map(s => {
      if (s.id !== selectedCustomScaleId) return s;
      const nextLocked = locked ? hexToOklch(s.baseColor) : undefined;
      const newScale = regenerateScale(s.name, s.baseColor, s.lightnessOffsets, s.chromaRetention, locked, nextLocked);
      return {
        ...s,
        lockBase: locked,
        lockedBaseOklch: nextLocked,
        scaleHue: newScale.config.hue,
        scaleChroma: newScale.config.chroma,
        scale: newScale,
      };
    }));
  }, [selectedCustomScaleId, regenerateScale]);

  const handleScaleNameChange = useCallback((name: string) => {
    setCustomScales(prev => prev.map(s =>
      s.id === selectedCustomScaleId
        ? { ...s, name, scale: s.scale ? { ...s.scale, config: { ...s.scale.config, name } } : null }
        : s
    ));
  }, [selectedCustomScaleId]);

  const handleAddCustomScale = useCallback(() => {
    if (!newScaleName.trim() || !newScaleColor) return;
    const id = generateId();
    const defaultOffsets: LightnessOffsets = { dark: 0, light: 0 };
    // New scales are locked by default: the hex the user just picked is their
    // brand colour, so we freeze it before sliders can drift it.
    const lockedSnapshot = hexToOklch(newScaleColor);
    const generated = regenerateScale(
      newScaleName.trim().toLowerCase(),
      newScaleColor,
      defaultOffsets,
      0,
      true,
      lockedSnapshot,
    );
    const newScale: CustomScale = {
      id,
      name: newScaleName.trim().toLowerCase(),
      baseColor: newScaleColor,
      lightnessOffsets: defaultOffsets,
      chromaRetention: 0,
      scaleHue: generated.config.hue,
      scaleChroma: generated.config.chroma,
      lockBase: true,
      lockedBaseOklch: lockedSnapshot,
      scale: generated,
    };
    setCustomScales(prev => [...prev, newScale]);
    setSelectedCustomScaleId(id);
    setNewScaleName('');
    setNewScaleColor('#FF5500');
    setShowAddScaleForm(false);
  }, [newScaleName, newScaleColor, regenerateScale]);

  const handleRemoveCustomScale = useCallback((id: string) => {
    setCustomScales(prev => {
      const scale = prev.find(s => s.id === id);
      if (scale?.name.toLowerCase() === BUILT_IN_NEUTRAL_SCALE_NAME.toLowerCase()) return prev;
      const filtered = prev.filter(s => s.id !== id);
      if (selectedCustomScaleId === id && filtered.length > 0) {
        setSelectedCustomScaleId(filtered[0].id);
      }
      return filtered;
    });
  }, [selectedCustomScaleId]);

  // Edit a brand scale: find or create it in customScales, select it, switch to custom tab
  const handleEditBrandScale = useCallback((scaleName: string) => {
    const brandScale = brandScales.find(s => s.name === scaleName);
    if (!brandScale) return;

    // Determine the base color for this scale
    const baseColor = brandScale.baseColor || BUILT_IN_NEUTRAL_BASE_COLOR;

    // Check if already in customScales
    const existing = customScales.find(cs => cs.name === scaleName);
    if (existing) {
      setSelectedCustomScaleId(existing.id);
      setActiveTab('custom');
      return;
    }

    // Create a new custom scale entry from the brand scale data. Default to
    // locked: the brand scale's stored hex is the contract the user committed
    // to. Reuse any existing snapshot; otherwise derive one from the hex.
    const id = generateId();
    const offsets: LightnessOffsets = brandScale.lightnessOffsets || { dark: 0, light: 0 };
    const chromaRetention = typeof brandScale.chromaRetention === 'number' ? brandScale.chromaRetention : 0;
    const lockBase = brandScale.lockBase !== false;
    const lockedBaseOklch = lockBase
      ? brandScale.lockedBaseOklch ?? hexToOklch(baseColor)
      : undefined;
    const scale = regenerateScale(scaleName, baseColor, offsets, chromaRetention, lockBase, lockedBaseOklch, brandScale.scaleChroma, brandScale.scaleHue);
    const newCustom: CustomScale = {
      id,
      name: scaleName,
      baseColor,
      lightnessOffsets: offsets,
      chromaRetention,
      scaleHue: scale.config.hue,
      scaleChroma: scale.config.chroma,
      lockBase,
      lockedBaseOklch,
      scale,
    };
    setCustomScales(prev => [...prev, newCustom]);
    setSelectedCustomScaleId(id);
    setActiveTab('custom');
  }, [brandScales, customScales, regenerateScale]);

  const handleLightnessScaleChange = useCallback((newConfig: LightnessScaleConfig) => {
    setLightnessScale(newConfig);
    // Regenerate all custom scales with the new lightness scale. When a scale
    // is locked, seed H/C/L from its snapshot so the base step stays pinned
    // exactly — hex rounding from `baseColor` would otherwise drift.
    setCustomScales(prev => prev.map(s => {
      if (!s.scale) return s;
      const modifiedLightnessScale = applyLightnessOffsets(
        newConfig,
        { dark: s.lightnessOffsets.dark, light: s.lightnessOffsets.light },
        s.scale.config.baseStep,
      );
      const locked = s.lockBase && s.lockedBaseOklch ? s.lockedBaseOklch : undefined;
      const seed = locked ?? hexToOklch(s.baseColor);
      // Preserve the user's existing chroma cap; falling back to seed.c would
      // silently reset the cap to the base's full chroma on every lightness-
      // scale edit.
      const chromaCap = s.scale.config.chroma;
      const hue = s.scale.config.hue;
      const scale = generateColorScaleWithLightnessScale(
        s.name, hue, chromaCap, modifiedLightnessScale, seed.l, s.chromaRetention,
        locked ? { lockBase: true, lockedBaseOklch: locked } : undefined,
      );
      return {
        ...s,
        scaleHue: scale.config.hue,
        scaleChroma: scale.config.chroma,
        scale,
      };
    }));
  }, []);

  const handleSaveLightnessScale = useCallback(async (name: string, description?: string) => {
    await saveLightnessScale({
      name,
      description,
      values: lightnessScale.values as any,
    });
  }, [saveLightnessScale, lightnessScale.values]);

  const handleDeleteLightnessScale = useCallback(async (id: string) => {
    await deleteLightnessScale({ id: id as any });
  }, [deleteLightnessScale]);

  // Toggle preset scale selection
  const handlePresetScaleToggle = useCallback((scaleName: string) => {
    setSelectedPresetScales(prev =>
      prev.includes(scaleName)
        ? prev.filter(s => s !== scaleName)
        : [...prev, scaleName]
    );
  }, []);

  const isLoading = (brandId != null && existingFoundation === undefined) || !hasInitialized;

  // Check presets for selected custom scale
  const isActiveHuePreset = (presetHue: number) =>
    selectedCustomScale?.scale && Math.abs(selectedCustomScale.scale.config.hue - presetHue) < 5;

  const isActiveChromaPreset = (presetChroma: number) =>
    selectedCustomScale?.scale && Math.abs(selectedCustomScale.scale.config.chroma - presetChroma) < 0.01;


  // Check if preset is already in brand
  const isPresetInBrand = (scaleName: string) => brandScales.some(s => s.name === scaleName);

  // Check if custom is already in brand
  const isCustomInBrand = (scaleName: string) => brandScales.some(s => s.name === scaleName && s.source === 'custom');

  // Export brand scales to JSON
  const handleExportScales = useCallback(() => {
    if (brandScales.length === 0) return;

    const exportData = {
      brandName: brandName,
      exportedAt: new Date().toISOString(),
      scales: brandScales.map((scale) => {
        // Find the base step
        const baseStepData = scale.steps.find((s) => s.isBase || String(s.step) === String(scale.baseStep));

        return {
          name: scale.name,
          source: scale.source,
          baseStep: scale.baseStep,
          baseColor: baseStepData?.hex || scale.baseColor || '#000000',
          steps: scale.steps.map((step) => ({
            step: step.step,
            hex: step.hex,
            isBase: step.isBase || String(step.step) === String(scale.baseStep),
          })),
        };
      }),
    };

    triggerBlobDownload(
      JSON.stringify(exportData, null, 2),
      'application/json',
      `${brandName.toLowerCase().replace(/\s+/g, '-')}-color-scales.json`,
    );
  }, [brandScales, brandName]);

  // Export brand scales to SVG
  const handleExportScalesSVG = useCallback(() => {
    if (brandScales.length === 0) return;

    const swatchW = 24;
    const swatchH = 36;
    const nameW = 110;
    const gap = 8;
    const sidePad = 24;
    const topPad = 44;
    const rowGap = 10;
    const rowH = swatchH + rowGap;
    const stepsCount = brandScales[0]?.steps.length || 25;
    const totalW = sidePad * 2 + nameW + gap + swatchW * stepsCount;
    const totalH = topPad + brandScales.length * rowH + 20;

    const isDark = document.documentElement.getAttribute('data-mode') !== 'light';
    const svgBg = isDark ? '#111111' : '#f8f8f8';
    const svgText = isDark ? '#ffffff' : '#111111';
    const svgMeta = isDark ? '#888888' : '#666666';

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}">`;
    svg += `<rect width="${totalW}" height="${totalH}" fill="${svgBg}" rx="12"/>`;
    svg += `<text x="${sidePad}" y="26" font-family="system-ui,-apple-system,sans-serif" font-size="13" font-weight="600" fill="${svgText}">${brandName} Color Scales</text>`;

    brandScales.forEach((scale, si) => {
      const y = topPad + si * rowH;
      const scaleX = sidePad + nameW + gap;
      const truncName = scale.name.length > 14 ? scale.name.slice(0, 13) + '…' : scale.name;
      svg += `<text x="${sidePad}" y="${y + swatchH / 2 + 4}" font-family="system-ui,-apple-system,sans-serif" font-size="10" fill="${svgMeta}">${truncName}</text>`;

      scale.steps.forEach((step, idx) => {
        const x = scaleX + idx * swatchW;
        const hex = (step.hex && step.hex.startsWith('#')) ? step.hex : '#808080';
        svg += `<rect x="${x}" y="${y}" width="${swatchW}" height="${swatchH}" fill="${hex}"/>`;
        const isBase = step.isBase || String(step.step) === String(scale.baseStep);
        if (isBase) {
          const textColor = getReadableTextColor(hex);
          const dotColor = textColor === '#000000' ? '#00000099' : '#ffffff99';
          svg += `<circle cx="${x + swatchW / 2}" cy="${y + swatchH / 2}" r="3" fill="${dotColor}"/>`;
        }
      });
    });

    svg += '</svg>';

    triggerBlobDownload(svg, 'image/svg+xml', `${brandName.toLowerCase().replace(/\s+/g, '-')}-color-scales.svg`);
  }, [brandScales, brandName]);

  // Export the brand's resolved color tokens as JSON (mirrors ExportTokensButton,
  // sliced to the color foundation). Runs the same engine pipeline as useBrandCSS.
  const handleExportColorTokens = useCallback(() => {
    if (!foundationData || !currentBrand) return;
    const payload = extractResolvedTokens(foundationData, {
      brandId: currentBrand.id,
      brandName: currentBrand.name,
    });
    const sliced = sliceExportByFoundation(payload, 'color');
    const slug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'brand';
    downloadJSON(sliced, `${slug}-color-tokens.json`);
  }, [foundationData, currentBrand, brandName]);

  // Handle collection export when data loads
  useEffect(() => {
    if (exportCollectionData && exportCollectionId) {
      const { collection, exportData } = exportCollectionData;
      const fileName = `${collection.name.toLowerCase().replace(/\s+/g, '-')}-${collection.version || 'v1.0'}.json`;

      triggerBlobDownload(JSON.stringify(exportData, null, 2), 'application/json', fileName);

      // Reset export state
      setExportCollectionId(null);
    }
  }, [exportCollectionData, exportCollectionId]);

  // Handle collection rename
  const handleRenameCollection = useCallback(async () => {
    if (!viewingCollectionId || !renameCollectionName.trim()) return;

    await renamePresetCollection({
      collectionId: viewingCollectionId as Id<'presetColorScaleCollections'>,
      name: renameCollectionName.trim(),
      version: renameCollectionVersion.trim() || undefined,
    });

    setIsRenamingCollection(false);
    setRenameCollectionName('');
    setRenameCollectionVersion('');
  }, [viewingCollectionId, renameCollectionName, renameCollectionVersion, renamePresetCollection]);

  // Start rename mode
  const startRenamingCollection = useCallback(() => {
    if (!viewingCollectionId || !presetCollections) return;
    const collection = presetCollections.find(c => c._id.toString() === viewingCollectionId);
    if (collection) {
      setRenameCollectionName(collection.name);
      setRenameCollectionVersion(collection.version || '');
      setIsRenamingCollection(true);
      setCollectionMenuOpen(false);
    }
  }, [viewingCollectionId, presetCollections]);

  // Actions rendered on the "Your Custom Scales" card title row: Create + the
  // More menu holding every export option (SVG, scale JSON, resolved tokens).
  const customScalesActions = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-3)', flexShrink: 0 }}>
      {!showAddScaleForm && (
        <Button
          attention="medium"
          appearance="secondary"
          size="small"
          onPress={() => setShowAddScaleForm(true)}
          leftIcon={<Icon name="add" size="sm" />}
        >
          Create new custom scale
        </Button>
      )}

      <div
        ref={exportMenuRef}
        style={{ position: 'relative', flexShrink: 0 }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <IconButton
          attention="low"
          appearance="neutral"
          size="small"
          aria-label="Export / download options"
          aria-haspopup="menu"
          aria-expanded={exportMenuOpen}
          onPress={() => setExportMenuOpen((v) => {
            const next = !v;
            if (next) { setOpenScaleMenuId(null); setOpenBrandScaleMenuId(null); setCollectionMenuOpen(false); }
            return next;
          })}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          }
        />
        {exportMenuOpen && (
          <div
            role="menu"
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 'var(--Spacing-2-5)',
              backgroundColor: 'var(--Surface-Main)',
              border: 'var(--Stroke-M) solid var(--Border-Subtle)',
              borderRadius: 'var(--Shape-3-5)',
              boxShadow: 'var(--Elevation-2)',
              zIndex: MENU_Z_INDEX,
              minWidth: 'var(--Spacing-40)',
              padding: 'var(--Spacing-2-5)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--Spacing-1-5)',
            }}
          >
            <div style={{
              padding: 'var(--Spacing-1-5) var(--Spacing-2-5)',
              fontSize: 'var(--Label-XS-FontSize)',
              lineHeight: 'var(--Label-XS-LineHeight)',
              fontWeight: 'var(--Label-FontWeight-Medium)',
              fontFamily: 'var(--Typography-Font-Primary)',
              color: 'var(--Text-Low)',
              borderBottom: 'var(--Stroke-M) solid var(--Border-Subtle)',
              marginBottom: 'var(--Spacing-1)',
            }}>
              Download
            </div>
            <Button
              attention="low"
              appearance="neutral"
              size="small"
              onPress={() => { handleExportScalesSVG(); setExportMenuOpen(false); }}
              leftIcon={<Icon name="image" size="sm" />}
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              Export scale SVG
            </Button>
            <Button
              attention="low"
              appearance="neutral"
              size="small"
              onPress={() => { handleExportScales(); setExportMenuOpen(false); }}
              leftIcon={<Icon name="download" size="sm" />}
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              Export scale JSON
            </Button>
            <Button
              attention="low"
              appearance="neutral"
              size="small"
              disabled={!foundationData || !currentBrand}
              onPress={() => { handleExportColorTokens(); setExportMenuOpen(false); }}
              leftIcon={<Icon name="document" size="sm" />}
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              Export color tokens (JSON)
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Color Foundation</h1>
        <p className={styles.description}>
          Manage color scales for your brand. Add scales from presets or create custom ones.
          {currentBrand && (
            <span className={styles.brandIndicator}>
              {' '}Configuring for <strong>{currentBrand.name}</strong>
            </span>
          )}
        </p>
      </div>

      <div className={styles.content}>
        {/* Loading State */}
        {isLoading && <PageSkeleton cards={2} />}

        {/* Tabs */}
        {!isLoading && (
          <>
          <div className={styles.foundationTabsRow}>
            <Tabs.Root
              value={activeTab}
              onValueChange={(value) => {
                const tab = (value as TabMode) ?? 'brand';
                setActiveTab(tab);
                if (tab === 'preset') setPresetSectionExpanded(true);
              }}
            >
              <Tabs.List className={styles.foundationTabsList}>
              <Tabs.Item value="brand">
                {brandName} Scales
                {brandScales.length > 0 && (
                  <span className={colorStyles.tabCount}>({brandScales.length})</span>
                )}
              </Tabs.Item>
              <Tabs.Item value="preset">Preset Scales</Tabs.Item>
              <Tabs.Item value="custom">Custom Scales</Tabs.Item>
              <Tabs.Indicator />
              </Tabs.List>
            </Tabs.Root>
          </div>

          <div className={styles.tabPanelStack}>

        {/* Brand Scales Tab */}
        {activeTab === 'brand' && (
          <FoundationCard
            title={`${brandName} Scales`}
            description="Active color scales for this brand. These are used in the Surfaces foundation."
            actions={brandScales.length > 0 ? (
              <div style={{ display: 'flex', gap: 'var(--Spacing-3)', alignItems: 'center' }}>
                {isSelectMode ? (
                  <>
                    <Button
                      attention="low"
                      appearance="neutral"
                      size="small"
                      onPress={() => {
                        setSelectedBrandScaleIds(brandScales.map(s => s.id));
                      }}
                    >
                      Select All
                    </Button>
                    <Button
                      attention="low"
                      appearance="neutral"
                      size="small"
                      onPress={() => {
                        setIsSelectMode(false);
                        setSelectedBrandScaleIds([]);
                      }}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    attention="low"
                    appearance="neutral"
                    size="small"
                    onPress={() => setIsSelectMode(true)}
                  >
                    Select
                  </Button>
                )}
              </div>
            ) : undefined}
          >
            {brandScales.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
                {brandScales.map((scale) => {
                  const isBuiltInNeutral = scale.name.toLowerCase() === BUILT_IN_NEUTRAL_SCALE_NAME.toLowerCase();
                  const isSelected = selectedBrandScaleIds.includes(scale.id);
                  return (
                    <div
                      key={scale.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--Spacing-3-5)',
                        borderRadius: 'var(--Shape-3-5)',
                      }}
                    >
                      {/* Checkbox in select mode */}
                      {isSelectMode && (
                        <div
                          role="checkbox"
                          aria-checked={isSelected}
                          tabIndex={0}
                          onClick={() => setSelectedBrandScaleIds(prev =>
                            prev.includes(scale.id) ? prev.filter(id => id !== scale.id) : [...prev, scale.id]
                          )}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSelectedBrandScaleIds(prev =>
                                prev.includes(scale.id) ? prev.filter(id => id !== scale.id) : [...prev, scale.id]
                              );
                            }
                          }}
                          style={{
                            width: 'var(--Spacing-4-5)',
                            height: 'var(--Spacing-4-5)',
                            flexShrink: 0,
                            border: `var(--Stroke-XL) solid ${isSelected ? 'var(--Primary-Bold)' : 'var(--Border-Default)'}`,
                            borderRadius: 'var(--Shape-1-5)',
                            backgroundColor: isSelected ? 'var(--Primary-Bold)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          {isSelected && (
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6L5 9L10 3" stroke="var(--Primary-Bold-High)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                      )}
                      <div
                        style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                        onClick={() => isSelectMode
                          ? setSelectedBrandScaleIds(prev =>
                              prev.includes(scale.id) ? prev.filter(id => id !== scale.id) : [...prev, scale.id]
                            )
                          : handleEditBrandScale(scale.name)
                        }
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            isSelectMode
                              ? setSelectedBrandScaleIds(prev =>
                                  prev.includes(scale.id) ? prev.filter(id => id !== scale.id) : [...prev, scale.id]
                                )
                              : handleEditBrandScale(scale.name);
                          }
                        }}
                        title={isSelectMode ? `Select ${scale.name}` : `Edit ${scale.name} scale`}
                      >
                        <ColorScaleRow
                          name={scale.name}
                          steps={scale.steps}
                          baseStep={scale.baseStep}
                          source={scale.source}
                        />
                      </div>
                      {/* Three-dot menu */}
                      <div
                        ref={(el) => { if (openBrandScaleMenuId === scale.id) brandScaleMenuRef.current = el; }}
                        style={{ position: 'relative', flexShrink: 0 }}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <IconButton
                          attention="low"
                          appearance="neutral"
                          size="small"
                          aria-label={`Options for ${scale.name}`}
                          onPress={() => {
                            setExportMenuOpen(false); setOpenScaleMenuId(null); setCollectionMenuOpen(false);
                            setOpenBrandScaleMenuId(openBrandScaleMenuId === scale.id ? null : scale.id);
                          }}
                          icon={
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <circle cx="5" cy="12" r="2" />
                              <circle cx="12" cy="12" r="2" />
                              <circle cx="19" cy="12" r="2" />
                            </svg>
                          }
                        />
                        {openBrandScaleMenuId === scale.id && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '100%',
                              right: 0,
                              marginTop: 'var(--Spacing-2-5)',
                              backgroundColor: 'var(--Surface-Main)',
                              border: 'var(--Stroke-M) solid var(--Border-Subtle)',
                              borderRadius: 'var(--Shape-3-5)',
                              boxShadow: 'var(--Elevation-2)',
                              zIndex: MENU_Z_INDEX,
                              minWidth: 'var(--Spacing-40)',
                              padding: 'var(--Spacing-2-5)',
                            }}
                          >
                            <Button
                              attention="low"
                              appearance="neutral"
                              size="small"
                              leftIcon={<Icon name="edit" size="sm" />}
                              style={{ width: '100%', justifyContent: 'flex-start' }}
                              onPress={() => { handleEditBrandScale(scale.name); setOpenBrandScaleMenuId(null); }}
                            >
                              Edit
                            </Button>
                            {!isBuiltInNeutral && (
                              <Button
                                attention="low"
                                size="small"
                                appearance="negative"
                                leftIcon={<Icon name="remove" size="sm" />}
                                style={{ width: '100%', justifyContent: 'flex-start' }}
                                onPress={() => { handleRemoveFromBrand(scale.name); setOpenBrandScaleMenuId(null); }}
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Bulk selection action bar */}
                {selectedBrandScaleIds.length > 0 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--Spacing-3-5)',
                    padding: 'var(--Spacing-3-5) var(--Spacing-4)',
                    backgroundColor: 'var(--Neutral-Subtle)',
                    borderRadius: 'var(--Shape-3-5)',
                    marginTop: 'var(--Spacing-2-5)',
                  }}>
                    <span style={{ flex: 1, fontSize: 'var(--Label-XS-FontSize)', color: 'var(--Text-Medium)' }}>
                      {selectedBrandScaleIds.length} selected
                    </span>
                    <Button
                      attention="low"
                      size="small"
                      onPress={() => { setSelectedBrandScaleIds([]); setIsSelectMode(false); }}
                    >
                      Clear
                    </Button>
                    <Button
                      attention="low"
                      size="small"
                      appearance="negative"
                      leftIcon={<Icon name="remove" size="sm" />}
                      onPress={() => {
                        const names = brandScales
                          .filter(s => selectedBrandScaleIds.includes(s.id))
                          .map(s => s.name);
                        handleBulkRemoveFromBrand(names);
                        setSelectedBrandScaleIds([]);
                        setIsSelectMode(false);
                      }}
                    >
                      Delete selected
                    </Button>
                  </div>
                )}

              </div>
            ) : (
              <div style={{ padding: 'var(--Spacing-5)', textAlign: 'center', color: 'var(--Text-Low)' }}>
                <p style={{ marginBottom: 'var(--Spacing-4)' }}>No scales added yet.</p>
                <p style={{ fontSize: 'var(--Typography-Size-S)' }}>
                  Go to <strong>Preset Scales</strong> or <strong>Custom Scales</strong> to add scales to your brand.
                </p>
              </div>
            )}
          </FoundationCard>
        )}

        {/* Preset Scales Tab */}
        {activeTab === 'preset' && (
          <>
            {presetCollections && presetCollections.length > 0 ? (
              <FoundationCard
                title="Select Preset Scales"
                description="Choose scales from an uploaded collection and add them to your brand."
              >
                {/* Collection dropdown with delete button */}
                <div style={{ marginBottom: 'var(--Spacing-4)' }}>
                  <label style={{ display: 'block', fontSize: 'var(--Label-XS-FontSize)', color: 'var(--Text-Medium)', marginBottom: 'var(--Spacing-3)' }}>
                    Collection
                  </label>
                  <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', alignItems: 'center' }}>
                    <Select
                      value={viewingCollectionId || ''}
                      onChange={(value) => {
                        setViewingCollectionId(value);
                        setSelectedPresetScales([]);
                        setPresetSectionExpanded(true);
                      }}
                      options={presetCollections.map((c) => ({
                        value: c._id.toString(),
                        label: `${c.name} ${c.version}`,
                      }))}
                      size="md"
                      aria-label="Select collection"
                    />
                    {/* Three-dots menu */}
                    <div ref={collectionMenuRef} style={{ position: 'relative' }}>
                      <IconButton
                        attention="low"
                        appearance="neutral"
                        size="small"
                        onPress={() => {
                          setExportMenuOpen(false); setOpenScaleMenuId(null); setOpenBrandScaleMenuId(null);
                          setCollectionMenuOpen(!collectionMenuOpen);
                        }}
                        disabled={!viewingCollectionId}
                        aria-label="Collection options"
                        icon={
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="5" cy="12" r="2"></circle>
                            <circle cx="12" cy="12" r="2"></circle>
                            <circle cx="19" cy="12" r="2"></circle>
                          </svg>
                        }
                      />

                      {/* Dropdown menu */}
                      {collectionMenuOpen && (
                        <div
                          style={{
                            position: 'absolute',
                            top: '100%',
                            right: 0,
                            marginTop: 'var(--Spacing-2-5)',
                            backgroundColor: 'var(--Surface-Main)',
                            border: 'var(--Stroke-M) solid var(--Border-Subtle)',
                            borderRadius: 'var(--Shape-3-5)',
                            boxShadow: 'var(--Elevation-2)',
                            zIndex: MENU_Z_INDEX,
                            minWidth: 'var(--Spacing-40)',
                            padding: 'var(--Spacing-2-5)',
                          }}
                        >
                          {/* Rename option */}
                          <Button
                            attention="low"
                            appearance="neutral"
                            size="small"
                            onPress={startRenamingCollection}
                            leftIcon={<Icon name="edit" size="sm" />}
                            style={{ width: '100%', justifyContent: 'flex-start' }}
                          >
                            Rename
                          </Button>

                          {/* Export collection JSON option */}
                          <Button
                            attention="low"
                            appearance="neutral"
                            size="small"
                            onPress={() => {
                              if (viewingCollectionId) {
                                setExportCollectionId(viewingCollectionId);
                                setCollectionMenuOpen(false);
                              }
                            }}
                            leftIcon={<Icon name="download" size="sm" />}
                            style={{ width: '100%', justifyContent: 'flex-start' }}
                          >
                            Export collection JSON
                          </Button>

                          {/* Divider */}
                          <div style={{ height: 'var(--Stroke-M)', backgroundColor: 'var(--Border-Subtle)', margin: 'var(--Spacing-2-5) 0' }} />

                          {/* Delete option */}
                          <Button
                            attention="low"
                            size="small"
                            appearance="negative"
                            onPress={async () => {
                              if (!viewingCollectionId) return;
                              const collection = presetCollections.find(c => c._id.toString() === viewingCollectionId);
                              const confirmed = window.confirm(
                                `Are you sure you want to delete the collection "${collection?.name || 'Unknown'}"?\n\nThis will remove all scales in this collection and any brand selections using them. This action cannot be undone.`
                              );
                              if (confirmed) {
                                await deletePresetCollection({ collectionId: viewingCollectionId as Id<'presetColorScaleCollections'> });
                                const remaining = presetCollections.filter(c => c._id.toString() !== viewingCollectionId);
                                setViewingCollectionId(remaining.length > 0 ? remaining[0]._id.toString() : null);
                                setSelectedPresetScales([]);
                              }
                              setCollectionMenuOpen(false);
                            }}
                            leftIcon={<Icon name="delete" size="sm" />}
                            style={{ width: '100%', justifyContent: 'flex-start' }}
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rename dialog */}
                {isRenamingCollection && (
                  <div style={{
                    padding: 'var(--Spacing-4)',
                    backgroundColor: 'var(--Neutral-Subtle)',
                    borderRadius: 'var(--Shape-2)',
                    marginBottom: 'var(--Spacing-4)',
                  }}>
                    <div style={{ marginBottom: 'var(--Spacing-3-5)', fontWeight: 'var(--Label-FontWeight-Medium)', fontSize: 'var(--Body-S-FontSize)' }}>
                      Rename Collection
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', marginBottom: 'var(--Spacing-3-5)' }}>
                      <Input
                        type="text"
                        value={renameCollectionName}
                        onChange={(value) => setRenameCollectionName(value)}
                        placeholder="Collection name"
                        size="s"
                        style={{ flex: 2 }}
                      />
                      <Input
                        type="text"
                        value={renameCollectionVersion}
                        onChange={(value) => setRenameCollectionVersion(value)}
                        placeholder="Version"
                        size="s"
                        style={{ flex: 1 }}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', justifyContent: 'flex-end' }}>
                      <Button
                        attention="low"
                        size="small"
                        onPress={() => {
                          setIsRenamingCollection(false);
                          setRenameCollectionName('');
                          setRenameCollectionVersion('');
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        attention="high"
                        size="small"
                        onPress={handleRenameCollection}
                        disabled={!renameCollectionName.trim()}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                )}

                {/* Scale list */}
                {viewingCollection?.scales && viewingCollection.scales.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
                    {/* Sticky header with count, select all/none, and Add button */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 'var(--Spacing-3)',
                      position: 'sticky',
                      top: 'calc(-1 * var(--Spacing-6))',
                      backgroundColor: 'var(--Surface-Main)',
                      padding: 'calc(var(--Spacing-6) + var(--Spacing-3-5)) var(--Spacing-4-5) var(--Spacing-3-5) var(--Spacing-4-5)',
                      marginLeft: 'calc(-1 * var(--Spacing-4-5))',
                      marginRight: 'calc(-1 * var(--Spacing-4-5))',
                      zIndex: 10,
                      borderBottom: 'var(--Stroke-M) solid var(--Border-Subtle)',
                    }}>
                      <span style={{ fontSize: 'var(--Label-XS-FontSize)', color: 'var(--Text-Low)' }}>
                        Available scales ({viewingCollection.scales.length})
                        {selectedPresetScales.length > 0 && (
                          <span style={{ marginLeft: 'var(--Spacing-3-5)', color: 'var(--Text-Medium)' }}>
                            {selectedPresetScales.length} selected
                          </span>
                        )}
                      </span>
                      <div style={{ display: 'flex', gap: 'var(--Spacing-3)', alignItems: 'center' }}>
                        <Button
                          attention="low"
                          appearance="neutral"
                          size="small"
                          onPress={() => setSelectedPresetScales(viewingCollection.scales.filter(s => !isPresetInBrand(s.name)).map(s => s.name))}
                        >
                          Select All
                        </Button>
                        <Button
                          attention="low"
                          appearance="neutral"
                          size="small"
                          onPress={() => setSelectedPresetScales([])}
                          disabled={selectedPresetScales.length === 0}
                        >
                          Deselect All
                        </Button>
                      </div>
                    </div>

                    {viewingCollection.scales.map((scale) => {
                      const isSelected = selectedPresetScales.includes(scale.name);
                      const alreadyInBrand = isPresetInBrand(scale.name);
                      return (
                        <ColorScaleRow
                          key={scale._id.toString()}
                          name={scale.name}
                          steps={scale.steps.map(s => ({
                            step: s.step,
                            oklch: s.oklch, // Use OKLCH for accurate color display
                            hex: parseOklchToHex(s.oklch),
                            isBase: s.step === scale.baseStep,
                          }))}
                          baseStep={scale.baseStep}
                          isSelected={isSelected || alreadyInBrand}
                          onSelect={alreadyInBrand ? undefined : () => handlePresetScaleToggle(scale.name)}
                          showCheckbox
                          disabled={alreadyInBrand}
                        />
                      );
                    })}

                  </div>
                ) : (
                  <div style={{ padding: 'var(--Spacing-4-5)', color: 'var(--Text-Low)', textAlign: 'center' }}>
                    {!presetSectionExpanded
                      ? 'Click the dropdown above to load scales'
                      : viewingCollection === undefined
                        ? 'Loading scales...'
                        : 'No scales in this collection'}
                  </div>
                )}
              </FoundationCard>
            ) : (
              <FoundationCard
                title="No Collections Available"
                description="Upload a JSON color scale file to create a preset collection."
              >
                <div style={{ padding: 'var(--Spacing-4-5)', color: 'var(--Text-Low)', textAlign: 'center' }}>
                  No preset collections found. Upload one below.
                </div>
              </FoundationCard>
            )}

            {/* Upload collection */}
            <FoundationCard
              title="Upload Color Scale Collection"
              description="Upload a JSON file with preset color scales. The file must follow the 25-step OkLCH format."
              collapsible
              defaultCollapsed={presetCollections && presetCollections.length > 0}
            >
              <PresetColorScaleUploader
                onUpload={async (args) => {
                  const result = await uploadPresetCollection(args);
                  return {
                    collectionId: result.collectionId.toString(),
                    scaleCount: result.scaleCount,
                    scaleNames: result.scaleNames,
                  };
                }}
                onUploadComplete={(result) => {
                  setViewingCollectionId(result.collectionId);
                }}
              />
            </FoundationCard>
          </>
        )}

        {/* Custom Scales Tab */}
        {activeTab === 'custom' && (
          <>
            {/* Custom Scale List */}
            <FoundationCard
              title="Your Custom Scales"
              description="Create custom color scales. Each scale generates 25 steps from a base color."
              actions={customScalesActions}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3-5)' }}>
                {customScales.map((scale) => {
                  const isSelected = selectedCustomScaleId === scale.id;
                  const alreadyInBrand = isCustomInBrand(scale.name);
                  return (
                    <div key={scale.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-3-5)' }}>
                      <div style={{ flex: 1 }}>
                        <ColorScaleRow
                          name={scale.name}
                          steps={scale.scale?.steps.map(s => ({
                            step: s.step,
                            oklch: s.oklch, // Include OKLCH for accurate color display
                            hex: s.hex,
                            isBase: s.isBase,
                          })) || []}
                          baseStep={scale.scale?.config.baseStep}
                          isSelected={isSelected}
                          onSelect={() => setSelectedCustomScaleId(scale.id)}
                        />
                      </div>
                      {/* Action area — fixed width so all rows stay aligned */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--Spacing-2-5)',
                        justifyContent: 'flex-end',
                        minWidth: 'var(--Spacing-40)',
                        flexShrink: 0,
                      }}>
                        <Button
                          attention="low"
                          appearance="neutral"
                          size="small"
                          disabled={scale.name.toLowerCase() === BUILT_IN_NEUTRAL_SCALE_NAME.toLowerCase()}
                          onPress={scale.name.toLowerCase() !== BUILT_IN_NEUTRAL_SCALE_NAME.toLowerCase()
                            ? () => alreadyInBrand ? handleRemoveFromBrand(scale.name) : handleAddCustomToBrand(scale)
                            : undefined
                          }
                        >
                          {scale.name.toLowerCase() === BUILT_IN_NEUTRAL_SCALE_NAME.toLowerCase()
                            ? 'Built-in'
                            : alreadyInBrand
                              ? `In ${brandName}`
                              : `Add to ${brandName}`
                          }
                        </Button>

                        {/* Three-dot menu slot — always rendered so every row's actions stay
                            aligned; hidden (not removed) for the built-in Neutral scale. */}
                        <div
                          ref={(el) => { if (openScaleMenuId === scale.id) scaleMenuRef.current = el; }}
                          style={{
                            position: 'relative',
                            visibility: scale.name.toLowerCase() === BUILT_IN_NEUTRAL_SCALE_NAME.toLowerCase() ? 'hidden' : 'visible',
                          }}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <IconButton
                            attention="low"
                            appearance="neutral"
                            size="small"
                            onPress={() => {
                              setExportMenuOpen(false); setOpenBrandScaleMenuId(null); setCollectionMenuOpen(false);
                              setOpenScaleMenuId(openScaleMenuId === scale.id ? null : scale.id);
                            }}
                            aria-label={`Options for ${scale.name}`}
                            icon={
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="5" cy="12" r="2" />
                                <circle cx="12" cy="12" r="2" />
                                <circle cx="19" cy="12" r="2" />
                              </svg>
                            }
                          />
                          {openScaleMenuId === scale.id && (
                            <div style={{
                              position: 'absolute',
                              top: '100%',
                              right: 0,
                              marginTop: 'var(--Spacing-2-5)',
                              backgroundColor: 'var(--Surface-Main)',
                              border: 'var(--Stroke-M) solid var(--Border-Subtle)',
                              borderRadius: 'var(--Shape-3-5)',
                              boxShadow: 'var(--Elevation-2)',
                              zIndex: MENU_Z_INDEX,
                              minWidth: 'var(--Spacing-40)',
                              padding: 'var(--Spacing-2-5)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 'var(--Spacing-1-5)',
                            }}>
                              {/* Scale-name header */}
                              <div style={{
                                padding: 'var(--Spacing-1-5) var(--Spacing-2-5)',
                                fontSize: 'var(--Label-XS-FontSize)',
                                lineHeight: 'var(--Label-XS-LineHeight)',
                                fontWeight: 'var(--Label-FontWeight-Medium)',
                                fontFamily: 'var(--Typography-Font-Primary)',
                                color: 'var(--Text-Low)',
                                textTransform: 'capitalize',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                borderBottom: 'var(--Stroke-M) solid var(--Border-Subtle)',
                                marginBottom: 'var(--Spacing-1)',
                              }} title={scale.name}>
                                {scale.name}
                              </div>
                              <Button
                                attention="low"
                                size="small"
                                appearance="negative"
                                onPress={() => {
                                  handleRemoveCustomScale(scale.id);
                                  setOpenScaleMenuId(null);
                                }}
                                leftIcon={<Icon name="delete" size="sm" />}
                                style={{ width: '100%', justifyContent: 'flex-start' }}
                              >
                                Delete
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Add scale form (opened from the "Create new custom scale" action
                    in the page header) */}
                {showAddScaleForm && (
                  <>
                    {/* Edge-to-edge divider — negative margins cancel FoundationCard's --Spacing-4-5 padding */}
                    <div style={{
                      height: 'var(--Stroke-M)',
                      backgroundColor: 'var(--Border-Subtle)',
                      marginLeft: 'calc(-1 * var(--Spacing-4-5))',
                      marginRight: 'calc(-1 * var(--Spacing-4-5))',
                      marginBottom: 'var(--Spacing-4)',
                    }} />

                    <div style={{
                      display: 'flex',
                      gap: 'var(--Spacing-3-5)',
                      alignItems: 'flex-end',
                    }}>
                    <div style={{ flex: 1 }}>
                      <InputField
                        label="Scale Name"
                        type="text"
                        value={newScaleName}
                        onChange={(value) => setNewScaleName(value)}
                        placeholder="e.g., accent, brand"
                        size="s"
                      />
                    </div>

                    {/* Base Color — label tokens match InputField exactly (--Label-S-FontSize, --Text-High, gap --Spacing-1) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-1)' }}>
                      <label style={{
                        fontSize: 'var(--Label-S-FontSize)',
                        lineHeight: 'var(--Label-S-LineHeight)',
                        fontWeight: 'var(--Label-FontWeight-Medium)',
                        color: 'var(--Text-High)',
                        fontFamily: 'var(--Label-FontFamily, var(--Typography-Font-Text))',
                        minHeight: 'var(--Spacing-5)',
                        display: 'flex',
                        alignItems: 'center',
                      }}>
                        Base Color
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-2-5)' }}>
                        {/* Hidden native picker */}
                        <input
                          ref={colorPickerRef}
                          type="color"
                          value={newScaleColor}
                          onChange={(e) => setNewScaleColor(e.target.value)}
                          style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
                          tabIndex={-1}
                        />
                        {/* Clickable swatch — wider rectangle, same height as Input small */}
                        <div
                          onClick={() => colorPickerRef.current?.click()}
                          style={{
                            width: 'var(--Spacing-6)',
                            height: 'var(--Spacing-5)',
                            backgroundColor: newScaleColor,
                            borderRadius: 'var(--Shape-3)',
                            border: 'var(--Stroke-M) solid var(--Border-Subtle)',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                        />
                        {/* Hex text input — primary entry */}
                        <Input
                          type="text"
                          value={newScaleColor}
                          onChange={(value) => {
                            const hex = value.startsWith('#') ? value : `#${value}`;
                            if (/^#[0-9a-fA-F]{0,6}$/.test(hex)) setNewScaleColor(hex);
                          }}
                          placeholder="#FF5500"
                          size="s"
                          style={{ width: '96px' }}
                        />
                      </div>
                    </div>

                    <Button
                      attention="low"
                      size="small"
                      onPress={() => { setShowAddScaleForm(false); setNewScaleName(''); }}
                    >
                      Cancel
                    </Button>
                    <Button
                      attention="high"
                      size="small"
                      onPress={handleAddCustomScale}
                      disabled={!newScaleName.trim()}
                    >
                      Create
                    </Button>
                  </div>

                  {/* Accessibility preview — shows how on-colour text will read on the chosen
                      base color. The text color follows WCAG (auto black/white), not always white,
                      so the user sees the real contrast + ratio before creating the scale. */}
                  {/^#[0-9a-fA-F]{6}$/.test(newScaleColor) && (() => {
                    const onColor = getContrastText(newScaleColor);
                    const ratio = getContrastRatioHex(newScaleColor, onColor);
                    const passAA = ratio >= 4.5;
                    const passAAA = ratio >= 7;
                    return (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--Spacing-3-5)',
                        marginTop: 'var(--Spacing-3-5)',
                      }}>
                        <div style={{
                          flex: 1,
                          minWidth: 0,
                          backgroundColor: newScaleColor,
                          color: onColor,
                          borderRadius: 'var(--Shape-3)',
                          border: 'var(--Stroke-M) solid var(--Border-Subtle)',
                          padding: 'var(--Spacing-3) var(--Spacing-3-5)',
                          fontSize: 'var(--Body-S-FontSize)',
                          lineHeight: 'var(--Body-S-LineHeight)',
                          fontFamily: 'var(--Typography-Font-Primary)',
                          fontWeight: 'var(--Body-FontWeight-Medium)',
                          display: 'flex',
                          alignItems: 'baseline',
                          gap: 'var(--Spacing-2-5)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          <span style={{ fontSize: 'var(--Title-M-FontSize)', fontWeight: 'var(--Body-FontWeight-High)' }}>Aa</span>
                          <span>The quick brown fox</span>
                        </div>
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                          gap: 'var(--Spacing-1-5)',
                          flexShrink: 0,
                        }}>
                          <span style={{
                            fontSize: 'var(--Label-XS-FontSize)',
                            lineHeight: 'var(--Label-XS-LineHeight)',
                            fontFamily: 'var(--Typography-Font-Primary)',
                            color: 'var(--Text-Medium)',
                          }}>
                            {onColor === '#000000' ? 'Black text' : 'White text'} · {ratio.toFixed(2)}:1
                          </span>
                          <div style={{ display: 'flex', gap: 'var(--Spacing-1-5)' }}>
                            <Badge appearance={passAA ? 'positive' : 'negative'} size="s">
                              {passAA ? 'AA' : 'AA fail'}
                            </Badge>
                            {passAAA && <Badge appearance="positive" size="s">AAA</Badge>}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  </>
                )}
              </div>
            </FoundationCard>

            {/* Scale Editor */}
            {selectedCustomScale && (
              <FoundationCard
                title={`Edit: ${selectedCustomScale.name}`}
                description="Configure base color - the scale will auto-generate 25 steps."
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
                  {/* Scale name with rename — inline --Button-textColor forces contrast regardless
                      of brand CSS injection; --Text-High cascades to the name span */}
                  <Surface
                    mode="bold"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--Spacing-3-5)',
                      padding: 'var(--Spacing-3-5)',
                      backgroundColor: selectedCustomScale.baseColor,
                      borderRadius: 'var(--Shape-2)',
                      ['--Button-textColor' as string]: getContrastText(selectedCustomScale.baseColor),
                      ['--Button-borderColor' as string]: getContrastText(selectedCustomScale.baseColor),
                    }}
                  >
                    {isRenaming ? (
                      <Input
                        type="text"
                        value={selectedCustomScale.name}
                        onChange={(value) => handleScaleNameChange(value)}
                        onBlur={() => setIsRenaming(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setIsRenaming(false)}
                        size="s"
                        style={{ flex: 1 }}
                      />
                    ) : (
                      <span
                        style={{
                          flex: 1,
                          fontSize: 'var(--Typography-Size-M)',
                          fontWeight: 'var(--Body-FontWeight-High)',
                          color: getContrastText(selectedCustomScale.baseColor),
                          cursor: 'pointer',
                        }}
                        onClick={() => setIsRenaming(true)}
                      >
                        {selectedCustomScale.name}
                      </span>
                    )}
                    <Button
                      attention="low"
                      appearance="neutral"
                      size="small"
                      onPress={() => setIsRenaming(true)}
                    >
                      Rename
                    </Button>
                  </Surface>

                  {/* Input mode toggle - Hex, Hue/Chroma, Lightness */}
                  <ToggleGroup
                    variant="subtool"
                    size="compact"
                    value={(showLightnessScale || showFadeAdjustment) ? 'lightness' : inputMode === 'sliders' ? 'sliders' : 'hex'}
                    onValueChange={(val) => {
                      const value = Array.isArray(val) ? val[0] : val;
                      if (value === 'hex') { setInputMode('hex'); setShowFadeAdjustment(false); setShowLightnessScale(false); }
                      else if (value === 'sliders') { setInputMode('sliders'); setShowFadeAdjustment(false); setShowLightnessScale(false); }
                      else if (value === 'lightness') { setShowLightnessScale(true); setShowFadeAdjustment(true); }
                    }}
                  >
                    <ToggleGroup.Item value="hex">Hex Color</ToggleGroup.Item>
                    <ToggleGroup.Item value="sliders">Hue / Chroma</ToggleGroup.Item>
                    <ToggleGroup.Item value="lightness">Lightness</ToggleGroup.Item>
                  </ToggleGroup>

                  {/* Hex color input */}
                  {inputMode === 'hex' && !showFadeAdjustment && !showLightnessScale && (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {/* Lock base color toggle — when ON, sliders (hue/chroma)
                          treat the slider value as a cap for non-base steps and
                          leave the base step's OkLCH/hex untouched. */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 'var(--Spacing-4)',
                          marginBottom: 'var(--Spacing-4)',
                          padding: 'var(--Spacing-3-5) var(--Spacing-4)',
                          backgroundColor: 'var(--Neutral-Minimal)',
                          borderRadius: 'var(--Shape-2)',
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2)', minWidth: 0 }}>
                          <span style={{ fontSize: 'var(--Label-S-FontSize)', lineHeight: 'var(--Label-S-LineHeight)', fontWeight: 'var(--Label-FontWeight-Medium)', color: 'var(--Text-High)', fontFamily: 'var(--Label-FontFamily, var(--Typography-Font-Text))' }}>
                            Lock base color
                          </span>
                          <span style={{ fontSize: 'var(--Label-XS-FontSize)', lineHeight: 'var(--Label-XS-LineHeight)', fontWeight: 'var(--Label-FontWeight-Low)', color: 'var(--Text-Medium)', fontFamily: 'var(--Label-FontFamily, var(--Typography-Font-Text))' }}>
                            When locked, Hue and Chroma sliders only shape the non-base steps — the base hex stays fixed.
                          </span>
                        </div>
                        <Switch
                          checked={selectedCustomScale.lockBase}
                          onCheckedChange={handleToggleLockBase}
                          size="s"
                        />
                      </div>

                      {/* Content row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-4-5)' }}>
                        {/* Color swatch */}
                        <input
                          type="color"
                          value={selectedCustomScale.baseColor}
                          onChange={(e) => handleBaseColorChange(e.target.value)}
                          style={{ width: '64px', height: '64px', borderRadius: 'var(--Shape-2)', border: 'var(--Stroke-XL) solid var(--Border-Subtle)', cursor: 'pointer', flexShrink: 0 }}
                        />

                        {/* Properties with consistent spacing */}
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--Spacing-7)' }}>
                          {/* Hex Value */}
                          <div>
                            <div style={{ fontSize: 'var(--Label-XS-FontSize)', color: 'var(--Text-Low)', marginBottom: 'var(--Spacing-2-5)' }}>Hex Value</div>
                            <Input
                              type="text"
                              value={selectedCustomScale.baseColor}
                              onChange={(value) => {
                                if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
                                  handleBaseColorChange(value);
                                }
                              }}
                              size="s"
                              style={{ width: '90px' }}
                            />
                          </div>

                          {selectedCustomScale.scale && (
                            <>
                              <div>
                                <div style={{ fontSize: 'var(--Label-XS-FontSize)', color: 'var(--Text-Low)', marginBottom: 'var(--Spacing-2-5)' }}>Base Step</div>
                                <div style={{ fontSize: 'var(--Typography-Size-L)', fontWeight: 'var(--Body-FontWeight-High)', color: 'var(--Text-High)' }}>{selectedCustomScale.scale.config.baseStep}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: 'var(--Label-XS-FontSize)', color: 'var(--Text-Low)', marginBottom: 'var(--Spacing-2-5)' }}>Lightness</div>
                                <div style={{ fontSize: 'var(--Typography-Size-L)', fontWeight: 'var(--Body-FontWeight-High)', color: 'var(--Text-High)' }}>{selectedCustomScale.scale.config.baseLightness.toFixed(1)}%</div>
                              </div>
                              <div>
                                <div style={{ fontSize: 'var(--Label-XS-FontSize)', color: 'var(--Text-Low)', marginBottom: 'var(--Spacing-2-5)' }}>Chroma</div>
                                <div style={{ fontSize: 'var(--Typography-Size-L)', fontWeight: 'var(--Body-FontWeight-High)', color: 'var(--Text-High)' }}>{(selectedCustomScale.lockBase && selectedCustomScale.lockedBaseOklch
                                  ? selectedCustomScale.lockedBaseOklch.c
                                  : selectedCustomScale.scale.config.chroma).toFixed(3)}</div>
                              </div>
                              <div>
                                <div style={{ fontSize: 'var(--Label-XS-FontSize)', color: 'var(--Text-Low)', marginBottom: 'var(--Spacing-2-5)' }}>Hue</div>
                                <div style={{ fontSize: 'var(--Typography-Size-L)', fontWeight: 'var(--Body-FontWeight-High)', color: 'var(--Text-High)' }}>{(selectedCustomScale.lockBase && selectedCustomScale.lockedBaseOklch
                                  ? selectedCustomScale.lockedBaseOklch.h
                                  : selectedCustomScale.scale.config.hue).toFixed(1)}°</div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Bottom divider */}
                      <div style={{ height: 'var(--Stroke-M)', backgroundColor: 'var(--Border-Subtle)', marginTop: 'var(--Spacing-4)' }} />
                    </div>
                  )}

                  {/* Hue/Chroma sliders */}
                  {inputMode === 'sliders' && !showFadeAdjustment && !showLightnessScale && selectedCustomScale.scale && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--Spacing-4-5)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2-5)' }}>
                          <SliderControl
                            label="Hue"
                            value={selectedCustomScale.scale.config.hue}
                            min={0}
                            max={360}
                            step={1}
                            unit="°"
                            onChange={handleHueChange}
                          />
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--Spacing-2-5)', marginTop: 'var(--Spacing-2-5)' }}>
                            {HUE_PRESETS.map((preset) => (
                              <Button
                                key={preset.name}
                                attention={isActiveHuePreset(preset.value) ? 'high' : 'low'}
                                appearance="neutral"
                                size="small"
                                onPress={() => handleHueChange(preset.value)}
                              >
                                {preset.name}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2-5)' }}>
                          {/* When locked, cap the chroma slider at the base's
                              own chroma so non-base steps can never exceed the
                              locked base (engine also enforces this). */}
                          <SliderControl
                            label={selectedCustomScale.lockBase ? 'Chroma (cap for non-base steps)' : 'Chroma'}
                            value={selectedCustomScale.scale.config.chroma}
                            min={0}
                            max={selectedCustomScale.lockBase && selectedCustomScale.lockedBaseOklch
                              ? Math.max(0.01, selectedCustomScale.lockedBaseOklch.c)
                              : 0.4}
                            step={0.01}
                            onChange={handleChromaChange}
                            formatValue={(v) => v.toFixed(2)}
                          />
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--Spacing-2-5)', marginTop: 'var(--Spacing-2-5)' }}>
                            {CHROMA_PRESETS
                              .filter((preset) => {
                                if (!selectedCustomScale.lockBase || !selectedCustomScale.lockedBaseOklch) return true;
                                // Hide presets above the lock cap — slightly
                                // exceeding is fine (we clamp), but presets
                                // that visibly match a value they can't reach
                                // are misleading.
                                return preset.value <= selectedCustomScale.lockedBaseOklch.c + 0.001;
                              })
                              .map((preset) => (
                                <Button
                                  key={preset.name}
                                  attention={isActiveChromaPreset(preset.value) ? 'high' : 'low'}
                                  appearance="neutral"
                                  size="small"
                                  onPress={() => handleChromaChange(preset.value)}
                                >
                                  {preset.name}
                                </Button>
                              ))}
                          </div>
                        </div>
                      </div>

                      {/* Chroma Retention Control */}
                      <div>
                        <div style={{
                          height: 'var(--Stroke-M)',
                          backgroundColor: 'var(--Border-Subtle)',
                          marginLeft: 'calc(-1 * var(--Spacing-4-5))',
                          marginRight: 'calc(-1 * var(--Spacing-4-5))',
                          marginBottom: 'var(--Spacing-4-5)',
                        }} />
                        <SliderControl
                          label="Chroma Retention at Extremes"
                          value={selectedCustomScale.chromaRetention * 100}
                          min={0}
                          max={100}
                          step={1}
                          unit="%"
                          description="Controls how much color saturation is retained at the dark and light ends of the scale."
                          onChange={(v) => handleChromaRetentionChange(v / 100)}
                        />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--Spacing-2-5)', marginTop: 'var(--Spacing-3)' }}>
                          {[
                            { name: 'None', value: 0 },
                            { name: 'Low', value: 0.25 },
                            { name: 'Medium', value: 0.5 },
                            { name: 'High', value: 0.75 },
                            { name: 'Maximum', value: 1 },
                          ].map((preset) => (
                            <Button
                              key={preset.name}
                              attention={Math.abs(selectedCustomScale.chromaRetention - preset.value) < 0.05 ? 'high' : 'low'}
                              appearance="neutral"
                              size="small"
                              onPress={() => handleChromaRetentionChange(preset.value)}
                            >
                              {preset.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Lightness scale (includes Lightness Offsets) */}
                  {(showLightnessScale || showFadeAdjustment) && (
                    <div>
                      {/* Top divider */}
                      <div style={{
                        height: 'var(--Stroke-M)',
                        backgroundColor: 'var(--Border-Subtle)',
                        marginLeft: 'calc(-1 * var(--Spacing-4-5))',
                        marginRight: 'calc(-1 * var(--Spacing-4-5))',
                        marginBottom: 'var(--Spacing-4-5)',
                      }} />
                      {/* Lightness Scale Editor */}
                      <div style={{ fontSize: 'var(--Label-XS-FontSize)', color: 'var(--Text-Medium)', marginBottom: 'var(--Spacing-3-5)' }}>
                        Define the lightness distribution for all 25 steps. Save your custom scales to reuse later.
                      </div>
                      <LightnessScaleEditor
                        config={lightnessScale}
                        onChange={handleLightnessScaleChange}
                        lightnessOffsets={selectedCustomScale.lightnessOffsets}
                        savedScales={savedLightnessScales?.map(s => ({
                          _id: s._id.toString(),
                          name: s.name,
                          description: s.description,
                          values: s.values,
                          createdAt: s.createdAt,
                          updatedAt: s.updatedAt,
                        })) || []}
                        onSaveScale={handleSaveLightnessScale}
                        onDeleteSavedScale={handleDeleteLightnessScale}
                      />

                      {/* Lightness Offsets - Fine-tuning */}
                      <div style={{ marginTop: 'var(--Spacing-4-5)' }}>
                        {/* Edge-to-edge divider */}
                        <div style={{
                          height: 'var(--Stroke-M)',
                          backgroundColor: 'var(--Border-Subtle)',
                          marginLeft: 'calc(-1 * var(--Spacing-4-5))',
                          marginRight: 'calc(-1 * var(--Spacing-4-5))',
                          marginBottom: 'var(--Spacing-4)',
                        }} />

                        <div style={{ fontSize: 'var(--Label-XS-FontSize)', fontWeight: 'var(--Label-FontWeight-Medium)', color: 'var(--Text-High)', marginBottom: 'var(--Spacing-3-5)' }}>
                          Fine-tune Lightness
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--Spacing-4)' }}>
                          {/* Dark Side Offset */}
                          <div>
                            <SliderControl
                              label="Dark Side"
                              value={selectedCustomScale.lightnessOffsets.dark}
                              min={-30}
                              max={30}
                              step={0.5}
                              description="Adjust steps toward black"
                              onChange={handleDarkOffsetChange}
                            />
                          </div>
                          {/* Light Side Offset */}
                          <div>
                            <SliderControl
                              label="Light Side"
                              value={selectedCustomScale.lightnessOffsets.light}
                              min={-30}
                              max={30}
                              step={0.5}
                              description="Adjust steps toward white"
                              onChange={handleLightOffsetChange}
                            />
                          </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--Spacing-3)', marginTop: 'var(--Spacing-3-5)' }}>
                          <Button
                            attention="low"
                            size="small"
                            onPress={() => {
                              handleDarkOffsetChange(0);
                              handleLightOffsetChange(0);
                            }}
                            disabled={selectedCustomScale.lightnessOffsets.dark === 0 && selectedCustomScale.lightnessOffsets.light === 0}
                          >
                            Reset to defaults
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* OKLCH Properties Table */}
                  {selectedCustomScale.scale && (
                    <div>
                      {/* Edge-to-edge divider */}
                      <div style={{
                        height: '1px',
                        backgroundColor: 'var(--Border-Subtle)',
                        marginLeft: 'calc(-1 * var(--Spacing-4-5))',
                        marginRight: 'calc(-1 * var(--Spacing-4-5))',
                        marginTop: 'var(--Spacing-4-5)',
                        marginBottom: 'var(--Spacing-4)',
                      }} />

                      {/* Base chroma info — right-aligned */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginBottom: 'var(--Spacing-3-5)',
                      }}>
                        <span style={{
                          fontSize: 'var(--Label-XS-FontSize)',
                          color: 'var(--Text-Low)',
                          fontWeight: 'var(--Label-FontWeight-Medium)',
                          fontFamily: 'var(--Label-FontFamily, var(--Typography-Font-Text))',
                        }}>
                          Base chroma: {(selectedCustomScale.lockBase && selectedCustomScale.lockedBaseOklch
                            ? selectedCustomScale.lockedBaseOklch.c
                            : selectedCustomScale.scale.config.chroma).toFixed(3)} (must be highest)
                        </span>
                      </div>

                      {/* Full-width table */}
                      <div style={{
                        border: 'var(--Stroke-M) solid var(--Border-Subtle)',
                        borderRadius: 'var(--Shape-2)',
                        overflow: 'hidden',
                        width: '100%',
                      }}>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'minmax(60px, 1fr) minmax(80px, 1fr) minmax(80px, 1fr) minmax(70px, 1fr) minmax(80px, 1fr) minmax(100px, 2fr)',
                          gap: 'var(--Stroke-M)',
                          backgroundColor: 'var(--Border-Subtle)',
                          fontSize: 'var(--Label-XS-FontSize)',
                          fontFamily: 'var(--Label-FontFamily, var(--Typography-Font-Text))',
                          width: '100%',
                        }}>
                          {/* Header */}
                          <div style={{ padding: 'var(--Spacing-3) var(--Spacing-3-5)', backgroundColor: 'var(--Neutral-Subtle)', fontWeight: 'var(--Body-FontWeight-High)', color: 'var(--Text-Medium)' }}>Step</div>
                          <div style={{ padding: 'var(--Spacing-3) var(--Spacing-3-5)', backgroundColor: 'var(--Neutral-Subtle)', fontWeight: 'var(--Body-FontWeight-High)', color: 'var(--Text-Medium)' }}>Lightness</div>
                          <div style={{ padding: 'var(--Spacing-3) var(--Spacing-3-5)', backgroundColor: 'var(--Neutral-Subtle)', fontWeight: 'var(--Body-FontWeight-High)', color: 'var(--Text-Medium)' }}>Chroma</div>
                          <div style={{ padding: 'var(--Spacing-3) var(--Spacing-3-5)', backgroundColor: 'var(--Neutral-Subtle)', fontWeight: 'var(--Body-FontWeight-High)', color: 'var(--Text-Medium)' }}>Hue</div>
                          <div style={{ padding: 'var(--Spacing-3) var(--Spacing-3-5)', backgroundColor: 'var(--Neutral-Subtle)', fontWeight: 'var(--Body-FontWeight-High)', color: 'var(--Text-Medium)' }}>Hex</div>
                          <div style={{ padding: 'var(--Spacing-3) var(--Spacing-3-5)', backgroundColor: 'var(--Neutral-Subtle)', fontWeight: 'var(--Body-FontWeight-High)', color: 'var(--Text-Medium)' }}>Swatch</div>

                          {/* Rows */}
                          {selectedCustomScale.scale.steps.map((step) => {
                            const isBase = step.isBase;
                            const hasHighestChroma = step.chroma >= selectedCustomScale.scale!.config.chroma - 0.001;
                            const chromaViolation = step.chroma > selectedCustomScale.scale!.config.chroma + 0.001;
                            const baseTextColor = getReadableTextColor(step.hex);

                            return (
                              <div key={step.step} style={{ display: 'contents' }}>
                                <div style={{
                                  padding: 'var(--Spacing-3) var(--Spacing-3-5)',
                                  backgroundColor: isBase ? step.hex : 'var(--Surface-Main)',
                                  color: isBase ? baseTextColor : 'var(--Text-High)',
                                  fontWeight: isBase ? 'var(--Body-FontWeight-High)' : 'var(--Body-FontWeight-Low)',
                                  fontFamily: 'monospace',
                                }}>
                                  {step.step}
                                  {isBase && <span style={{ marginLeft: 'var(--Spacing-2-5)' }}>★</span>}
                                </div>
                                <div style={{
                                  padding: 'var(--Spacing-3) var(--Spacing-3-5)',
                                  backgroundColor: isBase ? step.hex : 'var(--Surface-Main)',
                                  color: isBase ? baseTextColor : 'var(--Text-High)',
                                  fontFamily: 'monospace',
                                }}>
                                  {step.lightness.toFixed(1)}%
                                </div>
                                <div style={{
                                  padding: 'var(--Spacing-3) var(--Spacing-3-5)',
                                  backgroundColor: isBase ? step.hex : chromaViolation ? 'var(--Negative-Subtle)' : 'var(--Surface-Main)',
                                  color: isBase ? baseTextColor : chromaViolation ? 'var(--Negative-High)' : 'var(--Text-High)',
                                  fontFamily: 'monospace',
                                  fontWeight: hasHighestChroma ? 'var(--Body-FontWeight-High)' : 'var(--Body-FontWeight-Low)',
                                }}>
                                  {step.chroma.toFixed(3)}
                                  {chromaViolation && ' ⚠'}
                                </div>
                                <div style={{
                                  padding: 'var(--Spacing-3) var(--Spacing-3-5)',
                                  backgroundColor: isBase ? step.hex : 'var(--Surface-Main)',
                                  color: isBase ? baseTextColor : 'var(--Text-High)',
                                  fontFamily: 'monospace',
                                }}>
                                  {step.hue.toFixed(1)}°
                                </div>
                                <div style={{
                                  padding: 'var(--Spacing-3) var(--Spacing-3-5)',
                                  backgroundColor: isBase ? step.hex : 'var(--Surface-Main)',
                                  color: isBase ? baseTextColor : 'var(--Text-High)',
                                  fontFamily: 'monospace',
                                }}>
                                  {step.hex}
                                </div>
                                <div style={{
                                  padding: 'var(--Spacing-2-5)',
                                  backgroundColor: isBase ? step.hex : 'var(--Surface-Main)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}>
                                  <div style={{
                                    width: '100%',
                                    height: 'var(--Spacing-6)',
                                    backgroundColor: step.hex,
                                    borderRadius: 'var(--Shape-3)',
                                    border: isBase
                                      ? `var(--Stroke-XL) solid ${baseTextColor === '#000000' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.4)'}`
                                      : 'var(--Stroke-M) solid var(--Border-Subtle)',
                                  }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Legend */}
                        <div style={{
                          padding: 'var(--Spacing-3-5) var(--Spacing-4)',
                          borderTop: 'var(--Stroke-M) solid var(--Border-Subtle)',
                          backgroundColor: 'var(--Surface-Main)',
                          fontSize: 'var(--Label-2XS-FontSize)',
                          fontFamily: 'var(--Label-FontFamily, var(--Typography-Font-Text))',
                          color: 'var(--Text-Low)',
                          display: 'flex',
                          gap: 'var(--Spacing-4)',
                          flexWrap: 'wrap',
                        }}>
                          <span>★ = Base step</span>
                          <span>⚠ = Chroma exceeds base</span>
                          <span style={{ marginLeft: 'auto' }}>
                            25 steps · Base {selectedCustomScale.scale.config.baseStep} · Retention {(selectedCustomScale.chromaRetention * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </FoundationCard>
            )}
          </>
        )}
          </div>
          </>
        )}
      </div>


      {/* Auto-save indicator */}
      {isSaving && (
        <div
          style={{
            position: 'fixed',
            bottom: 'var(--Spacing-4-5)',
            right: 'var(--Spacing-4-5)',
            padding: 'var(--Spacing-3-5) var(--Spacing-4)',
            backgroundColor: 'var(--Surface-Bold)',
            color: 'var(--Text-OnBold-High)',
            borderRadius: 'var(--Shape-2)',
            fontSize: 'var(--Label-XS-FontSize)',
            opacity: 0.9,
            zIndex: 100,
          }}
        >
          Saving...
        </div>
      )}

      {/* Floating selection bar for preset scales */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 99,
          pointerEvents: 'none',
          padding: 'var(--Spacing-4)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--Spacing-4) var(--Spacing-4-5)',
            backgroundColor: 'var(--Surface-Bold)',
            borderRadius: 'var(--Shape-4-5)',
            boxShadow: 'var(--Elevation-Level-4)',
            maxWidth: '600px',
            margin: '0 auto',
            pointerEvents: 'auto',
            transform: activeTab === 'preset' && selectedPresetScales.length > 0 ? 'translateY(0)' : 'translateY(100px)',
            opacity: activeTab === 'preset' && selectedPresetScales.length > 0 ? 1 : 0,
            transition: 'transform 250ms ease-out, opacity 250ms ease-out',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-3-5)' }}>
            <span
              style={{
                width: 'var(--Spacing-4-5)',
                height: 'var(--Spacing-4-5)',
                backgroundColor: 'var(--Text-OnBold-High)',
                borderRadius: 'var(--Shape-2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--Label-XS-FontSize)',
                fontWeight: 'var(--Body-FontWeight-High)',
                color: 'var(--Surface-Bold)',
              }}
            >
              {selectedPresetScales.length}
            </span>
            <span style={{ fontSize: 'var(--Body-S-FontSize)', fontWeight: 'var(--Label-FontWeight-Medium)', color: 'var(--Text-OnBold-High)' }}>
              {selectedPresetScales.length === 1 ? 'scale selected' : 'scales selected'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)' }}>
            <Button
              attention="low"
              size="small"
              onPress={() => setSelectedPresetScales([])}
            >
              Clear
            </Button>
            <Button
              attention="high"
              size="small"
              onPress={handleAddPresetsToBrand}
            >
              Add to {brandName}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
