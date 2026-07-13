import { describe, it, expect } from 'vitest';
import { validateComposition } from '../compositionValidator';
import type { ASTNode, ASTRoot } from '../../types/componentAST';

// ---------------------------------------------------------------------------
// AST builders — keep tests readable. Each helper produces a node with a
// stable id derived from a counter so collision detection in `unique-ids`
// stays meaningful.
// ---------------------------------------------------------------------------

let idCounter = 0;
function nextId(prefix = 'n'): string {
  return `${prefix}-${++idCounter}`;
}

function comp(
  type: string,
  props: Record<string, unknown> = {},
  children: ASTNode[] = [],
  id = nextId(type.toLowerCase()),
): ASTNode {
  return { id, kind: 'component', type, props: props as never, children };
}

function el(
  tag: string,
  props: Record<string, unknown> = {},
  children: ASTNode[] = [],
  id = nextId(tag),
): ASTNode {
  return { id, kind: 'element', tag, props: props as never, children };
}

function txt(text: string, id = nextId('t')): ASTNode {
  return { id, kind: 'text', text };
}

function root(rootNode: ASTNode, surfaceMode?: string): ASTRoot {
  return { version: 1, name: 'test', root: rootNode, ...(surfaceMode ? { surfaceMode } : {}) };
}

function findCheck(result: ReturnType<typeof validateComposition>, id: string) {
  const c = result.checks.find((c) => c.id === id);
  if (!c) throw new Error(`check ${id} not found in result`);
  return c;
}

// ---------------------------------------------------------------------------
// Smoke: validator exposes all checks and shape is intact
// ---------------------------------------------------------------------------

describe('validateComposition — surface', () => {
  it('runs all checks', () => {
    const result = validateComposition(root(el('div', {}, [])));
    const ids = new Set(result.checks.map((c) => c.id));
    expect(ids).toEqual(
      new Set([
        'unique-ids',
        'component-existence',
        'required-children',
        'token-compliance',
        'surface-mode-validity',
        'icon-name-validity',
        'image-prop-completeness',
        'attention-hierarchy',
        'spacing-consistency',
        'missing-children',
        'decorative-border-on-surface',
        'surface-without-data-surface',
        'single-hero-per-region',
        'decorative-icons-density',
        'heading-typography-role',
        'emoji-as-icon',
      ]),
    );
  });

  it('empty div passes all warning checks', () => {
    const result = validateComposition(root(el('div')));
    expect(result.warningCount).toBe(0);
  });
});

describe('asset policy checks', () => {
  it('flags invented icon names', () => {
    const tree = root(comp('Icon', { name: 'basket' }));
    const check = findCheck(validateComposition(tree), 'icon-name-validity');
    expect(check.passed).toBe(false);
    expect(check.details).toContain('basket');
  });

  it('flags image nodes without source and alt text', () => {
    const tree = root(comp('Image', {}));
    const check = findCheck(validateComposition(tree), 'image-prop-completeness');
    expect(check.passed).toBe(false);
    expect(check.details).toContain('src');
    expect(check.details).toContain('alt');
  });

  it('flags logo nodes without accessible content', () => {
    const tree = root(comp('Logo', {}));
    const check = findCheck(validateComposition(tree), 'image-prop-completeness');
    expect(check.passed).toBe(false);
    expect(check.details).toContain('alt');
    expect(check.details).toContain('content');
  });
});

// ---------------------------------------------------------------------------
// Check 1: decorative-border-on-surface
// ---------------------------------------------------------------------------

