/**
 * Start / end / spinner slot wrapper — mirrors `.start` / `.end` / `.spinner`
 * in Button.module.css (fixed icon box + gap margin + clipped children).
 *
 * Two roles:
 *
 *   1. Publishes the slot's resolved icon side via `ComponentSlotIconContext`
 *      so a child `<Icon icon={glyph} />` (without an explicit `size`) picks
 *      up the right pixel size automatically.
 *   2. Establishes the surface context (`<Surface mode={…} appearance={…}>`)
 *      so a child `<Icon appearance={…}>` resolves its on-colour against
 *      the Button's variant — `bold` button → on-bold tokens, `subtle`
 *      button → on-subtle tokens, `ghost` → page-level tokens. The Surface
 *      paint is suppressed (Pressable already paints the button bg).
 */

import React, { type ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';
import type { SurfaceToken } from '@oneui/shared/engine';
import type { ComponentAppearance } from '@oneui/shared';
import { ComponentSlotIconContext } from '../../slots/ComponentSlotIconContext.native';
import { Surface } from '../../theme';

export interface ButtonSlotProps {
  side: 'start' | 'end';
  width: number;
  height: number;
  gap: number;
  /** Surface mode for the inner Icon's color resolution. Mirrors Button variant. */
  mode: SurfaceToken;
  /** Appearance role for the inner Surface — usually the Button's role. */
  appearance: ComponentAppearance;
  /**
   * Explicit icon tint colour — forwarded from the Button's `paint.text` so
   * design-system `<Icon>` components inside the slot use the same colour as
   * the Button label rather than re-resolving from surface tokens (which gives
   * `content.tintedA11y` at the Surface step, a tinted-light rather than the
   * pure-contrast `onBoldContent.high` that label text uses).
   */
  iconColor?: string;
  children: ReactNode;
  testID?: string;
}

export function ButtonSlot({
  side,
  width,
  height,
  gap,
  mode,
  appearance,
  iconColor,
  children,
  testID,
}: ButtonSlotProps): React.ReactElement {
  const marginStyle: ViewStyle =
    side === 'start' ? { marginRight: gap } : { marginLeft: gap };

  return (
    <ComponentSlotIconContext.Provider value={{ sizePx: width, color: iconColor }}>
      <Surface
        mode={mode}
        appearance={appearance}
        style={[
          {
            width,
            height,
            flexShrink: 0,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            backgroundColor: 'transparent',
          },
          marginStyle,
        ]}
        testID={testID}
      >
        <View style={{ width, height, alignItems: 'center', justifyContent: 'center' }}>
          {children}
        </View>
      </Surface>
    </ComponentSlotIconContext.Provider>
  );
}
