/**
 * WebHeader.stories.tsx
 *
 * Stories organized by Figma component properties:
 * - type: homeBar | contextBar | searchBar
 * - middle: fluid | centred
 * - searchInput: none | middle | end
 * - breakpoint: S through L
 * - secondaryNav: boolean
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { WebHeader } from './WebHeader';
import { Logo } from '../Logo/Logo';
import { Avatar } from '../Avatar/Avatar';
import { Icon } from '../Icon/Icon';
import { IconButton } from '../IconButton/IconButton';
import { Button } from '../Button/Button';
import { useBrandLogo } from '../../contexts/BrandLogoContext';
import React from 'react';

/* ========================================
   BRAND LOGO — reads from Storybook BrandLogoContext
   ======================================== */

const FALLBACK_SVG = `<svg viewBox="0 0 100 100" fill="currentColor">
  <text x="50" y="62" font-size="48" font-weight="bold" text-anchor="middle" font-family="sans-serif">B</text>
</svg>`;

function BrandLogo() {
  const { logoSvg, brandName } = useBrandLogo();
  return <Logo svgContent={logoSvg || FALLBACK_SVG} alt={brandName || 'Brand'} size="xl" variant="mark" />;
}

/* ========================================
   MOCK NAV DATA
   ======================================== */

const sampleNavigation = [
  { id: 'home', label: 'Home', href: '/', children: [
    { id: 'overview', label: 'Overview', href: '/overview', children: [
      { label: 'Getting Started', href: '/overview/start' },
      { label: 'Documentation', href: '/overview/docs' },
    ]},
    { id: 'updates', label: 'Updates', href: '/updates' },
  ]},
  { id: 'products', label: 'Products', href: '/products' },
  { id: 'solutions', label: 'Solutions', href: '/solutions' },
  { id: 'resources', label: 'Resources', href: '/resources' },
  { id: 'community', label: 'Community', href: '/community' },
];

/* ========================================
   INTERACTIVE NAV — stateful wrapper so clicking items animates the indicator
   ======================================== */

const navLabels: Record<string, string> = {
  home: 'Home', products: 'Products', solutions: 'Solutions', resources: 'Resources',
};

function InteractiveNavItems({ items = ['home', 'products', 'solutions', 'resources'], activeValue, onActiveChange }: {
  items?: string[];
  activeValue: string;
  onActiveChange: (v: string) => void;
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
          {navLabels[item] ?? item.charAt(0).toUpperCase() + item.slice(1)}
        </WebHeader.Item>
      ))}
    </>
  );
}

/* ========================================
   REUSABLE SLOT CONTENT
   ======================================== */

/**
 * HelloJio is a Jio brand-specific AI entry point. The glyph is inlined
 * as a React element rather than added to the shared SemanticIconName
 * union — it would otherwise force every other icon set (lucide, tabler,
 * hugeicons, phosphor, remix) to provide a stand-in.
 */
const HelloJioGlyph: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true">
    <path
      fill="currentColor"
      d="M16.5 12c2.49 0 4.5-2.01 4.5-4.5S18.99 3 16.5 3 12 5.01 12 7.5s2.01 4.5 4.5 4.5M12 7.5C12 5.01 9.99 3 7.5 3S3 5.01 3 7.5 5.01 12 7.5 12 12 9.99 12 7.5m4.5 4.5c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5m-9 0C5.01 12 3 14.01 3 16.5S5.01 21 7.5 21s4.5-2.01 4.5-4.5S9.99 12 7.5 12"
    />
  </svg>
);

/**
 * Trailing actions cluster used by all WebHeader stories.
 *
 * HelloJio is always present — it's the brand's conversational entry
 * point and sits next to the notification bell as a tinted primary IconButton.
 * Search is only shown via `<SearchInput>` when `searchInput` is `middle` or `end`.
 */
