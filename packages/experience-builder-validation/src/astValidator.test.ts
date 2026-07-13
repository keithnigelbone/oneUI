import { describe, it, expect } from 'vitest';
import { JioValidationResult } from '@oneui/experience-builder-core';
import { validateAst, type ArtifactAst } from './astValidator';
import { REDTEAM_FIXTURES } from './fixtures/redteam';
// Wave 0 (04.2-01) RED scaffold. The structural quality-gate (QUAL-04) and the
// IR-pre-check entry are NOT implemented yet, so these resolve to `undefined`
// today and every assertion below fails for the right reason — the contract
// Plan 03/04 (validator) drives to GREEN.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import * as Validator from './astValidator';

/**
 * The to-be-added IR-shaped structural pre-check (Pattern 4): runs on the IR
 * section/layout tree BEFORE AST flatten (section boundaries + layout depth are
 * lost after flatten). Returns a JioValidationResult-shaped object whose
 * `blocking[]` carries `flat-layout` / `empty-section-copy`. `undefined` in RED.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const validateIRStructure: any = (Validator as Record<string, unknown>).validateIRStructure;

// ---------------------------------------------------------------------------
// Helpers — build small, realistic artifact ASTs.
// ---------------------------------------------------------------------------

/** A fully-compliant artifact: Jio import + registered Button + valid variant. */
function validArtifact(): ArtifactAst {
  return {
    imports: [
      { source: '@oneui/ui/components/Button', imported: 'Button', local: 'Button' },
    ],
    root: {
      id: 'btn-1',
      kind: 'component',
      type: 'Button',
      props: { variant: 'bold', size: 'm' },
      children: [{ id: 't-1', kind: 'text', text: 'Run generation' }],
    },
  };
}

// ---------------------------------------------------------------------------
// Happy path
// ---------------------------------------------------------------------------

describe('validateAst — compliant artifact (VAL-01)', () => {
  it('passes a valid AST (registry component + Jio import + valid variant) with zero blocking', () => {
    const result = validateAst(validArtifact());
    expect(result.passed).toBe(true);
    expect(result.blocking).toHaveLength(0);
    expect(result.componentGaps).toHaveLength(0);
  });

  it('always returns a JioValidationResult-conformant object (T-01-10)', () => {
    const result = validateAst(validArtifact());
    expect(JioValidationResult.safeParse(result).success).toBe(true);
    // Every field present in every branch.
    expect(result).toHaveProperty('passed');
    expect(result).toHaveProperty('blocking');
    expect(result).toHaveProperty('warnings');
    expect(result).toHaveProperty('repairSuggestions');
    expect(result).toHaveProperty('componentGaps');
    expect(result).toHaveProperty('foundationGaps');
  });
});

// ---------------------------------------------------------------------------
// VAL-02 — non-Jio imports (incl. aliased)
// ---------------------------------------------------------------------------

