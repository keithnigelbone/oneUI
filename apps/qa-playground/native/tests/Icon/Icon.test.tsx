/**
 * Icon QA tests — smoke, functional, and a11y for the native design-system Icon.
 *
 * Tests cover `packages/ui-native/src/components/Icon/Icon.native.tsx`
 * (the design-system shell that resolves `appearance`×`emphasis`→color and
 * `size`→pixels), NOT the lower-level IconResolver directly.
 *
 * ─── Two-layer architecture ───────────────────────────────────────────────────
 *
 *   Design-system Icon (Icon.native.tsx)   ← tested here
 *     Accepts: appearance, emphasis, size (DesignIconSize | number)
 *     Resolves: color from useSurfaceTokens; pixels from designIconSizePx or
 *               ComponentSlotIconContext
 *     Three icon-prop paths → delegates to IconResolver.native.tsx
 *
 *   IconResolver (IconResolver.native.tsx)
 *     function/name path → IconShell → View a11y shell + glyph View
 *     name path          → LazyIcon  → async load → IconShell (or placeholder)
 *
 * ─── Three `icon` prop paths ──────────────────────────────────────────────────
 *
 *   1. icon={Component}     — IconComponent function (JDS / custom SVG).
 *      Delegates to IconResolver which renders IconShell directly.
 *      testID creates a dimension-only wrapper; a11y props live on IconShell.
 *
 *   2. icon={<Element />}   — Pre-built ReactElement (JSX).
 *      Design Icon renders it DIRECTLY inside its own View, which carries all
 *      a11y props. testID is on that same accessible container.
 *
 *   3. icon="semantic-name" — SemanticIconName string.
 *      Delegates to IconResolver → LazyIcon (async). In tests (no Jio loader
 *      registered) the LazyIcon renders a placeholder View immediately.
 *
 * ─── Known dev-file bugs (raise separately) ───────────────────────────────────
 *
 *   BUG-ICON-1 · testID points to different element types across icon paths
 *     Function path:      testID View is a dimension-only wrapper — a11y props
 *                         (accessible, accessibilityRole, accessibilityLabel) live
 *                         on the inner IconShell View.
 *     ReactElement path:  testID View IS the a11y container — all three a11y
 *                         props are on the same element as testID.
 *     Consequence:  getByTestId('icon').props.accessibilityRole returns 'image'
 *                   for ReactElement icons but undefined for function icons.
 *                   Consumer code that relies on testID for a11y assertions is
 *                   broken for the most common icon usage pattern.
 *     File: packages/ui-native/src/components/Icon/Icon.native.tsx
 *     Fix:  Unify both paths — either wrap the IconShell testID output to include
 *           a11y props, or extract a11y logic to the outer wrapper in all paths.
 *
 *   BUG-ICON-2 · ReactElement path — aria-hidden={true} does not clear
 *                accessible or accessibilityLabel
 *     When aria-hidden={true} AND aria-label="X" are both provided:
 *       ReactElement path: accessible={true}, accessibilityLabel="X",
 *                          accessibilityElementsHidden={true}  ← contradictory
 *       Function path:     accessible={false}, accessibilityLabel={undefined},
 *                          accessibilityElementsHidden={true}  ← correct
 *     Root cause: Icon.native.tsx line
 *       accessible={Boolean(ariaLabel)}       — ignores ariaHidden
 *       accessibilityLabel={ariaLabel}        — ignores ariaHidden
 *     These should mirror getIconShellAccessibilityProps which correctly gates
 *     both on `!isHidden`.
 *     File: packages/ui-native/src/components/Icon/Icon.native.tsx
 */

import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { render, screen } from '@testing-library/react-native';
import { describe, it, expect } from 'vitest';
import type { IconComponent } from '@oneui/shared';
import { Icon } from '@ui-native/components/Icon/Icon.native';
import { IcFavoriteGlyph, IcAddGlyph } from '@ui-native/components/Button/buttonShowcaseJdsGlyphs';
import { wrap } from '../../utils/renderWithTheme';

