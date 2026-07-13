import { createElement } from 'react';
import { describe, expect, it } from 'vitest';
import {
  badgeChildrenArePlainText,
  badgeChildrenExposeAccessibility,
  badgeSlotNodeExposesAccessibility,
  badgeSlotsExposeAccessibility,
  getBadgeAccessibilityProps,
  getBadgeElementContentAccessibilityProps,
  getBadgeRootAccessibilityProps,
  getBadgeSlotWrapAccessibilityProps,
  getBadgeVisibleTextAccessibilityProps,
  resolveBadgeAppearance,
  resolveBadgeAccessibilityLabel,
  shouldExposeOffscreenBadgeLabel,
} from './interface';

describe('badgeA11y', () => {
  it('maps aria-label to accessibilityLabel (not aria-label prop)', () => {
    const props = getBadgeAccessibilityProps({ 'aria-label': 'Status', children: 'New' });
    expect(props.accessibilityLabel).toBe('Status');
    expect(props.accessible).toBe(true);
    expect(props.accessibilityLiveRegion).toBe('polite');
    expect((props as { 'aria-label'?: string })['aria-label']).toBeUndefined();
  });

  it('falls back to string children for the label', () => {
    expect(resolveBadgeAccessibilityLabel({ children: 'Beta' })).toBe('Beta');
  });

  it('uses text role only for plain string/number children', () => {
    expect(badgeChildrenArePlainText('Beta')).toBe(true);
    expect(getBadgeAccessibilityProps({ children: 'Beta' }).accessibilityRole).toBe('text');
    expect(getBadgeAccessibilityProps({ 'aria-label': 'Only label' }).accessibilityRole).toBe(
      'none',
    );
    expect(
      getBadgeAccessibilityProps({
        'aria-label': 'Status',
        children: createElement('View', { 'aria-label': 'icon' }),
      }).accessibilityRole,
    ).toBe('none');
  });

  it('does not treat ReactElement children as plain text labels', () => {
    const iconChild = createElement('View', { 'aria-label': 'Favorite' });
    expect(resolveBadgeAccessibilityLabel({ children: iconChild })).toBeUndefined();
    expect(badgeChildrenExposeAccessibility(iconChild)).toBe(true);
    expect(
      getBadgeElementContentAccessibilityProps(
        { 'aria-label': 'Status', children: iconChild },
        false,
      ),
    ).toEqual({ accessible: false, importantForAccessibility: 'no' });
    expect(getBadgeRootAccessibilityProps({ 'aria-label': 'Status', children: iconChild }, false)).toEqual({
      accessible: false,
      importantForAccessibility: 'auto',
    });
    expect(shouldExposeOffscreenBadgeLabel({ 'aria-label': 'Status', children: iconChild }, false)).toBe(
      true,
    );
  });

  it('maps native-only accessibilityHint', () => {
    expect(
      getBadgeAccessibilityProps({
        children: 'Beta',
        accessibilityHint: 'Double tap for details',
      }).accessibilityHint,
    ).toBe('Double tap for details');
  });

  it('detects accessible slot children via alt or aria-label', () => {
    expect(
      badgeSlotNodeExposesAccessibility(
        createElement('View', { alt: 'Jane Doe', content: 'text' }),
      ),
    ).toBe(true);
    expect(
      badgeSlotNodeExposesAccessibility(
        createElement('View', { 'aria-label': '3 unread', value: 3 }),
      ),
    ).toBe(true);
    expect(
      badgeSlotNodeExposesAccessibility(createElement('View', { alt: '', content: 'icon' })),
    ).toBe(false);
  });

  it('keeps root accessible when slots are decorative', () => {
    const props = { 'aria-label': 'Status', children: 'New' };
    expect(getBadgeRootAccessibilityProps(props, false).accessible).toBe(true);
    expect(getBadgeSlotWrapAccessibilityProps(props, false)).toEqual({
      importantForAccessibility: 'no-hide-descendants',
    });
    expect(getBadgeVisibleTextAccessibilityProps(props, false)).toEqual({
      accessible: false,
      importantForAccessibility: 'no',
    });
  });

  it('exposes slot descendants when a slot has its own label', () => {
    const props = {
      'aria-label': '3 unread messages',
      children: 'New',
      start: createElement('View', { alt: 'Jane Doe', content: 'text' }),
    };
    expect(badgeSlotsExposeAccessibility(props)).toBe(true);
    expect(getBadgeRootAccessibilityProps(props, true)).toEqual({
      accessible: false,
      importantForAccessibility: 'auto',
    });
    expect(getBadgeSlotWrapAccessibilityProps(props, true)).toEqual({
      importantForAccessibility: 'no',
    });
    expect(getBadgeVisibleTextAccessibilityProps(props, true)).toMatchObject({
      accessible: true,
      accessibilityLabel: '3 unread messages',
    });
    expect(shouldExposeOffscreenBadgeLabel(props, true)).toBe(false);
  });

  it('uses offscreen badge label when aria-label only and slots are accessible', () => {
    const props = {
      'aria-label': '3 unread messages',
      start: createElement('View', { alt: 'Jane Doe', content: 'text' }),
    };
    expect(shouldExposeOffscreenBadgeLabel(props, true)).toBe(true);
    expect(getBadgeVisibleTextAccessibilityProps(props, true).accessible).toBe(false);
  });

  it('resolves appearance from explicit prop, nearest Surface, then sparkle fallback', () => {
    expect(resolveBadgeAppearance('positive', 'secondary')).toBe('positive');
    expect(resolveBadgeAppearance('auto', 'secondary')).toBe('secondary');
    expect(resolveBadgeAppearance(undefined, 'secondary')).toBe('secondary');
    expect(resolveBadgeAppearance(undefined, null)).toBe('sparkle');
  });
});
