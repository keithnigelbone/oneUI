/**
 * TopBar.shared.ts
 *
 * Shared types and hooks for TopBar component and subcomponents
 */

import React from 'react';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  status: 'active' | 'draft' | 'deprecated';
  isSystem?: boolean;
}

export interface PlatformConfig {
  id: string;
  label: string;
  description: string;
  viewingDistance?: number;
  ppi?: number;
  pixelDensity?: number;
  baseSize?: number;
  scaleFactor?: number;
  hasTypography?: boolean;
  hasDimensions?: boolean;
}

export interface SubBrandOption {
  id: string;
  name: string;
  slug: string;
}

export interface TopBarProps {
  // Brand selection has moved to LeftNav logo (BrandPicker). These props
  // are kept temporarily for backward compat but no longer rendered.
  currentBrand?: Brand | null;
  availableBrands?: Brand[];
  currentTheme?: 'light' | 'dark';
  currentPlatform?: 'mobile' | 'tablet' | 'desktop' | 'tv';
  availablePlatforms?: PlatformConfig[];
  density?: 'compact' | 'default' | 'open';
  onBrandChange?: (brandId: string) => void;
  onThemeChange?: (theme: 'light' | 'dark') => void;
  onPlatformChange?: (platform: 'mobile' | 'tablet' | 'desktop' | 'tv') => void;
  onDensityChange?: (density: 'compact' | 'default' | 'open') => void;
  /** Optional slot for centered controls (e.g. Docs/Edit toggle) */
  center?: React.ReactNode;
  /** Optional slot for additional controls rendered in the trailing side of the header */
  trailing?: React.ReactNode;
}

export interface BrandSelectorProps {
  currentBrand: Brand | null;
  availableBrands: Brand[];
  onBrandChange: (brandId: string) => void;
}

export interface ThemeSelectorProps {
  currentTheme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
}

export interface PlatformSelectorProps {
  currentPlatform: 'mobile' | 'tablet' | 'desktop' | 'tv';
  density: 'compact' | 'default' | 'open';
  onPlatformChange: (platform: 'mobile' | 'tablet' | 'desktop' | 'tv') => void;
  onDensityChange: (density: 'compact' | 'default' | 'open') => void;
}

export function useTopBarState() {
  return {
    ariaProps: {
      role: 'banner',
    },
  };
}
