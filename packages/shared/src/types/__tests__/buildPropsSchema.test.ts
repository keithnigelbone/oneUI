/**
 * Smoke tests for `buildPropsSchema()` in scripts/generate-machine-docs.ts.
 *
 * Lives in the shared package's test suite so it picks up vitest config +
 * runs in the same lane as ComponentDocumentationSpec tests. Imports the
 * generator's exported helper by relative path; no Convex / ts-morph
 * setup is needed because the helper is pure.
 */

import Ajv2020 from 'ajv/dist/2020';
import { describe, expect, test } from 'vitest';
import type { ComponentMeta } from '../componentMeta';
import { buildPropsSchema } from '../../utils/buildPropsSchema';

// Per-test AJV instance so multiple tests can reuse the same `jds.docs.<slug>`
// $id without colliding in AJV's internal registry.
const makeAjv = () => new Ajv2020({ strict: false, allErrors: true });

function meta(partial: Partial<ComponentMeta> = {}): ComponentMeta {
  return {
    name: 'Sample',
    slug: 'sample',
    displayName: 'Sample',
    description: 'fixture',
    category: 'actions',
    props: [],
    slots: [],
    previewMatrix: { variants: [], variantLabels: {} },
    surfaceAware: false,
    multiAccent: false,
    ...partial,
  } as ComponentMeta;
}

describe('buildPropsSchema (B9)', () => {
  test('emits a $id / type / properties trio for an empty meta', () => {
    const schema = buildPropsSchema(meta(), []);
    expect(schema.$id).toBe('jds.docs.sample');
    expect(schema.type).toBe('object');
    expect(schema.properties).toEqual({});
    expect(schema.required).toBeUndefined();
  });

  test('translates primitive props into JSON Schema types', () => {
    const schema = buildPropsSchema(
      meta({
        props: [
          { name: 'count', type: 'number', options: [1, 2, 3] },
          { name: 'disabled', type: 'boolean' },
          { name: 'label', type: 'string', required: true },
        ],
      }),
      [
        { name: 'count', type: 'number', required: false, description: 'count' },
        { name: 'disabled', type: 'boolean', required: false, description: 'disabled' },
        { name: 'label', type: 'string', required: true, description: 'label' },
      ],
    );
    const p = schema.properties as Record<string, Record<string, unknown>>;
    expect(p.count.type).toBe('number');
    expect(p.disabled.type).toBe('boolean');
    expect(p.label.type).toBe('string');
    expect(schema.required).toEqual(['label']);
  });

  test('promotes meta.props.options into enum', () => {
    const schema = buildPropsSchema(
      meta({
        props: [{ name: 'variant', type: 'enum', options: ['bold', 'subtle', 'ghost'] }],
      }),
      [{ name: 'variant', type: 'ButtonVariant', required: false, description: 'visual variant' }],
    );
    const p = schema.properties as Record<string, Record<string, unknown>>;
    expect(p.variant.enum).toEqual(['bold', 'subtle', 'ghost']);
  });

  test('overlays meta.forbiddenPatterns with x-jds-suggestion + severity', () => {
    const schema = buildPropsSchema(
      meta({
        forbiddenPatterns: {
          backgroundColor: {
            regexps: ['^#', '^rgba?\\(', '^oklch\\('],
            suggestion: 'Use appearance + variant + Surface mode instead.',
            severity: 'error',
          },
        },
      }),
      [],
    );
    const p = schema.properties as Record<string, Record<string, unknown>>;
    expect(p.backgroundColor.type).toBe('string');
    expect((p.backgroundColor.not as Record<string, unknown>).anyOf).toBeDefined();
    expect(p.backgroundColor['x-jds-suggestion']).toMatch(/Surface/);
    expect(p.backgroundColor['x-jds-severity']).toBe('error');
  });

  test('emitted schema compiles under AJV 2020', () => {
    const schema = buildPropsSchema(
      meta({
        props: [{ name: 'variant', type: 'enum', options: ['bold', 'subtle'] }],
        forbiddenPatterns: {
          backgroundColor: {
            regexps: ['^#'],
            suggestion: 'Use appearance + variant.',
            severity: 'error',
          },
        },
      }),
      [
        { name: 'variant', type: 'string', required: false, description: 'visual variant' },
      ],
    );
    expect(() => makeAjv().compile(schema)).not.toThrow();
  });

  test('the compiled AJV validator rejects raw hex on a forbidden-pattern prop', () => {
    const schema = buildPropsSchema(
      meta({
        forbiddenPatterns: {
          backgroundColor: {
            regexps: ['^#', '^rgba?\\('],
            suggestion: 'Use surface mode instead.',
            severity: 'error',
          },
        },
      }),
      [],
    );
    const validate = makeAjv().compile(schema);
    expect(validate({ backgroundColor: 'var(--Primary-Bold)' })).toBe(true);
    expect(validate({ backgroundColor: '#ff0033' })).toBe(false);
    expect(validate({ backgroundColor: 'rgb(255,0,0)' })).toBe(false);
  });
});
