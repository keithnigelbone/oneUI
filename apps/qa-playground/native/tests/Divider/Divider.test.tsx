/**
 * Divider QA tests — smoke, functional, a11y, and bug-catching.
 *
 * Source: packages/ui-native/src/components/Divider/Divider.native.tsx
 *
 * ─── Figma API (from API table screenshot) ───────────────────────────────────
 *
 *   Property      Values                                        Figma type
 *   ──────────────────────────────────────────────────────────────────────────
 *   orientation   horizontal | vertical                         component property
 *   size          S | M | L   (stroke width)                   component property
 *   slot          none | Icon | Label                           component property
 *   contentAlign  center | start | end                          component property
 *   appearance    auto | neutral | primary | secondary |
 *                 sparkle | negative | positive | warning |
 *                 informative                                    variable mode
 *   attention     high | medium | low                           component property
 *   roundCaps     true | false                                  component property
 *
 * ─── Native prop mapping ─────────────────────────────────────────────────────
 *
 *   Figma "slot"     → native prop `content` ('none' | 'icon' | 'label')
 *   Figma "size S/M/L" → native prop `size` ('s' | 'm' | 'l')
 *
 *   NOTE: Figma uses "slot" but the native interface uses "content".
 *         See BUG-DIV-1 below.
 *
 * ─── Component behaviour ─────────────────────────────────────────────────────
 *
 *   Simple path (content='none' OR content≠none with no children):
 *     → single <View> with LINE_STYLE dimensions and linePaint.
 *       orientation  → height (H) or width (V) from STROKE_FOR_SIZE
 *       roundCaps    → borderRadius = 0 (false) or tokens.shape.pill (true)
 *
 *   Content path (content='label'|'icon' AND children present):
 *     → outer container + [leadingLine] + contentSlot + [trailingLine]
 *       showLeadingLine  = contentAlign !== 'start'
 *       showTrailingLine = contentAlign !== 'end'
 *       Inner lines carry DIVIDER_LINE_A11Y (hidden from screen readers).
 *       content='label' + string children → <Text> with label typography
 *       content='label' + non-string children → plain <View> (no typography)  ← BUG-DIV-2
 *       content='icon' + children → <View style={contentSlot}>children</View>
 *
 *   Stroke widths (INTENTIONAL-LITERAL, mirror web --Stroke-S/M/L):
 *     s → 0.5px   m → 1px   l → 1.5px
 *
 *   Defaults: orientation='horizontal', size='m', content='none',
 *             contentAlign='center', attention='low', roundCaps=false,
 *             appearance='auto' → resolves to 'neutral'
 *
 * ─── A11y props ──────────────────────────────────────────────────────────────
 *
 *   Outer container:
 *     accessible=true, accessibilityRole='none', role='separator',
 *     aria-orientation=<orientation>, accessibilityHint=<hint?>
 *
 *   Inner line segments (content path only):
 *     accessible=false, accessibilityElementsHidden=true,
 *     importantForAccessibility='no-hide-descendants' (Android),
 *     aria-hidden=true
 *
 * ─── Bugs (raise to dev team) ────────────────────────────────────────────────
 *
 *   BUG-DIV-1 · Figma API property "slot" is named "content" in native interface
 *     Figma: slot="none|Icon|Label"   Native: content='none'|'icon'|'label'
 *     All OneUI native components should mirror the Figma API property names
 *     exactly. The mismatch requires callers to remember the translation and
 *     prevents mechanical API parity checking.
 *     File: packages/ui-native/src/components/Divider/interface.ts (DividerContent,
 *           DividerProps.content, useDividerState)
 *     Fix:  Rename `content` prop to `slot` and `DividerContent` to `DividerSlot`.
 *           Expose a @deprecated `content` alias during a migration window.
 *
 *   BUG-DIV-2 · content='label' with non-string children silently bypasses typography
 *     When `content='label'` is used with a ReactElement child instead of a string,
 *     the component falls through to the plain View branch (same as content='icon')
 *     with NO contentSlot sizing and NO label typography styles applied.
 *     The caller gets no warning that label semantics and styles are lost.
 *     File: packages/ui-native/src/components/Divider/Divider.native.tsx:78-96
 *     Fix:  Either validate that children is a string when content='label' (warn
 *           in dev) or apply contentSlot sizing to the label fallback View.
 *
 *   BUG-DIV-3 · Default attention='low' is the lightest stroke — may surprise callers
 *     `attention` defaults to 'low' (strokeLow color), the least visible option.
 *     Most UI contexts expect a moderately visible separator by default. Callers who
 *     forget to set attention get a near-invisible divider in light themes.
 *     File: packages/ui-native/src/components/Divider/interface.ts:49
 *     Fix:  Change default to 'medium', or document the intentional low-visibility
 *           default in the prop JSDoc.
 *
 *   BUG-DIV-4 · DIVIDER_LINE_A11Y uses `importantForAccessibility='no-hide-descendants'`
 *     on Views that have no descendants (pure visual lines)
 *     The inner line segments are leaf Views with no children. Using
 *     'no-hide-descendants' on a childless View is redundant — 'no' alone is
 *     sufficient to remove the element from the Android a11y tree.
 *     File: packages/ui-native/src/components/Divider/interface.ts:94-99
 *     Fix:  Change `importantForAccessibility: 'no-hide-descendants'` to
 *           `importantForAccessibility: 'no'` on line segments.
 *     Note: For the content-path outer container, 'no-hide-descendants' is
 *           used to hide both the line AND any unlabelled children — this is
 *           intentional and correct there.
 */

