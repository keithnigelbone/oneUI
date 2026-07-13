/**
 * Chip start/end slot wrapper — RN peer of Chip.module.css `.start` / `.end`.
 *
 * Publishes slot icon tint via `ComponentSlotIconContext` (native peer of web
 * `currentColor`), and provides `SlotParentAppearance` so nested leaves can
 * inherit the chip's accent role when their own `appearance` is unset.
 */

import React, { type ReactNode } from 'react';
import { View } from 'react-native';
import type { SurfaceToken } from '@oneui/shared/engine';
import type { NativeRoleTokens } from '../../theme';
import { Surface } from '../../theme';
import { ComponentSlotIconContext } from '../../slots/ComponentSlotIconContext.native';
import {
  SlotParentAppearanceProvider,
  type SlotParentAppearance,
} from '../../slots/SlotParentAppearanceContext.native';
import type { ChipVariant } from './interface';
import { styles } from './Chip.styles.native';

function resolveChipSlotIconColor(
  variant: ChipVariant,
  selected: boolean,
  role: NativeRoleTokens,
): string {
  if (selected && variant === 'bold') {
    return role.onBoldContent.tintedA11y;
  }
  return role.content.tintedA11y;
}

/** Mirrors web `slotSurface` on Chip start/end when selected. */
function resolveChipSlotSurface(
  variant: ChipVariant,
  selected: boolean,
): SurfaceToken | undefined {
  if (!selected) return undefined;
  if (variant === 'bold') return 'bold';
  if (variant === 'subtle') return 'subtle';
  return undefined;
}

export interface ChipSlotProps {
  side: 'start' | 'end';
  variant: ChipVariant;
  selected: boolean;
  /** Chip accent role for slot children (`secondary`, `primary`, …). */
  appearance: SlotParentAppearance;
  role: NativeRoleTokens;
  children: ReactNode;
}

export function ChipSlot({
  side,
  variant,
  selected,
  appearance,
  role,
  children,
}: ChipSlotProps): React.ReactElement {
  const iconColor = resolveChipSlotIconColor(variant, selected, role);
  const surfaceMode = resolveChipSlotSurface(variant, selected);
  const slotStyle = side === 'start' ? styles.slotStart : styles.slotEnd;

  const slotView = (
    <View style={slotStyle} importantForAccessibility="no-hide-descendants">
      {children}
    </View>
  );

  return (
    <ComponentSlotIconContext.Provider value={{ color: iconColor }}>
      <SlotParentAppearanceProvider value={appearance}>
        {surfaceMode != null ? (
          <Surface
            mode={surfaceMode}
            appearance={appearance}
            style={{ backgroundColor: 'transparent' }}
          >
            {slotView}
          </Surface>
        ) : (
          slotView
        )}
      </SlotParentAppearanceProvider>
    </ComponentSlotIconContext.Provider>
  );
}

