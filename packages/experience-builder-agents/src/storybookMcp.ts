import type {
  DesignContextEntryT,
  DesignContextResolutionT,
} from '@oneui/experience-builder-core';
import { getRegistryItem, queryRegistry } from '@oneui/experience-builder-registry';

export type StorybookMcpStatus = 'available' | 'unavailable' | 'not-required';

export interface StorybookRecipeContext {
  status: StorybookMcpStatus;
  docsUsed: string[];
  components: string[];
  stories: string[];
  source: 'mcp' | 'local-fallback' | 'not-required';
  designContext?: DesignContextResolutionT;
  url?: string;
  error?: string;
}

export interface ResolveStorybookRecipeContextInput {
  prompt?: string;
  requestedComponents?: string[];
  sections?: Array<{ name?: string; intent?: string; patternId?: string }>;
  strictStorybook?: boolean;
  storybookMcpUrl?: string;
  components?: string[];
}

export interface ResolveDesignContextInput extends ResolveStorybookRecipeContextInput {
  /**
   * When true, fetch Storybook docs for every requested/inferred component.
   * Defaults to true for strict runs and for navigation compounds.
   */
  requireStorybook?: boolean;
}

interface JsonRpcResponse {
  result?: unknown;
  error?: { message?: string };
}

const DEFAULT_STORYBOOK_MCP_URL = 'http://localhost:6006/mcp';
const NAV_COMPONENTS = ['WebHeader', 'PrimaryNav', 'SecondaryNav', 'HeaderItem'];
const MCP_REQUEST_TIMEOUT_MS = 15_000;
const LOCAL_WEB_HEADER_DOCS = [
  'packages/ui/src/components/WebHeader/WebHeader.stories.tsx#Default',
  'packages/ui/src/components/WebHeader/WebHeader.tsx',
  'packages/ui/src/components/WebHeader/PrimaryNav.tsx',
  'packages/ui/src/components/WebHeader/SecondaryNav.tsx',
  'packages/ui/src/components/WebHeader/HeaderItem.tsx',
];

let rpcId = 0;
let registryIdCache: Set<string> | null = null;

