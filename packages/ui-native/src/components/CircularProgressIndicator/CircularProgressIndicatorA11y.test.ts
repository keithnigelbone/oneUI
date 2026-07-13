import { describe, expect, it } from 'vitest';
import {
  getCircularProgressIndicatorAccessibilityProps,
  useCircularProgressIndicatorState,
  CPI_SVG_STROKE_MAP,
  CPI_VIEWBOX,
} from './interface';

describe('circularProgressIndicatorA11y', () => {
  it('exposes role=progressbar with state.busy=true when indeterminate', () => {
    const state = useCircularProgressIndicatorState({ variant: 'indeterminate' });
    const a11y = getCircularProgressIndicatorAccessibilityProps(
      { 'aria-label': 'Loading' },
      state,
    );
    expect(a11y.accessible).toBe(true);
    expect(a11y.accessibilityRole).toBe('progressbar');
    expect(a11y.accessibilityLabel).toBe('Loading');
    expect(a11y.accessibilityState.busy).toBe(true);
    expect(a11y.accessibilityValue).toBeUndefined();
  });

  it('exposes accessibilityValue (min/max/now) on determinate', () => {
    const state = useCircularProgressIndicatorState({ value: 45 });
    const a11y = getCircularProgressIndicatorAccessibilityProps(
      { 'aria-label': 'Upload', min: 0, max: 100 },
      state,
    );
    expect(a11y.accessibilityState.busy).toBe(false);
    expect(a11y.accessibilityValue).toEqual({ min: 0, max: 100, now: 45 });
  });

  it('rounds the percentage for accessibilityValue.now', () => {
    const state = useCircularProgressIndicatorState({ value: 33.4 });
    const a11y = getCircularProgressIndicatorAccessibilityProps(
      { 'aria-label': 'Progress' },
      state,
    );
    expect(a11y.accessibilityValue?.now).toBe(33);
  });

  it('forwards aria-labelledby (and aria-describedby fallback) as accessibilityLabelledBy', () => {
    const state = useCircularProgressIndicatorState({ value: 10 });
    const a11y = getCircularProgressIndicatorAccessibilityProps(
      { 'aria-label': 'Bar', 'aria-labelledby': 'caption' },
      state,
    );
    expect(a11y.accessibilityLabelledBy).toBe('caption');

    const a11yFallback = getCircularProgressIndicatorAccessibilityProps(
      { 'aria-label': 'Bar', 'aria-describedby': 'desc' },
      state,
    );
    expect(a11yFallback.accessibilityLabelledBy).toBe('desc');
  });

  it('maps aria-live to accessibilityLiveRegion (off → none)', () => {
    const state = useCircularProgressIndicatorState({ value: 0 });
    const polite = getCircularProgressIndicatorAccessibilityProps(
      { 'aria-label': 'X', 'aria-live': 'polite' },
      state,
    );
    expect(polite.accessibilityLiveRegion).toBe('polite');
    const off = getCircularProgressIndicatorAccessibilityProps(
      { 'aria-label': 'X', 'aria-live': 'off' },
      state,
    );
    expect(off.accessibilityLiveRegion).toBe('none');
  });

  it('hides the subtree when aria-hidden=true', () => {
    const state = useCircularProgressIndicatorState({ value: 25 });
    const a11y = getCircularProgressIndicatorAccessibilityProps(
      { 'aria-label': 'X', 'aria-hidden': true },
      state,
    );
    expect(a11y.accessible).toBe(false);
    expect(a11y.accessibilityElementsHidden).toBe(true);
    expect(a11y.importantForAccessibility).toBe('no-hide-descendants');
  });

  it('passes accessibilityHint through unchanged', () => {
    const state = useCircularProgressIndicatorState({ value: 25 });
    const a11y = getCircularProgressIndicatorAccessibilityProps(
      { 'aria-label': 'X', accessibilityHint: 'Downloading file' },
      state,
    );
    expect(a11y.accessibilityHint).toBe('Downloading file');
  });
});

describe('useCircularProgressIndicatorState', () => {
  it('defaults variant=determinate, size=M, appearance=primary (auto), content=none', () => {
    const state = useCircularProgressIndicatorState({ value: 0 });
    expect(state.resolvedVariant).toBe('determinate');
    expect(state.resolvedSize).toBe('M');
    expect(state.resolvedAppearance).toBe('primary');
    expect(state.resolvedContent).toBe('none');
  });

  it('coerces variant=determinate without value into indeterminate', () => {
    const state = useCircularProgressIndicatorState({ variant: 'determinate' });
    expect(state.isIndeterminate).toBe(true);
    expect(state.resolvedVariant).toBe('indeterminate');
  });

  it('resolves auto appearance to primary (matches web)', () => {
    expect(
      useCircularProgressIndicatorState({ value: 10, appearance: 'auto' })
        .resolvedAppearance,
    ).toBe('primary');
    expect(
      useCircularProgressIndicatorState({ value: 10 }).resolvedAppearance,
    ).toBe('primary');
  });

  it('keeps explicit appearance roles', () => {
    expect(
      useCircularProgressIndicatorState({ value: 10, appearance: 'positive' })
        .resolvedAppearance,
    ).toBe('positive');
  });

  it('clamps value to [min, max] and normalises', () => {
    expect(useCircularProgressIndicatorState({ value: 150 }).percentage).toBe(100);
    expect(useCircularProgressIndicatorState({ value: -10 }).percentage).toBe(0);
    expect(useCircularProgressIndicatorState({ value: 25 }).percentage).toBe(25);
  });

  it('respects custom min/max ranges', () => {
    const state = useCircularProgressIndicatorState({ value: 5, min: 0, max: 10 });
    expect(state.percentage).toBe(50);
    expect(state.normalizedValue).toBe(0.5);
  });

  it('computes SVG geometry from the size-specific stroke width', () => {
    const xs = useCircularProgressIndicatorState({ value: 0, size: 'XS' });
    expect(xs.strokeWidth).toBe(CPI_SVG_STROKE_MAP.XS);
    expect(xs.center).toBe(CPI_VIEWBOX / 2);
    expect(xs.radius).toBe((CPI_VIEWBOX - CPI_SVG_STROKE_MAP.XS) / 2);
    expect(xs.circumference).toBeCloseTo(2 * Math.PI * xs.radius);
  });

  it('emits data attributes mirroring web `[data-*]` selectors', () => {
    const state = useCircularProgressIndicatorState({
      value: 25,
      size: '3XL',
      appearance: 'sparkle',
      content: 'text',
    });
    expect(state.dataAttrs).toEqual({
      'data-size': '3XL',
      'data-variant': 'determinate',
      'data-appearance': 'sparkle',
      'data-content': 'text',
    });
  });
});
