import { describe, expect, it } from 'vitest';
import { makeValidIr } from '../ir/__fixtures__/validIr';
import { collectNodeKinds } from '../ir/irToAst';
import { CompositionSpec } from './schema';
import {
  collectCompositionComponents,
  compositionSpecToAst,
  irToCompositionSpec,
} from './converters';

describe('CompositionSpec converters', () => {
  it('bridges existing IR into a valid component spec', () => {
    const spec = irToCompositionSpec(makeValidIr());
    expect(CompositionSpec.safeParse(spec).success).toBe(true);
    expect(spec.version).toBe('1');
    expect(spec.brandId).toBe('jio');
    expect(collectCompositionComponents(spec)).toContain('Button');
  });

  it('converts spec to component-only AST with no element nodes', () => {
    const spec = irToCompositionSpec(makeValidIr());
    const ast = compositionSpecToAst(spec);
    const kinds = collectNodeKinds(ast);
    expect(kinds).toContain('component');
    expect(kinds).toContain('text');
    expect(kinds).not.toContain('element');
  });

  it('activates flex layout on root, section, row, and stack Containers', () => {
    const ir = makeValidIr();
    ir.sections[0].layout = {
      id: 'sec-layout',
      kind: 'layout',
      primitive: 'stack',
      direction: 'column',
      children: [
        {
          id: 'row-layout',
          kind: 'layout',
          primitive: 'row',
          wrap: true,
          children: [ir.sections[0].instances[0]],
        },
      ],
    };

    const spec = irToCompositionSpec(ir);
    const section = (spec.root.slots?.children as any[])[0];
    const row = section.slots.children[0];

    expect(spec.root.props).toMatchObject({ layout: 'flex', direction: 'column' });
    expect(section.props).toMatchObject({ layout: 'flex', direction: 'column' });
    expect(row.props).toMatchObject({ layout: 'flex', direction: 'row', wrap: true });
  });

  it('normalizes Surface mode into the canonical top-level surface field', () => {
    const spec = irToCompositionSpec(makeValidIr());
    const section = (spec.root.slots?.children as any[])[0];
    const surface = section.slots.children[0];
    expect(surface.component).toBe('Surface');
    expect(surface.surface).toBe('bold');
    expect(surface.props?.mode).toBeUndefined();
  });

  it('emits valid component props for canonical surface metadata', () => {
    const spec = irToCompositionSpec(makeValidIr());
    const ast = compositionSpecToAst(spec);
    const section = ast.root.children[0] as any;
    const surface = section.children[0] as any;

    expect(section.props.surface).toBe('bold');
    expect(section.props.surfaceMode).toBeUndefined();
    expect(surface.type).toBe('Surface');
    expect(surface.props.mode).toBe('bold');
    expect(surface.props.surfaceMode).toBeUndefined();
  });

  it('promotes generated Surface prop placeholders to the canonical surface field', () => {
    const ir = makeValidIr();
    const section = ir.sections[0];
    const surface = section.instances[0];
    surface.props = { surface: {} as any };
    section.layout = {
      id: 'sec-hero-layout',
      kind: 'layout',
      primitive: 'stack',
      direction: 'column',
      surfaceMode: 'bold',
      children: [surface],
    };

    const spec = irToCompositionSpec(ir);
    const sectionNode = (spec.root.slots?.children as any[])[0];
    const surfaceNode = sectionNode.slots.children[0];

    expect(CompositionSpec.safeParse(spec).success).toBe(true);
    expect(surfaceNode.component).toBe('Surface');
    expect(surfaceNode.surface).toBe('bold');
    expect(surfaceNode.props?.surface).toBeUndefined();
  });
});
