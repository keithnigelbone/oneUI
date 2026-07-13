/**
 * useSurfaceTokenVarsNew.ts
 *
 * Next-gen version of useSurfaceTokenVars — same interface, new algorithm.
 *
 * Computes surface token CSS custom properties from foundation data using
 * the relative-step algorithm. Returns vars ready for inline styles.
 *
 * Used by 13+ component showcase pages and the advanced editor.
 */

'use client';

import { useMemo } from 'react';
import {
  buildAvailableScales,
  computeInputHash,
  parseCSSDeclarationsToVars,
  type MultiRoleTokenSets,
} from '@oneui/shared/engine';
import {
  buildNewPaletteData,
  generateNewRootCSS,
  generateNewContextCSS,
  generateNewStepLookupCSS,
  resolveNewTokenSets,
  type NewPaletteData,
} from '../engine/computeNewStacking';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FoundationData = Record<string, any> | undefined | null;

export interface UseSurfaceTokenVarsNewOptions {
  /** Foundation data from useFoundationData() / getBrandOverviewData */
  foundationData: FoundationData;
  /** Theme to compute surfaces for */
  theme: 'light' | 'dark';
  /** When true, return the resolved token sets for editor previews */
  includeTokenSets?: boolean;
  /** When true, return the [data-surface] context CSS for injection */
  includeContextCSS?: boolean;
  /** When true, return the [data-surface-step] step-lookup CSS (the full
   *  per-step role-token remapping). Needed so nested <Surface> containers in a
   *  preview adapt their descendants' role colours — `contextCSS` alone only
   *  carries the focus/halo bits. */
  includeStepLookupCSS?: boolean;
}

export interface UseSurfaceTokenVarsNewResult {
  /** All role surface vars as inline-style-ready record */
  surfaceVars: Record<string, string>;
  /** List of configured appearance roles for this brand */
  configuredRoles: string[];
  /** Resolved multi-role token sets (only populated when includeTokenSets is true) */
  tokenSets: MultiRoleTokenSets | null;
  /** Surface context CSS blocks for [data-surface] remapping (only populated when includeContextCSS is true) */
  contextCSS: string | null;
  /** Step-keyed [data-surface-step] role remapping (only populated when includeStepLookupCSS is true) */
  stepLookupCSS: string | null;
}

export function useSurfaceTokenVarsNew({
  foundationData,
  theme,
  includeTokenSets = false,
  includeContextCSS = false,
  includeStepLookupCSS = false,
}: UseSurfaceTokenVarsNewOptions): UseSurfaceTokenVarsNewResult {
  const colorConfig = foundationData?.color?.config;
  const presetSelection = foundationData?.presetSelection;
  const appearanceConfig = foundationData?.appearanceConfig;

  // Convex hands down a freshly-allocated `foundationData` on every subscription
  // tick. Using the raw ref as a memo dep would invalidate `paletteHash` even
  // when content is identical. The sub-field deps + content hash are sufficient.
  const hasFoundation = foundationData != null;

  // Stable hash
  const paletteHash = useMemo(
    () => hasFoundation ? computeInputHash(colorConfig, appearanceConfig, presetSelection) : null,
    [hasFoundation, colorConfig, appearanceConfig, presetSelection],
  );

  // Memo 1 (theme-independent): Build scales → NewPaletteData
  const paletteData = useMemo((): NewPaletteData | null => {
    if (!hasFoundation) return null;
    const availableScales = buildAvailableScales(colorConfig, presetSelection);
    return buildNewPaletteData(availableScales, appearanceConfig);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paletteHash]);

  // Memo 2 (theme-dependent): Generate CSS vars
  const surfaceVars = useMemo((): Record<string, string> => {
    if (!paletteData) return {};
    const cssText = generateNewRootCSS(paletteData, theme);
    return parseCSSDeclarationsToVars(cssText);
  }, [paletteData, theme]);

  // Memo 3 (optional): Resolve full token sets for editor previews
  const tokenSets = useMemo((): MultiRoleTokenSets | null => {
    if (!includeTokenSets || !paletteData) return null;
    return resolveNewTokenSets(paletteData, theme);
  }, [includeTokenSets, paletteData, theme]);

  // Memo 4 (optional): Generate context CSS for [data-surface] remapping
  const contextCSS = useMemo((): string | null => {
    if (!includeContextCSS || !paletteData) return null;
    return generateNewContextCSS(paletteData, theme);
  }, [includeContextCSS, paletteData, theme]);

  // Memo 5 (optional): step-keyed [data-surface-step] role-remapping lookup.
  // This is what makes a nested <Surface> remap its descendants' role tokens
  // (--Primary-Bold, --Primary-Subtle, …) — without it, surfaces in a preview
  // show no context adaptation. Theme-agnostic (light+dark baked in).
  const stepLookupCSS = useMemo((): string | null => {
    if (!includeStepLookupCSS || !paletteData) return null;
    return generateNewStepLookupCSS(paletteData);
  }, [includeStepLookupCSS, paletteData]);

  // Configured roles
  const configuredRoles = useMemo<string[]>(() => {
    return paletteData?.configuredRoles ?? [];
  }, [paletteData]);

  return { surfaceVars, configuredRoles, tokenSets, contextCSS, stepLookupCSS };
}