// ─── Glyph helpers ────────────────────────────────────────────────────────────
//
// FunctionGlyph — an IconComponent (function); takes the function path inside Icon.
// ElementGlyph  — a pre-built ReactElement; takes the ReactElement path inside Icon.
//
// Both use IcFavoriteGlyph (heart SVG) which is already used across the test suite.
// The distinction between the two is the form in which they are passed as `icon`.

const FunctionGlyph: IconComponent = IcFavoriteGlyph;

// Pre-built ReactElement — passes isValidElement(icon) = true
const ElementGlyph = <IcFavoriteGlyph size={24} color="currentColor" />;

// A second function glyph for distinct-icon tests
const AltGlyph: IconComponent = IcAddGlyph;

// ─── Figma matrix: icon type × renders without crashing ──────────────────────
//
// Verifies each of the three `icon` prop paths the design-system Icon routes
// through: function component, pre-built ReactElement, semantic string name.
//
// The semantic-name path renders a placeholder View in tests because no Jio
// loader is registered in the Vitest environment.

describe('Icon — Figma matrix: icon type', () => {
  it('[smoke] icon={fn}: function component renders without crashing', () => {
    expect(() =>
      render(wrap(<Icon icon={FunctionGlyph} appearance="neutral" aria-label="Heart" />)),
    ).not.toThrow();
  });

  it('[smoke] icon={<El />}: ReactElement renders without crashing', () => {
    expect(() =>
      render(wrap(<Icon icon={ElementGlyph} appearance="neutral" aria-label="Heart" />)),
    ).not.toThrow();
  });

  it('[smoke] icon="name": semantic string renders without crashing (placeholder in tests)', () => {
    // No Jio loader registered — LazyIcon renders a placeholder View.
    expect(() =>
      render(wrap(<Icon icon="heart" appearance="neutral" aria-label="Heart" />)),
    ).not.toThrow();
  });

  it('[fn] icon={fn}: labeled icon found by accessibilityLabel', () => {
    render(wrap(<Icon icon={FunctionGlyph} appearance="neutral" aria-label="Heart" />));
    expect(screen.getByLabelText('Heart')).toBeTruthy();
  });

  it('[fn] icon={<El />}: labeled icon found by accessibilityLabel', () => {
    render(wrap(<Icon icon={ElementGlyph} appearance="neutral" aria-label="Heart" />));
    expect(screen.getByLabelText('Heart')).toBeTruthy();
  });

  it('[fn] icon={fn}: without testID, icon renders directly (no extra wrapper)', () => {
    render(wrap(<Icon icon={FunctionGlyph} appearance="neutral" aria-label="Heart" />));
    // No testID was given — no wrapper View was added; accessible element is IconShell
    expect(screen.getByLabelText('Heart')).toBeTruthy();
  });

  it('[fn] icon={fn}: testID adds an outer dimension wrapper', () => {
    render(wrap(
      <Icon icon={FunctionGlyph} appearance="neutral" aria-label="Heart" testID="icon-fn" />,
    ));
    expect(screen.getByTestId('icon-fn')).toBeTruthy();
  });

  it('[fn] icon={<El />}: testID is on the accessible container', () => {
    render(wrap(
      <Icon icon={ElementGlyph} appearance="neutral" aria-label="Heart" testID="icon-el" />,
    ));
    expect(screen.getByTestId('icon-el')).toBeTruthy();
  });
});

// ─── Figma matrix: appearances ────────────────────────────────────────────────
//
// Design-system Icon resolves color from appearance × surrounding surface.
// Tests here verify that each role renders without crashing — the resolved
// color is an internal token value, not asserted directly.

const APPEARANCES = [
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'warning',
  'informative',
] as const;

describe('Icon — Figma matrix: appearance', () => {
  for (const appearance of APPEARANCES) {
    it(`[smoke] appearance="${appearance}" renders without crashing`, () => {
      expect(() =>
        render(wrap(
          <Icon icon={FunctionGlyph} appearance={appearance} aria-label={`${appearance} icon`} />,
        )),
      ).not.toThrow();
    });
  }

  it('[smoke] no appearance prop uses neutral fallback without crashing', () => {
    expect(() =>
      render(wrap(<Icon icon={FunctionGlyph} aria-label="Default" />)),
    ).not.toThrow();
  });
});

