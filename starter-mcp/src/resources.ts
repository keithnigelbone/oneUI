/**
 * Read-only MCP resources mirroring the snapshot, so agents can also pull
 * knowledge by URI (oneui://…) instead of a tool call.
 */
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  getCoreInvariants,
  getSurfaceGuide,
  getRegistrySetup,
  getPrdTemplate,
  getSkillIndex,
  getSkill,
  getComponentIndex,
  getComponent,
  getBrandIndex,
  getBrandTokens,
} from './lib/snapshot.js';
import { json } from './tools/util.js';

export function registerResources(server: McpServer): void {
  server.registerResource(
    'oneui-invariants',
    'oneui://invariants',
    {
      title: 'OneUI core invariants',
      description: 'The always-apply OneUI design rules.',
      mimeType: 'text/markdown',
    },
    async (uri) => ({
      contents: [{ uri: uri.href, text: getCoreInvariants() ?? '(missing)', mimeType: 'text/markdown' }],
    }),
  );

  server.registerResource(
    'oneui-surface-guide',
    'oneui://surface-guide',
    {
      title: 'OneUI surface guide',
      description: 'The 7 surface modes, resolution rules, and usage.',
      mimeType: 'text/markdown',
    },
    async (uri) => ({
      contents: [{ uri: uri.href, text: getSurfaceGuide() ?? '(missing)', mimeType: 'text/markdown' }],
    }),
  );

  server.registerResource(
    'oneui-registry-setup',
    'oneui://registry-setup',
    {
      title: 'JDS feed setup guide',
      description: 'How to connect to the private JDS/OneUI Azure DevOps feed (registry, .npmrc, PAT).',
      mimeType: 'text/markdown',
    },
    async (uri) => ({
      contents: [{ uri: uri.href, text: getRegistrySetup() ?? '(missing)', mimeType: 'text/markdown' }],
    }),
  );

  server.registerResource(
    'oneui-prd-template',
    'oneui://prd-template',
    {
      title: 'OneUI PRD template',
      description: 'Blank PRD template + worked example to drive /oneui-build-from-prd.',
      mimeType: 'text/markdown',
    },
    async (uri) => ({
      contents: [{ uri: uri.href, text: getPrdTemplate() ?? '(missing)', mimeType: 'text/markdown' }],
    }),
  );

  server.registerResource(
    'oneui-skill',
    new ResourceTemplate('oneui://skills/{name}', {
      list: async () => ({
        resources: getSkillIndex().map((s) => ({
          uri: `oneui://skills/${s.name}`,
          name: s.name,
          description: s.description,
          mimeType: 'text/markdown',
        })),
      }),
    }),
    { title: 'OneUI skill', description: 'A OneUI design skill.', mimeType: 'text/markdown' },
    async (uri, variables) => {
      const name = String(variables.name);
      const skill = getSkill(name);
      return {
        contents: [
          { uri: uri.href, text: skill ? skill.body : `Skill "${name}" not found.`, mimeType: 'text/markdown' },
        ],
      };
    },
  );

  server.registerResource(
    'oneui-component',
    new ResourceTemplate('oneui://components/{slug}', {
      list: async () => ({
        resources: getComponentIndex().map((c) => ({
          uri: `oneui://components/${c.slug}`,
          name: c.name,
          description: c.intent ?? 'OneUI component',
          mimeType: 'application/json',
        })),
      }),
    }),
    { title: 'OneUI component', description: 'Component metadata.', mimeType: 'application/json' },
    async (uri, variables) => {
      const slug = String(variables.slug);
      const data = getComponent(slug);
      return {
        contents: [
          { uri: uri.href, text: data ? json(data) : `{"error":"component ${slug} not found"}`, mimeType: 'application/json' },
        ],
      };
    },
  );

  server.registerResource(
    'oneui-brand',
    new ResourceTemplate('oneui://brands/{slug}', {
      list: async () => ({
        resources: getBrandIndex().map((b) => ({
          uri: `oneui://brands/${b.slug}`,
          name: b.name,
          description: `${b.synthetic ? 'synthetic ' : ''}brand`,
          mimeType: 'application/json',
        })),
      }),
    }),
    { title: 'OneUI brand', description: 'Brand theme configuration.', mimeType: 'application/json' },
    async (uri, variables) => {
      const slug = String(variables.slug);
      const data = getBrandTokens(slug);
      return {
        contents: [
          { uri: uri.href, text: data ? json(data) : `{"error":"brand ${slug} not found"}`, mimeType: 'application/json' },
        ],
      };
    },
  );
}
