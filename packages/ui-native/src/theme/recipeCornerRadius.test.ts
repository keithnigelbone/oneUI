import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import type { NativeShape } from '@oneui/shared/engine';
import {
  resolveShapeBorderRadius,
  resolveRecipeBorderRadius,
  resolveShapeLanguageBorderRadius,
} from './recipeCornerRadius';

/** Mirrors `buildNativeDimensions({ platform: 'S', density: 'default' })`. */
const shape: NativeShape = {
  // Canonical numeric scale
  '0': 0,
  '0-5': 2,
  '1': 4,
  '1-5': 6,
  '2': 8,
  '2-5': 10,
  '3': 12,
  '3-5': 14,
  '4': 16,
  '4-5': 18,
  '5': 20,
  '5-5': 22,
  '6': 24,
  '7': 28,
  '8': 32,
  '9': 36,
  '10': 40,
  Pill: 9999,
  // Deprecated t-shirt mirrors
  None: 0,
  '6XS': 2,
  '5XS': 4,
  '4XS': 6,
  '3XS': 8,
  '2XS': 10,
  XS: 12,
  S: 14,
  M: 16,
  L: 18,
  XL: 20,
  '2XL': 24,
  '3XL': 28,
  '4XL': 32,
  '5XL': 36,
  '6XL': 40,
};

describe('resolveShapeBorderRadius', () => {
  it('resolves the canonical numeric shape tokens', () => {
    expect(resolveShapeBorderRadius('Shape-0', shape)).toBe(0);
    expect(resolveShapeBorderRadius('Shape-3', shape)).toBe(12);
    expect(resolveShapeBorderRadius('Shape-4', shape)).toBe(16);
    expect(resolveShapeBorderRadius('Shape-5-5', shape)).toBe(22);
    expect(resolveShapeBorderRadius('Shape-10', shape)).toBe(40);
  });

  it('resolves pill and px literals', () => {
    expect(resolveShapeBorderRadius('Shape-Pill', shape)).toBe(9999);
    expect(resolveShapeBorderRadius('18px', shape)).toBe(18);
  });

  it('returns undefined for unknown tokens so callers keep their default', () => {
    expect(resolveShapeBorderRadius('Shape-Nope', shape)).toBeUndefined();
    expect(resolveShapeBorderRadius(undefined, shape)).toBeUndefined();
  });

  // ── Deprecated t-shirt compatibility layer ────────────────────────────────
  // Delete this block with `LEGACY_SHAPE_TOKEN_TO_KEY`.
  describe('legacy t-shirt aliases', () => {
    let warn: ReturnType<typeof vi.spyOn>;
    beforeEach(() => {
      warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });
    afterEach(() => warn.mockRestore());

    it('still resolves, to the same radius as the numeric name', () => {
      expect(resolveShapeBorderRadius('Shape-XS', shape)).toBe(
        resolveShapeBorderRadius('Shape-3', shape),
      );
      expect(resolveShapeBorderRadius('Shape-M', shape)).toBe(16);
      expect(resolveShapeBorderRadius('Shape-None', shape)).toBe(0);
      expect(resolveShapeBorderRadius('Shape-6XL', shape)).toBe(40);
    });

    it('warns once per resolution outside production', () => {
      resolveShapeBorderRadius('Shape-M', shape);
      expect(warn).toHaveBeenCalledOnce();
      expect(warn.mock.calls[0][0]).toContain('Shape-4');
    });

    it('does not warn for canonical tokens', () => {
      resolveShapeBorderRadius('Shape-4', shape);
      expect(warn).not.toHaveBeenCalled();
    });
  });
});

describe('resolveRecipeBorderRadius', () => {
  it('maps cornerRadius decisions to the numeric scale', () => {
    expect(resolveRecipeBorderRadius({ cornerRadius: 'none' }, shape)).toBe(0);
    expect(resolveRecipeBorderRadius({ cornerRadius: 'small' }, shape)).toBe(12); // Shape-3
    expect(resolveRecipeBorderRadius({ cornerRadius: 'medium' }, shape)).toBe(14); // Shape-3-5
    expect(resolveRecipeBorderRadius({ cornerRadius: 'large' }, shape)).toBe(16); // Shape-4
    expect(resolveRecipeBorderRadius({ cornerRadius: 'pill' }, shape)).toBe(9999);
  });

  it('returns undefined for inherit/unknown', () => {
    expect(resolveRecipeBorderRadius({ cornerRadius: 'inherit' }, shape)).toBeUndefined();
    expect(resolveRecipeBorderRadius({}, shape)).toBeUndefined();
  });
});

describe('resolveShapeLanguageBorderRadius', () => {
  it('resolves per component family', () => {
    expect(resolveShapeLanguageBorderRadius('soft', shape, 'actions')).toBe(12); // Shape-3
    expect(resolveShapeLanguageBorderRadius('soft', shape, 'inputs')).toBe(8); // Shape-2
    expect(resolveShapeLanguageBorderRadius('soft', shape, 'display')).toBe(4); // Shape-1

    expect(resolveShapeLanguageBorderRadius('rounded', shape, 'actions')).toBe(16); // Shape-4
    expect(resolveShapeLanguageBorderRadius('rounded', shape, 'inputs')).toBe(12); // Shape-3
    expect(resolveShapeLanguageBorderRadius('rounded', shape, 'display')).toBe(8); // Shape-2
  });

  it('sharp and pill are family-independent', () => {
    for (const family of ['actions', 'inputs', 'display'] as const) {
      expect(resolveShapeLanguageBorderRadius('sharp', shape, family)).toBe(0);
      expect(resolveShapeLanguageBorderRadius('pill', shape, family)).toBe(9999);
    }
  });

  it('returns undefined for inherit/unknown', () => {
    expect(resolveShapeLanguageBorderRadius('inherit', shape)).toBeUndefined();
    expect(resolveShapeLanguageBorderRadius(undefined, shape)).toBeUndefined();
  });
});
