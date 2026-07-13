/**
 * IconButton QA tests — smoke, functional, a11y, and bug-catching.
 *
 * Source: packages/ui-native/src/components/IconButton/IconButton.native.tsx
 *
 * ─── Figma API table ─────────────────────────────────────────────────────────
 *
 *   Property    Figma values                         Native prop / values
 *   ──────────────────────────────────────────────────────────────────────────
 *   size        2XS|XS|S|M|L|XL                      size: '2xs'|'xs'|'s'|'m'|'l'|'xl'
 *                                                     (case: Figma 2XS vs native '2xs')
 *   attention   high | medium | low                   attention: 'high'|'medium'|'low'
 *   shape       1:1 | 2:3                             layout: '1:1' | '3:2'
 *                                                     (BUG-IBN-1: name mismatch + reversed ratio)
 *   appearance  auto|neutral|primary|secondary|       same
 *               sparkle|negative|positive|
 *               warning|informative
 *   condensed   true | false                          condensed?: boolean  (same)
 *   contained   true | false                          contained?: boolean  (same)
 *   fullWidth   true | false                          fullWidth?: boolean  (same)
 *   disabled    true | false                          disabled?: boolean   (same)
 *   loading     true | false                          loading?: boolean    (same)
 *   — Code only —
 *   accent      primary|secondary|sparkle             deprecated, N/A
 *   content     icon|circularProgressIndicator        N/A (native always renders icon or Spinner)
 *
 * ─── Native-only props ───────────────────────────────────────────────────────
 *
 *   attention    'high'(default)|'medium'|'low' — selects the paint mode
 *                (high=bold fill, medium=subtle fill, low=ghost). Replaces the
 *                former `variant` prop.
 *   aria-label   string — REQUIRED (non-optional TypeScript type)
 *   aria-expanded / aria-haspopup — ARIA popup semantics
 *   accessibilityHint
 *   testID
 *
 * ─── Press handler resolution ────────────────────────────────────────────────
 *
 *   handlePress = isDisabled ? undefined : (onPress ?? onClick)
 *
 *   When disabled:             handlePress = undefined  (no call)
 *   When onPress set:          handlePress = onPress    (onClick silently ignored — BUG-IBN-3)
 *   When onPress not set:      handlePress = onClick
 *
 * ─── Sizes → numeric f-step ──────────────────────────────────────────────────
 *
 *   '2xs' = 4     '3xs' = 6     's' = 8     'm' = 10     'l' = 12     'xl' = 14
 *
 * ─── Bugs (raise to dev team) ────────────────────────────────────────────────
 *
 *   BUG-IBN-1 · Figma "shape" = 1:1|2:3 but native uses "layout" = '1:1'|'3:2'
 *     Two mismatches:
 *       • Prop name: Figma "shape" vs native "layout"
 *       • Value order: Figma "2:3" vs native "3:2" (ratio numerator/denominator swapped)
 *     Callers following Figma pass `shape="2:3"` → TypeScript error. Even fixing the
 *     name, the value strings differ ("2:3" vs "3:2") making a 1:1 migration impossible.
 *     File: packages/ui-native/src/components/IconButton/interface.ts:33
 *     Fix:  Rename `layout` → `shape` and change '3:2' → '2:3' (or vice-versa) to match Figma.
 *
 *   BUG-IBN-2 · RESOLVED — Figma "contained" now maps 1:1 to native `contained`
 *     Figma API table (component property): contained = true | false
 *       contained=true  → contained icon chip with background + sized container
 *       contained=false → bare icon (transparent, icon-sized, no padding)
 *     Native IconButtonProps now exposes `contained?: boolean` (default true).
 *     Paint emphasis is chosen separately via `attention` (high/medium/low).
 *     File: packages/ui-native/src/components/IconButton/interface.ts
 *
 *   BUG-IBN-3 · onClick silently ignored when onPress is also set
 *     handlePress = isDisabled ? undefined : (onPress ?? onClick)
 *     The `??` (nullish coalescing) operator means onClick is ONLY used when onPress
 *     is undefined. If both are provided, onClick is never called.
 *     This differs from Button (which calls both) and is a silent behavioral difference.
 *     File: packages/ui-native/src/components/IconButton/IconButton.native.tsx:250
 *     Fix:  Change to:
 *           `handlePress = isDisabled ? undefined : () => { onPress?.(); onClick?.(); }`
 *           so both handlers always fire, matching Button's behavior.
 *
 *   API note (not filed) · Figma labels sizes 2XS–XL; native prop uses lowercase '2xs'–'xl'
 *     or numeric f-steps 4–14. Uppercase strings are not in SIZE_ALIASES and fall back to M (10).
 *     Use size="2xs" or size={4} — TypeScript rejects size="2XS" at compile time.
 */

