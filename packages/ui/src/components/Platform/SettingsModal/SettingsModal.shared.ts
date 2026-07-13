/**
 * SettingsModal.shared.ts
 *
 * Shared types and hooks for the Settings Modal
 */

'use client';

import { useMemo } from 'react';
import type { Brand } from '@oneui/shared';
import type { BrandPickerSubBrandConfig, BrandPickerSelection } from '../BrandPicker';

/** @deprecated Legacy persisted values are accepted only for migration. */
export type ThemeScope = 'preview' | 'scoped' | 'global';
export type DensityMode = 'compact' | 'default' | 'open';

export interface BrandDefaultsConfig {
  /** Current default brand name (display) */
  defaultBrandName?: string;
  /** Current default sub-brand name (display) */
  defaultSubBrandName?: string;
  /** All brands for the embedded picker */
  brands: Brand[];
  /** Sub-brand configs keyed by parentBrandId */
  subBrandConfigs: Record<string, BrandPickerSubBrandConfig[]>;
  /** Current default brand ID */
  defaultBrandId?: string;
  /** Current default sub-brand ID */
  defaultSubBrandId?: string | null;
  /** Called when user picks a new default brand via the embedded picker */
  onChange: (selection: BrandPickerSelection) => void;
  /** Clear the stored default */
  onClear: () => void;
}

export interface SubThemeOption {
  id: string | null;
  label: string;
  description?: string;
}

export interface SubThemeConfig {
  /** Active brand name shown as the theme source */
  brandName?: string;
  /** Current active sub-theme; null means the base brand theme */
  currentSubThemeId: string | null;
  /** Base brand option followed by available sub-themes */
  options: SubThemeOption[];
  /** Called when the live platform sub-theme changes */
  onChange: (subThemeId: string | null) => void;
}

export interface PlatformAccessConfig {
  /** Open the global Platform access page (typically closes the modal). */
  onManage: () => void;
  /** Optional override for the section description copy. */
  description?: string;
}

export interface SettingsModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Current theme — scopes dialog tokens to match platform theme */
  theme?: 'light' | 'dark';
  /** Active brand sub-theme selector */
  subTheme?: SubThemeConfig;
  /** Current density mode */
  density: DensityMode;
  /** Callback when density changes */
  onDensityChange: (density: DensityMode) => void;
  /** Brand defaults configuration (optional — omit if no user prefs system) */
  defaults?: BrandDefaultsConfig;
  /**
   * Owner-only platform-governance entry. When provided, renders a "Platform
   * access" section with an action that opens the global Platform access page.
   * Omit for users who can't manage platform tiers.
   */
  platformAccess?: PlatformAccessConfig;
}

export interface DensityOption {
  id: DensityMode;
  label: string;
  description: string;
}

export const DENSITY_OPTIONS: DensityOption[] = [
  {
    id: 'compact',
    label: 'Compact',
    description: 'Tighter spacing and smaller text for information-dense views.',
  },
  {
    id: 'default',
    label: 'Default',
    description: 'Balanced spacing and text size for general use.',
  },
  {
    id: 'open',
    label: 'Open',
    description: 'More breathing room and larger text for comfortable reading.',
  },
];

/**
 * Hook for Settings Modal accessibility and state
 */
export function useSettingsModalState() {
  const ariaProps = useMemo(
    () => ({
      role: 'dialog' as const,
      'aria-modal': true,
      'aria-labelledby': 'settings-modal-title',
    }),
    []
  );

  return { ariaProps };
}