// ─── Figma matrix: emphasis ───────────────────────────────────────────────────
//
// Emphasis selects the colour prominence token within the resolved appearance role:
//   high / medium / low / tinted / tintedA11y

const EMPHASIS_LEVELS = ['high', 'medium', 'low', 'tinted', 'tintedA11y'] as const;

describe('Icon — Figma matrix: emphasis', () => {
  for (const emphasis of EMPHASIS_LEVELS) {
    it(`[smoke] emphasis="${emphasis}" renders without crashing`, () => {
      expect(() =>
        render(wrap(
          <Icon
            icon={FunctionGlyph}
            appearance="primary"
            emphasis={emphasis}
            aria-label={`${emphasis} icon`}
          />,
        )),
      ).not.toThrow();
    });
  }

  it('[smoke] no emphasis prop uses high (default) without crashing', () => {
    expect(() =>
      render(wrap(<Icon icon={FunctionGlyph} appearance="neutral" aria-label="High" />)),
    ).not.toThrow();
  });
});

// ─── Figma matrix: sizes ──────────────────────────────────────────────────────
//
// Size selects the spacing-index token; default is '5'.
// Asserts that a non-zero dimension is applied to the outer wrapper View.
//
// All 20 DesignIconSize values exist; a representative subset is tested.
// Raw `number` is an escape-hatch for component-internal pixel calculations.

const REPRESENTATIVE_SIZES = ['2', '3.5', '5', '8', '12', '20'] as const;

describe('Icon — Figma matrix: size', () => {
  for (const size of REPRESENTATIVE_SIZES) {
    it(`[smoke] size="${size}" renders without crashing`, () => {
      expect(() =>
        render(wrap(
          <Icon icon={FunctionGlyph} size={size} appearance="neutral" aria-label="Icon" />,
        )),
      ).not.toThrow();
    });

    it(`[fn] size="${size}" — testID wrapper has non-zero width and height`, () => {
      render(wrap(
        <Icon
          icon={FunctionGlyph}
          size={size}
          appearance="neutral"
          aria-label="Icon"
          testID="sized-icon"
        />,
      ));
      const wrapper = screen.getByTestId('sized-icon');
      const style = Array.isArray(wrapper.props.style)
        ? wrapper.props.style[0]
        : wrapper.props.style;
      expect(typeof style.width).toBe('number');
      expect(style.width).toBeGreaterThan(0);
      expect(style.height).toBe(style.width);
    });
  }

  it('[smoke] size as raw number renders without crashing', () => {
    expect(() =>
      render(wrap(
        <Icon icon={FunctionGlyph} size={32} appearance="neutral" aria-label="Icon" />,
      )),
    ).not.toThrow();
  });

  it('[fn] size as raw number — wrapper dimension equals that pixel value', () => {
    render(wrap(
      <Icon icon={FunctionGlyph} size={48} appearance="neutral" aria-label="Icon" testID="px-icon" />,
    ));
    const wrapper = screen.getByTestId('px-icon');
    const style = Array.isArray(wrapper.props.style)
      ? wrapper.props.style[0]
      : wrapper.props.style;
    expect(style.width).toBe(48);
    expect(style.height).toBe(48);
  });

  it('[smoke] no size prop uses default size "5" without crashing', () => {
    expect(() =>
      render(wrap(<Icon icon={FunctionGlyph} appearance="neutral" aria-label="Icon" />)),
    ).not.toThrow();
  });

  it('[fn] no size prop — icon still renders a positive dimension', () => {
    render(wrap(
      <Icon icon={FunctionGlyph} appearance="neutral" aria-label="Icon" testID="default-size-icon" />,
    ));
    const wrapper = screen.getByTestId('default-size-icon');
    const style = Array.isArray(wrapper.props.style)
      ? wrapper.props.style[0]
      : wrapper.props.style;
    expect(style.width).toBeGreaterThan(0);
  });
});

// ─── Smoke ────────────────────────────────────────────────────────────────────

