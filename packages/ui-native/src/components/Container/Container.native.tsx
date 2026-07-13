/**
 * Container.native.tsx
 *
 * RN peer of `packages/ui/src/components/Container/Container.tsx`. Static
 * variant styles live in `./Container.styles.native.ts`; the optional
 * `maxWidth` cap on the `fixed` variant flows through inline.
 *
 * Layout spacing props (`gap`, `padding*`) accept `NativeSpacingKey`s and are
 * resolved to px via `theme.spacing[key]` (see `resolveLayoutStyle`) so
 * consuming/generated screens stay token-only. Resolution is a no-op outside
 * `<OneUINativeThemeProvider>`.
 */

import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { getContainerAccessibilityProps, type ContainerProps } from './interface';
import { VARIANT_STYLE } from './Container.styles.native';
import { useOptionalOneUITheme } from '../../theme/SurfaceContext';
import { resolveLayoutStyle } from '../../utils/layoutStyle';

function parseMaxWidth(value: string | number | undefined): number | undefined {
  if (value == null) return undefined;
  if (typeof value === 'number') return value;
  const num = parseFloat(value);
  return Number.isFinite(num) ? num : undefined;
}

export function Container(props: ContainerProps): React.ReactElement {
  const { variant = 'fluid', maxWidth, children, style: styleProp, testID, ...layoutProps } = props;

  const theme = useOptionalOneUITheme();
  const base = VARIANT_STYLE[variant];
  const cap = variant === 'fixed' ? parseMaxWidth(maxWidth) : undefined;
  const widthOverride: ViewStyle | null = cap != null ? { maxWidth: cap } : null;
  const layout = resolveLayoutStyle(layoutProps, theme?.spacing);

  return (
    <View
      {...getContainerAccessibilityProps()}
      testID={testID}
      style={[base, widthOverride, layout, styleProp as ViewStyle]}
    >
      {children}
    </View>
  );
}

export type { ContainerProps } from './interface';