const EndActions = () => (
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

const UserAvatar = () => (
  <Avatar alt="Jane Doe" size="xl" content="icon" appearance="secondary" />
);

/**
 * DemoSection — wraps each WebHeader showcase variation in a `<section>`
 * region landmark. The region scopes any nested `<header>` so it is
 * treated as a section header rather than a page banner, which keeps
 * axe's `landmark-no-duplicate-banner` rule satisfied when several
 * WebHeaders appear in the same story. The section is labelled by the
 * visible title, so assistive tech announces the demo name as well.
 */
const DemoSection = ({
  id,
  label,
  titleStyle,
  children,
}: {
  id: string;
  label: string;
  titleStyle: React.CSSProperties;
  children: React.ReactNode;
}) => (
  <section aria-labelledby={`${id}-title`}>
    <p id={`${id}-title`} style={titleStyle}>{label}</p>
    {children}
  </section>
);

/* ========================================
   META — controls expose Figma properties
   ======================================== */

type StoryArgs = {
  type: 'homeBar' | 'contextBar' | 'searchBar';
  middle: 'fluid' | 'centred' | 'none';
  searchInput: 'none' | 'middle' | 'end';
  breakpoint: 'S' | 'M' | 'L';
  secondaryNav: boolean;
  secondaryNavType: 'navStart' | 'navEnd' | 'marketing';
  secondaryNavItems: boolean;
  showMenuButton: boolean;
  avatar: boolean;
  divider: boolean;
  primaryNavItems: boolean;
};

const meta: Meta<typeof WebHeader> = {
  title: 'Components/Navigation/WebHeader [WIP]',
  component: WebHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Responsive web navigation header. Compound component: `WebHeader` (container) → `WebHeader.PrimaryNav` (top bar) + `WebHeader.SecondaryNav` (tab row) + `WebHeader.Item` (nav item atom). Props mirror Figma component properties.',
      },
    },
  },
  argTypes: {
    breakpoint: {
      control: 'select',
      options: ['S', 'M', 'L'],
      description: 'Responsive breakpoint (auto-detected by default)',
      table: { category: 'WebHeader' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof WebHeader>;

/* ========================================
   1. DEFAULT — Interactive with all Figma controls
   ======================================== */

export const Default: Story = {
  render: (_, { args }) => {
    const storyArgs = args as unknown as StoryArgs;
    const type = storyArgs.type ?? 'homeBar';
    const middle = storyArgs.middle ?? 'fluid';
    const searchInput = storyArgs.searchInput ?? 'end';
    const bp = storyArgs.breakpoint ?? 'L';
    const showSecondary = storyArgs.secondaryNav ?? false;
    const secondaryType = storyArgs.secondaryNavType ?? 'navStart';
    const showSecondaryItems = storyArgs.secondaryNavItems ?? true;
    const showMenuButton = storyArgs.showMenuButton ?? true;
    const showAvatar = storyArgs.avatar ?? true;
    const showDivider = storyArgs.divider ?? true;
    const showItems = storyArgs.primaryNavItems ?? true;

    const [activeNav, setActiveNav] = React.useState('home');
    const [activeSecondary, setActiveSecondary] = React.useState('overview');
    const navItems = ['home', 'products', 'solutions', 'resources'];
    const secondaryItems = ['overview', 'features', 'pricing'];

    return (
      <WebHeader breakpoint={bp}>
        <WebHeader.PrimaryNav
          type={type}
          middle={middle}
          searchInput={searchInput}
          showMenuButton={showMenuButton}
          primaryNavItems={showItems}
          divider={showDivider}
          showAvatar={showAvatar}
          activeValue={activeNav}
          logo={<BrandLogo />}
          avatar={<UserAvatar />}
          end={<EndActions />}
        >
          {navItems.map((item) => (
            <WebHeader.Item
              key={item}
              value={item}
              attention="medium"
              active={activeNav === item}
              onClick={() => setActiveNav(item)}
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
            </WebHeader.Item>
          ))}
        </WebHeader.PrimaryNav>
        {showSecondary && (
          <WebHeader.SecondaryNav
            type={secondaryType}
            secondaryNavItems={showSecondaryItems}
            subheader={secondaryType === 'marketing' ? 'Subheader' : undefined}
            end={
              secondaryType === 'marketing' ? (
                <>
                  <IconButton icon="heart" aria-label="Save collection" attention="medium" size="s" />
                  <Button attention="high" size="s">Label</Button>
                </>
              ) : undefined
            }
          >
            {secondaryType !== 'marketing' &&
              secondaryItems.map((item) => (
                <WebHeader.Item
                  key={item}
                  value={item}
                  attention="high"
                  active={activeSecondary === item}
                  onClick={() => setActiveSecondary(item)}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </WebHeader.Item>
              ))}
          </WebHeader.SecondaryNav>
        )}
      </WebHeader>
    );
  },
  argTypes: {
    ...meta.argTypes,
    type: { control: 'select', options: ['homeBar', 'contextBar', 'searchBar'], table: { category: 'PrimaryNav' } },
    middle: { control: 'select', options: ['fluid', 'centred', 'none'], table: { category: 'PrimaryNav' } },
    searchInput: { control: 'select', options: ['none', 'middle', 'end'], table: { category: 'PrimaryNav' } },
    showMenuButton: { control: 'boolean', description: 'Show hamburger menu button', table: { category: 'PrimaryNav' } },
    primaryNavItems: { control: 'boolean', description: 'Show nav items', table: { category: 'PrimaryNav' } },
    divider: { control: 'boolean', description: 'Show bottom divider', table: { category: 'PrimaryNav' } },
    avatar: { control: 'boolean', description: 'Show avatar', table: { category: 'PrimaryNav' } },
    secondaryNav: { control: 'boolean', description: 'Show secondary nav row', table: { category: 'SecondaryNav' } },
    secondaryNavType: { control: 'select', options: ['navStart', 'navEnd', 'marketing'], table: { category: 'SecondaryNav' } },
    secondaryNavItems: { control: 'boolean', description: 'Show secondary nav items (Header.Item)', table: { category: 'SecondaryNav' } },
  } as any,
  args: {
    type: 'homeBar',
    middle: 'fluid',
    searchInput: 'end',
    breakpoint: 'L',
    showMenuButton: true,
    primaryNavItems: true,
    divider: true,
    avatar: true,
    secondaryNav: false,
    secondaryNavType: 'navStart',
    secondaryNavItems: true,
  } as any,
};

/* ========================================
   2. HOMEBAR — type="homeBar" variations
   ======================================== */

export const HomeBar: Story = {
  name: 'HomeBar Variations',
  render: () => {
    const [active1, setActive1] = React.useState('home');
    const [active2, setActive2] = React.useState('home');
    const [active3, setActive3] = React.useState('home');
    const [active4, setActive4] = React.useState('home');

    const title: React.CSSProperties = { color: 'var(--Text-Low)', fontSize: 'var(--Label-S-FontSize)', marginBlockEnd: 'var(--Spacing-0-5)' };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-6)' }}>
        <DemoSection id="homebar-fluid-search-end" label="Fluid + Search End" titleStyle={title}>
          <WebHeader breakpoint="L">
            <WebHeader.PrimaryNav aria-label="Fluid + Search End — primary navigation" searchAriaLabel="Fluid + Search End — site search" type="homeBar" middle="fluid" searchInput="end" showMenuButton activeValue={active1} logo={<BrandLogo />} avatar={<UserAvatar />} end={<EndActions />}>
              <InteractiveNavItems activeValue={active1} onActiveChange={setActive1} />
            </WebHeader.PrimaryNav>
          </WebHeader>
        </DemoSection>

        <DemoSection id="homebar-fluid-search-middle" label="Fluid + Search Middle" titleStyle={title}>
          <WebHeader breakpoint="L">
            <WebHeader.PrimaryNav aria-label="Fluid + Search Middle — primary navigation" searchAriaLabel="Fluid + Search Middle — site search" type="homeBar" middle="fluid" searchInput="middle" showMenuButton activeValue={active2} logo={<BrandLogo />} avatar={<UserAvatar />} end={<EndActions />}>
              <InteractiveNavItems activeValue={active2} onActiveChange={setActive2} />
            </WebHeader.PrimaryNav>
          </WebHeader>
        </DemoSection>

        <DemoSection id="homebar-centred-no-search" label="Centred + No Search" titleStyle={title}>
          <WebHeader breakpoint="L">
            <WebHeader.PrimaryNav aria-label="Centred + No Search — primary navigation" type="homeBar" middle="centred" searchInput="none" showMenuButton activeValue={active3} logo={<BrandLogo />} avatar={<UserAvatar />} end={<EndActions />}>
              <InteractiveNavItems activeValue={active3} onActiveChange={setActive3} />
            </WebHeader.PrimaryNav>
          </WebHeader>
        </DemoSection>

        <DemoSection id="homebar-no-hamburger" label="No Hamburger" titleStyle={title}>
          <WebHeader breakpoint="L">
            <WebHeader.PrimaryNav aria-label="No Hamburger — primary navigation" searchAriaLabel="No Hamburger — site search" type="homeBar" middle="fluid" searchInput="end" showMenuButton={false} activeValue={active4} logo={<BrandLogo />} avatar={<UserAvatar />} end={<EndActions />}>
              <InteractiveNavItems items={['home', 'products', 'solutions']} activeValue={active4} onActiveChange={setActive4} />
            </WebHeader.PrimaryNav>
          </WebHeader>
        </DemoSection>
      </div>
    );
  },
};

/* ========================================
   3. CONTEXTBAR — type="contextBar"
   ======================================== */

export const ContextBar: Story = {
  name: 'ContextBar Variations',
  render: () => {
    const [activeCtx, setActiveCtx] = React.useState('home');
    const title: React.CSSProperties = { color: 'var(--Text-Low)', fontSize: 'var(--Label-S-FontSize)', marginBlockEnd: 'var(--Spacing-0-5)' };
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-6)' }}>
        <DemoSection id="contextbar-without-nav-items" label="Without Nav Items" titleStyle={title}>
          <WebHeader breakpoint="L">
            <WebHeader.PrimaryNav aria-label="ContextBar without nav items — primary navigation" type="contextBar" primaryNavItems={false} showMenuButton searchInput="none" logo={<BrandLogo />} avatar={<UserAvatar />} end={<EndActions />} />
          </WebHeader>
        </DemoSection>

        <DemoSection id="contextbar-with-nav-items" label="With Nav Items" titleStyle={title}>
          <WebHeader breakpoint="L">
            <WebHeader.PrimaryNav aria-label="ContextBar with nav items — primary navigation" type="contextBar" middle="fluid" searchInput="none" showMenuButton activeValue={activeCtx} logo={<BrandLogo />} avatar={<UserAvatar />} end={<EndActions />}>
              <WebHeader.Item value="home" attention="medium" active={activeCtx === 'home'} onClick={() => setActiveCtx('home')}>Home</WebHeader.Item>
              <WebHeader.Item value="about" attention="medium" active={activeCtx === 'about'} onClick={() => setActiveCtx('about')}>About</WebHeader.Item>
            </WebHeader.PrimaryNav>
          </WebHeader>
        </DemoSection>
      </div>
    );
  },
};