describe('decorative-border-on-surface', () => {
  it('passes when border is on default surface', () => {
    const tree = root(
      el('div', {}, [
        el('div', { style: { border: '1px solid var(--Border-Subtle)' } }),
      ]),
    );
    expect(findCheck(validateComposition(tree), 'decorative-border-on-surface').passed).toBe(true);
  });

  it('flags border inside a Surface mode=bold', () => {
    const tree = root(
      comp('Surface', { mode: 'bold' }, [
        el('div', { style: { border: '1px solid var(--Border-Subtle)' } }),
      ]),
    );
    const check = findCheck(validateComposition(tree), 'decorative-border-on-surface');
    expect(check.passed).toBe(false);
    expect(check.details).toContain('surface=bold');
  });

  it('flags borderColor inside data-surface=subtle element', () => {
    const tree = root(
      el('section', { 'data-surface': 'subtle' }, [
        comp('Card', { style: { borderColor: 'var(--Primary-Stroke-Medium)' } }),
      ]),
    );
    expect(findCheck(validateComposition(tree), 'decorative-border-on-surface').passed).toBe(false);
  });

  it('does NOT flag border with value `none` or `transparent`', () => {
    const tree = root(
      comp('Surface', { mode: 'subtle' }, [
        el('div', { style: { border: 'none', outline: 'transparent' } }),
      ]),
    );
    expect(findCheck(validateComposition(tree), 'decorative-border-on-surface').passed).toBe(true);
  });

  it('does NOT flag a Surface itself when no enclosing surface exists', () => {
    // Surface at root sits on default — its own border is not flagged here
    // (different concern; covered by other rules).
    const tree = root(comp('Surface', { mode: 'bold', style: { border: '1px solid red' } }));
    expect(findCheck(validateComposition(tree), 'decorative-border-on-surface').passed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Check 2: surface-without-data-surface
// ---------------------------------------------------------------------------

describe('surface-without-data-surface', () => {
  it('flags raw element with backgroundColor and children', () => {
    const tree = root(
      el('div', { style: { backgroundColor: 'var(--Primary-Subtle)' } }, [
        comp('Button', {}, [txt('Click me')]),
      ]),
    );
    const check = findCheck(validateComposition(tree), 'surface-without-data-surface');
    expect(check.passed).toBe(false);
    expect(check.details).toContain('var(--Primary-Subtle)');
  });

  it('passes when wrapping in <Surface mode="...">', () => {
    const tree = root(
      comp('Surface', { mode: 'subtle' }, [comp('Button', {}, [txt('Hi')])]),
    );
    expect(findCheck(validateComposition(tree), 'surface-without-data-surface').passed).toBe(true);
  });

  it('passes with data-surface attribute set', () => {
    const tree = root(
      el('section', { 'data-surface': 'minimal', style: { backgroundColor: 'var(--Primary-Minimal)' } }, [
        comp('Button', {}, [txt('Hi')]),
      ]),
    );
    expect(findCheck(validateComposition(tree), 'surface-without-data-surface').passed).toBe(true);
  });

  it('does NOT flag transparent or page-bg backgrounds', () => {
    const tree = root(
      el('div', { style: { background: 'transparent' } }, [
        el('div', { style: { backgroundColor: 'var(--Surface-Main)' } }, [comp('Button', {}, [txt('x')])]),
      ]),
    );
    expect(findCheck(validateComposition(tree), 'surface-without-data-surface').passed).toBe(true);
  });

  it('does NOT flag a leaf decorative box (no children)', () => {
    const tree = root(
      el('div', {}, [
        el('div', { style: { backgroundColor: 'var(--Primary-Bold)' } }), // empty leaf
      ]),
    );
    expect(findCheck(validateComposition(tree), 'surface-without-data-surface').passed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Check 3: single-hero-per-region
// ---------------------------------------------------------------------------

describe('single-hero-per-region', () => {
  it('passes with one bold Button at root', () => {
    const tree = root(comp('Button', { variant: 'bold' }, [txt('Save')]));
    expect(findCheck(validateComposition(tree), 'single-hero-per-region').passed).toBe(true);
  });

  it('flags two bold Buttons inside the same Card region', () => {
    const tree = root(
      comp('Card', {}, [
        comp('Button', { variant: 'bold' }, [txt('Save')]),
        comp('Button', { variant: 'bold' }, [txt('Continue')]),
      ]),
    );
    const check = findCheck(validateComposition(tree), 'single-hero-per-region');
    expect(check.passed).toBe(false);
  });

  it('flags multiple high-attention items inside a section element', () => {
    const tree = root(
      el('section', { 'data-region': 'hero' }, [
        comp('Button', { attention: 'high' }, [txt('A')]),
        comp('Button', { attention: 'high' }, [txt('B')]),
      ]),
    );
    expect(findCheck(validateComposition(tree), 'single-hero-per-region').passed).toBe(false);
  });

  it('passes when bold + subtle live in the same region', () => {
    const tree = root(
      comp('Card', {}, [
        comp('Button', { variant: 'bold' }, [txt('Primary')]),
        comp('Button', { variant: 'subtle' }, [txt('Cancel')]),
      ]),
    );
    expect(findCheck(validateComposition(tree), 'single-hero-per-region').passed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Check 4: decorative-icons-density
// ---------------------------------------------------------------------------

describe('decorative-icons-density', () => {
  it('passes with up to 4 standalone Icons', () => {
    const tree = root(
      el('div', {}, [
        comp('Icon', { name: 'star' }),
        comp('Icon', { name: 'heart' }),
        comp('Icon', { name: 'home' }),
        comp('Icon', { name: 'gear' }),
      ]),
    );
    expect(findCheck(validateComposition(tree), 'decorative-icons-density').passed).toBe(true);
  });

  it('flags 5+ standalone Icons', () => {
    const children = Array.from({ length: 5 }, (_, i) => comp('Icon', { name: `i${i}` }));
    const tree = root(el('div', {}, children));
    const check = findCheck(validateComposition(tree), 'decorative-icons-density');
    expect(check.passed).toBe(false);
    expect(check.details).toContain('5 standalone Icon');
  });

  it('does NOT count Icons inside Buttons / Chips / Tabs', () => {
    const tree = root(
      el('div', {}, [
        comp('Button', {}, [comp('Icon', { name: 'a' }), txt('Save')]),
        comp('Button', {}, [comp('Icon', { name: 'b' }), txt('Cancel')]),
        comp('Chip', {}, [comp('Icon', { name: 'c' }), txt('Tag')]),
        comp('IconButton', { ariaLabel: 'menu' }, [comp('Icon', { name: 'd' })]),
        comp('FAB', {}, [comp('Icon', { name: 'e' })]),
      ]),
    );
    expect(findCheck(validateComposition(tree), 'decorative-icons-density').passed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Check 5: heading-typography-role
// ---------------------------------------------------------------------------

describe('heading-typography-role', () => {
  it('passes when h1 uses Display token', () => {
    const tree = root(el('h1', { style: { fontSize: 'var(--Display-L-FontSize)' } }, [txt('Hello')]));
    expect(findCheck(validateComposition(tree), 'heading-typography-role').passed).toBe(true);
  });

  it('flags h2 wired to Body token', () => {
    const tree = root(el('h2', { style: { fontSize: 'var(--Body-M-FontSize)' } }, [txt('Hi')]));
    const check = findCheck(validateComposition(tree), 'heading-typography-role');
    expect(check.passed).toBe(false);
    expect(check.details).toContain('Body-M');
  });

  it('flags Heading component with Label fontSize', () => {
    const tree = root(
      comp('Heading', { style: { fontSize: 'var(--Label-S-FontSize)' } }, [txt('Title')]),
    );
    expect(findCheck(validateComposition(tree), 'heading-typography-role').passed).toBe(false);
  });

  it('skips heading nodes without inline fontSize', () => {
    // Default styling is fine — only inline overrides we can statically inspect get checked.
    const tree = root(el('h1', {}, [txt('Default look')]));
    expect(findCheck(validateComposition(tree), 'heading-typography-role').passed).toBe(true);
  });

  it('passes Title role token', () => {
    const tree = root(
      el('div', { role: 'heading', style: { fontSize: 'var(--Title-M-FontSize)' } }, [txt('Section')]),
    );
    expect(findCheck(validateComposition(tree), 'heading-typography-role').passed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Check 6: emoji-as-icon
// ---------------------------------------------------------------------------

describe('emoji-as-icon', () => {
  it('flags emoji-only text inside Icon', () => {
    const tree = root(comp('Icon', {}, [txt('🚀')]));
    const check = findCheck(validateComposition(tree), 'emoji-as-icon');
    expect(check.passed).toBe(false);
    expect(check.details).toContain('🚀');
  });

  it('flags emoji in Button.start slot', () => {
    const tree = root(comp('Button', { start: '⭐' }, [txt('Favorite')]));
    expect(findCheck(validateComposition(tree), 'emoji-as-icon').passed).toBe(false);
  });

  it('does NOT flag emoji mixed with text content', () => {
    // "Save 🎉" is content, not icon — passes.
    const tree = root(comp('Button', {}, [txt('Save 🎉')]));
    expect(findCheck(validateComposition(tree), 'emoji-as-icon').passed).toBe(true);
  });

  it('does NOT flag emoji as plain body text', () => {
    const tree = root(el('p', {}, [txt('🎉')])); // not in icon position
    expect(findCheck(validateComposition(tree), 'emoji-as-icon').passed).toBe(true);
  });

  it('flags emoji-only Chip end slot', () => {
    const tree = root(comp('Chip', { end: '🔥' }, [txt('Trending')]));
    expect(findCheck(validateComposition(tree), 'emoji-as-icon').passed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Score wiring — confirm new warnings actually subtract from the score
// ---------------------------------------------------------------------------

describe('score wiring', () => {
  it('clean composition scores 100', () => {
    const tree = root(
      comp('Surface', { mode: 'subtle' }, [
        el('h1', { style: { fontSize: 'var(--Display-L-FontSize)' } }, [txt('Welcome')]),
        comp('Button', { variant: 'bold' }, [txt('Get started')]),
      ]),
    );
    expect(validateComposition(tree).score).toBe(100);
  });

  it('one new-warning subtracts 5', () => {
    const tree = root(
      comp('Surface', { mode: 'bold' }, [
        // Triggers ONLY decorative-border-on-surface (token-only borderColor
        // avoids the `1px` shorthand which would also trip token-compliance).
        el('div', { style: { borderColor: 'var(--Border-Subtle)' } }),
      ]),
    );
    expect(validateComposition(tree).score).toBe(95);
  });
});
