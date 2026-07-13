/**
 * templates.test.ts
 *
 * Tests for the AST template system: template validity,
 * registry completeness, and code generation integration.
 */

import { describe, it, expect } from 'vitest';
import {
  TEMPLATE_REGISTRY,
  COMPOSITION_TEMPLATES,
  getTemplatesForComponent,
  getAllTemplates,
} from '../index';
import { astToReact } from '../../codegen/astToReact';
import type { ASTRoot, ASTNode } from '../../types/componentAST';

// ---------------------------------------------------------------------------
// Template validity
// ---------------------------------------------------------------------------

/** Recursively collect all node IDs in a tree */
function collectNodeIds(node: ASTNode): string[] {
  const ids = [node.id];
  if ('children' in node) {
    for (const child of node.children) {
      ids.push(...collectNodeIds(child));
    }
  }
  return ids;
}

describe('Template validity', () => {
  const allTemplates = getAllTemplates();

  it('has at least 15 templates total', () => {
    expect(allTemplates.length).toBeGreaterThanOrEqual(15);
  });

  it('every template has required fields', () => {
    for (const template of allTemplates) {
      expect(template.version).toBe(1);
      expect(template.name).toBeTruthy();
      expect(template.root).toBeDefined();
      expect(template.root.id).toBeTruthy();
      expect(template.root.kind).toBeTruthy();
    }
  });

  it('every template has unique node IDs within its tree', () => {
    for (const template of allTemplates) {
      const ids = collectNodeIds(template.root);
      const unique = new Set(ids);
      expect(unique.size, `duplicate IDs in "${template.name}": ${ids}`).toBe(ids.length);
    }
  });

  it('every template generates valid JSX', () => {
    for (const template of allTemplates) {
      const code = astToReact(template, { includeImports: false });
      expect(code, `empty output for "${template.name}"`).toBeTruthy();
      // Should not contain "undefined" or "null" as raw text in JSX
      expect(code).not.toContain('>undefined<');
      expect(code).not.toContain('>null<');
    }
  });

  it('component templates reference valid component types', () => {
    const validTypes = new Set([
      'Button', 'IconButton', 'Avatar',
      'Checkbox', 'Radio', 'Switch', 'Stepper',
      'IconContained', 'Icon', 'Image',
      'CounterBadge', 'IndicatorBadge',
    ]);

    function checkComponentTypes(node: ASTNode) {
      if (node.kind === 'component') {
        expect(validTypes.has(node.type), `unknown component type "${node.type}" in template`).toBe(true);
      }
      if ('children' in node) {
        for (const child of node.children) {
          checkComponentTypes(child);
        }
      }
    }

    for (const template of allTemplates) {
      checkComponentTypes(template.root);
    }
  });
});

// ---------------------------------------------------------------------------
// Template registry
// ---------------------------------------------------------------------------

describe('TEMPLATE_REGISTRY', () => {
  it('has entries for at least 8 component slugs', () => {
    expect(Object.keys(TEMPLATE_REGISTRY).length).toBeGreaterThanOrEqual(8);
  });

  it('every entry is a non-empty array', () => {
    for (const [slug, templates] of Object.entries(TEMPLATE_REGISTRY)) {
      expect(Array.isArray(templates), `${slug} should be an array`).toBe(true);
      expect(templates.length, `${slug} should have at least 1 template`).toBeGreaterThan(0);
    }
  });

  it('covers all major component slugs', () => {
    const expected = ['button', 'icon-button', 'checkbox', 'switch', 'avatar', 'icon-contained', 'image'];
    for (const slug of expected) {
      expect(TEMPLATE_REGISTRY[slug], `missing templates for "${slug}"`).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// getTemplatesForComponent
// ---------------------------------------------------------------------------

describe('getTemplatesForComponent', () => {
  it('returns templates for known slugs', () => {
    expect(getTemplatesForComponent('button').length).toBeGreaterThan(0);
    expect(getTemplatesForComponent('switch').length).toBeGreaterThan(0);
  });

  it('returns empty array for unknown slugs', () => {
    expect(getTemplatesForComponent('nonexistent')).toEqual([]);
    expect(getTemplatesForComponent('')).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Composition templates
// ---------------------------------------------------------------------------

describe('COMPOSITION_TEMPLATES', () => {
  it('has at least 2 compositions', () => {
    expect(COMPOSITION_TEMPLATES.length).toBeGreaterThanOrEqual(2);
  });

  it('compositions use multiple component types', () => {
    for (const composition of COMPOSITION_TEMPLATES) {
      const types = new Set<string>();
      function collect(node: ASTNode) {
        if (node.kind === 'component') types.add(node.type);
        if ('children' in node) node.children.forEach(collect);
      }
      collect(composition.root);
      expect(types.size, `"${composition.name}" should use multiple component types`).toBeGreaterThanOrEqual(2);
    }
  });

  it('compositions generate code with imports', () => {
    for (const composition of COMPOSITION_TEMPLATES) {
      const code = astToReact(composition);
      expect(code).toContain('import');
      expect(code).toContain("from '@oneui/ui'");
    }
  });
});

// ---------------------------------------------------------------------------
// Code generation integration
// ---------------------------------------------------------------------------

describe('Code generation from templates', () => {
  it('Button basic generates clean JSX with import', () => {
    const templates = getTemplatesForComponent('button');
    const basic = templates[0];
    const code = astToReact(basic);
    expect(code).toContain("import { Button } from '@oneui/ui'");
    expect(code).toContain('<Button');
    expect(code).toContain('variant="bold"');
  });

  it('Settings form generates multi-component imports', () => {
    const settingsForm = COMPOSITION_TEMPLATES.find((t) => t.name === 'Settings Form');
    expect(settingsForm).toBeDefined();
    const code = astToReact(settingsForm!);
    expect(code).toContain('Button');
    expect(code).toContain('Checkbox');
    expect(code).toContain('Switch');
  });
});
