/**
 * components/tabs/page.tsx
 *
 * Tabs showcase — rebuilt against the new Figma-aligned API
 * (TabGroup + TabItem + TabPanel, plus compound Tabs.Root).
 * Demonstrates sizes, orientations, appearances, slot composition,
 * focus halo, and surface-context awareness.
 */

'use client';

import React, { useState } from 'react';
import { TabGroup, TabItem, TabPanel, Tabs } from '@oneui/ui/components/Tabs';
import { Surface } from '@oneui/ui/components/Surface';
import { CounterBadge } from '@oneui/ui/components/CounterBadge';
import { Icon } from '@oneui/ui/icons/Icon';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import type { ComponentAppearance } from '@oneui/shared';
import styles from '../component.module.css';

const APPEARANCE_ROLES: ComponentAppearance[] = [
  'primary', 'secondary',
  'neutral', 'sparkle', 'brand-bg',
  'positive', 'negative', 'warning', 'informative',
];

const SURFACE_MODES: Array<{ mode: 'default' | 'subtle' | 'bold' | 'elevated'; label: string }> = [
  { mode: 'default', label: 'Default' },
  { mode: 'subtle', label: 'Subtle' },
  { mode: 'bold', label: 'Bold' },
  { mode: 'elevated', label: 'Elevated' },
];


function SampleGroup({
  size = 'm',
  orientation = 'horizontal',
  appearance,
  withIcons = false,
  withBadge = false,
  disabled,
}: {
  size?: 's' | 'm' | 'l';
  orientation?: 'horizontal' | 'vertical';
  appearance?: ComponentAppearance;
  withIcons?: boolean;
  withBadge?: boolean;
  disabled?: 'b';
}) {
  const [value, setValue] = useState<string | number | null>('a');
  return (
    <TabGroup
      value={value}
      onValueChange={setValue}
      size={size}
      orientation={orientation}
      appearance={appearance}
    >
      <TabItem value="a" icon={withIcons ? <Icon name="home" /> : undefined}>
        Overview
      </TabItem>
      <TabItem
        value="b"
        disabled={disabled === 'b'}
        icon={withIcons ? <Icon name="mail" /> : undefined}
        badge={
          withBadge ? (
            <CounterBadge
              value={3}
              appearance="negative"
              size="s"
              aria-label="3 unread"
            />
          ) : undefined
        }
      >
        Inbox
      </TabItem>
      <TabItem value="c" icon={withIcons ? <Icon name="settings" /> : undefined}>
        Settings
      </TabItem>
    </TabGroup>
  );
}

