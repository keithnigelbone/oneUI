/**
 * HeaderNative.native.tsx — Figma HeaderNative micropattern implementation.
 *
 * Compound API: HeaderNative → PrimaryNav (chrome) + SecondaryNav (HeaderItem tabs) + Item
 *
 * HeaderItem children go in SecondaryNav only — PrimaryNav has no children slot.
 */

import React, { useMemo } from 'react';
import {
  Text,
  View,
} from 'react-native';
import { tokens } from '@oneui/tokens';
import {
  useSurfaceTokens,
  useTypographyTokens,
  typographyToTextStyle,
} from '../../theme';
import { Divider } from '../Divider/Divider.native';
import { Icon } from '../Icon/Icon.native';
import { IconButton } from '../IconButton/IconButton.native';
import { Input } from '../Input/Input.native';
import { HeaderContext, useHeaderContext } from './HeaderContext';
import { HeaderItem } from './HeaderItem.native';
import { SecondaryNav } from './SecondaryNav.native';
import {
  HEADER_DIVIDER_A11Y,
  HEADER_NESTED_TITLE_A11Y,
  getHeaderAccessibilityProps,
  getPrimaryNavAccessibilityProps,
  useHeaderState,
  usePrimaryNavState,
  resolvePrimaryNavLayout,
  type HeaderNativeProps,
  type PrimaryNavProps,
} from './interface';
import { resolveHeaderChromePaint, type HeaderChromePaint } from './Header.chrome.native';
import { styles } from './Header.styles.native';

/* ===== HeaderNative root ===== */

function HeaderNativeRoot({
  expanded,
  secondaryNav,
  divider,
  style,
  children,
  testID,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  accessibilityHint,
}: HeaderNativeProps): React.ReactElement {
  const state = useHeaderState({ expanded, secondaryNav, divider });
  const neutral = useSurfaceTokens('neutral');
  const paint = resolveHeaderChromePaint(neutral, useSurfaceTokens('primary'));
  const a11y = getHeaderAccessibilityProps({
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    accessibilityHint,
  });

  const contextValue = useMemo(
    () => ({
      expanded: state.expanded,
      secondaryNav: state.secondaryNav,
      divider: state.divider,
    }),
    [state.divider, state.expanded, state.secondaryNav],
  );

  return (
    <HeaderContext.Provider value={contextValue}>
      <View
        testID={testID}
        {...a11y}
        style={[
          styles.root,
          styles.rootColumn,
          { backgroundColor: paint.background },
          state.expanded ? styles.headerExpanded : undefined,
          style,
        ]}
      >
        {children}
        {state.divider ? (
          <View style={styles.headerDivider} {...HEADER_DIVIDER_A11Y}>
            <Divider orientation="horizontal" size="s" appearance="neutral" attention="low" />
          </View>
        ) : null}
      </View>
    </HeaderContext.Provider>
  );
}

/* ===== PrimaryNav type content ===== */

interface ContextBarStartProps {
  startSlot?: React.ReactNode;
  titleContent?: string;
  secondaryTextContent?: string;
  showSecondaryText: boolean;
  paint: HeaderChromePaint;
}

