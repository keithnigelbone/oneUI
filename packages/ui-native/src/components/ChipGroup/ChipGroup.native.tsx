/**
 * ChipGroup.native.tsx — RN peer of packages/ui/src/components/ChipGroup/ChipGroup.tsx
 */

import React, { useMemo } from 'react';
import { ScrollView, Text, View, type ViewStyle } from 'react-native';
import { ChipGroupContext } from '../Chip/ChipContext';
import { ChipGroupSelectionContext } from './ChipGroupSelectionContext';
import {
  getChipGroupAccessibilityProps,
  getChipGroupNameAccessibilityProps,
  useChipGroupState,
  type ChipGroupProps,
} from './interface';
import { styles } from './ChipGroup.styles.native';

export function ChipGroup(props: ChipGroupProps): React.ReactElement {
  const {
    children,
    size,
    variant,
    appearance,
    disabled,
    style: styleProp,
    testID,
  } = props;

  const { selectedValues, toggleValue, orientation, wrap } = useChipGroupState(props);
  const containerA11y = getChipGroupAccessibilityProps(props);
  const nameA11y = getChipGroupNameAccessibilityProps(props);

  const layoutStyle: ViewStyle[] = [
    styles.group,
    orientation === 'vertical' ? styles.groupVertical : null,
    !wrap && orientation === 'horizontal' ? styles.groupNoWrap : null,
    styleProp,
  ].filter(Boolean) as ViewStyle[];

  const chipGroupContext = useMemo(
    () => ({ size, variant, appearance, disabled }),
    [appearance, disabled, size, variant],
  );

  const selectionContext = useMemo(
    () => ({ selectedValues, toggleValue }),
    [selectedValues, toggleValue],
  );

  const chipRow = <View style={layoutStyle}>{children}</View>;

  return (
    <ChipGroupContext.Provider value={chipGroupContext}>
      <ChipGroupSelectionContext.Provider value={selectionContext}>
        <View style={styles.root}>
          {nameA11y ? <Text {...nameA11y} style={styles.a11yGroupName} /> : null}
          <View {...containerA11y} testID={testID}>
            {!wrap && orientation === 'horizontal' ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.scrollRow}
              >
                {chipRow}
              </ScrollView>
            ) : (
              chipRow
            )}
          </View>
        </View>
      </ChipGroupSelectionContext.Provider>
    </ChipGroupContext.Provider>
  );
}

ChipGroup.displayName = 'ChipGroup';

export type { ChipGroupProps } from './interface';