describe('Icon — smoke', () => {
  it('[smoke] renders without crashing with minimal props (function icon)', () => {
    expect(() => render(wrap(<Icon icon={FunctionGlyph} />))).not.toThrow();
  });

  it('[smoke] renders without crashing with minimal props (ReactElement)', () => {
    expect(() => render(wrap(<Icon icon={ElementGlyph} />))).not.toThrow();
  });

  it('[smoke] renders without crashing with minimal props (semantic name)', () => {
    expect(() => render(wrap(<Icon icon="heart" />))).not.toThrow();
  });

  it('[smoke] aria-label prop accepted without crash', () => {
    expect(() =>
      render(wrap(<Icon icon={FunctionGlyph} aria-label="Heart" />)),
    ).not.toThrow();
  });

  it('[smoke] aria-hidden prop accepted without crash', () => {
    expect(() =>
      render(wrap(<Icon icon={FunctionGlyph} aria-hidden />)),
    ).not.toThrow();
  });

  it('[smoke] aria-hidden={false} accepted without crash', () => {
    expect(() =>
      render(wrap(<Icon icon={FunctionGlyph} aria-hidden={false} />)),
    ).not.toThrow();
  });

  it('[smoke] testID prop accepted without crash', () => {
    expect(() =>
      render(wrap(<Icon icon={FunctionGlyph} testID="icon" />)),
    ).not.toThrow();
  });

  it('[smoke] style prop accepted without crash', () => {
    expect(() =>
      render(wrap(<Icon icon={FunctionGlyph} style={{ opacity: 0.5 }} />)),
    ).not.toThrow();
  });

  it('[smoke] all appearances render without crashing (function icon)', () => {
    for (const appearance of APPEARANCES) {
      expect(() =>
        render(wrap(<Icon icon={FunctionGlyph} appearance={appearance} />)),
      ).not.toThrow();
    }
  });

  it('[smoke] all emphasis levels render without crashing', () => {
    for (const emphasis of EMPHASIS_LEVELS) {
      expect(() =>
        render(wrap(<Icon icon={FunctionGlyph} appearance="neutral" emphasis={emphasis} />)),
      ).not.toThrow();
    }
  });

  it('[smoke] renders two different function glyphs without crashing', () => {
    expect(() => render(wrap(<Icon icon={FunctionGlyph} appearance="neutral" />))).not.toThrow();
    expect(() => render(wrap(<Icon icon={AltGlyph} appearance="primary" />))).not.toThrow();
  });
});

// ─── Functional ───────────────────────────────────────────────────────────────

