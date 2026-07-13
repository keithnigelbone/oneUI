/**
 * BottomNavigationItem.showcase.native.tsx
 *
 * The canonical web stories for `BottomNavItem` live in
 * `packages/ui/src/components/BottomNavigation/BottomNavigation.stories.tsx`
 * because the Item is always rendered inside a `<BottomNavigation>` parent
 * (it reads context for `value` / `labelType` / `appearance`). Those parent
 * stories are mirrored on native by `BottomNavigation.showcase.native.tsx`.
 *
 * This file adds Item-only sections that demonstrate each Item-level prop
 * matrix in isolation — useful for visual regression and for writing
 * focused Storybook tests against the Item without a parent. No new web
 * stories exist for the Item; the section names track the parent
 * `BottomNavigation` story names that they're a subset of.
 */

import React from 'react';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { tokens, typography } from '@oneui/tokens';
import { BottomNavigationItem } from './BottomNavigationItem.native';
import type { BottomNavigationLabelType } from './interface';
import { useSurfaceTokens } from '../../theme';
import {
  IcHomeGlyph,
  IcSearchGlyph,
  IcUserGlyph,
} from './bottomNavShowcaseGlyphs';

export {
  IcHomeGlyph,
  IcSearchGlyph,
  IcUserGlyph,
  IcGlobeGlyph,
  IcMailGlyph,
} from './bottomNavShowcaseGlyphs';

const column: StyleProp<ViewStyle> = {
  flexDirection: 'column',
  gap: tokens.spacing['4'],
};

const row: StyleProp<ViewStyle> = {
  flexDirection: 'row',
  alignItems: 'flex-end',
  gap: tokens.spacing['3-5'],
  flexWrap: 'wrap',
};

function Label({ children }: { children: React.ReactNode }): React.ReactElement {
  const role = useSurfaceTokens('primary');
  return (
    <Text style={{ fontSize: typography.size.xs, color: role.content.low }}>
      {children}
    </Text>
  );
}

/* ========================================
   Item-only Default — single item, label visible
   (subset of BottomNavigation `Default`)
   ======================================== */
export function BottomNavigationItemDefault(): React.ReactElement {
  return (
    <View style={{ width: tokens.spacing['24'] }}>
      <BottomNavigationItem icon={IcHomeGlyph} label='Home' active />
    </View>
  );
}

/* ========================================
   Item-only LabelTypes — none / 1line / 2line
   (subset of BottomNavigation `LabelTypes`)
   ======================================== */
export function BottomNavigationItemLabelTypes(): React.ReactElement {
  const types: BottomNavigationLabelType[] = ['none', '1line', '2line'];
  return (
    <View style={column}>
      {types.map((labelType) => (
        <View key={labelType} style={{ gap: tokens.spacing['2'] }}>
          <Label>labelType = {labelType}</Label>
          <View style={[row, { width: tokens.spacing['40'] }]}>
            <BottomNavigationItem
              icon={IcHomeGlyph}
              label='Home'
              labelType={labelType}
              active
              aria-label='Home'
            />
            <BottomNavigationItem
              icon={IcSearchGlyph}
              label='Search'
              labelType={labelType}
              aria-label='Search'
            />
          </View>
        </View>
      ))}
    </View>
  );
}

/* ========================================
   Item-only States — default / active / disabled
   (subset of BottomNavigation `States`)
   ======================================== */
export function BottomNavigationItemStates(): React.ReactElement {
  return (
    <View style={column}>
      <View style={{ gap: tokens.spacing['2'] }}>
        <Label>default (inactive)</Label>
        <View style={[row, { width: tokens.spacing['24'] }]}>
          <BottomNavigationItem icon={IcHomeGlyph} label='Home' />
        </View>
      </View>
      <View style={{ gap: tokens.spacing['2'] }}>
        <Label>active</Label>
        <View style={[row, { width: tokens.spacing['24'] }]}>
          <BottomNavigationItem icon={IcHomeGlyph} label='Home' active />
        </View>
      </View>
      <View style={{ gap: tokens.spacing['2'] }}>
        <Label>disabled</Label>
        <View style={[row, { width: tokens.spacing['24'] }]}>
          <BottomNavigationItem icon={IcHomeGlyph} label='Home' disabled />
        </View>
      </View>
    </View>
  );
}

/* ========================================
   Item-only WithIcons — activeIcon swap on active
   (subset of BottomNavigation `WithIcons`)
   ======================================== */
export function BottomNavigationItemWithIcons(): React.ReactElement {
  return (
    <View style={column}>
      <View style={{ gap: tokens.spacing['2'] }}>
        <Label>same icon for active + inactive</Label>
        <View style={[row, { width: tokens.spacing['40'] }]}>
          <BottomNavigationItem icon={IcHomeGlyph} label='Home' />
          <BottomNavigationItem icon={IcHomeGlyph} label='Home' active />
        </View>
      </View>
      <View style={{ gap: tokens.spacing['2'] }}>
        <Label>activeIcon swap when selected</Label>
        <View style={[row, { width: tokens.spacing['40'] }]}>
          <BottomNavigationItem
            icon={IcUserGlyph}
            activeIcon={IcSearchGlyph}
            label='User'
          />
          <BottomNavigationItem
            icon={IcUserGlyph}
            activeIcon={IcSearchGlyph}
            label='User'
            active
          />
        </View>
      </View>
    </View>
  );
}

/* ========================================
   Native-only convenience — ad-hoc disabled + no-label combo for
   visual regression of the icon-only fallback path. Keep `aria-label`
   to satisfy the dev-mode warning when labelType="none".
   ======================================== */
export function BottomNavigationItemIconOnly(): React.ReactElement {
  return (
    <View style={[row, { width: tokens.spacing['28'] }]}>
      <BottomNavigationItem
        icon={IcHomeGlyph}
        labelType='none'
        aria-label='Home'
      />
      <BottomNavigationItem
        icon={IcSearchGlyph}
        labelType='none'
        aria-label='Search'
        active
      />
    </View>
  );
}
