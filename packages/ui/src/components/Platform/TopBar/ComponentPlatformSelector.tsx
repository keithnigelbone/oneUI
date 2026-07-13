/**
 * ComponentPlatformSelector.tsx
 *
 * Dropdown for selecting a platform + breakpoint on component pages.
 * Loads platform and breakpoint data from Foundations config.
 * "Fluid" = no override (uses CSS clamp() for fluid scaling across all viewports).
 */

'use client';

import React, { useCallback, useMemo } from 'react';
import {
  Scaling,
} from '../icons';
import type {
  PlatformsFoundationConfig,
  PlatformEntry,
  PlatformBreakpoint,
  SemanticIconName,
} from '@oneui/shared';
import { Icon } from '../../../icons';
import { Select, type SelectOption } from '../../Select';
import styles from './ComponentPlatformSelector.module.css';

export interface ComponentPlatformSelectorProps {
  platformsConfig: PlatformsFoundationConfig | null;
  selectedPlatformId: string | null;
  selectedBreakpointId: string | null;
  onSelectionChange: (platformId: string | null, breakpointId: string | null) => void;
}

/**
 * Map platform IDs to semantic icon names. Resolved at render time through
 * the brand's selected icon set via `<Icon name="..." />` so icons always
 * match the brand's chosen pack (Jio, Lucide, Tabler, ...) instead of
 * hardcoding a single library.
 */
const PLATFORM_ICON_NAMES: Record<string, SemanticIconName> = {
  web: 'globe',
  'mobile-native': 'smartphone',
  'tablet-native': 'tablet',
  'desktop-native': 'monitor',
  'tv-native': 'tv',
  outdoor: 'bus',
  print: 'printer',
  // Legacy IDs — kept so legacy saved configs still render
  printA4: 'printer',
  printBusinessCard: 'printer',
};

const FLUID_VALUE = 'fluid';
const platformValue = (platformId: string) => `platform:${platformId}`;
const breakpointValue = (platformId: string, breakpointId: string) =>
  `breakpoint:${platformId}:${breakpointId}`;

/** Map a breakpoint label to a semantic icon name via simple heuristics */
function getBreakpointIconName(label: string): SemanticIconName {
  const lower = label.toLowerCase();
  if (lower.includes('mobile')) return 'smartphone';
  if (lower.includes('tablet')) return 'tablet';
  if (lower.includes('desktop') || lower.includes('laptop')) return 'monitor';
  if (lower.includes('tv')) return 'tv';
  if (lower.includes('a4') || lower.includes('a5') || lower.includes('print') || lower.includes('card')) return 'printer';
  if (lower.includes('bus')) return 'bus';
  if (lower.includes('billboard') || lower.includes('sign') || lower.includes('outdoor')) return 'billboard';
  return 'monitor';
}

export const ComponentPlatformSelector: React.FC<ComponentPlatformSelectorProps> = ({
  platformsConfig,
  selectedPlatformId,
  selectedBreakpointId,
  onSelectionChange,
}) => {
  // Get enabled platforms
  const enabledPlatforms = useMemo(() => {
    if (!platformsConfig) return [];
    return platformsConfig.platforms.filter((p: PlatformEntry) => p.isEnabled);
  }, [platformsConfig]);

  const value = selectedPlatformId
    ? selectedBreakpointId
      ? breakpointValue(selectedPlatformId, selectedBreakpointId)
      : platformValue(selectedPlatformId)
    : FLUID_VALUE;

  const options = useMemo<SelectOption<string>[]>(() => {
    const result: SelectOption<string>[] = [
      {
        value: FLUID_VALUE,
        label: 'Fluid',
        badge: 'all viewports',
        icon: <Scaling size={14} />,
      },
    ];

    for (const platform of enabledPlatforms) {
      const activeBreakpoints = platform.breakpoints.filter(
        (bp: PlatformBreakpoint) => bp.isActive
      );
      const platformIconName = PLATFORM_ICON_NAMES[platform.id] ?? 'monitor';

      if (activeBreakpoints.length === 0) {
        result.push({
          value: platformValue(platform.id),
          label: platform.label,
          badge: `${Math.round(platform.calculatedBaseSize)}px`,
          icon: <Icon name={platformIconName} size={14} />,
        });
        continue;
      }

      for (const bp of activeBreakpoints) {
        result.push({
          value: breakpointValue(platform.id, bp.id),
          label: `${platform.label} · ${bp.label}`,
          badge: `${bp.viewportWidth}px`,
          icon: <Icon name={getBreakpointIconName(bp.label)} size={14} />,
        });
      }
    }

    return result;
  }, [enabledPlatforms]);

  const handleChange = useCallback(
    (nextValue: string) => {
      if (nextValue === FLUID_VALUE) {
        onSelectionChange(null, null);
        return;
      }

      const [kind, platformId, breakpointId] = nextValue.split(':');
      if (kind === 'platform' && platformId) {
        onSelectionChange(platformId, null);
        return;
      }
      if (kind === 'breakpoint' && platformId && breakpointId) {
        onSelectionChange(platformId, breakpointId);
      }
    },
    [onSelectionChange]
  );

  return (
    <div className={styles.container}>
      <Select
        value={value}
        onChange={handleChange}
        options={options}
        size="sm"
        className={styles.trigger}
        aria-label="Select platform and breakpoint"
      />
    </div>
  );
};
