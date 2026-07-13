/**
 * Unit tests for codemod-shape-tokens.ts
 *
 * The invariant that matters: there are TWO mappings, and conflating them
 * silently doubles radii.
 *
 *   --Shape-M / NativeShape.M  → f0  → 16px → Shape-4   (BY NAME)
 *   tokens.shape.m             → f-4 →  8px → Shape-2   (BY VALUE)
 *
 * `M` is 16px. `m` is 8px. Nothing downstream catches a case-fold: TypeScript
 * accepts either key, tests pass, `check:literals` passes, and the UI is just
 * quietly wrong. These tests are the only thing standing between us and that.
 */

import { describe, it, expect } from 'vitest';
import { applyShapeCodemod, BY_NAME, BY_VALUE } from '../codemod-shape-tokens';
import { tokens } from '../../packages/tokens/src/index';
import {
  buildNativeDimensions,
  type NativeShape,
} from '../../packages/shared/src/engine/buildNativeDimensions';

const run = (src: string) => applyShapeCodemod(src).text;

describe('the M/m hazard', () => {
  it('uppercase M (CSS) → Shape-4, because --Shape-M is f0 = 16px', () => {
    expect(run('border-radius: var(--Shape-M);')).toBe('border-radius: var(--Shape-4);');
  });

  it('uppercase M (NativeShape) → shape[\'4\'], also f0 = 16px', () => {
    expect(run('borderRadius: shape.M,')).toBe("borderRadius: shape['4'],");
    expect(run("borderRadius: theme.shape['M'],")).toBe("borderRadius: theme.shape['4'],");
  });

  it('lowercase m (static tokens.shape) → shape[\'2\'], because it is f-4 = 8px', () => {
    expect(run('borderRadius: tokens.shape.m,')).toBe("borderRadius: tokens.shape['2'],");
  });

  it('never maps a lowercase static key onto its uppercase namesake', () => {
    const out = run('a: tokens.shape.m; b: shape.M; c: tokens.shape.l; d: shape.L;');
    expect(out).toBe("a: tokens.shape['2']; b: shape['4']; c: tokens.shape['3']; d: shape['4-5'];");
  });
});

describe('by-name mapping (CSS custom properties, prose, NativeShape keys)', () => {
  it.each([
    ['--Shape-None', '--Shape-0'],
    ['--Shape-6XS', '--Shape-0-5'],
    ['--Shape-3XS', '--Shape-2'],
    ['--Shape-XS', '--Shape-3'],
    ['--Shape-S', '--Shape-3-5'],
    ['--Shape-L', '--Shape-4-5'],
    ['--Shape-XL', '--Shape-5'],
    ['--Shape-2XL', '--Shape-6'],
    ['--Shape-6XL', '--Shape-10'],
  ])('%s → %s', (from, to) => {
    expect(run(`var(${from})`)).toBe(`var(${to})`);
  });

  it('handles bare (un-prefixed) names in prose and backticks', () => {
    expect(run('- Inputs: `Shape-3XS` (8px) border-radius')).toBe(
      '- Inputs: `Shape-2` (8px) border-radius',
    );
  });

  it('longest-first alternation: 2XL is not read as 2 + XL', () => {
    expect(run('var(--Shape-2XL) var(--Shape-2XS)')).toBe('var(--Shape-6) var(--Shape-2-5)');
  });

  it('XS beats S; XL beats L', () => {
    expect(run('var(--Shape-XS) var(--Shape-XL)')).toBe('var(--Shape-3) var(--Shape-5)');
  });
});

describe('by-value mapping (static tokens.shape, which had drifted)', () => {
  it.each([
    ['tokens.shape.xs', "tokens.shape['0-5']"], //  2px
    ['tokens.shape.s', "tokens.shape['1']"], //  4px
    ['tokens.shape.m', "tokens.shape['2']"], //  8px
    ['tokens.shape.l', "tokens.shape['3']"], // 12px
    ['tokens.shape.xl', "tokens.shape['4']"], // 16px
    ["tokens.shape['2xl']", "tokens.shape['5']"], // 20px
    ["tokens.shape['3xl']", "tokens.shape['6']"], // 24px
    ["tokens.shape['4xl']", "tokens.shape['8']"], // 32px — skips 28px
    ["tokens.shape['5xl']", "tokens.shape['10']"], // 40px — skips 36px
  ])('%s → %s', (from, to) => {
    expect(run(from)).toBe(to);
  });

  it('pill → Pill (999 → 9999; renders identically)', () => {
    expect(run('borderRadius: tokens.shape.pill,')).toBe("borderRadius: tokens.shape['Pill'],");
  });

  it.each([
    // Bracket + double-quote forms the codemod used to silently skip while
    // `check:shape-tokens` still counted them as violations.
    ['shape["M"]', "shape['4']"],
    ["tokens.shape['pill']", "tokens.shape['Pill']"],
    ['tokens.shape["pill"]', "tokens.shape['Pill']"],
    ['shape["3XL"]', "shape['7']"],
    ['tokens.shape["m"]', "tokens.shape['2']"], // by value: 8px, not 16px
  ])('%s → %s', (from, to) => {
    expect(run(from)).toBe(to);
  });
});

