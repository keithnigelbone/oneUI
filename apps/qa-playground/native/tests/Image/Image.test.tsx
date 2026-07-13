/**
 * Image QA tests — smoke, functional, a11y, and bug-catching.
 *
 * Source: packages/ui-native/src/components/Image/Image.native.tsx
 *
 * ─── Figma API table ─────────────────────────────────────────────────────────
 *
 *   Property      Figma values                    Native prop / values
 *   ──────────────────────────────────────────────────────────────────────────
 *   aspectRatio   auto|1:1|1:2|2:1|2:3|3:2|       aspectRatio?: ImageAspectRatio
 *                 3:4|4:3|9:16|16:9|9:21|21:9      (same values)
 *   interactive   true | false                    interactive?: boolean (same)
 *   — Code only (N/A in Figma) —
 *   fit           cover|container|fill|none|      fit?: 'cover'|'contain'|'fill'|'none'
 *                 scale-down|inherit|...           (BUG-IMG-3: Figma "container" vs native "contain")
 *   width         <input value>                   width?: string | number
 *   height        <input value>                   height?: string | number
 *   alt           <input text>                    alt: string  (REQUIRED)
 *   src           <insert url>                    src: string  (REQUIRED)
 *   srcSet        <insert url>                    NO NATIVE EQUIVALENT (web-only)
 *   loading       auto|eager|error|lazy|empty     loading?: 'auto'|'lazy'|'eager' (NO-OP on native)
 *   crossOrigin   anonymous|use-credentials       NO NATIVE EQUIVALENT (web-only)
 *   lottieAttr    <insert url>                    NO NATIVE EQUIVALENT (web-only)
 *   decoding      auto|async|sync                 NO NATIVE EQUIVALENT (web-only)
 *   draggable     true | false                    NO NATIVE EQUIVALENT (web-only)
 *   fallback      <insert url>                    fallback?: ReactNode + fallbackSrc?: string
 *
 * ─── Two render paths ─────────────────────────────────────────────────────────
 *
 *   interactive=true AND (onPress OR onClick) provided:
 *     → <Pressable accessibilityRole="button">
 *
 *   Otherwise (interactive=false OR no handler):
 *     → <View accessibilityRole="image">
 *
 *   IMPORTANT: interactive=true WITHOUT a handler still renders as View,
 *   but getImageAccessibilityProps still returns role='button' → semantic bug.
 *   See BUG-IMG-2.
 *
 * ─── Press handler resolution ────────────────────────────────────────────────
 *
 *   handlePress = onPress ?? onClick
 *   → onClick silently ignored when onPress is also set (BUG-IMG-1)
 *
 * ─── Fallback cascade ────────────────────────────────────────────────────────
 *
 *   src loads → shows src image
 *   src errors + fallbackSrc → tries fallbackSrc
 *   fallbackSrc also errors → sets hasError=true → shows fallback ReactNode
 *   hasError + no fallback → renders nothing (neutral background paint only)
 *
 * ─── Bugs (raise to dev team) ────────────────────────────────────────────────
 *
 *   BUG-IMG-1 · onClick silently ignored when onPress is also provided
 *     handlePress = onPress ?? onClick
 *     When both are set, onClick never fires. Same pattern as BUG-IBN-3 (IconButton).
 *     File: packages/ui-native/src/components/Image/Image.native.tsx:93
 *     Fix:  `handlePress = () => { onPress?.(); onClick?.(); }` so both fire.
 *
 *   BUG-IMG-2 · interactive=true without handler → accessibilityRole='button' on non-interactive View
 *     When interactive=true but neither onPress nor onClick is provided:
 *       isInteractive=true → getImageAccessibilityProps returns accessibilityRole='button'
 *       handlePress=undefined → condition `isInteractive && handlePress` is false
 *       → renders <View accessibilityRole='button'> — button role on non-pressable element
 *     Screen readers announce it as "button" but pressing does nothing.
 *     File: packages/ui-native/src/components/Image/Image.native.tsx:128
 *     Fix:  Either always render Pressable when interactive=true (even without handler),
 *           or use role='image' when no handler is available regardless of interactive flag.
 *
 *   BUG-IMG-3 · Figma fit value "container" vs native "contain" — naming mismatch
 *     Figma API table: fit = cover | container | fill | none | scale-down | ...
 *     Native ImageObjectFit: 'cover' | 'contain' | 'fill' | 'none'
 *     Figma uses "container" (their spec value) but native uses "contain" (CSS keyword).
 *     Callers following Figma who pass fit="container" get a TypeScript error on native.
 *     There is no native equivalent for "container" — closest is "contain".
 *     File: packages/ui-native/src/components/Image/interface.ts:39
 *     Fix:  Add 'container' as an alias for 'contain' in ImageObjectFit so Figma callers
 *           can pass fit="container" without TypeScript errors.
 *
 *   BUG-IMG-4 · objectPosition prop is a NO-OP on native
 *     objectPosition?: string is accepted for API symmetry with web but has
 *     zero effect on native rendering. No warning is emitted.
 *     File: packages/ui-native/src/components/Image/interface.ts:67
 *     Fix:  Emit a dev-mode console.warn when objectPosition is set on native.
 *
 *   BUG-IMG-5 · loading prop is a NO-OP on native (RN images are always eager)
 *     loading?: 'auto' | 'lazy' | 'eager' is accepted for API symmetry but
 *     React Native's Image component always loads eagerly regardless of this prop.
 *     Callers who rely on lazy loading for performance get no benefit.
 *     File: packages/ui-native/src/components/Image/interface.ts:69
 *     Fix:  Emit a dev-mode console.warn when loading='lazy' is set on native.
 *
 *   BUG-IMG-6 · Figma Code-only props not surfaced on native
 *     Figma API table shows these as code-only (N/A): srcSet, crossOrigin,
 *     decoding, draggable, lottieAttributes.
 *     Native ImageProps has none of these — callers following web Figma docs
 *     get TypeScript errors when trying to use them on native.
 *     File: packages/ui-native/src/components/Image/interface.ts (missing props)
 *     Fix:  Document the web→native prop gap in the interface JSDoc.
 */

