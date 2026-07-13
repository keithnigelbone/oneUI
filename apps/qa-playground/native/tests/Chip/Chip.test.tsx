/**
 * Chip QA tests — smoke, functional, a11y, and Figma matrix for the native Chip component.
 *
 * ─── Known dev-file bugs (raise separately) ──────────────────────────────────
 *
 * BUG-CHIP-2 [getChipAccessibilityProps ignores group-level disabled]
 *   getChipAccessibilityProps(props, state) computes
 *     accessibilityState.disabled = Boolean(props.disabled)
 *   but useChipState returns
 *     isDisabled = Boolean(disabled) || Boolean(groupCtx.disabled)
 *   When a Chip is disabled via ChipGroup's `disabled` prop (not its own),
 *   accessibilityState.disabled stays false — screen readers announce it as
 *   enabled while it is actually non-interactive.
 *   Test [bug] below catches this; it is expected to FAIL until the bug is fixed.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { describe, it, expect, vi } from 'vitest';
import { Chip } from '@ui-native/components/Chip/Chip.native';
import { Icon } from '@ui-native/components/Icon';
import { IcCheckGlyph } from '@ui-native/components/Chip/chipShowcaseGlyphs';
import { ChipGroupContext } from '@ui-native/components/Chip/ChipContext';
import { wrap } from '../../utils/renderWithTheme';

// ─── Slot content helpers ─────────────────────────────────────────────────────
//
// Uses the real OneUI Icon component — no raw RN host components.
// IcCheckGlyph is the Chip's own showcase glyph (chipShowcaseGlyphs.tsx).
//
// ChipSlot wraps slot children in:
//   <View importantForAccessibility="no-hide-descendants">{children}</View>
// This hides descendants from TalkBack (intentional — Pressable is the a11y
// element). RNTL v12 may or may not honour importantForAccessibility for
// getByTestId (it's Android-only; our mock runs iOS). We use UNSAFE_getByProps
// as a safe cross-platform workaround.
const SlotStart = () => (
  <Icon icon={IcCheckGlyph} appearance="neutral" testID="chip-start-icon" />
);
const SlotEnd = () => (
  <Icon icon={IcCheckGlyph} appearance="neutral" testID="chip-end-icon" />
);

// ─── Figma matrix: size × slot config ────────────────────────────────────────
//
// Mirrors the Figma Chip design matrix:
//   Columns: no slots | start icon | end icon | start + end icons
//   Rows:    s / m / l  at variant="subtle" (attention=medium)
//
// Slot tests use UNSAFE_getByProps — see BUG-CHIP-1 above.

const SIZES = ['s', 'm', 'l'] as const;

type ChipSlotConfig = {
  label: string;
  start: React.ReactElement | undefined;
  end: React.ReactElement | undefined;
  hasStart: boolean;
  hasEnd: boolean;
};

const SLOT_CONFIGS: ChipSlotConfig[] = [
  { label: 'no-slots',      start: undefined,     end: undefined,    hasStart: false, hasEnd: false },
  { label: 'start-icon',    start: <SlotStart />,  end: undefined,    hasStart: true,  hasEnd: false },
  { label: 'end-icon',      start: undefined,      end: <SlotEnd />,  hasStart: false, hasEnd: true  },
  { label: 'start-and-end', start: <SlotStart />,  end: <SlotEnd />,  hasStart: true,  hasEnd: true  },
];

describe('Chip — Figma matrix: size × slot config (variant=subtle)', () => {
  for (const size of SIZES) {
    it(`[smoke] size="${size}" no-slots renders without crashing`, () => {
      expect(() =>
        render(wrap(<Chip size={size} variant="subtle">Chip</Chip>)),
      ).not.toThrow();
    });

    for (const slot of SLOT_CONFIGS.filter((s) => s.hasStart || s.hasEnd)) {
      it(`[fn] size="${size}" ${slot.label} — slot icon present in tree`, () => {
        render(wrap(
          <Chip size={size} variant="subtle" start={slot.start} end={slot.end}>
            Chip
          </Chip>,
        ));
        // BUG-CHIP-1: no ChipSlot testID wrapper to assert — assert leaf icon instead.
        // UNSAFE_getByProps bypasses importantForAccessibility filtering in RNTL v12.
        if (slot.hasStart) {
          expect(screen.UNSAFE_getByProps({ testID: 'chip-start-icon' })).toBeTruthy();
        }
        if (slot.hasEnd) {
          expect(screen.UNSAFE_getByProps({ testID: 'chip-end-icon' })).toBeTruthy();
        }
      });
    }
  }
});

// ─── Figma matrix: size × selected state ─────────────────────────────────────
//
// Selected chip: bold bg, role-coloured text, selected=true in accessibilityState.
// Unselected chip: transparent bg, neutral text, selected=false.

describe('Chip — Figma matrix: size × selected state', () => {
  for (const size of SIZES) {
    it(`[smoke] size="${size}" selected renders without crashing`, () => {
      expect(() =>
        render(wrap(<Chip size={size} selected>Chip</Chip>)),
      ).not.toThrow();
    });

    it(`[fn] size="${size}" selected=true reflected in accessibilityState`, () => {
      render(wrap(<Chip size={size} selected>Chip</Chip>));
      expect(
        screen.getByRole('button').props.accessibilityState?.selected,
      ).toBe(true);
    });

    it(`[fn] size="${size}" selected=false reflected in accessibilityState`, () => {
      render(wrap(<Chip size={size} selected={false}>Chip</Chip>));
      expect(
        screen.getByRole('button').props.accessibilityState?.selected,
      ).toBe(false);
    });
  }
});

// ─── Figma matrix: size × disabled state ─────────────────────────────────────
//
// Disabled chip: opacity 0.5 on inner View, pointer-events blocked,
// onPress/onSelectedChange not called, accessibilityState.disabled=true.

describe('Chip — Figma matrix: size × disabled state', () => {
  for (const size of SIZES) {
    it(`[smoke] size="${size}" disabled renders without crashing`, () => {
      expect(() =>
        render(wrap(<Chip size={size} disabled>Chip</Chip>)),
      ).not.toThrow();
    });

    it(`[fn] size="${size}" disabled — accessibilityState.disabled=true`, () => {
      render(wrap(<Chip size={size} disabled>Chip</Chip>));
      expect(
        screen.getByRole('button').props.accessibilityState?.disabled,
      ).toBe(true);
    });

    it(`[fn] size="${size}" disabled — native disabled prop set on Pressable`, () => {
      render(wrap(<Chip size={size} disabled>Chip</Chip>));
      // Pressable receives disabled={true} to block native touch events.
      expect(screen.getByRole('button').props.disabled).toBe(true);
    });

    it(`[fn] size="${size}" disabled — onSelectedChange not called on press`, () => {
      const handler = vi.fn();
      render(wrap(<Chip size={size} disabled onSelectedChange={handler}>Chip</Chip>));
      fireEvent.press(screen.getByRole('button'));
      expect(handler).not.toHaveBeenCalled();
    });
  }
});

// ─── Figma matrix: variant × size ────────────────────────────────────────────
//
// Validates bold (filled when selected), subtle (tinted when selected),
// and ghost (outline when selected) render at every size without crashing.

describe('Chip — Figma matrix: variant × size', () => {
  const VARIANTS = ['bold', 'subtle', 'ghost'] as const;
  for (const variant of VARIANTS) {
    for (const size of SIZES) {
      it(`[smoke] variant="${variant}" size="${size}" renders without crashing`, () => {
        expect(() =>
          render(wrap(<Chip variant={variant} size={size}>Chip</Chip>)),
        ).not.toThrow();
      });

      it(`[smoke] variant="${variant}" size="${size}" selected renders without crashing`, () => {
        expect(() =>
          render(wrap(<Chip variant={variant} size={size} selected>Chip</Chip>)),
        ).not.toThrow();
      });
    }
  }
});

// ─── Figma matrix: attention → variant mapping ───────────────────────────────
//
// attention="high"   → resolvedVariant="bold"
// attention="medium" → resolvedVariant="subtle"
// attention="low"    → resolvedVariant="ghost"

describe('Chip — Figma matrix: attention levels', () => {
  const ATTENTIONS = ['high', 'medium', 'low'] as const;
  for (const attention of ATTENTIONS) {
    it(`[smoke] attention="${attention}" renders without crashing`, () => {
      expect(() =>
        render(wrap(<Chip attention={attention}>Chip</Chip>)),
      ).not.toThrow();
    });

    it(`[smoke] attention="${attention}" selected renders without crashing`, () => {
      expect(() =>
        render(wrap(<Chip attention={attention} selected>Chip</Chip>)),
      ).not.toThrow();
    });
  }
});

// ─── Figma matrix: appearance × variant (size=m) ─────────────────────────────
//
// Each appearance role drives the chip's accent colour (bg, text, border).

describe('Chip — Figma matrix: appearance × variant (size=m)', () => {
  const APPEARANCES = [
    'primary', 'secondary', 'negative', 'positive', 'warning', 'caution',
  ] as const;
  const VARIANTS = ['bold', 'subtle', 'ghost'] as const;

  for (const appearance of APPEARANCES) {
    for (const variant of VARIANTS) {
      it(`[smoke] appearance="${appearance}" variant="${variant}" renders without crashing`, () => {
        expect(() =>
          render(wrap(<Chip size="m" appearance={appearance} variant={variant}>Chip</Chip>)),
        ).not.toThrow();
      });
    }
  }
});

// ─── Smoke ────────────────────────────────────────────────────────────────────

describe('Chip — smoke', () => {
  it('[smoke] renders without crashing', () => {
    expect(() => render(wrap(<Chip>Label</Chip>))).not.toThrow();
  });

  it('[smoke] renders label text', () => {
    render(wrap(<Chip>Filter</Chip>));
    expect(screen.getByText('Filter')).toBeTruthy();
  });

  it('[smoke] disabled prop accepted without crash', () => {
    expect(() => render(wrap(<Chip disabled>Label</Chip>))).not.toThrow();
  });

  it('[smoke] selected prop accepted without crash', () => {
    expect(() => render(wrap(<Chip selected>Label</Chip>))).not.toThrow();
  });

  it('[smoke] defaultSelected prop accepted without crash', () => {
    expect(() => render(wrap(<Chip defaultSelected>Label</Chip>))).not.toThrow();
  });

  it('[smoke] renders all three sizes without crashing', () => {
    for (const size of SIZES) {
      render(wrap(<Chip size={size}>{size}</Chip>));
      expect(screen.getByText(size)).toBeTruthy();
    }
  });

  it('[smoke] renders all three variants without crashing', () => {
    for (const variant of ['bold', 'subtle', 'ghost'] as const) {
      render(wrap(<Chip variant={variant}>{variant}</Chip>));
      expect(screen.getByText(variant)).toBeTruthy();
    }
  });

  it('[smoke] renders all three attention levels without crashing', () => {
    for (const attention of ['high', 'medium', 'low'] as const) {
      render(wrap(<Chip attention={attention}>{attention}</Chip>));
      expect(screen.getByText(attention)).toBeTruthy();
    }
  });

  it('[smoke] start slot accepted without crash', () => {
    expect(() =>
      render(wrap(<Chip start={<SlotStart />}>Label</Chip>)),
    ).not.toThrow();
  });

  it('[smoke] end slot accepted without crash', () => {
    expect(() =>
      render(wrap(<Chip end={<SlotEnd />}>Label</Chip>)),
    ).not.toThrow();
  });

  it('[smoke] start and end slots together accepted without crash', () => {
    expect(() =>
      render(wrap(<Chip start={<SlotStart />} end={<SlotEnd />}>Label</Chip>)),
    ).not.toThrow();
  });
});

// ─── Functional ───────────────────────────────────────────────────────────────

describe('Chip — functional', () => {
  // ── Selection ──────────────────────────────────────────────────────────────

  it('[fn] selected=true reflected in accessibilityState', () => {
    render(wrap(<Chip selected>Label</Chip>));
    expect(screen.getByRole('button').props.accessibilityState?.selected).toBe(true);
  });

  it('[fn] selected=false reflected in accessibilityState', () => {
    render(wrap(<Chip selected={false}>Label</Chip>));
    expect(screen.getByRole('button').props.accessibilityState?.selected).toBe(false);
  });

  it('[fn] fires onSelectedChange with true on first press (uncontrolled)', () => {
    const handler = vi.fn();
    render(wrap(<Chip onSelectedChange={handler}>Label</Chip>));
    fireEvent.press(screen.getByRole('button'));
    // invokeChipSelectedChange passes (nextSelected, eventDetails) where eventDetails is
    // the GestureResponderEvent. In RNTL's test environment fireEvent.press() provides
    // undefined as the event, so eventDetails is undefined.
    expect(handler).toHaveBeenCalledWith(true, undefined);
  });

  it('[fn] fires onSelectedChange with false on second press (uncontrolled toggle)', () => {
    const handler = vi.fn();
    render(wrap(<Chip onSelectedChange={handler}>Label</Chip>));
    fireEvent.press(screen.getByRole('button'));
    fireEvent.press(screen.getByRole('button'));
    expect(handler).toHaveBeenNthCalledWith(1, true, undefined);
    expect(handler).toHaveBeenNthCalledWith(2, false, undefined);
  });

  it('[fn] defaultSelected=true starts chip as selected', () => {
    render(wrap(<Chip defaultSelected>Label</Chip>));
    expect(screen.getByRole('button').props.accessibilityState?.selected).toBe(true);
  });

  it('[fn] defaultSelected — press toggles to unselected', () => {
    const handler = vi.fn();
    render(wrap(<Chip defaultSelected onSelectedChange={handler}>Label</Chip>));
    fireEvent.press(screen.getByRole('button'));
    expect(handler).toHaveBeenCalledWith(false, undefined);
  });

  it('[fn] controlled selected prop is not overridden by press (controlled mode)', () => {
    // In controlled mode (selected prop set), pressing does not update internal state.
    // onSelectedChange is called but the rendered state stays at the prop value.
    const handler = vi.fn();
    render(wrap(<Chip selected={false} onSelectedChange={handler}>Label</Chip>));
    fireEvent.press(screen.getByRole('button'));
    expect(handler).toHaveBeenCalledWith(true, undefined);
    // Re-query: still false because selected is controlled externally.
    expect(screen.getByRole('button').props.accessibilityState?.selected).toBe(false);
  });

  // ── Disabled ───────────────────────────────────────────────────────────────

  it('[fn] disabled chip does not fire onSelectedChange', () => {
    const handler = vi.fn();
    render(wrap(<Chip disabled onSelectedChange={handler}>Label</Chip>));
    fireEvent.press(screen.getByRole('button'));
    expect(handler).not.toHaveBeenCalled();
  });

  it('[fn] disabled state in accessibilityState', () => {
    render(wrap(<Chip disabled>Label</Chip>));
    expect(screen.getByRole('button').props.accessibilityState?.disabled).toBe(true);
  });

  it('[fn] disabled chip Pressable has disabled={true}', () => {
    render(wrap(<Chip disabled>Label</Chip>));
    expect(screen.getByRole('button').props.disabled).toBe(true);
  });

  // ── Accessibility label ────────────────────────────────────────────────────

  it('[fn] string children used as accessibilityLabel', () => {
    render(wrap(<Chip>Filter</Chip>));
    expect(screen.getByLabelText('Filter')).toBeTruthy();
  });

  it('[fn] aria-label overrides children as accessibilityLabel', () => {
    render(wrap(<Chip aria-label="Filter by color">Label</Chip>));
    expect(screen.getByLabelText('Filter by color')).toBeTruthy();
  });

  it('[fn] accessibilityHint forwarded to Pressable', () => {
    render(wrap(<Chip accessibilityHint="Double tap to toggle">Label</Chip>));
    expect(
      screen.getByRole('button').props.accessibilityHint,
    ).toBe('Double tap to toggle');
  });

  // ── Slots ──────────────────────────────────────────────────────────────────

  it('[fn] start slot icon rendered in tree', () => {
    render(wrap(
      <Chip start={<Icon icon={IcCheckGlyph} appearance="neutral" testID="start-icon" />}>
        Label
      </Chip>,
    ));
    expect(screen.UNSAFE_getByProps({ testID: 'start-icon' })).toBeTruthy();
  });

  it('[fn] end slot icon rendered in tree', () => {
    render(wrap(
      <Chip end={<Icon icon={IcCheckGlyph} appearance="neutral" testID="end-icon" />}>
        Label
      </Chip>,
    ));
    expect(screen.UNSAFE_getByProps({ testID: 'end-icon' })).toBeTruthy();
  });

  it('[fn] start and end slots both rendered in tree', () => {
    render(wrap(
      <Chip
        start={<Icon icon={IcCheckGlyph} appearance="neutral" testID="start-icon-both" />}
        end={<Icon icon={IcCheckGlyph} appearance="neutral" testID="end-icon-both" />}
      >
        Label
      </Chip>,
    ));
    expect(screen.UNSAFE_getByProps({ testID: 'start-icon-both' })).toBeTruthy();
    expect(screen.UNSAFE_getByProps({ testID: 'end-icon-both' })).toBeTruthy();
  });

});

// ─── A11y ─────────────────────────────────────────────────────────────────────

describe('Chip — a11y', () => {
  it('[a11y] Pressable has accessibilityRole=button', () => {
    render(wrap(<Chip>Label</Chip>));
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('[a11y] Pressable has accessible={true} (getByRole works without UNSAFE_)', () => {
    render(wrap(<Chip>Label</Chip>));
    // Unlike Button (accessible not set → getByRole fails), Chip always sets accessible={true}.
    expect(screen.getByRole('button').props.accessible).toBe(true);
  });

  it('[a11y] aria-label maps to accessibilityLabel on Pressable', () => {
    render(wrap(<Chip aria-label="Submit form">Submit</Chip>));
    expect(screen.getByLabelText('Submit form')).toBeTruthy();
  });

  it('[a11y] disabled state in accessibilityState', () => {
    render(wrap(<Chip disabled>Label</Chip>));
    expect(
      screen.getByRole('button').props.accessibilityState,
    ).toEqual(expect.objectContaining({ disabled: true }));
  });

  it('[a11y] selected state in accessibilityState', () => {
    render(wrap(<Chip selected>Label</Chip>));
    expect(
      screen.getByRole('button').props.accessibilityState,
    ).toEqual(expect.objectContaining({ selected: true }));
  });

  it('[a11y] unselected default — selected=false in accessibilityState', () => {
    render(wrap(<Chip>Label</Chip>));
    expect(
      screen.getByRole('button').props.accessibilityState,
    ).toEqual(expect.objectContaining({ selected: false }));
  });

  it('[a11y] label Text is accessible={false} — screen reader reads from Pressable not Text', () => {
    render(wrap(<Chip>Label</Chip>));
    // The Text node must be hidden from a11y — the Pressable carries the label.
    const textNode = screen.getByText('Label');
    expect(textNode.props.accessible).toBe(false);
  });
});

// ─── Bug-catching tests ───────────────────────────────────────────────────────
//
// These tests assert the CORRECT behaviour. They are expected to FAIL until the
// underlying dev-file bug is fixed. Each references the bug ID in the header.

// ─── Functional: event details ────────────────────────────────────────────────

describe('Chip — functional: onSelectedChange eventDetails', () => {
  it('[fn] onSelectedChange receives selected boolean as first argument', () => {
    const handler = vi.fn();
    render(wrap(<Chip onSelectedChange={handler}>Label</Chip>));
    fireEvent.press(screen.getByRole('button'));
    // Second arg is eventDetails — undefined in RNTL test environment (fireEvent.press passes no event)
    expect(handler).toHaveBeenCalledWith(true, undefined);
    expect(typeof handler.mock.calls[0][0]).toBe('boolean');
  });

  it('[fn] onSelectedChange fires with exact values per toggle sequence', () => {
    const handler = vi.fn();
    render(wrap(<Chip onSelectedChange={handler}>Label</Chip>));
    fireEvent.press(screen.getByRole('button')); // false → true
    fireEvent.press(screen.getByRole('button')); // true → false
    expect(handler).toHaveBeenNthCalledWith(1, true, undefined);
    expect(handler).toHaveBeenNthCalledWith(2, false, undefined);
  });

  it('[bug] BUG-CHIP-3: onSelectedChange eventDetails is always undefined on native', () => {
    // Interface declares: onSelectedChange?(selected: boolean, eventDetails?: unknown) => void
    // Native Chip calls: onSelectedChange?.(next) — second arg is never passed.
    // Callers relying on eventDetails for web parity will always receive undefined on native.
    const handler = vi.fn();
    render(wrap(<Chip onSelectedChange={handler}>Label</Chip>));
    fireEvent.press(screen.getByRole('button'));
    // Expected: handler called with (true, <some event details>) for web parity
    // Bug: handler called with (true) only — eventDetails not passed by native
    expect(handler).toHaveBeenCalledWith(true, expect.anything());
  });
});

describe('Chip — bug-catching', () => {
  it('[bug] BUG-CHIP-2: group-disabled chip reports accessibilityState.disabled=true', () => {
    // When ChipGroup provides disabled=true, the chip is non-interactive (handlePress
    // returns early) BUT getChipAccessibilityProps only checks props.disabled, not the
    // group-context computed isDisabled. Screen readers announce the chip as enabled.
    // EXPECTED: disabled=true — ACTUAL: disabled=false → test FAILS until bug is fixed.
    render(wrap(
      <ChipGroupContext.Provider value={{ disabled: true }}>
        <Chip>Label</Chip>
      </ChipGroupContext.Provider>,
    ));
    expect(
      screen.getByRole('button').props.accessibilityState?.disabled,
    ).toBe(true);
  });

  it('[bug] BUG-CHIP-2: group-disabled chip does not fire onSelectedChange', () => {
    // Functional side (handlePress guard) works correctly even with the a11y bug above.
    const handler = vi.fn();
    render(wrap(
      <ChipGroupContext.Provider value={{ disabled: true }}>
        <Chip onSelectedChange={handler}>Label</Chip>
      </ChipGroupContext.Provider>,
    ));
    fireEvent.press(screen.getByRole('button'));
    expect(handler).not.toHaveBeenCalled();
  });

});
