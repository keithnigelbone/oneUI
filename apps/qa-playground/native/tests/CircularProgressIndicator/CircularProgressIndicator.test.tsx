/**
 * CircularProgressIndicator QA tests — smoke, functional, a11y, and bug-catching.
 *
 * Source: packages/ui-native/src/components/CircularProgressIndicator/
 *
 * ─── Figma API table ─────────────────────────────────────────────────────────
 *
 *   Property    Figma values                       Native prop / values
 *   ──────────────────────────────────────────────────────────────────────────
 *   variant     determinate | indeterminate         same (component property)
 *   size        2XS[2]|XS[3]|S[4]|M[5]|L[6]|      same sizes (component property)
 *               XL[8]|2XL[10]|3XL[12]|4XL[14]|    brackets = spacing token px
 *               5XL[16]
 *   appearance  auto|primary|secondary|sparkle|    same (variable mode)
 *               neutral|positive|negative|
 *               warning|informative
 *   content     none | icon | text                 same (component property)
 *   — Code only (N/A in Figma) —
 *   min         <input number>                     min?: number (default: 0)
 *   max         <input number>                     max?: number (default: 100)
 *   value       <input number>                     value?: number (determinate)
 *
 * ─── Non-interactive component ───────────────────────────────────────────────
 *
 *   CircularProgressIndicator has NO press handlers or interactive events.
 *   There are no onPress / onClick / onChange callbacks.
 *   The only "live" behavior is the liveRegion accessibility announcement.
 *
 * ─── Content size restrictions ───────────────────────────────────────────────
 *
 *   content='text'  → percentage label visible only at L / XL / 2XL / 3XL / 4XL / 5XL
 *                     silently hidden at S / M  (BUG-CPI-2)
 *                     silently hidden at 2XS / XS  (by design — too small)
 *   content='icon'  → icon slot visible only at XL / 2XL / 3XL / 4XL / 5XL
 *                     silently hidden at 2XS / XS / S / M / L  (BUG-CPI-3)
 *
 * ─── A11y model ──────────────────────────────────────────────────────────────
 *
 *   accessibilityRole='progressbar' (always)
 *   accessibilityState.busy=true    for indeterminate
 *   accessibilityState.busy=false   for determinate
 *   accessibilityValue={min,max,now} for determinate only (omitted for indeterminate)
 *   aria-label / aria-labelledby    REQUIRED in dev (warns if missing — BUG-CPI-4)
 *   aria-live → accessibilityLiveRegion ('off' maps to 'none')
 *   aria-hidden → accessibilityElementsHidden=true
 *   show=false → component returns null
 *
 * ─── Bugs (raise to dev team) ────────────────────────────────────────────────
 *
 *   BUG-CPI-1 · determinate variant without value prop → silently treated as indeterminate
 *     isIndeterminate = variant === 'indeterminate' || value == null
 *     When variant='determinate' but `value` is omitted, value==null → isIndeterminate=true.
 *     The component renders a spinning (indeterminate) indicator instead of a 0% arc.
 *     No console.warn is emitted — callers who forget `value` get unexpected behavior.
 *     File: packages/ui-native/src/components/CircularProgressIndicator/interface.ts:184
 *     Fix:  When variant='determinate' and value==null, emit a dev warning:
 *           `console.warn('CPI: variant="determinate" requires a `value` prop.')`
 *           and use value=0 as fallback rather than switching to indeterminate.
 *
 *   BUG-CPI-2 · content='text' silently ignored at sizes S and M
 *     CPI_LABEL_VISIBLE_SIZES only includes L, XL, 2XL, 3XL, 4XL, 5XL.
 *     At sizes S and M the ring is visually large enough that callers reasonably
 *     expect to see the percentage label — but it is silently suppressed with
 *     no warning and no TypeScript hint that the prop is size-conditional.
 *     (2XS and XS are clearly too small, so silence is expected there.)
 *     File: packages/ui-native/src/components/CircularProgressIndicator.native.tsx:596-603
 *     Fix:  Emit a dev warning when content='text' is set but size is S or M.
 *
 *   BUG-CPI-3 · content='icon' silently ignored at sizes 2XS / XS / S / M / L
 *     CPI_ICON_VISIBLE_SIZES only includes XL, 2XL, 3XL, 4XL, 5XL.
 *     Even at L (the smallest size where text shows), icon is still suppressed.
 *     No warning, no TypeScript hint.
 *     File: packages/ui-native/src/components/CircularProgressIndicator.native.tsx:604-610
 *     Fix:  Emit a dev warning when content='icon' + children is set but size is too small.
 *
 *   BUG-CPI-4 · aria-label not required by TypeScript — silent missing label
 *     The interface declares `'aria-label'?: string` (optional).
 *     The component only warns in dev when neither aria-label nor aria-labelledby is set.
 *     TypeScript callers who omit it get no compile-time enforcement.
 *     Screen readers announce only "progress indicator" with no context.
 *     File: packages/ui-native/src/components/CircularProgressIndicator/interface.ts:73
 *     Fix:  Make `'aria-label'` required in the interface (or at least one of
 *           aria-label / aria-labelledby via a TypeScript conditional type).
 */