describe('must not touch', () => {
  it.each([
    'var(--Shape-4)',
    'var(--Shape-0-5)',
    'var(--Shape-5-5)',
    'var(--Shape-Pill)',
    'var(--Surface-Subtle)',
    'var(--Spacing-M)', // spacing has its own gate and its own aliases
    'var(--Stroke-XL)',
    'shape.Pill',
    'shape.small',
    'shape.wireValue',
    'useShape.M', // not a `shape` identifier
    'size="m"',
  ])('leaves %s alone', (src) => {
    expect(run(src)).toBe(src);
  });

  it('is idempotent — a second pass is a no-op', () => {
    const once = run('var(--Shape-M) shape.M tokens.shape.m tokens.shape.pill');
    expect(run(once)).toBe(once);
  });
});

describe('--only scoping', () => {
  it('css rule does not rewrite object keys', () => {
    const { text } = applyShapeCodemod('a: var(--Shape-M); b: shape.M;', ['css']);
    expect(text).toBe('a: var(--Shape-4); b: shape.M;');
  });

  it('static rule does not rewrite uppercase NativeShape keys', () => {
    const { text } = applyShapeCodemod('a: tokens.shape.m; b: shape.M;', ['static']);
    expect(text).toBe("a: tokens.shape['2']; b: shape.M;");
  });
});

/**
 * The end-to-end proof of px-preservation.
 *
 * The codemod only ever rewrites a key to its mapped counterpart. So if, for
 * EVERY pair in both tables, the old key and the new key resolve to the same
 * number in the real token objects, then any rewrite the codemod performs is
 * px-preserving — regardless of which file it touched. That is a complete
 * argument, and it is checked against the live tables rather than a fixture.
 *
 * This is what makes a "rename only" PR verifiable: an empty Chromatic diff is
 * the expectation, not a hope.
 */
describe('px-preservation of every codemod mapping', () => {
  const statics = tokens.shape as Record<string, number>;

  /**
   * `pill` is the ONE key that is not px-preserving: 999 → 9999. Both exceed any
   * realistic half-height, so every *border-radius* consumer clamps to the same
   * stadium and renders identically. A raw-number consumer (an animation output
   * range, a size comparison) would see a 10× change, and this test cannot see
   * those — they must be audited by hand. Pinned exactly below.
   */
  const NOT_PX_PRESERVING = new Set(['pill']);

  it('BY_VALUE: each legacy static key equals its numeric target', () => {
    for (const [legacy, canonical] of Object.entries(BY_VALUE)) {
      expect(statics[legacy], `tokens.shape.${legacy}`).toBeTypeOf('number');
      expect(statics[canonical], `tokens.shape['${canonical}']`).toBeTypeOf('number');
      if (NOT_PX_PRESERVING.has(legacy)) continue;
      expect(statics[legacy], `tokens.shape.${legacy} → ['${canonical}']`).toBe(statics[canonical]);
    }
  });

  it('pill is the only BY_VALUE key exempt from px-preservation', () => {
    const drifted = Object.entries(BY_VALUE)
      .filter(([legacy, canonical]) => statics[legacy] !== statics[canonical])
      .map(([legacy]) => legacy);
    expect(drifted).toEqual([...NOT_PX_PRESERVING]);
  });

  it('BY_VALUE really is value-preserving, not name-preserving', () => {
    // The whole point: `m` is 8px, so it must NOT land on `4` (16px).
    expect(statics.m).toBe(8);
    expect(statics['2']).toBe(8);
    expect(statics['4']).toBe(16);
    expect(BY_VALUE.m).toBe('2');
  });

  const CONTEXTS = (['S', 'M', 'L'] as const).flatMap((platform) =>
    (['compact', 'default', 'open'] as const).map((density) => ({ platform, density })),
  );

  it.each(CONTEXTS)(
    'BY_NAME: each legacy NativeShape key equals its numeric target ($platform/$density)',
    ({ platform, density }) => {
      const shape = buildNativeDimensions({ platform, density }).shape as NativeShape;
      for (const [legacy, canonical] of Object.entries(BY_NAME)) {
        const a = shape[legacy as keyof NativeShape];
        const b = shape[canonical as keyof NativeShape];
        expect(a, `shape.${legacy}`).toBeTypeOf('number');
        expect(a, `shape.${legacy} → ['${canonical}'] @ ${platform}/${density}`).toBe(b);
      }
    },
  );

  it('BY_NAME really is name-preserving: M is f0 (16px), not the static 8px', () => {
    const shape = buildNativeDimensions({ platform: 'S', density: 'default' }).shape;
    expect(shape.M).toBe(16);
    expect(shape['4']).toBe(16);
    expect(BY_NAME.M).toBe('4');
    // …while the static table's lowercase `m` is a different rung entirely.
    expect(statics.m).toBe(8);
  });

  it('pill → Pill is the only mapping that changes a number (999 → 9999)', () => {
    expect(statics.pill).toBe(999);
    expect(statics.Pill).toBe(9999);
    // Both exceed any realistic component size, so both clamp to a stadium.
  });
});
