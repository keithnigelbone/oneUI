/**
 * HeaderNative.showcase.native.tsx — composed HeaderNative samples.
 */

import React, { useState } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import type { IconComponent } from '@oneui/shared';
import { tokens } from '@oneui/tokens';
import { IcFilterMultiple } from '../../../../icons-jio-native/src/generated/IcFilterMultiple';
import { IcHellojio } from '../../../../icons-jio-native/src/generated/IcHellojio';
import { Avatar } from '../Avatar/Avatar.native';
import { Icon } from '../Icon/Icon.native';
import { IconButton } from '../IconButton/IconButton.native';
import { Logo } from '../Logo/Logo.native';
import { HeaderNative, PrimaryNav, SecondaryNav } from './HeaderNative.native';
import { HeaderItem } from './HeaderItem.native';

const NAV_ITEMS = ['overview', 'features', 'pricing', 'support'];

const column: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['4-5'],
  width: '100%',
};

/** Jio catalog glyph — same asset as platform `IcHellojio`, adapted for `<Icon>`. */
const HelloJioIcon: IconComponent = ({ size = 24, color, fill }) => (
  <IcHellojio width={size} height={size} fill={fill ?? color} />
);

const FilterMultipleIcon: IconComponent = ({ size = 24, color, fill }) => (
  <IcFilterMultiple width={size} height={size} fill={fill ?? color} />
);

const FALLBACK_SVG = `<svg viewBox="0 0 100 100" fill="currentColor">
  <text x="50" y="62" font-size="48" font-weight="bold" text-anchor="middle" font-family="sans-serif">B</text>
</svg>`;

function ShowcaseLogo(): React.ReactElement {
  return (
    <Logo
      svgContent={FALLBACK_SVG}
      alt="Brand"
      size="xl"
      variant="mark"
    />
  );
}

function UserAvatar(): React.ReactElement {
  return <Avatar alt="Jane Doe" size="xl" content="icon" appearance="secondary" />;
}

function EndIconButtons({ showSearch = false }: { showSearch?: boolean }): React.ReactElement {
  return (
    <>
      {showSearch ? (
        <IconButton
          icon="search"
          aria-label="Search"
          attention="low"
          size={8}
          condensed
          appearance="neutral"
        />
      ) : null}
      <IconButton
        icon={<Icon icon={HelloJioIcon} appearance="primary" emphasis="tinted" />}
        aria-label="Ask HelloJio"
        attention="low"
        appearance="primary"
        size={8}
        condensed
      />
    </>
  );
}

function getPrimaryNavSlots() {
  return {
    avatar: true as const,
    startSlot: <ShowcaseLogo />,
    avatarSlot: <UserAvatar />,
    endSlot: <EndIconButtons showSearch />,
  };
}

function ContextBarBackButton(): React.ReactElement {
  return (
    <IconButton
      icon="back"
      aria-label="Go back"
      attention="low"
      size={8}
      condensed
      appearance="neutral"
    />
  );
}

function MenuButton(): React.ReactElement {
  return (
    <IconButton
      icon="menu"
      aria-label="Open menu"
      attention="low"
      size={8}
      condensed
      appearance="neutral"
    />
  );
}

function getContextBarNavSlots() {
  return {
    avatar: true as const,
    startSlot: <ContextBarBackButton />,
    avatarSlot: <UserAvatar />,
    endSlot: <EndIconButtons showSearch />,
  };
}

function getSearchBarNavSlots() {
  return {
    startSlot: <ContextBarBackButton />,
    endSlot: (
      <IconButton
        icon={<Icon icon={FilterMultipleIcon} appearance="neutral" />}
        aria-label="Filter"
        attention="low"
        size={8}
        condensed
        appearance="neutral"
      />
    ),
  };
}

function renderNavItems(
  activeValue: string,
  onActiveChange: (value: string) => void
): React.ReactElement[] {
  return NAV_ITEMS.map((item) => (
    <HeaderItem
      key={item}
      value={item}
      attention="medium"
      active={activeValue === item}
      onPress={() => onActiveChange(item)}
    >
      {item.charAt(0).toUpperCase() + item.slice(1)}
    </HeaderItem>
  ));
}

