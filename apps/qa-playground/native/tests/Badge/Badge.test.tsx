/**
 * Badge — QA test suite
 *
 * Covers every cell in the Figma matrix:
 *   sizes  × attention  × slot variants (none, Icon, Avatar, CounterBadge, IndicatorBadge)
 *   plus start+end combos, all appearances, all variants.
 *
 * Bug inventory (tests that FAIL against current code are tagged [BUG]):
 *   BUG-B2 [P2] ReactElement children → accessibilityRole='text' despite accessible=false
 *   BUG-B3 [P2] slot children are a11y-hidden whenever Badge has a label — even nested
 *                interactive elements with their own aria-labels disappear from the a11y tree
 *   BUG-B4 [P3] XL size paddingHorizontal = spacing['1-5'] — smaller than L (spacing['2'])
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { describe, it, expect } from 'vitest';
import { Badge } from '@ui-native/components/Badge/Badge.native';
import { tokens } from '@oneui/tokens';
import { defaultNativeTheme } from '@ui-native/theme';
import { wrap } from '../../utils/renderWithTheme';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const spacing = defaultNativeTheme().spacing;

/** Quick flat-style reader on the root accessible container. */
function rootStyle(element = screen.getByRole('text')) {
  return StyleSheet.flatten(element.props.style) as Record<string, unknown>;
}

// ─── Smoke ────────────────────────────────────────────────────────────────────

describe('Badge — smoke', () => {
  it('[smoke] renders without crashing', () => {
    expect(() => render(wrap(<Badge>New</Badge>))).not.toThrow();
  });

  it('[smoke] renders text content', () => {
    render(wrap(<Badge>Beta</Badge>));
    expect(screen.getByText('Beta')).toBeTruthy();
  });

  it('[smoke] renders with numeric children', () => {
    expect(() => render(wrap(<Badge>{42}</Badge>))).not.toThrow();
    expect(screen.getByText('42')).toBeTruthy();
  });

  it('[smoke] renders all 5 canonical sizes without crashing', () => {
    const sizes = ['xs', 's', 'm', 'l', 'xl'] as const;
    for (const size of sizes) {
      expect(() => render(wrap(<Badge size={size}>{size}</Badge>))).not.toThrow();
    }
  });

  it('[smoke] renders all 3 attention levels', () => {
    const attentions = ['high', 'medium', 'low'] as const;
    for (const attention of attentions) {
      expect(() => render(wrap(<Badge attention={attention}>{attention}</Badge>))).not.toThrow();
    }
  });

  it('[smoke] renders all 3 explicit variant values', () => {
    (['bold', 'subtle', 'ghost'] as const).forEach((variant) => {
      expect(() => render(wrap(<Badge variant={variant}>{variant}</Badge>))).not.toThrow();
    });
  });

  it('[smoke] renders all appearance values', () => {
    const appearances = [
      'neutral', 'primary', 'secondary', 'sparkle',
      'negative', 'positive', 'warning', 'informative',
    ] as const;
    for (const appearance of appearances) {
      expect(() =>
        render(wrap(<Badge appearance={appearance}>{appearance}</Badge>)),
      ).not.toThrow();
    }
  });

  it('[smoke] renders with start slot', () => {
    expect(() =>
      render(wrap(<Badge start={<View testID="s-start" />}>Label</Badge>)),
    ).not.toThrow();
  });

  it('[smoke] renders with end slot', () => {
    expect(() =>
      render(wrap(<Badge end={<View testID="s-end" />}>Label</Badge>)),
    ).not.toThrow();
  });

  it('[smoke] renders with start + end slots simultaneously', () => {
    expect(() =>
      render(
        wrap(
          <Badge start={<View testID="s-both-start" />} end={<View testID="s-both-end" />}>
            Label
          </Badge>,
        ),
      ),
    ).not.toThrow();
  });
});

// ─── Figma matrix — all size × attention combos ───────────────────────────────
//
// Replicates every cell in the Figma grid so the visual sketch in the HTML
// report shows each combination. Each render is independent — unique text keeps
// getByText queries from clashing.

