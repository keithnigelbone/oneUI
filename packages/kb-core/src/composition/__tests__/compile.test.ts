import Ajv2020 from 'ajv/dist/2020';
import { describe, expect, test } from 'vitest';
import { compileComposition } from '../compile';
import type { CompositionRule } from '../../types/composition';

const ajv = new Ajv2020({ strict: false, allErrors: true });

describe('compileComposition — leaf', () => {
  const rule: CompositionRule = { childKind: 'leaf' };
  const compiled = compileComposition(rule);

  test('emits children=oneOf with array forbidden', () => {
    expect(compiled.properties.children).toBeDefined();
    expect(compiled.required).toEqual([]);
  });

  test('AJV accepts string children, rejects array children', () => {
    const schema = { type: 'object', properties: compiled.properties, required: compiled.required };
    const validate = ajv.compile(schema);
    expect(validate({ children: 'Buy now' })).toBe(true);
    expect(validate({ children: ['a', 'b'] })).toBe(false);
  });
});

describe('compileComposition — variadic', () => {
  const rule: CompositionRule = {
    childKind: 'variadic',
    variadic: { accepts: ['TabBarItem'], min: 2, max: 5 },
  };
  const compiled = compileComposition(rule);

  test('children required when min > 0', () => {
    expect(compiled.required).toContain('children');
  });

  test('children schema has minItems / maxItems / items', () => {
    const c = compiled.properties.children as Record<string, unknown>;
    expect(c.type).toBe('array');
    expect(c.minItems).toBe(2);
    expect(c.maxItems).toBe(5);
  });

  test('AJV accepts 2..5 children, rejects 0/1/6', () => {
    const schema = { type: 'object', properties: compiled.properties, required: compiled.required };
    const validate = ajv.compile(schema);
    expect(validate({ children: [{}, {}] })).toBe(true);
    expect(validate({ children: [{}, {}, {}, {}, {}] })).toBe(true);
    expect(validate({ children: [{}] })).toBe(false);
    expect(validate({ children: [{}, {}, {}, {}, {}, {}] })).toBe(false);
    expect(validate({})).toBe(false);
  });
});

describe('compileComposition — fixed-slots', () => {
  const rule: CompositionRule = {
    childKind: 'fixed-slots',
    slots: {
      icon: { accepts: ['Icon'], cardinality: 'single' },
      label: { accepts: ['#string'], cardinality: 'single' },
      badge: { accepts: ['Badge'], cardinality: 'optional' },
      actions: { accepts: ['Button'], cardinality: 'multiple' },
    },
  };
  const compiled = compileComposition(rule);

  test('single-cardinality slots are required', () => {
    expect(compiled.required).toEqual(expect.arrayContaining(['icon', 'label']));
    expect(compiled.required).not.toContain('badge');
    expect(compiled.required).not.toContain('actions');
  });

  test('multiple-cardinality slot is an array', () => {
    const a = compiled.properties.actions as Record<string, unknown>;
    expect(a.type).toBe('array');
  });

  test('AJV — required slots present passes; missing label fails', () => {
    const schema = { type: 'object', properties: compiled.properties, required: compiled.required };
    const validate = ajv.compile(schema);
    expect(validate({ icon: {}, label: 'Home' })).toBe(true);
    expect(validate({ icon: {} })).toBe(false);
  });

  test("'#string' slot enforces type at AJV layer", () => {
    const schema = { type: 'object', properties: compiled.properties, required: compiled.required };
    const validate = ajv.compile(schema);
    expect(validate({ icon: {}, label: 'OK' })).toBe(true);
    expect(validate({ icon: {}, label: 42 })).toBe(false);
  });
});

describe('compileComposition — error paths', () => {
  test('throws when variadic missing spec', () => {
    expect(() => compileComposition({ childKind: 'variadic' } as CompositionRule)).toThrow(/variadic/);
  });
  test('throws when fixed-slots missing slots map', () => {
    expect(() => compileComposition({ childKind: 'fixed-slots' } as CompositionRule)).toThrow(/slots/);
  });
});

describe('compileComposition — provenance', () => {
  test('output carries x-jds-composition-source annotation', () => {
    const compiled = compileComposition({ childKind: 'leaf' });
    expect(compiled['x-jds-composition-source']).toBe('@jds/kb-core/composition/compile');
  });
});