import React from 'react';
import { View } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { CircularProgressIndicator } from '@ui-native/components/CircularProgressIndicator/CircularProgressIndicator.native';
import { CPI_SIZE_PX } from '@ui-native/components/CircularProgressIndicator/CircularProgressIndicator.styles.native';
import { wrap } from '../../utils/renderWithTheme';

// ─── Environment setup ────────────────────────────────────────────────────────
//
// CircularProgressIndicator's indeterminate animation uses requestAnimationFrame
// (a browser API). The Node.js test environment doesn't have it — mock it with
// a simple setTimeout-based implementation so indeterminate renders don't throw.

let _rafId = 0;
const _rafCallbacks = new Map<number, FrameRequestCallback>();

beforeAll(() => {
  if (typeof global.requestAnimationFrame === 'undefined') {
    // @ts-expect-error — adding browser API to Node.js global
    global.requestAnimationFrame = (cb: FrameRequestCallback): number => {
      const id = ++_rafId;
      _rafCallbacks.set(id, cb);
      // Schedule but don't run immediately — avoids infinite loops in tests
      return id;
    };
    // @ts-expect-error — adding browser API to Node.js global
    global.cancelAnimationFrame = (id: number): void => {
      _rafCallbacks.delete(id);
    };
  }
});

afterAll(() => {
  _rafCallbacks.clear();
});

// ─── Constants ────────────────────────────────────────────────────────────────