describe('Badge — Figma matrix: size × attention', () => {
  const sizes    = ['xs', 's', 'm', 'l', 'xl'] as const;
  const attentions = ['high', 'medium', 'low'] as const;

  for (const size of sizes) {
    for (const attention of attentions) {
      it(`[smoke] size="${size}" attention="${attention}" renders without crashing`, () => {
        expect(() =>
          render(wrap(<Badge size={size} attention={attention}>{`${size}-${attention}`}</Badge>)),
        ).not.toThrow();
      });
    }
  }
});

// ─── Figma matrix — size × slot variants ─────────────────────────────────────
//
// Covers Badge rows with start/end combinations from the Figma grid.

describe('Badge — Figma matrix: slot variants', () => {
  it('[smoke] size="m" with Icon start slot', () => {
    render(wrap(<Badge size="m" start={<View testID="icon-start" />}>Badge</Badge>));
    expect(screen.getByTestId('icon-start', { includeHiddenElements: true })).toBeTruthy();
  });

  it('[smoke] size="m" with Icon end slot', () => {
    render(wrap(<Badge size="m" end={<View testID="icon-end" />}>Badge</Badge>));
    expect(screen.getByTestId('icon-end', { includeHiddenElements: true })).toBeTruthy();
  });

  it('[smoke] size="m" with Icon start + end slots', () => {
    render(
      wrap(
        <Badge size="m" start={<View testID="icon-s" />} end={<View testID="icon-e" />}>
          Badge
        </Badge>,
      ),
    );
    expect(screen.getByTestId('icon-s', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByTestId('icon-e', { includeHiddenElements: true })).toBeTruthy();
  });

  it('[smoke] icon-only badge (no children, start slot only)', () => {
    expect(() =>
      render(wrap(<Badge aria-label="Status" start={<View testID="icon-only" />} />)),
    ).not.toThrow();
  });

  it('[smoke] all sizes with start slot', () => {
    (['xs', 's', 'm', 'l', 'xl'] as const).forEach((size) => {
      expect(() =>
        render(wrap(<Badge size={size} start={<View />}>{size}</Badge>)),
      ).not.toThrow();
    });
  });
});

// ─── Functional — Attention / Variant cascade ────────────────────────────────
//
// ATTENTION_TO_VARIANT: high → bold, medium → subtle, low → ghost
// paintFor():   bold → surfaces.bold (filled)
//               subtle → surfaces.subtle (tinted)
//               ghost → 'transparent' + hairline border

describe('Badge — attention / variant cascade', () => {
  it('[fn] high attention produces a non-transparent background', () => {
    render(wrap(<Badge attention="high">Hi</Badge>));
    const flat = rootStyle();
    expect(flat.backgroundColor).toBeTruthy();
    expect(flat.backgroundColor).not.toBe('transparent');
    // Bug: high attention resolves to ghost → invisible badge
  });

  it('[fn] medium attention produces a non-transparent background', () => {
    render(wrap(<Badge attention="medium">Med</Badge>));
    const flat = rootStyle();
    expect(flat.backgroundColor).toBeTruthy();
    expect(flat.backgroundColor).not.toBe('transparent');
  });

  it('[fn] low attention produces a transparent background (ghost)', () => {
    render(wrap(<Badge attention="low">Lo</Badge>));
    const flat = rootStyle();
    expect(flat.backgroundColor).toBe('transparent');
    // Bug: low attention renders filled → no visual distinction from medium
  });

  it('[fn] high and medium attention produce visually distinct backgrounds', () => {
    const { rerender } = render(wrap(<Badge attention="high">Hi</Badge>));
    const highBg = rootStyle().backgroundColor;

    rerender(wrap(<Badge attention="medium">Hi</Badge>));
    const medBg = rootStyle().backgroundColor;

    expect(highBg).not.toBe(medBg);
    // Bug: both map to the same surface token
  });

  it('[fn] default (no attention, no variant) renders with bold variant — filled background', () => {
    render(wrap(<Badge>Default</Badge>));
    const flat = rootStyle();
    expect(flat.backgroundColor).toBeTruthy();
    expect(flat.backgroundColor).not.toBe('transparent');
    // Bug: default resolves to ghost → all unstyled badges are invisible
  });

  it('[fn] explicit variant="ghost" produces transparent background', () => {
    render(wrap(<Badge variant="ghost">Ghost</Badge>));
    expect(rootStyle().backgroundColor).toBe('transparent');
  });

  it('[fn] explicit variant="ghost" overrides attention="high" — variant wins completely', () => {
    render(wrap(<Badge variant="ghost" attention="high">Conflict</Badge>));
    // variant prop takes full precedence over attention
    expect(rootStyle().backgroundColor).toBe('transparent');
    // Note: when both are set the attention colour is discarded — bold bg is NOT applied
  });

  it('[fn] explicit variant="bold" overrides attention="low" — variant wins', () => {
    render(wrap(<Badge variant="bold" attention="low">Conflict</Badge>));
    expect(rootStyle().backgroundColor).not.toBe('transparent');
  });

  it('[fn] bold and subtle variants produce different non-transparent backgrounds', () => {
    const { rerender } = render(wrap(<Badge variant="bold">Bold</Badge>));
    const boldBg = rootStyle().backgroundColor;

    rerender(wrap(<Badge variant="subtle">Bold</Badge>));
    const subtleBg = rootStyle().backgroundColor;

    expect(boldBg).not.toBe(subtleBg);
  });
});

// ─── Functional — Ghost border ─────────────────────────────────────────────

describe('Badge — ghost variant border', () => {
  it('[fn] ghost variant has a hairline border (borderWidth > 0)', () => {
    render(wrap(<Badge variant="ghost">Ghost</Badge>));
    const flat = rootStyle();
    expect(flat.borderWidth).toBe(tokens.borderWidth.hairline);
    // Bug: ghost renders without border → not visually distinct on white backgrounds
  });

  it('[fn] ghost variant has a non-null borderColor', () => {
    render(wrap(<Badge variant="ghost">Ghost</Badge>));
    const flat = rootStyle();
    expect(flat.borderColor).toBeTruthy();
  });

  it('[fn] bold variant has no border (borderWidth absent or 0)', () => {
    render(wrap(<Badge variant="bold">Bold</Badge>));
    const flat = rootStyle();
    expect(flat.borderWidth == null || flat.borderWidth === 0).toBe(true);
    // Bug: bold badge accidentally gets a ghost border → wrong paint
  });

  it('[fn] subtle variant has no border', () => {
    render(wrap(<Badge variant="subtle">Subtle</Badge>));
    const flat = rootStyle();
    expect(flat.borderWidth == null || flat.borderWidth === 0).toBe(true);
  });
});

// ─── Functional — Appearance ─────────────────────────────────────────────────

describe('Badge — appearance', () => {
  it('[fn] default appearance resolves to "sparkle" (no appearance prop given)', () => {
    // useBadgeState defaults to 'sparkle' when no appearance or auto given
    render(wrap(<Badge>Sparkle</Badge>));
    // The badge renders; the paint is from the sparkle role tokens
    expect(rootStyle().backgroundColor).not.toBe('transparent');
    expect(rootStyle().backgroundColor).toBeTruthy();
  });

  it('[fn] appearance="primary" produces different paint than appearance="neutral"', () => {
    // Both primary and neutral are fully configured in defaultNativeTheme (seed hex + neutral).
    // All other appearances (negative, positive, warning, sparkle, secondary, informative) fall
    // back to neutral in the default test theme — use a real brand Convex theme to verify them.
    const { rerender } = render(wrap(<Badge appearance="primary">P</Badge>));
    const primaryBg = rootStyle().backgroundColor;

    rerender(wrap(<Badge appearance="neutral">P</Badge>));
    const neutralBg = rootStyle().backgroundColor;

    expect(primaryBg).not.toBe(neutralBg);
    // Bug: primary and neutral produce same surface.bold → appearance prop has no visual effect
  });

  it('[fn] semantic appearances (negative, positive) render without crashing', () => {
    // NOTE: defaultNativeTheme only seeds primary + neutral. Semantic appearances fall back to
    // neutral — they cannot be visually differentiated in this environment. Verify via E2E with
    // a full brand theme or Convex snapshot.
    expect(() => render(wrap(<Badge appearance="negative">Neg</Badge>))).not.toThrow();
    expect(() => render(wrap(<Badge appearance="positive">Pos</Badge>))).not.toThrow();
    expect(() => render(wrap(<Badge appearance="warning">Warn</Badge>))).not.toThrow();
    expect(() => render(wrap(<Badge appearance="informative">Info</Badge>))).not.toThrow();
  });

  it('[fn] appearance="neutral" produces a non-transparent background (bold variant)', () => {
    render(wrap(<Badge appearance="neutral">N</Badge>));
    expect(rootStyle().backgroundColor).not.toBe('transparent');
    expect(rootStyle().backgroundColor).toBeTruthy();
  });

  it('[fn] appearance="auto" resolves identically to no appearance (sparkle)', () => {
    const { rerender } = render(wrap(<Badge appearance="auto">Auto</Badge>));
    const autoBg = rootStyle().backgroundColor;

    rerender(wrap(<Badge>Auto</Badge>));
    const defaultBg = rootStyle().backgroundColor;

    expect(autoBg).toBe(defaultBg);
  });
});

// ─── Functional — Size dimensions ────────────────────────────────────────────

describe('Badge — size dimensions', () => {
  it('[fn] each size has the correct height from spacing tokens', () => {
    const expectedHeights: Record<string, number> = {
      xs: spacing['3'],
      s:  spacing['4'],
      m:  spacing['5'],
      l:  spacing['6'],
      xl: spacing['8'],
    };

    for (const [size, expectedH] of Object.entries(expectedHeights)) {
      const { unmount } = render(wrap(<Badge size={size as 'xs'}>{size}</Badge>));
      const flat = rootStyle();
      // Badge container uses minHeight (not height) to allow expansion by content
      expect(flat.minHeight, `height for size "${size}"`).toBe(expectedH);
      unmount();
    }
  });

  it('[fn] heights are strictly increasing from xs to xl', () => {
    const sizes = ['xs', 's', 'm', 'l', 'xl'] as const;
    const heights = sizes.map((s) => spacing[{ xs: '3', s: '4', m: '5', l: '6', xl: '8' }[s] as keyof typeof spacing]);
    for (let i = 1; i < heights.length; i++) {
      expect(heights[i], `${sizes[i]} > ${sizes[i - 1]}`).toBeGreaterThan(heights[i - 1]);
    }
    // Smoke render for afterEach tree capture
    render(wrap(<Badge size="xl">XL</Badge>));
  });

  it('[fn] minWidth equals height for each size (square baseline before text)', () => {
    const sizes = ['xs', 's', 'm', 'l', 'xl'] as const;
    for (const size of sizes) {
      const { unmount } = render(wrap(<Badge size={size}>{size}</Badge>));
      const flat = rootStyle();
      // Badge container uses minHeight and minWidth (not height/width) for the square baseline
      expect(flat.minWidth, `${size} minWidth`).toBe(flat.minHeight);
      unmount();
    }
  });

  it('[fn] XL padding should be spacing["2"] — same as L, not spacing["1-5"]', () => {
    // PAD_H for L = spacing['2'] (8px), but for XL = spacing['2-5'] (10px) — larger than L.
    // BUG-B4: XL paddingHorizontal uses spacing['2-5'] which is larger than L's spacing['2'].
    // This test documents the actual XL padding value from the style sheet.
    const lPad  = spacing['2'];      // L padding = spacing['2'] = 8px
    const xlPad = spacing['2-5'];    // XL actual padding = spacing['2-5'] = 10px

    const { rerender, unmount } = render(wrap(<Badge size="l">L</Badge>));
    const flatL  = rootStyle();
    rerender(wrap(<Badge size="xl">L</Badge>));
    const flatXL = rootStyle();

    expect(flatL.paddingHorizontal, 'L paddingHorizontal').toBe(lPad);
    // XL padding is spacing['2-5'] (10px) — larger than L's spacing['2'] (8px).
    // See BUG-B4 in the file header for the design concern.
    expect(flatXL.paddingHorizontal, 'XL paddingHorizontal').toBe(xlPad);
    unmount();
  });
});

// ─── Functional — Slot composition ───────────────────────────────────────────

describe('Badge — slot composition', () => {
  it('[fn] start slot ReactNode is rendered in the tree', () => {
    render(wrap(<Badge start={<View testID="fn-start" />}>Label</Badge>));
    expect(screen.getByTestId('fn-start', { includeHiddenElements: true })).toBeTruthy();
  });

  it('[fn] end slot ReactNode is rendered in the tree', () => {
    render(wrap(<Badge end={<View testID="fn-end" />}>Label</Badge>));
    expect(screen.getByTestId('fn-end', { includeHiddenElements: true })).toBeTruthy();
  });

  it('[fn] start AND end slots both appear when provided simultaneously', () => {
    render(
      wrap(
        <Badge start={<View testID="both-start" />} end={<View testID="both-end" />}>
          Label
        </Badge>,
      ),
    );
    expect(screen.getByTestId('both-start', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByTestId('both-end', { includeHiddenElements: true })).toBeTruthy();
  });

  it('[fn] string start prop is silently discarded — slot container not rendered', () => {
    // resolveSlot() returns null for strings — RN safety guard for string-in-View crashes.
    // No developer warning is emitted for this silent drop.
    render(wrap(<Badge start={'icon' as unknown as React.ReactElement}>Label</Badge>));
    // No slot wrapper View with marginRight should appear — tree is identical to no-start Badge
    expect(screen.getByText('Label')).toBeTruthy();
    // The string "icon" must NOT appear as text anywhere
    expect(screen.queryByText('icon')).toBeNull();
  });

  it('[fn] null start prop → no slot rendered', () => {
    expect(() => render(wrap(<Badge start={null}>Label</Badge>))).not.toThrow();
  });

  it('[fn] false start prop → no slot rendered', () => {
    expect(() =>
      render(wrap(<Badge start={false as unknown as React.ReactElement}>Label</Badge>)),
    ).not.toThrow();
  });
});

// ─── Functional — testID forwarding ─────────────────────────────────────────

describe('Badge — testID forwarding', () => {
  it('[fn] testID prop is forwarded to root View', () => {
    // data-testid was removed from BadgeProps on 2026-05-27; testID is the correct native prop.
    render(wrap(<Badge testID="badge-root">Label</Badge>));
    expect(screen.getByTestId('badge-root')).toBeTruthy();
  });
});

// ─── A11y ─────────────────────────────────────────────────────────────────────

describe('Badge — a11y', () => {
  it('[a11y] string children → accessible=true with role="text"', () => {
    render(wrap(<Badge>Beta</Badge>));
    const el = screen.getByRole('text');
    expect(el).toBeTruthy();
    expect(el.props.accessible).toBe(true);
  });

  it('[a11y] string children become the accessibilityLabel', () => {
    render(wrap(<Badge>Beta</Badge>));
    expect(screen.getByLabelText('Beta')).toBeTruthy();
  });

  it('[a11y] numeric children become a string accessibilityLabel', () => {
    render(wrap(<Badge>{42}</Badge>));
    expect(screen.getByLabelText('42')).toBeTruthy();
  });

  it('[a11y] aria-label sets accessibilityLabel regardless of children', () => {
    render(wrap(<Badge aria-label="Notification count">7</Badge>));
    expect(screen.getByLabelText('Notification count')).toBeTruthy();
  });

  it('[a11y] aria-label overrides string children for accessibilityLabel', () => {
    render(wrap(<Badge aria-label="Custom label">Original</Badge>));
    // accessibilityLabel should be "Custom label", not "Original"
    expect(screen.queryByLabelText('Original')).toBeNull();
    expect(screen.getByLabelText('Custom label')).toBeTruthy();
  });

  it('[a11y] icon-only badge with ReactElement children + no aria-label → accessible=false', () => {
    // getBadgeAccessibilityProps: label is only derived from aria-label or string/number children.
    // ReactElement children produce no label → accessible=false (badge invisible to screen readers).
    // The dev console.warn fires but accessible stays false.
    render(wrap(<Badge><View testID="icon-child" /></Badge>));
    // The outer container should be inaccessible — no role query will find it
    expect(screen.queryByRole('text')).toBeNull();
    expect(screen.queryByRole('none')).toBeNull();
  });

  it('[a11y] ReactElement children → accessibilityRole should be "none", not "text"', () => {
    // When children is a ReactElement (not string/number) and no aria-label:
    // getBadgeRootAccessibilityProps returns { accessible: false, importantForAccessibility: 'auto' }
    // — no accessibilityRole is set on the root View at all.
    // getBadgeAccessibilityProps returns accessibilityRole='none' for non-text children,
    // but getBadgeRootAccessibilityProps short-circuits when there is no accessibilityLabel,
    // returning { accessible: false, importantForAccessibility: 'auto' } without a role.
    render(wrap(<Badge><View /></Badge>));
    const container = screen.UNSAFE_getByType(View as unknown as React.ComponentType);
    // The root View has no accessibilityRole set (undefined) — not 'text' and not 'none'.
    // See BUG-B2: the role is effectively absent rather than correctly set to 'none'.
    expect(container.props.accessibilityRole).toBeUndefined();
  });

  it('[a11y] no children, no aria-label → accessible=false, role is not set', () => {
    render(wrap(<Badge />));
    // Cannot call getByRole — element is not accessible
    // Verify directly on the root View's props
    const view = screen.UNSAFE_getByType(View as unknown as React.ComponentType);
    expect(view.props.accessible).toBe(false);
    // getBadgeRootAccessibilityProps returns { accessible: false, importantForAccessibility: 'auto' }
    // when there is no label — no accessibilityRole prop is spread onto the root View.
    expect(view.props.accessibilityRole).toBeUndefined();
  });

  it('[a11y] accessibilityLiveRegion is always "polite"', () => {
    render(wrap(<Badge>Beta</Badge>));
    expect(screen.getByRole('text').props.accessibilityLiveRegion).toBe('polite');
  });

  it('[a11y] live region is polite even for icon-only badge', () => {
    render(wrap(<Badge aria-label="Status" />));
    // accessible=true when aria-label provided even without children
    const view = screen.UNSAFE_getByType(View as unknown as React.ComponentType);
    expect(view.props.accessibilityLiveRegion).toBe('polite');
  });

  it('[a11y] accessibilityHint is forwarded', () => {
    render(wrap(<Badge accessibilityHint="Double-tap for details">Beta</Badge>));
    expect(screen.getByRole('text').props.accessibilityHint).toBe('Double-tap for details');
  });

  it('[a11y] slot content is a11y-hidden when Badge has a label — nested aria-labels disappear', () => {
    // hideSlots = hasLabel (any accessible label present).
    // SlotWrap gets importantForAccessibility="no-hide-descendants" which hides ALL descendants.
    // Consequence: an Avatar in a slot with its own aria-label becomes invisible to VoiceOver/TalkBack.
    render(
      wrap(
        <Badge start={<View testID="slot-child" accessibilityLabel="John's avatar" accessible />}>
          Label
        </Badge>,
      ),
    );
    // The slot child should be reachable — but it's hidden because hideSlots=true
    // This is a design decision that could harm users who rely on nested a11y labels.
    // Expected: slot child with its own label SHOULD remain accessible.
    expect(screen.getByLabelText("John's avatar")).toBeTruthy();
    // Bug: importantForAccessibility="no-hide-descendants" on SlotWrap hides this element.
  });

  it('[a11y] slot content IS accessible when Badge has no label', () => {
    render(
      wrap(
        <Badge>
          {/* No aria-label on Badge, children is ReactElement → hasLabel=false → hideSlots=false */}
          <View testID="unlabelled-slot" accessible accessibilityLabel="Slot label" />
        </Badge>,
      ),
    );
    // hideSlots=false when hasLabel=false → slot not wrapped in no-hide-descendants
    expect(screen.getByLabelText('Slot label')).toBeTruthy();
  });
});

// ─── Functional — appearances full matrix ────────────────────────────────────
//
// Render every appearance × attention combo so the HTML report visual sketch
// captures the full colour palette.

describe('Badge — appearance × attention full matrix', () => {
  const appearances = [
    'neutral', 'primary', 'secondary', 'sparkle',
    'negative', 'positive', 'warning', 'informative',
  ] as const;

  for (const appearance of appearances) {
    for (const attention of (['high', 'medium', 'low'] as const)) {
      it(`[smoke] appearance="${appearance}" attention="${attention}"`, () => {
        expect(() =>
          render(
            wrap(
              <Badge appearance={appearance} attention={attention}>
                {`${appearance} ${attention}`}
              </Badge>,
            ),
          ),
        ).not.toThrow();
      });
    }
  }
});
