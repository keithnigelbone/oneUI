'use client';

/**
 * Sync the platform's active icon set from the brand's foundation data.
 */

import { useEffect, useState } from 'react';
import type { IconFoundationConfig, IconSetId, IconVariantPreference, MaterialStylePreference } from '@oneui/shared';

interface FoundationDataLike {
  icons?: { config?: IconFoundationConfig } | null;
}

interface UseIconSetSyncArgs {
  foundationData: FoundationDataLike | null | undefined;
  currentBrandId: string | undefined;
  iconSet: IconSetId;
  setIconSet: (set: IconSetId) => void;
  iconVariant: IconVariantPreference;
  setIconVariant: (variant: IconVariantPreference) => void;
  materialStyle: MaterialStylePreference;
  setMaterialStyle: (style: MaterialStylePreference) => void;
}

function applyIconFoundationConfig(
  config: IconFoundationConfig,
  iconSet: IconSetId,
  iconVariant: IconVariantPreference,
  materialStyle: MaterialStylePreference,
  setIconSet: (set: IconSetId) => void,
  setIconVariant: (variant: IconVariantPreference) => void,
  setMaterialStyle: (style: MaterialStylePreference) => void,
): void {
  if (config.selectedSet && config.selectedSet !== iconSet) {
    setIconSet(config.selectedSet);
  }
  const nextVariant = config.variant ?? 'outline';
  if (nextVariant !== iconVariant) {
    setIconVariant(nextVariant);
  }
  const nextMaterialStyle = config.materialStyle ?? 'outlined';
  if (nextMaterialStyle !== materialStyle) {
    setMaterialStyle(nextMaterialStyle);
  }
}

export function useIconSetSync({
  foundationData,
  currentBrandId,
  iconSet,
  setIconSet,
  iconVariant,
  setIconVariant,
  materialStyle,
  setMaterialStyle,
}: UseIconSetSyncArgs): void {
  const [lastSyncedBrandId, setLastSyncedBrandId] = useState<string | null>(null);

  useEffect(() => {
    if (currentBrandId !== lastSyncedBrandId) {
      if (foundationData?.icons?.config) {
        applyIconFoundationConfig(
          foundationData.icons.config,
          iconSet,
          iconVariant,
          materialStyle,
          setIconSet,
          setIconVariant,
          setMaterialStyle,
        );
        setLastSyncedBrandId(currentBrandId || null);
      } else if (foundationData !== undefined && !foundationData?.icons) {
        setIconSet('jio');
        setIconVariant('outline');
        setMaterialStyle('outlined');
        setLastSyncedBrandId(currentBrandId || null);
      }
    } else if (foundationData?.icons?.config) {
      applyIconFoundationConfig(
        foundationData.icons.config,
        iconSet,
        iconVariant,
        materialStyle,
        setIconSet,
        setIconVariant,
        setMaterialStyle,
      );
    }
  }, [
    foundationData,
    currentBrandId,
    lastSyncedBrandId,
    iconSet,
    iconVariant,
    materialStyle,
    setIconSet,
    setIconVariant,
    setMaterialStyle,
  ]);
}