export function HeaderComposedWithoutSecondary(): React.ReactElement {
  return (
    <View style={column}>
      <HeaderNative secondaryNav={false} divider={true} aria-label="Header without secondary nav">
        <PrimaryNav type="homeBar" {...getPrimaryNavSlots()} />
        <SecondaryNav aria-label="Section tabs">
          {renderNavItems('overview', () => undefined)}
        </SecondaryNav>
      </HeaderNative>
    </View>
  );
}

export function HeaderComposedWithSecondary(): React.ReactElement {
  const [activeSecondary, setActiveSecondary] = useState('overview');

  return (
    <View style={column}>
      <HeaderNative secondaryNav divider aria-label="Composed header with secondary nav">
        <PrimaryNav type="homeBar" {...getPrimaryNavSlots()} />
        <SecondaryNav aria-label="Section tabs">
          {renderNavItems(activeSecondary, setActiveSecondary)}
        </SecondaryNav>
      </HeaderNative>
    </View>
  );
}

export function HeaderPrimaryNavHomeBar(): React.ReactElement {
  return (
    <View style={column}>
      <HeaderNative divider aria-label="PrimaryNav type homeBar (collapsed)">
        <PrimaryNav type="homeBar" {...getPrimaryNavSlots()} />
      </HeaderNative>
    </View>
  );
}

export function HeaderPrimaryNavHomeBarExpanded(): React.ReactElement {
  return (
    <View style={column}>
      <HeaderNative expanded aria-label="PrimaryNav type homeBar (expanded)">
        <PrimaryNav
          type="homeBar"
          expanded
          titleContent="Title"
          {...getPrimaryNavSlots()}
        />
      </HeaderNative>
    </View>
  );
}

export function HeaderPrimaryNavHomeBarWithSearch(): React.ReactElement {
  return (
    <View style={column}>
      <HeaderNative divider aria-label="PrimaryNav type homeBar with inline search">
        <PrimaryNav
          type="homeBar"
          searchInput
          searchPlaceholder="Search"
          avatar
          startSlot={
            <>
              <MenuButton />
              <ShowcaseLogo />
            </>
          }
          avatarSlot={<UserAvatar />}
          endSlot={<EndIconButtons showSearch />}
        />
      </HeaderNative>
    </View>
  );
}

export function HeaderPrimaryNavContextBar(): React.ReactElement {
  return (
    <View style={column}>
      <HeaderNative divider aria-label="PrimaryNav type contextBar (collapsed)">
        <PrimaryNav
          type="contextBar"
          start
          secondaryText
          titleContent="Title"
          secondaryTextContent="Secondary text"
          {...getContextBarNavSlots()}
        />
      </HeaderNative>
    </View>
  );
}

export function HeaderPrimaryNavContextBarExpanded(): React.ReactElement {
  return (
    <View style={column}>
      <HeaderNative expanded aria-label="PrimaryNav type contextBar (expanded)">
        <PrimaryNav
          type="contextBar"
          expanded
          start
          titleContent="Title"
          {...getContextBarNavSlots()}
        />
      </HeaderNative>
    </View>
  );
}

export function HeaderPrimaryNavSearchBarCollapsed(): React.ReactElement {
  return (
    <View style={column}>
      <HeaderNative aria-label="PrimaryNav type searchBar (collapsed)">
        <PrimaryNav
          type="searchBar"
          searchPlaceholder="Search"
          {...getSearchBarNavSlots()}
        />
      </HeaderNative>
    </View>
  );
}

export function HeaderPrimaryNavSearchBarExpanded(): React.ReactElement {
  return (
    <View style={column}>
      <HeaderNative expanded aria-label="PrimaryNav type searchBar (expanded)">
        <PrimaryNav
          type="searchBar"
          expanded
          titleContent="Title"
          searchPlaceholder="Search"
          {...getSearchBarNavSlots()}
        />
      </HeaderNative>
    </View>
  );
}

export const HeaderDefault = HeaderComposedWithSecondary;
