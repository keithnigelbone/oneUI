'use client';

import React, { useState, type CSSProperties, type ReactNode } from 'react';
import { SegmentedControl } from '@oneui/ui/components/SegmentedControl';
import type {
  SegmentedControlAttention,
  SegmentedControlProps,
  SegmentedControlShape,
  SegmentedControlSize,
  SegmentedControlTrackEmphasis,
  SegmentedControlType,
} from '@oneui/ui/components/SegmentedControl';
import type { ComponentAppearance } from '@oneui/shared';
import { CounterBadge } from '@oneui/ui/components/CounterBadge';
import { Icon } from '@oneui/ui/components/Icon';

export const FIGMA_SIZES: { figma: string; size: SegmentedControlSize }[] = [
  { figma: 'S', size: 's' },
  { figma: 'M', size: 'm' },
  { figma: 'L', size: 'l' },
];

export const FIGMA_ATTENTIONS: SegmentedControlAttention[] = ['high', 'medium', 'low'];

export const FIGMA_APPEARANCES = [
  'auto',
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'positive',
  'negative',
  'informative',
  'warning',
] as const satisfies readonly ComponentAppearance[];

export const FIGMA_SHAPES: SegmentedControlShape[] = ['pill', 'rectangular'];

export const FIGMA_TRACK_EMPHASIS: SegmentedControlTrackEmphasis[] = ['high', 'medium', 'low'];

export const rowLabelStyle: CSSProperties = {
  minWidth: 'var(--Spacing-24)',
  flexShrink: 0,
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Body-S-FontSize)',
  lineHeight: 'var(--Body-S-LineHeight)',
  fontWeight: 'var(--Body-FontWeight-Medium)',
  color: 'var(--Text-Medium)',
};

/** `SegmentedControl` root does not forward `data-testid` — wrap for Playwright. */
export function QaSc({
  testId,
  children,
  className,
}: {
  testId: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div data-testid={testId} className={className} style={{ display: 'inline-flex', maxWidth: '100%' }}>
      {children}
    </div>
  );
}

export function QaListIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden>
      <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" fill="currentColor" />
    </svg>
  );
}

export function QaGridIcon() {
  return <Icon name="grid" size="m" aria-hidden />;
}

export function QaHomeIcon() {
  return <Icon name="home" size="m" aria-hidden />;
}

export function QaUserIcon() {
  return <Icon name="user" size="m" aria-hidden />;
}

export function QaOrdersIcon() {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden>
      <path
        d="M7 4h10l1 3h3v2H3V7h3l1-3zm-1 7h12v9H6v-9z"
        fill="currentColor"
      />
    </svg>
  );
}

type ControlledProps = Omit<SegmentedControlProps, 'children' | 'value' | 'onValueChange' | 'defaultValue'> & {
  testId?: string;
  defaultValue?: string;
  value?: string;
  children: ReactNode;
  onValueChange?: (value: string) => void;
};

/** Controlled wrapper for interaction demos. */
export function ControlledSegments({
  testId,
  defaultValue = 'a',
  value: controlledValue,
  children,
  onValueChange,
  'aria-label': ariaLabel = 'Segmented control',
  ...rest
}: ControlledProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleChange = (next: string) => {
    if (!isControlled) {
      setInternalValue(next);
    }
    onValueChange?.(next);
  };

  const control = (
    <SegmentedControl
      {...rest}
      value={value}
      onValueChange={handleChange}
      aria-label={ariaLabel}
    >
      {children}
    </SegmentedControl>
  );

  if (!testId) return control;
  return <QaSc testId={testId}>{control}</QaSc>;
}

export function TextThreeItems({ prefix = '' }: { prefix?: string }) {
  return (
    <>
      <SegmentedControl.Item value={`${prefix}a`}>Day</SegmentedControl.Item>
      <SegmentedControl.Item value={`${prefix}b`}>Week</SegmentedControl.Item>
      <SegmentedControl.Item value={`${prefix}c`}>Month</SegmentedControl.Item>
    </>
  );
}

export function IconThreeItems({ prefix = '' }: { prefix?: string }) {
  return (
    <>
      <SegmentedControl.Item value={`${prefix}a`} start={<QaListIcon />} aria-label="List view" />
      <SegmentedControl.Item value={`${prefix}b`} start={<QaGridIcon />} aria-label="Grid view" />
      <SegmentedControl.Item value={`${prefix}c`} start={<QaHomeIcon />} aria-label="Home view" />
    </>
  );
}

export function SlotNavItems() {
  return (
    <>
      <SegmentedControl.Item
        value="home"
        start={<QaHomeIcon />}
        end={<CounterBadge value={3} aria-label="3 notifications" />}
      >
        Home
      </SegmentedControl.Item>
      <SegmentedControl.Item
        value="orders"
        start={<QaOrdersIcon />}
        end={<CounterBadge value={12} aria-label="12 orders" />}
      >
        Orders
      </SegmentedControl.Item>
      <SegmentedControl.Item value="profile" start={<QaUserIcon />}>
        Profile
      </SegmentedControl.Item>
    </>
  );
}
