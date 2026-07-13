/**
 * astToReact.test.ts
 *
 * Tests for the AST → React/JSX source compiler.
 */

import { describe, it, expect } from 'vitest';
import { astToReact, astToReactComponent } from '../astToReact';
import type { ASTRoot, ASTNode } from '../../types/componentAST';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRoot(root: ASTNode, opts?: Partial<Omit<ASTRoot, 'root'>>): ASTRoot {
  return { version: 1, name: 'test', root, ...opts };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('astToReact', () => {
  describe('text nodes', () => {
    it('renders plain text', () => {
      const tree = makeRoot({ id: 't1', kind: 'text', text: 'Hello World' });
      expect(astToReact(tree, { includeImports: false })).toBe('Hello World');
    });
  });

  describe('element nodes', () => {
    it('renders self-closing element with no children', () => {
      const tree = makeRoot({
        id: 'e1',
        kind: 'element',
        tag: 'div',
        props: { className: 'wrapper' },
        children: [],
      });
      expect(astToReact(tree, { includeImports: false })).toBe(
        '<div className="wrapper" />'
      );
    });

    it('renders element with text child', () => {
      const tree = makeRoot({
        id: 'e1',
        kind: 'element',
        tag: 'span',
        props: {},
        children: [{ id: 't1', kind: 'text', text: 'inside' }],
      });
      const result = astToReact(tree, { includeImports: false });
      expect(result).toContain('<span>');
      expect(result).toContain('inside');
      expect(result).toContain('</span>');
    });

    it('renders nested elements with indentation', () => {
      const tree = makeRoot({
        id: 'e1',
        kind: 'element',
        tag: 'div',
        props: {},
        children: [
          {
            id: 'e2',
            kind: 'element',
            tag: 'p',
            props: {},
            children: [{ id: 't1', kind: 'text', text: 'paragraph' }],
          },
        ],
      });
      const result = astToReact(tree, { includeImports: false, indent: 2 });
      expect(result).toContain('<div>');
      expect(result).toContain('  <p>');
      expect(result).toContain('</div>');
    });
  });

  describe('component nodes', () => {
    it('renders self-closing component', () => {
      const tree = makeRoot({
        id: 'c1',
        kind: 'component',
        type: 'Button',
        props: { variant: 'bold', size: 10 },
        children: [],
      });
      const result = astToReact(tree, { includeImports: false });
      expect(result).toBe('<Button variant="bold" size={10} />');
    });

    it('renders component with text child inline', () => {
      const tree = makeRoot({
        id: 'c1',
        kind: 'component',
        type: 'Button',
        props: { variant: 'ghost' },
        children: [{ id: 't1', kind: 'text', text: 'Click me' }],
      });
      const result = astToReact(tree, { includeImports: false });
      expect(result).toBe('<Button variant="ghost">Click me</Button>');
    });

    it('renders component with multiple children', () => {
      const tree = makeRoot({
        id: 'c1',
        kind: 'component',
        type: 'Button',
        props: {},
        children: [
          { id: 'c2', kind: 'component', type: 'Icon', props: { name: 'add' }, children: [] },
          { id: 't1', kind: 'text', text: 'Add' },
        ],
      });
      const result = astToReact(tree, { includeImports: false });
      expect(result).toContain('<Button>');
      expect(result).toContain('<Icon name="add" />');
      expect(result).toContain('Add');
      expect(result).toContain('</Button>');
    });
  });

  describe('prop serialization', () => {
    it('renders boolean true as bare prop', () => {
      const tree = makeRoot({
        id: 'c1',
        kind: 'component',
        type: 'Button',
        props: { disabled: true },
        children: [],
      });
      const result = astToReact(tree, { includeImports: false });
      expect(result).toBe('<Button disabled />');
    });

    it('renders boolean false as expression', () => {
      const tree = makeRoot({
        id: 'c1',
        kind: 'component',
        type: 'Button',
        props: { disabled: false },
        children: [],
      });
      const result = astToReact(tree, { includeImports: false });
      expect(result).toBe('<Button disabled={false} />');
    });

    it('renders null as expression', () => {
      const tree = makeRoot({
        id: 'c1',
        kind: 'component',
        type: 'Button',
        props: { value: null },
        children: [],
      });
      const result = astToReact(tree, { includeImports: false });
      expect(result).toBe('<Button value={null} />');
    });

    it('renders object props as JSON', () => {
      const tree = makeRoot({
        id: 'c1',
        kind: 'component',
        type: 'Button',
        props: { style: { color: 'red' } },
        children: [],
      });
      const result = astToReact(tree, { includeImports: false });
      expect(result).toContain('style={{"color":"red"}}');
    });

    it('escapes quotes in string props', () => {
      const tree = makeRoot({
        id: 'c1',
        kind: 'component',
        type: 'Button',
        props: { 'aria-label': 'Say "hello"' },
        children: [],
      });
      const result = astToReact(tree, { includeImports: false });
      expect(result).toContain('aria-label="Say \\"hello\\""');
    });
  });

  describe('import generation', () => {
    it('generates import statement for used components', () => {
      const tree = makeRoot({
        id: 'c1',
        kind: 'component',
        type: 'Button',
        props: { variant: 'bold' },
        children: [{ id: 't1', kind: 'text', text: 'Go' }],
      });
      const result = astToReact(tree);
      expect(result).toContain("import { Button } from '@oneui/ui';");
    });

    it('collects multiple component imports sorted', () => {
      const tree = makeRoot({
        id: 'e1',
        kind: 'element',
        tag: 'div',
        props: {},
        children: [
          { id: 'c1', kind: 'component', type: 'IconButton', props: {}, children: [] },
          { id: 'c2', kind: 'component', type: 'Button', props: {}, children: [] },
          { id: 'c3', kind: 'component', type: 'Avatar', props: {}, children: [] },
        ],
      });
      const result = astToReact(tree);
      expect(result).toContain("import { Avatar, Button, IconButton } from '@oneui/ui';");
    });

    it('deduplicates repeated component types', () => {
      const tree = makeRoot({
        id: 'e1',
        kind: 'element',
        tag: 'div',
        props: {},
        children: [
          { id: 'c1', kind: 'component', type: 'Button', props: {}, children: [] },
          { id: 'c2', kind: 'component', type: 'Button', props: {}, children: [] },
        ],
      });
      const result = astToReact(tree);
      expect(result).toContain("import { Button } from '@oneui/ui';");
      // Only one import line
      expect(result.match(/import/g)?.length).toBe(1);
    });

    it('omits imports when includeImports is false', () => {
      const tree = makeRoot({
        id: 'c1',
        kind: 'component',
        type: 'Button',
        props: {},
        children: [],
      });
      const result = astToReact(tree, { includeImports: false });
      expect(result).not.toContain('import');
    });

    it('omits imports when only elements and text (no components)', () => {
      const tree = makeRoot({
        id: 'e1',
        kind: 'element',
        tag: 'div',
        props: {},
        children: [{ id: 't1', kind: 'text', text: 'Hello' }],
      });
      const result = astToReact(tree);
      expect(result).not.toContain('import');
    });

    it('uses custom importSource', () => {
      const tree = makeRoot({
        id: 'c1',
        kind: 'component',
        type: 'Button',
        props: {},
        children: [],
      });
      const result = astToReact(tree, { importSource: '@mylib/ui' });
      expect(result).toContain("from '@mylib/ui'");
    });
  });

  describe('indentation', () => {
    it('respects custom indent size', () => {
      const tree = makeRoot({
        id: 'e1',
        kind: 'element',
        tag: 'div',
        props: {},
        children: [
          { id: 't1', kind: 'text', text: 'hello' },
        ],
      });
      const result = astToReact(tree, { includeImports: false, indent: 4 });
      expect(result).toContain('    hello');
    });
  });
});

// ---------------------------------------------------------------------------
// astToReactComponent
// ---------------------------------------------------------------------------

describe('astToReactComponent', () => {
  it('generates a complete React function component', () => {
    const tree = makeRoot({
      id: 'c1',
      kind: 'component',
      type: 'Button',
      props: { variant: 'bold' },
      children: [{ id: 't1', kind: 'text', text: 'Go' }],
    });
    const result = astToReactComponent(tree);
    expect(result).toContain("import React from 'react'");
    expect(result).toContain("import { Button } from '@oneui/ui'");
    expect(result).toContain('export function GeneratedComponent()');
    expect(result).toContain('return (');
    expect(result).toContain('<Button');
  });

  it('uses custom component name', () => {
    const tree = makeRoot({
      id: 'c1',
      kind: 'component',
      type: 'Button',
      props: {},
      children: [],
    });
    const result = astToReactComponent(tree, { componentName: 'MyScreen' });
    expect(result).toContain('export function MyScreen()');
  });

  it('includes React import even without components', () => {
    const tree = makeRoot({
      id: 'e1',
      kind: 'element',
      tag: 'div',
      props: {},
      children: [{ id: 't1', kind: 'text', text: 'Hello' }],
    });
    const result = astToReactComponent(tree);
    expect(result).toContain("import React from 'react'");
    expect(result).toContain('export function GeneratedComponent()');
  });
});