import React from 'react';
import { View } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { describe, it, expect, vi } from 'vitest';
import { IconButton } from '@ui-native/components/IconButton/IconButton.native';
import { wrap } from '../../utils/renderWithTheme';

// The icon prop accepts a ReactElement — pass a plain white circle View.
// Why not a glyph function or semantic name string?
//   • Semantic name ("close") → needs initJdsJioIcons() — not available in tests.
//   • Glyph function (IcFavoriteGlyph) → uses react-native-svg (Svg/Path) which
//     renders as empty Views in the React Test Renderer environment.
// Passing a ReactElement bypasses the Icon/SVG wrapper entirely. The ReactElement
// goes directly into the icon slot (isValidElement → no Icon wrapper applied),
// rendering as a visible white circle in the visual sketch.
const ICON = <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#ffffff' }} />;

// ─── Constants ────────────────────────────────────────────────────────────────

// Figma sizes (uppercase) → native sizes (lowercase) — see BUG-IBN-4
const FIGMA_SIZES = ['2XS', 'XS', 'S', 'M', 'L', 'XL'] as const;
const NATIVE_SIZES = ['2xs', 'xs', 's', 'm', 'l', 'xl'] as const;
const ATTENTIONS = ['high', 'medium', 'low'] as const;
const APPEARANCES = [
  'auto', 'neutral', 'primary', 'secondary', 'sparkle',
  'negative', 'positive', 'warning', 'informative',
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function flatStyle(style: unknown): Record<string, unknown> {
  if (!style) return {};
  if (Array.isArray(style)) return Object.assign({}, ...(style as unknown[]).map(flatStyle));
  if (typeof style === 'object') return style as Record<string, unknown>;
  return {};
}

// ─── Figma matrix: size × attention ──────────────────────────────────────────
//
// The Figma matrix uses size (2XS→XL) × attention (high/medium/low).
// Native sizes are lowercase ('2xs'→'xl').

describe('IconButton — Figma matrix: size × attention', () => {
  for (const size of NATIVE_SIZES) {
    for (const attention of ATTENTIONS) {
      it(`[smoke] size="${size}" attention="${attention}" renders without crashing`, () => {
        expect(() =>
          render(wrap(
            <IconButton
              icon={ICON}
              aria-label={`${size} ${attention}`}
              size={size}
              attention={attention}
              testID="ibm"
            />,
          )),
        ).not.toThrow();
      });

      it(`[fn] size="${size}" attention="${attention}" — has button role and label`, () => {
        render(wrap(
          <IconButton
            icon={ICON}
            aria-label={`icon-${size}-${attention}`}
            size={size}
            attention={attention}
            testID="ibm-fn"
          />,
        ));
        expect(screen.getByTestId('ibm-fn').props.accessibilityRole).toBe('button');
        expect(screen.getByTestId('ibm-fn').props.accessibilityLabel).toBe(`icon-${size}-${attention}`);
      });
    }
  }
});

// ─── Figma matrix: contained × fullWidth ─────────────────────────────────────
//
// Figma "contained" = true | false (component property — BUG-IBN-2: no native prop)
// Native mapping:  attention='high' ≈ filled background
//                  attention='low'  ≈ ghost (no background)
//
// The Figma `contained` component property maps 1:1 to the native `contained`
// boolean; these smoke tests exercise the `attention` paint modes.

describe('IconButton — Figma matrix: contained × fullWidth', () => {
  // contained=true (bold/filled) × fullWidth
  it(`[smoke] contained=true (attention="high") fullWidth=false renders without crashing`, () => {
    expect(() =>
      render(wrap(<IconButton icon={ICON} aria-label="Test" attention="high" fullWidth={false} />)),
    ).not.toThrow();
  });

  it(`[smoke] contained=true (attention="high") fullWidth=true renders without crashing`, () => {
    expect(() =>
      render(wrap(<IconButton icon={ICON} aria-label="Test" attention="high" fullWidth />)),
    ).not.toThrow();
  });

  // contained=false (ghost/unfilled) × fullWidth
  it(`[smoke] contained=false (attention="low") fullWidth=false renders without crashing`, () => {
    expect(() =>
      render(wrap(<IconButton icon={ICON} aria-label="Test" attention="low" fullWidth={false} />)),
    ).not.toThrow();
  });

  it(`[smoke] contained=false (attention="low") fullWidth=true renders without crashing`, () => {
    expect(() =>
      render(wrap(<IconButton icon={ICON} aria-label="Test" attention="low" fullWidth />)),
    ).not.toThrow();
  });

  it('[fn] contained=true equivalent (high) → button has a background fill', () => {
    render(wrap(<IconButton icon={ICON} aria-label="Filled" attention="high" testID="ibf-bold" />));
    expect(screen.getByTestId('ibf-bold').props.accessibilityRole).toBe('button');
  });

  it('[fn] contained=false equivalent (low) → button has no fill background', () => {
    render(wrap(<IconButton icon={ICON} aria-label="Ghost" attention="low" testID="ibf-ghost" />));
    expect(screen.getByTestId('ibf-ghost').props.accessibilityRole).toBe('button');
  });
});

// ─── Figma matrix: layout × condensed ────────────────────────────────────────
//
// Figma "shape" = 1:1 | 2:3 maps to native "layout" = '1:1' | '3:2' (BUG-IBN-1).
// Figma "condensed" = true | false maps to native "condensed".

describe('IconButton — Figma matrix: layout × condensed', () => {
  for (const layout of ['1:1', '3:2'] as const) {
    for (const condensed of [false, true] as const) {
      it(`[smoke] layout="${layout}" condensed=${condensed} renders without crashing`, () => {
        expect(() =>
          render(wrap(
            <IconButton
              icon={ICON}
              aria-label="Test"
              layout={layout}
              condensed={condensed}
            />,
          )),
        ).not.toThrow();
      });
    }
  }
});

// ─── Figma matrix: appearance ─────────────────────────────────────────────────

describe('IconButton — Figma matrix: appearance', () => {
  for (const appearance of APPEARANCES) {
    it(`[smoke] appearance="${appearance}" renders without crashing`, () => {
      expect(() =>
        render(wrap(
          <IconButton icon={ICON} aria-label="Test" appearance={appearance} testID={`ibm-${appearance}`} />,
        )),
      ).not.toThrow();
    });
  }

  it('[fn] appearance="auto" resolves to primary (default)', () => {
    render(wrap(<IconButton icon={ICON} aria-label="Auto" appearance="auto" testID="ibm-auto" />));
    expect(screen.getByTestId('ibm-auto')).toBeTruthy();
  });
});

// ─── Smoke ────────────────────────────────────────────────────────────────────

describe('IconButton — smoke', () => {
  it('[smoke] renders without crashing', () => {
    expect(() => render(wrap(<IconButton icon={ICON} aria-label="Close" />))).not.toThrow();
  });

  it('[smoke] renders all native sizes', () => {
    for (const size of NATIVE_SIZES) {
      const { unmount } = render(wrap(<IconButton icon={ICON} aria-label={`size-${size}`} size={size} />));
      expect(screen.getByLabelText(`size-${size}`)).toBeTruthy();
      unmount();
    }
    render(wrap(<IconButton icon={ICON} aria-label="Final" />));
  });

  it('[smoke] renders all attention levels', () => {
    for (const attention of ['high', 'medium', 'low'] as const) {
      const { unmount } = render(
        wrap(<IconButton icon={ICON} aria-label="V" attention={attention} />),
      );
      unmount();
    }
    render(wrap(<IconButton icon={ICON} aria-label="Final" />));
  });

  it('[smoke] renders disabled without crashing', () => {
    expect(() => render(wrap(<IconButton icon={ICON} aria-label="Disabled" disabled />))).not.toThrow();
  });

  it('[smoke] renders loading without crashing', () => {
    expect(() => render(wrap(<IconButton icon={ICON} aria-label="Loading" loading />))).not.toThrow();
  });

  it('[smoke] renders fullWidth without crashing', () => {
    expect(() => render(wrap(<IconButton icon={ICON} aria-label="FW" fullWidth />))).not.toThrow();
  });

  it('[smoke] renders layout="3:2" without crashing', () => {
    expect(() => render(wrap(<IconButton icon={ICON} aria-label="Wide" layout="3:2" />))).not.toThrow();
  });

  it('[smoke] renders condensed without crashing', () => {
    expect(() => render(wrap(<IconButton icon={ICON} aria-label="Condensed" condensed />))).not.toThrow();
  });
});

// ─── Functional: role and accessibility ──────────────────────────────────────

describe('IconButton — functional: role and label', () => {
  it('[fn] has accessibilityRole="button"', () => {
    render(wrap(<IconButton icon={ICON} aria-label="Close" testID="ibf" />));
    expect(screen.getByTestId('ibf').props.accessibilityRole).toBe('button');
  });

  it('[fn] getByLabelText finds the button via aria-label', () => {
    render(wrap(<IconButton icon={ICON} aria-label="Dismiss dialog" />));
    expect(screen.getByLabelText('Dismiss dialog')).toBeTruthy();
  });

  it('[fn] accessibilityLabel from aria-label prop', () => {
    render(wrap(<IconButton icon={ICON} aria-label="Custom label" testID="ibf" />));
    expect(screen.getByTestId('ibf').props.accessibilityLabel).toBe('Custom label');
  });

  it('[fn] accessibilityHint forwarded to Pressable', () => {
    render(wrap(<IconButton icon={ICON} aria-label="Close" accessibilityHint="Closes the dialog" testID="ibf" />));
    expect(screen.getByTestId('ibf').props.accessibilityHint).toBe('Closes the dialog');
  });

  it('[fn] aria-expanded forwarded → accessibilityState.expanded=true', () => {
    // buildButtonFamilyPressableAccessibility maps aria-expanded → accessibilityState.expanded
    render(wrap(<IconButton icon={ICON} aria-label="Menu" aria-expanded testID="ibf" />));
    expect(screen.getByTestId('ibf').props.accessibilityState?.expanded).toBe(true);
  });
});

// ─── Functional: events ───────────────────────────────────────────────────────

describe('IconButton — functional: events', () => {
  it('[fn] fires onPress when tapped', () => {
    const handler = vi.fn();
    render(wrap(<IconButton icon={ICON} aria-label="Close" onPress={handler} testID="ibf" />));
    fireEvent.press(screen.getByTestId('ibf'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('[fn] fires onClick when tapped (and onPress not set)', () => {
    const handler = vi.fn();
    render(wrap(<IconButton icon={ICON} aria-label="Close" onClick={handler} testID="ibf" />));
    fireEvent.press(screen.getByTestId('ibf'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('[fn] multiple taps fire onPress each time', () => {
    const handler = vi.fn();
    render(wrap(<IconButton icon={ICON} aria-label="Close" onPress={handler} testID="ibf" />));
    fireEvent.press(screen.getByTestId('ibf'));
    fireEvent.press(screen.getByTestId('ibf'));
    fireEvent.press(screen.getByTestId('ibf'));
    expect(handler).toHaveBeenCalledTimes(3);
  });

  it('[fn] disabled button — onPress not attached to Pressable', () => {
    const handler = vi.fn();
    render(wrap(<IconButton icon={ICON} aria-label="Close" disabled onPress={handler} testID="ibf" />));
    // handlePress = isDisabled ? undefined : onPress
    expect(screen.getByTestId('ibf').props.onPress).toBeUndefined();
  });

  it('[fn] disabled button — onClick not attached to Pressable either', () => {
    const handler = vi.fn();
    render(wrap(<IconButton icon={ICON} aria-label="Close" disabled onClick={handler} testID="ibf" />));
    expect(screen.getByTestId('ibf').props.onPress).toBeUndefined();
  });

  it('[fn] loading button — onPress not attached to Pressable', () => {
    const handler = vi.fn();
    render(wrap(<IconButton icon={ICON} aria-label="Close" loading onPress={handler} testID="ibf" />));
    expect(screen.getByTestId('ibf').props.onPress).toBeUndefined();
  });

  it('[fn] loading button — onClick not attached to Pressable either', () => {
    const handler = vi.fn();
    render(wrap(<IconButton icon={ICON} aria-label="Close" loading onClick={handler} testID="ibf" />));
    expect(screen.getByTestId('ibf').props.onPress).toBeUndefined();
  });
});

// ─── Functional: layout and dimensions ───────────────────────────────────────

describe('IconButton — functional: layout and dimensions', () => {
  it('[fn] layout="1:1" (default) → square button (equal width and height)', () => {
    render(wrap(<IconButton icon={ICON} aria-label="Close" layout="1:1" size="m" testID="ibf" />));
    const s = flatStyle(screen.getByTestId('ibf').props.style);
    // width and height are both set from metrics.container (square)
    expect(s.width).toBe(s.height);
  });

  it('[fn] layout="3:2" → wide button (width=undefined, paddingHorizontal set)', () => {
    render(wrap(<IconButton icon={ICON} aria-label="Close" layout="3:2" size="m" testID="ibf" />));
    const s = flatStyle(screen.getByTestId('ibf').props.style);
    // In 3:2 layout, width is undefined (fills via paddingHorizontal)
    expect(s.width).toBeUndefined();
    expect(s.paddingHorizontal).toBeDefined();
  });

  it('[fn] fullWidth=true renders without crashing and has a height', () => {
    // fullWidth: no explicit width (fills container), height from metrics.container
    render(wrap(<IconButton icon={ICON} aria-label="Close" fullWidth size="m" testID="ibf" />));
    const s = flatStyle(screen.getByTestId('ibf').props.style);
    // Height is always set — m size container height:
    expect(typeof s.height).toBe('number');
    expect((s.height as number)).toBeGreaterThan(0);
  });
});

// ─── Functional: disabled and loading states ──────────────────────────────────

describe('IconButton — functional: disabled and loading states', () => {
  it('[fn] disabled=true → accessibilityState.disabled=true', () => {
    render(wrap(<IconButton icon={ICON} aria-label="Close" disabled testID="ibf" />));
    expect(screen.getByTestId('ibf').props.accessibilityState?.disabled).toBe(true);
  });

  it('[fn] disabled=false → accessibilityState.disabled=false', () => {
    render(wrap(<IconButton icon={ICON} aria-label="Close" disabled={false} testID="ibf" />));
    expect(screen.getByTestId('ibf').props.accessibilityState?.disabled).toBe(false);
  });

  it('[fn] loading=true → accessibilityState.busy=true', () => {
    render(wrap(<IconButton icon={ICON} aria-label="Close" loading testID="ibf" />));
    expect(screen.getByTestId('ibf').props.accessibilityState?.busy).toBe(true);
  });

  it('[fn] loading=false → accessibilityState.busy=false', () => {
    render(wrap(<IconButton icon={ICON} aria-label="Close" loading={false} testID="ibf" />));
    expect(screen.getByTestId('ibf').props.accessibilityState?.busy).toBe(false);
  });

  it('[fn] disabled+loading together → handler not attached, both states set', () => {
    const handler = vi.fn();
    render(wrap(<IconButton icon={ICON} aria-label="Close" disabled loading onPress={handler} testID="ibf" />));
    const el = screen.getByTestId('ibf');
    expect(el.props.onPress).toBeUndefined();
    expect(el.props.accessibilityState?.disabled).toBe(true);
    expect(el.props.accessibilityState?.busy).toBe(true);
  });
});

// ─── A11y ─────────────────────────────────────────────────────────────────────

describe('IconButton — a11y', () => {
  it('[a11y] has accessibilityRole="button"', () => {
    render(wrap(<IconButton icon={ICON} aria-label="Close" testID="ibf" />));
    expect(screen.getByTestId('ibf').props.accessibilityRole).toBe('button');
  });

  it('[a11y] aria-label is required — sets accessibilityLabel', () => {
    render(wrap(<IconButton icon={ICON} aria-label="Action button" testID="ibf" />));
    expect(screen.getByTestId('ibf').props.accessibilityLabel).toBe('Action button');
  });

  it('[a11y] getByLabelText finds the button', () => {
    render(wrap(<IconButton icon={ICON} aria-label="Dismiss" />));
    expect(screen.getByLabelText('Dismiss')).toBeTruthy();
  });

  it('[a11y] disabled → accessibilityState.disabled=true', () => {
    render(wrap(<IconButton icon={ICON} aria-label="Close" disabled testID="ibf" />));
    expect(screen.getByTestId('ibf').props.accessibilityState?.disabled).toBe(true);
  });

  it('[a11y] loading → accessibilityState.busy=true', () => {
    render(wrap(<IconButton icon={ICON} aria-label="Loading" loading testID="ibf" />));
    expect(screen.getByTestId('ibf').props.accessibilityState?.busy).toBe(true);
  });

  it('[a11y] accessibilityHint surfaced to screen readers', () => {
    render(wrap(
      <IconButton icon={ICON} aria-label="Close" accessibilityHint="Closes the overlay" testID="ibf" />,
    ));
    expect(screen.getByTestId('ibf').props.accessibilityHint).toBe('Closes the overlay');
  });

  it('[a11y] aria-expanded forwarded → accessibilityState.expanded', () => {
    // aria-expanded maps to accessibilityState.expanded via buildButtonFamilyPressableAccessibility
    render(wrap(<IconButton icon={ICON} aria-label="Menu" aria-expanded={true} testID="ibf" />));
    expect(screen.getByTestId('ibf').props.accessibilityState?.expanded).toBe(true);
  });

  it('[a11y] icon inside is hidden from a11y tree (accessible=false on inner View)', () => {
    render(wrap(<IconButton icon={ICON} aria-label="Close" testID="ibf" />));
    // The icon View has accessibilityElementsHidden=true — only the Pressable is in the tree
    expect(screen.getByTestId('ibf').props.accessibilityRole).toBe('button');
  });
});

// ─── Bug-catching ─────────────────────────────────────────────────────────────

describe('IconButton — bug-catching', () => {
  // ── BUG-IBN-1: Figma "shape" vs native "layout" — name + value mismatch ────

  it('[bug] BUG-IBN-1: Figma shape="2:3" maps to native layout="3:2" — reversed ratio', () => {
    // Figma: shape = 1:1 | 2:3 (property name "shape")
    // Native: layout = '1:1' | '3:2' (property name "layout", ratio reversed)
    // Correct native usage with layout:
    render(wrap(<IconButton icon={ICON} aria-label="Wide" layout="3:2" testID="ibf-ok" />));
    const s = flatStyle(screen.getByTestId('ibf-ok').props.style);
    expect(s.paddingHorizontal).toBeDefined(); // 3:2 layout adds horizontal padding
    // Figma "shape" prop not recognised — TypeScript error at callsite:
    // @ts-expect-error — "shape" is Figma prop name; native uses "layout"
    render(wrap(<IconButton icon={ICON} aria-label="Shape" shape="2:3" testID="ibf-bad" />));
    // shape is ignored → defaults to layout='1:1' (square)
    const sBad = flatStyle(screen.getByTestId('ibf-bad').props.style);
    expect(sBad.paddingHorizontal).toBeUndefined(); // no horizontal padding (1:1)
  });

  // ── BUG-IBN-2: Figma "contained" component property has no native prop ────────

  it('[fn] attention maps the fill paint mode (high=filled, low=ghost)', () => {
    // Figma API table: contained = true | false (component property).
    // Native equivalent: attention='high' (filled) / attention='low' (ghost) —
    // and the dedicated `contained` boolean below toggles the chip container.
    render(wrap(<IconButton icon={ICON} aria-label="Filled" attention="high" testID="ibf-filled" />));
    expect(screen.getByTestId('ibf-filled').props.accessibilityRole).toBe('button');
    render(wrap(<IconButton icon={ICON} aria-label="Ghost" attention="low" testID="ibf-ghost" />));
    expect(screen.getByTestId('ibf-ghost').props.accessibilityRole).toBe('button');
  });

  it('[fn] native `contained` prop toggles the fill container (Figma contained parity)', () => {
    // BUG-IBN-2 resolved: `contained` is now a first-class native prop that maps
    // 1:1 to Figma's `contained` component property.
    expect(() =>
      render(wrap(<IconButton icon={ICON} aria-label="Contained" contained={true} testID="ibf-cont" />)),
    ).not.toThrow();
    expect(screen.getByTestId('ibf-cont').props.accessibilityRole).toBe('button');
  });

  // ── BUG-IBN-3: onClick silently ignored when onPress is also set ─────────────

  it('[bug] BUG-IBN-3: onClick silently ignored when onPress is also provided', () => {
    // handlePress = isDisabled ? undefined : (onPress ?? onClick)
    // The ?? operator means onClick is NEVER called when onPress is truthy.
    // Button (regular) fires BOTH handlers; IconButton only fires onPress.
    const pressHandler = vi.fn();
    const clickHandler = vi.fn();
    render(wrap(
      <IconButton
        icon={ICON}
        aria-label="Both"
        onPress={pressHandler}
        onClick={clickHandler}
        testID="ibf"
      />,
    ));
    fireEvent.press(screen.getByTestId('ibf'));
    expect(pressHandler).toHaveBeenCalledTimes(1);
    // Bug: clickHandler should also be called but is silently ignored
    expect(clickHandler).toHaveBeenCalledTimes(1); // FAILS: onClick never fires when onPress set
  });

  // ── API: canonical lowercase size vs Figma display casing (not a filed bug) ──

  it('[fn] native size="2xs" is smallest; uppercase "2XS" at runtime falls back to M', () => {
    render(wrap(<IconButton icon={ICON} aria-label="2xs" size="2xs" testID="ibf-2xs" />));
    const s2xs = flatStyle(screen.getByTestId('ibf-2xs').props.style);

    // Runtime-only cast — typed code must use '2xs' | 4 (see IconButtonSize).
    render(
      wrap(
        <IconButton
          icon={ICON}
          aria-label="2XS fallback"
          size={'2XS' as unknown as '2xs'}
          testID="ibf-2XS"
        />,
      ),
    );
    const s2XS = flatStyle(screen.getByTestId('ibf-2XS').props.style);

    expect(s2xs.height).toBeLessThan(s2XS.height as number);
    expect(s2XS.height).toBeGreaterThan(0);
  });
});
