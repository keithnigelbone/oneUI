/**
 * BottomNavigation.showcase.tsx
 * Reusable showcase renders for the BottomNavigation component.
 * Used by Storybook stories and the platform component docs page.
 */

import React from 'react';
import { BottomNavigation } from './BottomNavigation';
import { BottomNavItem } from './BottomNavItem';
import { Surface } from '../Surface';
import type { BottomNavigationLabelType } from './BottomNavigation.shared';
import type { SemanticIconName } from '@oneui/shared';

/**
 * Mobile-frame wrapper — no explicit background so surface-context cascades
 * from the parent. Using a bg here would intercept `[data-surface]` remapping
 * and force every nav inside to render on a "default" surface.
 */
export function MobileFrame({ children, width = 360 }: { children: React.ReactNode; width?: number }) {
  return (
    <div
      style={{
        width,
        borderRadius: 'var(--Shape-4-5)',
        overflow: 'hidden',
      }}
    >
      {children}
    </div>
  );
}

/**
 * Semantic icon names — the `<Icon>` primitive resolves these against the
 * currently selected brand icon set (Jio, Lucide, Tabler, etc.). Using
 * semantic names (rather than inline SVGs) is what makes the nav adopt a
 * brand-specific icon pack automatically.
 */
const ITEM_DEFS: ReadonlyArray<{
  value: string;
  label: string;
  icon: SemanticIconName;
  activeIcon?: SemanticIconName;
}> = [
  { value: 'home', label: 'Home', icon: 'home' },
  { value: 'search', label: 'Search', icon: 'search' },
  { value: 'explore', label: 'Explore', icon: 'globe' },
  { value: 'inbox', label: 'Inbox', icon: 'mail' },
  { value: 'profile', label: 'Profile', icon: 'user' },
];

/** Default 3-item nav with middle item active. */
export function BottomNavigationDefault() {
  return (
    <MobileFrame>
      <BottomNavigation aria-label="Primary" defaultValue="search">
        <BottomNavItem value="home" icon="home" label="Home" />
        <BottomNavItem value="search" icon="search" label="Search" />
        <BottomNavItem value="profile" icon="user" label="Profile" />
      </BottomNavigation>
    </MobileFrame>
  );
}

/** All three label types (Figma: none / 1Line / 2Line). */
export function BottomNavigationLabelTypes() {
  const types: BottomNavigationLabelType[] = ['1line', '2line', 'none'];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)' }}>
      {types.map((type) => (
        <div key={type} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
          <span
            style={{
              fontFamily: 'var(--Label-FontFamily, var(--Typography-Font-Text))',
              fontSize: 'var(--Label-S-FontSize)',
              lineHeight: 'var(--Label-S-LineHeight)',
              color: 'var(--Text-Low)',
            }}
          >
            labelType = {type}
          </span>
          <MobileFrame>
            <BottomNavigation aria-label={`Primary ${type}`} defaultValue="home" labelType={type}>
              <BottomNavItem value="home" icon="home" label="Home" aria-label="Home" />
              <BottomNavItem value="search" icon="search" label="Search" aria-label="Search" />
              <BottomNavItem
                value="inbox"
                icon="mail"
                label="Notifications and messages"
                aria-label="Inbox"
              />
              <BottomNavItem value="profile" icon="user" label="Profile" aria-label="Profile" />
            </BottomNavigation>
          </MobileFrame>
        </div>
      ))}
    </div>
  );
}

/** Item counts 2 → 5 (matches Figma `items` prop). */
export function BottomNavigationItemCounts() {
  const counts = [2, 3, 4, 5] as const;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)' }}>
      {counts.map((n) => (
        <div key={n} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
          <span
            style={{
              fontFamily: 'var(--Label-FontFamily, var(--Typography-Font-Text))',
              fontSize: 'var(--Label-S-FontSize)',
              lineHeight: 'var(--Label-S-LineHeight)',
              color: 'var(--Text-Low)',
            }}
          >
            {n} items
          </span>
          <MobileFrame>
            <BottomNavigation aria-label={`Primary ${n}`} defaultValue={ITEM_DEFS[0].value}>
              {ITEM_DEFS.slice(0, n).map((def) => (
                <BottomNavItem
                  key={def.value}
                  value={def.value}
                  icon={def.icon}
                  activeIcon={def.activeIcon}
                  label={def.label}
                />
              ))}
            </BottomNavigation>
          </MobileFrame>
        </div>
      ))}
    </div>
  );
}

/** States — default / active / disabled. */
export function BottomNavigationStates() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)' }}>
      <MobileFrame>
        <BottomNavigation aria-label="States default">
          <BottomNavItem value="home" icon="home" label="Home" />
          <BottomNavItem value="search" icon="search" label="Search" />
          <BottomNavItem value="profile" icon="user" label="Profile" />
        </BottomNavigation>
      </MobileFrame>
      <MobileFrame>
        <BottomNavigation aria-label="States active">
          <BottomNavItem value="home" icon="home" label="Home" active />
          <BottomNavItem value="search" icon="search" label="Search" />
          <BottomNavItem value="profile" icon="user" label="Profile" />
        </BottomNavigation>
      </MobileFrame>
      <MobileFrame>
        <BottomNavigation aria-label="States disabled">
          <BottomNavItem value="home" icon="home" label="Home" />
          <BottomNavItem value="search" icon="search" label="Search" disabled />
          <BottomNavItem value="profile" icon="user" label="Profile" />
        </BottomNavigation>
      </MobileFrame>
    </div>
  );
}