/* ========================================
   4. SEARCHBAR — type="searchBar"
   ======================================== */

export const SearchBar: Story = {
  name: 'SearchBar Variations',
  render: () => {
    const title: React.CSSProperties = { color: 'var(--Text-Low)', fontSize: 'var(--Label-S-FontSize)', marginBlockEnd: 'var(--Spacing-0-5)' };
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-6)' }}>
        <DemoSection id="searchbar-middle" label="Search in Middle" titleStyle={title}>
          <WebHeader breakpoint="L">
            <WebHeader.PrimaryNav aria-label="SearchBar with search in middle — primary navigation" searchAriaLabel="SearchBar middle — site search" type="searchBar" middle="fluid" searchInput="middle" primaryNavItems={false} showMenuButton logo={<BrandLogo />} avatar={<UserAvatar />} end={<EndActions />} />
          </WebHeader>
        </DemoSection>

        <DemoSection id="searchbar-end" label="Search in End" titleStyle={title}>
          <WebHeader breakpoint="L">
            <WebHeader.PrimaryNav aria-label="SearchBar with search in end — primary navigation" searchAriaLabel="SearchBar end — site search" type="searchBar" searchInput="end" primaryNavItems={false} showMenuButton logo={<BrandLogo />} avatar={<UserAvatar />} end={<EndActions />} />
          </WebHeader>
        </DemoSection>
      </div>
    );
  },
};