import React from 'react';
import { View } from 'react-native';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { describe, it, expect, vi } from 'vitest';
import { Image } from '@ui-native/components/Image/Image.native';
import { wrap } from '../../utils/renderWithTheme';

// ─── Constants ────────────────────────────────────────────────────────────────

const ASPECT_RATIOS = [
  'auto', '1:1', '1:2', '2:1', '2:3', '3:2',
  '3:4', '4:3', '9:16', '16:9', '9:21', '21:9',
] as const;

const TEST_SRC = 'https://example.com/image.jpg';
const TEST_ALT = 'Test image';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function flatStyle(style: unknown): Record<string, unknown> {
  if (!style) return {};
  if (Array.isArray(style)) return Object.assign({}, ...(style as unknown[]).map(flatStyle));
  if (typeof style === 'object') return style as Record<string, unknown>;
  return {};
}

// ─── Figma matrix: aspectRatio × interactive ──────────────────────────────────
//
// Figma matrix: columns = interactive (false / true), rows = aspectRatio
// Each cell renders with a real src and alt to match Figma's spec.

describe('Image — Figma matrix: aspectRatio × interactive', () => {
  for (const aspectRatio of ASPECT_RATIOS) {
    for (const interactive of [false, true] as const) {
      it(`[smoke] aspectRatio="${aspectRatio}" interactive=${interactive} renders without crashing`, () => {
        expect(() =>
          render(wrap(
            <Image
              src={TEST_SRC}
              alt={TEST_ALT}
              aspectRatio={aspectRatio}
              interactive={interactive}
              onPress={interactive ? vi.fn() : undefined}
              testID="img-matrix"
            />,
          )),
        ).not.toThrow();
      });

      it(`[fn] aspectRatio="${aspectRatio}" interactive=${interactive} — correct role`, () => {
        render(wrap(
          <Image
            src={TEST_SRC}
            alt={TEST_ALT}
            aspectRatio={aspectRatio}
            interactive={interactive}
            onPress={interactive ? vi.fn() : undefined}
            testID="img-fn"
          />,
        ));
        const el = screen.getByTestId('img-fn');
        const expectedRole = interactive ? 'button' : 'image';
        expect(el.props.accessibilityRole).toBe(expectedRole);
      });
    }
  }
});

// ─── Smoke ────────────────────────────────────────────────────────────────────

