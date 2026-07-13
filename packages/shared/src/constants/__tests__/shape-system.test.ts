import { describe, it, expect } from 'vitest';
import {
  LEGACY_SHAPE_ALIASES,
  NON_INTERACTIVE_TOKENS,
  isValidNonInteractiveShape,
  toCanonicalShapeStep,
} from '../shape-system';

/**
 * `isValidNonInteractiveShape` / `toCanonicalShapeStep` are exported through the
 * public `@oneui/shared` barrel and take untrusted strings: brand config, Figma
 * variable imports, and the MCP `validate_oneui_code` path all feed them.
 *
 * `LEGACY_SHAPE_ALIASES` is a plain object literal, so `key in obj` and
 * `obj[key]` both walk Object.prototype. Before the `Object.hasOwn` guard,
 * `isValidNonInteractiveShape('constructor')` returned `true` and
 * `toCanonicalShapeStep('toString')` returned a *function* statically typed as
 * `ShapeScaleStep` — which then interpolated into `--Shape-${step}`, emitting
 * `--Shape-function Object() { [native code] }` and dropping every radius to 0.
 */
const PROTOTYPE_KEYS = [
  'constructor',
  'toString',
  'valueOf',
  'hasOwnProperty',
  'isPrototypeOf',
  'propertyIsEnumerable',
  'toLocaleString',
  '__proto__',
  '__defineGetter__',
];

describe('shape-system prototype-chain safety', () => {
  it.each(PROTOTYPE_KEYS)('isValidNonInteractiveShape(%j) is false', (key) => {
    expect(isValidNonInteractiveShape(key)).toBe(false);
  });

  it.each(PROTOTYPE_KEYS)('toCanonicalShapeStep(%j) is undefined', (key) => {
    expect(toCanonicalShapeStep(key)).toBeUndefined();
  });

  it('never returns a non-string from toCanonicalShapeStep', () => {
    for (const key of PROTOTYPE_KEYS) {
      const step = toCanonicalShapeStep(key);
      expect(typeof step === 'string' || step === undefined).toBe(true);
    }
  });
});

describe('shape-system happy path still works', () => {
  it.each(Object.entries(LEGACY_SHAPE_ALIASES))(
    'legacy %s resolves to numeric step %s',
    (legacy, step) => {
      expect(isValidNonInteractiveShape(legacy)).toBe(true);
      expect(toCanonicalShapeStep(legacy)).toBe(step);
    },
  );

  it.each([...NON_INTERACTIVE_TOKENS])('canonical step %s is its own identity', (step) => {
    expect(isValidNonInteractiveShape(step)).toBe(true);
    expect(toCanonicalShapeStep(step)).toBe(step);
  });

  it('rejects unknown names', () => {
    expect(isValidNonInteractiveShape('nope')).toBe(false);
    expect(toCanonicalShapeStep('nope')).toBeUndefined();
  });
});
