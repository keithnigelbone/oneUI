/**
 * buildAgentContext tests — verify composition, budget enforcement, and
 * mode-specific guidance rendering.
 */

import { describe, expect, it } from 'vitest';
import { buildAgentContext } from '../buildAgentContext';
import {
  renderBrandSummary,
  renderComponentContext,
  renderModeGuidance,
  renderVoiceSection,
} from '../knowledgeSources';
import type { BrandFoundationSummary } from '../types';
import type { ComponentMeta } from '../../types/componentMeta';

const BRAND: BrandFoundationSummary = {
  brandName: 'Jio',
  theme: 'light',
  primaryFont: 'Inter',
  secondaryFont: 'JioType',
  activeRoles: ['primary', 'secondary', 'neutral'],
  density: 'default',
};

const BUTTON_META: ComponentMeta = {
  name: 'Button',
  slug: 'button',
  displayName: 'Button',
  description: 'Primary call-to-action with three variants.',
  category: 'actions',
  props: [
    {
      name: 'variant',
      type: 'enum',
      options: ['bold', 'subtle', 'ghost'] as const,
      defaultValue: 'bold',
      description: 'Visual emphasis.',
    },
  ],
  slots: [
    { name: 'start', description: 'Leading icon slot', acceptedTypes: ['Icon'] },
  ],
  previewMatrix: {
    variants: ['bold', 'subtle', 'ghost'],
    variantLabels: { bold: 'Bold', subtle: 'Subtle', ghost: 'Ghost' },
  },
  surfaceAware: true,
  multiAccent: true,
};

const CHIP_META: ComponentMeta = {
  name: 'Chip',
  slug: 'chip',
  displayName: 'Chip',
  description: 'Compact selectable token.',
  category: 'inputs',
  props: [],
  slots: [],
  previewMatrix: { variants: ['default'], variantLabels: { default: 'Default' } },
  surfaceAware: true,
  multiAccent: false,
};

describe('buildAgentContext', () => {
  it('composes all sections in order for home mode', () => {
    const result = buildAgentContext({
      componentMetas: [BUTTON_META, CHIP_META],
      brand: BRAND,
      mode: 'home',
    });

    expect(result.truncated).toBe(false);
    expect(result.chars).toBeGreaterThan(0);
    expect(result.chars).toBe(result.system.length);

    const coreIdx = result.system.indexOf('## Core Design System Rules');
    const componentIdx = result.system.indexOf('# OneUI Component Reference');
    const brandIdx = result.system.indexOf('## Current Brand');
    const guidanceIdx = result.system.indexOf('## When to reach for search_design_system');

    expect(coreIdx).toBeGreaterThanOrEqual(0);
    expect(componentIdx).toBeGreaterThan(coreIdx);
    expect(brandIdx).toBeGreaterThan(componentIdx);
    expect(guidanceIdx).toBeGreaterThan(brandIdx);
  });

  it('inlines brand name, theme, fonts, and active roles', () => {
    const { system } = buildAgentContext({
      componentMetas: [BUTTON_META],
      brand: BRAND,
      mode: 'home',
    });
    expect(system).toContain('**Jio**');
    expect(system).toContain('Theme: light');
    expect(system).toContain('Primary font: Inter');
    expect(system).toContain('Secondary font: JioType');
    expect(system).toContain('Active accent roles: primary, secondary, neutral');
  });

  it('renders the component registry via generateAIContext', () => {
    const { system } = buildAgentContext({
      componentMetas: [BUTTON_META, CHIP_META],
      brand: BRAND,
      mode: 'home',
    });
    expect(system).toContain('### Button');
    expect(system).toContain('Primary call-to-action');
    expect(system).toContain('### Chip');
    expect(system).toContain('2 components available');
  });

  it('appends the voice prompt section only when provided', () => {
    const withoutVoice = buildAgentContext({
      componentMetas: [BUTTON_META],
      brand: BRAND,
      mode: 'home',
    });
    expect(withoutVoice.system).not.toContain('## Brand Tone of Voice');

    const withVoice = buildAgentContext({
      componentMetas: [BUTTON_META],
      brand: BRAND,
      mode: 'home',
      voicePrompt: 'Speak warmly and concisely. Avoid jargon.',
    });
    expect(withVoice.system).toContain('## Brand Tone of Voice');
    expect(withVoice.system).toContain('Speak warmly and concisely.');
  });

  it('skips the voice section when voicePrompt is an empty or whitespace string', () => {
    const { system } = buildAgentContext({
      componentMetas: [BUTTON_META],
      brand: BRAND,
      mode: 'home',
      voicePrompt: '   \n  ',
    });
    expect(system).not.toContain('## Brand Tone of Voice');
  });

  it('truncates to maxChars with a trailing notice and marks the result', () => {
    const result = buildAgentContext({
      componentMetas: [BUTTON_META, CHIP_META],
      brand: BRAND,
      mode: 'home',
      maxChars: 500,
    });
    expect(result.truncated).toBe(true);
    expect(result.system.length).toBeLessThanOrEqual(500);
    expect(result.system.endsWith('[truncated — call search_design_system for details]')).toBe(true);
  });

  it('does not truncate when under budget', () => {
    const { truncated, chars } = buildAgentContext({
      componentMetas: [BUTTON_META],
      brand: BRAND,
      mode: 'home',
    });
    expect(truncated).toBe(false);
    expect(chars).toBeLessThanOrEqual(24_000);
  });

  it('renders a different guidance block for home vs create mode', () => {
    const home = renderModeGuidance('home');
    const create = renderModeGuidance('create');
    expect(home).toContain('Navigating the platform');
    expect(create).not.toContain('Navigating the platform');
    expect(create).toContain('search_design_system');
  });

  it('handles an empty component registry gracefully', () => {
    const { system, truncated } = buildAgentContext({
      componentMetas: [],
      brand: BRAND,
      mode: 'home',
    });
    expect(truncated).toBe(false);
    expect(system).toContain('_No components registered._');
    expect(system).toContain('## Current Brand');
  });
});

