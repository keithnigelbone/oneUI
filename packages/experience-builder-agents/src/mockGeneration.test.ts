/**
 * mockGeneration.test.ts
 *
 * GEN-08: the mock generator's output (a) parses against the frozen
 * `JioExperienceIR` schema AND (b) once mapped IR → AST → validator, passes
 * `validateAst` (passed: true). Gap inputs short-circuit with NO IR.
 */

import { describe, it, expect } from 'vitest';
import { JioExperienceIR } from '@oneui/experience-builder-core';
import { validateAst } from '@oneui/experience-builder-validation';
import { mockGenerate } from './mockGeneration';
import { irToArtifactAst } from './workflow';

const coveredRequest = {
  brandId: 'jio-default',
  artifactType: 'web-ui' as const,
  outputProfile: 'web-desktop' as const,
};

describe('mockGenerate', () => {
  it('produces an IR that parses against the frozen JioExperienceIR schema (GEN-08)', () => {
    const result = mockGenerate({ request: coveredRequest });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(JioExperienceIR.safeParse(result.ir).success).toBe(true);
    }
  });

  it('produces an IR that PASSES the plan-03 validator after irToAst (GEN-08)', () => {
    const result = mockGenerate({ request: coveredRequest });
    expect(result.ok).toBe(true);
    if (result.ok) {
      const ast = irToArtifactAst(result.ir);
      const validation = validateAst(ast);
      expect(validation.passed).toBe(true);
      expect(validation.blocking).toHaveLength(0);
      expect(validation.componentGaps).toHaveLength(0);
    }
  });

  it('uses only registry-approved component ids (no Stack / raw layout leaks)', () => {
    const result = mockGenerate({ request: coveredRequest });
    expect(result.ok).toBe(true);
    if (result.ok) {
      const ast = irToArtifactAst(result.ir);
      // After the bridge, the layout wrapper is the registered 'Container',
      // never the mapper's internal 'Stack'.
      const types = ast.imports.map((i) => i.imported);
      expect(types).not.toContain('Stack');
      expect(types).toContain('Container');
    }
  });

  it('short-circuits to a FOUNDATION gap (no IR) for an uncovered profile (FND-03)', () => {
    const result = mockGenerate({
      request: {
        brandId: 'jio-default',
        artifactType: 'social-post',
        outputProfile: 'ig-square',
      },
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.foundationGap).toBeDefined();
      expect(result).not.toHaveProperty('ir');
    }
  });

  it('short-circuits to a COMPONENT gap (no IR) for an unregistered component (REG-03)', () => {
    const result = mockGenerate({
      request: coveredRequest,
      requestedComponents: ['FancyHero'],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.componentGap).toBeDefined();
      expect(result.componentGap?.requestedId).toBe('FancyHero');
      expect(result).not.toHaveProperty('ir');
    }
  });

  it('short-circuits to a COMPONENT gap for a known-drift component (Modal)', () => {
    const result = mockGenerate({
      request: coveredRequest,
      requestedComponents: ['Modal'],
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.componentGap?.reason).toBe('excluded-known-drift');
    }
  });

  it('is deterministic — same input yields an equal IR', () => {
    const a = mockGenerate({ request: coveredRequest });
    const b = mockGenerate({ request: coveredRequest });
    expect(a).toEqual(b);
  });
});
