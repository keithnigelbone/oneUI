import { useEffect, useMemo } from 'react';
import {
  buildDefaultPlatformsConfig,
  type PlatformsFoundationConfig,
  type PlatformEntry,
} from '@oneui/shared';

export const LS_SOURCE = 'oneui-qa-playground-brand-source';
export const LS_BRAND_ID = 'oneui-qa-playground-convex-brand-id';
export const LS_SUB_BRAND_ID = 'oneui-qa-playground-sub-brand-id';
export const LS_THEME = 'oneui-qa-playground-theme';
export const LS_PLATFORM = 'oneui-qa-playground-platform';
export const LS_BREAKPOINT = 'oneui-qa-playground-breakpoint';
export const LS_DENSITY = 'oneui-qa-playground-density';

export type BrandSource = 'fixture' | 'convex';
export type ThemeChoice = 'light' | 'dark';

export type PlatformBreakpoint = {
  id: string;
  label: string;
  viewportWidth: number;
  isActive: boolean;
};

export function loadPersistedSource(): BrandSource {
  if (typeof window === 'undefined') return 'fixture';
  const raw = window.localStorage.getItem(LS_SOURCE);
  return raw === 'convex' ? 'convex' : 'fixture';
}

export function loadPersistedTheme(): ThemeChoice {
  if (typeof window === 'undefined') return 'light';
  const raw = window.localStorage.getItem(LS_THEME);
  return raw === 'dark' ? 'dark' : 'light';
}

export function loadPersistedBrandId(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(LS_BRAND_ID) ?? '';
}

export function loadPersistedSubBrandId(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(LS_SUB_BRAND_ID) ?? '';
}

export function loadPersistedPlatform(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(LS_PLATFORM) ?? '';
}

export function loadPersistedBreakpoint(): string {
  if (typeof window === 'undefined') return 'responsive';
  return window.localStorage.getItem(LS_BREAKPOINT) ?? 'responsive';
}

export function loadPersistedDensity(): string {
  if (typeof window === 'undefined') return 'default';
  return window.localStorage.getItem(LS_DENSITY) ?? 'default';
}

const DENSITY_LABELS: Record<string, string> = {
  compact: 'Compact',
  default: 'Default',
  open: 'Open',
};

export function densityLabel(density: string): string {
  return DENSITY_LABELS[density] ?? density;
}

/** Cascade platform / breakpoint / density when brand config changes (Storybook manager parity). */
export function useSyncPlatformGlobals({
  platformsConfig,
  platformId,
  breakpoint,
  density,
  setPlatformId,
  setBreakpoint,
  setDensity,
}: {
  platformsConfig: PlatformsFoundationConfig;
  platformId: string;
  breakpoint: string;
  density: string;
  setPlatformId: (id: string) => void;
  setBreakpoint: (value: string) => void;
  setDensity: (value: string) => void;
}) {
  const enabledPlatforms = useMemo(
    () => platformsConfig.platforms.filter((p: PlatformEntry) => p.isEnabled),
    [platformsConfig],
  );

  const selectedPlatform = useMemo(
    () =>
      enabledPlatforms.find((p) => p.id === platformId) ??
      enabledPlatforms.find((p) => p.id === platformsConfig.defaultPlatform) ??
      enabledPlatforms[0],
    [enabledPlatforms, platformId, platformsConfig.defaultPlatform],
  );

  const activeBreakpoints = useMemo(() => {
    if (!selectedPlatform?.breakpoints) return [];
    return selectedPlatform.breakpoints.filter((bp) => bp.isActive);
  }, [selectedPlatform]);

  const availableDensities = useMemo(() => {
    if (!selectedPlatform?.densityConfigs?.length) return ['compact', 'default', 'open'];
    return selectedPlatform.densityConfigs.map((dc) => dc.density);
  }, [selectedPlatform]);

  useEffect(() => {
    const platformIds = enabledPlatforms.map((p) => p.id);
    if (!platformId || !platformIds.includes(platformId)) {
      setPlatformId(platformsConfig.defaultPlatform || platformIds[0] || 'web');
    }

    if (!density || !availableDensities.includes(density)) {
      setDensity(platformsConfig.defaultDensity || 'default');
    }

    const activeBpValues = activeBreakpoints.map((bp) => String(bp.viewportWidth));
    const breakpointValid =
      breakpoint === 'responsive' || activeBpValues.includes(breakpoint);
    if (!breakpoint || !breakpointValid) {
      setBreakpoint(activeBpValues[0] ?? 'responsive');
    }
  }, [
    platformsConfig,
    enabledPlatforms,
    availableDensities,
    activeBreakpoints,
    platformId,
    breakpoint,
    density,
    setPlatformId,
    setBreakpoint,
    setDensity,
  ]);

  return {
    enabledPlatforms,
    selectedPlatform,
    activeBreakpoints,
    availableDensities,
  };
}

export function resolvePlatformsConfig(
  brandPlatforms: PlatformsFoundationConfig | undefined | null,
): PlatformsFoundationConfig {
  return brandPlatforms ?? buildDefaultPlatformsConfig();
}