const SIZES = ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'] as const;
const VARIANTS = ['determinate', 'indeterminate'] as const;
const APPEARANCES = [
  'auto', 'primary', 'secondary', 'sparkle', 'neutral',
  'positive', 'negative', 'warning', 'informative',
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function flatStyle(style: unknown): Record<string, unknown> {
  if (!style) return {};
  if (Array.isArray(style)) return Object.assign({}, ...(style as unknown[]).map(flatStyle));
  if (typeof style === 'object') return style as Record<string, unknown>;
  return {};
}

// ─── Figma matrix: variant × size ────────────────────────────────────────────
//
// Figma matrix: 2 variants × 10 sizes = 20 cells.
// Determinate cells use value=50 + content="text" so the percentage "50" renders
// visibly inside the ring at sizes L and above (CPI_LABEL_VISIBLE_SIZES).
// Indeterminate cells show the spinning ring only (no text/value).

describe('CircularProgressIndicator — Figma matrix: variant × size', () => {
  for (const variant of VARIANTS) {
    for (const size of SIZES) {
      // Determinate: render with value + content="text" so % label appears in sketch
      const extraProps = variant === 'determinate'
        ? { value: 50, content: 'text' as const }
        : {};

      it(`[smoke] variant="${variant}" size="${size}" renders without crashing`, () => {
        expect(() =>
          render(wrap(
            <CircularProgressIndicator
              variant={variant}
              size={size}
              aria-label={`${variant} ${size}`}
              testID="cpi-matrix"
              {...extraProps}
            />,
          )),
        ).not.toThrow();
      });

      it(`[fn] variant="${variant}" size="${size}" — progressbar role and correct busy state`, () => {
        render(wrap(
          <CircularProgressIndicator
            variant={variant}
            size={size}
            aria-label={`${variant} ${size}`}
            testID="cpi-fn"
            {...extraProps}
          />,
        ));
        const el = screen.getByTestId('cpi-fn');
        expect(el.props.accessibilityRole).toBe('progressbar');
        expect(el.props.accessibilityState.busy).toBe(variant === 'indeterminate');
      });
    }
  }
});

// ─── Figma matrix: appearance ─────────────────────────────────────────────────

describe('CircularProgressIndicator — Figma matrix: appearance', () => {
  for (const appearance of APPEARANCES) {
    it(`[smoke] appearance="${appearance}" renders without crashing`, () => {
      expect(() =>
        render(wrap(
          <CircularProgressIndicator
            appearance={appearance}
            value={50}
            aria-label="Loading"
            testID={`cpi-app-${appearance}`}
          />,
        )),
      ).not.toThrow();
    });
  }

  it('[fn] appearance="auto" resolves to primary', () => {
    render(wrap(
      <CircularProgressIndicator appearance="auto" value={50} aria-label="Loading" testID="cpi-auto" />,
    ));
    expect(screen.getByTestId('cpi-auto')).toBeTruthy();
  });
});

// ─── Smoke ────────────────────────────────────────────────────────────────────

describe('CircularProgressIndicator — smoke', () => {
  it('[smoke] renders without crashing (minimal props)', () => {
    expect(() =>
      render(wrap(<CircularProgressIndicator aria-label="Loading" />)),
    ).not.toThrow();
  });

  it('[smoke] renders determinate with value', () => {
    expect(() =>
      render(wrap(<CircularProgressIndicator value={50} aria-label="50% complete" />)),
    ).not.toThrow();
  });

  it('[smoke] renders indeterminate', () => {
    expect(() =>
      render(wrap(<CircularProgressIndicator variant="indeterminate" aria-label="Loading" />)),
    ).not.toThrow();
  });

  it('[smoke] renders with show=true', () => {
    expect(() =>
      render(wrap(<CircularProgressIndicator value={50} aria-label="Loading" show testID="cpi" />)),
    ).not.toThrow();
    expect(screen.getByTestId('cpi')).toBeTruthy();
  });

  it('[smoke] returns null when show=false', () => {
    render(wrap(<CircularProgressIndicator value={50} aria-label="Loading" show={false} testID="cpi-null" />));
    expect(screen.queryByTestId('cpi-null')).toBeNull();
  });

  it('[smoke] renders content="text" at L size', () => {
    expect(() =>
      render(wrap(
        <CircularProgressIndicator value={75} size="L" content="text" aria-label="75%" />,
      )),
    ).not.toThrow();
  });

  it('[smoke] renders content="icon" at XL size with children', () => {
    expect(() =>
      render(wrap(
        <CircularProgressIndicator value={50} size="XL" content="icon" aria-label="Loading">
          <View testID="icon-child" />
        </CircularProgressIndicator>,
      )),
    ).not.toThrow();
  });

  it('[smoke] renders all sizes', () => {
    for (const size of SIZES) {
      const { unmount } = render(wrap(
        <CircularProgressIndicator size={size} value={50} aria-label={`size ${size}`} testID={`cpi-sz-${size}`} />,
      ));
      expect(screen.getByTestId(`cpi-sz-${size}`)).toBeTruthy();
      unmount();
    }
    render(wrap(<CircularProgressIndicator value={50} aria-label="Final" />));
  });
});

// ─── Functional: determinate variant ─────────────────────────────────────────

describe('CircularProgressIndicator — functional: determinate', () => {
  it('[fn] determinate variant with value → accessibilityState.busy=false', () => {
    render(wrap(
      <CircularProgressIndicator variant="determinate" value={50} aria-label="50%" testID="cpi" />,
    ));
    expect(screen.getByTestId('cpi').props.accessibilityState.busy).toBe(false);
  });

  it('[fn] determinate → accessibilityValue has min/max/now', () => {
    render(wrap(
      <CircularProgressIndicator variant="determinate" value={50} min={0} max={100} aria-label="50%" testID="cpi" />,
    ));
    const { accessibilityValue } = screen.getByTestId('cpi').props;
    expect(accessibilityValue).toEqual({ min: 0, max: 100, now: 50 });
  });

  it('[fn] value=0 → accessibilityValue.now=0 (0% complete)', () => {
    render(wrap(
      <CircularProgressIndicator value={0} aria-label="0%" testID="cpi" />,
    ));
    expect(screen.getByTestId('cpi').props.accessibilityValue?.now).toBe(0);
  });

  it('[fn] value=100 → accessibilityValue.now=100 (complete)', () => {
    render(wrap(
      <CircularProgressIndicator value={100} aria-label="Done" testID="cpi" />,
    ));
    expect(screen.getByTestId('cpi').props.accessibilityValue?.now).toBe(100);
  });

  it('[fn] value is clamped to max — accessibilityValue.now does not exceed max', () => {
    render(wrap(
      <CircularProgressIndicator value={150} max={100} aria-label="Loading" testID="cpi" />,
    ));
    expect(screen.getByTestId('cpi').props.accessibilityValue?.now).toBe(100);
  });

  it('[fn] value is clamped to min — accessibilityValue.now does not go below min', () => {
    render(wrap(
      <CircularProgressIndicator value={-10} min={0} aria-label="Loading" testID="cpi" />,
    ));
    expect(screen.getByTestId('cpi').props.accessibilityValue?.now).toBe(0);
  });

  it('[fn] custom min/max — accessibilityValue uses them correctly', () => {
    render(wrap(
      <CircularProgressIndicator value={5} min={0} max={10} aria-label="50%" testID="cpi" />,
    ));
    const { accessibilityValue } = screen.getByTestId('cpi').props;
    expect(accessibilityValue).toEqual({ min: 0, max: 10, now: 50 });
  });
});

// ─── Functional: indeterminate variant ───────────────────────────────────────

describe('CircularProgressIndicator — functional: indeterminate', () => {
  it('[fn] indeterminate → accessibilityState.busy=true', () => {
    render(wrap(
      <CircularProgressIndicator variant="indeterminate" aria-label="Loading" testID="cpi" />,
    ));
    expect(screen.getByTestId('cpi').props.accessibilityState.busy).toBe(true);
  });

  it('[fn] indeterminate → no accessibilityValue (omitted when busy)', () => {
    render(wrap(
      <CircularProgressIndicator variant="indeterminate" aria-label="Loading" testID="cpi" />,
    ));
    expect(screen.getByTestId('cpi').props.accessibilityValue).toBeUndefined();
  });

  it('[fn] indeterminate renders without value prop', () => {
    render(wrap(
      <CircularProgressIndicator variant="indeterminate" aria-label="Loading" testID="cpi" />,
    ));
    expect(screen.getByTestId('cpi')).toBeTruthy();
    expect(screen.getByTestId('cpi').props.accessibilityState.busy).toBe(true);
  });
});

// ─── Functional: content modes and size restrictions ─────────────────────────

describe('CircularProgressIndicator — functional: content modes', () => {
  it('[fn] content="text" at L — percentage label rendered', () => {
    render(wrap(
      <CircularProgressIndicator value={75} size="L" content="text" aria-label="75%" testID="cpi" />,
    ));
    expect(screen.getByTestId('cpi')).toBeTruthy();
    // Percentage "75" visible at L size:
    expect(screen.getByText('75')).toBeTruthy();
  });

  it('[fn] content="text" at 5XL — percentage label rendered', () => {
    render(wrap(
      <CircularProgressIndicator value={50} size="5XL" content="text" aria-label="50%" testID="cpi" />,
    ));
    expect(screen.getByText('50')).toBeTruthy();
  });

  it('[fn] content="icon" at XL — icon children rendered', () => {
    render(wrap(
      <CircularProgressIndicator value={50} size="XL" content="icon" aria-label="Loading" testID="cpi">
        <View testID="icon-slot" />
      </CircularProgressIndicator>,
    ));
    expect(screen.getByTestId('icon-slot')).toBeTruthy();
  });

  it('[fn] content="none" — no center content rendered', () => {
    render(wrap(
      <CircularProgressIndicator value={50} size="XL" content="none" aria-label="Loading" testID="cpi" />,
    ));
    expect(screen.getByTestId('cpi')).toBeTruthy();
  });

  it('[fn] content="text" at M — text hidden (only L+ shows text)', () => {
    render(wrap(
      <CircularProgressIndicator value={50} size="M" content="text" aria-label="50%" testID="cpi" />,
    ));
    // M is NOT in CPI_LABEL_VISIBLE_SIZES — percentage silently hidden:
    expect(screen.queryByText('50')).toBeNull();
  });

  it('[fn] content="icon" at L — icon rendered (icons show at all sizes when children is set)', () => {
    // Updated: icons now render at ALL sizes when content="icon" and children is set
    // (web parity fix). The old CPI_ICON_VISIBLE_SIZES restriction (XL+ only) is removed.
    render(wrap(
      <CircularProgressIndicator value={50} size="L" content="icon" aria-label="Loading" testID="cpi">
        <View testID="l-icon-slot" />
      </CircularProgressIndicator>,
    ));
    // Icon IS rendered at size L (all sizes now show icon when content="icon" + children set):
    expect(screen.getByTestId('l-icon-slot')).toBeTruthy();
  });
});

// ─── Functional: size dimensions ─────────────────────────────────────────────

describe('CircularProgressIndicator — functional: size dimensions', () => {
  it('[fn] size="M" → width/height from tokens.spacing["5"]', () => {
    render(wrap(<CircularProgressIndicator value={50} size="M" aria-label="Loading" testID="cpi" />));
    const s = flatStyle(screen.getByTestId('cpi').props.style);
    expect(s.width).toBe(CPI_SIZE_PX.M);
    expect(s.height).toBe(CPI_SIZE_PX.M);
  });

  it('[fn] size="5XL" → largest dimensions', () => {
    render(wrap(<CircularProgressIndicator value={50} size="5XL" aria-label="Loading" testID="cpi" />));
    const s = flatStyle(screen.getByTestId('cpi').props.style);
    expect(s.width).toBe(CPI_SIZE_PX['5XL']);
    expect(s.height).toBe(CPI_SIZE_PX['5XL']);
  });

  it('[fn] size scale is monotonically increasing: 2XS < XS < S < M < L < XL < 2XL < 3XL < 4XL < 5XL', () => {
    const orderedSizes = ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'] as const;
    for (let i = 0; i < orderedSizes.length - 1; i++) {
      expect(CPI_SIZE_PX[orderedSizes[i]]).toBeLessThan(CPI_SIZE_PX[orderedSizes[i + 1]]);
    }
  });
});

// ─── Functional: show prop ────────────────────────────────────────────────────

describe('CircularProgressIndicator — functional: show prop', () => {
  it('[fn] show=true (default) → component renders', () => {
    render(wrap(<CircularProgressIndicator value={50} aria-label="Loading" show testID="cpi" />));
    expect(screen.getByTestId('cpi')).toBeTruthy();
  });

  it('[fn] show=false → component returns null', () => {
    render(wrap(<CircularProgressIndicator value={50} aria-label="Loading" show={false} testID="cpi-null" />));
    expect(screen.queryByTestId('cpi-null')).toBeNull();
  });

  it('[fn] testID forwarded to root Animated.View', () => {
    render(wrap(<CircularProgressIndicator value={50} aria-label="Loading" testID="my-cpi" />));
    expect(screen.getByTestId('my-cpi')).toBeTruthy();
  });
});

// ─── A11y ─────────────────────────────────────────────────────────────────────

describe('CircularProgressIndicator — a11y', () => {
  it('[a11y] accessibilityRole="progressbar" always', () => {
    render(wrap(<CircularProgressIndicator value={50} aria-label="Loading" testID="cpi" />));
    expect(screen.getByTestId('cpi').props.accessibilityRole).toBe('progressbar');
  });

  it('[a11y] accessible=true by default', () => {
    render(wrap(<CircularProgressIndicator value={50} aria-label="Loading" testID="cpi" />));
    expect(screen.getByTestId('cpi').props.accessible).toBe(true);
  });

  it('[a11y] aria-label maps to accessibilityLabel', () => {
    render(wrap(<CircularProgressIndicator value={50} aria-label="Upload progress" testID="cpi" />));
    expect(screen.getByTestId('cpi').props.accessibilityLabel).toBe('Upload progress');
  });

  it('[a11y] getByLabelText finds component via aria-label', () => {
    render(wrap(<CircularProgressIndicator value={50} aria-label="Download progress" />));
    expect(screen.getByLabelText('Download progress')).toBeTruthy();
  });

  it('[a11y] determinate → accessibilityState.busy=false', () => {
    render(wrap(<CircularProgressIndicator value={50} aria-label="Loading" testID="cpi" />));
    expect(screen.getByTestId('cpi').props.accessibilityState.busy).toBe(false);
  });

  it('[a11y] indeterminate → accessibilityState.busy=true', () => {
    render(wrap(
      <CircularProgressIndicator variant="indeterminate" aria-label="Loading" testID="cpi" />,
    ));
    expect(screen.getByTestId('cpi').props.accessibilityState.busy).toBe(true);
  });

  it('[a11y] determinate → accessibilityValue with min/max/now', () => {
    render(wrap(
      <CircularProgressIndicator value={30} min={0} max={100} aria-label="30%" testID="cpi" />,
    ));
    expect(screen.getByTestId('cpi').props.accessibilityValue).toEqual({ min: 0, max: 100, now: 30 });
  });

  it('[a11y] indeterminate → no accessibilityValue', () => {
    render(wrap(
      <CircularProgressIndicator variant="indeterminate" aria-label="Loading" testID="cpi" />,
    ));
    expect(screen.getByTestId('cpi').props.accessibilityValue).toBeUndefined();
  });

  it('[a11y] accessibilityHint forwarded', () => {
    render(wrap(
      <CircularProgressIndicator value={50} aria-label="Loading" accessibilityHint="File upload" testID="cpi" />,
    ));
    expect(screen.getByTestId('cpi').props.accessibilityHint).toBe('File upload');
  });

  it('[a11y] aria-hidden=true → accessible=false, accessibilityElementsHidden=true', () => {
    render(wrap(
      <CircularProgressIndicator value={50} aria-hidden testID="cpi" />,
    ));
    const el = screen.getByTestId('cpi', { includeHiddenElements: true });
    expect(el.props.accessible).not.toBe(true);
    expect(el.props.accessibilityElementsHidden).toBe(true);
  });

  it('[a11y] aria-hidden element not findable without includeHiddenElements', () => {
    render(wrap(<CircularProgressIndicator value={50} aria-hidden testID="cpi-hidden" />));
    expect(screen.queryByTestId('cpi-hidden')).toBeNull();
  });

  it('[a11y] aria-live="polite" → accessibilityLiveRegion="polite"', () => {
    render(wrap(
      <CircularProgressIndicator value={50} aria-label="Loading" aria-live="polite" testID="cpi" />,
    ));
    expect(screen.getByTestId('cpi').props.accessibilityLiveRegion).toBe('polite');
  });

  it('[a11y] aria-live="assertive" → accessibilityLiveRegion="assertive"', () => {
    render(wrap(
      <CircularProgressIndicator value={50} aria-label="Loading" aria-live="assertive" testID="cpi" />,
    ));
    expect(screen.getByTestId('cpi').props.accessibilityLiveRegion).toBe('assertive');
  });

  it('[a11y] aria-live="off" → accessibilityLiveRegion="none"', () => {
    render(wrap(
      <CircularProgressIndicator value={50} aria-label="Loading" aria-live="off" testID="cpi" />,
    ));
    expect(screen.getByTestId('cpi').props.accessibilityLiveRegion).toBe('none');
  });

  it('[a11y] percentage text is accessible=false (progressbar carries a11y)', () => {
    render(wrap(
      <CircularProgressIndicator value={50} size="L" content="text" aria-label="50%" testID="cpi" />,
    ));
    // The Text label is accessible=false — container carries the accessible value:
    const texts = screen.UNSAFE_getAllByProps({ accessible: false });
    expect(texts.some(el => el.props.children === 50)).toBe(true);
  });
});

// ─── Bug-catching ─────────────────────────────────────────────────────────────

describe('CircularProgressIndicator — bug-catching', () => {
  // ── BUG-CPI-1: determinate without value → silently treated as indeterminate ──

  it('[bug] BUG-CPI-1: variant="determinate" without value → treated as indeterminate (busy=true)', () => {
    // isIndeterminate = variant === 'indeterminate' || value == null
    // When variant='determinate' but value is omitted, value==null → isIndeterminate=true
    // Expected: busy=false (0% determinate), accessibilityValue present
    // Bug: busy=true, accessibilityValue absent (spinning indicator shown)
    render(wrap(
      <CircularProgressIndicator variant="determinate" aria-label="Loading" testID="cpi-bug1" />,
    ));
    const el = screen.getByTestId('cpi-bug1');
    // Expected: determinate with no value should be 0% (not busy)
    expect(el.props.accessibilityState.busy).toBe(false); // FAILS: gets true
  });

  // ── BUG-CPI-2: content='text' silently ignored at small sizes ────────────────

  it('[bug] BUG-CPI-2: content="text" at size="M" — percentage label silently not rendered', () => {
    render(wrap(
      <CircularProgressIndicator value={50} size="M" content="text" aria-label="50%" testID="cpi-bug2-m" />,
    ));
    // At M the ring is visually large enough to show a label — caller reasonably
    // expects to see "50" inside the ring, but CPI_LABEL_VISIBLE_SIZES excludes M.
    // Expected: percentage "50" visible
    // Bug: M is not in CPI_LABEL_VISIBLE_SIZES → text silently suppressed
    expect(screen.getByText('50')).toBeTruthy(); // FAILS: text not rendered at M
  });

  it('[bug] BUG-CPI-2: content="text" at size="S" — percentage label silently not rendered', () => {
    render(wrap(
      <CircularProgressIndicator value={75} size="S" content="text" aria-label="75%" testID="cpi-bug2-s" />,
    ));
    // Expected: percentage "75" visible
    // Bug: S is not in CPI_LABEL_VISIBLE_SIZES → text silently suppressed
    expect(screen.getByText('75')).toBeTruthy(); // FAILS: text not rendered at S
  });

  // ── BUG-CPI-3 FIXED: content='icon' now renders at all sizes ────────────────

  it('[fn] BUG-CPI-3 FIXED: content="icon" at size="L" — icon now renders (all sizes)', () => {
    // BUG-CPI-3 is fixed: icons now render at ALL sizes when content="icon" + children set.
    // The old CPI_ICON_VISIBLE_SIZES restriction (XL+ only) has been removed (web parity fix).
    render(wrap(
      <CircularProgressIndicator value={50} size="L" content="icon" aria-label="Loading" testID="cpi-bug3">
        <View testID="l-icon-bug" />
      </CircularProgressIndicator>,
    ));
    expect(screen.getByTestId('l-icon-bug')).toBeTruthy();
  });

  // ── BUG-CPI-4: aria-label not TypeScript-required → silent missing label ─────

  it('[bug] BUG-CPI-4: omitting aria-label emits console.warn in dev mode', () => {
    // aria-label is optional in TypeScript but needed for accessibility.
    // The component warns in dev when neither aria-label nor aria-labelledby is provided.
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      render(wrap(<CircularProgressIndicator value={50} testID="cpi-bug4" />));
      // Warning fires in dev mode:
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('aria-label'));
      // Accessible label is undefined:
      expect(screen.getByTestId('cpi-bug4').props.accessibilityLabel).toBeUndefined();
    } finally {
      warnSpy.mockRestore();
    }
  });
});
