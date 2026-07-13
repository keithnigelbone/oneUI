import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  requiresStorybookNavigationDocs,
  resolveDesignContext,
  resolveStorybookRecipeContext,
} from './storybookMcp';

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  vi.restoreAllMocks();
});

function okMcpResponse(): Response {
  return new Response(JSON.stringify({ jsonrpc: '2.0', result: { content: [] } }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('Storybook MCP recipe retrieval', () => {
  it('detects navigation prompts and component requests', () => {
    expect(requiresStorybookNavigationDocs({ prompt: 'Use WebHeader navigation' })).toBe(true);
    expect(requiresStorybookNavigationDocs({ requestedComponents: ['PrimaryNav'] })).toBe(true);
    expect(requiresStorybookNavigationDocs({ prompt: 'Build a pricing card grid' })).toBe(false);
  });

  it('calls Storybook MCP documentation tools for WebHeader compounds', async () => {
    const fetchMock = vi.fn(async () => okMcpResponse());
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const result = await resolveStorybookRecipeContext({
      prompt: 'Create WebHeader navigation',
      strictStorybook: true,
      storybookMcpUrl: 'http://storybook.test/mcp',
    });

    expect(result.status).toBe('available');
    expect(result.source).toBe('mcp');
    expect(result.docsUsed).toEqual(
      expect.arrayContaining([
        'storybook:mcp:list-all-documentation',
        'storybook:mcp:get-documentation:WebHeader',
        'storybook:mcp:get-documentation:PrimaryNav',
        'storybook:mcp:get-documentation:SecondaryNav',
        'storybook:mcp:get-documentation:HeaderItem',
        'storybook:mcp:get-documentation-for-story:Components/Navigation/WebHeader/Default',
      ]),
    );

    const calls = fetchMock.mock.calls as unknown as Array<[unknown, RequestInit]>;
    const toolNames = calls.map(([, init]) => {
      const body = JSON.parse(String(init.body));
      return body.params.name;
    });
    expect(toolNames).toEqual(
      expect.arrayContaining([
        'list-all-documentation',
        'get-documentation',
        'get-documentation-for-story',
      ]),
    );
  });

  it('uses local Storybook source for strict navigation when MCP cannot be reached', async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new Error('offline');
    }) as unknown as typeof fetch;

    const result = await resolveStorybookRecipeContext({
      prompt: 'Use WebHeader navigation',
      strictStorybook: true,
      storybookMcpUrl: 'http://storybook.test/mcp',
    });

    expect(result.status).toBe('unavailable');
    expect(result.source).toBe('local-fallback');
    expect(result.docsUsed).toEqual(
      expect.arrayContaining(['packages/ui/src/components/WebHeader/WebHeader.stories.tsx#Default']),
    );
    expect(result.error).toContain('offline');
  });

  it('uses local exemplars only for non-strict offline runs', async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new Error('offline');
    }) as unknown as typeof fetch;

    const result = await resolveStorybookRecipeContext({
      prompt: 'Use WebHeader navigation',
      strictStorybook: false,
      storybookMcpUrl: 'http://storybook.test/mcp',
    });

    expect(result.status).toBe('available');
    expect(result.source).toBe('local-fallback');
    expect(result.docsUsed).toEqual(
      expect.arrayContaining(['packages/ui/src/components/WebHeader/WebHeader.stories.tsx#Default']),
    );
  });

  it('resolves generic design context from the OneUI registry when Storybook is not required', async () => {
    const result = await resolveDesignContext({
      prompt: 'Build with Button and Badge',
      requestedComponents: ['Button', 'Badge'],
      strictStorybook: false,
    });

    expect(result.status).toBe('available');
    expect(result.source).toBe('local-fallback');
    expect(result.components).toEqual(expect.arrayContaining(['Button', 'Badge']));
    expect(result.entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'registry:Button', componentId: 'Button' }),
        expect.objectContaining({ id: 'registry:Badge', componentId: 'Badge' }),
      ]),
    );
    expect(result.entries.find((entry) => entry.componentId === 'Button')?.props).toContain('variant');
  });

  it('combines Storybook MCP docs with registry snapshots for strict design context', async () => {
    const fetchMock = vi.fn(async () => okMcpResponse());
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const result = await resolveDesignContext({
      prompt: 'Create WebHeader navigation with Button actions',
      requestedComponents: ['Button'],
      strictStorybook: true,
      storybookMcpUrl: 'http://storybook.test/mcp',
    });

    expect(result.status).toBe('available');
    expect(result.source).toBe('hybrid');
    expect(result.docsUsed).toEqual(
      expect.arrayContaining([
        'storybook:mcp:list-all-documentation',
        'storybook:mcp:get-documentation:WebHeader',
        'registry:Button',
      ]),
    );
    expect(result.entries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'storybook:WebHeader', source: 'storybook-mcp' }),
        expect.objectContaining({ id: 'registry:Button', source: 'registry-snapshot' }),
      ]),
    );
  });

  it('reports missing requested components in design context', async () => {
    const result = await resolveDesignContext({
      requestedComponents: ['Button', 'FancyHero'],
      strictStorybook: false,
    });

    expect(result.status).toBe('partial');
    expect(result.missingComponents).toEqual(['FancyHero']);
    expect(result.warnings).toEqual([]);
    expect(result.entries).toEqual(
      expect.arrayContaining([expect.objectContaining({ componentId: 'Button' })]),
    );
  });
});