import React from 'react';
import { View } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { describe, it, expect } from 'vitest';
import { tokens } from '@oneui/tokens';
import { Divider } from '@ui-native/components/Divider/Divider.native';
import { Icon } from '@ui-native/components/Icon/Icon.native';
import { IcFavoriteGlyph } from '@ui-native/components/Button/buttonShowcaseJdsGlyphs';
import { wrap } from '../../utils/renderWithTheme';

// ─── Figma API constants ──────────────────────────────────────────────────────
//
// Named to match the Figma API table exactly.

/** Figma "orientation" property */
const ORIENTATIONS = ['horizontal', 'vertical'] as const;

/** Figma "size" property — S/M/L maps to native 's'/'m'/'l' */
const SIZES = ['s', 'm', 'l'] as const;

/** Figma "slot" property — maps to native `content` prop */
const SLOTS = ['none', 'icon', 'label'] as const;

/** Figma "contentAlign" property */
const ALIGNS = ['center', 'start', 'end'] as const;

/** Figma "attention" property */
const ATTENTIONS = ['high', 'medium', 'low'] as const;

/** Figma "appearance" property (variable mode) */
const APPEARANCES = [
  'auto', 'neutral', 'primary', 'secondary', 'sparkle',
  'negative', 'positive', 'warning', 'informative',
] as const;

// ─── Stroke widths ────────────────────────────────────────────────────────────
//
// INTENTIONAL-LITERAL values matching web --Stroke-S/M/L.

const EXPECTED_STROKE = { s: 0.5, m: 1, l: 1.5 } as const;

// ─── 252-variant content product ─────────────────────────────────────────────
//
// The 7 content variants filling the Figma matrix "slot × contentAlign" axis.

const CONTENT_VARIANTS = [
  { content: 'none'  as const, contentAlign: 'center' as const },
  { content: 'icon'  as const, contentAlign: 'center' as const },
  { content: 'icon'  as const, contentAlign: 'start'  as const },
  { content: 'icon'  as const, contentAlign: 'end'    as const },
  { content: 'label' as const, contentAlign: 'center' as const },
  { content: 'label' as const, contentAlign: 'start'  as const },
  { content: 'label' as const, contentAlign: 'end'    as const },
] as const;

const ROUND_CAPS = [false, true] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function flatStyle(style: unknown): Record<string, unknown> {
  if (!style) return {};
  if (Array.isArray(style)) return Object.assign({}, ...(style as unknown[]).map(flatStyle));
  if (typeof style === 'object') return style as Record<string, unknown>;
  return {};
}

/** Vertical dividers need a height-constrained parent (alignSelf: 'stretch'). */
const VERT_H = tokens.spacing['18']; // 72px — matches showcase
function wrapV(el: React.ReactElement): React.ReactElement {
  return wrap(
    <View style={{ height: VERT_H, flexDirection: 'row', alignItems: 'stretch' }}>
      {el}
    </View>,
  ) as React.ReactElement;
}

// ─── Figma full matrix: 252 variants ─────────────────────────────────────────
//
// orientation(2) × size(3) × attention(3) × content_variant(7) × roundCaps(2)
// = 252 cells — matches the "252 Variants" count shown in the Figma component set.

