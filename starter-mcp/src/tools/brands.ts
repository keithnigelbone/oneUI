/**
 * Phase 2 — brand tools.
 * list_brands · get_brand_tokens · get_brand_design_spec · get_surface_guide
 */
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  getBrandIndex,
  getBrandTokens,
  getBrandSpec,
  getSurfaceGuide,
} from '../lib/snapshot.js';
import { text, errorText, json } from './util.js';

export function registerBrandTools(server: McpServer): void {
  server.registerTool(
    'list_brands',
    {
      title: 'List OneUI brands',
      description:
        'List the brands available in this snapshot. Jio is the default and the fallback. ' +
        'Real (non-synthetic) brands have richer design specs; synthetic brands are test palettes.',
      inputSchema: {
        includeSynthetic: z
          .boolean()
          .optional()
          .describe('Include synthetic test brands. Default false (only real brands).'),
      },
    },
    async ({ includeSynthetic }) => {
      let brands = getBrandIndex();
      if (brands.length === 0) return text('No brands are baked into this snapshot.');
      if (!includeSynthetic) brands = brands.filter((b) => !b.synthetic);
      const out = brands
        .map(
          (b) =>
            `- **${b.slug}**${b.slug === 'jio' ? ' _(default)_' : ''} — ${b.name}` +
            `${b.primaryColor ? ` · primary ${b.primaryColor}` : ''}` +
            `${b.fontFamily ? ` · ${b.fontFamily}` : ''}` +
            `${b.hasSpec ? ' · spec ✓' : ''}`,
        )
        .join('\n');
      return text(
        `# OneUI brands (${brands.length}${includeSynthetic ? ', incl. synthetic' : ', real only'})\n\n${out}\n\n` +
          `Use get_brand_tokens(slug) for the palette/roles and get_brand_design_spec(slug) for the design spec.`,
      );
    },
  );

  server.registerTool(
    'get_brand_tokens',
    {
      title: 'Get a brand’s tokens',
      description:
        'Return a brand’s theme configuration: the 9 appearance roles, each with its palette name, ' +
        'light/dark base steps, and 25-step OkLCH colour scale. This is the colour identity the ' +
        'brand CSS engine resolves tokens from.',
      inputSchema: {
        slug: z.string().describe('Brand slug from list_brands, e.g. "jio" or "reliance".'),
        rolesOnly: z
          .boolean()
          .optional()
          .describe('Return only the role summary (names + base steps), not full palettes. Default false.'),
      },
    },
    async ({ slug, rolesOnly }) => {
      const data = getBrandTokens(slug);
      if (!data) return errorText(`Brand tokens for "${slug}" not found. Call list_brands for valid slugs.`);
      if (rolesOnly && data && typeof data === 'object' && 'appearances' in data) {
        const appearances = (data as { appearances: Record<string, Record<string, unknown>> }).appearances;
        const summary: Record<string, unknown> = {};
        for (const [role, cfg] of Object.entries(appearances)) {
          summary[role] = {
            name: cfg.name,
            baseStep: cfg.baseStep,
            darkerBaseStep: cfg.darkerBaseStep,
          };
        }
        return text(json({ slug, roles: summary }));
      }
      return text(json(data));
    },
  );

  server.registerTool(
    'get_brand_design_spec',
    {
      title: 'Get a brand’s design spec',
      description:
        'Return the human/agent-readable DESIGN.md spec for a brand: resolved colours, typography ' +
        'scale, radii, spacing, and component-level styling. Available for real brands ' +
        '(jio, reliance, tira, swadesh, oneui-system).',
      inputSchema: {
        slug: z.string().describe('Brand slug, e.g. "jio".'),
      },
    },
    async ({ slug }) => {
      const spec = getBrandSpec(slug);
      if (spec === null) {
        return errorText(
          `No design spec for "${slug}". Specs exist for real brands only — check list_brands (spec ✓).`,
        );
      }
      return text(spec);
    },
  );

  server.registerTool(
    'get_surface_guide',
    {
      title: 'Get the OneUI surface guide',
      description:
        'Return the full surface-context guide: the 7 surface modes and their parent-step-relative ' +
        'resolution rules, the content + state tokens, and how/when to use <Surface mode="…">. ' +
        'Read this whenever placing components on a tinted, dark, or coloured background.',
      inputSchema: {},
    },
    async () => {
      const guide = getSurfaceGuide();
      return guide ? text(guide) : errorText('The surface guide is not present in this snapshot.');
    },
  );
}