describe('Icon — functional', () => {
  // ── testID wrapper behaviour ─────────────────────────────────────────────

  it('[fn] testID is present on the outer View for function icon', () => {
    render(wrap(<Icon icon={FunctionGlyph} aria-label="Fav" testID="fn-icon" />));
    expect(screen.getByTestId('fn-icon')).toBeTruthy();
  });

  it('[fn] testID is present on the outer View for ReactElement icon', () => {
    render(wrap(<Icon icon={ElementGlyph} aria-label="Fav" testID="el-icon" />));
    expect(screen.getByTestId('el-icon')).toBeTruthy();
  });

  it('[fn] testID is present on the outer View for semantic name icon', () => {
    render(wrap(<Icon icon="heart" aria-label="Heart" testID="name-icon" />));
    expect(screen.getByTestId('name-icon')).toBeTruthy();
  });

  // ── Size dimensions ───────────────────────────────────────────────────────

  it('[fn] size="8" ReactElement path — testID View has matching width and height', () => {
    render(wrap(
      <Icon icon={ElementGlyph} size="8" aria-label="Icon" testID="re-size-8" />,
    ));
    const wrapper = screen.getByTestId('re-size-8');
    // For ReactElement path: style is an array, first entry has dimensions
    const style = Array.isArray(wrapper.props.style)
      ? wrapper.props.style[0]
      : wrapper.props.style;
    expect(typeof style.width).toBe('number');
    expect(style.width).toBeGreaterThan(0);
    expect(style.height).toBe(style.width);
  });

  it('[fn] size="5" and size="8" produce different pixel values', () => {
    // Render both in a single call — screen only tracks the last render, so two
    // separate render() calls would make the first testID invisible to screen.
    // No aria-label → accessibilityElementsHidden=true on the outer View.
    // Use includeHiddenElements:true so getByTestId reaches the hidden dimension wrapper.
    render(wrap(
      <>
        <Icon icon={FunctionGlyph} size="5" testID="s5" />
        <Icon icon={FunctionGlyph} size="8" testID="s8" />
      </>,
    ));
    const s5style = screen.getByTestId('s5', { includeHiddenElements: true }).props.style;
    const s8style = screen.getByTestId('s8', { includeHiddenElements: true }).props.style;
    const s5 = Array.isArray(s5style) ? s5style[0] : s5style;
    const s8 = Array.isArray(s8style) ? s8style[0] : s8style;
    expect(s5.width).toBeLessThan(s8.width);
  });

  // ── style forwarding ──────────────────────────────────────────────────────

  it('[fn] style prop is forwarded — function path testID wrapper has additional style', () => {
    render(wrap(
      <Icon icon={FunctionGlyph} style={{ opacity: 0.5 }} testID="styled-fn" />,
    ));
    // No aria-label → accessibilityElementsHidden=true on the outer View.
    // getByTestId without includeHiddenElements filters this out — use the option to reach it.
    // For function path, the style is merged into the outer View's style array (width, height, userStyle).
    expect(screen.getByTestId('styled-fn', { includeHiddenElements: true })).toBeTruthy();
  });

  it('[fn] style prop is forwarded — ReactElement path testID wrapper includes user style', () => {
    // Provide aria-label so accessibilityElementsHidden=false — getByTestId can find the node.
    // Without a label the outer View gets accessibilityElementsHidden=true which RNTL v12
    // getByTestId filters out.
    render(wrap(
      <Icon icon={ElementGlyph} aria-label="Styled" style={{ borderRadius: 4 }} testID="styled-el" />,
    ));
    const wrapper = screen.getByTestId('styled-el');
    // ReactElement path: style={[{ width, height }, userStyle]}
    const styles = wrapper.props.style;
    expect(Array.isArray(styles)).toBe(true);
    // Second element should be the user-provided style
    expect(styles[1]).toEqual(expect.objectContaining({ borderRadius: 4 }));
  });
});

// ─── A11y ─────────────────────────────────────────────────────────────────────

