/**
 * IndicatorBadge QA tests — smoke, functional, and a11y.
 *
 * Source: packages/ui-native/src/components/IndicatorBadge/IndicatorBadge.native.tsx
 * Figma:  IndicatorBadge — size × appearance matrix (xs/s/m/l/xl × all appearances)
 *
 * ─── Component behaviour ─────────────────────────────────────────────────────
 *
 *   aria-label   When set:    accessible=true,  accessibilityRole='image',
 *                             accessibilityElementsHidden=false
 *                When omitted: accessible=false, accessibilityRole='none',
 *                              accessibilityElementsHidden=true (decorative mode)
 *   size         'xs' | 's' | 'm' | 'l' | 'xl'   default 'm'
 *   appearance   ComponentAppearance               default 'primary' (or slot parent)
 *
 *   Dimensions (width = height, perfect circle per size):
 *     xs → tokens.spacing['1']   = 4px,  borderRadius=2
 *     s  → tokens.spacing['1-5'] = 6px,  borderRadius=3
 *     m  → tokens.spacing['2']   = 8px,  borderRadius=4
 *     l  → tokens.spacing['3']   = 12px, borderRadius=6
 *     xl → tokens.spacing['4']   = 16px, borderRadius=8
 *
 * ─── A11y duality ────────────────────────────────────────────────────────────
 *
 *   With aria-label:    accessible=true,  role='image',  hidden=false
 *   Without aria-label: accessible=false, role='none',   hidden=true
 *
 *   NOTE: React test renderer strips accessible={false} (native default).
 *   Decorative mode: assert `el.props.accessible !== true` NOT `.toBe(false)`.
 *
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { describe, it, expect } from 'vitest';
import { tokens } from '@oneui/tokens';
import { IndicatorBadge } from '@ui-native/components/IndicatorBadge/IndicatorBadge.native';
import { wrap } from '../../utils/renderWithTheme';

// ─── Token-derived expected dimensions ───────────────────────────────────────
//
// Import token values directly so dimension tests stay in sync with design-token
// changes rather than hardcoding magic numbers that silently diverge.

const EXPECTED_SIZE = {
  xs: tokens.spacing['1'],    // 4px
  s:  tokens.spacing['1-5'],  // 6px
  m:  tokens.spacing['2'],    // 8px
  l:  tokens.spacing['3'],    // 12px
  xl: tokens.spacing['4'],    // 16px
} as const;

const SIZES       = ['xs', 's', 'm', 'l', 'xl'] as const;
const APPEARANCES = [
  'auto', 'neutral', 'primary', 'secondary', 'sparkle',
  'negative', 'positive', 'warning', 'informative',
] as const;

// ─── Style-flattening helper ──────────────────────────────────────────────────
//
// React Native style props are often arrays; merge into a plain object so
// individual style properties can be asserted directly.

function flatStyle(style: unknown): Record<string, unknown> {
  if (!style) return {};
  if (Array.isArray(style)) {
    return Object.assign({}, ...(style as unknown[]).map(flatStyle));
  }
  if (typeof style === 'object') return style as Record<string, unknown>;
  return {};
}

// ─── Figma matrix: size × appearance (accessible) ────────────────────────────
//
// The Figma IndicatorBadge matrix shows:
//   Rows:    xs / s / m / l / xl
//   Columns: neutral / primary / secondary / sparkle / negative / positive /
//            warning / informative  (+ auto delegates to primary)
//
// Smoke: every cell renders without crashing.
// Fn:    every cell exposes the correct role and accessible flag.

describe('IndicatorBadge — Figma matrix: size × appearance (accessible)', () => {
  for (const size of SIZES) {
    for (const appearance of APPEARANCES) {
      it(`[smoke] size="${size}" appearance="${appearance}" renders without crashing`, () => {
        expect(() =>
          render(wrap(
            <IndicatorBadge
              size={size}
              appearance={appearance}
              aria-label={`${size} ${appearance}`}
            />,
          )),
        ).not.toThrow();
      });

      it(`[fn] size="${size}" appearance="${appearance}" — accessible with image role`, () => {
        render(wrap(
          <IndicatorBadge
            size={size}
            appearance={appearance}
            aria-label={`${size}-${appearance}-label`}
            testID="ib-matrix"
          />,
        ));
        const el = screen.getByTestId('ib-matrix');
        expect(el.props.accessibilityRole).toBe('image');
        expect(el.props.accessible).toBe(true);
        expect(el.props.accessibilityLabel).toBe(`${size}-${appearance}-label`);
      });
    }
  }
});

// ─── Figma matrix: appearance (decorative, no aria-label) ────────────────────
//
// Each appearance should render silently in decorative mode (no label).

describe('IndicatorBadge — Figma matrix: appearance (decorative)', () => {
  for (const appearance of APPEARANCES) {
    it(`[smoke] appearance="${appearance}" decorative renders without crashing`, () => {
      expect(() =>
        render(wrap(<IndicatorBadge appearance={appearance} testID="deco-smoke" />)),
      ).not.toThrow();
    });
  }
});

// ─── Smoke ────────────────────────────────────────────────────────────────────

describe('IndicatorBadge — smoke', () => {
  it('[smoke] renders without crashing (decorative — no aria-label)', () => {
    expect(() => render(wrap(<IndicatorBadge />))).not.toThrow();
  });

  it('[smoke] renders with aria-label without crash', () => {
    expect(() =>
      render(wrap(<IndicatorBadge aria-label="Online status" />)),
    ).not.toThrow();
  });

  it('[smoke] renders all five size variants without crashing', () => {
    // Each aria-label is unique per size so getByLabelText works across iterations
    // without hitting duplicate-element errors.
    for (const size of SIZES) {
      const { unmount } = render(
        wrap(<IndicatorBadge size={size} aria-label={`size-${size}`} />),
      );
      expect(screen.getByLabelText(`size-${size}`)).toBeTruthy();
      unmount();
    }
    // Leave a mounted tree for afterEach cleanup
    render(wrap(<IndicatorBadge size="m" aria-label="final-smoke-size" />));
  });

  it('[smoke] renders all appearance values without crashing', () => {
    for (const appearance of APPEARANCES) {
      const { unmount } = render(
        wrap(<IndicatorBadge appearance={appearance} aria-label={`appearance-${appearance}`} />),
      );
      expect(screen.getByLabelText(`appearance-${appearance}`)).toBeTruthy();
      unmount();
    }
    render(wrap(<IndicatorBadge aria-label="final-smoke-appearance" />));
  });

  it('[smoke] custom style prop accepted without crash', () => {
    expect(() =>
      render(wrap(<IndicatorBadge aria-label="styled" style={{ margin: 4 }} />)),
    ).not.toThrow();
  });

  it('[smoke] testID prop accepted and forwarded without crash', () => {
    expect(() =>
      render(wrap(<IndicatorBadge testID="badge-testid-smoke" />)),
    ).not.toThrow();
  });

  it('[smoke] accessibilityHint prop accepted without crash', () => {
    expect(() =>
      render(wrap(
        <IndicatorBadge
          aria-label="User status"
          accessibilityHint="Green means online"
        />,
      )),
    ).not.toThrow();
  });
});

// ─── Functional — decorative mode (no aria-label) ────────────────────────────
//
// When aria-label is omitted the component enters "decorative" mode:
//   accessible=false, accessibilityRole='none', accessibilityElementsHidden=true.
//
// NOTE: React test renderer strips accessible={false} (native default),
// so use `not.toBe(true)` instead of `.toBe(false)` for accessible assertions.
//
// NOTE: Standard getByTestId / queryByTestId filter out accessibilityElementsHidden=true
// elements. Use `{ includeHiddenElements: true }` to reach the host View.

describe('IndicatorBadge — functional: decorative mode', () => {
  it('[fn] without aria-label accessibilityElementsHidden is true', () => {
    render(wrap(<IndicatorBadge testID="deco-hidden" />));
    const el = screen.getByTestId('deco-hidden', { includeHiddenElements: true });
    expect(el.props.accessibilityElementsHidden).toBe(true);
  });

  it('[fn] without aria-label element is not accessible (accessible is not true)', () => {
    render(wrap(<IndicatorBadge testID="deco-acc" />));
    const el = screen.getByTestId('deco-acc', { includeHiddenElements: true });
    // accessible={false} is stripped by React test renderer (native default);
    // assert negatively instead of .toBe(false).
    expect(el.props.accessible).not.toBe(true);
  });

  it('[fn] without aria-label accessibilityRole is "none"', () => {
    render(wrap(<IndicatorBadge testID="deco-role" />));
    const el = screen.getByTestId('deco-role', { includeHiddenElements: true });
    expect(el.props.accessibilityRole).toBe('none');
  });

  it('[fn] without aria-label no image role is queryable via getByRole', () => {
    render(wrap(<IndicatorBadge />));
    expect(screen.queryByRole('image')).toBeNull();
  });

  it('[fn] standard queryByTestId returns null for decorative badge (a11y-invisible)', () => {
    render(wrap(<IndicatorBadge testID="invisible-badge" />));
    // getByTestId without includeHiddenElements silently filters hidden elements
    expect(screen.queryByTestId('invisible-badge')).toBeNull();
  });

  it('[fn] without aria-label accessibilityLabel is undefined', () => {
    render(wrap(<IndicatorBadge testID="deco-no-label" />));
    const el = screen.getByTestId('deco-no-label', { includeHiddenElements: true });
    expect(el.props.accessibilityLabel).toBeUndefined();
  });
});

// ─── Functional — accessible mode (with aria-label) ─────────────────────────
//
// When aria-label is set the component becomes a queryable image landmark:
//   accessible=true, accessibilityRole='image', accessibilityLabel=ariaLabel,
//   accessibilityElementsHidden=false.

describe('IndicatorBadge — functional: accessible mode', () => {
  it('[fn] aria-label makes badge accessible (accessible=true)', () => {
    render(wrap(<IndicatorBadge aria-label="Online" testID="acc-accessible" />));
    expect(screen.getByTestId('acc-accessible').props.accessible).toBe(true);
  });

  it('[fn] aria-label sets accessibilityRole to "image"', () => {
    render(wrap(<IndicatorBadge aria-label="Status" testID="acc-role" />));
    expect(screen.getByTestId('acc-role').props.accessibilityRole).toBe('image');
  });

  it('[fn] aria-label is reflected in accessibilityLabel prop', () => {
    render(wrap(<IndicatorBadge aria-label="3 new messages" testID="acc-label" />));
    expect(screen.getByTestId('acc-label').props.accessibilityLabel).toBe('3 new messages');
  });

  it('[fn] getByRole("image") finds the accessible badge', () => {
    render(wrap(<IndicatorBadge aria-label="New notification" />));
    expect(screen.getByRole('image')).toBeTruthy();
  });

  it('[fn] getByRole("image", { name }) finds badge by its label', () => {
    render(wrap(<IndicatorBadge aria-label="Offline" />));
    expect(screen.getByRole('image', { name: 'Offline' })).toBeTruthy();
  });

  it('[fn] getByLabelText finds the badge via aria-label', () => {
    render(wrap(<IndicatorBadge aria-label="Online status" />));
    expect(screen.getByLabelText('Online status')).toBeTruthy();
  });

  it('[fn] with aria-label accessibilityElementsHidden is not true', () => {
    render(wrap(<IndicatorBadge aria-label="Active" testID="acc-not-hidden" />));
    const el = screen.getByTestId('acc-not-hidden');
    expect(el.props.accessibilityElementsHidden).not.toBe(true);
  });

  it('[fn] accessibilityHint is forwarded when aria-label is set', () => {
    render(wrap(
      <IndicatorBadge
        aria-label="User status"
        accessibilityHint="Green means online"
        testID="acc-hint"
      />,
    ));
    expect(
      screen.getByTestId('acc-hint').props.accessibilityHint,
    ).toBe('Green means online');
  });

  it('[fn] accessibilityHint is forwarded even in decorative mode (no aria-label)', () => {
    // accessibilityHint is passed through regardless of label presence.
    render(wrap(
      <IndicatorBadge accessibilityHint="Status dot" testID="deco-hint" />,
    ));
    const el = screen.getByTestId('deco-hint', { includeHiddenElements: true });
    expect(el.props.accessibilityHint).toBe('Status dot');
  });

  it('[fn] testID is forwarded to the host View', () => {
    render(wrap(<IndicatorBadge aria-label="Badge" testID="explicit-testid" />));
    expect(screen.getByTestId('explicit-testid')).toBeTruthy();
  });

  it('[fn] "auto" appearance renders correctly with aria-label (inherits slot or primary)', () => {
    render(wrap(<IndicatorBadge appearance="auto" aria-label="Auto appearance" testID="auto-app" />));
    const el = screen.getByTestId('auto-app');
    expect(el.props.accessibilityRole).toBe('image');
    expect(el.props.accessible).toBe(true);
  });
});

// ─── Functional — container dimensions ───────────────────────────────────────
//
// Each size has a specific pixel width and height from spacing tokens.
// The View style prop is an array; flatStyle() merges it to read individual values.
//
// NOTE: recipeBorderRadius from useComponentRecipe may override the sheet's
// borderRadius at render time. Width and height are stable (not overridable).

describe('IndicatorBadge — functional: container dimensions', () => {
  for (const size of SIZES) {
    it(`[fn] size="${size}" — container width is ${EXPECTED_SIZE[size]}px`, () => {
      render(wrap(
        <IndicatorBadge size={size} aria-label={`${size} indicator`} testID={`w-${size}`} />,
      ));
      const s = flatStyle(screen.getByTestId(`w-${size}`).props.style);
      expect(s.width).toBe(EXPECTED_SIZE[size]);
    });

    it(`[fn] size="${size}" — container height equals width (perfect circle)`, () => {
      render(wrap(
        <IndicatorBadge size={size} aria-label={`${size} indicator`} testID={`h-${size}`} />,
      ));
      const s = flatStyle(screen.getByTestId(`h-${size}`).props.style);
      expect(s.height).toBe(EXPECTED_SIZE[size]);
      expect(s.height).toBe(s.width);
    });

    it(`[fn] size="${size}" — borderRadius is a positive number (circle geometry)`, () => {
      // The style prop is an array: [sheetStyle, { borderRadius: resolvedOrUndefined }, bgStyle, userStyle].
      // When recipeBorderRadius and shape overrides are absent (default test theme),
      // the inline borderRadius object contains `undefined`, which overwrites the sheet
      // value in a flat merge. Read borderRadius from the sheet entry (index 0) directly.
      render(wrap(
        <IndicatorBadge size={size} aria-label={`${size} indicator`} testID={`br-${size}`} />,
      ));
      const styleArray = screen.getByTestId(`br-${size}`).props.style;
      // Sheet style is always the first entry in the array
      const sheetEntry = Array.isArray(styleArray) ? styleArray[0] : styleArray;
      const sheetStyle = flatStyle(sheetEntry);
      expect(typeof sheetStyle.borderRadius).toBe('number');
      expect((sheetStyle.borderRadius as number)).toBeGreaterThan(0);
    });
  }

  it('[fn] size="xs" and size="xl" produce distinct widths (sizes are unique)', () => {
    render(wrap(
      <>
        <IndicatorBadge size="xs" aria-label="xs" testID="cmp-xs" />
        <IndicatorBadge size="xl" aria-label="xl" testID="cmp-xl" />
      </>,
    ));
    const xs = flatStyle(screen.getByTestId('cmp-xs').props.style);
    const xl = flatStyle(screen.getByTestId('cmp-xl').props.style);
    expect((xs.width as number)).toBeLessThan(xl.width as number);
  });

  it('[fn] each successive size is strictly larger than the previous', () => {
    // Verifies the size scale is monotonically increasing: xs < s < m < l < xl
    expect(EXPECTED_SIZE.xs).toBeLessThan(EXPECTED_SIZE.s);
    expect(EXPECTED_SIZE.s).toBeLessThan(EXPECTED_SIZE.m);
    expect(EXPECTED_SIZE.m).toBeLessThan(EXPECTED_SIZE.l);
    expect(EXPECTED_SIZE.l).toBeLessThan(EXPECTED_SIZE.xl);
  });

  it('[fn] default size "m" produces 8px width', () => {
    render(wrap(<IndicatorBadge aria-label="default size" testID="dim-default" />));
    const s = flatStyle(screen.getByTestId('dim-default').props.style);
    expect(s.width).toBe(EXPECTED_SIZE.m);
  });

  it('[fn] custom style prop merges with size styles (extra props applied)', () => {
    render(wrap(
      <IndicatorBadge
        size="m"
        aria-label="custom style"
        style={{ margin: 4 }}
        testID="custom-style"
      />,
    ));
    const s = flatStyle(screen.getByTestId('custom-style').props.style);
    // Core dimensions still present after merge
    expect(s.width).toBe(EXPECTED_SIZE.m);
    expect(s.height).toBe(EXPECTED_SIZE.m);
    // Custom style merged in
    expect(s.margin).toBe(4);
  });
});

// ─── A11y ─────────────────────────────────────────────────────────────────────

describe('IndicatorBadge — a11y', () => {
  it('[a11y] with aria-label rendered as accessible image', () => {
    render(wrap(<IndicatorBadge aria-label="Online" />));
    expect(screen.getByRole('image', { name: 'Online' })).toBeTruthy();
  });

  it('[a11y] without aria-label element is hidden from a11y tree', () => {
    render(wrap(<IndicatorBadge testID="a11y-deco" />));
    expect(
      screen.getByTestId('a11y-deco', { includeHiddenElements: true }).props
        .accessibilityElementsHidden,
    ).toBe(true);
  });

  it('[a11y] aria-label maps to accessibilityLabel', () => {
    render(wrap(<IndicatorBadge aria-label="User is online" />));
    expect(screen.getByLabelText('User is online')).toBeTruthy();
  });

  it('[a11y] decorative badge is not findable via standard getByRole', () => {
    render(wrap(<IndicatorBadge />));
    expect(screen.queryByRole('image')).toBeNull();
    expect(screen.queryByRole('none')).toBeNull();
  });

  it('[a11y] accessible badge has no accessibilityElementsHidden flag', () => {
    render(wrap(<IndicatorBadge aria-label="Active" testID="a11y-visible" />));
    expect(screen.getByTestId('a11y-visible').props.accessibilityElementsHidden).not.toBe(true);
  });

  it('[a11y] multiple indicators with different labels are independently queryable', () => {
    render(wrap(
      <>
        <IndicatorBadge aria-label="Online" />
        <IndicatorBadge aria-label="Offline" />
        <IndicatorBadge aria-label="Busy" />
      </>,
    ));
    expect(screen.getByRole('image', { name: 'Online' })).toBeTruthy();
    expect(screen.getByRole('image', { name: 'Offline' })).toBeTruthy();
    expect(screen.getByRole('image', { name: 'Busy' })).toBeTruthy();
  });

  it('[a11y] accessibilityHint is surfaced to screen readers when set', () => {
    render(wrap(
      <IndicatorBadge
        aria-label="User status"
        accessibilityHint="Tap to see details"
        testID="a11y-hint"
      />,
    ));
    expect(
      screen.getByTestId('a11y-hint').props.accessibilityHint,
    ).toBe('Tap to see details');
  });
});

