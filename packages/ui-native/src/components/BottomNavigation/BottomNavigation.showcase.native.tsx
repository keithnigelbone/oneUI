/**
 * BottomNavigation.showcase.native.tsx — peer of BottomNavigation.showcase.tsx
 */

import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import { Surface, useSurfaceTokens, useTypographyTokens } from '../../theme';
import { BottomNavigation } from './BottomNavigation.native';
import type { BottomNavigationLabelType } from './BottomNavigationContext';
import { BottomNavigationItem } from '../BottomNavigationItem/BottomNavigationItem.native';
import {
  IcGlobeGlyph,
  IcHomeGlyph,
  IcMailGlyph,
  IcSearchGlyph,
  IcUserGlyph,
} from '../BottomNavigationItem/bottomNavShowcaseGlyphs';

/**
 * Wraps a `<BottomNavigation>` in a rounded preview that stretches to the
 * surrounding column (the screen on native, the showcase column on web). The
 * component itself sets `width: '100%'`, so this frame is purely decorative
 * — `overflow: 'hidden'` clips the divider bleed for a tidy preview.
 */
function MobileFrame({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <View
      style={{
        width: '100%',
        alignSelf: 'stretch',
        borderRadius: tokens.shape.m,
        overflow: 'hidden',
      }}
    >
      {children}
    </View>
  );
}