function ContextBarStart({
  startSlot,
  titleContent,
  secondaryTextContent,
  showSecondaryText,
  paint,
}: ContextBarStartProps): React.ReactElement {
  const titleTypography = useTypographyTokens('title', 'M', { emphasis: 'medium' });
  const secondaryTypography = useTypographyTokens('label', 'XS', { emphasis: 'low' });

  return (
    <View style={styles.primaryNavStartContext}>
      {startSlot}
      <View style={styles.contextBarTitleWrapper}>
        {titleContent ? (
          <Text
            {...HEADER_NESTED_TITLE_A11Y}
            style={[
              styles.contextBarTitleLine,
              typographyToTextStyle(titleTypography),
              { color: paint.textHigh },
            ]}
            numberOfLines={1}
          >
            {titleContent}
          </Text>
        ) : null}
        {showSecondaryText && secondaryTextContent ? (
          <Text
            style={[
              styles.contextBarSecondaryLine,
              typographyToTextStyle(secondaryTypography),
              { color: paint.textLow },
            ]}
            numberOfLines={1}
          >
            {secondaryTextContent}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

interface ExpandedTitleRowProps {
  titleContent: string;
  paint: HeaderChromePaint;
}

function ExpandedTitleRow({
  titleContent,
  paint,
}: ExpandedTitleRowProps): React.ReactElement {
  const headlineTypography = useTypographyTokens('headline', 'L');

  return (
    <View style={styles.expandedTitleRow}>
      <Text
        {...HEADER_NESTED_TITLE_A11Y}
        style={[
          styles.expandedTitleText,
          typographyToTextStyle(headlineTypography),
          { color: paint.textHigh },
        ]}
        numberOfLines={1}
      >
        {titleContent}
      </Text>
    </View>
  );
}

/* ===== PrimaryNav ===== */

export function PrimaryNav(props: PrimaryNavProps): React.ReactElement {
  const {
    startSlot,
    endSlot,
    avatarSlot,
    titleContent,
    secondaryTextContent,
    searchPlaceholder = 'Search',
    searchValue,
    onSearchChange,
    onSearchSubmit,
    searchAriaLabel = 'Site search',
    searchEndSlot,
    style,
    testID,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    accessibilityHint,
  } = props;

  const headerCtx = useHeaderContext();
  const navState = usePrimaryNavState(props);
  const neutral = useSurfaceTokens('neutral');
  const primary = useSurfaceTokens('primary');
  const paint = resolveHeaderChromePaint(neutral, primary);
  const a11y = getPrimaryNavAccessibilityProps({
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    accessibilityHint,
  });

  const layout = resolvePrimaryNavLayout(navState, headerCtx.expanded, titleContent);
  const { isExpanded, showExpandedLayout, showContextBarInlineTitle, showContextBarStartOnly } =
    layout;
  const isHomeBar = navState.type === 'homeBar';
  const isContextBar = navState.type === 'contextBar';
  const isSearchBar = navState.type === 'searchBar';

  const defaultSearchEndSlot = (
    <IconButton
      icon="microphone"
      aria-label="Voice search"
      attention="low"
      appearance="primary"
      size={4}
      condensed
    />
  );

  const searchField = (
    <View style={styles.searchInput}>
      <Input
        shape="pill"
        attention="high"
        size="s"
        placeholder={searchPlaceholder}
        value={searchValue}
        onChange={onSearchChange}
        onSubmit={onSearchSubmit}
        start={<Icon icon="search" size={tokens.spacing['4']} aria-hidden />}
        end={searchEndSlot ?? defaultSearchEndSlot}
        accessibilityLabel={searchAriaLabel}
      />
    </View>
  );

  const primaryNavRow = (
    <View
      testID={testID}
      {...a11y}
      style={[
        styles.primaryNav,
        isSearchBar ? styles.primaryNavSearchBar : undefined,
        isExpanded && !showExpandedLayout ? styles.primaryNavExpanded : undefined,
        style,
      ]}
    >
      {showContextBarInlineTitle && navState.showStart ? (
        <ContextBarStart
          startSlot={startSlot}
          titleContent={titleContent}
          secondaryTextContent={secondaryTextContent}
          showSecondaryText={navState.showSecondaryText}
          paint={paint}
        />
      ) : null}

      {showContextBarStartOnly && navState.showStart ? (
        <View style={styles.primaryNavStartContextExpanded}>{startSlot}</View>
      ) : null}

      {!isContextBar && navState.showStart ? (
        <View style={isSearchBar ? styles.primaryNavStartSearch : styles.primaryNavStart}>
          {startSlot}
        </View>
      ) : null}

      {isHomeBar ? (
        <View style={styles.homeBarMiddle}>
          {navState.showSearchInput ? searchField : null}
        </View>
      ) : null}

      {isSearchBar ? <View style={styles.searchBarField}>{searchField}</View> : null}

      <View
        style={[
          styles.primaryNavEnd,
          isContextBar ? styles.primaryNavEndContext : undefined,
          isSearchBar ? styles.primaryNavEndSearch : undefined,
          isHomeBar ? styles.primaryNavEndHomeBar : undefined,
        ]}
      >
        {navState.showEnd && endSlot ? <View style={styles.primaryNavEndSlot}>{endSlot}</View> : null}
        {navState.showAvatar ? avatarSlot : null}
      </View>
    </View>
  );

  if (showExpandedLayout && titleContent) {
    return (
      <View style={styles.primaryNavColumn}>
        {primaryNavRow}
        <ExpandedTitleRow titleContent={titleContent} paint={paint} />
      </View>
    );
  }

  return primaryNavRow;
}

/* ===== Compound export ===== */

export { HeaderItem } from './HeaderItem.native';
export { SecondaryNav } from './SecondaryNav.native';

export const HeaderNative: typeof HeaderNativeRoot & {
  PrimaryNav: typeof PrimaryNav;
  SecondaryNav: typeof SecondaryNav;
  Item: typeof HeaderItem;
} = Object.assign(HeaderNativeRoot, {
  PrimaryNav,
  SecondaryNav,
  Item: HeaderItem,
});

export type { HeaderNativeProps } from './interface';
