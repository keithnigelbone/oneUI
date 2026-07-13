/**
 * Icon slot wrapper — mirrors `.icon` in Avatar.module.css.
 *
 * Two roles:
 *
 *   1. Publishes the slot's resolved icon side via `ComponentSlotIconContext`
 *      so a child `<Icon icon={glyph} />` (without an explicit `size`) picks
 *      up the right pixel size automatically.
 *   2. Establishes the surface context (`<Surface mode={…} appearance={…}>`)
 *      so a child `<Icon appearance={…}>` resolves its on-colour against
 *      the Avatar's attention level — `high` → on-bold, `medium` → on-subtle,
 *      `low` → page-level. The Surface paint is suppressed (Avatar's outer
 *      View already paints the bg).
 */

import React, { type ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';
import type { SurfaceToken } from '@oneui/shared/engine';
import type { ComponentAppearance } from '@oneui/shared';
import { ComponentSlotIconContext } from '../../slots/ComponentSlotIconContext.native';
import { SlotParentAppearanceProvider, type SlotParentAppearance } from '../../slots/SlotParentAppearanceContext.native';
import { Surface } from '../../theme';
import { styles } from './Avatar.styles.native';

export interface AvatarIconSlotProps {
  metrics: ViewStyle;
  iconPixel: number;
  /** Surface mode for the child Icon's color resolution. Mirrors Avatar attention. */
  mode: SurfaceToken;
  /** Appearance role for the inner Surface — usually the Avatar's role. */
  appearance: ComponentAppearance;
  /** Explicit tint forwarded from Avatar paint for context-aware Icon children. */
  iconColor?: string;
  children: ReactNode;
}

export function AvatarIconSlot({
  metrics,
  iconPixel,
  mode,
  appearance,
  iconColor,
  children,
}: AvatarIconSlotProps): React.ReactElement {
  return (
    <ComponentSlotIconContext.Provider value={{ sizePx: iconPixel, color: iconColor }}>
      <SlotParentAppearanceProvider value={appearance as SlotParentAppearance}>
        <Surface
          mode={mode}
          appearance={appearance}
          style={[styles.iconWrap, metrics, { backgroundColor: 'transparent' }]}
        >
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {children}
          </View>
        </Surface>
      </SlotParentAppearanceProvider>
    </ComponentSlotIconContext.Provider>
  );
}