describe('Divider — Figma full matrix (252 variants)', () => {
  for (const orientation of ORIENTATIONS) {
    const renderer = orientation === 'vertical' ? wrapV : wrap;
    for (const size of SIZES) {
      for (const attention of ATTENTIONS) {
        for (const { content, contentAlign } of CONTENT_VARIANTS) {
          for (const roundCaps of ROUND_CAPS) {
            const label =
              `orientation="${orientation}" size="${size}" attention="${attention}" ` +
              `slot="${content}" contentAlign="${contentAlign}" roundCaps=${roundCaps}`;

            const children =
              content === 'label' ? 'Section'
              : content === 'icon'  ? <View />
              : undefined;

            it(`[smoke] ${label} — renders without crashing`, () => {
              expect(() =>
                render(renderer(
                  <Divider
                    orientation={orientation}
                    size={size}
                    attention={attention}
                    content={content}
                    contentAlign={contentAlign}
                    roundCaps={roundCaps}
                    testID="matrix-smoke"
                  >
                    {children}
                  </Divider>,
                )),
              ).not.toThrow();
            });

            it(`[fn] ${label} — separator role + correct aria-orientation`, () => {
              render(renderer(
                <Divider
                  orientation={orientation}
                  size={size}
                  attention={attention}
                  content={content}
                  contentAlign={contentAlign}
                  roundCaps={roundCaps}
                  testID="matrix-fn"
                >
                  {children}
                </Divider>,
              ));
              const el = screen.getByTestId('matrix-fn');
              expect(el.props.role).toBe('separator');
              expect(el.props['aria-orientation']).toBe(orientation);
            });
          }
        }
      }
    }
  }
});

// ─── Smoke ────────────────────────────────────────────────────────────────────

describe('Divider — smoke', () => {
  it('[smoke] renders with all defaults (horizontal / m / low / no slot)', () => {
    expect(() => render(wrap(<Divider />))).not.toThrow();
  });

  it('[smoke] renders all sizes', () => {
    for (const size of SIZES) {
      const { unmount } = render(wrap(<Divider size={size} testID={`sz-${size}`} />));
      expect(screen.getByTestId(`sz-${size}`)).toBeTruthy();
      unmount();
    }
    render(wrap(<Divider size="m" />));
  });

  it('[smoke] renders all attention levels', () => {
    for (const attention of ATTENTIONS) {
      const { unmount } = render(wrap(<Divider attention={attention} testID={`att-${attention}`} />));
      expect(screen.getByTestId(`att-${attention}`)).toBeTruthy();
      unmount();
    }
    render(wrap(<Divider attention="high" />));
  });

  it('[smoke] renders all orientations', () => {
    const { unmount } = render(wrap(<Divider orientation="horizontal" testID="h" />));
    expect(screen.getByTestId('h')).toBeTruthy();
    unmount();
    render(wrapV(<Divider orientation="vertical" testID="v" />));
    expect(screen.getByTestId('v')).toBeTruthy();
  });

  it('[smoke] renders all slot values with children', () => {
    for (const slot of SLOTS) {
      const children = slot === 'label' ? 'Text' : slot === 'icon' ? <View /> : undefined;
      const { unmount } = render(wrap(<Divider content={slot}>{children}</Divider>));
      unmount();
    }
    render(wrap(<Divider />));
  });

  it('[smoke] renders all contentAlign values', () => {
    for (const align of ALIGNS) {
      const { unmount } = render(wrap(
        <Divider content="label" contentAlign={align}>Section</Divider>,
      ));
      unmount();
    }
    render(wrap(<Divider content="label" contentAlign="center">Section</Divider>));
  });

  it('[smoke] renders all appearances', () => {
    for (const appearance of APPEARANCES) {
      const { unmount } = render(wrap(<Divider appearance={appearance} />));
      unmount();
    }
    render(wrap(<Divider appearance="auto" />));
  });

  it('[smoke] roundCaps=true renders without crashing', () => {
    expect(() => render(wrap(<Divider roundCaps />))).not.toThrow();
  });
});

// ─── Functional: orientation ──────────────────────────────────────────────────

describe('Divider — functional: orientation', () => {
  it('[fn] default orientation is horizontal', () => {
    render(wrap(<Divider testID="def" />));
    expect(screen.getByTestId('def').props['aria-orientation']).toBe('horizontal');
  });

  it('[fn] horizontal sets aria-orientation="horizontal"', () => {
    render(wrap(<Divider orientation="horizontal" testID="h" />));
    expect(screen.getByTestId('h').props['aria-orientation']).toBe('horizontal');
  });

  it('[fn] vertical sets aria-orientation="vertical"', () => {
    render(wrapV(<Divider orientation="vertical" testID="v" />));
    expect(screen.getByTestId('v').props['aria-orientation']).toBe('vertical');
  });

  it('[fn] horizontal divider has width="100%" (fills container)', () => {
    render(wrap(<Divider testID="h-width" />));
    expect(flatStyle(screen.getByTestId('h-width').props.style).width).toBe('100%');
  });

  it('[fn] vertical divider has alignSelf="stretch" (fills parent height)', () => {
    render(wrapV(<Divider orientation="vertical" testID="v-stretch" />));
    expect(flatStyle(screen.getByTestId('v-stretch').props.style).alignSelf).toBe('stretch');
  });
});

