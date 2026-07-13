import { describe, it, expect } from 'vitest';
import {
  COMPONENT_PROPS_SCHEMAS,
  getComponentPropsSchema,
  getComponentSchemaJSON,
  validateCanvasResponse,
  validateASTComponentProps,
} from '../componentSchemas';
import type { ASTRoot } from '../../types/componentAST';

describe('Button schema — derived from Button.shared.ts', () => {
  const schema = COMPONENT_PROPS_SCHEMAS.Button;

  it('accepts canonical standard button props', () => {
    const result = schema.safeParse({
      attention: 'high',
      size: 10,
      appearance: 'primary',
      children: 'Click me',
    });
    expect(result.success).toBe(true);
  });

  it('accepts "m" t-shirt size alias (canonical)', () => {
    const result = schema.safeParse({
      attention: 'medium',
      size: 'm',
      children: 'Click',
    });
    expect(result.success).toBe(true);
  });

  it('rejects deprecated size alias "2xs" — excluded from generated schema', () => {
    const result = schema.safeParse({
      size: '2xs',
      children: 'Click',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid attention value', () => {
    const result = schema.safeParse({
      attention: 'huge',
      children: 'Click',
    });
    expect(result.success).toBe(false);
  });

  it('rejects unknown prop (strict mode)', () => {
    const result = schema.safeParse({
      children: 'Click',
      bogusProp: true,
    });
    expect(result.success).toBe(false);
  });

  it('requires children on standard branch', () => {
    const result = schema.safeParse({
      attention: 'high',
    });
    expect(result.success).toBe(false);
  });

  // `iconOnly` branch tests were removed when Button's iconOnly prop was
  // retired in favour of the dedicated <IconButton> primitive. Label-less
  // buttons are <IconButton>, not <Button iconOnly />.
});

describe('getComponentPropsSchema', () => {
  it('returns a schema for a registered component', () => {
    expect(getComponentPropsSchema('Button')).toBeDefined();
  });

  it('returns undefined for an unregistered component', () => {
    expect(getComponentPropsSchema('NotARealComponent')).toBeUndefined();
  });
});

describe('getComponentSchemaJSON', () => {
  it('returns a JSON Schema object for Button', () => {
    const json = getComponentSchemaJSON('Button');
    expect(json).toBeDefined();
    expect(typeof json).toBe('object');
  });
});

describe('validateCanvasResponse', () => {
  it('returns no errors for a valid tree', () => {
    const errors = validateCanvasResponse({
      nodes: [
        { type: 'Button', props: { attention: 'high', children: 'Click' } },
      ],
    });
    expect(errors).toEqual([]);
  });

  it('reports validation errors with paths', () => {
    const errors = validateCanvasResponse({
      nodes: [
        { type: 'Button', props: { attention: 'huge', children: 'Click' } },
      ],
    });
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].type).toBe('Button');
    expect(errors[0].path).toContain('nodes[0]');
  });

  it('silently skips unknown component types', () => {
    const errors = validateCanvasResponse({
      nodes: [{ type: 'UnknownComponent', props: { foo: 'bar' } }],
    });
    expect(errors).toEqual([]);
  });

  it('validates nested children', () => {
    const errors = validateCanvasResponse({
      nodes: [
        {
          type: 'Container',
          children: [
            { type: 'Button', props: { attention: 'high', children: 'Nested' } },
            { type: 'Button', props: { attention: 'bogus', children: 'Bad' } },
          ],
        },
      ],
    });
    expect(errors.length).toBe(1);
    expect(errors[0].path).toContain('children');
  });
});

describe('validateASTComponentProps (canonical AST shape)', () => {
  it('accepts a valid AST tree', () => {
    const ast: ASTRoot = {
      version: 1,
      name: 'hero',
      root: {
        id: '1',
        kind: 'element',
        tag: 'div',
        props: {},
        children: [
          {
            id: '2',
            kind: 'component',
            type: 'Button',
            props: { attention: 'high', children: 'Continue' },
            children: [],
          },
        ],
      },
    };
    expect(validateASTComponentProps(ast)).toEqual([]);
  });

  it('flags invalid component props with tree path', () => {
    const ast: ASTRoot = {
      version: 1,
      name: 'hero',
      root: {
        id: '1',
        kind: 'component',
        type: 'Button',
        props: { attention: 'huge', children: 'Bad' },
        children: [],
      },
    };
    const errors = validateASTComponentProps(ast);
    expect(errors.length).toBe(1);
    expect(errors[0].type).toBe('Button');
  });

  it('skips unknown component types without erroring', () => {
    const ast: ASTRoot = {
      version: 1,
      name: 'hero',
      root: {
        id: '1',
        kind: 'component',
        type: 'NotAComponent',
        props: { whatever: 'value' },
        children: [],
      },
    };
    expect(validateASTComponentProps(ast)).toEqual([]);
  });
});
