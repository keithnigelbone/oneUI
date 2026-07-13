import { describe, it, expect } from 'vitest';
import {
  FoundationResolveResultSchema,
  foundationResolved,
  foundationGap,
  type FoundationResolveResult,
} from './foundationResolve';
import { JioComponentRegistryItem } from './registryItem';
import { JioValidationResult, validationPassed } from './validation';
import { ExperienceBuilderEvent, type ExperienceBuilderEventT } from './events';
import {
  ComplianceScore,
  DesignContextResolution,
  ExperienceHandoffBundle,
  ExperienceRunRecord,
  SandboxOperationalCheck,
} from './production';

describe('FoundationResolveResult — gap variant (FND-03 / Pitfall 6)', () => {
  it('success variant carries a ThemeConfig-shaped theme', () => {
    const result = foundationResolved({ appearances: { primary: {} } } as never);
    expect(result.ok).toBe(true);
    expect(FoundationResolveResultSchema.safeParse(result).success).toBe(true);
  });

  it('gap variant discriminates on ok=false and carries NO dimension numbers', () => {
    const result: FoundationResolveResult = foundationGap({
      artifactType: 'social-post',
      outputProfile: 'ig-square',
      reason: 'No Jio foundation coverage for ig-square in P1',
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    // The gap is structurally incapable of carrying a fabricated dimension.
    expect(Object.keys(result.gap).sort()).toEqual(['artifactType', 'outputProfile', 'reason']);
    const json = JSON.stringify(result.gap);
    expect(/\b1080\b|\bwidth\b|\bheight\b|\bdimensions\b/.test(json)).toBe(false);
    expect(FoundationResolveResultSchema.safeParse(result).success).toBe(true);
  });
});

describe('JioComponentRegistryItem — production shape (REG-01)', () => {
  it('parses an item with importPath/props/variants/slots', () => {
    const item = {
      id: 'Button',
      name: 'Button',
      status: 'alpha',
      importPath: '@oneui/ui/components/Button',
      surfaceAware: true,
      multiAccent: true,
      props: [{ name: 'variant', values: ['bold', 'subtle', 'ghost'] }],
      variants: ['bold', 'subtle', 'ghost'],
      slots: ['children', 'start', 'end'],
      states: ['hover', 'pressed', 'disabled'],
      supportedBrands: ['jio'],
      supportedProfiles: ['web-desktop'],
      tokenDependencies: ['--Primary-Bold'],
    };
    const parsed = JioComponentRegistryItem.safeParse(item);
    expect(parsed.success).toBe(true);
  });

  it('rejects an item missing importPath', () => {
    const bad = { id: 'X', name: 'X', status: 'alpha', surfaceAware: false, multiAccent: false };
    expect(JioComponentRegistryItem.safeParse(bad).success).toBe(false);
  });
});

describe('JioValidationResult (VAL-01)', () => {
  it('carries passed + blocking + warnings + repairSuggestions + gaps', () => {
    const result = {
      passed: false,
      blocking: [
        { code: 'non-jio-import', message: 'tailwindcss import', severity: 'blocking', offender: 'tailwindcss' },
      ],
      warnings: [{ code: 'literal-value', message: 'hardcoded px', severity: 'warning' }],
      repairSuggestions: ['Replace tailwindcss with @oneui/ui components'],
      componentGaps: [{ componentType: 'Carousel', reason: 'not registered' }],
      foundationGaps: [{ foundationRef: 'token:--Foo', reason: 'unknown token' }],
    };
    const parsed = JioValidationResult.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it('validationPassed() builds a clean pass', () => {
    const pass = validationPassed();
    expect(pass.passed).toBe(true);
    expect(pass.blocking).toEqual([]);
    expect(JioValidationResult.safeParse(pass).success).toBe(true);
  });
});

describe('ExperienceBuilderEvent union round-trip (ORCH-03)', () => {
  const now = 1_700_000_000_000;
  const variants: ExperienceBuilderEventT[] = [
    { type: 'run-started', runId: 'r1', at: now },
    { type: 'step', runId: 'r1', step: 'resolve-foundation', status: 'started', at: now },
    { type: 'ir-produced', runId: 'r1', irId: 'ir1', at: now },
    { type: 'validation', runId: 'r1', result: validationPassed(), at: now },
    {
      type: 'gap',
      runId: 'r1',
      foundationGap: { artifactType: 'slide', outputProfile: 'slide-16x9', reason: 'no coverage' },
      at: now,
    },
    { type: 'run-completed', runId: 'r1', outcome: 'artifact', at: now },
  ];

  it.each(variants)('round-trips event type "$type" through Zod', (event) => {
    const parsed = ExperienceBuilderEvent.safeParse(event);
    expect(parsed.success).toBe(true);
  });

  it('rejects an unknown event type', () => {
    expect(ExperienceBuilderEvent.safeParse({ type: 'nope', runId: 'r', at: now }).success).toBe(false);
  });
});

describe('Experience Lab production contracts', () => {
  it('parses a durable run record with canvas, tool, model, validation, and artifact refs', () => {
    const parsed = ExperienceRunRecord.safeParse({
      runId: 'run-1',
      tenantId: 'tenant-jio',
      brandId: 'brand-jio',
      canvasDocumentId: 'canvas-1',
      conversationThreadId: 'thread-1',
      status: 'artifact',
      request: { artifactType: 'web-ui', outputProfile: 'web-desktop' },
      events: [{ type: 'run-started', runId: 'run-1', at: 1 }],
      validation: validationPassed(),
      artifacts: [
        {
          artifactId: 'artifact-1',
          versionId: 'version-1',
          artifactType: 'web-ui',
          outputProfile: 'web-desktop',
          previewUrl: 'https://preview.example/run-1',
          exportIds: ['export-1'],
        },
      ],
      modelUsage: [{ provider: 'anthropic', model: 'claude', totalTokens: 42 }],
      toolCalls: [{ toolName: 'storybook-docs', status: 'completed' }],
      createdAt: 1,
      updatedAt: 2,
      completedAt: 3,
    });
    expect(parsed.success).toBe(true);
  });

  it('parses design context resolution from Storybook MCP plus registry fallback', () => {
    const parsed = DesignContextResolution.safeParse({
      status: 'partial',
      query: 'header navigation',
      components: ['WebHeader', 'Button'],
      source: 'hybrid',
      docsUsed: ['storybook:mcp:get-documentation:WebHeader'],
      missingComponents: [],
      entries: [
        {
          id: 'storybook:WebHeader',
          source: 'storybook-mcp',
          title: 'WebHeader',
          componentId: 'WebHeader',
          storyId: 'Components/Navigation/WebHeader/Default',
          content: 'Use the documented compound nav recipe.',
          props: ['items'],
          slots: ['children'],
          variants: [],
          tokens: ['--Body-M-FontSize'],
        },
        {
          id: 'registry:Button',
          source: 'registry-snapshot',
          title: 'Button',
          componentId: 'Button',
          content: 'Registry fallback.',
          props: ['variant'],
          slots: ['children'],
          variants: ['bold'],
          tokens: ['--Primary-Bold'],
        },
      ],
    });
    expect(parsed.success).toBe(true);
  });

  it('parses handoff, sandbox, and compliance scorer records', () => {
    expect(
      ExperienceHandoffBundle.safeParse({
        runId: 'run-1',
        artifactId: 'artifact-1',
        versionId: 'version-1',
        brandId: 'brand-jio',
        prompt: 'Create a homepage hero.',
        validation: validationPassed(),
        previewUrl: 'https://preview.example/run-1',
        storybookRefs: ['Components/Navigation/WebHeader/Default'],
        files: [{ path: 'artifact.tsx', kind: 'react', contentType: 'text/typescript' }],
        createdAt: 1,
      }).success,
    ).toBe(true);

    expect(
      SandboxOperationalCheck.safeParse({
        id: 'daytona-probe-1',
        provider: 'daytona',
        snapshotName: 'oneui-preview',
        status: 'passed',
        bootMs: 1200,
        egressBlocked: true,
        ttlExpiresAt: 2,
        checkedAt: 1,
      }).success,
    ).toBe(true);

    expect(
      ComplianceScore.safeParse({
        scorer: 'token-compliance',
        passed: true,
        score: 1,
        findings: [],
      }).success,
    ).toBe(true);
  });
});
