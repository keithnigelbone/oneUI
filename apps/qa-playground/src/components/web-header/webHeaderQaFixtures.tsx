'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import { WebHeader } from '@oneui/ui/components/WebHeader';
import type {
  PrimaryNavMiddle,
  PrimaryNavType,
  SearchInputPosition,
  WebHeaderBreakpoint,
} from '@oneui/ui/components/WebHeader';
import { useBrandLogo } from '@oneui-ui-internals/contexts/BrandLogoContext';
import { Logo } from '@oneui/ui/components/Logo';
import { Avatar } from '@oneui/ui/components/Avatar';
import { Icon } from '@oneui/ui/components/Icon';
import { IconButton } from '@oneui/ui/components/IconButton';
import { Button } from '@oneui/ui/components/Button';
import {
  WEB_HEADER_FIGMA_PLATFORMS,
  type WebHeaderFigmaPlatform,
} from './webHeaderFigmaValidation.shared';

const FALLBACK_LOGO_SVG = `<svg viewBox="0 0 100 100" fill="currentColor">
  <text x="50" y="62" font-size="48" font-weight="bold" text-anchor="middle" font-family="sans-serif">B</text>
</svg>`;

const NAV_LABELS: Record<string, string> = {
  home: 'Home',
  products: 'Products',
  solutions: 'Solutions',
  resources: 'Resources',
  about: 'About',
  a: 'Alpha',
  b: 'Beta',
  c: 'Gamma',
};

export const platformCaptionStyle: CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Label-S-FontSize)',
  lineHeight: 'var(--Label-S-LineHeight)',
  color: 'var(--Text-Low)',
  marginBlockEnd: 'var(--Spacing-0-5)',
};

const HelloJioGlyph = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
    <path
      fill="currentColor"
      d="M16.5 12c2.49 0 4.5-2.01 4.5-4.5S18.99 3 16.5 3 12 5.01 12 7.5s2.01 4.5 4.5 4.5M12 7.5C12 5.01 9.99 3 7.5 3S3 5.01 3 7.5 5.01 12 7.5 12 12 9.99 12 7.5m4.5 4.5c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5m-9 0C5.01 12 3 14.01 3 16.5S5.01 21 7.5 21s4.5-2.01 4.5-4.5S9.99 12 7.5 12"
    />
  </svg>
);

export function platformBreakpoint(width: WebHeaderFigmaPlatform): WebHeaderBreakpoint {
  if (width < 620) return 'S';
  if (width < 991) return 'M';
  return 'L';
}

export function QaBrandLogo() {
  const { logoSvg, brandName } = useBrandLogo();
  return <Logo svgContent={logoSvg || FALLBACK_LOGO_SVG} alt={brandName || 'Brand'} size="xl" variant="mark" />;
}

export function QaUserAvatar() {
  return <Avatar alt="Jane Doe" size="xl" content="icon" appearance="secondary" />;
}

export type QaEndActionMode = 'iconButtons' | 'button' | 'none';

/** Mirrors Storybook `EndActions` — IconButton cluster by default. Search only via `searchInput` prop. */
export function QaEndActions({
  mode = 'iconButtons',
}: {
  mode?: QaEndActionMode;
}) {
  if (mode === 'none') return null;

  if (mode === 'button') {
    return (
      <Button attention="high" size="s">
        Sign in
      </Button>
    );
  }

  return (
    <>
      <IconButton
        icon={<Icon icon={<HelloJioGlyph />} appearance="primary" emphasis="tinted" />}
        aria-label="Ask HelloJio"
        attention="low"
        appearance="primary"
        size={8}
        condensed
      />
      <IconButton icon="notification" aria-label="Notifications" attention="low" size={8} condensed appearance="neutral" />
    </>
  );
}

function QaNavItems({
  items,
  activeValue,
  onActiveChange,
}: {
  items: readonly string[];
  activeValue: string;
  onActiveChange: (value: string) => void;
}) {
  return (
    <>
      {items.map((item) => (
        <WebHeader.Item
          key={item}
          value={item}
          attention="medium"
          active={activeValue === item}
          onClick={() => onActiveChange(item)}
        >
          {NAV_LABELS[item] ?? item.charAt(0).toUpperCase() + item.slice(1)}
        </WebHeader.Item>
      ))}
    </>
  );
}

