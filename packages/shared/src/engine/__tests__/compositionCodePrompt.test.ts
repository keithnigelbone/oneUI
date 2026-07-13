import { describe, expect, it } from 'vitest';
import {
  compileCompositionRules,
  getDefaultCompositionConfig,
} from '../compositionCompiler';
import {
  buildTSXSystemPrompt,
  buildTSXUserPrompt,
  buildTSXRevisionPrompt,
  buildTSXRepairPrompt,
  isPlaygroundComponent,
  PLAYGROUND_COMPONENT_ALLOWLIST,
  PLAYGROUND_ICON_NAMES,
  stripTSXFences,
  type StorybookExemplarLike,
} from '../compositionCodePrompt';
import { buildSeedRules } from '../compositionSeedRules';
import { PLAYGROUND_IMAGE_URLS } from '../playgroundImageAssets';
import { STORY_EXEMPLARS } from '../../meta';

describe('stripTSXFences', () => {
  it('strips a tsx-tagged fenced block', () => {
    expect(stripTSXFences('```tsx\nconst x = 1;\n```')).toBe('const x = 1;');
  });

  it('strips a plain fence with no language tag', () => {
    expect(stripTSXFences('```\nconst x = 1;\n```')).toBe('const x = 1;');
  });

  it('accepts jsx / ts / js fences', () => {
    for (const lang of ['jsx', 'ts', 'js']) {
      expect(stripTSXFences(`\`\`\`${lang}\nconst x = 1;\n\`\`\``)).toBe('const x = 1;');
    }
  });

  it('returns input unchanged when no fence is present', () => {
    expect(stripTSXFences('const x = 1;')).toBe('const x = 1;');
  });
});

describe('isPlaygroundComponent + allowlist', () => {
  it('accepts components in the allowlist', () => {
    for (const name of ['Surface', 'Button', 'BottomNavItem', 'TabItem', 'Icon']) {
      expect(isPlaygroundComponent(name), name).toBe(true);
    }
  });

  it('rejects names outside the allowlist', () => {
    for (const name of ['Logo', 'MysteryWidget', 'Heart', 'div']) {
      expect(isPlaygroundComponent(name), name).toBe(false);
    }
  });

  it('PLAYGROUND_COMPONENT_ALLOWLIST contains compound subcomponents', () => {
    // Regression for the bug where Claude generated <BottomNavItem> and
    // the allowlist only had the parent.
    expect(PLAYGROUND_COMPONENT_ALLOWLIST).toContain('BottomNavItem');
    expect(PLAYGROUND_COMPONENT_ALLOWLIST).toContain('TabItem');
    expect(PLAYGROUND_COMPONENT_ALLOWLIST).toContain('DialogTrigger');
    expect(PLAYGROUND_COMPONENT_ALLOWLIST).toContain('PopoverTrigger');
  });

  it('PLAYGROUND_ICON_NAMES uses camelCase, not kebab-case', () => {
    expect(PLAYGROUND_ICON_NAMES).toContain('chevronRight');
    expect(PLAYGROUND_ICON_NAMES).toContain('arrowLeft');
    // Smoke test: no kebab-case names slipped in.
    for (const name of PLAYGROUND_ICON_NAMES) {
      expect(name, name).not.toContain('-');
    }
  });
});