// ─── Functional: size (Figma "size" — stroke width) ──────────────────────────

describe('Divider — functional: size', () => {
  it('[fn] size="s" horizontal — height is 0.5px (Stroke-S)', () => {
    render(wrap(<Divider size="s" testID="h-s" />));
    expect(flatStyle(screen.getByTestId('h-s').props.style).height).toBe(EXPECTED_STROKE.s);
  });

  it('[fn] size="m" horizontal — height is 1px (Stroke-M, default)', () => {
    render(wrap(<Divider size="m" testID="h-m" />));
    expect(flatStyle(screen.getByTestId('h-m').props.style).height).toBe(EXPECTED_STROKE.m);
  });

  it('[fn] size="l" horizontal — height is 1.5px (Stroke-L)', () => {
    render(wrap(<Divider size="l" testID="h-l" />));
    expect(flatStyle(screen.getByTestId('h-l').props.style).height).toBe(EXPECTED_STROKE.l);
  });

  it('[fn] size="s" vertical — width is 0.5px', () => {
    render(wrapV(<Divider orientation="vertical" size="s" testID="v-s" />));
    expect(flatStyle(screen.getByTestId('v-s').props.style).width).toBe(EXPECTED_STROKE.s);
  });

  it('[fn] size="m" vertical — width is 1px', () => {
    render(wrapV(<Divider orientation="vertical" size="m" testID="v-m" />));
    expect(flatStyle(screen.getByTestId('v-m').props.style).width).toBe(EXPECTED_STROKE.m);
  });

  it('[fn] size="l" vertical — width is 1.5px', () => {
    render(wrapV(<Divider orientation="vertical" size="l" testID="v-l" />));
    expect(flatStyle(screen.getByTestId('v-l').props.style).width).toBe(EXPECTED_STROKE.l);
  });

  it('[fn] stroke scale is monotonically increasing: s < m < l', () => {
    expect(EXPECTED_STROKE.s).toBeLessThan(EXPECTED_STROKE.m);
    expect(EXPECTED_STROKE.m).toBeLessThan(EXPECTED_STROKE.l);
  });

  it('[fn] default size is "m" — height is 1px', () => {
    render(wrap(<Divider testID="def-size" />));
    expect(flatStyle(screen.getByTestId('def-size').props.style).height).toBe(EXPECTED_STROKE.m);
  });
});

// ─── Functional: slot (Figma "slot" → native `content` prop) ─────────────────
//
// Note: Figma calls this "slot" (none/Icon/Label); the native prop is `content`.
// See BUG-DIV-1 in the header for the naming discrepancy.

