import { describe, expect, test } from 'vitest';
import {
  KNOWN_SCHEMA_VERSIONS,
  type ComponentDocumentationSpec,
  type SchemaVersionLiteral,
} from '../componentDocumentation';

describe('SchemaVersionLiteral — template literal widening (B7)', () => {
  test('accepts arbitrary semver-shaped strings at the type level', () => {
    // Compile-time assertion: any "X.Y.Z" form satisfies the union.
    const a: SchemaVersionLiteral = '1.0.0';
    const b: SchemaVersionLiteral = '1.1.0';
    const c: SchemaVersionLiteral = '2.4.7';
    const d: SchemaVersionLiteral = '12.0.0';
    expect([a, b, c, d]).toHaveLength(4);
  });

  test('a ComponentDocumentationSpec carrying a future schemaVersion compiles', () => {
    const spec: Pick<ComponentDocumentationSpec, 'schemaVersion' | 'componentName'> = {
      schemaVersion: '5.0.0',
      componentName: 'Button',
    };
    expect(spec.schemaVersion).toBe('5.0.0');
  });
});

describe('KNOWN_SCHEMA_VERSIONS', () => {
  test('tuple is non-empty', () => {
    expect(KNOWN_SCHEMA_VERSIONS.length).toBeGreaterThan(0);
  });
  test('every entry is a well-formed semver', () => {
    const semver = /^\d+\.\d+\.\d+$/;
    for (const v of KNOWN_SCHEMA_VERSIONS) {
      expect(v).toMatch(semver);
    }
  });
  test('1.0.0 + 5.0.0 are both present', () => {
    expect(KNOWN_SCHEMA_VERSIONS).toContain('1.0.0');
    expect(KNOWN_SCHEMA_VERSIONS).toContain('5.0.0');
  });
});