describe('validateAst — non-Jio import block (VAL-02 / Pitfall 4)', () => {
  it('blocks a bare non-Jio import (shadcn)', () => {
    const ast: ArtifactAst = {
      imports: [{ source: 'shadcn', imported: 'Button', local: 'Button' }],
      root: { id: 'r', kind: 'text', text: 'x' },
    };
    const result = validateAst(ast);
    expect(result.passed).toBe(false);
    expect(result.blocking.some((v) => v.code === 'non-jio-import' && v.offender === 'shadcn')).toBe(true);
  });

  it('blocks a tailwindcss import', () => {
    const ast: ArtifactAst = {
      imports: [{ source: 'tailwindcss', imported: 'default', local: 'tw' }],
      root: { id: 'r', kind: 'text', text: 'x' },
    };
    const result = validateAst(ast);
    expect(result.passed).toBe(false);
    expect(result.blocking.some((v) => v.code === 'non-jio-import')).toBe(true);
  });

  it('blocks the ALIASED form `import { Button as X } from "shadcn"` via alias resolution, not substring', () => {
    // The import line, naively substring-allowlisted on the imported name
    // "Button", would pass. Only resolving the alias `X` → source `shadcn`
    // structurally catches it.
    const ast: ArtifactAst = {
      imports: [{ source: 'shadcn', imported: 'Button', local: 'X' }],
      root: { id: 'r', kind: 'component', type: 'X', props: {}, children: [] },
    };
    const result = validateAst(ast);
    expect(result.passed).toBe(false);
    // The import source is flagged...
    expect(result.blocking.some((v) => v.code === 'non-jio-import' && v.offender === 'shadcn')).toBe(true);
    // ...AND the aliased component usage is refused (bound to a non-Jio source).
    expect(result.blocking.some((v) => v.code === 'non-jio-component' && v.offender === 'X')).toBe(true);
  });

  it('does NOT block a legitimately aliased Jio import', () => {
    // `import { Button as PrimaryButton } from '@oneui/ui/components/Button'`
    // — Jio source, so the import is fine. (The component-type resolution for a
    // Jio-aliased local name is exercised by the generator in P2/P3; here we
    // assert the import itself is not flagged.)
    const ast: ArtifactAst = {
      imports: [
        { source: '@oneui/ui/components/Button', imported: 'Button', local: 'PrimaryButton' },
      ],
      root: { id: 'r', kind: 'text', text: 'x' },
    };
    const result = validateAst(ast);
    expect(result.blocking.some((v) => v.code === 'non-jio-import')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// VAL-03 — markup smuggling
// ---------------------------------------------------------------------------

describe('validateAst — raw element / markup block (VAL-03 / T-01-08)', () => {
  it('blocks a raw <div> ElementASTNode anywhere in the tree', () => {
    const ast: ArtifactAst = {
      imports: [{ source: '@oneui/ui/components/Button', imported: 'Button', local: 'Button' }],
      root: {
        id: 'r',
        kind: 'element',
        tag: 'div',
        props: {},
        children: [],
      },
    };
    const result = validateAst(ast);
    expect(result.passed).toBe(false);
    expect(result.blocking.some((v) => v.code === 'raw-element' && v.offender === 'div')).toBe(true);
  });

  it('blocks a nested raw element inside a valid component', () => {
    const ast: ArtifactAst = {
      imports: [{ source: '@oneui/ui/components/Button', imported: 'Button', local: 'Button' }],
      root: {
        id: 'r',
        kind: 'component',
        type: 'Button',
        props: { variant: 'bold' },
        children: [{ id: 'd', kind: 'element', tag: 'span', props: {}, children: [] }],
      },
    };
    const result = validateAst(ast);
    expect(result.passed).toBe(false);
    expect(result.blocking.some((v) => v.code === 'raw-element' && v.offender === 'span')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// VAL-03 — unregistered components
// ---------------------------------------------------------------------------

describe('validateAst — unregistered component block (VAL-03 / T-01-09)', () => {
  it('blocks an unregistered component type with a component gap', () => {
    const ast: ArtifactAst = {
      imports: [{ source: '@oneui/ui/components/FancyHero', imported: 'FancyHero', local: 'FancyHero' }],
      root: { id: 'r', kind: 'component', type: 'FancyHero', props: {}, children: [] },
    };
    const result = validateAst(ast);
    expect(result.passed).toBe(false);
    expect(result.blocking.some((v) => v.code === 'unregistered-component')).toBe(true);
    expect(result.componentGaps.some((g) => g.componentType === 'FancyHero')).toBe(true);
  });

  it('blocks a known-drift component (Modal) as a gap', () => {
    const ast: ArtifactAst = {
      imports: [{ source: '@oneui/ui/components/Modal', imported: 'Modal', local: 'Modal' }],
      root: { id: 'r', kind: 'component', type: 'Modal', props: {}, children: [] },
    };
    const result = validateAst(ast);
    expect(result.passed).toBe(false);
    expect(result.componentGaps.some((g) => g.componentType === 'Modal')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// VAL-03 — invalid props / variants
// ---------------------------------------------------------------------------

describe('validateAst — invalid prop / variant block + repair suggestion (VAL-03)', () => {
  it('blocks a fabricated prop on a valid component and emits a repair suggestion', () => {
    const ast: ArtifactAst = {
      imports: [{ source: '@oneui/ui/components/Button', imported: 'Button', local: 'Button' }],
      root: { id: 'r', kind: 'component', type: 'Button', props: { madeUpProp: 'x' }, children: [] },
    };
    const result = validateAst(ast);
    expect(result.passed).toBe(false);
    expect(result.blocking.some((v) => v.code === 'invalid-prop' && v.offender === 'madeUpProp')).toBe(true);
    expect(result.repairSuggestions.length).toBeGreaterThan(0);
  });

  it('blocks an out-of-range variant value with a repair suggestion listing valid values', () => {
    const ast: ArtifactAst = {
      imports: [{ source: '@oneui/ui/components/Button', imported: 'Button', local: 'Button' }],
      root: { id: 'r', kind: 'component', type: 'Button', props: { variant: 'glassmorphic' }, children: [] },
    };
    const result = validateAst(ast);
    expect(result.passed).toBe(false);
    expect(result.blocking.some((v) => v.code === 'invalid-variant' && v.offender === 'glassmorphic')).toBe(true);
    expect(result.repairSuggestions.some((s) => s.includes('bold'))).toBe(true);
  });

  it('accepts a valid variant value', () => {
    const ast: ArtifactAst = {
      imports: [{ source: '@oneui/ui/components/Button', imported: 'Button', local: 'Button' }],
      root: { id: 'r', kind: 'component', type: 'Button', props: { variant: 'subtle' }, children: [] },
    };
    const result = validateAst(ast);
    expect(result.passed).toBe(true);
  });

  it('allows always-allowed meta props (aria-*, data-ast-*)', () => {
    const ast: ArtifactAst = {
      imports: [{ source: '@oneui/ui/components/Button', imported: 'Button', local: 'Button' }],
      root: {
        id: 'r',
        kind: 'component',
        type: 'Button',
        props: { variant: 'bold', 'aria-label': 'Go', 'data-ast-node-id': 'x' },
        children: [],
      },
    };
    const result = validateAst(ast);
    expect(result.passed).toBe(true);
  });
});
// ---------------------------------------------------------------------------
// VAL-03 — required-prop contract (the guardrail gap that let degenerate IR
// through: a PaginationDots with no `count` rendered as NaN keys yet passed).
// ---------------------------------------------------------------------------

describe('validateAst — required-prop contract (VAL-03)', () => {
  it('blocks a registered component that omits a required prop (PaginationDots without count)', () => {
    const ast: ArtifactAst = {
      imports: [
        { source: '@oneui/ui/components/PaginationDots', imported: 'PaginationDots', local: 'PaginationDots' },
      ],
      root: { id: 'pd-1', kind: 'component', type: 'PaginationDots', props: {}, children: [] },
    };
    const result = validateAst(ast);
    expect(result.passed).toBe(false);
    expect(
      result.blocking.some((v) => v.code === 'missing-required-prop' && v.offender === 'count'),
    ).toBe(true);
    expect(result.repairSuggestions.some((s) => s.includes('count'))).toBe(true);
  });

  it('passes the same component once the required prop is supplied', () => {
    const ast: ArtifactAst = {
      imports: [
        { source: '@oneui/ui/components/PaginationDots', imported: 'PaginationDots', local: 'PaginationDots' },
      ],
      root: { id: 'pd-1', kind: 'component', type: 'PaginationDots', props: { count: 5 }, children: [] },
    };
    const result = validateAst(ast);
    expect(result.blocking.some((v) => v.code === 'missing-required-prop')).toBe(false);
  });

  it('does not flag a component whose props are all optional (Button)', () => {
    const ast: ArtifactAst = {
      imports: [{ source: '@oneui/ui/components/Button', imported: 'Button', local: 'Button' }],
      root: { id: 'b-1', kind: 'component', type: 'Button', props: {}, children: [] },
    };
    const result = validateAst(ast);
    expect(result.blocking.some((v) => v.code === 'missing-required-prop')).toBe(false);
  });
});


// ---------------------------------------------------------------------------
// VAL-04 — literal value blocking (promoted from warning hook)
// ---------------------------------------------------------------------------

describe('validateAst — literal value blocking (VAL-04 / Pitfall 5)', () => {
  /** Build a single Button carrying one arbitrary prop value. */
  function buttonWithProp(prop: string, value: string): ArtifactAst {
    return {
      imports: [
        { source: '@oneui/ui/components/Button', imported: 'Button', local: 'Button' },
      ],
      root: {
        id: 'r',
        kind: 'component',
        type: 'Button',
        props: { [prop]: value },
        children: [],
      },
    };
  }

  it('blocks an inline hex color literal on a visual prop', () => {
    const result = validateAst(buttonWithProp('color', '#ff0000'));
    expect(result.passed).toBe(false);
    expect(
      result.blocking.some((v) => v.code === 'literal-value-hook' && v.offender === '#ff0000'),
    ).toBe(true);
  });

  it('blocks a px literal on a visual prop', () => {
    const result = validateAst(buttonWithProp('style', 'padding: 12px'));
    expect(result.passed).toBe(false);
    expect(result.blocking.some((v) => v.code === 'literal-value-hook')).toBe(true);
  });

  it('blocks a rem literal on a visual prop', () => {
    const result = validateAst(buttonWithProp('style', 'margin: 1.5rem'));
    expect(result.passed).toBe(false);
    expect(result.blocking.some((v) => v.code === 'literal-value-hook')).toBe(true);
  });

  it('blocks a fake var(--NotAToken) that is not manifest-allowed', () => {
    const result = validateAst(buttonWithProp('style', 'color: var(--NotAToken)'));
    expect(result.passed).toBe(false);
    expect(result.blocking.some((v) => v.code === 'literal-value-hook')).toBe(true);
  });

  it('does NOT block a genuine var(--Primary-Bold) token reference', () => {
    // Use an always-allowed prop (className) so the only thing under test is the
    // literal hook, not the prop-allowlist check.
    const result = validateAst(buttonWithProp('className', 'color: var(--Primary-Bold)'));
    expect(result.blocking.some((v) => v.code === 'literal-value-hook')).toBe(false);
    expect(result.passed).toBe(true);
  });

  it('blocks a box-shadow / elevation literal', () => {
    const result = validateAst(buttonWithProp('style', 'box-shadow: 0 2px 4px rgba(0,0,0,0.2)'));
    expect(result.passed).toBe(false);
    expect(result.blocking.some((v) => v.code === 'literal-value-hook')).toBe(true);
  });

  it('blocks a motion duration literal', () => {
    const result = validateAst(buttonWithProp('style', 'transition: all 200ms ease'));
    expect(result.passed).toBe(false);
    expect(result.blocking.some((v) => v.code === 'literal-value-hook')).toBe(true);
  });

  it('blocks a bare radius unit literal', () => {
    const result = validateAst(buttonWithProp('style', 'border-radius: 8px'));
    expect(result.passed).toBe(false);
    expect(result.blocking.some((v) => v.code === 'literal-value-hook')).toBe(true);
  });

  it('blocks an unapproved raw font-family literal', () => {
    const result = validateAst(buttonWithProp('fontFamily', 'Comic Sans MS'));
    expect(result.passed).toBe(false);
    expect(result.blocking.some((v) => v.code === 'literal-value-hook')).toBe(true);
  });

  it('does NOT block an approved var(--Typography-Font-Primary) font reference', () => {
    const result = validateAst(buttonWithProp('fontFamily', 'var(--Typography-Font-Primary)'));
    expect(result.blocking.some((v) => v.code === 'literal-value-hook')).toBe(false);
  });

  it('blocks an unapproved raw icon literal', () => {
    const result = validateAst(buttonWithProp('icon', 'fa-rocket'));
    expect(result.passed).toBe(false);
    expect(result.blocking.some((v) => v.code === 'literal-value-hook')).toBe(true);
  });

  it('returns a contract-valid JioValidationResult for a literal failure', () => {
    const result = validateAst(buttonWithProp('color', '#abc'));
    expect(JioValidationResult.safeParse(result).success).toBe(true);
    expect(result.passed).toBe(false);
  });

  it('returns a contract-valid JioValidationResult for a literal pass', () => {
    const result = validateAst(buttonWithProp('style', 'color: var(--Primary-High)'));
    expect(JioValidationResult.safeParse(result).success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Red-team seed corpus
// ---------------------------------------------------------------------------

describe('validateAst — red-team seed corpus (Pitfall 4 / VAL-06 seed)', () => {
  it.each(REDTEAM_FIXTURES.map((f) => [f.name, f] as const))(
    'catches red-team fixture: %s',
    (_name, fixture) => {
      const result = validateAst(fixture.ast);
      expect(result.passed, `${fixture.name} should be blocked`).toBe(false);
      expect(
        result.blocking.some((v) => v.code === fixture.expectedBlockingCode),
        `${fixture.name} expected blocking code "${fixture.expectedBlockingCode}", got: ${result.blocking
          .map((v) => v.code)
          .join(', ')}`,
      ).toBe(true);
    },
  );

  it('every red-team result still conforms to JioValidationResult', () => {
    for (const fixture of REDTEAM_FIXTURES) {
      const result = validateAst(fixture.ast);
      expect(JioValidationResult.safeParse(result).success, fixture.name).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Full red-team evasion corpus — 100% blocked (VAL-05 phase-gate)
// (Tagged "redteam" so `vitest -t redteam` runs the corpus gate.)
// ---------------------------------------------------------------------------

describe('validateAst — redteam evasion corpus 100% blocked (VAL-05)', () => {
  it.each(REDTEAM_FIXTURES.map((f) => [f.name, f] as const))(
    'redteam corpus blocks: %s',
    (_name, fixture) => {
      const result = validateAst(fixture.ast);
      expect(
        result.blocking.some((v) => v.code === fixture.expectedBlockingCode),
        `${fixture.name} expected blocking code "${fixture.expectedBlockingCode}", got: ${result.blocking
          .map((v) => v.code)
          .join(', ')}`,
      ).toBe(true);
    },
  );

  it('redteam corpus grew with the new evasion vectors (>= 11 fixtures)', () => {
    expect(REDTEAM_FIXTURES.length).toBeGreaterThanOrEqual(11);
    const names = REDTEAM_FIXTURES.map((f) => f.name);
    expect(names).toEqual(
      expect.arrayContaining([
        'inline-hex-on-visual-prop',
        'fake-var-token',
        'dynamic-classname-literal',
        'aliased-non-jio-font-import',
        'aliased-non-jio-icon-import',
      ]),
    );
  });

  it('redteam corpus is 100% blocked (zero leaks)', () => {
    const leaks = REDTEAM_FIXTURES.filter((f) => validateAst(f.ast).passed);
    expect(leaks.map((f) => f.name)).toEqual([]);
  });
});

// ===========================================================================
// Wave 0 (04.2-01) RED — structural quality gate (QUAL-04) + structural-allow
// for layout types (LAYOUT-05) + backfill-provenance threading (Pitfall 5).
//
// Three NEW blocking codes:
//   - flat-layout         (IR pre-check: a single flat Stack of leaves, no
//                          depth≥2 layout / no grid / no row blocks)
//   - placeholder-content (AST string-prop path: placehold.co URL, '<X> item',
//                          or a backfilled CONTENT prop)
//   - empty-section-copy  (IR pre-check: a section with no substantive copy)
//
// These MUST fail now: `validateIRStructure` does not exist, and `validateAst`
// does not yet block placeholder-content nor structurally-allow Container/Grid.
// ===========================================================================

// --- (1) flat-layout / empty-section-copy — IR pre-check path -------------

describe('validateIRStructure — flat-layout + empty-section-copy (QUAL-04 / RED)', () => {
  it('exposes validateIRStructure(ir, backfilled[]) — RED: not yet implemented', () => {
    expect(typeof validateIRStructure).toBe('function');
  });

  /** A degenerate IR: ONE flat section of leaf instances, no layout depth. */
  function flatIr(): Record<string, unknown> {
    return {
      version: 1,
      artifactType: 'web-ui',
      targetProfile: 'web-desktop',
      brandId: 'jio',
      foundationRefs: [],
      sections: [
        {
          id: 's1',
          name: 'main',
          instances: [
            { id: 'i1', type: 'Button', props: { children: 'A' } },
            { id: 'i2', type: 'Button', props: { children: 'B' } },
            { id: 'i3', type: 'Button', props: { children: 'C' } },
          ],
        },
      ],
      componentInstances: [],
      content: { 'main.headline': 'Welcome', 'main.body': 'A real sentence of body copy.' },
      a11yRequirements: { wcagLevel: 'AA' },
      validationStatus: 'draft',
    };
  }

  it('blocks `flat-layout` for a single flat Stack of leaf instances (no depth≥2 layout)', () => {
    const result = validateIRStructure(flatIr(), []);
    expect(result.passed).toBe(false);
    expect(result.blocking.some((v: { code: string }) => v.code === 'flat-layout')).toBe(true);
  });

  it('does NOT block `flat-layout` once the section carries a depth≥2 layout tree', () => {
    const ir = flatIr();
    const sections = ir.sections as Array<Record<string, unknown>>;
    sections[0].layout = {
      kind: 'layout',
      primitive: 'stack',
      gap: '4',
      children: [
        {
          kind: 'layout',
          primitive: 'grid',
          gap: '2',
          columns: { S: '4', L: '12' },
          children: [{ id: 'i1', type: 'Button', props: { children: 'A' } }],
        },
      ],
    };
    const result = validateIRStructure(ir, []);
    expect(result.blocking.some((v: { code: string }) => v.code === 'flat-layout')).toBe(false);
  });

  it('blocks `empty-section-copy` for a section with no substantive headline/body copy', () => {
    const ir = flatIr();
    // Strip the substantive copy → empty-section-copy must fire.
    ir.content = {};
    const result = validateIRStructure(ir, []);
    expect(result.passed).toBe(false);
    expect(result.blocking.some((v: { code: string }) => v.code === 'empty-section-copy')).toBe(true);
  });

  /** Build a valid (non-flat, copy-bearing) IR whose grid uses `cols` columns. */
  function gridIr(cols: unknown): Record<string, unknown> {
    const ir = flatIr();
    const sections = ir.sections as Array<Record<string, unknown>>;
    sections[0].layout = {
      kind: 'layout',
      primitive: 'stack',
      gap: '4',
      children: [
        {
          kind: 'layout',
          primitive: 'grid',
          gap: '2',
          columns: cols,
          children: [{ id: 'i1', type: 'Button', props: { children: 'A' } }],
        },
      ],
    };
    return ir;
  }

  it('blocks `responsive-grid-misuse` for a grid with too many columns on mobile (S)', () => {
    const result = validateIRStructure(gridIr({ S: '4', M: '4', L: '4' }), []);
    expect(result.blocking.some((v: { code: string }) => v.code === 'responsive-grid-misuse')).toBe(true);
  });

  it('blocks `responsive-grid-misuse` for a bare numeric column count applied to all breakpoints', () => {
    const result = validateIRStructure(gridIr(4), []);
    expect(result.blocking.some((v: { code: string }) => v.code === 'responsive-grid-misuse')).toBe(true);
  });

  it('does NOT block `responsive-grid-misuse` when the grid collapses on mobile (S ≤ 2)', () => {
    const result = validateIRStructure(gridIr({ S: '1', M: '2', L: '4' }), []);
    expect(result.blocking.some((v: { code: string }) => v.code === 'responsive-grid-misuse')).toBe(false);
  });
});

// --- (2) placeholder-content — AST string-prop path -----------------------

describe('validateAst — placeholder-content blocking (QUAL-04 / RED)', () => {
  /** A registered Button carrying one content-ish prop value. */
  function buttonWithContent(prop: string, value: string): ArtifactAst {
    return {
      imports: [{ source: '@oneui/ui/components/Button', imported: 'Button', local: 'Button' }],
      root: { id: 'r', kind: 'component', type: 'Button', props: { [prop]: value }, children: [] },
    };
  }

  it('blocks a `placehold.co` placeholder image URL on a content prop', () => {
    const result = validateAst(buttonWithContent('src', 'https://placehold.co/600x400'));
    expect(result.passed).toBe(false);
    expect(result.blocking.some((v) => v.code === 'placeholder-content')).toBe(true);
  });

  it("blocks a humanized backfill placeholder string ('<Section> item')", () => {
    const result = validateAst(buttonWithContent('children', 'Hero item'));
    expect(result.passed).toBe(false);
    expect(result.blocking.some((v) => v.code === 'placeholder-content')).toBe(true);
  });

  it('blocks a content prop named in the threaded backfilled[] list (isContent:true)', () => {
    const ast = buttonWithContent('children', 'Some seemingly-fine copy');
    // The backfilled[] provenance (from irGenerator) marks this instance's
    // `children` as a backfilled CONTENT prop → it must block even though the
    // string itself does not match a placeholder pattern.
    const result = validateAst(ast, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      backfilled: [{ instanceId: 'r', propName: 'children', isContent: true }],
    } as never);
    expect(result.passed).toBe(false);
    expect(result.blocking.some((v) => v.code === 'placeholder-content')).toBe(true);
  });

  it('a backfilled STRUCTURAL prop (isContent:false) only flags — never blocks', () => {
    const ast = buttonWithContent('variant', 'bold');
    const result = validateAst(ast, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      backfilled: [{ instanceId: 'r', propName: 'variant', isContent: false }],
    } as never);
    // A structural backfill is acceptable output — placeholder-content must NOT fire.
    expect(result.blocking.some((v) => v.code === 'placeholder-content')).toBe(false);
  });
});

// --- (3) STRUCTURAL_LAYOUT_TYPES allow + literal backstop + REG-03 ----------

describe('validateAst — STRUCTURAL_LAYOUT_TYPES allow for Container/Grid (LAYOUT-05 / RED)', () => {
  /** A Container layout node carrying one layout prop + one child. */
  function containerWithGap(gap: string, child?: ArtifactAst['root']): ArtifactAst {
    return {
      imports: [{ source: '@oneui/ui/components/Container', imported: 'Container', local: 'Container' }],
      root: {
        id: 'c',
        kind: 'component',
        type: 'Container',
        props: { gap },
        children: child ? [child] : [],
      },
    };
  }

  it('Container with token `gap:"4"` passes (skips the empty-meta prop allowlist)', () => {
    // Container/Grid have EMPTY generated-prop meta; without the structural-allow
    // this would wrongly trip `invalid-prop`. In RED it does exactly that.
    const result = validateAst(containerWithGap('4'));
    expect(result.passed).toBe(true);
    expect(result.blocking.some((v) => v.code === 'invalid-prop' && v.offender === 'gap')).toBe(false);
  });

  it('Container with literal `gap:"16px"` still BLOCKS via checkLiteralHook (token backstop)', () => {
    const result = validateAst(containerWithGap('16px'));
    expect(result.passed).toBe(false);
    expect(result.blocking.some((v) => v.code === 'literal-value-hook')).toBe(true);
  });

  it('an unregistered component child of a layout node STILL blocks (REG-03 not exempted)', () => {
    const result = validateAst(
      containerWithGap('4', {
        id: 'x',
        kind: 'component',
        type: 'FancyHero',
        props: {},
        children: [],
      }),
    );
    expect(result.passed).toBe(false);
    expect(result.blocking.some((v) => v.code === 'unregistered-component' && v.offender === 'FancyHero')).toBe(true);
  });
});
