/**
 * BottomNavigation.native.tsx — RN peer of BottomNavigation/BottomNavigation.tsx
 */

import React, { Children } from 'react';
import { View } from 'react-native';
import { Divider } from '../Divider/Divider.native';
import { BottomNavigationContext } from './BottomNavigationContext';
import {
  clampBottomNavigationChildren,
  getBottomNavigationAccessibilityProps,
  BOTTOM_NAVIGATION_MAX_ITEMS,
  useBottomNavigationState,
  type BottomNavigationProps,
} from './interface';
import { styles } from './BottomNavigation.styles.native';

export function BottomNavigation(props: BottomNavigationProps): React.ReactElement {
  const {
    children,
    showDivider = true,
    style: styleProp,
    testID,
  } = props;

  const { contextValue } = useBottomNavigationState(props);
  const a11y = getBottomNavigationAccessibilityProps(props);
  const itemCount = Children.count(children);
  const navigationItems = clampBottomNavigationChildren(children);

  if (process.env.NODE_ENV !== 'production') {
    if (itemCount > BOTTOM_NAVIGATION_MAX_ITEMS) {
      // eslint-disable-next-line no-console
      console.warn(
        `BottomNavigation: received ${itemCount} items — the design system supports up to ${BOTTOM_NAVIGATION_MAX_ITEMS}. Only the first ${BOTTOM_NAVIGATION_MAX_ITEMS} are rendered.`,
      );
    }
    if (!props['aria-label']) {
      // eslint-disable-next-line no-console
      console.warn('BottomNavigation: `aria-label` is required for the navigation landmark.');
    }
  }

  return (
    <BottomNavigationContext.Provider value={contextValue}>
      <View
        accessible={a11y.accessible}
        accessibilityRole={a11y.accessibilityRole}
        accessibilityLabel={a11y.accessibilityLabel}
        accessibilityHint={a11y.accessibilityHint}
        style={[styles.root, styleProp]}
        testID={testID}
      >
        {showDivider ? (
          <View style={styles.dividerBleed}>
            <Divider orientation="horizontal" size="s" />
          </View>
        ) : null}
        <View style={styles.itemList}>{navigationItems}</View>
      </View>
    </BottomNavigationContext.Provider>
  );
}

export type { BottomNavigationProps } from './interface';
