/**
 * Pagination.native.tsx — composite numbered navigator (peer of Pagination.tsx).
 */

import React, { useMemo } from 'react';
import { Text, View, type ViewStyle } from 'react-native';
import { IconSizeValues } from '@oneui/shared';
import {
  getPaginationContainerAccessibilityProps,
  getPaginationEllipsisAccessibilityProps,
  getPaginationLiveRegionProps,
  getPaginationNameAccessibilityProps,
  PAGINATION_NAV_LABELS,
  PAGINATION_TO_ICONBUTTON_SIZE,
  PAGINATION_TO_NAV_ICON_SIZE,
  resolvePaginationAppearance,
  resolvePaginationSize,
  usePaginationState,
  type PaginationProps,
  type PaginationSlot,
} from './interface';
import { PaginationItem } from './PaginationItem.native';
import { IconButton } from '../IconButton/IconButton.native';
import { Icon } from '../Icon/Icon.native';
import { useSurfaceAppearance } from '../../theme';
import { styles } from './Pagination.styles.native';

function navDestination(
  slotType: Exclude<PaginationSlot['type'], 'page' | 'ellipsis'>,
  currentPage: number,
  totalPages: number,
): number {
  switch (slotType) {
    case 'first':
      return 1;
    case 'previous':
      return Math.max(1, currentPage - 1);
    case 'next':
      return Math.min(totalPages, currentPage + 1);
    case 'last':
      return totalPages;
    default:
      return currentPage;
  }
}

export function Pagination({
  totalPages,
  page,
  defaultPage,
  onPageChange,
  siblingCount = 1,
  boundaryCount = 1,
  showPrevNext = true,
  showFirstLast = false,
  disabled = false,
  attention = 'medium',
  size,
  appearance,
  'aria-label': ariaLabel = 'Pagination',
  accessibilityHint,
  style: styleProp,
  testID,
}: PaginationProps): React.ReactElement {
  const resolvedSize = resolvePaginationSize(size);
  const parentAppearance = useSurfaceAppearance();
  const resolvedAppearance = resolvePaginationAppearance(appearance, parentAppearance);
  const ibSize = PAGINATION_TO_ICONBUTTON_SIZE[resolvedSize];
  const navIconSize = IconSizeValues[PAGINATION_TO_NAV_ICON_SIZE[resolvedSize]];

  const { currentPage, slots, setPage } = usePaginationState({
    totalPages,
    page,
    defaultPage,
    onPageChange,
    siblingCount,
    boundaryCount,
    showFirstLast,
    showPrevNext,
    disabled,
  });

  const nameA11y = getPaginationNameAccessibilityProps({
    'aria-label': ariaLabel,
    accessibilityHint,
  });
  const containerA11y = getPaginationContainerAccessibilityProps({ disabled });

  const rootStyle = useMemo(
    () => [styles.root, disabled ? styles.rootDisabled : null, styleProp as ViewStyle],
    [disabled, styleProp],
  );

  const navIcon = (name: 'back' | 'next' | 'firstPage' | 'lastPage') => (
    <Icon icon={name} size={navIconSize} aria-hidden />
  );

  if (totalPages <= 0) {
    return (
      <View style={rootStyle} testID={testID}>
        <Text {...nameA11y} style={styles.srOnly} />
        <View {...containerA11y} />
      </View>
    );
  }

  return (
    <View style={rootStyle} testID={testID}>
      <Text {...nameA11y} style={styles.srOnly} />
      <View {...containerA11y} style={styles.list}>
        {slots.map((slot, idx) => {
          if (slot.type === 'ellipsis') {
            return (
              <View
                key={`${slot.side}-ellipsis-${idx}`}
                style={styles.listItem}
                {...getPaginationEllipsisAccessibilityProps()}
              >
                <IconButton
                  icon="moreHorizontal"
                  attention="low"
                  size={ibSize}
                  appearance="neutral"
                  disabled
                  aria-label="Collapsed pages"
                />
              </View>
            );
          }

          if (slot.type === 'page') {
            const { page: pageNum, selected } = slot;
            return (
              <View key={`page-${pageNum}`} style={styles.listItem}>
                <PaginationItem
                  page={pageNum}
                  selected={selected}
                  attention={attention}
                  size={resolvedSize}
                  appearance={resolvedAppearance}
                  disabled={disabled}
                  onSelect={(p) => setPage(p)}
                  testID={testID ? `${testID}-page-${pageNum}` : undefined}
                />
              </View>
            );
          }

          const slotType = slot.type;
          const iconName =
            slotType === 'previous'
              ? 'back'
              : slotType === 'next'
                ? 'next'
                : slotType === 'first'
                  ? 'firstPage'
                  : 'lastPage';

          return (
            <View key={`${slotType}-${idx}`} style={styles.listItem}>
              <IconButton
                icon={navIcon(iconName)}
                attention="low"
                size={ibSize}
                appearance={resolvedAppearance}
                disabled={slot.disabled || disabled}
                onPress={() => {
                  if (slot.disabled || disabled) return;
                  setPage(navDestination(slotType, currentPage, totalPages));
                }}
                aria-label={PAGINATION_NAV_LABELS[slotType]}
                testID={testID ? `${testID}-${slotType}` : undefined}
              />
            </View>
          );
        })}
      </View>

      <View
        {...getPaginationLiveRegionProps(currentPage, totalPages)}
        style={styles.srOnly}
      />
    </View>
  );
}

export type { PaginationProps } from './interface';
