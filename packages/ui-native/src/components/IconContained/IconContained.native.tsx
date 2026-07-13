/**
 * IconContained.native.tsx
 *
 * RN peer of `packages/ui/src/components/IconContained/IconContained.tsx`.
 *
 * Behaviour:
 *   - Non-interactive media element (mirrors web `<span role="img">`).
 *   - Two attention levels:
 *     - `'high'`   → bold fill + on-bold tinted-a11y icon colour
 *     - `'medium'` → subtle fill + content tinted icon colour
 *   - Five sizes (`xs|s|m|l|xl`) — container + glyph sides come from
 *     `IconContained.styles.native.ts` (mirrors web `--IconContained-size-*`
 *     and `--IconContained-iconSize-*`).
 *   - Surface-context-aware: rendered inside `<Surface mode="…">` the
 *     `useSurfaceTokens` hook returns context-remapped tokens, so a `bold`
 *     fill stays distinguishable inside another bold container, etc.
 *   - Recipe-aware: `cornerRadius` decision overrides the default pill via
 *     `resolveRecipeBorderRadius(decisions, shape)`.
 *
 * Accessibility:
 *   - `accessibilityRole: 'image'` (mirrors web `role="img"`).
 *   - `accessibilityLabel` from `aria-label`. Without one the node is
 *     `accessible: false` (decorative).
 *   - `aria-hidden` removes the subtree from assistive tech entirely.
 *
 * Slot icon contract:
 *   - `icon` accepts a JDS / RN SVG component, a `ReactElement`, or a
 *     semantic name string. Strings emit a dev warning and render `null`
 *     (mirrors `Button.start` / `Avatar.icon`).
 *   - When `icon` is a component or element, it is wrapped in a
 *     `ComponentSlotIconContext.Provider` so nested `<Icon>` instances pick
 *     up `sizePx` + `color` automatically.
 */

import React, { isValidElement, type ReactElement } from 'react';
import { View, type ViewStyle } from 'react-native';
import type { IconComponent, SemanticIconName } from '@oneui/shared';
import { tokens } from '@oneui/tokens';
import {
  Surface,
  useComponentRecipe,
  useComponentTheme,
  useOneUITheme,
  resolveRecipeBorderRadius,
  resolveShapeBorderRadius,
  resolveShapeLanguageBorderRadius,
} from '../../theme';
import { Icon } from '../Icon';
import { asIconAppearance } from '../Icon/interface';
import {
  getIconContainedAccessibilityProps,
  useIconContainedState,
  type IconContainedAttention,
  type IconContainedProps,
} from './interface';
import {
  CONTAINER_SIZE,
  DISABLED_OPACITY,
  ICON_GLYPH_SIZE,
  styles,
} from './IconContained.styles.native';

/**
 * Map attention level → surface mode:
 *   high   → bold    (full accent fill, on-bold tokens for content)
 *   medium → subtle  (tinted fill, tinted content tokens)
 *
 * Surface paints itself with the role's `Bold` / `Subtle` token AND
 * sets up the `[data-surface]` cascade so `<Icon appearance={role}>`
 * inside resolves to the on-context tinted-A11y colour automatically.
 */
function modeFor(attention: IconContainedAttention): 'bold' | 'subtle' {
  return attention === 'high' ? 'bold' : 'subtle';
}

function resolveIconNode(
  icon: SemanticIconName | ReactElement | IconComponent,
  appearance: string,
  iconPx: number,
): React.ReactElement | null {
  if (isValidElement(icon)) {
    return icon;
  }
  if (typeof icon === 'function' || typeof icon === 'string') {
    return (
      <Icon
        icon={icon as IconComponent | SemanticIconName}
        appearance={asIconAppearance(appearance)}
        size={iconPx}
        aria-hidden
      />
    );
  }
  return null;
}

export function IconContained(props: IconContainedProps): React.ReactElement {
  const { icon, style: styleProp, testID } = props;
  const { resolvedSize, resolvedAttention, resolvedAppearance, isDisabled } =
    useIconContainedState(props);
  const { shape } = useOneUITheme();
  const recipeDecisions = useComponentRecipe('icon-contained');
  const recipeBorderRadius = resolveRecipeBorderRadius(recipeDecisions, shape);
  const componentTheme = useComponentTheme('icon-contained');

  const containerSide = CONTAINER_SIZE[resolvedSize];
  const iconPx = ICON_GLYPH_SIZE[resolvedSize];
  const a11y = getIconContainedAccessibilityProps(props, { isDisabled });

  const rootStyle: ViewStyle = {
    width: containerSide,
    height: containerSide,
    borderRadius:
      resolveShapeBorderRadius(componentTheme.tokenRefs?.borderRadius, shape) ??
      recipeBorderRadius ??
      resolveShapeLanguageBorderRadius(componentTheme.shapeLanguage, shape, 'actions') ??
      tokens.shape.Pill,
    overflow: 'hidden',
    opacity: isDisabled ? DISABLED_OPACITY : 1,
    pointerEvents: isDisabled ? 'none' : 'auto',
    ...(styleProp as ViewStyle),
  };

  return (
    <View {...a11y} testID={testID} style={[styles.root]}>
      <Surface
        mode={modeFor(resolvedAttention)}
        appearance={resolvedAppearance}
        style={[styles.iconWrap, rootStyle]}
      >
        {resolveIconNode(icon, resolvedAppearance, iconPx)}
      </Surface>
    </View>
  );
}

export type { IconContainedProps, IconContainedNativeProps } from './interface';