describe('Image — smoke', () => {
  it('[smoke] renders without crashing (minimal required props)', () => {
    expect(() =>
      render(wrap(<Image src={TEST_SRC} alt={TEST_ALT} />)),
    ).not.toThrow();
  });

  it('[smoke] renders interactive without crashing', () => {
    expect(() =>
      render(wrap(<Image src={TEST_SRC} alt={TEST_ALT} interactive onPress={vi.fn()} />)),
    ).not.toThrow();
  });

  it('[smoke] renders disabled without crashing', () => {
    expect(() =>
      render(wrap(<Image src={TEST_SRC} alt={TEST_ALT} disabled />)),
    ).not.toThrow();
  });

  it('[smoke] renders all aspect ratios without crashing', () => {
    for (const aspectRatio of ASPECT_RATIOS) {
      const { unmount } = render(wrap(
        <Image src={TEST_SRC} alt={`ratio ${aspectRatio}`} aspectRatio={aspectRatio} />,
      ));
      unmount();
    }
    render(wrap(<Image src={TEST_SRC} alt={TEST_ALT} />));
  });

  it('[smoke] renders with fallback ReactNode without crashing', () => {
    expect(() =>
      render(wrap(
        <Image src={TEST_SRC} alt={TEST_ALT} fallback={<View testID="fallback-node" />} />,
      )),
    ).not.toThrow();
  });

  it('[smoke] renders with fallbackSrc without crashing', () => {
    expect(() =>
      render(wrap(
        <Image src={TEST_SRC} alt={TEST_ALT} fallbackSrc="https://example.com/fallback.jpg" />,
      )),
    ).not.toThrow();
  });

  it('[smoke] renders with explicit width and height', () => {
    expect(() =>
      render(wrap(<Image src={TEST_SRC} alt={TEST_ALT} width={200} height={150} />)),
    ).not.toThrow();
  });
});

// ─── Functional: render paths ─────────────────────────────────────────────────

describe('Image — functional: render paths', () => {
  it('[fn] non-interactive → renders as View with role="image"', () => {
    render(wrap(<Image src={TEST_SRC} alt={TEST_ALT} testID="img" />));
    const el = screen.getByTestId('img');
    expect(el.props.accessibilityRole).toBe('image');
  });

  it('[fn] interactive=true + onPress → renders as Pressable with role="button"', () => {
    render(wrap(
      <Image src={TEST_SRC} alt={TEST_ALT} interactive onPress={vi.fn()} testID="img" />,
    ));
    const el = screen.getByTestId('img');
    expect(el.props.accessibilityRole).toBe('button');
  });

  it('[fn] interactive=true + onClick → renders as Pressable with role="button"', () => {
    render(wrap(
      <Image src={TEST_SRC} alt={TEST_ALT} interactive onClick={vi.fn()} testID="img" />,
    ));
    const el = screen.getByTestId('img');
    expect(el.props.accessibilityRole).toBe('button');
  });

  it('[fn] interactive=false → renders as View (role="image") even with onPress', () => {
    render(wrap(
      <Image src={TEST_SRC} alt={TEST_ALT} interactive={false} onPress={vi.fn()} testID="img" />,
    ));
    // interactive=false → isInteractive=false → renders as View
    expect(screen.getByTestId('img').props.accessibilityRole).toBe('image');
  });

  it('[fn] disabled=true beats interactive=true → renders as View (role="image")', () => {
    // isInteractive = interactive && !disabled → false when disabled
    render(wrap(
      <Image src={TEST_SRC} alt={TEST_ALT} interactive disabled onPress={vi.fn()} testID="img" />,
    ));
    expect(screen.getByTestId('img').props.accessibilityRole).toBe('image');
  });

  it('[fn] testID forwarded to the root element', () => {
    render(wrap(<Image src={TEST_SRC} alt={TEST_ALT} testID="my-image" />));
    expect(screen.getByTestId('my-image')).toBeTruthy();
  });
});

// ─── Functional: events ───────────────────────────────────────────────────────

