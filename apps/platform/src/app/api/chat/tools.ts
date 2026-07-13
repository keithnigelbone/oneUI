/**
 * Home-chat tools.
 *
 * Server-only. Imported by the streaming /api/chat route. Intentionally
 * smaller than the create/ tool set — home chat exposes the three tools
 * the global agent needs: RAG search, platform navigation, and
 * on-demand brand foundation lookups.
 */

import { tool } from 'ai';
import { z } from 'zod';
import { api } from '@oneui/convex';
import { embedQuery, getConvexClient, RAG_MAX_RESULTS, RAG_CHUNK_CHAR_CAP } from '@/lib/rag';
import { ALL_NAVIGATION_SLUGS } from '@/config/navigation';

// The ai SDK's `z.enum()` wants a non-empty tuple literal type; convert
// the derived `readonly string[]` to the required `[string, ...string[]]`.
const NAVIGATE_SLUGS_TUPLE = ALL_NAVIGATION_SLUGS as unknown as [string, ...string[]];

export const homeTools = {
  search_design_system: tool({
    description:
      'Search OneUI design system documentation for rules, patterns, tokens, component guidance, architecture details, composition recipes, or any topic beyond the core rules already in your system prompt. Use whenever you need deeper guidance on surfaces, typography, color scales, spacing, motion, elevation, brand cascade, or platform responsive behavior, OR when the user asks to build something non-trivial and you want to ground your answer in existing recipes. Returns top-5 relevant chunks from docs/*, CLAUDE.md, and .claude/skills/*.',
    inputSchema: z.object({
      query: z.string().describe('Natural-language question; be specific.'),
      tags: z
        .array(z.string())
        .optional()
        .describe(
          'Optional tag filter: surfaces, typography, color, spacing, shape, motion, elevation, architecture, components, brand, accessibility.',
        ),
    }),
    execute: async ({ query, tags }) => {
      try {
        const embedding = await embedQuery(query);
        const client = getConvexClient();
        const results = await client.action(api.knowledge.search, {
          embedding,
          tags,
          limit: RAG_MAX_RESULTS,
          query,
        });
        if (results.length === 0) {
          return 'No matching documentation found. Try broader terms or drop the tag filter.';
        }
        const sections = results.map(
          (r: { source: string; heading: string; headingPath: string[]; content: string }) => {
            const path = r.headingPath.length > 0 ? r.headingPath.join(' > ') : r.heading;
            const body =
              r.content.length > RAG_CHUNK_CHAR_CAP
                ? `${r.content.slice(0, RAG_CHUNK_CHAR_CAP)}…`
                : r.content;
            return `### ${path} (${r.source})\n${body}`;
          },
        );
        return sections.join('\n\n---\n\n');
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return `search_design_system failed: ${message}. Proceed with the core rules already in your system prompt.`;
      }
    },
  }),

  navigate_to: tool({
    description:
      'When the user wants to jump to a specific part of One UI Studio — Brand settings, Foundations editor, a component page, the Canvas, the Create campaign builder, or the Agents hub — call this with the destination slug. The UI renders a navigation card the user can click to move there. Do NOT call this speculatively; only call when the user explicitly asks to "go to", "open", "take me to", or "navigate to" something.',
    inputSchema: z.object({
      slug: z
        .enum(NAVIGATE_SLUGS_TUPLE)
        .describe('Canonical destination slug from the known navigation list.'),
      reason: z
        .string()
        .describe(
          'One short sentence explaining why this destination matches the user request. Shown to the user as the card subtitle.',
        ),
    }),
    execute: async ({ slug, reason }) => {
      return `Navigation hint recorded: ${slug} — ${reason}`;
    },
  }),

  get_brand_foundation: tool({
    description:
      "Fetch a specific piece of the active brand's foundation data on demand — color scale, typography config, surface stacking, or a dimension config. Use this instead of asking the user for values you can look up. The brief brand summary in your system prompt is deliberately terse; call this when you need concrete token names or numeric scale data to answer accurately.",
    inputSchema: z.object({
      topic: z
        .enum([
          'color',
          'typography',
          'surfaces',
          'dimensions',
          'motion',
          'shape',
          'elevation',
        ])
        .describe('Which foundation slice to fetch.'),
    }),
    execute: async ({ topic }) => {
      // v1 stub: returns a pointer back to search_design_system with the
      // matching tag. A later pass can wire this directly to Convex
      // `getBrandOverviewData` once we pick a terse JSON shape per topic.
      return `Detailed ${topic} foundation data is available via \`search_design_system\` with tag "${topic}". Call that tool with a specific question.`;
    },
  }),
};

export type HomeToolName = keyof typeof homeTools;