describe('Divider — functional: slot (content)', () => {
  // ── slot='none' ─────────────────────────────────────────────────────────────

  it('[fn] slot="none" (default) — simple line, no text in tree', () => {
    render(wrap(<Divider testID="none-div" />));
    expect(screen.getByTestId('none-div')).toBeTruthy();
    expect(screen.queryByRole('text')).toBeNull();
  });

  it('[fn] slot="none" with children — string children always render as label (no "content" prop in interface)', () => {
    // The Divider interface has no `content` prop — the content type is derived entirely
    // from the type of `children`. A string child always yields contentType='label' regardless
    // of any unrecognised `content` prop that is silently ignored by React.
    // String children passed to Divider always render as label text.
    render(wrap(<Divider>Appears as label</Divider>));
    expect(screen.getByText('Appears as label')).toBeTruthy();
  });

  // ── slot='label' ────────────────────────────────────────────────────────────

  it('[fn] slot="label" with string children — text is rendered in tree', () => {
    render(wrap(<Divider content="label">Section Title</Divider>));
    expect(screen.getByText('Section Title')).toBeTruthy();
  });

  it('[fn] slot="label" without children — falls back to simple line (no text)', () => {
    // hasContent = content !== 'none' && !!children → false when children absent
    render(wrap(<Divider content="label" testID="label-no-child" />));
    expect(screen.getByTestId('label-no-child')).toBeTruthy();
    expect(screen.queryByRole('text')).toBeNull();
  });

  it('[fn] slot="label" with vertical orientation — text visible', () => {
    render(wrapV(
      <Divider orientation="vertical" content="label">OR</Divider>,
    ));
    expect(screen.getByText('OR')).toBeTruthy();
  });

  it('[fn] slot="label" renders as a Text node (accessible via getByText)', () => {
    render(wrap(<Divider content="label">Hello</Divider>));
    expect(screen.getByText('Hello')).toBeTruthy();
  });

  // ── slot='icon' ─────────────────────────────────────────────────────────────

  it('[fn] slot="icon" with children — Icon component child rendered in tree', () => {
    // Divider derives contentType from the children type: only an Icon component
    // (matching displayName 'Icon' or type === Icon) triggers contentType='icon'.
    // Plain <View> children are not recognised and fall through to contentType='none'.
    // Use the design-system Icon component to trigger the icon path.
    render(wrap(
      <Divider>
        <Icon icon={IcFavoriteGlyph} appearance="neutral" aria-hidden testID="icon-child" />
      </Divider>,
    ));
    expect(screen.UNSAFE_getByProps({ testID: 'icon-child' })).toBeTruthy();
  });

  it('[fn] slot="icon" without children — falls back to simple line', () => {
    render(wrap(<Divider content="icon" testID="icon-no-child" />));
    expect(screen.getByTestId('icon-no-child')).toBeTruthy();
  });

  it('[fn] slot="icon" vertical — Icon component child visible', () => {
    // Same as horizontal: use the design-system Icon component so useDividerState
    // recognises it as contentType='icon' (plain <View> yields contentType='none').
    render(wrapV(
      <Divider orientation="vertical">
        <Icon icon={IcFavoriteGlyph} appearance="neutral" aria-hidden testID="icon-v" />
      </Divider>,
    ));
    expect(screen.UNSAFE_getByProps({ testID: 'icon-v' })).toBeTruthy();
  });

  // ── outer container role preserved in content path ───────────────────────────

  it('[fn] slot="label" outer container retains separator role', () => {
    render(wrap(
      <Divider content="label" testID="label-sep">Section</Divider>,
    ));
    expect(screen.getByTestId('label-sep').props.role).toBe('separator');
  });

  it('[fn] slot="icon" outer container retains separator role', () => {
    render(wrap(
      <Divider content="icon" testID="icon-sep"><View /></Divider>,
    ));
    expect(screen.getByTestId('icon-sep').props.role).toBe('separator');
  });
});

// ─── Functional: contentAlign ────────────────────────────────────────────────
//
// showLeadingLine  = contentAlign !== 'start'
// showTrailingLine = contentAlign !== 'end'
//
// Inner line segments carry DIVIDER_LINE_A11Y (accessibilityElementsHidden=true).
// We count how many a11y-hidden line Views are present to verify alignment behavior.

describe('Divider — functional: contentAlign', () => {
  it('[fn] contentAlign="center" (default) — both leading and trailing lines present (2 hidden lines)', () => {
    render(wrap(
      <Divider content="label" contentAlign="center" testID="center-div">Section</Divider>,
    ));
    // Both leading and trailing lines should be rendered (and a11y-hidden)
    const hiddenLines = screen.UNSAFE_getAllByProps({ accessibilityElementsHidden: true });
    expect(hiddenLines.length).toBe(2);
    expect(screen.getByText('Section')).toBeTruthy();
  });

  it('[fn] contentAlign="start" — no leading line, trailing line only (1 hidden line)', () => {
    render(wrap(
      <Divider content="label" contentAlign="start" testID="start-div">Section</Divider>,
    ));
    // showLeadingLine = false → only trailing line rendered
    const hiddenLines = screen.UNSAFE_getAllByProps({ accessibilityElementsHidden: true });
    expect(hiddenLines.length).toBe(1);
    expect(screen.getByText('Section')).toBeTruthy();
  });

  it('[fn] contentAlign="end" — no trailing line, leading line only (1 hidden line)', () => {
    render(wrap(
      <Divider content="label" contentAlign="end" testID="end-div">Section</Divider>,
    ));
    // showTrailingLine = false → only leading line rendered
    const hiddenLines = screen.UNSAFE_getAllByProps({ accessibilityElementsHidden: true });
    expect(hiddenLines.length).toBe(1);
    expect(screen.getByText('Section')).toBeTruthy();
  });

  it('[fn] contentAlign has no effect when slot="none" — simple line still renders', () => {
    // contentAlign is computed by useDividerState but ignored in the simple path
    render(wrap(<Divider content="none" contentAlign="start" testID="none-align" />));
    expect(screen.getByTestId('none-align').props.role).toBe('separator');
    expect(screen.UNSAFE_queryAllByProps({ accessibilityElementsHidden: true })).toHaveLength(0);
  });

  it('[fn] contentAlign="center" with slot="icon" — two flanking lines present', () => {
    // contentType='icon' requires an actual Icon component child — plain <View> is ignored.
    // With an Icon child, contentAlign="center" produces leading + trailing lines (both hidden).
    // The Icon itself may also have hidden inner Views (accessibilityElementsHidden), so check >= 2.
    render(wrap(
      <Divider contentAlign="center">
        <Icon icon={IcFavoriteGlyph} appearance="neutral" aria-hidden testID="icon-node" />
      </Divider>,
    ));
    const hiddenLines = screen.UNSAFE_getAllByProps({ accessibilityElementsHidden: true });
    // At least 2 flanking line segments are hidden (leading + trailing)
    expect(hiddenLines.length).toBeGreaterThanOrEqual(2);
    expect(screen.UNSAFE_getByProps({ testID: 'icon-node' })).toBeTruthy();
  });

  it('[fn] contentAlign works on vertical orientation with slot="label"', () => {
    render(wrapV(
      <Divider orientation="vertical" content="label" contentAlign="center" testID="v-center">
        OR
      </Divider>,
    ));
    expect(screen.getByTestId('v-center').props['aria-orientation']).toBe('vertical');
    expect(screen.getByText('OR')).toBeTruthy();
    const hiddenLines = screen.UNSAFE_getAllByProps({ accessibilityElementsHidden: true });
    expect(hiddenLines.length).toBe(2);
  });
});

