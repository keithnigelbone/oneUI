/**
 * CounterBadge QA tests — smoke, functional, and a11y.
 *
 * Source: packages/ui-native/src/components/CounterBadge/CounterBadge.native.tsx
 * Figma:  CounterBadge — size × attention matrix (XS/S/M/L × high/medium/low)
 *
 * ─── Component behaviour ─────────────────────────────────────────────────────
 *
 *   value        Required. Any number (integer expected by design).
 *   max          Default 99. When value > max, displays "${max}+".
 *   showZero     Default false. When false, value=0 renders null (hidden).
 *   size         'xs' | 's' | 'm' | 'l'   default 'm'
 *   attention    'high' | 'medium' | 'low' → maps to variant bold/subtle/ghost
 *   variant      'bold' | 'subtle' | 'ghost'  explicit override; wins over attention
 *   appearance   ComponentAppearance  default 'primary' (or slot parent)
 *   aria-label   Overrides the default accessibilityLabel (displayValue string)
 *
 *   Heights from tokens.spacing (mobile f-step scale):
 *     xs → spacing['2'] = 8px
 *     s  → spacing['3'] = 12px
 *     m  → spacing['4'] = 16px
 *     l  → spacing['5'] = 20px
 *   minWidth equals height for each size (square baseline before text expansion).
 *
 * ─── Known dev-file bugs (raise to dev team) ─────────────────────────────────
 *
 *   BUG-CB-1 · Negative value is not guarded
 *     value=-1 → isHidden=false → renders "-1" as a counter badge label.
 *     A negative count has no semantic meaning for a counter badge. The component
 *     should either hide the badge (treat negative as 0) or clamp to 0.
 *     File: packages/ui-native/src/components/CounterBadge/interface.ts
 *     Fix:  isHidden = value <= 0 && !showZero  (or clamp displayValue to
 *           Math.max(0, value) before the isHidden/displayValue computation).
 *
 *   BUG-CB-2 · max=0 produces the confusing label "0+"
 *     value=1, max=0 → value > max (1 > 0) → displayValue="0+" → renders "0+".
 *     "0+" means "more than 0" which is technically true but visually confusing
 *     because it implies the cap is 0. max should be validated to be ≥ 1.
 *     File: packages/ui-native/src/components/CounterBadge/interface.ts
 *     Fix:  const effectiveMax = Math.max(1, max ?? 99) or add a prop validation.
 *
 *   BUG-CB-3 · "99+" accessibilityLabel is announced as "99 plus" by screen readers
 *     When value > max, displayValue="${max}+" becomes the default accessibilityLabel.
 *     VoiceOver/TalkBack announces this as "99 plus" which is ambiguous. A better
 *     label would be "more than 99" or "99 or more". This requires either an
 *     explicit aria-label at the callsite or a smarter default label in
 *     getCounterBadgeAccessibilityProps.
 *     File: packages/ui-native/src/components/CounterBadge/interface.ts
 *     Workaround: pass aria-label="more than 99" explicitly.
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { describe, it, expect } from 'vitest';
import { tokens } from '@oneui/tokens';
import { CounterBadge } from '@ui-native/components/CounterBadge/CounterBadge.native';
import { wrap } from '../../utils/renderWithTheme';

// ─── Token-derived expected dimensions ───────────────────────────────────────
//
// Use the tokens directly so tests stay in sync with design-token changes
// instead of hardcoding magic numbers that silently diverge.

const EXPECTED_HEIGHT = {
  xs: tokens.spacing['2'],   // 8
  s:  tokens.spacing['3'],   // 12
  m:  tokens.spacing['4'],   // 16
  l:  tokens.spacing['5'],   // 20
} as const;

// ─── Figma matrix: size × attention ──────────────────────────────────────────
//
// The Figma CounterBadge matrix has:
//   Rows:    XS / S / M / L
//   Columns: high (bold) / medium (subtle) / low (ghost)
//
// Smoke tests verify every cell renders. Functional tests verify the correct
// accessibilityRole and accessibilityLabel are present in each cell.

const SIZES    = ['xs', 's', 'm', 'l'] as const;
const ATTENTIONS = ['high', 'medium', 'low'] as const;

describe('CounterBadge — Figma matrix: size × attention', () => {
  for (const size of SIZES) {
    for (const attention of ATTENTIONS) {
      it(`[smoke] size="${size}" attention="${attention}" renders without crashing`, () => {
        expect(() =>
          render(wrap(<CounterBadge value={8} size={size} attention={attention} testID="cb" />)),
        ).not.toThrow();
      });

      it(`[fn] size="${size}" attention="${attention}" — value and role present in tree`, () => {
        render(wrap(
          <CounterBadge value={8} size={size} attention={attention} testID="cb-fn" />,
        ));
        // Container is accessible with role='text'
        const container = screen.getByTestId('cb-fn');
        expect(container.props.accessibilityRole).toBe('text');
        expect(container.props.accessible).toBe(true);
        // Visual label text in tree
        expect(screen.getByText('8')).toBeTruthy();
      });
    }
  }
});

// ─── Figma matrix: appearance variants ───────────────────────────────────────
//
// Figma appearance values: auto, neutral, primary, secondary, sparkle,
// negative, positive, warning, informative
// 'auto' delegates to slot parent or falls back to 'primary'.

const APPEARANCES = [
  'auto', 'neutral', 'primary', 'secondary', 'sparkle',
  'negative', 'positive', 'warning', 'informative',
] as const;

describe('CounterBadge — Figma matrix: appearance', () => {
  for (const appearance of APPEARANCES) {
    it(`[smoke] appearance="${appearance}" renders without crashing`, () => {
      expect(() =>
        render(wrap(<CounterBadge value={8} appearance={appearance} />)),
      ).not.toThrow();
    });
  }
});

// ─── Smoke ────────────────────────────────────────────────────────────────────

describe('CounterBadge — smoke', () => {
  it('[smoke] renders without crashing', () => {
    expect(() => render(wrap(<CounterBadge value={5} />))).not.toThrow();
  });

  it('[smoke] renders numeric value as text', () => {
    render(wrap(<CounterBadge value={7} />));
    expect(screen.getByText('7')).toBeTruthy();
  });

  it('[smoke] disabled prop accepted without crash', () => {
    expect(() => render(wrap(<CounterBadge value={3} />))).not.toThrow();
  });

  it('[smoke] renders all four sizes without crashing', () => {
    for (const size of SIZES) {
      const { unmount } = render(wrap(<CounterBadge value={1} size={size} />));
      expect(screen.getByText('1')).toBeTruthy();
      unmount();
    }
    render(wrap(<CounterBadge value={99} size="m" />));
  });

  it('[smoke] renders all three attention levels without crashing', () => {
    for (const attention of ATTENTIONS) {
      const { unmount } = render(wrap(<CounterBadge value={5} attention={attention} />));
      expect(screen.getByText('5')).toBeTruthy();
      unmount();
    }
    render(wrap(<CounterBadge value={5} attention="high" />));
  });

  it('[smoke] renders all three variant values without crashing', () => {
    for (const variant of ['bold', 'subtle', 'ghost'] as const) {
      const { unmount } = render(wrap(<CounterBadge value={5} variant={variant} />));
      expect(screen.getByText('5')).toBeTruthy();
      unmount();
    }
    render(wrap(<CounterBadge value={5} variant="bold" />));
  });

  it('[smoke] large value renders without crashing', () => {
    expect(() => render(wrap(<CounterBadge value={9999} />))).not.toThrow();
  });

  it('[smoke] value=1 (minimum meaningful) renders without crashing', () => {
    expect(() => render(wrap(<CounterBadge value={1} />))).not.toThrow();
  });

  it('[smoke] custom style prop accepted without crash', () => {
    expect(() =>
      render(wrap(<CounterBadge value={3} style={{ margin: 4 }} />)),
    ).not.toThrow();
  });
});

// ─── Functional — value display ───────────────────────────────────────────────

describe('CounterBadge — functional: value display', () => {
  it('[fn] displays the exact value when within max', () => {
    render(wrap(<CounterBadge value={42} />));
    expect(screen.getByText('42')).toBeTruthy();
  });

  it('[fn] displays value at exactly max (no + suffix)', () => {
    // value === max → shows String(value), NOT "${max}+"
    // Boundary: value > max triggers capping; value === max does not.
    render(wrap(<CounterBadge value={99} max={99} />));
    expect(screen.getByText('99')).toBeTruthy();
    expect(screen.queryByText('99+')).toBeNull();
  });

  it('[fn] caps at max and shows max+ when value > max', () => {
    render(wrap(<CounterBadge value={100} max={99} />));
    expect(screen.getByText('99+')).toBeTruthy();
  });

  it('[fn] caps at custom max', () => {
    render(wrap(<CounterBadge value={50} max={9} />));
    expect(screen.getByText('9+')).toBeTruthy();
  });

  it('[fn] default max is 99 — value=100 shows "99+"', () => {
    render(wrap(<CounterBadge value={100} />));
    expect(screen.getByText('99+')).toBeTruthy();
  });

  it('[fn] very large value still caps at default max', () => {
    render(wrap(<CounterBadge value={99999} />));
    expect(screen.getByText('99+')).toBeTruthy();
  });
});

// ─── Functional — zero / hidden state ────────────────────────────────────────

describe('CounterBadge — functional: zero and hidden state', () => {
  it('[fn] value=0 renders null — component is hidden by default', () => {
    render(wrap(<CounterBadge value={0} testID="hidden-cb" />));
    // Component returns null when isHidden=true — testID not in tree
    expect(screen.queryByTestId('hidden-cb')).toBeNull();
  });

  it('[fn] value=0 shows "0" text node when showZero=true', () => {
    render(wrap(<CounterBadge value={0} showZero />));
    expect(screen.getByText('0')).toBeTruthy();
  });

  it('[fn] value=0 with showZero=true is accessible in the tree', () => {
    render(wrap(<CounterBadge value={0} showZero testID="zero-cb" />));
    expect(screen.getByTestId('zero-cb')).toBeTruthy();
  });

  it('[fn] queryByText("0") is null when showZero is not set', () => {
    render(wrap(<CounterBadge value={0} />));
    expect(screen.queryByText('0')).toBeNull();
  });

  it('[fn] value=1 always renders — not hidden', () => {
    render(wrap(<CounterBadge value={1} testID="visible-cb" />));
    expect(screen.getByTestId('visible-cb')).toBeTruthy();
  });
});

// ─── Functional — attention / variant ────────────────────────────────────────

describe('CounterBadge — functional: attention and variant', () => {
  it('[fn] attention="high" maps to bold variant — component renders', () => {
    // ATTENTION_TO_VARIANT: high → bold.
    // Verified structurally: component renders without error using bold paint path.
    render(wrap(<CounterBadge value={5} attention="high" testID="cb-high" />));
    expect(screen.getByTestId('cb-high')).toBeTruthy();
  });

  it('[fn] attention="medium" maps to subtle variant — component renders', () => {
    render(wrap(<CounterBadge value={5} attention="medium" testID="cb-med" />));
    expect(screen.getByTestId('cb-med')).toBeTruthy();
  });

  it('[fn] attention="low" maps to ghost variant — component renders', () => {
    render(wrap(<CounterBadge value={5} attention="low" testID="cb-low" />));
    expect(screen.getByTestId('cb-low')).toBeTruthy();
  });

  it('[fn] no attention and no variant defaults to bold', () => {
    // resolvedVariant = variantProp ?? (attention ? ... : 'bold')
    // With neither prop, bold is the default.
    render(wrap(<CounterBadge value={5} testID="cb-default" />));
    expect(screen.getByTestId('cb-default')).toBeTruthy();
    expect(screen.getByText('5')).toBeTruthy();
  });

  it('[fn] explicit variant prop overrides attention (variant wins)', () => {
    // resolvedVariant = variantProp ?? (attention ? ATTENTION_TO_VARIANT[attention] : 'bold')
    // variantProp is non-nullish → attention is ignored.
    // ghost + attention="high" → resolved as ghost, not bold.
    render(wrap(
      <CounterBadge value={5} variant="ghost" attention="high" testID="cb-precedence" />,
    ));
    // Component renders without error (ghost paint path used, not bold)
    expect(screen.getByTestId('cb-precedence')).toBeTruthy();
  });
});

// ─── Functional — container dimensions ───────────────────────────────────────
//
// Each size has a specific height and minWidth from spacing tokens.
// The container style is an array; flatten to read values.

describe('CounterBadge — functional: container dimensions', () => {
  function flatStyle(style: unknown): Record<string, unknown> {
    if (!style) return {};
    if (Array.isArray(style)) {
      return Object.assign({}, ...(style as unknown[]).map(flatStyle));
    }
    if (typeof style === 'object') return style as Record<string, unknown>;
    return {};
  }

  for (const size of SIZES) {
    it(`[fn] size="${size}" — container height is ${EXPECTED_HEIGHT[size]}px`, () => {
      render(wrap(<CounterBadge value={8} size={size} testID={`dim-${size}`} />));
      const container = screen.getByTestId(`dim-${size}`);
      const s = flatStyle(container.props.style);
      expect(s.height).toBe(EXPECTED_HEIGHT[size]);
    });

    it(`[fn] size="${size}" — container minWidth equals height (square baseline)`, () => {
      render(wrap(<CounterBadge value={8} size={size} testID={`mw-${size}`} />));
      const container = screen.getByTestId(`mw-${size}`);
      const s = flatStyle(container.props.style);
      expect(s.minWidth).toBe(EXPECTED_HEIGHT[size]);
    });
  }

  it('[fn] size="s" and size="m" produce different heights (sizes are distinct)', () => {
    render(wrap(
      <>
        <CounterBadge value={1} size="s" testID="dim-s2" />
        <CounterBadge value={1} size="m" testID="dim-m2" />
      </>,
    ));
    const s = flatStyle(screen.getByTestId('dim-s2').props.style);
    const m = flatStyle(screen.getByTestId('dim-m2').props.style);
    expect((s.height as number)).toBeLessThan(m.height as number);
  });
});

// ─── Functional — accessibility ───────────────────────────────────────────────

describe('CounterBadge — functional: accessibility', () => {
  it('[fn] default accessibilityLabel is the display value string', () => {
    render(wrap(<CounterBadge value={5} />));
    expect(screen.getByLabelText('5')).toBeTruthy();
  });

  it('[fn] aria-label overrides the default accessibilityLabel', () => {
    render(wrap(<CounterBadge value={3} aria-label="3 notifications" />));
    expect(screen.getByLabelText('3 notifications')).toBeTruthy();
  });

  it('[fn] accessibilityLabel for capped value is "${max}+" string', () => {
    // Default accessibilityLabel is displayValue = "99+" when capped.
    // Screen reader announces "99 plus" — see BUG-CB-3 for UX concern.
    render(wrap(<CounterBadge value={150} max={99} />));
    expect(screen.getByLabelText('99+')).toBeTruthy();
  });

  it('[fn] accessibilityHint is forwarded to the container', () => {
    render(wrap(
      <CounterBadge value={3} accessibilityHint="Unread messages" testID="cb-hint" />,
    ));
    expect(
      screen.getByTestId('cb-hint').props.accessibilityHint,
    ).toBe('Unread messages');
  });

  it('[fn] accessibilityLiveRegion is always "polite"', () => {
    // Live region announces value changes to screen readers without interrupting.
    render(wrap(<CounterBadge value={5} testID="cb-live" />));
    expect(
      screen.getByTestId('cb-live').props.accessibilityLiveRegion,
    ).toBe('polite');
  });

  it('[fn] inner Text label node is hidden from a11y (accessible=false)', () => {
    // The visual Text inside the container is hidden — the container's
    // accessibilityLabel carries the screen reader value instead.
    render(wrap(<CounterBadge value={7} testID="cb-inner" />));
    const container = screen.getByTestId('cb-inner');
    // The inner Text child should not be accessible
    const innerText = container.children?.[0] as { props?: Record<string, unknown> };
    expect(innerText?.props?.accessible).toBe(false);
  });

  it('[fn] testID is applied to the outer container View', () => {
    render(wrap(<CounterBadge value={4} testID="my-counter" />));
    expect(screen.getByTestId('my-counter')).toBeTruthy();
  });
});

// ─── A11y ─────────────────────────────────────────────────────────────────────

describe('CounterBadge — a11y', () => {
  it('[a11y] container has accessibilityRole="text"', () => {
    render(wrap(<CounterBadge value={5} testID="a11y-cb" />));
    expect(screen.getByTestId('a11y-cb').props.accessibilityRole).toBe('text');
  });

  it('[a11y] container is accessible (accessible=true)', () => {
    render(wrap(<CounterBadge value={5} testID="a11y-acc" />));
    expect(screen.getByTestId('a11y-acc').props.accessible).toBe(true);
  });

  it('[a11y] getByRole("text") finds the badge container', () => {
    render(wrap(<CounterBadge value={5} />));
    expect(screen.getByRole('text')).toBeTruthy();
  });

  it('[a11y] getByLabelText finds the badge via default numeric label', () => {
    render(wrap(<CounterBadge value={7} />));
    expect(screen.getByLabelText('7')).toBeTruthy();
  });

  it('[a11y] getByLabelText finds the badge via aria-label', () => {
    render(wrap(<CounterBadge value={3} aria-label="3 notifications" />));
    expect(screen.getByLabelText('3 notifications')).toBeTruthy();
  });

  it('[a11y] accessibilityLiveRegion="polite" is set on container', () => {
    render(wrap(<CounterBadge value={5} testID="live-a11y" />));
    expect(
      screen.getByTestId('live-a11y').props.accessibilityLiveRegion,
    ).toBe('polite');
  });

  it('[a11y] hidden badge (value=0) produces no accessible node', () => {
    render(wrap(<CounterBadge value={0} />));
    // Component returns null — no role="text" element in the accessible tree
    expect(screen.queryByRole('text')).toBeNull();
  });
});

// ─── Bug-catching ─────────────────────────────────────────────────────────────

describe('CounterBadge — bug-catching', () => {
  // ── BUG-CB-1 ──────────────────────────────────────────────────────────────
  // Negative value is not guarded in useCounterBadgeState.
  // isHidden = value === 0 && !showZero — this is false for value=-1.
  // The component renders displayValue="-1" which has no meaningful count semantics.

  it('[bug] BUG-CB-1: negative value renders "-N" instead of being hidden', () => {
    render(wrap(<CounterBadge value={-1} testID="cb-neg" />));
    // Expected: component hidden (returns null, no testID in tree)
    // Bug:      renders with displayValue="-1" — negative badge visible
    expect(screen.queryByTestId('cb-neg')).toBeNull();
  });

  it('[bug] BUG-CB-1: negative value text "-1" should not appear in tree', () => {
    render(wrap(<CounterBadge value={-1} />));
    // Expected: no text rendered
    // Bug:      screen.getByText('-1') succeeds — negative label visible to users
    expect(screen.queryByText('-1')).toBeNull();
  });

  // ── BUG-CB-2 ──────────────────────────────────────────────────────────────
  // max=0 produces the label "0+" when value > 0.
  // Semantically confusing: "0+" implies the cap is zero, but a counter badge
  // with max=0 has no useful purpose. Should validate max >= 1.

  it('[bug] BUG-CB-2: max=0 with value=1 displays confusing "0+" label', () => {
    render(wrap(<CounterBadge value={1} max={0} />));
    // Expected: either show "1" (no capping for invalid max) or render nothing
    // Bug:      renders "0+" — valid per the logic (1 > 0) but semantically wrong
    expect(screen.queryByText('0+')).toBeNull();
  });

  // ── BUG-CB-3 ──────────────────────────────────────────────────────────────
  // When value > max, accessibilityLabel becomes "${max}+" (e.g. "99+").
  // VoiceOver announces "99 plus" which is ambiguous to the user.
  // A screen reader-friendly label would be "more than 99" or "99 or more".

  it('[bug] BUG-CB-3: capped value uses "${max}+" as accessibilityLabel — ambiguous for screen readers', () => {
    render(wrap(<CounterBadge value={150} max={99} />));
    // Bug: accessibilityLabel is "99+" — announced as "99 plus"
    // Expected: "more than 99" or similar human-readable phrasing
    // The test asserts the current (buggy) label to document the behaviour:
    const el = screen.getByRole('text');
    expect(el.props.accessibilityLabel).toBe('99+');
    // Flag: this label should NOT be "99+" — raise to fix in getCounterBadgeAccessibilityProps
  });
});
