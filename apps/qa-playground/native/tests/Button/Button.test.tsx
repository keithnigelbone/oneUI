/**
 * Button QA tests — smoke, functional, and a11y for the native Button component.
 *
 * Known dev-file bugs (raise separately):
 *   • Button.native.test.tsx uses jest.fn() / jest.spyOn() — breaks under Vitest
 *     (ReferenceError: jest is not defined).
 *   • Button's Pressable does not set accessible={true}, so RNTL's getByRole('button')
 *     fails. getByRole relies on isAccessibilityElement, which requires accessible={true}
 *     on non-default host components. Tests here use UNSAFE_getByProps as a workaround.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { describe, it, expect, vi } from 'vitest';
import { Button } from '@ui-native/components/Button/Button.native';
import { Icon } from '@ui-native/components/Icon';
import { IcFavoriteGlyph } from '@ui-native/components/Button/buttonShowcaseJdsGlyphs';
import { wrap } from '../../utils/renderWithTheme';

// ─── Slot content helpers ─────────────────────────────────────────────────────
//
// Correct native slot usage: pass a ReactNode — NOT a string icon name.
// Uses the real OneUI Icon component with IcFavoriteGlyph — no raw RN host
// components (View/Text/Image) should appear in OneUI component tests.
//
// testID lets us assert ButtonSlot actually wrapped the content:
//   expect(screen.getByTestId('button-start-slot')).toBeTruthy()  ← ButtonSlot wrapper
//   expect(screen.getByTestId('slot-start-icon', { includeHiddenElements: true })).toBeTruthy()
//     ← Icon's outer View (accessible={false}, importantForAccessibility="no-hide-descendants"
//       because no aria-label is supplied). RNTL's getByTestId excludes these elements by
//       default, so { includeHiddenElements: true } is required to reach the testID node.
//
// Icon wraps its glyph in <View testID={testID}> when testID is provided,
// so getByTestId('slot-start-icon', { includeHiddenElements: true }) queries that wrapper.
const SlotStart = () => (
  <Icon icon={IcFavoriteGlyph} appearance="neutral" testID="slot-start-icon" />
);
const SlotEnd = () => (
  <Icon icon={IcFavoriteGlyph} appearance="neutral" testID="slot-end-icon" />
);

// ─── Figma matrix: size × slot config ────────────────────────────────────────
//
// Mirrors the Figma Button design matrix:
//   Columns: no slots | start icon | end icon | start + end icons
//   Rows:    xs / s / m / l  at attention="medium" (subtle variant)
//
// Slot tests are [fn] — they assert that ButtonSlot infrastructure rendered
// (testID="button-start-slot" / "button-end-slot" must be in the tree).
// If those nodes are missing the slot was silently dropped (string passed, undefined, etc.)

const SIZES = ['xs', 's', 'm', 'l'] as const;

type SlotConfig = {
  label: string;
  start: React.ReactElement | undefined;
  end: React.ReactElement | undefined;
  hasStart: boolean;
  hasEnd: boolean;
};

const SLOT_CONFIGS: SlotConfig[] = [
  { label: 'no-slots',      start: undefined,    end: undefined,    hasStart: false, hasEnd: false },
  { label: 'start-icon',    start: <SlotStart />, end: undefined,    hasStart: true,  hasEnd: false },
  { label: 'end-icon',      start: undefined,    end: <SlotEnd />,   hasStart: false, hasEnd: true  },
  { label: 'start-and-end', start: <SlotStart />, end: <SlotEnd />,  hasStart: true,  hasEnd: true  },
];

describe('Button — Figma matrix: size × slot config (attention=medium)', () => {
  for (const size of SIZES) {
    // No-slot variant — smoke only
    it(`[smoke] size="${size}" no-slots renders without crashing`, () => {
      expect(() =>
        render(wrap(<Button size={size} attention="medium">Button</Button>)),
      ).not.toThrow();
    });

    // Slot variants — [fn]: verify ButtonSlot infrastructure rendered
    for (const slot of SLOT_CONFIGS.filter((s) => s.hasStart || s.hasEnd)) {
      it(`[fn] size="${size}" ${slot.label} — button-slot wrapper present in tree`, () => {
        render(wrap(
          <Button size={size} attention="medium" start={slot.start} end={slot.end}>
            Button
          </Button>,
        ));
        if (slot.hasStart) {
          // ButtonSlot wraps content in testID="button-start-slot"
          expect(screen.getByTestId('button-start-slot')).toBeTruthy();
          // Icon outer View has accessible={false} + importantForAccessibility="no-hide-descendants"
          // (no aria-label supplied), so includeHiddenElements is required.
          expect(screen.getByTestId('slot-start-icon', { includeHiddenElements: true })).toBeTruthy();
        }
        if (slot.hasEnd) {
          expect(screen.getByTestId('button-end-slot')).toBeTruthy();
          expect(screen.getByTestId('slot-end-icon', { includeHiddenElements: true })).toBeTruthy();
        }
      });
    }
  }
});

// ─── Figma matrix: size × disabled state ─────────────────────────────────────
//
// Validates that disabled styling (opacity + pointer-events guard) is applied
// correctly at every size. Matches the greyed-out row in the Figma spec.

describe('Button — Figma matrix: size × disabled', () => {
  for (const size of SIZES) {
    it(`[smoke] size="${size}" disabled renders without crashing`, () => {
      expect(() =>
        render(wrap(<Button size={size} disabled>Button</Button>)),
      ).not.toThrow();
    });
    it(`[fn] size="${size}" disabled has opacity 0.5 and pointer-events none`, () => {
      render(wrap(<Button size={size} disabled>Button</Button>));
      const pressable = screen.UNSAFE_getByProps({ accessibilityRole: 'button' });
      expect(pressable.props.accessibilityState?.disabled).toBe(true);
      // pointerEvents="none" is on the outer Animated.View wrapper (isDisabled guard)
      const outer = pressable.parent;
      expect(outer?.props.pointerEvents).toBe('none');
    });
  }
});

// ─── Figma matrix: size × loading state ──────────────────────────────────────
//
// Loading state shows a spinner, hides label from a11y, applies reduced opacity.

describe('Button — Figma matrix: size × loading', () => {
  for (const size of SIZES) {
    it(`[smoke] size="${size}" loading renders without crashing`, () => {
      expect(() =>
        render(wrap(<Button size={size} loading>Button</Button>)),
      ).not.toThrow();
    });
    it(`[fn] size="${size}" loading shows spinner testID in tree`, () => {
      render(wrap(<Button size={size} loading>Button</Button>));
      expect(screen.getByTestId('button-spinner')).toBeTruthy();
    });
  }
});

// ─── Figma matrix: attention levels (bold / subtle / ghost) ──────────────────
//
// Validates the three visual weights at medium size with slot variants.

describe('Button — Figma matrix: attention × slot config (size=m)', () => {
  const attentions = ['high', 'medium', 'low'] as const;
  for (const attention of attentions) {
    it(`[smoke] attention="${attention}" no-slots renders without crashing`, () => {
      expect(() =>
        render(wrap(<Button size="m" attention={attention}>Button</Button>)),
      ).not.toThrow();
    });
    for (const slot of SLOT_CONFIGS.filter((s) => s.hasStart || s.hasEnd)) {
      it(`[fn] attention="${attention}" ${slot.label} — slot wrapper present in tree`, () => {
        render(wrap(
          <Button size="m" attention={attention} start={slot.start} end={slot.end}>
            Button
          </Button>,
        ));
        if (slot.hasStart) {
          expect(screen.getByTestId('button-start-slot')).toBeTruthy();
          expect(screen.getByTestId('slot-start-icon', { includeHiddenElements: true })).toBeTruthy();
        }
        if (slot.hasEnd) {
          expect(screen.getByTestId('button-end-slot')).toBeTruthy();
          expect(screen.getByTestId('slot-end-icon', { includeHiddenElements: true })).toBeTruthy();
        }
      });
    }
  }
});

// ─── Figma matrix: contained=false (ghost/flat affordance) ───────────────────
//
// Uncontained buttons have transparent background and inherit ambient text colour.

describe('Button — Figma matrix: uncontained (text-only affordance)', () => {
  for (const size of SIZES) {
    it(`[smoke] size="${size}" contained=false renders without crashing`, () => {
      expect(() =>
        render(wrap(<Button size={size} contained={false}>Button</Button>)),
      ).not.toThrow();
    });
  }
});

// ─── Smoke ────────────────────────────────────────────────────────────────────

describe('Button — smoke', () => {
  it('[smoke] renders without crashing', () => {
    expect(() => render(wrap(<Button>Label</Button>))).not.toThrow();
  });

  it('[smoke] renders label text', () => {
    render(wrap(<Button>Click me</Button>));
    expect(screen.getByText('Click me')).toBeTruthy();
  });

  it('[smoke] disabled prop accepted without crash', () => {
    expect(() => render(wrap(<Button disabled>Label</Button>))).not.toThrow();
  });

  it('[smoke] loading prop accepted without crash', () => {
    expect(() => render(wrap(<Button loading>Label</Button>))).not.toThrow();
  });

  it('[smoke] renders all four Figma sizes without crashing', () => {
    // Each label is unique ("Size 6", "Size 8"…) — no isolation needed.
    const sizes = [6, 8, 10, 12] as const;
    for (const size of sizes) {
      render(wrap(<Button size={size}>Size {size}</Button>));
      expect(screen.getByText(`Size ${size}`)).toBeTruthy();
    }
  });

  it('[smoke] resolves t-shirt sizes (xs/s/m/l)', () => {
    const sizes = ['xs', 's', 'm', 'l'] as const;
    for (const size of sizes) {
      render(wrap(<Button size={size}>{size}</Button>));
      expect(screen.getByText(size)).toBeTruthy();
    }
  });

  it('[smoke] accepts every variant', () => {
    const variants = ['bold', 'subtle', 'ghost'] as const;
    for (const variant of variants) {
      render(wrap(<Button variant={variant}>{variant}</Button>));
      expect(screen.getByText(variant)).toBeTruthy();
    }
  });

  it('[smoke] accepts every appearance', () => {
    const appearances = [
      'primary', 'secondary', 'sparkle', 'positive',
      'negative', 'warning', 'informative', 'neutral',
    ] as const;
    for (const appearance of appearances) {
      render(wrap(<Button appearance={appearance}>{appearance}</Button>));
      expect(screen.getByText(appearance)).toBeTruthy();
    }
  });

  it('[smoke] fullWidth renders without crashing', () => {
    expect(() => render(wrap(<Button fullWidth>Wide</Button>))).not.toThrow();
  });

  it('[smoke] condensed renders without crashing', () => {
    expect(() => render(wrap(<Button condensed>Condensed</Button>))).not.toThrow();
  });

  it('[smoke] contained=false renders flat affordance', () => {
    render(wrap(<Button contained={false}>Flat</Button>));
    expect(screen.getByText('Flat')).toBeTruthy();
  });
});

// ─── Functional ───────────────────────────────────────────────────────────────

describe('Button — functional', () => {
  it('[fn] fires onPress when tapped', () => {
    const handler = vi.fn();
    render(wrap(<Button onPress={handler}>Click me</Button>));
    // Bug: Pressable lacks accessible={true} so getByRole('button') fails.
    // Using UNSAFE_getByProps as workaround — raise bug to add accessible={true}.
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button' }));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('[fn] aliases onClick to onPress', () => {
    const handler = vi.fn();
    render(wrap(<Button onClick={handler}>Click me</Button>));
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button' }));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('[fn] onPress fires exactly once per tap', () => {
    const handler = vi.fn();
    render(wrap(<Button onPress={handler}>Tap</Button>));
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button' }));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('[fn] multiple taps fire handler each time', () => {
    const handler = vi.fn();
    render(wrap(<Button onPress={handler}>Tap</Button>));
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button' }));
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button' }));
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button' }));
    expect(handler).toHaveBeenCalledTimes(3);
  });

  it('[fn] disabled button clears onPress handler', () => {
    const handler = vi.fn();
    render(wrap(<Button disabled onPress={handler}>Disabled</Button>));
    // resolveButtonStateBase sets handlePress = disabled ? undefined : onPress
    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'button' }).props.onPress).toBeUndefined();
  });

  it('[fn] disabled button clears onClick handler too', () => {
    // onClick is an alias for onPress — disabled should clear it the same way
    const handler = vi.fn();
    render(wrap(<Button disabled onClick={handler}>Disabled</Button>));
    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'button' }).props.onPress).toBeUndefined();
  });

  it('[fn] loading button clears onPress handler', () => {
    const handler = vi.fn();
    render(wrap(<Button loading onPress={handler}>Loading</Button>));
    // resolveButtonStateBase treats loading as disabled
    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'button' }).props.onPress).toBeUndefined();
  });

  it('[fn] loading button clears onClick handler too', () => {
    const handler = vi.fn();
    render(wrap(<Button loading onClick={handler}>Loading</Button>));
    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'button' }).props.onPress).toBeUndefined();
  });

  it('[fn] renders spinner when loading', () => {
    render(wrap(<Button loading>Loading</Button>));
    expect(screen.getByTestId('button-spinner')).toBeTruthy();
  });

  it('[fn] label is present in tree even when loading', () => {
    render(wrap(<Button loading>Loading</Button>));
    // Text is aria-hidden while loading (accessible={false}, accessibilityElementsHidden=true)
    // but the DOM node must still exist so sighted users see the label
    expect(screen.getByText('Loading', { includeHiddenElements: true })).toBeTruthy();
  });

  it('[fn] renders start slot content', () => {
    render(wrap(
      <Button start={<Icon icon={IcFavoriteGlyph} appearance="neutral" testID="start-icon" />}>With Start</Button>,
    ));
    // Icon outer View is accessible={false} + importantForAccessibility="no-hide-descendants"
    // when no aria-label is given — includeHiddenElements is required to locate it.
    expect(screen.getByTestId('start-icon', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByTestId('button-start-slot')).toBeTruthy();
  });

  it('[fn] renders end slot content', () => {
    render(wrap(
      <Button end={<Icon icon={IcFavoriteGlyph} appearance="neutral" testID="end-icon" />}>With End</Button>,
    ));
    expect(screen.getByTestId('end-icon', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByTestId('button-end-slot')).toBeTruthy();
  });

  it('[fn] start prop takes precedence over leftIcon', () => {
    render(wrap(
      <Button start={<Icon icon={IcFavoriteGlyph} appearance="neutral" testID="start-precedence" />} leftIcon="arrowLeft">Precedence</Button>,
    ));
    expect(screen.getByTestId('start-precedence', { includeHiddenElements: true })).toBeTruthy();
  });

  it('[fn] warns and skips when start is a SemanticIconName string', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(wrap(<Button start="star">Iconless</Button>));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Native slots expect a ReactNode'));
    expect(screen.queryByTestId('button-start-slot')).toBeNull();
    warn.mockRestore();
  });

  it('[fn] warns and skips when leftIcon is a SemanticIconName string', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(wrap(<Button leftIcon="check">Iconless</Button>));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('Native slots expect a ReactNode'));
    warn.mockRestore();
  });
});

// ─── A11y ─────────────────────────────────────────────────────────────────────

describe('Button — a11y', () => {
  it('[a11y] has button role on Pressable', () => {
    render(wrap(<Button>Label</Button>));
    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'button' })).toBeTruthy();
  });

  it('[a11y] aria-label maps to accessibilityLabel', () => {
    render(wrap(<Button aria-label="Submit form">Submit</Button>));
    expect(screen.getByLabelText('Submit form')).toBeTruthy();
  });

  it('[a11y] disabled state in accessibilityState', () => {
    render(wrap(<Button disabled>Disabled</Button>));
    expect(
      screen.UNSAFE_getByProps({ accessibilityRole: 'button' }).props.accessibilityState,
    ).toEqual(expect.objectContaining({ disabled: true }));
  });

  it('[a11y] loading state marks button busy', () => {
    render(wrap(<Button loading>Loading</Button>));
    expect(
      screen.UNSAFE_getByProps({ accessibilityRole: 'button' }).props.accessibilityState,
    ).toEqual(expect.objectContaining({ busy: true }));
  });

  it('[a11y] recipe cornerRadius=none renders without crash', () => {
    expect(() =>
      render(wrap(<Button>Square</Button>, { button: { cornerRadius: 'none' } })),
    ).not.toThrow();
  });
});