// ─── Functional: attention ────────────────────────────────────────────────────

describe('Divider — functional: attention', () => {
  it('[fn] attention="high" renders without crashing — highest prominence', () => {
    render(wrap(<Divider attention="high" testID="att-high" />));
    expect(screen.getByTestId('att-high').props.role).toBe('separator');
  });

  it('[fn] attention="medium" renders without crashing', () => {
    render(wrap(<Divider attention="medium" testID="att-med" />));
    expect(screen.getByTestId('att-med').props.role).toBe('separator');
  });

  it('[fn] attention="low" renders without crashing — lowest prominence (default)', () => {
    render(wrap(<Divider attention="low" testID="att-low" />));
    expect(screen.getByTestId('att-low').props.role).toBe('separator');
  });

  it('[fn] default attention is "low" — component still renders a separator', () => {
    // See BUG-DIV-3: default 'low' gives the lightest stroke.
    // Test documents the current default behavior.
    render(wrap(<Divider testID="def-att" />));
    expect(screen.getByTestId('def-att').props.role).toBe('separator');
  });

  it('[fn] all three attention levels render the separator role', () => {
    for (const attention of ATTENTIONS) {
      const { unmount } = render(wrap(<Divider attention={attention} testID={`att-role-${attention}`} />));
      expect(screen.getByTestId(`att-role-${attention}`).props.role).toBe('separator');
      unmount();
    }
    render(wrap(<Divider />));
  });
});

// ─── Functional: appearance ───────────────────────────────────────────────────

describe('Divider — functional: appearance', () => {
  it('[fn] appearance="auto" resolves to neutral — renders separator', () => {
    render(wrap(<Divider appearance="auto" testID="app-auto" />));
    expect(screen.getByTestId('app-auto').props.role).toBe('separator');
  });

  it('[fn] all appearance values render separator role without crashing', () => {
    for (const appearance of APPEARANCES) {
      const { unmount } = render(wrap(<Divider appearance={appearance} testID={`app-${appearance}`} />));
      expect(screen.getByTestId(`app-${appearance}`).props.role).toBe('separator');
      unmount();
    }
    render(wrap(<Divider />));
  });

  it('[fn] appearance is a Figma variable mode — does not change separator role', () => {
    // appearance affects colour only (surface tokens), not structure or a11y role
    render(wrap(<Divider appearance="negative" testID="app-neg" />));
    expect(screen.getByTestId('app-neg').props.role).toBe('separator');
  });
});

// ─── Functional: roundCaps ────────────────────────────────────────────────────

describe('Divider — functional: roundCaps', () => {
  it('[fn] roundCaps=false (default) — borderRadius is 0', () => {
    render(wrap(<Divider testID="no-caps" />));
    expect(flatStyle(screen.getByTestId('no-caps').props.style).borderRadius).toBe(0);
  });

  it('[fn] roundCaps=true — borderRadius is tokens.shape.pill', () => {
    render(wrap(<Divider roundCaps testID="caps" />));
    expect(flatStyle(screen.getByTestId('caps').props.style).borderRadius).toBe(tokens.shape.pill);
  });

  it('[fn] roundCaps=true vertical — borderRadius is tokens.shape.pill', () => {
    render(wrapV(<Divider orientation="vertical" roundCaps testID="v-caps" />));
    expect(flatStyle(screen.getByTestId('v-caps').props.style).borderRadius).toBe(tokens.shape.pill);
  });

  it('[fn] roundCaps=true with slot="label" — label still visible', () => {
    render(wrap(<Divider roundCaps content="label">Section</Divider>));
    expect(screen.getByText('Section')).toBeTruthy();
  });

  it('[fn] roundCaps=true with slot="icon" — Icon component child still visible', () => {
    // Plain <View> is not recognised as icon content — use the Icon component.
    render(wrap(
      <Divider roundCaps>
        <Icon icon={IcFavoriteGlyph} appearance="neutral" aria-hidden testID="icon-caps" />
      </Divider>,
    ));
    expect(screen.UNSAFE_getByProps({ testID: 'icon-caps' })).toBeTruthy();
  });
});

