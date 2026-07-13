/**
 * Icon (design-system, native).
 *
 * Native peer of `packages/ui/src/components/Icon/Icon.tsx` — the high-level
 * Figma Icon component. Color and pixel-size are handled INTERNALLY:
 *
 *   - `appearance` × `emphasis` → resolved on-colour via
 *     `useSurfaceTokens(appearance).content[emphasis]` against the
 *     surrounding `<Surface>` context. `emphasis` defaults to `'high'`,
 *     matching web's `useIconState`.
 *   - `size` (spacing index OR pixel number) → pixel value via
 *     `designIconSizePx` for tokens, used directly for numbers.
 *
 * Consumers therefore pass design-system primitives only:
 *
 *   <Icon icon="heart" appearance="primary" emphasis="tintedA11y" size="8" />
 *
 * No `color` — colour is determined by the role × emphasis × the surrounding
 * surface, exactly like the web variable-mode auto-resolution.
 *
 * The component delegates the actual glyph render to the universal resolver
 * at `packages/ui-native/src/icons/Icon.native.tsx` (which still accepts
 * `icon={Component}` and `name="…"` for callers that need the lower-level
 * API directly — but inside `@oneui/ui-native` we always go through this
 * design-system shell).
 *
 * Appearance fallback chain (mirrors web `useIconState`):
 *   props.appearance ?? slotParent ?? surfaceAppearance ?? 'neutral'
 *
 * `brand-bg` from `useSlotParentAppearance()` is folded to `'primary'`
 * because Icon has no `brand-bg` glyph scale (web parity).
 */

import React, { isValidElement, type ReactElement } from 'react';
import { View } from 'react-native';
import type { IconComponent, SemanticIconName } from '@oneui/shared';
import type { NativeSpacing } from '@oneui/shared/engine';
import { useSurfaceTokens, useOneUITheme, useSurfaceAppearance } from '../../theme';
import { useSlotParentAppearance } from '../../slots/SlotParentAppearanceContext.native';
import { useComponentSlotIconContext } from '../../slots/ComponentSlotIconContext.native';
import { Icon as IconResolver } from './IconResolver.native';
import { designIconSizePx } from './designIconSizing';
import {
  type DesignIconProps,
  type DesignIconSize,
  type IconAppearance,
  type IconEmphasis,
} from './interface';

export type { DesignIconProps as IconProps, DesignIconProps } from './interface';
export {
  ICON_SIZES,
  type DesignIconSize as IconSize,
  type IconAppearance,
  type IconEmphasis,
} from './interface';

function slotRoleToIconAppearance(
  role: ReturnType<typeof useSlotParentAppearance>
): IconAppearance | null {
  if (role === null) return null;
  if (role === 'brand-bg') return 'primary';
  return role as IconAppearance;
}

function resolvePixelSize(
  size: DesignIconSize | number | undefined,
  slotPx: number | undefined,
  spacing: NativeSpacing
): number {
  if (typeof size === 'number') return size;
  if (size !== undefined) return designIconSizePx(size, spacing);
  // Slot fallback — Button start/end, Avatar icon slot, etc. publish
  // their resolved icon side via `ComponentSlotIconContext` so callers can
  // write `<Icon icon={glyph} appearance="neutral" />` without picking a
  // size token at every callsite.
  if (slotPx !== undefined) return slotPx;
  return designIconSizePx('5', spacing);
}

export function Icon(props: DesignIconProps): ReactElement | null {
  const {
    icon,
    size,
    appearance: appearanceProp,
    emphasis: emphasisProp,
    style,
    'aria-label': ariaLabel,
    'aria-hidden': ariaHidden,
    testID,
  } = props;

  const slotParent = useSlotParentAppearance();
  const surfaceAppearance = useSurfaceAppearance();
  const slotIcon = useComponentSlotIconContext();
  const resolvedAppearance: IconAppearance =
    appearanceProp ??
    slotRoleToIconAppearance(slotParent) ??
    slotRoleToIconAppearance(surfaceAppearance) ??
    'neutral';

  const role = useSurfaceTokens(resolvedAppearance);
  const theme = useOneUITheme();
  const pixelSize = resolvePixelSize(size, slotIcon?.sizePx, theme.spacing);

  // Colour resolution — mirrors web's `--_icon-{emphasis}` cascade:
  //
  //   1. Explicit `emphasis` prop → always wins (web parity: `.high` /
  //      `.tinted` etc. set `color:` on the Icon itself, overriding any
  //      `currentColor` inherited from the parent Button).
  //   2. No emphasis + slot colour published (Button / Avatar / IconButton)
  //      → use slot colour. This is the native equivalent of web's
  //      `currentColor` inheritance from the parent's CSS `color:`.
  //   3. Default emphasis = `'high'` (web default) → `role.content.high`.
  const resolvedEmphasis: IconEmphasis = emphasisProp ?? 'tinted';
  const color =
    emphasisProp !== undefined
      ? role.content[resolvedEmphasis]
      : (slotIcon?.color ?? role.content[resolvedEmphasis]);

  // Accessibility ownership is centralized at the outer wrapper so all
  // rendering paths expose the same accessibility + testing surface.
  const isHidden = ariaHidden === true;
  const label = !isHidden ? ariaLabel : undefined;
  const isAccessible = !isHidden && Boolean(label);

  const accessibilityProps = {
    accessible: isAccessible,
    accessibilityRole: isAccessible ? 'image' : undefined,
    accessibilityLabel: label,
    accessibilityElementsHidden: isHidden || !label,
    importantForAccessibility: isHidden || !label ? 'no-hide-descendants' : 'yes',
  } as const;

  let content: React.ReactElement;

  if (isValidElement(icon)) {
    content = icon;
  } else if (typeof icon === 'function') {
    content = <IconResolver icon={icon as IconComponent} size={pixelSize} color={color} />;
  } else {
    content = <IconResolver name={icon as SemanticIconName} size={pixelSize} color={color} />;
  }

  return (
    <View
      testID={testID}
      style={[{ width: pixelSize, height: pixelSize }, style]}
      {...accessibilityProps}
    >
      <View
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        style={{ width: pixelSize, height: pixelSize }}
      >
        {content}
      </View>
    </View>
  );
}

Icon.displayName = 'Icon';

export default Icon;