/** With vs without activeIcon swap. */
export function BottomNavigationWithIcons() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)' }}>
      <div>
        <span
          style={{
            fontFamily: 'var(--Label-FontFamily, var(--Typography-Font-Text))',
            fontSize: 'var(--Label-S-FontSize)',
            color: 'var(--Text-Low)',
          }}
        >
          Default active color shift
        </span>
        <MobileFrame>
          <BottomNavigation aria-label="Icon swap" defaultValue="home">
            <BottomNavItem value="home" icon="home" label="Home" />
            <BottomNavItem value="cart" icon="bookmark" label="Saved" />
            <BottomNavItem value="profile" icon="user" label="Profile" />
          </BottomNavigation>
        </MobileFrame>
      </div>
      <div>
        <span
          style={{
            fontFamily: 'var(--Label-FontFamily, var(--Typography-Font-Text))',
            fontSize: 'var(--Label-S-FontSize)',
            color: 'var(--Text-Low)',
          }}
        >
          Appearance primary, different icons
        </span>
        <MobileFrame>
          <BottomNavigation aria-label="Single icon" defaultValue="explore">
            <BottomNavItem value="explore" icon="globe" label="Explore" />
            <BottomNavItem value="inbox" icon="mail" label="Inbox" />
            <BottomNavItem value="profile" icon="user" label="Profile" />
          </BottomNavigation>
        </MobileFrame>
      </div>
    </div>
  );
}

/** All surface modes — nav adapts via [data-surface] cascade.
    Mirrors the Button "Themes" story (default / minimal / subtle /
    moderate / bold / elevated). */
export function BottomNavigationSurfaceModes() {
  const modes = [
    { mode: 'default' as const, label: 'default' },
    { mode: 'minimal' as const, label: 'minimal' },
    { mode: 'subtle' as const, label: 'subtle' },
    { mode: 'moderate' as const, label: 'moderate' },
    { mode: 'bold' as const, label: 'bold' },
    { mode: 'elevated' as const, label: 'elevated' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      {modes.map(({ mode, label }) => (
        <div key={mode} style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-4-5)' }}>
          <span
            style={{
              fontFamily: 'var(--Label-FontFamily, var(--Typography-Font-Text))',
              fontSize: 'var(--Label-S-FontSize)',
              lineHeight: 'var(--Label-S-LineHeight)',
              color: 'var(--Text-Low)',
              width: 90,
              flexShrink: 0,
            }}
          >
            {label}
          </span>
          <Surface
            mode={mode}
            style={{
              width: 360,
              borderRadius: 'var(--Shape-4-5)',
              overflow: 'hidden',
              padding: 'var(--Spacing-0)',
            }}
          >
            <BottomNavigation aria-label={`Surface ${label}`} defaultValue="home">
              <BottomNavItem value="home" icon="home" label="Home" />
              <BottomNavItem value="search" icon="search" label="Search" />
              <BottomNavItem value="profile" icon="user" label="Profile" />
            </BottomNavigation>
          </Surface>
        </div>
      ))}
    </div>
  );
}

/**
 * Idle vs keyboard-focused state — uses data-force-state="focus" to render
 * the Informative focus halo without requiring actual keyboard navigation.
 */
export function BottomNavigationFocusState() {
  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--Label-FontFamily, var(--Typography-Font-Text))',
    fontSize: 'var(--Label-S-FontSize)',
    lineHeight: 'var(--Label-S-LineHeight)',
    color: 'var(--Text-Low)',
  };
  return (
    <div style={{ display: 'flex', gap: 'var(--Spacing-5)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
        <MobileFrame>
          <BottomNavigation aria-label="Idle state" defaultValue="home">
            <BottomNavItem value="home" icon="home" label="Home" />
            <BottomNavItem value="search" icon="search" label="Search" />
            <BottomNavItem value="profile" icon="user" label="Profile" />
          </BottomNavigation>
        </MobileFrame>
        <span style={labelStyle}>Idle</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
        <div data-force-state="focus" style={{ display: 'inline-flex' }}>
          <MobileFrame>
            <BottomNavigation aria-label="Focus state" defaultValue="home">
              <BottomNavItem value="home" icon="home" label="Home" />
              <BottomNavItem value="search" icon="search" label="Search" />
              <BottomNavItem value="profile" icon="user" label="Profile" />
            </BottomNavigation>
          </MobileFrame>
        </div>
        <span style={labelStyle}>Focus</span>
      </div>
    </div>
  );
}

/** Appearance roles — Primary, Secondary, Sparkle, Positive. */
export function BottomNavigationAppearances() {
  const appearances = ['primary', 'secondary', 'sparkle', 'positive'] as const;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)' }}>
      {appearances.map((app) => (
        <div key={app} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
          <span
            style={{
              fontFamily: 'var(--Label-FontFamily, var(--Typography-Font-Text))',
              fontSize: 'var(--Label-S-FontSize)',
              color: 'var(--Text-Low)',
              textTransform: 'capitalize',
            }}
          >
            {app}
          </span>
          <MobileFrame>
            <BottomNavigation aria-label={`Appearance ${app}`} appearance={app} defaultValue="home">
              <BottomNavItem value="home" icon="home" label="Home" />
              <BottomNavItem value="search" icon="search" label="Search" />
              <BottomNavItem value="profile" icon="user" label="Profile" />
            </BottomNavigation>
          </MobileFrame>
        </div>
      ))}
    </div>
  );
}
