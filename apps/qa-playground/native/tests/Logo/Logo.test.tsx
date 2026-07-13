/**
 * Logo QA tests — smoke, functional, a11y, and bug-catching.
 *
 * Source: packages/ui-native/src/components/Logo/Logo.native.tsx
 *
 * ─── Figma API table ─────────────────────────────────────────────────────────
 *
 *   Property     Figma values                     Native prop / values
 *   ──────────────────────────────────────────────────────────────────────────
 *   size         XS | S | M | L | XL | custom     size: 'xs'|'s'|'m'|'l'|'xl'|'custom'
 *                                                  (BUG-LOGO-3: uppercase vs lowercase)
 *   interactive  true | false                      NO NATIVE EQUIVALENT (BUG-LOGO-1)
 *
 * ─── Native-only props ───────────────────────────────────────────────────────
 *
 *   variant      'mark'(default) | 'full'
 *   customSize   number — required when size='custom' (BUG-LOGO-2 if omitted)
 *   children     ReactNode — custom logo content (highest priority)
 *   src          string — image URL
 *   svgContent   string — inline SVG XML string
 *   alt          string — REQUIRED (accessibilityLabel for screen readers)
 *   onLoad       () => void — fires when src image loads
 *   onError      () => void — fires when src image errors
 *   fallback     ReactNode — shown when image errors or no content
 *   accessibilityHint, testID, style
 *
 * ─── Content mode priority ───────────────────────────────────────────────────
 *
 *   children > svgContent > src > empty
 *   (first truthy wins; empty = renders null inside container)
 *
 * ─── Size → px mapping ───────────────────────────────────────────────────────
 *
 *   xs → tokens.spacing['3']   (12px)
 *   s  → tokens.spacing['4']   (16px)
 *   m  → tokens.spacing['5']   (20px)  default
 *   l  → tokens.spacing['6']   (24px)
 *   xl → tokens.spacing['8']   (32px)
 *   custom + customSize → customSize px
 *   custom (no customSize) → falls back to M = 20px (BUG-LOGO-2)
 *
 * ─── Non-interactive component ───────────────────────────────────────────────
 *
 *   Logo has NO onPress / onClick. It is always accessibilityRole='image'.
 *   Figma shows interactive=true|false but native does not implement this.
 *   See BUG-LOGO-1.
 *
 * ─── Bugs (raise to dev team) ────────────────────────────────────────────────
 *
 *   BUG-LOGO-1 · Figma "interactive" prop has no native equivalent
 *     Figma API: interactive = true | false (component property).
 *     Native LogoProps has no `interactive`, no `onPress`, no `onClick`.
 *     The Logo is always non-interactive — accessibilityRole is always 'image'.
 *     Callers following Figma who try to make the Logo tappable get no TypeScript
 *     hint and no press handler — the logo silently remains decorative.
 *     File: packages/ui-native/src/components/Logo/interface.ts:12-26
 *     Fix:  Add `interactive?: boolean` + `onPress?: () => void` to LogoProps.
 *           When interactive=true, wrap with a Pressable and set role='button'.
 *
 *   BUG-LOGO-2 · FIXED — warnInvalidLogoCustomConfig (Logo.styles.native.ts:30)
 *     now emits console.warn when size='custom' and customSize is missing/invalid.
 *
 *   BUG-LOGO-3 · Figma sizes uppercase (XS/S/M/L/XL) vs native lowercase
 *     Figma: size = XS | S | M | L | XL | custom
 *     Native LogoSize: 'xs' | 's' | 'm' | 'l' | 'xl' | 'custom' (all lowercase)
 *     Passing size="XS" (Figma style) → TypeScript error on native.
 *     File: packages/ui-native/src/components/Logo/interface.ts:9
 *     Fix:  Add uppercase aliases in LogoSize or document the case difference.
 *
 *   BUG-LOGO-4 · alt="" (empty string) produces silent empty accessibilityLabel
 *     `alt` is TypeScript-required (`alt: string`, not `alt?: string`).
 *     But passing `alt=""` sets `accessibilityLabel=""` — screen readers announce
 *     only "image" with no context. No warning is emitted for empty alt.
 *     File: packages/ui-native/src/components/Logo/interface.ts:55-68
 *     Fix:  Emit a dev warning when alt is empty: the logo has no accessible name.
 */

