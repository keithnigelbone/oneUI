'use client';

/**
 * Tabs.showcase.tsx
 *
 * Reusable showcase sections for the Storybook + platform docs page.
 * Renders sizes × orientations × appearances × surface-context demo.
 */

'use client';

import React, { useState } from 'react';
import { TabGroup } from './TabGroup';
import { TabItem } from './TabItem';
import type { TabsOrientation, TabsSize } from './Tabs.shared';
import type { ComponentAppearance } from '@oneui/shared';
import { Surface } from '../Surface/Surface';
import { Icon } from '../../icons/Icon';
import { CounterBadge } from '../CounterBadge/CounterBadge';

const APPEARANCES: readonly ComponentAppearance[] = [
  'primary', 'secondary', 
  'neutral', 'sparkle', 'brand-bg',
  'positive', 'negative', 'warning', 'informative',
];

const SIZES: readonly TabsSize[] = ['s', 'm', 'l'];
const ORIENTATIONS: readonly TabsOrientation[] = ['horizontal', 'vertical'];

function SampleGroup({
  size = 'm',
  orientation = 'horizontal',
  appearance,
  withSlots = false,
}: {
  size?: TabsSize;
  orientation?: TabsOrientation;
  appearance?: ComponentAppearance;
  withSlots?: boolean;
}) {
  const [value, setValue] = useState<string | number | null>('one');
  return (
    <TabGroup value={value} onValueChange={setValue} size={size} orientation={orientation} appearance={appearance}>
      <TabItem
        value="one"
        start={withSlots ? <Icon name="home" /> : undefined}
      >
        Overview
      </TabItem>
      <TabItem
        value="two"
        start={withSlots ? <Icon name="mail" /> : undefined}
        end={withSlots ? <CounterBadge value={3} size="xs" appearance="negative" aria-label="3 unread messages" /> : undefined}
      >
        Inbox
      </TabItem>
      <TabItem
        value="three"
        start={withSlots ? <Icon name="settings" /> : undefined}
      >
        Settings
      </TabItem>
    </TabGroup>
  );
}

export function TabsSizes() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-6)' }}>
      {SIZES.map((size) => (
        <div key={size}>
          <h4 style={{ fontSize: 'var(--Label-S-FontSize)', lineHeight: 'var(--Label-S-LineHeight)', color: 'var(--Text-Low)', marginBottom: 'var(--Spacing-3-5)' }}>
            Size {size.toUpperCase()}
          </h4>
          <SampleGroup size={size} />
        </div>
      ))}
    </div>
  );
}

export function TabsOrientations() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--Spacing-6)' }}>
      {ORIENTATIONS.map((orientation) => (
        <div key={orientation}>
          <h4 style={{ fontSize: 'var(--Label-S-FontSize)', lineHeight: 'var(--Label-S-LineHeight)', color: 'var(--Text-Low)', marginBottom: 'var(--Spacing-3-5)', textTransform: 'capitalize' }}>
            {orientation}
          </h4>
          <SampleGroup orientation={orientation} />
        </div>
      ))}
    </div>
  );
}

export function TabsAppearances() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--Spacing-6)' }}>
      {APPEARANCES.map((appearance) => (
        <div key={appearance}>
          <h4 style={{ fontSize: 'var(--Label-S-FontSize)', lineHeight: 'var(--Label-S-LineHeight)', color: 'var(--Text-Low)', marginBottom: 'var(--Spacing-3-5)', textTransform: 'capitalize' }}>
            {appearance}
          </h4>
          <SampleGroup appearance={appearance} />
        </div>
      ))}
    </div>
  );
}

export function TabsWithIcons() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-6)' }}>
      <div>
        <h4 style={{ fontSize: 'var(--Label-S-FontSize)', lineHeight: 'var(--Label-S-LineHeight)', color: 'var(--Text-Low)', marginBottom: 'var(--Spacing-3-5)' }}>Icons only</h4>
        <SampleGroup withSlots />
      </div>
      <div>
        <h4 style={{ fontSize: 'var(--Label-S-FontSize)', lineHeight: 'var(--Label-S-LineHeight)', color: 'var(--Text-Low)', marginBottom: 'var(--Spacing-3-5)' }}>Icons + badge</h4>
        <SampleGroup withSlots />
      </div>
    </div>
  );
}

export function TabsSurfaceContext() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      <Surface mode="default">
        <div style={{ padding: 'var(--Spacing-4-5)' }}>
          <p style={{ color: 'var(--Text-Low)', fontSize: 'var(--Label-XS-FontSize)', marginBottom: 'var(--Spacing-3-5)' }}>
            Default surface
          </p>
          <SampleGroup />
        </div>
      </Surface>
      <Surface mode="subtle">
        <div style={{ padding: 'var(--Spacing-4-5)' }}>
          <p style={{ color: 'var(--Text-Low)', fontSize: 'var(--Label-XS-FontSize)', marginBottom: 'var(--Spacing-3-5)' }}>
            Subtle surface — tinted panel background
          </p>
          <SampleGroup />
        </div>
      </Surface>
      <Surface mode="bold">
        <div style={{ padding: 'var(--Spacing-4-5)' }}>
          <p style={{ fontSize: 'var(--Label-XS-FontSize)', marginBottom: 'var(--Spacing-3-5)' }}>
            Bold surface — label + indicator remap to on-colour via data-surface
          </p>
          <SampleGroup />
        </div>
      </Surface>
    </div>
  );
}

export function TabsAdoptionMatrix() {
  const surfaceModes = ['default', 'subtle', 'bold'] as const;
  const appearances = ['primary', 'secondary', 'neutral', 'negative'] as const;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      {surfaceModes.map((mode) => (
        <Surface key={mode} mode={mode}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)', padding: 'var(--Spacing-4-5)' }}>
            <p style={{ color: 'var(--Text-Low)', fontSize: 'var(--Label-XS-FontSize)', lineHeight: 'var(--Label-XS-LineHeight)', margin: 0 }}>
              {mode} surface
            </p>
            {appearances.map((appearance) => (
              <div key={appearance} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
                <span style={{ color: 'var(--Text-Low)', fontSize: 'var(--Label-XS-FontSize)', lineHeight: 'var(--Label-XS-LineHeight)', textTransform: 'capitalize' }}>
                  {appearance}
                </span>
                <SampleGroup appearance={appearance} withSlots />
              </div>
            ))}
          </div>
        </Surface>
      ))}
    </div>
  );
}

/**
 * Idle vs keyboard-focused state — uses data-force-state="focus" to render
 * the focus halo on the stateLayer without requiring actual keyboard navigation.
 */
export function TabsFocusState() {
  const labelStyle: React.CSSProperties = {
    fontSize: 'var(--Label-XS-FontSize)',
    color: 'var(--Text-Low)',
  };
  const labeledItem: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--Spacing-3)',
    alignItems: 'flex-start',
  };
  return (
    <div style={{ display: 'flex', gap: 'var(--Spacing-6)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <div style={labeledItem}>
        <TabGroup defaultValue="one">
          <TabItem value="one">Overview</TabItem>
          <TabItem value="two">Details</TabItem>
          <TabItem value="three">Settings</TabItem>
        </TabGroup>
        <span style={labelStyle}>Idle</span>
      </div>
      <div style={labeledItem}>
        <TabGroup defaultValue="one">
          <TabItem value="one">Overview</TabItem>
          <TabItem value="two" data-force-state="focus">Details</TabItem>
          <TabItem value="three">Settings</TabItem>
        </TabGroup>
        <span style={labelStyle}>Focus (on Details tab)</span>
      </div>
    </div>
  );
}