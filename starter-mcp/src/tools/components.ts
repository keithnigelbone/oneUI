/**
 * Phase 2 — component tools.
 * list_components · get_component_info
 */
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { getComponentIndex, getComponent } from '../lib/snapshot.js';
import { getInstalledReleasedComponents, normalizeComponent } from '../lib/installedReleased.js';
import type { ComponentIndexEntry } from '../lib/snapshot.js';
import { resolvePlatform, type PlatformPack } from '../lib/platforms.js';
import { text, errorText, json, defaultProjectRoot } from './util.js';

const PLATFORM_DESC =
  'Target platform pack: "react" (web, @jds4/oneui-react — default) or "reactnative" (@oneui/ui-native).';

/**
 * Filter the active platform's baked catalog to the components the INSTALLED
 * runtime package actually releases (auto-syncs to the user's version). Falls
 * back to the full baked catalog when no package is installed, or when the
 * package ships no release gates (RN today — see lib/installedReleased.ts).
 */
async function releasedIndex(pack: PlatformPack, projectRoot?: string): Promise<ComponentIndexEntry[]> {
  const items = getComponentIndex(pack.assetSubdir);
  const installed = await getInstalledReleasedComponents(defaultProjectRoot(projectRoot), pack.pkgSubdir);
  if (!installed) return items; // offline / package not installed / no gates → baked catalog
  return items.filter(
    (c) => installed.has(normalizeComponent(c.slug)) || installed.has(normalizeComponent(c.name)),
  );
}

export function registerComponentTools(server: McpServer): void {
  server.registerTool(
    'list_components',
    {
      title: 'List OneUI components',
      description:
        'List the OneUI/JDS components available for the target platform, with a one-line intent and ' +
        'tags for each. Web (react) lists from @jds4/oneui-react; reactnative lists from @oneui/ui-native. ' +
        'Only RELEASED components are listed — for web the set auto-syncs to the version installed in the ' +
        'project (read from node_modules); WIP components are never shown. ' +
        'Use get_component_info(name) for the full API.',
      inputSchema: {
        filter: z.string().optional().describe('Optional substring/tag filter, e.g. "input" or "navigation".'),
        projectRoot: z.string().optional().describe('Project root (to read the installed package). Defaults to cwd.'),
        platform: z.string().optional().describe(PLATFORM_DESC),
      },
    },
    async ({ filter, projectRoot, platform }) => {
      const resolved = resolvePlatform(platform, { allowPlanned: true });
      if (!resolved.ok) return text(`## Platform not supported\n\n${resolved.message}`);
      const pack = resolved.pack;

      let items = await releasedIndex(pack, projectRoot);
      if (items.length === 0) return text(`No ${pack.label} components are baked into this snapshot.`);
      if (filter && filter.trim()) {
        const f = filter.toLowerCase();
        items = items.filter(
          (c) =>
            c.name.toLowerCase().includes(f) ||
            (c.intent ?? '').toLowerCase().includes(f) ||
            (c.tags ?? []).some((t) => t.toLowerCase().includes(f)),
        );
        if (items.length === 0) return text(`No components match "${filter}".`);
      }
      const out = items
        .map((c) => `- **${c.name}** — ${c.intent ?? 'OneUI component'}${c.tags && c.tags.length ? `  _[${c.tags.join(', ')}]_` : ''}`)
        .join('\n');
      return text(`# OneUI components — ${pack.label} (${items.length})\n\n${out}\n\nImport from \`${pack.runtimePackage}\`. Call get_component_info(name) for props, slots, variant logic, and examples.`);
    },
  );

  server.registerTool(
    'get_component_info',
    {
      title: 'Get a OneUI component API',
      description:
        'Return the full metadata for one component: intent, composition rules (requires/allows/forbids), ' +
        'variant logic, props (types/options/defaults), slots, accessibility, code snippets and tags. ' +
        'Read this before using a component so the generated code is correct and on-brand.',
      inputSchema: {
        name: z.string().describe('Component name or slug, e.g. "Button" or "button".'),
        section: z
          .enum(['all', 'props', 'variants', 'composition', 'examples'])
          .optional()
          .describe('Limit the response to one section. Default "all".'),
        projectRoot: z.string().optional().describe('Project root (to read the installed package). Defaults to cwd.'),
        platform: z.string().optional().describe(PLATFORM_DESC),
      },
    },
    async ({ name, section, projectRoot, platform }) => {
      const resolved = resolvePlatform(platform, { allowPlanned: true });
      if (!resolved.ok) return text(`## Platform not supported\n\n${resolved.message}`);
      const pack = resolved.pack;

      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const idx = await releasedIndex(pack, projectRoot);
      const match = idx.find((c) => c.slug === slug || c.name.toLowerCase() === name.toLowerCase());
      const data = match ? getComponent(match.slug, pack.assetSubdir) : null;
      if (!data) {
        const close = idx
          .filter(
            (c) =>
              c.name.toLowerCase().includes(name.toLowerCase()) ||
              name.toLowerCase().includes(c.name.toLowerCase()),
          )
          .slice(0, 3)
          .map((c) => `"${c.name}"`);
        const hint = close.length
          ? ` Did you mean: ${close.join(', ')}?`
          : ' Call list_components() to browse all available components.';
        return errorText(`Component "${name}" not found.${hint}`);
      }
      const sec = section ?? 'all';
      if (sec === 'all') return text(json(data));
      const map: Record<string, string[]> = {
        props: ['componentName', 'props', 'propsSchema', 'slots'],
        variants: ['componentName', 'variantLogic'],
        composition: ['componentName', 'intentAndPurpose', 'compositionRules', 'relationshipsAndDependencies'],
        examples: ['componentName', 'codeSnippets'],
      };
      const picked: Record<string, unknown> = {};
      for (const key of map[sec]) if (key in data) picked[key] = (data as Record<string, unknown>)[key];
      return text(json(picked));
    },
  );
}