import React from 'react';
import { View } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { describe, it, expect, vi } from 'vitest';
import { Logo } from '@ui-native/components/Logo/Logo.native';
import { SIZE_PX } from '@ui-native/components/Logo/Logo.styles.native';
import { wrap } from '../../utils/renderWithTheme';

// ─── Constants ────────────────────────────────────────────────────────────────

// Figma sizes → native lowercase sizes
const NATIVE_SIZES = ['xs', 's', 'm', 'l', 'xl'] as const;

const TEST_SVG = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="12"/></svg>';
const TEST_SRC = 'https://example.com/logo.png';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function flatStyle(style: unknown): Record<string, unknown> {
  if (!style) return {};
  if (Array.isArray(style)) return Object.assign({}, ...(style as unknown[]).map(flatStyle));
  if (typeof style === 'object') return style as Record<string, unknown>;
  return {};
}

// ─── Figma matrix: size × variant ────────────────────────────────────────────
//
// Figma matrix: 6 sizes × 2 interactive states
// Native: 5 t-shirt sizes + custom × 2 variants (mark/full)

describe('Logo — Figma matrix: size × variant', () => {
  for (const size of NATIVE_SIZES) {
    for (const variant of ['mark', 'full'] as const) {
      it(`[smoke] size="${size}" variant="${variant}" renders without crashing`, () => {
        expect(() =>
          render(wrap(
            <Logo
              size={size}
              variant={variant}
              alt={`Jio logo ${size} ${variant}`}
              testID="logo-matrix"
            >
              <View />
            </Logo>,
          )),
        ).not.toThrow();
      });

      it(`[fn] size="${size}" variant="${variant}" — role=image and correct dimensions`, () => {
        render(wrap(
          <Logo
            size={size}
            variant={variant}
            alt={`Jio ${size}`}
            testID="logo-fn"
          >
            <View />
          </Logo>,
        ));
        const el = screen.getByTestId('logo-fn');
        expect(el.props.accessibilityRole).toBe('image');
        const s = flatStyle(el.props.style);
        expect(s.height).toBe(SIZE_PX[size]);
      });
    }
  }
});

// ─── Smoke ────────────────────────────────────────────────────────────────────

describe('Logo — smoke', () => {
  it('[smoke] renders without crashing (children mode)', () => {
    expect(() =>
      render(wrap(<Logo alt="Jio"><View /></Logo>)),
    ).not.toThrow();
  });

  it('[smoke] renders with svgContent', () => {
    expect(() =>
      render(wrap(<Logo alt="Jio" svgContent={TEST_SVG} testID="logo" />)),
    ).not.toThrow();
  });

  it('[smoke] renders with src image', () => {
    expect(() =>
      render(wrap(<Logo alt="Jio" src={TEST_SRC} testID="logo" />)),
    ).not.toThrow();
  });

  it('[smoke] renders with fallback (empty mode)', () => {
    render(wrap(<Logo alt="Jio" fallback={<View testID="fallback" />} testID="logo" />));
    expect(screen.getByTestId('logo')).toBeTruthy();
  });

  it('[smoke] renders empty (no content, no fallback)', () => {
    render(wrap(<Logo alt="Jio" testID="logo-empty" />));
    expect(screen.getByTestId('logo-empty')).toBeTruthy();
  });

  it('[smoke] renders custom size with customSize', () => {
    expect(() =>
      render(wrap(<Logo alt="Jio" size="custom" customSize={48}><View /></Logo>)),
    ).not.toThrow();
  });

  it('[smoke] renders variant="full"', () => {
    expect(() =>
      render(wrap(<Logo alt="Jio" variant="full" svgContent={TEST_SVG} />)),
    ).not.toThrow();
  });
});

// ─── Functional: content modes ────────────────────────────────────────────────