describe('Icon — a11y', () => {
  // ── Function icon path ────────────────────────────────────────────────────

  it('[a11y] fn path — aria-label → accessible=true, accessibilityRole="image"', () => {
    render(wrap(<Icon icon={FunctionGlyph} aria-label="Favourite" />));
    const shell = screen.getByLabelText('Favourite');
    expect(shell.props.accessible).toBe(true);
    expect(shell.props.accessibilityRole).toBe('image');
  });

  it('[a11y] fn path — aria-label → getByLabelText finds the icon shell', () => {
    render(wrap(<Icon icon={FunctionGlyph} aria-label="Add" />));
    expect(screen.getByLabelText('Add')).toBeTruthy();
  });

  it('[a11y] fn path — no aria-label → accessible=false (decorative)', () => {
    render(wrap(<Icon icon={FunctionGlyph} testID="deco-fn" />));
    // Without a label the icon is decorative — iconShell has accessible=false
    // We must query UNSAFE because getByTestId finds the dimension wrapper, not the shell
    const shell = screen.UNSAFE_getByProps({ accessibilityRole: 'image' });
    expect(shell.props.accessible).toBe(false);
  });

  it('[a11y] fn path — no label → accessibilityElementsHidden=true', () => {
    render(wrap(<Icon icon={FunctionGlyph} testID="deco-fn-hidden" />));
    const shell = screen.UNSAFE_getByProps({ accessibilityRole: 'image' });
    expect(shell.props.accessibilityElementsHidden).toBe(true);
  });

  it('[a11y] fn path — aria-hidden={true} → accessibilityElementsHidden=true', () => {
    render(wrap(<Icon icon={FunctionGlyph} aria-hidden testID="hidden-fn" />));
    const shell = screen.UNSAFE_getByProps({ accessibilityElementsHidden: true });
    expect(shell.props.accessibilityElementsHidden).toBe(true);
  });

  it('[a11y] fn path — aria-hidden={true} even with label → accessible=false', () => {
    // Function path correctly clears accessible when aria-hidden=true
    render(wrap(
      <Icon icon={FunctionGlyph} aria-label="Hidden" aria-hidden testID="hidden-label-fn" />,
    ));
    // getIconShellAccessibilityProps: isHidden=true → label=undefined → accessible=false
    const shell = screen.UNSAFE_getByProps({ accessibilityElementsHidden: true });
    expect(shell.props.accessible).toBe(false);
    expect(shell.props.accessibilityLabel).toBeUndefined();
  });

  // ── ReactElement icon path ────────────────────────────────────────────────

  it('[a11y] ReactElement path — aria-label → accessible=true, accessibilityRole="image"', () => {
    render(wrap(
      <Icon icon={ElementGlyph} aria-label="Favourite" testID="el-a11y" />,
    ));
    // For ReactElement path, a11y props are on the testID View directly
    const outer = screen.getByTestId('el-a11y');
    expect(outer.props.accessible).toBe(true);
    expect(outer.props.accessibilityRole).toBe('image');
    expect(outer.props.accessibilityLabel).toBe('Favourite');
  });

  it('[a11y] ReactElement path — no aria-label → not accessible to screen readers', () => {
    render(wrap(<Icon icon={ElementGlyph} testID="el-deco" />));
    // React strips accessible={false} from the host-component instance props (false is the
    // native default). The element is in the tree but RNTL getByTestId filters it out because
    // accessibilityElementsHidden=true is set on it. Use UNSAFE_getByProps to reach it.
    // Assert the element is NOT announced as accessible (accessible !== true).
    const outer = screen.UNSAFE_getByProps({ testID: 'el-deco' });
    expect(outer.props.accessible).not.toBe(true);
  });

  it('[a11y] ReactElement path — no aria-label → hidden from a11y tree (accessibilityElementsHidden=true)', () => {
    // When no aria-label is set: accessibilityElementsHidden=true hides the icon from screen readers.
    // RNTL's getByTestId/queryByTestId use findAll() which restricts to HOST elements only and
    // filters nodes where accessibilityElementsHidden=true (or importantForAccessibility=no-hide-descendants).
    //
    // UNSAFE_getByProps() uses React test renderer's findByProps() which may return the React
    // *component* fiber (Icon) rather than the rendered host View — the component fiber does
    // not carry the internally-computed a11y props, so they appear undefined.
    //
    // Fix: use getByTestId(..., { includeHiddenElements: true }) which uses the HOST-only path
    // but skips the accessibility filter, giving us the actual View with all rendered props.
    render(wrap(<Icon icon={ElementGlyph} testID="el-deco-hidden" />));
    // getByTestId with includeHiddenElements reaches the host View despite accessibilityElementsHidden:
    const outer = screen.getByTestId('el-deco-hidden', { includeHiddenElements: true });
    expect(outer).toBeTruthy();
    // accessibilityElementsHidden=true is set on the outer View (RNTL uses this to filter):
    expect(outer.props.accessibilityElementsHidden).toBe(true);
    // Standard queryByTestId returns null — proves the element is invisible to screen readers:
    expect(screen.queryByTestId('el-deco-hidden')).toBeNull();
  });

  it('[a11y] ReactElement path — aria-hidden={true} → hidden from a11y tree (accessibilityElementsHidden=true)', () => {
    render(wrap(
      <Icon icon={ElementGlyph} aria-hidden testID="el-hidden" />,
    ));
    const outer = screen.getByTestId('el-hidden', { includeHiddenElements: true });
    expect(outer).toBeTruthy();
    expect(outer.props.accessibilityElementsHidden).toBe(true);
    expect(screen.queryByTestId('el-hidden')).toBeNull();
  });

  // ── Inner glyph wrapper is a11y-hidden in both paths ─────────────────────

  it('[a11y] fn path — inner glyph View is hidden from a11y (accessible=false)', () => {
    render(wrap(<Icon icon={FunctionGlyph} aria-label="Heart" />));
    // IconShell wraps the glyph in <View accessible={false} importantForAccessibility="no-hide-descendants">
    const glyph = screen.UNSAFE_getByProps({ importantForAccessibility: 'no-hide-descendants' });
    expect(glyph.props.accessible).toBe(false);
  });

  it('[a11y] ReactElement path — inner glyph View is hidden from a11y (accessible=false)', () => {
    render(wrap(
      <Icon icon={ElementGlyph} aria-label="Heart" testID="el-inner" />,
    ));
    // The inner View wrapping the pre-built element: accessible={false}
    const inner = screen.UNSAFE_getByProps({ accessible: false });
    expect(inner).toBeTruthy();
  });
});

