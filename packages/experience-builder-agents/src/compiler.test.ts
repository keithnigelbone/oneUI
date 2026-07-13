/**
 * compiler.test.ts — GEN-06 acceptance triad (D-08), all CREDENTIAL-FREE and
 * deterministic (no model, no jsdom, no browser):
 *
 *   leg 1 — the emitted module is a well-formed React module whose imports
 *           resolve to `@oneui/ui` (the approved-import source, D-07). We assert
 *           the import line + the exported component shape; the package's
 *           `pnpm typecheck` gate independently confirms the codegen template
 *           type-checks.
 *   leg 2 — `validateAst` (run inside `compile`) returns `passed: true` for a
 *           compliant fixed IR and `passed: false` for an IR naming an
 *           unregistered component (Pitfall #5 / D-08 step 2).
 *   leg 3 — `bundle` is snapshot-stable for a fixed IR (same IR → same string),
 *           proving deterministic codegen.
 */

import { describe, it, expect } from 'vitest';
import { compile, GENERATED_ARTIFACT_NAME } from './compiler';
import type { JioExperienceIRT } from '@oneui/experience-builder-core';

/** A fixed, compliant IR fixture (registered components, no literals). */
const COMPLIANT_IR: JioExperienceIRT = {
  version: 1,
  artifactType: 'web-ui',
  targetProfile: 'web-desktop',
  brandId: 'jio-default',
  foundationRefs: ['appearance:primary'],
  sections: [
    {
      id: 'section-main',
      name: 'main',
      instances: [
        { id: 'cmp-1', type: 'Button', props: {}, slots: { children: 'Start' } },
        { id: 'cmp-2', type: 'Badge', props: {}, slots: { children: 'New' } },
      ],
      // Explicit layout primitive (04.2-03): the IR Generator now emits a `stack`
      // layout per section so `irToAst` compiles a REAL Jio Container directly —
      // no legacy 'Stack' wrapper, no workflow remap. The fixture matches.
      layout: {
        kind: 'layout',
        id: 'section-main-layout',
        primitive: 'stack',
        direction: 'column',
        gap: '4',
        children: [
          { id: 'cmp-1', type: 'Button', props: {}, slots: { children: 'Start' } },
          { id: 'cmp-2', type: 'Badge', props: {}, slots: { children: 'New' } },
        ],
      },
    },
  ],
  componentInstances: [
    { id: 'cmp-1', type: 'Button', props: {}, slots: { children: 'Start' } },
    { id: 'cmp-2', type: 'Badge', props: {}, slots: { children: 'New' } },
  ],
  content: { title: 'Fixed fixture' },
  a11yRequirements: { wcagLevel: 'AA' },
  validationStatus: 'draft',
};

/** An IR naming a component that is NOT in the registry (Pitfall #5). */
const NONCOMPLIANT_IR: JioExperienceIRT = {
  ...COMPLIANT_IR,
  sections: [
    {
      id: 'section-main',
      name: 'main',
      instances: [{ id: 'cmp-1', type: 'FakeWidget', props: {}, slots: {} }],
      layout: {
        kind: 'layout',
        id: 'section-main-layout',
        primitive: 'stack',
        direction: 'column',
        gap: '4',
        children: [{ id: 'cmp-1', type: 'FakeWidget', props: {}, slots: {} }],
      },
    },
  ],
  componentInstances: [{ id: 'cmp-1', type: 'FakeWidget', props: {}, slots: {} }],
};

describe('compile (GEN-06 acceptance triad)', () => {
  it('leg 1 — emits a well-formed React module importing from @oneui/ui (D-07)', () => {
    const { bundle } = compile(COMPLIANT_IR, { brandId: 'jio-default', outputProfile: 'web-desktop' });

    // Approved-import source: the codegen string imports component bindings from
    // '@oneui/ui' and nothing else (no Tailwind, no app paths).
    expect(bundle).toMatch(/from '@oneui\/ui';/);
    expect(bundle).not.toMatch(/tailwind/i);
    expect(bundle).not.toMatch(/from '@\/lib/);

    // Exported, named functional component shaped to compile.
    expect(bundle).toMatch(new RegExp(`export function ${GENERATED_ARTIFACT_NAME}\\(\\)`));
    expect(bundle).toMatch(/import React from 'react';/);
    // The registered components used by the fixture appear in the import line.
    expect(bundle).toMatch(/\bButton\b/);
  });

  it('leg 2a — validateAst passes for a compliant IR (allowlist green)', () => {
    const { validation } = compile(COMPLIANT_IR, {});
    expect(validation.passed).toBe(true);
    expect(validation.blocking).toEqual([]);
  });

  it('leg 2b — validateAst fails for an IR with an unregistered component (Pitfall #5)', () => {
    const { validation } = compile(NONCOMPLIANT_IR, {});
    expect(validation.passed).toBe(false);
    expect(validation.blocking.length).toBeGreaterThan(0);
    expect(validation.blocking[0].code).toBe('unregistered-component');
  });

  it('leg 3 — codegen string is snapshot-stable for a fixed IR (determinism)', () => {
    const { bundle } = compile(COMPLIANT_IR, {});
    expect(bundle).toMatchSnapshot();
  });

  it('is deterministic — same IR yields an identical bundle', () => {
    expect(compile(COMPLIANT_IR, {}).bundle).toBe(compile(COMPLIANT_IR, {}).bundle);
  });
});
