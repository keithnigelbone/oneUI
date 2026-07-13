import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { isLogoPressable, useLogoState } from './interface';

describe('Logo interactive state', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'development');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('sets data-interactive when interactive and not disabled', () => {
    const state = useLogoState({
      alt: 'Jio',
      svgContent: '<svg />',
      interactive: true,
      onPress: () => undefined,
    });
    expect(state.isInteractive).toBe(true);
    expect(state.dataAttrs['data-interactive']).toBe('true');
  });

  it('clears interactivity when disabled', () => {
    const state = useLogoState({
      alt: 'Jio',
      svgContent: '<svg />',
      interactive: true,
      disabled: true,
      onPress: () => undefined,
    });
    expect(state.isInteractive).toBe(false);
    expect(state.isDisabled).toBe(true);
    expect(isLogoPressable({ alt: 'Jio', onPress: () => undefined }, state)).toBe(false);
  });

  it('accepts onClick as a press handler', () => {
    const state = useLogoState({
      alt: 'Jio',
      svgContent: '<svg />',
      interactive: true,
      onClick: () => undefined,
    });
    expect(isLogoPressable({ alt: 'Jio', onClick: () => undefined }, state)).toBe(true);
  });

  it('warns when interactive without a handler', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    useLogoState({ alt: 'Jio', svgContent: '<svg />', interactive: true });
    expect(warn.mock.calls.some(([msg]) => String(msg).includes('onPress'))).toBe(true);
  });

  it('warns when interactive with decorative alt', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    useLogoState({
      alt: '',
      svgContent: '<svg />',
      interactive: true,
      onPress: () => undefined,
    });
    expect(warn.mock.calls.some(([msg]) => String(msg).includes('hidden from screen readers'))).toBe(
      true,
    );
  });

  it('warns when non-interactive with decorative alt', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    useLogoState({ alt: '', svgContent: '<svg />' });
    expect(warn.mock.calls.some(([msg]) => String(msg).includes('hidden from screen readers'))).toBe(
      true,
    );
  });

  it('does not warn when alt is meaningful', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    useLogoState({ alt: 'Jio', svgContent: '<svg />' });
    expect(warn).not.toHaveBeenCalled();
  });

  it('does not warn for decorative alt in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    useLogoState({ alt: '', svgContent: '<svg />' });
    expect(warn).not.toHaveBeenCalled();
  });
});