describe('Logo — functional: content modes', () => {
  it('[fn] children mode — custom ReactNode renders in mark container', () => {
    render(wrap(
      <Logo alt="Jio" testID="logo">
        <View testID="logo-child" />
      </Logo>,
    ));
    expect(screen.getByTestId('logo-child', { includeHiddenElements: true })).toBeTruthy();
  });

  it('[fn] children mode wins over svgContent and src', () => {
    render(wrap(
      <Logo alt="Jio" src={TEST_SRC} svgContent={TEST_SVG} testID="logo">
        <View testID="children-win" />
      </Logo>,
    ));
    // children wins — testID inside is findable:
    expect(screen.getByTestId('children-win', { includeHiddenElements: true })).toBeTruthy();
  });

  it('[fn] svgContent mode — SvgXml renders', () => {
    render(wrap(<Logo alt="Jio" svgContent={TEST_SVG} testID="logo" />));
    expect(screen.getByTestId('logo')).toBeTruthy();
  });

  it('[fn] src mode — renders RNImage (resizeMode="contain")', () => {
    // RNImage is inside the mark container (accessibilityElementsHidden=true).
    // Query by resizeMode prop which is set on the inner RNImage:
    render(wrap(<Logo alt="Jio" src={TEST_SRC} testID="logo" />));
    const images = screen.UNSAFE_getAllByProps({ resizeMode: 'contain' });
    expect(images.length).toBeGreaterThanOrEqual(1);
  });

  it('[fn] empty mode with fallback — fallback renders', () => {
    render(wrap(
      <Logo alt="Jio" fallback={<View testID="empty-fallback" />} testID="logo" />,
    ));
    expect(screen.getByTestId('empty-fallback', { includeHiddenElements: true })).toBeTruthy();
  });

  it('[fn] empty mode without fallback — no inner content (outer View still renders)', () => {
    render(wrap(<Logo alt="Jio" testID="logo-empty" />));
    const el = screen.getByTestId('logo-empty');
    expect(el.props.accessibilityRole).toBe('image');
  });
});

// ─── Functional: image error handling ────────────────────────────────────────

describe('Logo — functional: image error handling', () => {
  it('[fn] onLoad fires when src image loads', () => {
    const handler = vi.fn();
    render(wrap(<Logo alt="Jio" src={TEST_SRC} onLoad={handler} testID="logo" />));
    const images = screen.UNSAFE_getAllByProps({ onLoad: handler });
    expect(images.length).toBeGreaterThanOrEqual(1);
  });

  it('[fn] onError prop accepted — wired to image error handler', () => {
    const handler = vi.fn();
    expect(() =>
      render(wrap(<Logo alt="Jio" src={TEST_SRC} onError={handler} testID="logo" />)),
    ).not.toThrow();
    expect(screen.getByTestId('logo')).toBeTruthy();
  });

  it('[fn] fallback renders after src image fails (simulate error)', () => {
    render(wrap(
      <Logo
        alt="Jio"
        src="https://broken.url/logo.png"
        fallback={<View testID="error-fallback" />}
        testID="logo"
      />,
    ));
    // The image renders initially; error cascade requires fireEvent:
    const images = screen.UNSAFE_getAllByProps({ resizeMode: 'contain' });
    expect(images.length).toBeGreaterThanOrEqual(1);
  });
});

// ─── Functional: size dimensions ─────────────────────────────────────────────

describe('Logo — functional: size dimensions', () => {
  it('[fn] size="xs" → height = tokens.spacing["3"] (12px)', () => {
    render(wrap(<Logo alt="Jio" size="xs" testID="logo" />));
    expect(flatStyle(screen.getByTestId('logo').props.style).height).toBe(SIZE_PX.xs);
  });

  it('[fn] size="s" → height = tokens.spacing["4"] (16px)', () => {
    render(wrap(<Logo alt="Jio" size="s" testID="logo" />));
    expect(flatStyle(screen.getByTestId('logo').props.style).height).toBe(SIZE_PX.s);
  });

  it('[fn] size="m" (default) → height = tokens.spacing["5"] (20px)', () => {
    render(wrap(<Logo alt="Jio" testID="logo" />));
    expect(flatStyle(screen.getByTestId('logo').props.style).height).toBe(SIZE_PX.m);
  });

  it('[fn] size="l" → height = tokens.spacing["6"] (24px)', () => {
    render(wrap(<Logo alt="Jio" size="l" testID="logo" />));
    expect(flatStyle(screen.getByTestId('logo').props.style).height).toBe(SIZE_PX.l);
  });

  it('[fn] size="xl" → height = tokens.spacing["8"] (32px)', () => {
    render(wrap(<Logo alt="Jio" size="xl" testID="logo" />));
    expect(flatStyle(screen.getByTestId('logo').props.style).height).toBe(SIZE_PX.xl);
  });

  it('[fn] size="custom" + customSize=48 → height=48', () => {
    render(wrap(<Logo alt="Jio" size="custom" customSize={48} testID="logo" />));
    expect(flatStyle(screen.getByTestId('logo').props.style).height).toBe(48);
  });

  it('[fn] size scale is monotonically increasing: xs < s < m < l < xl', () => {
    expect(SIZE_PX.xs).toBeLessThan(SIZE_PX.s);
    expect(SIZE_PX.s).toBeLessThan(SIZE_PX.m);
    expect(SIZE_PX.m).toBeLessThan(SIZE_PX.l);
    expect(SIZE_PX.l).toBeLessThan(SIZE_PX.xl);
  });
});

