import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveLogoSize } from './interface';
import { resolveSize, SIZE_PX } from './Logo.styles.native';

describe('resolveLogoSize', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'development');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it.each([
    ['xs', 'xs'],
    ['m', 'm'],
    ['xl', 'xl'],
    ['custom', 'custom'],
    ['XS', 'xs'],
    ['S', 's'],
    ['M', 'm'],
    ['L', 'l'],
    ['XL', 'xl'],
    ['CUSTOM', 'custom'],
  ] as const)('canonicalises %s → %s', (input, expected) => {
    expect(resolveLogoSize(input)).toBe(expected);
  });

  it('defaults to m when size is omitted', () => {
    expect(resolveLogoSize()).toBe('m');
    expect(resolveLogoSize(undefined)).toBe('m');
  });

  it('warns and falls back to m for unknown size tokens', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(resolveLogoSize('XXL' as 'xl')).toBe('m');
    expect(warn.mock.calls[0]?.[0]).toMatch(/size="XXL"/);
  });

  it('does not warn in production for unknown sizes', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(resolveLogoSize('XXL' as 'xl')).toBe('m');
    expect(warn).not.toHaveBeenCalled();
  });
});

describe('resolveLogoSize + resolveSize integration', () => {
  it('maps Figma XL to the same px as lowercase xl', () => {
    expect(resolveSize(resolveLogoSize('XL'))).toBe(resolveSize('xl'));
    expect(resolveSize(resolveLogoSize('XS'))).toBe(resolveSize('xs'));
  });
});

describe('resolveSize', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'development');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it('returns preset dimensions for t-shirt sizes', () => {
    expect(resolveSize('xs')).toBe(SIZE_PX.xs);
    expect(resolveSize('m')).toBe(SIZE_PX.m);
    expect(resolveSize('xl')).toBe(SIZE_PX.xl);
  });

  it('uses customSize when size is custom', () => {
    expect(resolveSize('custom', 48)).toBe(48);
    expect(resolveSize('custom', 96.5)).toBe(96.5);
  });

  it('warns and falls back to m when size is custom without customSize', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(resolveSize('custom')).toBe(SIZE_PX.m);
    expect(resolveSize('custom', undefined)).toBe(SIZE_PX.m);
    expect(warn).toHaveBeenCalledWith(
      '[Logo] size="custom" requires a positive `customSize` (pixels). Falling back to size "m".',
    );
  });

  it('warns and falls back to m for invalid customSize values', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(resolveSize('custom', 0)).toBe(SIZE_PX.m);
    expect(resolveSize('custom', -12)).toBe(SIZE_PX.m);
    expect(resolveSize('custom', Number.NaN)).toBe(SIZE_PX.m);
    expect(warn.mock.calls[0]?.[0]).toMatch(/customSize must be a positive finite number/);
  });

  it('does not warn in production', () => {
    vi.stubEnv('NODE_ENV', 'production');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    expect(resolveSize('custom')).toBe(SIZE_PX.m);
    expect(warn).not.toHaveBeenCalled();
  });
});