describe('buildAgentContext — realistic scale', () => {
  function makeFakeMetas(count: number): ComponentMeta[] {
    return Array.from({ length: count }, (_, i) => ({
      name: `Component${i}`,
      slug: `component-${i}`,
      displayName: `Component ${i}`,
      description:
        'A realistic component description with enough text to simulate the average entry in the OneUI registry — covers purpose, usage guidance, and a short note on surface awareness.',
      category: 'actions' as const,
      props: Array.from({ length: 6 }, (__, j) => ({
        name: `prop${j}`,
        type: 'enum' as const,
        options: ['small', 'medium', 'large'] as const,
        defaultValue: 'medium',
        description: `Prop ${j} controls the ${j % 2 === 0 ? 'visual' : 'behavioural'} aspect.`,
        brandOverridable: j === 0,
      })),
      slots: [
        { name: 'start', description: 'Leading slot', acceptedTypes: ['Icon', 'Avatar'] },
        { name: 'end', description: 'Trailing slot', acceptedTypes: ['Icon'] },
      ],
      previewMatrix: {
        variants: ['bold', 'subtle', 'ghost'],
        variantLabels: { bold: 'Bold', subtle: 'Subtle', ghost: 'Ghost' },
      },
      surfaceAware: true,
      multiAccent: i % 2 === 0,
    }));
  }

  it("fits today's ~15-component registry comfortably under the 24K budget", () => {
    const result = buildAgentContext({
      componentMetas: makeFakeMetas(15),
      brand: BRAND,
      mode: 'home',
      voicePrompt: 'Speak warmly. Prefer short sentences. Avoid jargon.',
    });
    expect(result.chars).toBeLessThanOrEqual(24_000);
    expect(result.truncated).toBe(false);
    expect(result.system).toContain('15 components available');
  });

  it('truncates cleanly (no crash, notice appended) when the registry outgrows the budget', () => {
    // 40 components of this size blow the 24K budget. This is expected
    // behaviour — truncation is the escape hatch, and the agent is told
    // to call search_design_system for anything missing.
    const result = buildAgentContext({
      componentMetas: makeFakeMetas(40),
      brand: BRAND,
      mode: 'home',
    });
    expect(result.truncated).toBe(true);
    expect(result.chars).toBeLessThanOrEqual(24_000);
    expect(result.system).toContain('[truncated — call search_design_system for details]');
  });
});

describe('knowledgeSources — individual renderers', () => {
  it('renderBrandSummary omits undefined fields', () => {
    const minimal: BrandFoundationSummary = { brandName: 'Tira', theme: 'dark' };
    const out = renderBrandSummary(minimal);
    expect(out).toContain('**Tira**');
    expect(out).toContain('Theme: dark');
    expect(out).not.toContain('Primary font');
    expect(out).not.toContain('Active accent roles');
  });

  it('renderComponentContext caches per (metas, brand) tuple', () => {
    const first = renderComponentContext([BUTTON_META], 'Jio');
    const second = renderComponentContext([BUTTON_META], 'Jio');
    expect(first).toBe(second); // identical string reference via cache hit
  });

  it('renderVoiceSection returns empty string for empty input', () => {
    expect(renderVoiceSection('')).toBe('');
    expect(renderVoiceSection('   ')).toBe('');
  });
});
