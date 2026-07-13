import { describe, it, expect } from 'vitest';
import { generateDesignManifest } from '../designManifest';
import type { ComponentMeta } from '../../types/componentMeta';
import type {
  CompositionConfig,
  CompositionRule,
  CompositionSkill,
} from '../../engine/compositionTypes';

const fakeConfig: CompositionConfig = {
  vertical: 'finance',
  layoutPersonality: { density: 30, expressiveness: 50 },
  defaultContext: 'mobile-app',
  isActive: true,
  version: 1,
};

const fakeRule: CompositionRule = {
  sectionId: 'spacing-rhythm',
  title: 'Spacing Rhythm',
  content: 'Use --Spacing-4 between related items.',
  priority: 10,
  scope: 'base',
  isActive: true,
  version: 1,
};

const fakeBrandRule: CompositionRule = {
  sectionId: 'spacing-rhythm',
  title: 'Spacing Rhythm (override)',
  content: 'Tira prefers --Spacing-4-5 between related items.',
  priority: 20,
  scope: 'brand',
  isActive: true,
  version: 1,
};

const fakeSkill: CompositionSkill = {
  skillId: 'product-grid',
  name: 'Product Grid',
  description: 'Dense e-commerce grid with Image + Title + price stack.',
  category: 'screen',
  systemPromptTemplate: 'Use Image with Title.',
  applicableContexts: ['mobile-app', 'web-app'],
  examples: [
    { prompt: 'Show 6 featured products in a grid.', expectedAST: '{}' },
  ],
  isActive: true,
  version: 1,
};

const buttonMeta: ComponentMeta = {
  name: 'Button',
  slug: 'button',
  displayName: 'Button',
  description: 'CTA button.',
  category: 'actions',
  props: [
    {
      name: 'attention',
      type: 'enum',
      options: ['high', 'medium', 'low'],
      description: 'Attention level',
    },
  ],
  slots: [],
  previewMatrix: { variants: ['high'], variantLabels: { high: 'High' } },
  surfaceAware: true,
  multiAccent: true,
};

const FROZEN = new Date('2026-01-01T00:00:00.000Z');

describe('generateDesignManifest', () => {
  const md = generateDesignManifest({
    brandName: 'Tira',
    brandSlug: 'tira',
    config: fakeConfig,
    rules: [fakeRule, fakeBrandRule],
    skills: [fakeSkill],
    components: [buttonMeta],
    now: FROZEN,
  });

  it('emits a header with the brand name and frozen timestamp', () => {
    expect(md).toMatch(/^# Design System — Tira/);
    expect(md).toContain('2026-01-01T00:00:00.000Z');
    expect(md).toContain('`tira`');
  });

  it('includes the Identity section with vertical and layout personality', () => {
    expect(md).toContain('## 1. Identity');
    expect(md).toContain('`finance`');
    expect(md).toContain('density=30');
  });

  it('groups rules by sectionId and tags brand overrides', () => {
    expect(md).toContain('### Spacing Rhythm');
    expect(md).toContain('_(brand override)_');
  });

  it('lists skills with their category and example prompt', () => {
    expect(md).toContain('### Product Grid');
    expect(md).toContain('(screen)');
    expect(md).toContain('Show 6 featured products in a grid.');
  });

  it('includes the component reference inline', () => {
    expect(md).toContain('## 4. Component Reference');
    expect(md).toContain('Button');
  });

  it('emits JSON Schemas for registered components (Button is migrated)', () => {
    expect(md).toContain('## 5. Component Props Schemas (JSON Schema)');
    expect(md).toContain('### Button');
  });

  it('includes the global prohibitions section', () => {
    expect(md).toContain('## 6. Global Prohibitions');
    expect(md).toContain('hard-coded colors');
  });

  it('filters skills by context when requested', () => {
    const mdMobile = generateDesignManifest({
      brandName: 'Tira',
      config: fakeConfig,
      rules: [],
      skills: [fakeSkill],
      components: [buttonMeta],
      context: 'print',
      now: FROZEN,
    });
    expect(mdMobile).toContain('_No skills configured._');
  });

  it('skips inactive rules', () => {
    const inactiveRule: CompositionRule = { ...fakeRule, isActive: false, title: 'Inactive Rule' };
    const result = generateDesignManifest({
      brandName: 'Tira',
      config: fakeConfig,
      rules: [inactiveRule],
      skills: [],
      components: [buttonMeta],
      now: FROZEN,
    });
    expect(result).not.toContain('Inactive Rule');
  });
});