export default function TabsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Tabs</h1>
        <p className={styles.description}>
          Accessible tabbed navigation built on Base UI Tabs. Three sizes (S/M/L), horizontal + vertical
          orientation, 12-role appearance, surface-aware double-ring focus halo. Ships with two APIs:
          flat (<code>TabGroup</code> + <code>TabItem</code> + <code>TabPanel</code>) and compound
          (<code>Tabs.Root</code> + <code>Tabs.List</code> + <code>Tabs.Item</code> + <code>Tabs.Panel</code>).
        </p>
      </div>

      <div className={styles.content}>
        {/* Default */}
        <FoundationCard
          title="Default"
          description="Flat API — TabGroup auto-renders List and Indicator. Horizontal orientation, size M, primary appearance."
        >
          <TabGroup defaultValue="overview">
            <TabItem value="overview">Overview</TabItem>
            <TabItem value="projects">Projects</TabItem>
            <TabItem value="account">Account</TabItem>
          </TabGroup>
        </FoundationCard>

        {/* Sizes */}
        <FoundationCard
          title="Sizes"
          description="S = 32px / Label XS, M = 40px / Label S, L = 48px / Label M. Figma-exact paddings (8/10/12)."
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-6)' }}>
            {(['s', 'm', 'l'] as const).map((size) => (
              <div key={size}>
                <p style={{ fontSize: 'var(--Label-XS-FontSize)', color: 'var(--Text-Low)', marginBottom: 'var(--Spacing-3-5)', textTransform: 'uppercase', fontWeight: 'var(--Label-FontWeight-Medium)' }}>
                  Size {size}
                </p>
                <SampleGroup size={size} />
              </div>
            ))}
          </div>
        </FoundationCard>

        {/* Orientations */}
        <FoundationCard
          title="Orientations"
          description="Horizontal: indicator at bottom edge. Vertical: 2px left-edge bar, height scales per size (24/32/36)."
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: 'var(--Spacing-6)', alignItems: 'flex-start' }}>
            <div>
              <p style={{ fontSize: 'var(--Label-XS-FontSize)', color: 'var(--Text-Low)', marginBottom: 'var(--Spacing-3-5)' }}>Horizontal</p>
              <SampleGroup />
            </div>
            <div>
              <p style={{ fontSize: 'var(--Label-XS-FontSize)', color: 'var(--Text-Low)', marginBottom: 'var(--Spacing-3-5)' }}>Vertical</p>
              <SampleGroup orientation="vertical" />
            </div>
          </div>
        </FoundationCard>

        {/* With slots */}
        <FoundationCard
          title="Icons & badges"
          description="TabItem accepts `icon` (leading) and `badge` (trailing) slots. Generic `start`/`end` props take precedence."
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-6)' }}>
            <div>
              <p style={{ fontSize: 'var(--Label-XS-FontSize)', color: 'var(--Text-Low)', marginBottom: 'var(--Spacing-3-5)' }}>With icon</p>
              <SampleGroup withIcons />
            </div>
            <div>
              <p style={{ fontSize: 'var(--Label-XS-FontSize)', color: 'var(--Text-Low)', marginBottom: 'var(--Spacing-3-5)' }}>With icon + counter badge</p>
              <SampleGroup withIcons withBadge />
            </div>
          </div>
        </FoundationCard>

        {/* Disabled */}
        <FoundationCard
          title="Disabled"
          description="Individual TabItems can be disabled. Base UI keyboard nav automatically skips them."
        >
          <SampleGroup disabled="b" />
        </FoundationCard>

        {/* Appearances */}
        <FoundationCard
          title="Appearance roles"
          description="All 9 multi-accent roles. Selected label + indicator use the role's accent-A11y / accent color."
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--Spacing-6)' }}>
            {APPEARANCE_ROLES.map((appearance) => (
              <div key={appearance}>
                <p style={{ fontSize: 'var(--Label-XS-FontSize)', color: 'var(--Text-Low)', marginBottom: 'var(--Spacing-3-5)', textTransform: 'capitalize' }}>
                  {appearance}
                </p>
                <SampleGroup appearance={appearance} />
              </div>
            ))}
          </div>
        </FoundationCard>

        {/* Surface context */}
        <FoundationCard
          title="Surface context"
          description="Place a TabGroup inside <Surface mode=…>. On bold surfaces, labels + indicator automatically flip to on-colour via the brand CSS engine's [data-surface] blocks."
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
            {SURFACE_MODES.map(({ mode, label }) => (
              <Surface key={mode} mode={mode}>
                <div style={{ padding: 'var(--Spacing-4-5)', display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3-5)' }}>
                  <span style={{ fontSize: 'var(--Label-XS-FontSize)', textTransform: 'uppercase', letterSpacing: '0.04em', opacity: 0.7 }}>
                    {label}
                  </span>
                  <SampleGroup />
                </div>
              </Surface>
            ))}
          </div>
        </FoundationCard>

        {/* Compound API */}
        <FoundationCard
          title="Compound API (Tabs.Root)"
          description="For advanced composition: render panels inline, add custom indicator styles, or nest additional wrappers."
        >
          <Tabs defaultValue="overview">
            <Tabs.List>
              <Tabs.Item value="overview">Overview</Tabs.Item>
              <Tabs.Item value="projects">Projects</Tabs.Item>
              <Tabs.Item value="account">Account</Tabs.Item>
              <Tabs.Indicator />
            </Tabs.List>
            <Tabs.Panel value="overview">
              <p style={{ color: 'var(--Text-Medium)' }}>Overview panel body.</p>
            </Tabs.Panel>
            <Tabs.Panel value="projects">
              <p style={{ color: 'var(--Text-Medium)' }}>Projects panel body.</p>
            </Tabs.Panel>
            <Tabs.Panel value="account">
              <p style={{ color: 'var(--Text-Medium)' }}>Account panel body.</p>
            </Tabs.Panel>
          </Tabs>
        </FoundationCard>

        {/* Usage */}
        <FoundationCard
          title="Usage"
          description="Import the flat API from @oneui/ui."
          collapsible
        >
          <pre className={styles.codeBlock}>
{`import { TabGroup, TabItem, TabPanel } from '@oneui/ui';

const [value, setValue] = useState('home');

<TabGroup value={value} onValueChange={setValue} size="m">
  <TabItem value="home" icon={<Icon name="home" />}>Home</TabItem>
  <TabItem value="inbox" badge={<CounterBadge value={3} />}>Inbox</TabItem>
  <TabItem value="settings" disabled>Settings</TabItem>
</TabGroup>

<TabPanel value="home">Home content</TabPanel>
<TabPanel value="inbox">Inbox content</TabPanel>`}
          </pre>
        </FoundationCard>
      </div>
    </div>
  );
}