// ─── Bug-catching ─────────────────────────────────────────────────────────────

describe('Icon — bug-catching', () => {
  // ── BUG-ICON-1 ────────────────────────────────────────────────────────────
  // For function icons with testID, the testID View is a dimension-only wrapper.
  // The a11y props live on the inner IconShell. Consumers cannot use
  // getByTestId(id).props.accessibilityRole to find the role — it is undefined.

  it('[bug] BUG-ICON-1: fn path — testID wrapper has no accessibilityRole (a11y on inner shell)', () => {
    render(wrap(
      <Icon icon={FunctionGlyph} aria-label="Favourite" testID="bug-fn" />,
    ));
    const wrapper = screen.getByTestId('bug-fn');
    // Expected: accessibilityRole='image' on the testID element (consistent with ReactElement path)
    // Bug:      accessibilityRole is undefined — lives on the inner IconShell instead
    expect(wrapper.props.accessibilityRole).toBe('image');
  });

  it('[bug] BUG-ICON-1: fn path — testID wrapper has no accessibilityLabel (a11y on inner shell)', () => {
    render(wrap(
      <Icon icon={FunctionGlyph} aria-label="Favourite" testID="bug-fn-label" />,
    ));
    const wrapper = screen.getByTestId('bug-fn-label');
    // Expected: accessibilityLabel='Favourite' on the testID element
    // Bug:      accessibilityLabel is undefined on the wrapper
    expect(wrapper.props.accessibilityLabel).toBe('Favourite');
  });

  // ── BUG-ICON-2 ────────────────────────────────────────────────────────────
  // Icon.native.tsx ReactElement path computes `accessible={Boolean(ariaLabel)}`
  // without gating on ariaHidden. When aria-hidden={true} + aria-label are both
  // set, accessible={true} and accessibilityLabel are still applied to the View,
  // creating a contradictory state (element is "accessible" but also hidden).
  // The function path (via getIconShellAccessibilityProps) handles this correctly.

  it('[bug] BUG-ICON-2: ReactElement path — aria-hidden={true} + aria-label still sets accessible=true', () => {
    render(wrap(
      <Icon icon={ElementGlyph} aria-label="Favourite" aria-hidden testID="bug-re-hidden" />,
    ));
    // aria-hidden={true} → accessibilityElementsHidden=true → getByTestId filters this node.
    // Use includeHiddenElements to reach the host View with its rendered a11y props.
    const outer = screen.getByTestId('bug-re-hidden', { includeHiddenElements: true });
    // Expected: accessible=false (aria-hidden overrides the label)
    // Bug:      accessible=true — Boolean(ariaLabel) ignores ariaHidden
    expect(outer.props.accessible).toBe(false);
  });

  it('[bug] BUG-ICON-2: ReactElement path — aria-hidden={true} + aria-label still sets accessibilityLabel', () => {
    render(wrap(
      <Icon icon={ElementGlyph} aria-label="Favourite" aria-hidden testID="bug-re-label" />,
    ));
    // Same: includeHiddenElements to reach the host View despite accessibilityElementsHidden=true
    const outer = screen.getByTestId('bug-re-label', { includeHiddenElements: true });
    // Expected: accessibilityLabel=undefined (hidden icons should not expose a label)
    // Bug:      accessibilityLabel='Favourite'
    expect(outer.props.accessibilityLabel).toBeUndefined();
  });
});