describe('buildTSXSystemPrompt', () => {
  it('appends the TSX output clause to the compiled rules', () => {
    const prompt = buildTSXSystemPrompt('## Existing rules\nDo good work.');
    expect(prompt).toContain('Existing rules');
    expect(prompt).toContain('Output Format');
    expect(prompt).toContain('Allowed imports');
    expect(prompt).toContain('@oneui/playground');
  });

  it('strips AST-only instructions from legacy compiled prompts', () => {
    const prompt = buildTSXSystemPrompt(
      [
        '## Existing rules',
        'Do good work.',
        '- Output ONLY valid JSON, no markdown, no explanation',
        '',
        '## AST Output Format',
        '{ "version": 1, "root": {} }',
      ].join('\n'),
    );
    expect(prompt).toContain('Existing rules');
    expect(prompt).not.toContain('AST Output Format');
    expect(prompt).not.toContain('Output ONLY valid JSON');
  });

  it('keeps Sandpack TSX prompts below the mobile prompt-size cap', () => {
    const compiled = compileCompositionRules(
      buildSeedRules(),
      getDefaultCompositionConfig(),
      '',
      '',
      undefined,
      'mobile-app',
      { outputFormat: 'tsx' },
    ).prompt;
    const prompt = buildTSXSystemPrompt(compiled, { storybookExemplars: STORY_EXEMPLARS });
    expect(prompt.length).toBeLessThan(28_000);
    expect(prompt).not.toContain('AST Output Format');
    expect(prompt).not.toContain('Output ONLY valid JSON');
    expect(prompt).not.toContain('picsum.photos');
  });

  it('tells models to use the local playground image registry only', () => {
    const prompt = buildTSXSystemPrompt('rules');
    expect(prompt).toContain(PLAYGROUND_IMAGE_URLS[0]);
    expect(prompt).not.toContain('/playground-assets/images/placeholder.svg');
    expect(prompt).toContain('do NOT invent URLs');
    expect(prompt).not.toContain('picsum.photos');
  });

  it('emits Storybook exemplars when supplied', () => {
    const exemplars: StorybookExemplarLike[] = [
      {
        component: 'Button',
        storyName: 'Primary',
        args: { appearance: 'primary', children: 'Click me' },
      },
    ];
    const prompt = buildTSXSystemPrompt('rules', { storybookExemplars: exemplars });
    expect(prompt).toContain('Storybook exemplars');
    expect(prompt).toContain('Button');
    expect(prompt).toContain('Click me');
  });

  it('skips exemplars whose component is not in the allowlist', () => {
    const exemplars: StorybookExemplarLike[] = [
      { component: 'Logo', storyName: 'Default', args: { brand: 'jio' } },
    ];
    const prompt = buildTSXSystemPrompt('rules', { storybookExemplars: exemplars });
    // Empty allowlist for Logo => no exemplar block emitted at all.
    expect(prompt).not.toContain('Storybook exemplars');
  });

  it('honours the byte budget cap', () => {
    const tinyArgs = { children: 'x' };
    const exemplars: StorybookExemplarLike[] = Array.from({ length: 50 }, (_, i) => ({
      component: 'Button',
      storyName: `Variant ${i}`,
      args: tinyArgs,
    }));
    const prompt = buildTSXSystemPrompt('rules', {
      storybookExemplars: exemplars,
      exemplarBudget: 200,
    });
    // 50 exemplars × ~50 chars each = ~2.5KB. With a 200-byte budget
    // we should cap somewhere below the full set.
    const blockCount = (prompt.match(/Variant \d+/g) ?? []).length;
    expect(blockCount).toBeGreaterThan(0);
    expect(blockCount).toBeLessThan(50);
  });
});

describe('buildTSXUserPrompt', () => {
  it('frames the prompt with brand context when supplied', () => {
    const out = buildTSXUserPrompt({ brandName: 'JioMart', prompt: 'login screen' });
    expect(out).toContain('Brand: JioMart');
    expect(out).toContain('login screen');
    expect(out).toContain('TSX');
  });

  it('omits brand framing when brandName is unset', () => {
    const out = buildTSXUserPrompt({ prompt: 'login screen' });
    expect(out).not.toContain('Brand:');
    expect(out).toContain('login screen');
  });
});

describe('buildTSXRevisionPrompt', () => {
  it('embeds the previous code as a fenced TSX block', () => {
    const out = buildTSXRevisionPrompt({
      previousCode: 'export default function App() { return null; }',
      changeRequest: 'add a button',
    });
    expect(out).toContain('```tsx');
    expect(out).toContain('return null');
    expect(out).toContain('add a button');
  });

  it('adds focus framing when selectedNodeLoc is provided', () => {
    const out = buildTSXRevisionPrompt({
      previousCode: 'x',
      changeRequest: 'change the colour',
      selectedNodeLoc: 'L42:C8',
      selectedNodeTag: 'Button',
    });
    expect(out).toContain('L42:C8');
    expect(out).toContain('Button');
    expect(out).toContain('byte-identical');
  });
});

describe('buildTSXRepairPrompt', () => {
  it('includes the bundler error verbatim', () => {
    const out = buildTSXRepairPrompt({
      previousCode: 'broken',
      error: 'TypeError: undefined is not a function',
    });
    expect(out).toContain('TypeError');
    expect(out).toContain('broken');
    expect(out).toContain('failed to compile');
  });
});