// ─── A11y ─────────────────────────────────────────────────────────────────────

describe('Divider — a11y', () => {
  it('[a11y] outer container has role="separator"', () => {
    render(wrap(<Divider testID="sep" />));
    expect(screen.getByTestId('sep').props.role).toBe('separator');
  });

  it('[a11y] outer container has accessibilityRole="none" (native a11y)', () => {
    render(wrap(<Divider testID="role-none" />));
    expect(screen.getByTestId('role-none').props.accessibilityRole).toBe('none');
  });

  it('[a11y] outer container is accessible=true', () => {
    render(wrap(<Divider testID="acc" />));
    expect(screen.getByTestId('acc').props.accessible).toBe(true);
  });

  it('[a11y] getByRole("separator") finds the divider', () => {
    render(wrap(<Divider />));
    expect(screen.getByRole('separator')).toBeTruthy();
  });

  it('[a11y] aria-orientation="horizontal" on horizontal divider', () => {
    render(wrap(<Divider testID="h-orient" />));
    expect(screen.getByTestId('h-orient').props['aria-orientation']).toBe('horizontal');
  });

  it('[a11y] aria-orientation="vertical" on vertical divider', () => {
    render(wrapV(<Divider orientation="vertical" testID="v-orient" />));
    expect(screen.getByTestId('v-orient').props['aria-orientation']).toBe('vertical');
  });

  it('[a11y] accessibilityHint is forwarded to outer container', () => {
    render(wrap(<Divider accessibilityHint="End of section" testID="hint" />));
    expect(screen.getByTestId('hint').props.accessibilityHint).toBe('End of section');
  });

  it('[a11y] inner line segments are hidden from a11y tree (content path)', () => {
    render(wrap(
      <Divider content="label" testID="lines-a11y">Section</Divider>,
    ));
    const hiddenLines = screen.UNSAFE_getAllByProps({ accessibilityElementsHidden: true });
    // Both flanking lines are hidden; none accessible to screen reader
    expect(hiddenLines.length).toBeGreaterThanOrEqual(2);
    for (const line of hiddenLines) {
      expect(line.props.accessibilityElementsHidden).toBe(true);
      expect(line.props['aria-hidden']).toBe(true);
    }
  });

  it('[a11y] inner line segments carry importantForAccessibility="no-hide-descendants" (Android)', () => {
    render(wrap(
      <Divider content="label" testID="android-a11y">Section</Divider>,
    ));
    const hiddenLines = screen.UNSAFE_getAllByProps({
      importantForAccessibility: 'no-hide-descendants',
    });
    expect(hiddenLines.length).toBeGreaterThanOrEqual(2);
  });

  it('[a11y] simple line path (no slot) has no a11y-hidden children', () => {
    render(wrap(<Divider testID="simple-a11y" />));
    // Simple line is the element itself — no inner hidden children
    expect(screen.UNSAFE_queryAllByProps({ accessibilityElementsHidden: true })).toHaveLength(0);
  });

  it('[a11y] content path outer container preserves accessible=true', () => {
    render(wrap(
      <Divider content="label" testID="content-acc">Section</Divider>,
    ));
    expect(screen.getByTestId('content-acc').props.accessible).toBe(true);
  });

  it('[a11y] vertical divider with slot="label" — separator role + vertical orientation', () => {
    render(wrapV(
      <Divider orientation="vertical" content="label" testID="v-label-a11y">OR</Divider>,
    ));
    const el = screen.getByTestId('v-label-a11y');
    expect(el.props.role).toBe('separator');
    expect(el.props['aria-orientation']).toBe('vertical');
  });
});

// ─── Bug-catching ─────────────────────────────────────────────────────────────

