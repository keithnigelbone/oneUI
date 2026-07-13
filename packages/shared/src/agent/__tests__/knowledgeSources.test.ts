/**
 * knowledgeSources tests — guard the agent system prompt against vocabulary
 * drift. The CORE_INVARIANTS string is compiled into the model's system
 * prompt verbatim; if it regresses to the deprecated `fg-*`/`bg-*` or
 * `--{Role}-FG-*`/`--{Role}-BG-*` vocabulary the model starts teaching users
 * tokens that the rest of the repo has moved away from.
 *
 * These assertions mirror the `pnpm check:ai-vocab` CI gate.
 */

import { describe, expect, it, test } from 'vitest';
import { CORE_INVARIANTS, renderCoreInvariants } from '../knowledgeSources';
import {
  CORE_INVARIANTS_STRUCT,
  SURFACE_MODES_INVARIANT,
  renderCoreInvariantsStructured,
} from '../../types/coreInvariants';

const BANNED = [
  /\bfg-(bold|subtle|minimal)\b/,
  /\bbg-(bold|subtle|minimal)\b/,
  /--\w+-(FG|BG)-/,
];

describe('CORE_INVARIANTS', () => {
  it('uses the unified <Surface mode="bold"> vocabulary', () => {
    expect(CORE_INVARIANTS).toMatch(/mode="bold"/);
  });

  it('references the role-explicit unified token (e.g. --Primary-Bold)', () => {
    expect(CORE_INVARIANTS).toMatch(/--Primary-Bold(?!-)/);
  });

  it.each(BANNED)('does not contain deprecated vocabulary: %s', (pattern) => {
    expect(CORE_INVARIANTS).not.toMatch(pattern);
  });
});

describe('CORE_INVARIANTS_STRUCT — B4 structured source-of-truth', () => {
  test('schemaVersion is semver-shaped', () => {
    expect(CORE_INVARIANTS_STRUCT.schemaVersion).toMatch(/^\d+\.\d+\.\d+$/);
  });
  test('exposes the 7 canonical surface modes', () => {
    expect(SURFACE_MODES_INVARIANT).toHaveLength(7);
    expect(CORE_INVARIANTS_STRUCT.surfaces.modes).toEqual(SURFACE_MODES_INVARIANT);
  });
  test('attention-to-surface mapping is canonical', () => {
    expect(CORE_INVARIANTS_STRUCT.surfaces.attentionToSurface).toEqual({
      high: 'bold',
      medium: 'subtle',
      low: 'ghost',
    });
  });
  test('shape default for button is pill', () => {
    expect(CORE_INVARIANTS_STRUCT.shapeDefaults.button).toBe('pill');
  });
});

describe('renderCoreInvariants — per-SDK overload (B4)', () => {
  test('no-arg call returns the legacy CORE_INVARIANTS string verbatim', () => {
    expect(renderCoreInvariants()).toBe(CORE_INVARIANTS);
  });
  test("explicit 'web' is identical to the no-arg call", () => {
    expect(renderCoreInvariants('web')).toBe(CORE_INVARIANTS);
  });
  test("'rn' renders RN-idiomatic tokens.* / useSurfaceTokens — never var(--", () => {
    const rn = renderCoreInvariants('rn');
    expect(rn).toMatch(/useSurfaceTokens/);
    expect(rn).toMatch(/tokens\./);
    expect(rn).not.toMatch(/var\(--/);
  });
  test("'ios' renders SwiftUI-idiomatic JDSColor / JDSSurface — never var(--", () => {
    const ios = renderCoreInvariants('ios');
    expect(ios).toMatch(/JDSColor/);
    expect(ios).toMatch(/JDSSurface/);
    expect(ios).not.toMatch(/var\(--/);
  });
  test("'android' renders Compose-idiomatic JdsSurface / JDSTheme — never var(--", () => {
    const a = renderCoreInvariants('android');
    expect(a).toMatch(/JdsSurface/);
    expect(a).toMatch(/JDSTheme/);
    expect(a).not.toMatch(/var\(--/);
  });
  test("'flutter' renders JDSSurface widget — never var(--", () => {
    const f = renderCoreInvariants('flutter');
    expect(f).toMatch(/JDSSurface/);
    expect(f).not.toMatch(/var\(--/);
  });
  test('renderCoreInvariantsStructured is callable directly with the same SDK union', () => {
    expect(renderCoreInvariantsStructured('rn')).toBe(renderCoreInvariants('rn'));
    expect(renderCoreInvariantsStructured('web')).toBe(renderCoreInvariants('web'));
  });
});
