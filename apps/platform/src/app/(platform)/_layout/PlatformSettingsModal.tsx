'use client';

/**
 * Wrapper around `<SettingsModal>` that owns the prefs-shaped `defaults`
 * computation: resolving brand/sub-brand display names from ids, plumbing
 * `onChange` / `onClear` to the user-preferences context.
 *
 * Kept in `_layout/` because the prefs shape is the platform-shell's
 * concern, not a generic Settings concern.
 */

import React from 'react';
import { SettingsModal, type BrandPickerSubBrandConfig } from '@oneui/ui/components/Platform';
import type { Brand } from '@oneui/shared';

interface UserPrefs {
  defaultBrandId?: string | null;
  defaultSubBrandId?: string | null;
}

interface PlatformSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  density: Parameters<typeof SettingsModal>[0]['density'];
  onDensityChange: Parameters<typeof SettingsModal>[0]['onDensityChange'];
  currentBrand: Brand | null;
  currentSubBrand: { id: string } | null;
  onSubThemeChange: (subThemeId: string | null) => void;
  prefs: UserPrefs | null | undefined;
  updatePref: (patch: Partial<UserPrefs>) => void;
  availableBrands: Brand[];
  allSubBrandConfigs: Record<string, BrandPickerSubBrandConfig[]>;
  /** Platform owners can open the global Platform access page from Settings. */
  canManagePlatformUsers?: boolean;
  /** Navigate to the Platform access page (and close the modal). */
  onManagePlatformUsers?: () => void;
}

export function PlatformSettingsModal({
  isOpen,
  onClose,
  theme,
  density,
  onDensityChange,
  currentBrand,
  currentSubBrand,
  onSubThemeChange,
  prefs,
  updatePref,
  availableBrands,
  allSubBrandConfigs,
  canManagePlatformUsers = false,
  onManagePlatformUsers,
}: PlatformSettingsModalProps): React.ReactElement {
  const subThemeOptions = currentBrand
    ? [
        {
          id: null,
          label: 'Base brand',
          description: currentBrand.name,
        },
        ...(allSubBrandConfigs[currentBrand.id] ?? []).map((subTheme) => ({
          id: subTheme.id,
          label: subTheme.name,
          description: 'Sub-theme',
        })),
      ]
    : [];

  return (
    <SettingsModal
      isOpen={isOpen}
      onClose={onClose}
      theme={theme}
      subTheme={
        currentBrand
          ? {
              brandName: currentBrand.name,
              currentSubThemeId: currentSubBrand?.id ?? null,
              options: subThemeOptions,
              onChange: onSubThemeChange,
            }
          : undefined
      }
      density={density}
      onDensityChange={onDensityChange}
      platformAccess={
        canManagePlatformUsers && onManagePlatformUsers
          ? { onManage: onManagePlatformUsers }
          : undefined
      }
      defaults={{
        defaultBrandName: prefs?.defaultBrandId
          ? availableBrands.find((b) => b.id === prefs.defaultBrandId)?.name
          : undefined,
        defaultSubBrandName: prefs?.defaultSubBrandId
          ? Object.values(allSubBrandConfigs)
              .flat()
              .find((v) => v.id === prefs.defaultSubBrandId)?.name
          : undefined,
        brands: availableBrands,
        subBrandConfigs: allSubBrandConfigs,
        defaultBrandId: prefs?.defaultBrandId ?? undefined,
        defaultSubBrandId: prefs?.defaultSubBrandId ?? undefined,
        onChange: (sel) => {
          updatePref({
            defaultBrandId: sel.brandId,
            defaultSubBrandId: sel.subBrandId,
          });
        },
        onClear: () => {
          updatePref({
            defaultBrandId: null,
            defaultSubBrandId: null,
          });
        },
      }}
    />
  );
}
