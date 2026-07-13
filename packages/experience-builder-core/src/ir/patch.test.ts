import { describe, it, expect } from 'vitest';
import { diffIr, applyPatch } from './patch';
import { makeValidIr } from './__fixtures__/validIr';

describe('IR JSON-patch diff/apply (IR-03)', () => {
  it('empty diff for identical documents', () => {
    const a = makeValidIr();
    const b = makeValidIr();
    expect(diffIr(a, b)).toEqual([]);
  });

  it('round-trips a primitive replace', () => {
    const a = makeValidIr();
    const b = makeValidIr();
    b.validationStatus = 'draft';
    b.content['hero.title'] = 'New headline';
    const patch = diffIr(a, b);
    expect(patch.length).toBeGreaterThan(0);
    expect(applyPatch(a, patch)).toEqual(b);
  });

  it('round-trips an array add (new section)', () => {
    const a = makeValidIr();
    const b = makeValidIr();
    b.sections.push({
      id: 'sec-footer',
      name: 'footer',
      instances: [{ id: 'inst-f', type: 'Surface', props: { mode: 'subtle' } }],
    });
    const patch = diffIr(a, b);
    expect(applyPatch(a, patch)).toEqual(b);
  });

  it('round-trips an array remove + key removal', () => {
    const a = makeValidIr();
    const b = makeValidIr();
    b.foundationRefs = ['brand:jio']; // shorter array
    delete b.a11yRequirements.minContrastRatio;
    const patch = diffIr(a, b);
    expect(applyPatch(a, patch)).toEqual(b);
  });

  it('does not mutate the source document', () => {
    const a = makeValidIr();
    const before = JSON.stringify(a);
    const b = makeValidIr();
    b.brandId = 'jiomart';
    const patch = diffIr(a, b);
    applyPatch(a, patch);
    expect(JSON.stringify(a)).toBe(before);
  });
});