function kebabCase(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

export function storybookMcpUrlFromEnv(): string {
  return process.env.STORYBOOK_MCP_URL ?? DEFAULT_STORYBOOK_MCP_URL;
}

function registryIds(): Set<string> {
  if (!registryIdCache) registryIdCache = new Set(queryRegistry().map((item) => item.id));
  return registryIdCache;
}

function unique(values: Array<string | null | undefined>): string[] {
  return Array.from(
    new Set(
      values
        .map((value) => (typeof value === 'string' ? value.trim() : ''))
        .filter((value) => value.length > 0),
    ),
  );
}

function inferRequestedComponents(input: {
  prompt?: string;
  requestedComponents?: string[];
  components?: string[];
}): string[] {
  const ids = registryIds();
  const explicit = unique([...(input.components ?? []), ...(input.requestedComponents ?? [])]);
  const prompt = input.prompt?.toLowerCase() ?? '';
  const mentioned = prompt
    ? [...ids].filter((id) => {
        const lower = id.toLowerCase();
        return new RegExp(`\\b${lower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(prompt);
      })
    : [];
  return unique([...explicit, ...mentioned]);
}

export function requiresStorybookNavigationDocs(input: {
  prompt?: string;
  requestedComponents?: string[];
  sections?: Array<{ name?: string; intent?: string; patternId?: string }>;
}): boolean {
  const requested = input.requestedComponents ?? [];
  if (requested.some((component) => NAV_COMPONENTS.includes(component))) return true;

  const haystack = [
    input.prompt,
    ...((input.sections ?? []).flatMap((section) => [
      section.name,
      section.intent,
      section.patternId,
    ])),
  ]
    .filter((value): value is string => typeof value === 'string')
    .join(' ')
    .toLowerCase();

  return /\b(web\s*header|webheader|site\s*header|header|nav|navbar|navigation)\b/.test(haystack);
}

export function requiresStorybookDesignContext(input: ResolveDesignContextInput): boolean {
  if (input.requireStorybook === true || input.strictStorybook === true) return true;
  return requiresStorybookNavigationDocs(input);
}

async function callMcpTool(url: string, name: string, args: Record<string, unknown>): Promise<unknown> {
  rpcId += 1;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MCP_REQUEST_TIMEOUT_MS);
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    signal: controller.signal,
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: rpcId,
      method: 'tools/call',
      params: {
        name,
        arguments: args,
      },
    }),
  }).finally(() => clearTimeout(timeout));
  if (!response.ok) {
    throw new Error(`Storybook MCP ${name} failed with HTTP ${response.status}`);
  }
  const payload = await parseMcpResponse(response);
  if (payload.error) {
    throw new Error(payload.error.message ?? `Storybook MCP ${name} returned an error`);
  }
  return payload.result;
}

async function parseMcpResponse(response: Response): Promise<JsonRpcResponse> {
  const text = await response.text();
  const trimmed = text.trim();
  if (!trimmed) return {};
  if (trimmed.startsWith('{')) return JSON.parse(trimmed) as JsonRpcResponse;

  const payloads = trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice('data:'.length).trim())
    .filter((line) => line && line !== '[DONE]');

  for (const payload of payloads.reverse()) {
    const parsed = JSON.parse(payload) as JsonRpcResponse;
    if (parsed.result || parsed.error) return parsed;
  }
  return {};
}

async function callMcpToolWithFallbackArgs(
  url: string,
  name: string,
  argCandidates: Array<Record<string, unknown>>,
): Promise<unknown> {
  let lastError: unknown;
  for (const args of argCandidates) {
    try {
      return await callMcpTool(url, name, args);
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

export async function fetchStorybookMcpDocs(
  url: string,
  components: string[] = NAV_COMPONENTS,
): Promise<{ docsUsed: string[]; stories: string[] }> {
  const docsUsed = new Set<string>();
  const stories = new Set<string>();
  const requested = unique(components);

  const docsIndexResult = await callMcpTool(url, 'list-all-documentation', { withStoryIds: true });
  const documentationIds = parseDocumentationIds(docsIndexResult);
  docsUsed.add('storybook:mcp:list-all-documentation');

  let webHeaderDocsAvailable = !requested.includes('WebHeader');
  for (const component of requested) {
    try {
      const docsId = documentationIds.get(component.toLowerCase());
      if (!docsId && documentationIds.size > 0 && component !== 'WebHeader') continue;
      await callMcpToolWithFallbackArgs(
        url,
        'get-documentation',
        docsId ? [{ id: docsId }] : documentationArgCandidates(component),
      );
      docsUsed.add(`storybook:mcp:get-documentation:${component}`);
      if (component === 'WebHeader') webHeaderDocsAvailable = true;
    } catch (err) {
      if (component === 'WebHeader') throw err;
    }
  }

  if (requested.includes('WebHeader')) {
    await callMcpToolWithFallbackArgs(url, 'get-documentation-for-story', [
      { componentId: documentationIds.get('webheader') ?? 'components-navigation-webheader', storyName: 'Default' },
      { componentId: 'webheader', storyName: 'Default' },
      { componentId: 'WebHeader', storyName: 'Default' },
    ]);
    docsUsed.add('storybook:mcp:get-documentation-for-story:Components/Navigation/WebHeader/Default');
    stories.add('Components/Navigation/WebHeader/Default');
  }

  if (!webHeaderDocsAvailable) {
    throw new Error('Storybook MCP WebHeader documentation was not available');
  }

  return { docsUsed: [...docsUsed], stories: [...stories] };
}

function registryEntryForComponent(component: string): DesignContextEntryT | null {
  const found = getRegistryItem(component);
  if (!found.ok) return null;
  const item = found.item;
  return {
    id: `registry:${item.id}`,
    source: 'registry-snapshot',
    title: item.name,
    componentId: item.id,
    path: item.importPath,
    content: [
      `Import from ${item.importPath}.`,
      item.surfaceAware ? 'Surface-aware component.' : 'No Surface remapping required.',
      item.multiAccent ? 'Supports multi-accent appearance.' : 'Does not expose full multi-accent appearance.',
      ...(item.usageRules ?? []),
    ].join('\n'),
    props: item.props.map((prop) => prop.name),
    slots: item.slots,
    variants: item.variants,
    tokens: item.tokenDependencies,
  };
}

function localEntriesForComponents(components: string[]): {
  entries: DesignContextEntryT[];
  missingComponents: string[];
  docsUsed: string[];
} {
  const entries: DesignContextEntryT[] = [];
  const missingComponents: string[] = [];
  const docsUsed: string[] = [];
  for (const component of components) {
    const entry = registryEntryForComponent(component);
    if (!entry) {
      missingComponents.push(component);
      continue;
    }
    entries.push(entry);
    docsUsed.push(entry.id);
  }
  return { entries, missingComponents, docsUsed };
}

export async function resolveDesignContext(
  input: ResolveDesignContextInput,
): Promise<DesignContextResolutionT> {
  const inferred = inferRequestedComponents(input);
  const needsNavigation = requiresStorybookNavigationDocs(input);
  const components = unique([
    ...(needsNavigation ? NAV_COMPONENTS : []),
    ...inferred,
  ]);
  const local = localEntriesForComponents(components);

  if (components.length === 0) {
    return {
      status: 'not-required',
      components: [],
      entries: [],
      docsUsed: [],
      missingComponents: [],
      warnings: [],
      source: 'not-required',
    };
  }

  const requireStorybook = requiresStorybookDesignContext(input);
  const url = input.storybookMcpUrl ?? storybookMcpUrlFromEnv();
  if (!requireStorybook) {
    return {
      status: local.missingComponents.length > 0 ? 'partial' : 'available',
      query: input.prompt,
      components,
      entries: local.entries,
      docsUsed: local.docsUsed,
      missingComponents: local.missingComponents,
      warnings: [],
      source: 'local-fallback',
    };
  }

  try {
    const docs = await fetchStorybookMcpDocs(url, components);
    const storybookEntries: DesignContextEntryT[] = components.map((component) => ({
      id: `storybook:${component}`,
      source: 'storybook-mcp',
      title: component,
      componentId: component,
      storyId: component === 'WebHeader' ? 'Components/Navigation/WebHeader/Default' : undefined,
      content: `Storybook MCP documentation retrieved for ${component}.`,
      props: local.entries.find((entry) => entry.componentId === component)?.props ?? [],
      slots: local.entries.find((entry) => entry.componentId === component)?.slots ?? [],
      variants: local.entries.find((entry) => entry.componentId === component)?.variants ?? [],
      tokens: local.entries.find((entry) => entry.componentId === component)?.tokens ?? [],
    }));
    return {
      status: local.missingComponents.length > 0 ? 'partial' : 'available',
      query: input.prompt,
      components,
      entries: [...storybookEntries, ...local.entries],
      docsUsed: [...docs.docsUsed, ...local.docsUsed],
      missingComponents: local.missingComponents,
      warnings: local.missingComponents.map((component) => `${component} is not registered in OneUI.`),
      source: 'hybrid',
      url,
    };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return {
      status: input.strictStorybook === false && local.missingComponents.length === 0
        ? 'available'
        : local.entries.length > 0
          ? 'partial'
          : 'unavailable',
      query: input.prompt,
      components,
      entries: local.entries,
      docsUsed: [
        ...(needsNavigation ? LOCAL_WEB_HEADER_DOCS : []),
        ...local.docsUsed,
      ],
      missingComponents: local.missingComponents,
      warnings: [
        `Storybook MCP unavailable: ${error}`,
        ...local.missingComponents.map((component) => `${component} is not registered in OneUI.`),
      ],
      source: 'local-fallback',
      url,
      error,
    };
  }
}

function documentationArgCandidates(component: string): Array<Record<string, unknown>> {
  const kebab = kebabCase(component);
  return [
    { id: `components-navigation-${kebab}` },
    { id: component },
    { id: component.toLowerCase() },
    { id: kebab },
  ];
}

function parseDocumentationIds(result: unknown): Map<string, string> {
  const ids = new Map<string, string>();
  const content =
    result && typeof result === 'object' && 'content' in result
      ? (result as { content?: Array<{ type?: string; text?: string }> }).content ?? []
      : [];
  const text = content
    .map((entry) => (entry.type === 'text' && typeof entry.text === 'string' ? entry.text : ''))
    .join('\n');
  for (const match of text.matchAll(/^- ([^(]+?) \(([^)]+)\)$/gm)) {
    const [, name, id] = match;
    if (name && id) ids.set(name.trim().toLowerCase(), id.trim());
  }
  return ids;
}

export async function resolveStorybookRecipeContext(
  input: ResolveStorybookRecipeContextInput,
): Promise<StorybookRecipeContext> {
  const required = requiresStorybookNavigationDocs(input);
  if (!required) {
    const designContext = await resolveDesignContext(input);
    return {
      status: designContext.status === 'not-required' ? 'not-required' : 'available',
      docsUsed: designContext.docsUsed,
      components: designContext.components,
      stories: [],
      source: designContext.source === 'not-required' ? 'not-required' : 'local-fallback',
      designContext,
    };
  }

  const designContext = await resolveDesignContext({
    ...input,
    components: input.components ?? NAV_COMPONENTS,
    requireStorybook: true,
  });
  const stories = designContext.docsUsed.some((doc) =>
    doc.includes('get-documentation-for-story:Components/Navigation/WebHeader/Default') ||
    doc.includes('WebHeader.stories.tsx#Default')
  )
    ? ['Components/Navigation/WebHeader/Default']
    : [];

  return {
    status: designContext.source === 'local-fallback' && input.strictStorybook !== false
      ? 'unavailable'
      : designContext.status === 'unavailable'
        ? 'unavailable'
        : 'available',
    docsUsed: designContext.docsUsed,
    components: designContext.components,
    stories,
    source: designContext.source === 'hybrid' ? 'mcp' : designContext.source,
    designContext,
    ...(designContext.url ? { url: designContext.url } : {}),
    ...(designContext.error ? { error: designContext.error } : {}),
  };
}
