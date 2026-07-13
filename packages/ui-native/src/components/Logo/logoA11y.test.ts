import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getLogoAccessibilityProps,
  isLogoDecorative,
  isLogoPressable,
  LOGO_DECORATIVE_A11Y,
  useLogoState,
} from './interface';

describe('isLogoDecorative', () => {
  it('treats empty and whitespace-only alt as decorative', () => {
    expect(isLogoDecorative('')).toBe(true);
    expect(isLogoDecorative('   ')).toBe(true);
    expect(isLogoDecorative('\n\t')).toBe(true);
  });

  it('treats non-empty alt as meaningful', () => {
    expect(isLogoDecorative('Jio')).toBe(false);
    expect(isLogoDecorative('  Jio  ')).toBe(false);
  });
});

describe('getLogoAccessibilityProps', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'development');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('maps alt to accessibilityLabel with image role', () => {
    const state = useLogoState({ alt: 'Jio Brand Logo', svgContent: '<svg />' });
    const props = getLogoAccessibilityProps({ alt: 'Jio Brand Logo' }, state);
    expect(props.accessible).toBe(true);
    if (!props.accessible) return;
    expect(props.accessibilityLabel).toBe('Jio Brand Logo');
    expect(props.accessibilityRole).toBe('image');
    expect((props as { 'aria-label'?: string })['aria-label']).toBeUndefined();
  });

  it('trims meaningful alt for accessibilityLabel', () => {
    const state = useLogoState({ alt: '  Jio Brand Logo  ', svgContent: '<svg />' });
    const props = getLogoAccessibilityProps({ alt: '  Jio Brand Logo  ' }, state);
    expect(props.accessible).toBe(true);
    if (!props.accessible) return;
    expect(props.accessibilityLabel).toBe('Jio Brand Logo');
  });

  it('uses button role when interactive with a press handler', () => {
    const state = useLogoState({
      alt: 'Jio home',
      svgContent: '<svg />',
      interactive: true,
      onPress: () => undefined,
    });
    expect(isLogoPressable({ alt: 'Jio home', onPress: () => undefined }, state)).toBe(true);
    const a11y = getLogoAccessibilityProps(
      { alt: 'Jio home', onPress: () => undefined },
      { ...state, isPressable: true },
    );
    expect(a11y.accessible).toBe(true);
    if (!a11y.accessible) return;
    expect(a11y.accessibilityRole).toBe('button');
  });

  it('stays image role when interactive without onPress', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const state = useLogoState({ alt: 'Jio', svgContent: '<svg />', interactive: true });
    expect(isLogoPressable({ alt: 'Jio' }, state)).toBe(false);
    const a11y = getLogoAccessibilityProps({ alt: 'Jio' }, state);
    expect(a11y.accessible).toBe(true);
    if (!a11y.accessible) return;
    expect(a11y.accessibilityRole).toBe('image');
  });

  it('hides decorative logos when alt is empty', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const state = useLogoState({ alt: '', svgContent: '<svg />' });
    expect(getLogoAccessibilityProps({ alt: '' }, state)).toEqual(LOGO_DECORATIVE_A11Y);
    expect(getLogoAccessibilityProps({ alt: '   ' }, state)).toEqual(LOGO_DECORATIVE_A11Y);
  });

  it('does not expose an empty accessibilityLabel', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const state = useLogoState({ alt: '', svgContent: '<svg />' });
    const props = getLogoAccessibilityProps({ alt: '' }, state);
    expect(props).not.toHaveProperty('accessibilityLabel');
    expect(props.accessible).toBe(false);
  });

  it('ignores accessibilityHint when alt is decorative', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const state = useLogoState({ alt: '', svgContent: '<svg />' });
    const props = getLogoAccessibilityProps(
      {
        alt: '',
        accessibilityHint: 'Opens home',
      },
      state,
    );
    expect(props).toEqual(LOGO_DECORATIVE_A11Y);
  });

  it('passes accessibilityHint when provided', () => {
    const state = useLogoState({ alt: 'Jio', svgContent: '<svg />' });
    const props = getLogoAccessibilityProps(
      {
        alt: 'Jio',
        accessibilityHint: 'Opens home',
      },
      state,
    );
    expect(props.accessible).toBe(true);
    if (!props.accessible) return;
    expect(props.accessibilityHint).toBe('Opens home');
  });
});

describe('LOGO_DECORATIVE_A11Y', () => {
  it('hides decorative children from the accessibility tree', () => {
    expect(LOGO_DECORATIVE_A11Y.accessible).toBe(false);
    expect(LOGO_DECORATIVE_A11Y.accessibilityElementsHidden).toBe(true);
  });
});
