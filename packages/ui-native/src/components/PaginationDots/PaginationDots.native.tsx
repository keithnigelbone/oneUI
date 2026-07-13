/**
 * PaginationDots.native.tsx
 *
 * RN peer of `packages/ui/src/components/PaginationDots/PaginationDots.tsx`.
 * Static layout (row, per-state dot dimensions, gap) lives in
 * `./PaginationDots.styles.native.ts`. Active / regular / edge paint
 * resolves at render from `useSurfaceTokens(appearance)`.
 */

import React from 'react';
import { Pressable, View, type ViewStyle } from 'react-native';
import {
  getPaginationDotReadOnlyAccessibilityProps,
  getPaginationDotTabAccessibilityProps,
  getPaginationDotsRootAccessibilityProps,
  usePaginationDotsState,
  type PaginationDotsProps,
} from './interface';
import { useSurfaceTokens, useSurfaceAppearance } from '../../theme';
import { styles, DOT_STYLE, HIT_AREA } from './PaginationDots.styles.native';

export function PaginationDots(props: PaginationDotsProps): React.ReactElement | null {
  const {
    count,
    activeIndex,
    defaultActiveIndex,
    onActiveIndexChange,
    loop,
    readOnly,
    appearance,
    style: styleProp,
    testID,
  } = props;

  const appearanceRole = appearance === 'auto' || !appearance ? 'primary' : appearance;
  const activeRole = useSurfaceTokens(appearanceRole);

  const surfaceAppearance = useSurfaceAppearance();
  const surfaceRole = useSurfaceTokens(surfaceAppearance ?? 'neutral');

  const { visibleDots, setActive } = usePaginationDotsState({
    count,
    activeIndex,
    defaultActiveIndex,
    onActiveIndexChange,
    loop,
    readOnly,
  });

  if (count <= 0) return null;
  const resolvedActive = visibleDots.find((d) => d.isActive)?.absIdx ?? 0;
  const rootA11y = getPaginationDotsRootAccessibilityProps(props, {
    readOnly: Boolean(readOnly),
    count,
    resolvedActive,
  });

  return (
    <View
      {...rootA11y}
      role={readOnly ? 'progressbar' : 'tablist'}
      aria-label={props['aria-label']}
      aria-valuemin={rootA11y['aria-valuemin']}
      aria-valuemax={rootA11y['aria-valuemax']}
      aria-valuenow={rootA11y['aria-valuenow']}
      style={[styles.row, styleProp as ViewStyle]}
      testID={testID}
    >
      {visibleDots.map((dot) => {
        const dotStyle = DOT_STYLE[dot.state];
        const activeColour = activeRole.surfaces.bold;
        const inactiveColour = surfaceRole.surfaces.subtle;
        const colour = dot.isActive ? activeColour : inactiveColour;
        const dotTestID = testID ? `${testID}-dot-${dot.absIdx}` : undefined;
        if (readOnly) {
          return (
            <View
              key={`${dot.slot}-${dot.absIdx}`}
              {...getPaginationDotReadOnlyAccessibilityProps()}
              testID={dotTestID}
              style={[dotStyle, { backgroundColor: colour }]}
            />
          );
        }
        const tabA11y = getPaginationDotTabAccessibilityProps(dot);
        return (
          <Pressable
            key={`${dot.slot}-${dot.absIdx}`}
            {...tabA11y}
            role="tab"
            aria-selected={tabA11y['aria-selected']}
            aria-label={tabA11y.accessibilityLabel}
            onPress={() => setActive(dot.absIdx)}
            hitSlop={HIT_AREA}
            testID={dotTestID}
            style={({ pressed }) => [
              dotStyle,
              {
                backgroundColor: pressed && !dot.isActive ? activeRole.content.tintedA11y : colour,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

export type { PaginationDotsProps } from './interface';