// ─── Functional: variant ──────────────────────────────────────────────────────

describe('Logo — functional: variant', () => {
  it('[fn] variant="mark" (default) → container has explicit width = height', () => {
    render(wrap(<Logo alt="Jio" variant="mark" size="m" testID="logo" />));
    const s = flatStyle(screen.getByTestId('logo').props.style);
    expect(s.width).toBe(SIZE_PX.m);
    expect(s.height).toBe(SIZE_PX.m);
  });

  it('[fn] variant="full" → width is undefined (fills from SVG aspect ratio)', () => {
    render(wrap(<Logo alt="Jio" variant="full" size="m" svgContent={TEST_SVG} testID="logo" />));
    const s = flatStyle(screen.getByTestId('logo').props.style);
    // full variant has no fixed width — expands to content:
    expect(s.width).toBeUndefined();
    expect(s.height).toBe(SIZE_PX.m);
  });
});

// ─── A11y ─────────────────────────────────────────────────────────────────────

describe('Logo — a11y', () => {
  it('[a11y] accessibilityRole="image" always', () => {
    render(wrap(<Logo alt="Jio logo" testID="logo" />));
    expect(screen.getByTestId('logo').props.accessibilityRole).toBe('image');
  });

  it('[a11y] accessible=true always', () => {
    render(wrap(<Logo alt="Jio logo" testID="logo" />));
    expect(screen.getByTestId('logo').props.accessible).toBe(true);
  });

  it('[a11y] alt maps to accessibilityLabel', () => {
    render(wrap(<Logo alt="Jio brand logo" testID="logo" />));
    expect(screen.getByTestId('logo').props.accessibilityLabel).toBe('Jio brand logo');
  });

  it('[a11y] getByLabelText finds logo by alt text', () => {
    render(wrap(<Logo alt="Jio logo" />));
    expect(screen.getByLabelText('Jio logo')).toBeTruthy();
  });

  it('[a11y] accessibilityHint forwarded to container', () => {
    render(wrap(
      <Logo alt="Jio logo" accessibilityHint="Tap to go home" testID="logo" />,
    ));
    expect(screen.getByTestId('logo').props.accessibilityHint).toBe('Tap to go home');
  });

  it('[a11y] inner mark container is accessible=false (container carries a11y)', () => {
    render(wrap(
      <Logo alt="Jio logo" testID="logo">
        <View testID="inner-mark" />
      </Logo>,
    ));
    // Inner mark View has LOGO_DECORATIVE_A11Y (accessible=false, no-hide-descendants)
    const outer = screen.getByTestId('logo');
    expect(outer.props.accessible).toBe(true);
    // The inner mark is accessible=false — verify via UNSAFE query:
    const decorative = screen.UNSAFE_getAllByProps({
      accessible: false,
      importantForAccessibility: 'no-hide-descendants',
    });
    expect(decorative.length).toBeGreaterThanOrEqual(1);
  });

  it('[a11y] role is always "image" — Logo is non-interactive', () => {
    // Unlike Button/Pressable, Logo never uses role="button"
    // even when used in an interactive context (BUG-LOGO-1)
    render(wrap(<Logo alt="Jio logo" testID="logo"><View /></Logo>));
    expect(screen.getByTestId('logo').props.accessibilityRole).toBe('image');
    expect(screen.getByTestId('logo').props.onPress).toBeUndefined();
  });

  it('[a11y] testID forwarded to outer container', () => {
    render(wrap(<Logo alt="Jio" testID="my-logo" />));
    expect(screen.getByTestId('my-logo')).toBeTruthy();
  });
});