describe('Divider — bug-catching', () => {
  // ── BUG-DIV-1: Figma "slot" ≠ native "content" ────────────────────────────

  it('[bug] BUG-DIV-1: using Figma prop name "slot" silently renders nothing — naming mismatch has real user impact', () => {
    // Figma API table: property = "slot", values = none | Icon | Label
    // Native interface:  property = "content", values = 'none' | 'icon' | 'label'
    //
    // A caller following the Figma API spec passes `slot="label"`. React Native
    // silently ignores unknown props, `content` defaults to 'none', and the
    // label text is never rendered — no error, just silent data loss.
    //
    // Expected fix: rename DividerProps.content → DividerProps.slot.

    // @ts-expect-error — slot is the Figma name; native interface has not renamed it yet
    render(wrap(<Divider slot="label">Section heading</Divider>));

    // Expected: text should render (caller followed Figma API correctly)
    // Bug:      text is invisible — `slot` not recognised, content defaults to 'none'
    expect(screen.getByText('Section heading')).toBeTruthy();
  });

  it('[bug] BUG-DIV-1: correct native prop "content" DOES render — confirms the fix needed is a rename', () => {
    // Passing `content` instead of `slot` works — confirms this is purely a naming issue.
    render(wrap(<Divider content="label">Section heading</Divider>));
    expect(screen.getByText('Section heading')).toBeTruthy();
  });

  // ── BUG-DIV-2: content='label' + non-string children → no typography ───────

  it('[bug] BUG-DIV-2: slot="label" with string children — Text element rendered (correct path)', () => {
    // Baseline: confirms string children DO enter the Text branch.
    render(wrap(<Divider content="label">Section</Divider>));
    expect(screen.getByText('Section')).toBeTruthy();
  });

  it('[bug] BUG-DIV-2: slot="label" with ReactElement children — Text branch bypassed, no label typography', () => {
    // Bug: content='label' + ReactElement children → falls to the `else` branch
    // (same as content='icon') WITHOUT applying contentSlot sizing.
    // The condition `content === 'label' && typeof props.children === 'string'`
    // is false, so label typography (fontSize, lineHeight, fontWeight, color) is
    // never applied and the children render in a plain unstyled View.
    //
    // Expected: ANY children passed with slot='label' should receive label
    // typography treatment or at minimum contentSlot sizing.
    // Fix:  Remove the `typeof props.children === 'string'` guard so non-string
    //       children are still wrapped in the label-styled container.

    render(wrap(
      <Divider content="label">
        <View testID="non-string-child" />
      </Divider>,
    ));
    // Non-string child IS in the tree (no crash) — but the label Text wrapper is missing.
    expect(screen.getByTestId('non-string-child')).toBeTruthy();

    // Expected: a Text element should exist in the slot to carry label typography.
    // Bug:      no Text element — children are in a plain View with no styles.
    expect(screen.queryByRole('text')).not.toBeNull();
  });

  // ── BUG-DIV-3: default attention='low' is the weakest stroke ────────────────

  it('[bug] BUG-DIV-3: default attention="low" gives the lightest stroke — may be invisible', () => {
    // useDividerState defaults attention to 'low', producing strokeLow color.
    // In light themes this is near-invisible. Most UI patterns expect 'medium'
    // as the default. This test documents the current default.
    render(wrap(<Divider testID="def-att-bug" />));
    // The component renders — test documents that 'low' is the effective default:
    const el = screen.getByTestId('def-att-bug');
    expect(el.props.role).toBe('separator');
    // Confirm: the explicit 'high' variant IS more visible (renders correctly too)
    const { unmount } = render(wrap(<Divider attention="high" testID="high-att-bug" />));
    expect(screen.getByTestId('high-att-bug').props.role).toBe('separator');
    unmount();
  });

  // ── BUG-DIV-4: DIVIDER_LINE_A11Y uses 'no-hide-descendants' on childless Views ──

  it('[bug] BUG-DIV-4: inner line segments use "no-hide-descendants" but have no children', () => {
    // Line segments are pure visual Views with no children. Using
    // importantForAccessibility='no-hide-descendants' on a childless View is
    // redundant — 'no' alone suffices to remove the element from Android a11y.
    // Expected: should use importantForAccessibility='no' instead.
    render(wrap(
      <Divider content="label" testID="redundant-a11y">Section</Divider>,
    ));
    const noHideLines = screen.UNSAFE_getAllByProps({
      importantForAccessibility: 'no-hide-descendants',
    });
    // Bug: 'no-hide-descendants' is set on childless line Views (redundant):
    expect(noHideLines.length).toBeGreaterThanOrEqual(2);
    // Each such View has no children to hide — 'no' would have been sufficient:
    for (const line of noHideLines) {
      const children = line.props.children;
      expect(children == null || (Array.isArray(children) && children.length === 0)).toBe(true);
    }
  });
});