/* ========================================
   5. RESPONSIVE — all 5 Figma platform widths
   ======================================== */

const FIGMA_PLATFORM_WIDTHS = [360, 768, 1024, 1440, 1920] as const;

function platformBreakpoint(width: (typeof FIGMA_PLATFORM_WIDTHS)[number]): 'S' | 'M' | 'L' {
  if (width < 620) return 'S';
  if (width < 991) return 'M';
  return 'L';
}

const platformLabelStyle: React.CSSProperties = {
  color: 'var(--Text-Low)',
  fontSize: 'var(--Label-S-FontSize)',
  lineHeight: 'var(--Label-S-LineHeight)',
  fontFamily: 'var(--Typography-Font-Primary)',
  marginBlockEnd: 'var(--Spacing-0-5)',
};

function ResponsivePlatformsDemo() {
  const [activeNav, setActiveNav] = React.useState('home');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-6)' }}>
      {FIGMA_PLATFORM_WIDTHS.map((width) => {
        const bp = platformBreakpoint(width);
        return (
          <section key={width} aria-label={`WebHeader at platform ${width}`}>
            <p style={platformLabelStyle}>
              {`platform: ${width} (breakpoint ${bp})`}
            </p>
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <div style={{
                width: `${width}px`,
                minWidth: `${width}px`,
                overflow: 'hidden',
                border: 'var(--Stroke-M) solid var(--Border-Subtle)',
              }}>
                <WebHeader breakpoint={bp}>
                  <WebHeader.PrimaryNav
                    aria-label={`WebHeader ${width} — primary navigation`}
                    searchAriaLabel={`WebHeader ${width} — site search`}
                    type="homeBar"
                    middle="fluid"
                    searchInput={bp === 'L' ? 'end' : 'none'}
                    showMenuButton={bp !== 'L'}
                    activeValue={activeNav}
                    logo={<BrandLogo />}
                    avatar={<UserAvatar />}
                    end={<EndActions />}
                  >
                    <InteractiveNavItems
                      items={['home', 'products', 'solutions']}
                      activeValue={activeNav}
                      onActiveChange={setActiveNav}
                    />
                  </WebHeader.PrimaryNav>
                </WebHeader>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

export const Responsive: Story = {
  render: () => <ResponsivePlatformsDemo />,
};

/* ========================================
   6. WITH SECONDARY NAV — all 3 types
   ======================================== */

export const WithSecondaryNav: Story = {
  name: 'With Secondary Nav',
  render: () => {
    const [activePrimary, setActivePrimary] = React.useState('home');
    const [activeSecStart, setActiveSecStart] = React.useState('overview');
    const [activeSecEnd, setActiveSecEnd] = React.useState('tab1');

    const title: React.CSSProperties = { color: 'var(--Text-Low)', fontSize: 'var(--Label-S-FontSize)', marginBlockEnd: 'var(--Spacing-0-5)' };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-6)' }}>
        <DemoSection id="secondary-nav-start" label="Nav Start" titleStyle={title}>
          <WebHeader breakpoint="L">
            <WebHeader.PrimaryNav aria-label="With secondary nav start — primary navigation" searchAriaLabel="With secondary nav start — site search" type="homeBar" middle="fluid" searchInput="end" showMenuButton activeValue={activePrimary} logo={<BrandLogo />} avatar={<UserAvatar />} end={<EndActions />}>
              <InteractiveNavItems activeValue={activePrimary} onActiveChange={setActivePrimary} items={['home', 'products']} />
            </WebHeader.PrimaryNav>
            <WebHeader.SecondaryNav aria-label="Nav Start — secondary navigation" type="navStart">
              {['overview', 'features', 'pricing'].map((item) => (
                <WebHeader.Item key={item} value={item} attention="high" active={activeSecStart === item} onClick={() => setActiveSecStart(item)}>
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </WebHeader.Item>
              ))}
            </WebHeader.SecondaryNav>
          </WebHeader>
        </DemoSection>

        <DemoSection id="secondary-nav-end" label="Nav End" titleStyle={title}>
          <WebHeader breakpoint="L">
            <WebHeader.PrimaryNav aria-label="With secondary nav end — primary navigation" type="homeBar" searchInput="none" logo={<BrandLogo />} avatar={<UserAvatar />} primaryNavItems={false} end={<EndActions />} />
            <WebHeader.SecondaryNav aria-label="Nav End — secondary navigation" type="navEnd">
              {['tab1', 'tab2', 'tab3'].map((item, i) => (
                <WebHeader.Item key={item} value={item} attention="high" active={activeSecEnd === item} onClick={() => setActiveSecEnd(item)}>
                  {`Tab ${i + 1}`}
                </WebHeader.Item>
              ))}
            </WebHeader.SecondaryNav>
          </WebHeader>
        </DemoSection>

        <DemoSection id="secondary-nav-items-hidden" label="Nav Start — items hidden" titleStyle={title}>
          <WebHeader breakpoint="L">
            <WebHeader.PrimaryNav aria-label="Secondary nav items hidden — primary navigation" type="homeBar" searchInput="none" logo={<BrandLogo />} avatar={<UserAvatar />} primaryNavItems={false} end={<EndActions />} />
            <WebHeader.SecondaryNav aria-label="Nav Start — no items" type="navStart" secondaryNavItems={false} />
          </WebHeader>
        </DemoSection>

        <DemoSection id="secondary-nav-marketing" label="Marketing" titleStyle={title}>
          <WebHeader breakpoint="L">
            <WebHeader.PrimaryNav aria-label="With secondary nav marketing — primary navigation" type="homeBar" searchInput="none" logo={<BrandLogo />} avatar={<UserAvatar />} primaryNavItems={false} end={<EndActions />} />
            <WebHeader.SecondaryNav aria-label="Marketing — secondary navigation" type="marketing" subheader="Subheader" end={
              <>
                <IconButton icon="heart" aria-label="Save collection" attention="medium" size="s" />
                <Button attention="high" size="s">Label</Button>
              </>
            } />
          </WebHeader>
        </DemoSection>
      </div>
    );
  },
};

/* ========================================
   7. MOBILE DRAWER
   ======================================== */

export const MobileDrawerStory: Story = {
  name: 'Mobile Drawer',
  render: () => {
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const [activePrimary, setActivePrimary] = React.useState('home');
    const [activeSecondary, setActiveSecondary] = React.useState('overview');
    return (
      <div style={{ width: '360px' }}>
        <WebHeader breakpoint="S">
          <WebHeader.PrimaryNav
            type="homeBar"
            searchInput="none"
            showMenuButton
            activeValue={activePrimary}
            logo={<BrandLogo />}
            avatar={<UserAvatar />}
            onDrawerOpenChange={setDrawerOpen}
            end={<EndActions />}
          >
            <WebHeader.Item value="home" attention="medium" active={activePrimary === 'home'} onClick={() => setActivePrimary('home')}>Home</WebHeader.Item>
          </WebHeader.PrimaryNav>
          <WebHeader.SecondaryNav type="navStart">
            <WebHeader.Item value="overview" attention="high" active={activeSecondary === 'overview'} onClick={() => setActiveSecondary('overview')}>Overview</WebHeader.Item>
            <WebHeader.Item value="features" attention="high" active={activeSecondary === 'features'} onClick={() => setActiveSecondary('features')}>Features</WebHeader.Item>
          </WebHeader.SecondaryNav>
        </WebHeader>
        <WebHeader.Drawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          navigation={sampleNavigation}
          logo={<BrandLogo />}
        />
      </div>
    );
  },
};