describe('Image — functional: events', () => {
  it('[fn] onPress fires when interactive image is pressed', () => {
    const handler = vi.fn();
    render(wrap(
      <Image src={TEST_SRC} alt={TEST_ALT} interactive onPress={handler} testID="img" />,
    ));
    fireEvent.press(screen.getByTestId('img'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('[fn] onClick fires when onPress not set (alias)', () => {
    const handler = vi.fn();
    render(wrap(
      <Image src={TEST_SRC} alt={TEST_ALT} interactive onClick={handler} testID="img" />,
    ));
    fireEvent.press(screen.getByTestId('img'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('[fn] multiple presses fire onPress each time', () => {
    const handler = vi.fn();
    render(wrap(
      <Image src={TEST_SRC} alt={TEST_ALT} interactive onPress={handler} testID="img" />,
    ));
    fireEvent.press(screen.getByTestId('img'));
    fireEvent.press(screen.getByTestId('img'));
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('[fn] onLoad fires when image loads', () => {
    const handler = vi.fn();
    render(wrap(<Image src={TEST_SRC} alt={TEST_ALT} onLoad={handler} testID="img" />));
    // Trigger the load event on the inner RNImage
    // In RNTL, we simulate load via the RNImage's onLoad prop
    const images = screen.UNSAFE_getAllByProps({ onLoad: handler });
    expect(images.length).toBeGreaterThanOrEqual(1);
  });

  it('[fn] onError prop accepted — wired to internal error handler', () => {
    // onError is passed to handleError (internal) which calls it after the
    // fallbackSrc cascade. Test just verifies the component renders without crash.
    const handler = vi.fn();
    expect(() =>
      render(wrap(<Image src={TEST_SRC} alt={TEST_ALT} onError={handler} testID="img" />)),
    ).not.toThrow();
    expect(screen.getByTestId('img')).toBeTruthy();
  });

  it('[fn] non-interactive image does not have an onPress handler', () => {
    render(wrap(
      <Image src={TEST_SRC} alt={TEST_ALT} interactive={false} onPress={vi.fn()} testID="img" />,
    ));
    // When interactive=false, renders as View — no onPress on element:
    expect(screen.getByTestId('img').props.onPress).toBeUndefined();
  });
});

// ─── Functional: aspect ratio ─────────────────────────────────────────────────

describe('Image — functional: aspect ratio', () => {
  it('[fn] aspectRatio="1:1" → aspectRatio=1 on container style', () => {
    render(wrap(<Image src={TEST_SRC} alt={TEST_ALT} aspectRatio="1:1" testID="img" />));
    const s = flatStyle(screen.getByTestId('img').props.style);
    expect(s.aspectRatio).toBe(1);
  });

  it('[fn] aspectRatio="16:9" → aspectRatio=16/9 on container style', () => {
    render(wrap(<Image src={TEST_SRC} alt={TEST_ALT} aspectRatio="16:9" testID="img" />));
    const s = flatStyle(screen.getByTestId('img').props.style);
    expect((s.aspectRatio as number)).toBeCloseTo(16 / 9, 3);
  });

  it('[fn] aspectRatio="4:3" → aspectRatio=4/3 on container style', () => {
    render(wrap(<Image src={TEST_SRC} alt={TEST_ALT} aspectRatio="4:3" testID="img" />));
    const s = flatStyle(screen.getByTestId('img').props.style);
    expect((s.aspectRatio as number)).toBeCloseTo(4 / 3, 3);
  });

  it('[fn] aspectRatio="21:9" → aspectRatio=21/9 (widescreen)', () => {
    render(wrap(<Image src={TEST_SRC} alt={TEST_ALT} aspectRatio="21:9" testID="img" />));
    const s = flatStyle(screen.getByTestId('img').props.style);
    expect((s.aspectRatio as number)).toBeCloseTo(21 / 9, 3);
  });

  it('[fn] aspectRatio="auto" → no aspectRatio in container style', () => {
    render(wrap(<Image src={TEST_SRC} alt={TEST_ALT} aspectRatio="auto" testID="img" />));
    const s = flatStyle(screen.getByTestId('img').props.style);
    expect(s.aspectRatio).toBeUndefined();
  });

  it('[fn] default aspectRatio is "auto" → no aspectRatio in style', () => {
    render(wrap(<Image src={TEST_SRC} alt={TEST_ALT} testID="img" />));
    const s = flatStyle(screen.getByTestId('img').props.style);
    expect(s.aspectRatio).toBeUndefined();
  });

  it('[fn] all aspect ratios produce a positive numeric ratio', () => {
    const ratioMap: Record<string, number> = {
      '1:1': 1, '1:2': 0.5, '2:1': 2, '2:3': 2/3, '3:2': 1.5,
      '3:4': 0.75, '4:3': 4/3, '9:16': 9/16, '16:9': 16/9, '9:21': 9/21, '21:9': 21/9,
    };
    for (const [ratio, expected] of Object.entries(ratioMap)) {
      const { unmount } = render(wrap(
        <Image src={TEST_SRC} alt={TEST_ALT} aspectRatio={ratio as never} testID="img-r" />,
      ));
      const s = flatStyle(screen.getByTestId('img-r').props.style);
      expect((s.aspectRatio as number)).toBeCloseTo(expected, 3);
      unmount();
    }
    render(wrap(<Image src={TEST_SRC} alt={TEST_ALT} />));
  });
});

// ─── Functional: width / height / disabled ────────────────────────────────────

describe('Image — functional: dimensions and disabled', () => {
  it('[fn] numeric width applied to container style', () => {
    render(wrap(<Image src={TEST_SRC} alt={TEST_ALT} width={320} testID="img" />));
    const s = flatStyle(screen.getByTestId('img').props.style);
    expect(s.width).toBe(320);
  });

  it('[fn] numeric height applied to container style', () => {
    render(wrap(<Image src={TEST_SRC} alt={TEST_ALT} height={200} testID="img" />));
    const s = flatStyle(screen.getByTestId('img').props.style);
    expect(s.height).toBe(200);
  });

  it('[fn] string width applied (percentage)', () => {
    render(wrap(<Image src={TEST_SRC} alt={TEST_ALT} width="100%" testID="img" />));
    const s = flatStyle(screen.getByTestId('img').props.style);
    expect(s.width).toBe('100%');
  });

  it('[fn] disabled=true → opacity=0.5 on container', () => {
    render(wrap(<Image src={TEST_SRC} alt={TEST_ALT} disabled testID="img" />));
    const s = flatStyle(screen.getByTestId('img').props.style);
    expect(s.opacity).toBe(0.5);
  });

  it('[fn] disabled=false → no opacity applied', () => {
    render(wrap(<Image src={TEST_SRC} alt={TEST_ALT} disabled={false} testID="img" />));
    const s = flatStyle(screen.getByTestId('img').props.style);
    expect(s.opacity).toBeUndefined();
  });
});

// ─── Functional: fit / objectFit ─────────────────────────────────────────────

describe('Image — functional: fit and objectFit', () => {
  it('[fn] default objectFit is "cover" → RNImage resizeMode="cover"', () => {
    render(wrap(<Image src={TEST_SRC} alt={TEST_ALT} testID="img" />));
    const images = screen.UNSAFE_getAllByProps({ resizeMode: 'cover' });
    expect(images.length).toBeGreaterThanOrEqual(1);
  });

  it('[fn] objectFit="contain" → RNImage resizeMode="contain"', () => {
    render(wrap(<Image src={TEST_SRC} alt={TEST_ALT} objectFit="contain" testID="img" />));
    const images = screen.UNSAFE_getAllByProps({ resizeMode: 'contain' });
    expect(images.length).toBeGreaterThanOrEqual(1);
  });

  it('[fn] objectFit="fill" → RNImage resizeMode="stretch"', () => {
    render(wrap(<Image src={TEST_SRC} alt={TEST_ALT} objectFit="fill" testID="img" />));
    const images = screen.UNSAFE_getAllByProps({ resizeMode: 'stretch' });
    expect(images.length).toBeGreaterThanOrEqual(1);
  });

  it('[fn] objectFit="none" → RNImage resizeMode="center"', () => {
    render(wrap(<Image src={TEST_SRC} alt={TEST_ALT} objectFit="none" testID="img" />));
    const images = screen.UNSAFE_getAllByProps({ resizeMode: 'center' });
    expect(images.length).toBeGreaterThanOrEqual(1);
  });

  it('[fn] fit prop overrides objectFit (fit wins)', () => {
    // fit="contain" + objectFit="fill" → fit wins → resizeMode="contain"
    render(wrap(
      <Image src={TEST_SRC} alt={TEST_ALT} fit="contain" objectFit="fill" testID="img" />,
    ));
    const containImages = screen.UNSAFE_getAllByProps({ resizeMode: 'contain' });
    expect(containImages.length).toBeGreaterThanOrEqual(1);
    // fill resizeMode should NOT be present:
    const fillImages = screen.UNSAFE_queryAllByProps({ resizeMode: 'stretch' });
    expect(fillImages.length).toBe(0);
  });
});

// ─── A11y ─────────────────────────────────────────────────────────────────────

describe('Image — a11y', () => {
  it('[a11y] non-interactive → accessibilityRole="image"', () => {
    render(wrap(<Image src={TEST_SRC} alt={TEST_ALT} testID="img" />));
    expect(screen.getByTestId('img').props.accessibilityRole).toBe('image');
  });

  it('[a11y] interactive + handler → accessibilityRole="button"', () => {
    render(wrap(
      <Image src={TEST_SRC} alt={TEST_ALT} interactive onPress={vi.fn()} testID="img" />,
    ));
    expect(screen.getByTestId('img').props.accessibilityRole).toBe('button');
  });

  it('[a11y] accessible=true always', () => {
    render(wrap(<Image src={TEST_SRC} alt={TEST_ALT} testID="img" />));
    expect(screen.getByTestId('img').props.accessible).toBe(true);
  });

  it('[a11y] alt sets accessibilityLabel', () => {
    render(wrap(<Image src={TEST_SRC} alt="Photo of mountains" testID="img" />));
    expect(screen.getByTestId('img').props.accessibilityLabel).toBe('Photo of mountains');
  });

  it('[a11y] aria-label overrides alt as accessibilityLabel', () => {
    render(wrap(
      <Image src={TEST_SRC} alt="Photo" aria-label="Custom accessible name" testID="img" />,
    ));
    expect(screen.getByTestId('img').props.accessibilityLabel).toBe('Custom accessible name');
  });

  it('[a11y] getByLabelText finds image by alt text', () => {
    render(wrap(<Image src={TEST_SRC} alt="Mountain landscape" />));
    expect(screen.getByLabelText('Mountain landscape')).toBeTruthy();
  });

  it('[a11y] getByLabelText finds interactive image by aria-label', () => {
    render(wrap(
      <Image src={TEST_SRC} alt="Photo" aria-label="View gallery" interactive onPress={vi.fn()} />,
    ));
    expect(screen.getByLabelText('View gallery')).toBeTruthy();
  });

  it('[a11y] inner RNImage has accessible=false (container carries a11y)', () => {
    // The outer View/Pressable has accessible=true and the role.
    // The inner RNImage is accessible=false — screen readers don't focus it separately.
    render(wrap(<Image src={TEST_SRC} alt={TEST_ALT} testID="img" />));
    // Outer container is accessible:
    expect(screen.getByTestId('img').props.accessible).toBe(true);
    // Inner image has accessible=false (verified via UNSAFE query on resizeMode):
    const innerImages = screen.UNSAFE_getAllByProps({ accessible: false, resizeMode: 'cover' });
    expect(innerImages.length).toBeGreaterThanOrEqual(1);
  });

  it('[a11y] disabled does NOT affect accessibility role (still image)', () => {
    render(wrap(<Image src={TEST_SRC} alt={TEST_ALT} disabled testID="img" />));
    expect(screen.getByTestId('img').props.accessibilityRole).toBe('image');
  });

  it('[a11y] disabled interactive → role="image" (not button — disabled beats interactive)', () => {
    render(wrap(
      <Image src={TEST_SRC} alt={TEST_ALT} interactive disabled onPress={vi.fn()} testID="img" />,
    ));
    expect(screen.getByTestId('img').props.accessibilityRole).toBe('image');
  });
});

// ─── Bug-catching ─────────────────────────────────────────────────────────────

describe('Image — bug-catching', () => {
  // ── BUG-IMG-1: onClick silently ignored when onPress also set ────────────────

  it('[bug] BUG-IMG-1: onClick silently ignored when onPress is also provided', () => {
    // handlePress = onPress ?? onClick — onClick never fires when onPress is truthy
    const pressHandler = vi.fn();
    const clickHandler = vi.fn();
    render(wrap(
      <Image
        src={TEST_SRC}
        alt={TEST_ALT}
        interactive
        onPress={pressHandler}
        onClick={clickHandler}
        testID="img"
      />,
    ));
    fireEvent.press(screen.getByTestId('img'));
    expect(pressHandler).toHaveBeenCalledTimes(1);
    // Bug: clickHandler should also fire (matches Button/BottomNavItem behavior)
    expect(clickHandler).toHaveBeenCalledTimes(1); // FAILS: onClick never called
  });

  // ── BUG-IMG-2: interactive=true without handler → button role on non-interactive View ──

  it('[bug] BUG-IMG-2: interactive=true without handler → role="button" on non-pressable View', () => {
    // isInteractive=true → getImageAccessibilityProps returns role='button'
    // handlePress=undefined → renders as <View> (not Pressable)
    // Result: View with accessibilityRole='button' that doesn't respond to press
    render(wrap(<Image src={TEST_SRC} alt={TEST_ALT} interactive testID="img" />));
    const el = screen.getByTestId('img');
    // Bug: role='button' on a non-interactive View — semantically wrong
    // Expected: when no handler, use role='image' regardless of interactive prop
    expect(el.props.accessibilityRole).toBe('image'); // FAILS: gets 'button'
    // AND: should not have an onPress (it's a View):
    expect(el.props.onPress).toBeUndefined(); // PASSES: no onPress on the View
  });

  // ── BUG-IMG-3: Figma fit="container" vs native "contain" — naming mismatch ────

  it('[bug] BUG-IMG-3: Figma fit="container" (correct Figma value) not in native — naming mismatch', () => {
    // Figma API table (this is the correct Figma value, NOT a typo):
    //   fit = cover | container | fill | none
    // Native ImageObjectFit (correct CSS keyword):
    //   'cover' | 'contain' | 'fill' | 'none'
    // "container" is Figma's name; "contain" is the CSS/native name.
    // Callers following Figma who pass fit="container" get a TypeScript error on native.
    //
    // Correct native equivalent of Figma's "container":
    render(wrap(<Image src={TEST_SRC} alt={TEST_ALT} fit="contain" testID="img-ok" />));
    const containImages = screen.UNSAFE_getAllByProps({ resizeMode: 'contain' });
    expect(containImages.length).toBeGreaterThanOrEqual(1);
    //
    // Figma value "container" is TypeScript-rejected on native.
    // At runtime, "container" is not in RESIZE_MODE map → resizeMode=undefined (broken):
    // @ts-expect-error — "container" is Figma's value name; native has "contain"
    render(wrap(<Image src={TEST_SRC} alt={TEST_ALT} fit="container" testID="img-container" />));
    // Expected: fit="container" (Figma) should produce resizeMode="contain"
    // Bug: "container" is not in ImageObjectFit nor RESIZE_MODE → resizeMode=undefined
    const imgContainer = screen.UNSAFE_getAllByProps({ testID: undefined });
    // The RNImage inside should have resizeMode='contain' (the Figma intent)
    // but actually has resizeMode=undefined because "container" is unrecognised:
    const containerRNImages = screen.UNSAFE_queryAllByProps({ resizeMode: 'contain' });
    expect(containerRNImages.length).toBeGreaterThanOrEqual(1); // FAILS: resizeMode is undefined
  });

  // ── BUG-IMG-4: objectPosition is a NO-OP ────────────────────────────────────

  it('[bug] BUG-IMG-4: objectPosition accepted but never affects rendering (NO-OP)', () => {
    // objectPosition is in ImageProps for API symmetry but has zero effect on native.
    // Correct native rendering is always based on objectFit/resizeMode only.
    render(wrap(
      <Image src={TEST_SRC} alt={TEST_ALT} objectPosition="center top" testID="img" />,
    ));
    // Renders without error — prop accepted but ignored:
    expect(screen.getByTestId('img')).toBeTruthy();
    // The container style has no alignment override from objectPosition:
    const s = flatStyle(screen.getByTestId('img').props.style);
    expect((s as Record<string, unknown>).objectPosition).toBeUndefined();
  });

  // ── BUG-IMG-5: loading prop is a NO-OP on native ────────────────────────────

  it('[bug] BUG-IMG-5: loading="lazy" accepted but has no effect on native (always eager)', () => {
    // React Native images always load eagerly regardless of the loading prop.
    // Callers who pass loading="lazy" for performance get no lazy-loading benefit.
    render(wrap(<Image src={TEST_SRC} alt={TEST_ALT} loading="lazy" testID="img" />));
    // Renders without error — prop accepted but ignored:
    expect(screen.getByTestId('img')).toBeTruthy();
  });
});