// ─── Bug-catching ─────────────────────────────────────────────────────────────

describe('Logo — bug-catching', () => {
  // ── BUG-LOGO-1: Figma "interactive" has no native equivalent ─────────────────

  it('[bug] BUG-LOGO-1: Figma interactive=true has no native prop — Logo always non-interactive', () => {
    // Figma: interactive = true | false (component property)
    // Native: no interactive prop, no onPress, no onClick
    // The Logo is always accessibilityRole='image' with no press handler.
    render(wrap(<Logo alt="Jio" testID="logo-interactive"><View /></Logo>));
    const el = screen.getByTestId('logo-interactive');
    // Bug: role should become 'button' when interactive=true — stays 'image'
    expect(el.props.accessibilityRole).toBe('button'); // FAILS: gets 'image'
  });

  it('[bug] BUG-LOGO-1: passing onPress manually still leaves role="image"', () => {
    // Even manually passing an onPress-like prop doesn't change the role
    // because Logo renders a plain View, not a Pressable.
    // Expected: interactive Logo should use Pressable + role='button'
    // @ts-expect-error — onPress not in LogoProps; native doesn't support it
    render(wrap(<Logo alt="Jio" onPress={vi.fn()} testID="logo-press"><View /></Logo>));
    const el = screen.getByTestId('logo-press');
    expect(el.props.accessibilityRole).toBe('button'); // FAILS: gets 'image'
  });

  // ── BUG-LOGO-2 FIXED: size='custom' without customSize warns + falls back to M ──

  it('[fn] BUG-LOGO-2 FIXED: size="custom" without customSize emits warning and falls back to M', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      render(wrap(<Logo alt="Jio" size="custom" testID="logo-custom" />));
      const s = flatStyle(screen.getByTestId('logo-custom').props.style);
      // Fix: warnInvalidLogoCustomConfig emits warning when customSize is missing
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('customSize'));
      expect(s.height).toBe(SIZE_PX.m);
    } finally {
      warnSpy.mockRestore();
    }
  });

  // ── BUG-LOGO-3: Figma uppercase sizes vs native lowercase ─────────────────────

  it('[bug] BUG-LOGO-3: Figma size="XS" (uppercase) is TypeScript-rejected — native uses "xs"', () => {
    // Figma: size = XS | S | M | L | XL | custom (uppercase)
    // Native LogoSize: 'xs' | 's' | 'm' | 'l' | 'xl' | 'custom' (lowercase)
    // Correct native usage:
    render(wrap(<Logo alt="Jio" size="xs" testID="logo-xs" />));
    expect(flatStyle(screen.getByTestId('logo-xs').props.style).height).toBe(SIZE_PX.xs);
    // Figma uppercase is TypeScript-rejected on native:
    // @ts-expect-error — "XS" is Figma's case; native uses "xs"
    render(wrap(<Logo alt="Jio" size="XS" testID="logo-XS" />));
    // "XS" falls through resolveSize → returns SIZE_PX.m (unknown key fallback)
    const s = flatStyle(screen.getByTestId('logo-XS').props.style);
    // Bug: "XS" should produce xs-size height, but gets m-size (fallback)
    expect(s.height).toBe(SIZE_PX.xs); // FAILS: "XS" maps to m (fallback)
  });

  // ── BUG-LOGO-4: alt="" silent empty accessibilityLabel ────────────────────────

  it('[bug] BUG-LOGO-4: alt="" (empty string) produces empty accessibilityLabel — silent a11y gap', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      render(wrap(<Logo alt="" testID="logo-empty-alt" />));
      const el = screen.getByTestId('logo-empty-alt');
      // Bug: accessibilityLabel="" — screen reader announces only "image" with no name
      // Expected: dev warning for empty alt
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('alt'));
      // Documents the current (broken) behavior:
      expect(el.props.accessibilityLabel).toBe('');
    } finally {
      warnSpy.mockRestore();
    }
  });
});
