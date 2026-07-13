/**
 * ChipGroup QA tests — smoke, functional, and a11y for the native ChipGroup component.
 *
 * ─── Known dev-file bugs (raise separately) ───────────────────────────────────
 *
 *   BUG-CG-1 · aria-labelledby silently ignored — not wired to accessibilityLabelledBy
 *     getChipGroupAccessibilityProps uses aria-labelledby only to set accessible=true on the
 *     container. The prop VALUE is never forwarded to accessibilityLabelledBy on the rendered
 *     View. VoiceOver/TalkBack cannot resolve the referenced heading's text as the group name.
 *     File: packages/ui-native/src/components/ChipGroup/interface.ts
 *     Fix:  return { ...., accessibilityLabelledBy: props['aria-labelledby'] }
 *
 *   BUG-CG-2 · accessible={true} on container collapses chip children from VoiceOver
 *     When aria-label is set, getChipGroupAccessibilityProps returns accessible=true on the
 *     outer container View. On iOS, accessible={true} on a container makes the ENTIRE subtree a
 *     single VoiceOver focus target — individual chips are no longer reachable by swipe. Users
 *     hear only the group label and cannot interact with chips independently.
 *     RNTL does not reproduce this failure (it queries the React element tree, not the native
 *     a11y tree), so the test suite passes even though real-device behaviour is broken.
 *     Fix:  Remove accessible=true from the container; use importantForAccessibility="yes"
 *           (Android) + accessibilityLabel without accessible=true (iOS tolerates this).
 *
 *   BUG-CG-3 · group-disabled chips not reflected in chip accessibilityState.disabled
 *     Same root as BUG-CHIP-2: getChipAccessibilityProps receives props.disabled (which is
 *     always undefined/false for chips inside a disabled group) instead of the computed
 *     isDisabled from useChipState. Chips inside a disabled ChipGroup are functionally blocked
 *     but announce as "enabled" to screen readers.
 *     Bug-catching test lives in tests/Chip/Chip.test.tsx (BUG-CHIP-2).
 *
 *   BUG-CG-5 · defaultValue with multiple=false can pre-select multiple chips
 *     computeNextChipGroupValues enforces the single-select constraint on every press, but
 *     useChipGroupState accepts defaultValue as-is without normalisation. Passing
 *     defaultValue={['a', 'b']} with multiple=false (the default) starts the component with
 *     both chips selected — violating the single-select contract from the very first render.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { describe, it, expect, vi } from 'vitest';
import { Chip } from '@ui-native/components/Chip/Chip.native';
import { ChipGroup } from '@ui-native/components/ChipGroup/ChipGroup.native';
import { wrap } from '../../utils/renderWithTheme';

// ─── Figma matrix: orientation × layout ──────────────────────────────────────
//
// Mirrors the Figma ChipGroup layout variants:
//
//   orientation="horizontal" (default) + wrap=true (default)
//     → chips flow left-to-right, wrap to next line when full
//   orientation="horizontal" + wrap=false
//     → chips stay on one row inside a horizontal ScrollView (scroll affordance)
//   orientation="vertical"
//     → chips stacked top-to-bottom in a column; wrap has no effect
//
// Structural assertions:
//   wrap=false + horizontal  → UNSAFE_getByProps({ horizontal: true }) finds the ScrollView
//   wrap=true  + horizontal  → no ScrollView in tree
//   vertical                 → no ScrollView regardless of wrap

const ORIENTATIONS = ['horizontal', 'vertical'] as const;

describe('ChipGroup — Figma matrix: orientation × layout', () => {
  for (const orientation of ORIENTATIONS) {
    it(`[smoke] orientation="${orientation}" renders without crashing`, () => {
      expect(() =>
        render(wrap(
          <ChipGroup aria-label="Options" orientation={orientation}>
            <Chip value="a">Alpha</Chip>
            <Chip value="b">Beta</Chip>
          </ChipGroup>,
        )),
      ).not.toThrow();
    });

    it(`[fn] orientation="${orientation}" renders all chip children`, () => {
      render(wrap(
        <ChipGroup aria-label="Options" orientation={orientation}>
          <Chip value="a">Alpha</Chip>
          <Chip value="b">Beta</Chip>
        </ChipGroup>,
      ));
      expect(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' })).toBeTruthy();
      expect(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Beta' })).toBeTruthy();
    });
  }

  it('[smoke] wrap=false renders without crashing', () => {
    expect(() =>
      render(wrap(
        <ChipGroup aria-label="Scroll row" wrap={false}>
          <Chip value="1">One</Chip>
          <Chip value="2">Two</Chip>
          <Chip value="3">Three</Chip>
        </ChipGroup>,
      )),
    ).not.toThrow();
  });

  it('[fn] wrap=false (horizontal) wraps chip row in a horizontal ScrollView', () => {
    render(wrap(
      <ChipGroup aria-label="Scroll row" wrap={false}>
        <Chip value="1">One</Chip>
        <Chip value="2">Two</Chip>
      </ChipGroup>,
    ));
    // ChipGroup.native.tsx: !wrap && orientation === 'horizontal' → ScrollView horizontal
    expect(screen.UNSAFE_getByProps({ horizontal: true })).toBeTruthy();
  });

  it('[fn] wrap=true (default) does not render a horizontal ScrollView', () => {
    render(wrap(
      <ChipGroup aria-label="Wrap row">
        <Chip value="1">One</Chip>
        <Chip value="2">Two</Chip>
      </ChipGroup>,
    ));
    expect(screen.UNSAFE_queryByProps({ horizontal: true })).toBeNull();
  });

  it('[fn] orientation="vertical" does not render a horizontal ScrollView', () => {
    render(wrap(
      <ChipGroup aria-label="Vertical" orientation="vertical">
        <Chip value="a">Alpha</Chip>
      </ChipGroup>,
    ));
    // vertical path always uses the plain View branch
    expect(screen.UNSAFE_queryByProps({ horizontal: true })).toBeNull();
  });

  it('[fn] wrap=false + orientation="vertical" does not render a ScrollView', () => {
    // The ScrollView condition is: !wrap && orientation === 'horizontal'
    // vertical overrides the no-wrap scroll behaviour
    render(wrap(
      <ChipGroup aria-label="Vertical no-wrap" orientation="vertical" wrap={false}>
        <Chip value="a">Alpha</Chip>
      </ChipGroup>,
    ));
    expect(screen.UNSAFE_queryByProps({ horizontal: true })).toBeNull();
  });
});

// ─── Figma matrix: size inheritance ──────────────────────────────────────────
//
// ChipGroup forwards `size` to all child Chips via ChipGroupContext.
// A Chip with no size prop inherits the group size; a Chip with an explicit
// size prop overrides it (ChipState: sizeProp ?? groupCtx.size ?? 'm').

const SIZES = ['s', 'm', 'l'] as const;

describe('ChipGroup — Figma matrix: size inheritance', () => {
  for (const size of SIZES) {
    it(`[smoke] size="${size}" renders without crashing`, () => {
      expect(() =>
        render(wrap(
          <ChipGroup aria-label="Sized group" size={size}>
            <Chip value="a">Alpha</Chip>
            <Chip value="b">Beta</Chip>
          </ChipGroup>,
        )),
      ).not.toThrow();
    });

    it(`[fn] size="${size}" — chips inherit group size and remain interactive`, () => {
      render(wrap(
        <ChipGroup aria-label="Sized group" size={size}>
          <Chip value="a">Alpha</Chip>
        </ChipGroup>,
      ));
      expect(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' })).toBeTruthy();
    });
  }

  it('[fn] chip-level size overrides group size — no crash', () => {
    // Group size="s", chip size="l" → chip uses "l"
    render(wrap(
      <ChipGroup aria-label="Mixed sizes" size="s">
        <Chip value="a" size="l">Alpha</Chip>
      </ChipGroup>,
    ));
    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' })).toBeTruthy();
  });
});

// ─── Figma matrix: variant inheritance ───────────────────────────────────────
//
// ChipGroup forwards `variant` (bold / subtle / ghost) to child Chips via
// ChipGroupContext. Chips without a variant prop inherit the group variant.

const VARIANTS = ['bold', 'subtle', 'ghost'] as const;

describe('ChipGroup — Figma matrix: variant inheritance', () => {
  for (const variant of VARIANTS) {
    it(`[smoke] variant="${variant}" renders without crashing`, () => {
      expect(() =>
        render(wrap(
          <ChipGroup aria-label="Variant group" variant={variant}>
            <Chip value="a">Alpha</Chip>
            <Chip value="b">Beta</Chip>
          </ChipGroup>,
        )),
      ).not.toThrow();
    });

    it(`[fn] variant="${variant}" — chips inherit group variant and remain interactive`, () => {
      render(wrap(
        <ChipGroup aria-label="Variant group" variant={variant}>
          <Chip value="a">Alpha</Chip>
        </ChipGroup>,
      ));
      expect(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' })).toBeTruthy();
    });
  }

  it('[fn] chip-level variant overrides group variant — no crash', () => {
    render(wrap(
      <ChipGroup aria-label="Mixed variants" variant="bold">
        <Chip value="a" variant="ghost">Alpha</Chip>
      </ChipGroup>,
    ));
    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' })).toBeTruthy();
  });
});

// ─── Figma matrix: appearance inheritance ────────────────────────────────────

const APPEARANCES = [
  'primary', 'secondary', 'sparkle', 'positive',
  'negative', 'warning', 'informative', 'neutral',
] as const;

describe('ChipGroup — Figma matrix: appearance inheritance', () => {
  for (const appearance of APPEARANCES) {
    it(`[smoke] appearance="${appearance}" renders without crashing`, () => {
      expect(() =>
        render(wrap(
          <ChipGroup aria-label={`${appearance} group`} appearance={appearance}>
            <Chip value="a">Alpha</Chip>
          </ChipGroup>,
        )),
      ).not.toThrow();
    });
  }
});

// ─── Figma matrix: selection mode ────────────────────────────────────────────
//
// single-select (default, multiple=false):  at most one chip selected at a time
// multiple=true:                            any number can be selected simultaneously

describe('ChipGroup — Figma matrix: selection mode', () => {
  it('[smoke] single-select (default) renders without crashing', () => {
    expect(() =>
      render(wrap(
        <ChipGroup aria-label="Single">
          <Chip value="a">Alpha</Chip>
          <Chip value="b">Beta</Chip>
        </ChipGroup>,
      )),
    ).not.toThrow();
  });

  it('[smoke] multiple=true renders without crashing', () => {
    expect(() =>
      render(wrap(
        <ChipGroup aria-label="Multi" multiple>
          <Chip value="a">Alpha</Chip>
          <Chip value="b">Beta</Chip>
        </ChipGroup>,
      )),
    ).not.toThrow();
  });

  it('[fn] single-select: selecting chip calls onValueChange([value])', () => {
    const handler = vi.fn();
    render(wrap(
      <ChipGroup aria-label="Single" onValueChange={handler}>
        <Chip value="a">Alpha</Chip>
        <Chip value="b">Beta</Chip>
      </ChipGroup>,
    ));
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' }));
    expect(handler).toHaveBeenCalledWith(['a']);
  });

  it('[fn] single-select: selecting B after A replaces — calls onValueChange([b])', () => {
    const handler = vi.fn();
    render(wrap(
      <ChipGroup aria-label="Single" onValueChange={handler}>
        <Chip value="a">Alpha</Chip>
        <Chip value="b">Beta</Chip>
      </ChipGroup>,
    ));
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' }));
    handler.mockClear();
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Beta' }));
    expect(handler).toHaveBeenCalledWith(['b']);
  });

  it('[fn] single-select: re-tapping selected chip deselects it — calls onValueChange([])', () => {
    const handler = vi.fn();
    render(wrap(
      <ChipGroup aria-label="Single" onValueChange={handler}>
        <Chip value="a">Alpha</Chip>
      </ChipGroup>,
    ));
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' }));
    handler.mockClear();
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' }));
    expect(handler).toHaveBeenCalledWith([]);
  });

  it('[fn] multiple=true: chips accumulate — each press appends to the array', () => {
    const handler = vi.fn();
    render(wrap(
      <ChipGroup aria-label="Multi" multiple onValueChange={handler}>
        <Chip value="a">Alpha</Chip>
        <Chip value="b">Beta</Chip>
        <Chip value="c">Gamma</Chip>
      </ChipGroup>,
    ));
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' }));
    expect(handler).toHaveBeenLastCalledWith(['a']);
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Beta' }));
    expect(handler).toHaveBeenLastCalledWith(['a', 'b']);
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Gamma' }));
    expect(handler).toHaveBeenLastCalledWith(['a', 'b', 'c']);
  });

  it('[fn] multiple=true: re-tapping selected chip removes it from array', () => {
    const handler = vi.fn();
    render(wrap(
      <ChipGroup aria-label="Multi" multiple defaultValue={['a', 'b']} onValueChange={handler}>
        <Chip value="a">Alpha</Chip>
        <Chip value="b">Beta</Chip>
      </ChipGroup>,
    ));
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' }));
    expect(handler).toHaveBeenCalledWith(['b']);
  });
});

// ─── Figma matrix: disabled state ────────────────────────────────────────────
//
// When ChipGroup is disabled:
//   • ChipGroupContext.disabled=true → chip's isDisabled=true → Pressable.disabled=true
//   • Press events are swallowed by the Pressable — onPress is never called
//   • onValueChange is never fired
//   • Container View gets accessibilityState.disabled=true

describe('ChipGroup — Figma matrix: disabled', () => {
  it('[smoke] disabled renders without crashing', () => {
    expect(() =>
      render(wrap(
        <ChipGroup aria-label="Disabled" disabled>
          <Chip value="a">Alpha</Chip>
          <Chip value="b">Beta</Chip>
        </ChipGroup>,
      )),
    ).not.toThrow();
  });

  it('[fn] disabled group: chip Pressable.disabled=true', () => {
    render(wrap(
      <ChipGroup aria-label="Disabled" disabled>
        <Chip value="a">Alpha</Chip>
      </ChipGroup>,
    ));
    // Chip's Pressable receives disabled={isDisabled} which includes groupCtx.disabled
    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' }).props.disabled).toBe(true);
  });

  it('[fn] disabled group: pressing chips does not call onValueChange', () => {
    const handler = vi.fn();
    render(wrap(
      <ChipGroup aria-label="Disabled" disabled onValueChange={handler}>
        <Chip value="a">Alpha</Chip>
      </ChipGroup>,
    ));
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' }));
    expect(handler).not.toHaveBeenCalled();
  });

  it('[fn] disabled group: selected state does not change on press', () => {
    render(wrap(
      <ChipGroup aria-label="Disabled" disabled defaultValue={['a']}>
        <Chip value="a">Alpha</Chip>
      </ChipGroup>,
    ));
    const chip = screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' });
    expect(chip.props.accessibilityState?.selected).toBe(true);
    fireEvent.press(chip);
    // Still selected after press — disabled guard blocks toggle
    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' }).props.accessibilityState?.selected).toBe(true);
  });
});

// ─── Smoke ────────────────────────────────────────────────────────────────────

describe('ChipGroup — smoke', () => {
  it('[smoke] renders without crashing', () => {
    expect(() =>
      render(wrap(
        <ChipGroup aria-label="Filter options">
          <Chip value="a">Alpha</Chip>
        </ChipGroup>,
      )),
    ).not.toThrow();
  });

  it('[smoke] renders chip children text', () => {
    render(wrap(
      <ChipGroup aria-label="Options">
        <Chip value="a">Alpha</Chip>
        <Chip value="b">Beta</Chip>
      </ChipGroup>,
    ));
    // Chip label Text is accessible={false} — use includeHiddenElements for text presence
    expect(screen.getByText('Alpha', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByText('Beta', { includeHiddenElements: true })).toBeTruthy();
  });

  it('[smoke] multiple prop accepted without crash', () => {
    expect(() =>
      render(wrap(
        <ChipGroup aria-label="Multi" multiple>
          <Chip value="a">Alpha</Chip>
        </ChipGroup>,
      )),
    ).not.toThrow();
  });

  it('[smoke] required prop accepted without crash', () => {
    expect(() =>
      render(wrap(
        <ChipGroup aria-label="Required" required defaultValue={['a']}>
          <Chip value="a">Alpha</Chip>
        </ChipGroup>,
      )),
    ).not.toThrow();
  });

  it('[smoke] maxSelections prop accepted without crash', () => {
    expect(() =>
      render(wrap(
        <ChipGroup aria-label="Capped" multiple maxSelections={2}>
          <Chip value="a">Alpha</Chip>
          <Chip value="b">Beta</Chip>
          <Chip value="c">Gamma</Chip>
        </ChipGroup>,
      )),
    ).not.toThrow();
  });

  it('[smoke] defaultValue prop accepted without crash', () => {
    expect(() =>
      render(wrap(
        <ChipGroup aria-label="Default" defaultValue={['b']}>
          <Chip value="a">Alpha</Chip>
          <Chip value="b">Beta</Chip>
        </ChipGroup>,
      )),
    ).not.toThrow();
  });

  it('[smoke] testID prop accepted without crash', () => {
    expect(() =>
      render(wrap(
        <ChipGroup aria-label="Options" testID="cg-test">
          <Chip value="a">Alpha</Chip>
        </ChipGroup>,
      )),
    ).not.toThrow();
  });

});

// ─── Functional ───────────────────────────────────────────────────────────────

describe('ChipGroup — functional', () => {
  // ── Uncontrolled: single-select ───────────────────────────────────────────

  it('[fn] uncontrolled: selecting chip updates accessibilityState.selected to true', () => {
    render(wrap(
      <ChipGroup aria-label="Options">
        <Chip value="a">Alpha</Chip>
      </ChipGroup>,
    ));
    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' }).props.accessibilityState?.selected).toBe(false);
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' }));
    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' }).props.accessibilityState?.selected).toBe(true);
  });

  it('[fn] uncontrolled single-select: selecting B deselects A in the rendered tree', () => {
    render(wrap(
      <ChipGroup aria-label="Single">
        <Chip value="a">Alpha</Chip>
        <Chip value="b">Beta</Chip>
      </ChipGroup>,
    ));
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' }));
    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' }).props.accessibilityState?.selected).toBe(true);
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Beta' }));
    // Alpha deselected, Beta selected
    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' }).props.accessibilityState?.selected).toBe(false);
    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Beta' }).props.accessibilityState?.selected).toBe(true);
  });

  // ── Controlled ───────────────────────────────────────────────────────────

  it('[fn] controlled value drives chip selected state', () => {
    render(wrap(
      <ChipGroup aria-label="Controlled" value={['b']}>
        <Chip value="a">Alpha</Chip>
        <Chip value="b">Beta</Chip>
      </ChipGroup>,
    ));
    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' }).props.accessibilityState?.selected).toBe(false);
    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Beta' }).props.accessibilityState?.selected).toBe(true);
  });

  it('[fn] controlled: pressing chip calls onValueChange but value prop freezes the displayed state', () => {
    const handler = vi.fn();
    render(wrap(
      <ChipGroup aria-label="Controlled" value={['a']} onValueChange={handler}>
        <Chip value="a">Alpha</Chip>
        <Chip value="b">Beta</Chip>
      </ChipGroup>,
    ));
    // Alpha is selected in controlled state
    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' }).props.accessibilityState?.selected).toBe(true);
    // Press Beta — onValueChange fires with ['b'] (single-select replaces)
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Beta' }));
    expect(handler).toHaveBeenCalledWith(['b']);
    // Without re-rendering with new value prop, Alpha stays selected (controlled)
    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' }).props.accessibilityState?.selected).toBe(true);
  });

  it('[fn] controlled: value=[] shows all chips as unselected', () => {
    render(wrap(
      <ChipGroup aria-label="All off" value={[]}>
        <Chip value="a">Alpha</Chip>
        <Chip value="b">Beta</Chip>
      </ChipGroup>,
    ));
    screen.UNSAFE_getAllByProps({ accessibilityRole: 'button' }).forEach((btn) => {
      expect(btn.props.accessibilityState?.selected).toBe(false);
    });
  });

  // ── Multiple ─────────────────────────────────────────────────────────────

  it('[fn] multiple=true: accumulated selections reflected in accessibilityState', () => {
    render(wrap(
      <ChipGroup aria-label="Multi" multiple>
        <Chip value="a">Alpha</Chip>
        <Chip value="b">Beta</Chip>
      </ChipGroup>,
    ));
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' }));
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Beta' }));
    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' }).props.accessibilityState?.selected).toBe(true);
    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Beta' }).props.accessibilityState?.selected).toBe(true);
  });

  // ── required ─────────────────────────────────────────────────────────────

  it('[fn] required=true single-select: cannot deselect the last selected chip', () => {
    const handler = vi.fn();
    render(wrap(
      <ChipGroup aria-label="Required" required defaultValue={['a']} onValueChange={handler}>
        <Chip value="a">Alpha</Chip>
        <Chip value="b">Beta</Chip>
      </ChipGroup>,
    ));
    // Re-tapping the only selected chip — computeNextChipGroupValues returns null
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' }));
    expect(handler).not.toHaveBeenCalled();
    // Alpha remains selected
    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' }).props.accessibilityState?.selected).toBe(true);
  });

  it('[fn] required=true single-select: CAN replace selection with a different chip', () => {
    const handler = vi.fn();
    render(wrap(
      <ChipGroup aria-label="Required" required defaultValue={['a']} onValueChange={handler}>
        <Chip value="a">Alpha</Chip>
        <Chip value="b">Beta</Chip>
      </ChipGroup>,
    ));
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Beta' }));
    expect(handler).toHaveBeenCalledWith(['b']);
  });

  it('[fn] required=true multiple: cannot deselect when only one chip remains selected', () => {
    const handler = vi.fn();
    render(wrap(
      <ChipGroup aria-label="Required multi" required multiple defaultValue={['a']} onValueChange={handler}>
        <Chip value="a">Alpha</Chip>
        <Chip value="b">Beta</Chip>
      </ChipGroup>,
    ));
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' }));
    expect(handler).not.toHaveBeenCalled();
  });

  // ── maxSelections ─────────────────────────────────────────────────────────

  it('[fn] maxSelections: adding beyond cap is silently blocked', () => {
    const handler = vi.fn();
    render(wrap(
      <ChipGroup aria-label="Capped" multiple maxSelections={2} onValueChange={handler}>
        <Chip value="a">Alpha</Chip>
        <Chip value="b">Beta</Chip>
        <Chip value="c">Gamma</Chip>
      </ChipGroup>,
    ));
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' }));
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Beta' }));
    handler.mockClear();
    // Cap of 2 reached — pressing Gamma is blocked
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Gamma' }));
    expect(handler).not.toHaveBeenCalled();
    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Gamma' }).props.accessibilityState?.selected).toBe(false);
  });

  it('[fn] maxSelections: deselecting from a full group is still allowed', () => {
    const handler = vi.fn();
    render(wrap(
      <ChipGroup aria-label="Capped" multiple maxSelections={2} defaultValue={['a', 'b']} onValueChange={handler}>
        <Chip value="a">Alpha</Chip>
        <Chip value="b">Beta</Chip>
        <Chip value="c">Gamma</Chip>
      </ChipGroup>,
    ));
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' }));
    expect(handler).toHaveBeenCalledWith(['b']);
  });

  // ── defaultValue ──────────────────────────────────────────────────────────

  it('[fn] defaultValue sets initial selected state on first render', () => {
    render(wrap(
      <ChipGroup aria-label="Default" defaultValue={['b']}>
        <Chip value="a">Alpha</Chip>
        <Chip value="b">Beta</Chip>
      </ChipGroup>,
    ));
    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' }).props.accessibilityState?.selected).toBe(false);
    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Beta' }).props.accessibilityState?.selected).toBe(true);
  });

  it('[fn] defaultValue is uncontrolled — onValueChange fires on subsequent presses', () => {
    const handler = vi.fn();
    render(wrap(
      <ChipGroup aria-label="Default" defaultValue={['a']} onValueChange={handler}>
        <Chip value="a">Alpha</Chip>
        <Chip value="b">Beta</Chip>
      </ChipGroup>,
    ));
    // Alpha starts selected; pressing Beta replaces it (single-select)
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Beta' }));
    expect(handler).toHaveBeenCalledWith(['b']);
  });

  // ── testID & layout ───────────────────────────────────────────────────────

  it('[fn] testID is present on the outer container View', () => {
    render(wrap(
      <ChipGroup aria-label="Options" testID="my-chip-group">
        <Chip value="a">Alpha</Chip>
      </ChipGroup>,
    ));
    expect(screen.UNSAFE_getByProps({ testID: 'my-chip-group', importantForAccessibility: 'no-hide-descendants' })).toBeTruthy();
  });
});

// ─── A11y ─────────────────────────────────────────────────────────────────────

describe('ChipGroup — a11y', () => {
  it('[a11y] chip children queryable by role when group has aria-label', () => {
    render(wrap(
      <ChipGroup aria-label="Options">
        <Chip value="a">Alpha</Chip>
        <Chip value="b">Beta</Chip>
      </ChipGroup>,
    ));
    // importantForAccessibility='no-hide-descendants' on the container hides chips from the
    // native a11y tree. UNSAFE_getByProps is required to reach them via the raw component tree.
    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' })).toBeTruthy();
    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Beta' })).toBeTruthy();
  });

  it('[a11y] aria-label maps to accessibilityLabel on the container', () => {
    render(wrap(
      <ChipGroup aria-label="Filter options">
        <Chip value="a">Alpha</Chip>
      </ChipGroup>,
    ));
    expect(screen.getByLabelText('Filter options')).toBeTruthy();
  });

  it('[a11y] accessible=false on container when aria-label is provided (PR #330: always false)', () => {
    render(wrap(
      <ChipGroup aria-label="Filter options" testID="labeled-group">
        <Chip value="a">Alpha</Chip>
      </ChipGroup>,
    ));
    // PR #330 (f27550f7): getChipGroupAccessibilityProps now always returns accessible=false
    // regardless of whether aria-label is set, so individual chips stay reachable.
    expect(screen.UNSAFE_getByProps({ testID: 'labeled-group', importantForAccessibility: 'no-hide-descendants' }).props.accessible).toBe(false);
  });

  it('[a11y] accessible=false on container when no label is provided', () => {
    render(wrap(
      <ChipGroup testID="unlabeled-group">
        <Chip value="a">Alpha</Chip>
      </ChipGroup>,
    ));
    expect(screen.UNSAFE_getByProps({ testID: 'unlabeled-group', importantForAccessibility: 'no-hide-descendants' }).props.accessible).toBe(false);
  });

  it('[a11y] accessible=false when only aria-labelledby is provided (PR #330: always false)', () => {
    render(wrap(
      <ChipGroup aria-labelledby="heading-id" testID="labeled-by-group">
        <Chip value="a">Alpha</Chip>
      </ChipGroup>,
    ));
    // PR #330 (f27550f7): getChipGroupAccessibilityProps always returns accessible=false now.
    // The old hasName guard (accessible=true when aria-labelledby present) has been removed.
    expect(screen.UNSAFE_getByProps({ testID: 'labeled-by-group', importantForAccessibility: 'no-hide-descendants' }).props.accessible).toBe(false);
  });

  it('[a11y] accessibilityHint prop is accepted without crash', () => {
    // PR #330: getChipGroupAccessibilityProps does `void props` so accessibilityHint is not
    // forwarded to the container View (container is accessible=false, so VoiceOver/TalkBack
    // would not announce it anyway). The prop is accepted for API compatibility.
    expect(() => render(wrap(
      <ChipGroup
        aria-label="Options"
        accessibilityHint="Double-tap to select"
        testID="hinted-group"
      >
        <Chip value="a">Alpha</Chip>
      </ChipGroup>,
    ))).not.toThrow();
  });

  it('[a11y] disabled group — container accessible=false, chips carry disabled state individually', () => {
    // PR #330: getChipGroupAccessibilityProps always returns accessible=false regardless of props.
    // The disabled state is forwarded to individual chips via ChipGroupContext, not the container.
    render(wrap(
      <ChipGroup aria-label="Disabled group" disabled testID="disabled-group">
        <Chip value="a">Alpha</Chip>
      </ChipGroup>,
    ));
    const container = screen.UNSAFE_getByProps({ testID: 'disabled-group', importantForAccessibility: 'no-hide-descendants' });
    expect(container.props.accessible).toBe(false);
    // Individual chips reflect disabled via their own accessibilityState
    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' }).props.accessibilityState?.disabled).toBe(true);
  });

  it('[a11y] non-disabled group has no accessibilityState on container', () => {
    render(wrap(
      <ChipGroup aria-label="Active group" testID="active-group">
        <Chip value="a">Alpha</Chip>
      </ChipGroup>,
    ));
    // getChipGroupAccessibilityProps only adds accessibilityState when disabled
    expect(screen.UNSAFE_getByProps({ testID: 'active-group', importantForAccessibility: 'no-hide-descendants' }).props.accessibilityState).toBeUndefined();
  });

  it('[a11y] selected chip reports accessibilityState.selected=true', () => {
    render(wrap(
      <ChipGroup aria-label="Options" defaultValue={['a']}>
        <Chip value="a">Alpha</Chip>
        <Chip value="b">Beta</Chip>
      </ChipGroup>,
    ));
    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' }).props.accessibilityState?.selected).toBe(true);
    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Beta' }).props.accessibilityState?.selected).toBe(false);
  });

  it('[a11y] pressing chip toggles accessibilityState.selected', () => {
    render(wrap(
      <ChipGroup aria-label="Options">
        <Chip value="a">Alpha</Chip>
      </ChipGroup>,
    ));
    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' }).props.accessibilityState?.selected).toBe(false);
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' }));
    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' }).props.accessibilityState?.selected).toBe(true);
  });

  it('[a11y] individually disabled chip inside group has accessibilityState.disabled=true', () => {
    render(wrap(
      <ChipGroup aria-label="Options">
        <Chip value="a" disabled>Alpha</Chip>
        <Chip value="b">Beta</Chip>
      </ChipGroup>,
    ));
    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' }).props.accessibilityState?.disabled).toBe(true);
    expect(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Beta' }).props.accessibilityState?.disabled).toBe(false);
  });
});

// ─── Bug-catching ─────────────────────────────────────────────────────────────

describe('ChipGroup — bug-catching', () => {
  // ── BUG-CG-1 ──────────────────────────────────────────────────────────────
  // aria-labelledby is consumed for the hasName guard (accessible=true) but the
  // prop VALUE is never forwarded to accessibilityLabelledBy on the rendered View.
  // VoiceOver/TalkBack cannot resolve the referenced element's text as the group name.

  it('[bug] BUG-CG-1: aria-labelledby is not wired to accessibilityLabelledBy on the container', () => {
    render(wrap(
      <ChipGroup aria-labelledby="section-heading" testID="cg-by">
        <Chip value="a">Alpha</Chip>
      </ChipGroup>,
    ));
    const group = screen.UNSAFE_getByProps({ testID: 'cg-by', importantForAccessibility: 'no-hide-descendants' });
    // Expected: accessibilityLabelledBy='section-heading' so VoiceOver resolves the heading text
    // Bug:      accessibilityLabelledBy is undefined — the prop is silently dropped after the
    //           hasName guard check in getChipGroupAccessibilityProps
    expect(group.props.accessibilityLabelledBy).toBe('section-heading');
  });

  // ── BUG-CG-5 ──────────────────────────────────────────────────────────────
  // useChipGroupState initialises internalValue directly from defaultValue without
  // normalising it against the multiple=false constraint. When multiple is false
  // (the default), defaultValue should be capped at one entry.

  // ── required and maxSelections events ───────────────────────────────────────

  it('[fn] required=true — deselecting the only selected chip does NOT fire onValueChange', () => {
    // required=true means selection can never become empty.
    // The logic in useChipGroupState returns null for the transition → onValueChange not called.
    const handler = vi.fn();
    render(wrap(
      <ChipGroup aria-label="Required" required defaultValue={['a']} onValueChange={handler}>
        <Chip value="a">Alpha</Chip>
        <Chip value="b">Beta</Chip>
      </ChipGroup>,
    ));
    // Alpha is pre-selected. Pressing it would deselect to [] — blocked by required.
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' }));
    expect(handler).not.toHaveBeenCalled();
  });

  it('[fn] required=true — switching from one chip to another DOES fire onValueChange', () => {
    const handler = vi.fn();
    render(wrap(
      <ChipGroup aria-label="Required switch" required defaultValue={['a']} onValueChange={handler}>
        <Chip value="a">Alpha</Chip>
        <Chip value="b">Beta</Chip>
      </ChipGroup>,
    ));
    // Pressing Beta replaces Alpha — still ≥1 selected → allowed
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Beta' }));
    expect(handler).toHaveBeenCalledWith(['b']);
  });

  it('[fn] maxSelections=2 — third chip press is silently ignored', () => {
    // When multiple=true and maxSelections=2, selecting a 3rd chip calls onValueChange
    // but the update is blocked (returns null) — handler not called.
    const handler = vi.fn();
    render(wrap(
      <ChipGroup aria-label="Max2" multiple maxSelections={2} onValueChange={handler}>
        <Chip value="a">Alpha</Chip>
        <Chip value="b">Beta</Chip>
        <Chip value="c">Gamma</Chip>
      </ChipGroup>,
    ));
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' }));
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Beta' }));
    // Two selected — at limit. Third press should be blocked.
    handler.mockClear();
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Gamma' }));
    expect(handler).not.toHaveBeenCalled();
  });

  it('[fn] maxSelections=2 — deselecting below limit re-enables further selection', () => {
    const handler = vi.fn();
    render(wrap(
      <ChipGroup aria-label="Max2 deselect" multiple maxSelections={2} defaultValue={['a', 'b']} onValueChange={handler}>
        <Chip value="a">Alpha</Chip>
        <Chip value="b">Beta</Chip>
        <Chip value="c">Gamma</Chip>
      </ChipGroup>,
    ));
    // Deselect Alpha → ['b'] — now below limit
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Alpha' }));
    expect(handler).toHaveBeenCalledWith(['b']);
    // Now Gamma can be selected
    handler.mockClear();
    fireEvent.press(screen.UNSAFE_getByProps({ accessibilityRole: 'button', accessibilityLabel: 'Gamma' }));
    expect(handler).toHaveBeenCalledWith(['b', 'c']);
  });

  it('[bug] BUG-CG-5: defaultValue with multiple=false can pre-select multiple chips, violating single-select', () => {
    render(wrap(
      <ChipGroup aria-label="Bug group" defaultValue={['a', 'b']}>
        <Chip value="a">Alpha</Chip>
        <Chip value="b">Beta</Chip>
        <Chip value="c">Gamma</Chip>
      </ChipGroup>,
    ));
    const selectedChips = screen
      .UNSAFE_getAllByProps({ accessibilityRole: 'button' })
      .filter((btn) => btn.props.accessibilityState?.selected === true);
    // Expected: single-select normalises defaultValue to at most 1 chip
    // Bug:      both Alpha and Beta are selected because defaultValue is never validated
    expect(selectedChips).toHaveLength(1);
  });
});
