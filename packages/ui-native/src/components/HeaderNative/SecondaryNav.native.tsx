/**
 * SecondaryNav.native.tsx — Figma HeaderNative.SecondaryNav (2134:14646).
 *
 * Rendered when root Header has secondaryNav=true.
 */

import React from 'react';
import { View } from 'react-native';
import { useHeaderContext } from './HeaderContext';
import { getSecondaryNavAccessibilityProps, type SecondaryNavProps } from './interface';
import { styles } from './Header.styles.native';
import { collectHeaderItemElements, headerItemElementKey, warnIfHeaderItemChildrenDropped } from './Header.utils.native';

export function SecondaryNav(props: SecondaryNavProps): React.ReactElement | null {
  const {
    children,
    style,
    testID,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    accessibilityHint,
  } = props;

  const { secondaryNav } = useHeaderContext();
  const a11y = getSecondaryNavAccessibilityProps({
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    accessibilityHint,
  });

  if (!secondaryNav) return null;

  const items = collectHeaderItemElements(children);
  warnIfHeaderItemChildrenDropped(children, items);

  return (
    <View testID={testID} {...a11y} style={[styles.secondaryNav, style]}>
      <View style={styles.secondaryNavItems}>
        {items.map((child, index) => (
          <View key={headerItemElementKey(child.props.value, index)} style={styles.navItemMeasure}>
            {child}
          </View>
        ))}
      </View>
    </View>
  );
}