function Caption({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('neutral');
  return <Text style={{ fontSize: typography.size.s, color: role.content.low }}>{children}</Text>;
}

const ITEM_DEFS = [
  { value: 'home', label: 'Home', icon: IcHomeGlyph },
  { value: 'search', label: 'Search', icon: IcSearchGlyph },
  { value: 'explore', label: 'Explore', icon: IcGlobeGlyph },
  { value: 'inbox', label: 'Inbox', icon: IcMailGlyph },
  { value: 'profile', label: 'Profile', icon: IcUserGlyph },
] as const;

export function BottomNavigationDefault(): React.ReactElement {
  return (
    <MobileFrame>
      <BottomNavigation aria-label="Primary" defaultValue="search">
        <BottomNavigationItem value="home" icon={IcHomeGlyph} label="Home" />
        <BottomNavigationItem value="search" icon={IcSearchGlyph} label="Search" />
        <BottomNavigationItem value="profile" icon={IcUserGlyph} label="Profile" />
      </BottomNavigation>
    </MobileFrame>
  );
}

export function BottomNavigationLabelTypes(): React.ReactElement {
  const types: BottomNavigationLabelType[] = ['1line', '2line', 'none'];
  return (
    <View style={{ gap: tokens.spacing['5'] }}>
      {types.map((type) => (
        <View key={type} style={{ gap: tokens.spacing['3'] }}>
          <Caption>labelType = {type}</Caption>
          <MobileFrame>
            <BottomNavigation aria-label={`Primary ${type}`} defaultValue="home" labelType={type}>
              <BottomNavigationItem
                value="home"
                icon={IcHomeGlyph}
                label="Home"
                aria-label="Home"
              />
              <BottomNavigationItem
                value="search"
                icon={IcSearchGlyph}
                label="Search"
                aria-label="Search"
              />
              <BottomNavigationItem
                value="inbox"
                icon={IcMailGlyph}
                label="Notifications"
                aria-label="Inbox"
              />
              <BottomNavigationItem
                value="profile"
                icon={IcUserGlyph}
                label="Profile"
                aria-label="Profile"
              />
            </BottomNavigation>
          </MobileFrame>
        </View>
      ))}
    </View>
  );
}

/** Regression: 2-line labels must not clip — long copy wraps inside Spacing-6 box. */
export function BottomNavigationTwoLineLongLabels(): React.ReactElement {
  const role = useSurfaceTokens('primary');
  const bodyTypo = useTypographyTokens('body', 'S', { emphasis: 'low', lineHeightMultiplier: 1 });
  return (
    <View style={{ gap: tokens.spacing['4'] }}>
      <Text
        style={{
          fontSize: bodyTypo.fontSize,
          lineHeight: bodyTypo.lineHeight,
          fontWeight: bodyTypo.fontWeight,
          fontFamily: bodyTypo.fontFamily,
          color: role.content.medium,
        }}
      >
        labelType=&quot;2line&quot; with long labels — both lines should be fully visible (no
        ~6px crop on Android).
      </Text>
      <MobileFrame>
        <BottomNavigation aria-label="Two line long labels" labelType="2line" defaultValue="account">
          <BottomNavigationItem
            value="account"
            icon={IcUserGlyph}
            label="Account Profile Page"
            aria-label="Account Profile Page"
          />
          <BottomNavigationItem
            value="favorites"
            icon={IcHomeGlyph}
            label="My Saved Favorites"
            aria-label="My Saved Favorites"
          />
          <BottomNavigationItem
            value="search"
            icon={IcSearchGlyph}
            label="Search Everything"
            aria-label="Search Everything"
          />
        </BottomNavigation>
      </MobileFrame>
    </View>
  );
}

/** Icon-only tabs derive accessible names from `value` when `aria-label` / `label` are omitted. */
export function BottomNavigationIconOnlyAccessibility(): React.ReactElement {
  const role = useSurfaceTokens('primary');
  const bodyTypo = useTypographyTokens('body', 'S', { emphasis: 'low', lineHeightMultiplier: 1 });
  return (
    <View style={{ gap: tokens.spacing['4'] }}>
      <Text
        style={{
          fontSize: bodyTypo.fontSize,
          lineHeight: bodyTypo.lineHeight,
          fontWeight: bodyTypo.fontWeight,
          fontFamily: bodyTypo.fontFamily,
          color: role.content.medium,
        }}
      >
        labelType=&quot;none&quot; without aria-label — VoiceOver/TalkBack should announce
        &quot;Home&quot;, &quot;Search&quot;, &quot;Profile&quot; from each item&apos;s value.
      </Text>
      <MobileFrame>
        <BottomNavigation aria-label="Icon-only tabs" labelType="none" defaultValue="home">
          <BottomNavigationItem value="home" icon={IcHomeGlyph} />
          <BottomNavigationItem value="search" icon={IcSearchGlyph} />
          <BottomNavigationItem value="profile" icon={IcUserGlyph} />
        </BottomNavigation>
      </MobileFrame>
    </View>
  );
}

export function BottomNavigationItemCounts(): React.ReactElement {
  const counts = [2, 3, 4, 5] as const;
  return (
    <View style={{ gap: tokens.spacing['5'] }}>
      {counts.map((n) => (
        <View key={n} style={{ gap: tokens.spacing['3'] }}>
          <Caption>{n} items</Caption>
          <MobileFrame>
            <BottomNavigation aria-label={`Primary ${n}`} defaultValue={ITEM_DEFS[0].value}>
              {ITEM_DEFS.slice(0, n).map((def) => (
                <BottomNavigationItem
                  key={def.value}
                  value={def.value}
                  icon={def.icon}
                  label={def.label}
                />
              ))}
            </BottomNavigation>
          </MobileFrame>
        </View>
      ))}
    </View>
  );
}

/** Six items passed — only the first five render (Profile is omitted). */
export function BottomNavigationMaxItemsEnforced(): React.ReactElement {
  return (
    <View style={{ gap: tokens.spacing['3'] }}>
      <Caption>6 items passed — only 5 rendered (Profile omitted)</Caption>
      <MobileFrame>
        <BottomNavigation aria-label="Max items enforced" defaultValue="home">
          {ITEM_DEFS.map((def) => (
            <BottomNavigationItem
              key={def.value}
              value={def.value}
              icon={def.icon}
              label={def.label}
            />
          ))}
        </BottomNavigation>
      </MobileFrame>
    </View>
  );
}

export function BottomNavigationStates(): React.ReactElement {
  return (
    <View style={{ gap: tokens.spacing['5'] }}>
      <Caption>Default</Caption>
      <MobileFrame>
        <BottomNavigation aria-label="States default">
          <BottomNavigationItem value="home" icon={IcHomeGlyph} label="Home" />
          <BottomNavigationItem value="search" icon={IcSearchGlyph} label="Search" />
          <BottomNavigationItem value="profile" icon={IcUserGlyph} label="Profile" />
        </BottomNavigation>
      </MobileFrame>
      <Caption>Active (explicit)</Caption>
      <MobileFrame>
        <BottomNavigation aria-label="States active">
          <BottomNavigationItem value="home" icon={IcHomeGlyph} label="Home" active />
          <BottomNavigationItem value="search" icon={IcSearchGlyph} label="Search" />
          <BottomNavigationItem value="profile" icon={IcUserGlyph} label="Profile" />
        </BottomNavigation>
      </MobileFrame>
      <Caption>Disabled item</Caption>
      <MobileFrame>
        <BottomNavigation aria-label="States disabled">
          <BottomNavigationItem value="home" icon={IcHomeGlyph} label="Home" />
          <BottomNavigationItem value="search" icon={IcSearchGlyph} label="Disabled" disabled />
          <BottomNavigationItem value="profile" icon={IcUserGlyph} label="Profile" />
        </BottomNavigation>
      </MobileFrame>
    </View>
  );
}

export function BottomNavigationControlled(): React.ReactElement {
  const [value, setValue] = useState('home');
  return (
    <MobileFrame>
      <BottomNavigation aria-label="Controlled" value={value} onValueChange={setValue}>
        <BottomNavigationItem value="home" icon={IcHomeGlyph} label="Home" />
        <BottomNavigationItem value="search" icon={IcSearchGlyph} label="Search" />
        <BottomNavigationItem value="profile" icon={IcUserGlyph} label="Profile" />
      </BottomNavigation>
    </MobileFrame>
  );
}

/**
 * Regression: explicit `active` must not override parent `value` — only one tab selected.
 * Enable TalkBack and swipe the bar: only Settings should announce as selected.
 */
export function BottomNavigationSelectionExclusivity(): React.ReactElement {
  const role = useSurfaceTokens('primary');
  const bodyTypo = useTypographyTokens('body', 'S', { emphasis: 'low' });
  return (
    <View style={{ gap: tokens.spacing['4'] }}>
      <Text
        style={{
          fontSize: bodyTypo.fontSize,
          lineHeight: bodyTypo.lineHeight,
          fontWeight: bodyTypo.fontWeight,
          fontFamily: bodyTypo.fontFamily,
          color: role.content.medium,
        }}
      >
        Parent value is &quot;settings&quot; but Home has active={'{true}'} — only Settings should
        look selected (high label + icon). With TalkBack, only one tab should announce selected.
      </Text>
      <MobileFrame>
        <BottomNavigation aria-label="Selection exclusivity" value="settings">
          <BottomNavigationItem value="home" icon={IcHomeGlyph} label="Home" active />
          <BottomNavigationItem value="search" icon={IcSearchGlyph} label="Search" />
          <BottomNavigationItem value="settings" icon={IcUserGlyph} label="Settings" />
        </BottomNavigation>
      </MobileFrame>
    </View>
  );
}

export function BottomNavigationSurfaceModes(): React.ReactElement {
  const modes = ['default', 'minimal', 'subtle', 'moderate', 'bold', 'elevated'] as const;
  return (
    <View style={{ gap: tokens.spacing['4-5'] }}>
      {modes.map((mode) => (
        <View key={mode} style={{ gap: tokens.spacing['3'] }}>
          <Caption>{mode}</Caption>
          <Surface
            mode={mode}
            style={{
              width: '100%',
              alignSelf: 'stretch',
              borderRadius: tokens.shape.m,
              overflow: 'hidden',
            }}
          >
            <BottomNavigation aria-label={`Surface ${mode}`} defaultValue="home">
              <BottomNavigationItem value="home" icon={IcHomeGlyph} label="Home" />
              <BottomNavigationItem value="search" icon={IcSearchGlyph} label="Search" />
              <BottomNavigationItem value="profile" icon={IcUserGlyph} label="Profile" />
            </BottomNavigation>
          </Surface>
        </View>
      ))}
    </View>
  );
}

export function BottomNavigationAppearances(): React.ReactElement {
  const appearances = ['primary', 'secondary', 'sparkle', 'positive'] as const;
  return (
    <View style={{ gap: tokens.spacing['5'] }}>
      {appearances.map((app) => (
        <View key={app} style={{ gap: tokens.spacing['3'] }}>
          <Caption>{app}</Caption>
          <MobileFrame>
            <BottomNavigation aria-label={`Appearance ${app}`} appearance={app} defaultValue="home">
              <BottomNavigationItem value="home" icon={IcHomeGlyph} label="Home" />
              <BottomNavigationItem value="search" icon={IcSearchGlyph} label="Search" />
              <BottomNavigationItem value="profile" icon={IcUserGlyph} label="Profile" />
            </BottomNavigation>
          </MobileFrame>
        </View>
      ))}
    </View>
  );
}
