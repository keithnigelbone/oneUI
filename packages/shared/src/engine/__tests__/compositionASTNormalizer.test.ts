import { describe, expect, it } from 'vitest';
import type { ASTRoot } from '../../types/componentAST';
import { normalizeCompositionAST } from '../compositionASTNormalizer';
import { validateComposition } from '../compositionValidator';

describe('normalizeCompositionAST', () => {
  it('repairs unsupported compound component names before render', () => {
    const input: ASTRoot = {
      version: 1,
      name: 'Broken carousel',
      root: {
        id: 'root',
        kind: 'element',
        tag: 'div',
        props: {},
        children: [
          {
            id: 'carousel-root',
            kind: 'component',
            type: 'Carousel.Root',
            props: {},
            children: [
              {
                id: 'slide-1',
                kind: 'component',
                type: 'Carousel.Slide',
                props: {},
                children: [{ id: 'slide-copy', kind: 'text', text: 'Deal of the day' }],
              },
            ],
          },
        ],
      },
    };

    const { ast, issues } = normalizeCompositionAST(input);

    expect(issues.map((issue) => issue.kind)).toContain('compound-component');
    expect((ast.root as any).children[0].type).toBe('Carousel');
    expect((ast.root as any).children[0].children[0].kind).toBe('element');
    expect(validateComposition(ast).valid).toBe(true);
  });

  it('normalizes icon and image props to renderable OneUI output', () => {
    const input: ASTRoot = {
      version: 1,
      name: 'Assets',
      root: {
        id: 'root',
        kind: 'element',
        tag: 'div',
        props: {},
        children: [
          {
            id: 'bad-icon',
            kind: 'component',
            type: 'Icon',
            props: { icon: 'shopping-basket' },
            children: [],
          },
          {
            id: 'image',
            kind: 'component',
            type: 'Image',
            props: {},
            children: [],
          },
        ],
      },
    };

    const { ast, issues } = normalizeCompositionAST(input);
    const [icon, image] = (ast.root as any).children;

    expect(issues.map((issue) => issue.kind)).toEqual(
      expect.arrayContaining(['icon-name', 'image-prop']),
    );
    expect(icon.props.name).toBe('image');
    expect(icon.props.icon).toBeUndefined();
    expect(image.props.src).toBeTruthy();
    expect(image.props.alt).toBeTruthy();
    expect(validateComposition(ast).valid).toBe(true);
  });

  it('repairs invented logo component names to the real Logo component', () => {
    const input: ASTRoot = {
      version: 1,
      name: 'Logo',
      root: {
        id: 'logo',
        kind: 'component',
        type: 'JioLogo',
        props: {},
        children: [],
      },
    };

    const { ast, issues } = normalizeCompositionAST(input);

    expect(ast.root.kind).toBe('component');
    expect(ast.root.kind === 'component' ? ast.root.type : null).toBe('Logo');
    expect(ast.root.kind === 'component' ? ast.root.props.alt : null).toBe('Brand logo');
    expect(ast.root.kind === 'component' ? ast.root.props.src : null).toBe('/JioLogo.svg');
    expect(ast.root.kind === 'component' ? ast.root.children.length : null).toBe(0);
    expect(issues.map((issue) => issue.kind)).toEqual(
      expect.arrayContaining(['component-alias', 'image-prop']),
    );
    expect(validateComposition(ast).valid).toBe(true);
  });

  it('keeps inline display components intrinsic', () => {
    const input: ASTRoot = {
      version: 1,
      name: 'Badge',
      root: {
        id: 'badge',
        kind: 'component',
        type: 'Badge',
        props: {
          fullWidth: true,
          style: {
            width: '100%',
            display: 'block',
            marginTop: 'var(--Spacing-3-5)',
          },
        },
        children: [{ id: 'badge-text', kind: 'text', text: '8 min' }],
      },
    };

    const { ast, issues } = normalizeCompositionAST(input);

    expect(ast.root.kind).toBe('component');
    expect(ast.root.kind === 'component' ? ast.root.props.fullWidth : null).toBeUndefined();
    expect(ast.root.kind === 'component' ? (ast.root.props.style as any).width : null).toBeUndefined();
    expect(ast.root.kind === 'component' ? (ast.root.props.style as any).display : null).toBeUndefined();
    expect(ast.root.kind === 'component' ? (ast.root.props.style as any).marginTop : null).toBe('var(--Spacing-3-5)');
    expect(issues.map((issue) => issue.message).join(' ')).toContain('inline Badge');
  });
});