export type QaHeaderScenario = {
  testId: string;
  ariaLabel: string;
  searchAriaLabel?: string;
  platformWidth?: WebHeaderFigmaPlatform;
  breakpoint?: WebHeaderBreakpoint;
  type?: PrimaryNavType;
  middle?: PrimaryNavMiddle;
  searchInput?: SearchInputPosition;
  primaryNavItems?: boolean;
  showStart?: boolean;
  showMenuButton?: boolean;
  showEnd?: boolean;
  endActionMode?: QaEndActionMode;
  showAvatar?: boolean;
  navItems?: readonly string[];
  initialActive?: string;
  staticNav?: Array<{ value: string; label: string; active?: boolean }>;
};

export function QaHeaderScenarioMount({
  scenario,
  activeValue,
  onActiveChange,
}: {
  scenario: QaHeaderScenario;
  activeValue: string;
  onActiveChange: (value: string) => void;
}) {
  const width = scenario.platformWidth;
  const bp = scenario.breakpoint ?? (width != null ? platformBreakpoint(width) : 'L');
  const searchInput = scenario.searchInput ?? 'end';
  const resolvedSearch: SearchInputPosition =
    searchInput === 'end' && bp !== 'L' ? 'none' : searchInput;
  const primaryNavItems = scenario.primaryNavItems ?? true;
  const showStart = scenario.showStart ?? true;
  const showMenuButton = scenario.showMenuButton ?? (showStart && bp !== 'L');
  const showEnd = scenario.showEnd ?? true;
  const showAvatar = scenario.showAvatar ?? true;
  const endActionMode = scenario.endActionMode ?? 'iconButtons';

  return (
    <div data-testid={scenario.testId}>
      <WebHeader breakpoint={bp}>
        <WebHeader.PrimaryNav
          type={scenario.type ?? 'homeBar'}
          middle={scenario.middle ?? 'fluid'}
          searchInput={resolvedSearch}
          primaryNavItems={primaryNavItems}
          showMenuButton={showStart ? showMenuButton : false}
          showAvatar={showAvatar}
          activeValue={primaryNavItems ? activeValue : undefined}
          logo={showStart ? <QaBrandLogo /> : undefined}
          avatar={showAvatar ? <QaUserAvatar /> : undefined}
          end={
            showEnd ? (
              <QaEndActions mode={endActionMode} />
            ) : undefined
          }
          aria-label={scenario.ariaLabel}
          searchAriaLabel={scenario.searchAriaLabel}
        >
          {primaryNavItems && scenario.staticNav
            ? scenario.staticNav.map((item) => (
                <WebHeader.Item
                  key={item.value}
                  value={item.value}
                  attention="medium"
                  active={activeValue === item.value}
                  onClick={() => onActiveChange(item.value)}
                >
                  {item.label}
                </WebHeader.Item>
              ))
            : primaryNavItems
              ? (
                <QaNavItems
                  items={scenario.navItems ?? ['home', 'products', 'solutions', 'resources']}
                  activeValue={activeValue}
                  onActiveChange={onActiveChange}
                />
              )
              : null}
        </WebHeader.PrimaryNav>
      </WebHeader>
    </div>
  );
}

export function QaInteractiveScenario({ scenario }: { scenario: QaHeaderScenario }) {
  const defaultActive =
    scenario.initialActive
    ?? scenario.staticNav?.find((item) => item.active)?.value
    ?? scenario.navItems?.[0]
    ?? 'home';
  const [activeValue, setActiveValue] = useState(defaultActive);
  return (
    <QaHeaderScenarioMount scenario={scenario} activeValue={activeValue} onActiveChange={setActiveValue} />
  );
}

export function QaPlatformFrame({
  width,
  children,
}: {
  width: WebHeaderFigmaPlatform;
  children: ReactNode;
}) {
  return (
    <div>
      <p style={platformCaptionStyle}>{`platform: ${width} (breakpoint ${platformBreakpoint(width)})`}</p>
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <div
          style={{
            width: `${width}px`,
            minWidth: `${width}px`,
            overflow: 'hidden',
            border: 'var(--Stroke-M) solid var(--Border-Subtle)',
            borderRadius: 'var(--Shape-2)',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function QaDesktopFrame({ children }: { children: ReactNode }) {
  return (
    <div style={{ width: '100%', minWidth: 'min(100%, 1440px)' }}>{children}</div>
  );
}

export { WEB_HEADER_FIGMA_PLATFORMS };
