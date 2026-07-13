import { describe, it, expect } from 'vitest';
import { irToAst, collectNodeKinds } from './irToAst';
import { makeValidIr } from './__fixtures__/validIr';

describe('irToAst — registry-safe mapping (IR-03 / Pitfall 2)', () => {
  it('produces an ASTRoot with version 1', () => {
    const ast = irToAst(makeValidIr());
    expect(ast.version).toBe(1);
    expect(ast.root.kind).toBe('component');
  });

  it('emits ONLY component and text nodes — never element', () => {
    const ast = irToAst(makeValidIr());
    const kinds = collectNodeKinds(ast);
    expect(kinds.length).toBeGreaterThan(0);
    for (const kind of kinds) {
      expect(['component', 'text']).toContain(kind);
    }
    expect(kinds).not.toContain('element');
  });

  it('maps a layout-less section to a registered Container (NOT an unregistered Stack), not a raw tag', () => {
    const ast = irToAst(makeValidIr());
    const root = ast.root;
    expect(root.kind).toBe('component');
    if (root.kind !== 'component') return;
    expect(root.type).toBe('Container');
    expect(root.props).toMatchObject({ layout: 'flex', direction: 'column' });
    const section = root.children[0];
    expect(section.kind).toBe('component');
    if (section.kind !== 'component') return;
    // WR-02 fix: the fallback must emit a REGISTERED component. An unregistered
    // 'Stack' here hard-blocked validateAst (unregistered-component) on every
    // real run where the generator did not attach an explicit `layout`.
    expect(section.type).toBe('Container');
    expect(section.props).toMatchObject({ layout: 'flex', direction: 'column' });
    // No node anywhere carries a `tag` field (element-only property).
    const json = JSON.stringify(ast);
    expect(/"kind"\s*:\s*"element"/.test(json)).toBe(false);
  });

  it('maps an instance slot string to a TextASTNode', () => {
    const ast = irToAst(makeValidIr());
    const kinds = collectNodeKinds(ast);
    expect(kinds).toContain('text'); // the "Get started" button label
  });
});

// ===========================================================================
// Wave 0 (04.2-01) RED — layout primitive → Container/Grid compile contract
// (LAYOUT-05 + Pitfall 1 old-flat-IR round-trip).
//
// PINS the contract Plan 02 (irToAst.ts layoutNodeToComponentNode) drives to
// GREEN. These MUST fail now: today `irToAst` hardcodes a `Stack` wrap per
// section (irToAst.ts:95-114) and has NO `layout` primitive branch, so a
// `primitive:'stack'` node neither exists in the IR type nor compiles to a
// `Container`. The fixtures below carry an additive `layout` tree on a section.
// ===========================================================================

/** Build an IR whose first section carries an additive `layout` tree. */
function irWithLayout(): Record<string, unknown> {
  const ir = makeValidIr() as Record<string, unknown>;
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
        children: [{ id: 'btn-1', type: 'Button', props: { variant: 'bold' }, slots: { children: 'Go' } }],
      },
    ],
  };
  return ir;
}

/** Walk every ComponentASTNode collecting its `type` — assertion helper. */
function collectComponentTypes(root: ReturnType<typeof irToAst>): string[] {
  const types: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const visit = (node: any): void => {
    if (node?.kind === 'component') {
      types.push(node.type);
      (node.children ?? []).forEach(visit);
    }
  };
  visit(root.root);
  return types;
}

describe('layout primitive compile (LAYOUT-05 / RED)', () => {
  it('compiles a primitive:"stack" layout node to a Container with direction:"column"', () => {
    const ast = irToAst(irWithLayout() as never);
    const types = collectComponentTypes(ast);
    // The stack primitive must materialise as a registry Container (NOT 'Stack').
    expect(types).toContain('Container');
    // Find the stack-derived Container and assert its column direction.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const findByType = (node: any, type: string): any => {
      if (node?.kind === 'component' && node.type === type) return node;
      for (const c of node?.children ?? []) {
        const hit = findByType(c, type);
        if (hit) return hit;
      }
      return null;
    };
    const container = findByType(ast.root, 'Container');
    expect(container?.props?.layout).toBe('flex');
    expect(container?.props?.direction).toBe('column');
  });

  it('compiles primitive:"row" layout nodes to flex Containers with wrap enabled', () => {
    const ir = irWithLayout() as any;
    ir.sections[0].layout = {
      kind: 'layout',
      primitive: 'row',
      wrap: true,
      children: [{ id: 'btn-1', type: 'Button', props: { variant: 'bold' }, slots: { children: 'Go' } }],
    };
    const ast = irToAst(ir as never);
    const section = ast.root.children[0] as any;
    expect(section.type).toBe('Container');
    expect(section.props).toMatchObject({ layout: 'flex', direction: 'row', wrap: true });
  });

  it('compiles a primitive:"grid" layout node to a Grid carrying responsive columns', () => {
    const ast = irToAst(irWithLayout() as never);
    const types = collectComponentTypes(ast);
    expect(types).toContain('Grid');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const findByType = (node: any, type: string): any => {
      if (node?.kind === 'component' && node.type === type) return node;
      for (const c of node?.children ?? []) {
        const hit = findByType(c, type);
        if (hit) return hit;
      }
      return null;
    };
    const grid = findByType(ast.root, 'Grid');
    expect(grid?.props?.columns).toEqual({ S: '4', L: '12' });
  });

  it('routes a column-bearing node to Grid even when mistagged as row/stack (responsive-grid fix)', () => {
    // Regression: the model sometimes tags a multi-column section as 'row'/'stack'
    // but sets `columns`. Routing that to a flex Container silently DROPS the
    // columns and collapses the grid. Any column-bearing node must compile to Grid.
    const ir = irWithLayout() as any;
    ir.sections[0].layout = {
      kind: 'layout',
      primitive: 'row',
      columns: { S: '1', M: '2', L: '4' },
      children: [
        { id: 'c-1', type: 'Button', props: { variant: 'bold' }, slots: { children: 'A' } },
        { id: 'c-2', type: 'Button', props: { variant: 'bold' }, slots: { children: 'B' } },
      ],
    };
    const ast = irToAst(ir as never);
    const section = ast.root.children[0] as any;
    expect(section.type).toBe('Grid');
    expect(section.props.columns).toEqual({ S: '1', M: '2', L: '4' });
    // Must NOT carry flex layout props that would fight the grid.
    expect(section.props.layout).toBeUndefined();
    expect(section.props.direction).toBeUndefined();
  });

  it('emits NO `element` kind and NO invented Stack/Row/Spacer component type (LAYOUT-05)', () => {
    const ast = irToAst(irWithLayout() as never);
    const json = JSON.stringify(ast);
    expect(/"kind"\s*:\s*"element"/.test(json)).toBe(false);
    const types = collectComponentTypes(ast);
    // These three do NOT exist in @oneui/ui — the compiler must never emit them.
    expect(types).not.toContain('Stack');
    expect(types).not.toContain('Row');
    expect(types).not.toContain('Spacer');
  });

  it('round-trips an OLD flat IR (no layout field) through irToAst unchanged (Pitfall 1)', () => {
    // The pre-04.2 flat IR still compiles to a component tree with no element
    // node — additive `layout` support must not regress the legacy path.
    const ast = irToAst(makeValidIr());
    const kinds = collectNodeKinds(ast);
    for (const kind of kinds) expect(['component', 'text']).toContain(kind);
    expect(kinds).not.toContain('element');
  });
});
