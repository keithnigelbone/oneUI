/**
 * Skeleton.test.tsx — PRD acceptance criteria (§7)
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeAll, vi } from 'vitest';
import styles from './Skeleton.module.css';
import { SkeletonGroup } from './SkeletonGroup';
import { SkeletonItem } from './SkeletonItem';
import type { SkeletonGroupProps, SkeletonItemProps } from './Skeleton.shared';

beforeAll(() => {
  if (!('ResizeObserver' in globalThis)) {
    class RO {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    (globalThis as typeof globalThis & { ResizeObserver: typeof RO }).ResizeObserver = RO;
  }
});

function getItems(container: HTMLElement) {
  return container.querySelectorAll(`.${styles.item}`);
}

function getShimmers(container: HTMLElement) {
  return container.querySelectorAll(`.${styles.shimmer}`);
}

import type { SkeletonGroupProps, SkeletonItemProps } from './Skeleton.shared';
import { normalizeSkeletonLength } from './Skeleton.shared';

describe('normalizeSkeletonLength', () => {
  it('coerces numeric strings and Storybook brace notation', () => {
    expect(normalizeSkeletonLength('200')).toBe(200);
    expect(normalizeSkeletonLength('{200}')).toBe(200);
    expect(normalizeSkeletonLength('{1000}')).toBe(1000);
  });

  it('treats empty and invalid values as undefined', () => {
    expect(normalizeSkeletonLength('')).toBeUndefined();
    expect(normalizeSkeletonLength('not-a-size')).toBeUndefined();
    expect(normalizeSkeletonLength(0)).toBeUndefined();
  });

  it('keeps valid CSS length strings', () => {
    expect(normalizeSkeletonLength('100%')).toBe('100%');
    expect(normalizeSkeletonLength('12px')).toBe('12px');
  });
});

describe('SkeletonItem', () => {
  it('renders at explicit width/height and ignores children for sizing', () => {
    const { container } = render(
      <SkeletonItem width={180} height={20}>
        <span>Should not render</span>
      </SkeletonItem>,
    );

    const item = getItems(container)[0] as HTMLElement;
    expect(item).toHaveStyle({ width: '180px', height: '20px' });
    expect(container.textContent).toBe('');
  });

  it('fills the missing axis when only one explicit dimension is set', () => {
    const { container } = render(<SkeletonItem width={180} />);
    const item = getItems(container)[0] as HTMLElement;
    expect(item).toHaveStyle({ width: '180px' });
    expect(item.style.height).toContain('var(--Skeleton-fallbackHeight');
  });

  it('infers size from children and does not visibly paint them', async () => {
    render(
      <SkeletonItem>
        <span data-testid="measure-child" style={{ display: 'inline-block', width: 120, height: 24 }}>
          Label
        </span>
      </SkeletonItem>,
    );

    const measure = screen.getByTestId('measure-child');
    expect(measure.parentElement).toHaveClass(styles.measure);

    await waitFor(() => {
      const item = measure.parentElement?.parentElement as HTMLElement;
      expect(item).toHaveStyle({ width: '120px', height: '24px' });
    });
  });

  it('renders fallback default box when no size and no children', () => {
    const { container } = render(<SkeletonItem />);
    const item = container.querySelector('[data-fallback="true"]');
    expect(item).toBeTruthy();
    expect(item).toHaveAttribute('aria-hidden', 'true');
  });

  it('uses fallback when measured child size is 0×0', async () => {
    const { container } = render(
      <SkeletonItem>
        <span data-testid="zero-child" style={{ display: 'inline-block', width: 0, height: 0 }} />
      </SkeletonItem>,
    );

    expect(screen.getByTestId('zero-child')).toBeInTheDocument();
    await waitFor(() => {
      expect(container.querySelector('[data-fallback="true"]')).toBeTruthy();
    });
  });

  it('only uses immediate child size — nested SkeletonItem does not recurse', async () => {
    const { container } = render(
      <SkeletonItem>
        <div data-testid="wrapper" style={{ display: 'inline-block', width: 140, height: 32 }}>
          <SkeletonItem width={10} height={10} />
        </div>
      </SkeletonItem>,
    );

    await waitFor(() => {
      const outerItem = getItems(container)[0] as HTMLElement;
      expect(outerItem).toHaveStyle({ width: '140px', height: '32px' });
    });
    expect(getItems(container)).toHaveLength(2);
  });

  it('does not expose forbidden public props on SkeletonItemProps', () => {
    type ForbiddenKeys = 'shape' | 'animation' | 'delay' | 'offset' | 'index' | 'variant' | 'stagger';
    type PublicKeys = keyof SkeletonItemProps;
    type AssertNoForbidden = Exclude<ForbiddenKeys, PublicKeys>;
    const _assert: AssertNoForbidden extends never ? true : never = true;
    expect(_assert).toBe(true);
  });
});

describe('SkeletonGroup', () => {
  it('staggers shimmer delay by child index × Motion-Offset-L', () => {
    const { container } = render(
      <SkeletonGroup>
        <SkeletonItem width={40} height={8} />
        <SkeletonItem width={40} height={8} />
        <SkeletonItem width={40} height={8} />
      </SkeletonGroup>,
    );

    const slots = container.querySelectorAll(`.${styles.groupSlot}`);
    expect(slots.length).toBe(3);
    expect((slots[0] as HTMLElement).style.getPropertyValue('--_skeleton-stagger-index')).toBe('0');
    expect((slots[1] as HTMLElement).style.getPropertyValue('--_skeleton-stagger-index')).toBe('1');
    expect((slots[2] as HTMLElement).style.getPropertyValue('--_skeleton-stagger-index')).toBe('2');
  });

  it('omits non-SkeletonItem direct children', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const { container } = render(
      <SkeletonGroup>
        <SkeletonItem width={20} height={8} />
        <div data-testid="invalid">Not allowed</div>
        <SkeletonItem width={20} height={8} />
      </SkeletonGroup>,
    );

    expect(getItems(container)).toHaveLength(2);
    expect(screen.queryByTestId('invalid')).not.toBeInTheDocument();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('does not expose forbidden public props on SkeletonGroupProps', () => {
    type ForbiddenKeys = 'shape' | 'animation' | 'delay' | 'offset' | 'index' | 'variant' | 'stagger';
    type PublicKeys = keyof SkeletonGroupProps;
    type AssertNoForbidden = Exclude<ForbiddenKeys, PublicKeys>;
    const _assert: AssertNoForbidden extends never ? true : never = true;
    expect(_assert).toBe(true);
  });
});
