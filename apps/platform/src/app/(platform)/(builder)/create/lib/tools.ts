/**
 * Create section — Claude tools (project + Content Block + Ribbon + canvas layout pipeline).
 *
 * Server-only. Imported exclusively from the chat API route.
 */

import { tool } from 'ai';
import { z } from 'zod';
import { api } from '@oneui/convex';
import { embedQuery, getConvexClient, RAG_MAX_RESULTS, RAG_CHUNK_CHAR_CAP } from '@/lib/rag';

const platformEnum = z.enum(['instagram', 'facebook', 'youtube', 'tiktok', 'linkedin', 'twitter']);

const astSchema = z.object({
  version: z.literal(1),
  name: z.string(),
  root: z.any(),
});

export const createTools = {
  set_project_metadata: tool({
    description:
      'Set the project name, description, project type (single asset vs campaign), and target platforms. Call when the user describes what they want or after clarification.',
    inputSchema: z.object({
      name: z.string().describe('Project name'),
      description: z.string().describe('Brief description'),
      projectType: z.enum(['single', 'campaign']).describe('Single asset or multi-asset campaign'),
      platforms: z.array(platformEnum).describe('Target social platforms'),
      assetTypes: z
        .array(z.string())
        .describe('Dimension names to generate (exact names from the dimensions list).'),
    }),
    execute: async ({ name, platforms, projectType, assetTypes }) => {
      return `Project "${name}" (${projectType}) configured for ${platforms.join(', ')}. Generate assets: ${assetTypes.join(', ')}. Call generate_asset_layout for each.`;
    },
  }),

  ask_clarification: tool({
    description:
      'When user input is too vague, ask structured questions. The UI renders a card; user answers in follow-up messages.',
    inputSchema: z.object({
      questions: z.array(
        z.object({
          id: z.string(),
          prompt: z.string(),
          options: z.array(z.string()).optional(),
          allowFreeText: z.boolean().optional(),
        })
      ),
    }),
    execute: async ({ questions }) => {
      return `Asked ${questions.length} clarification question(s). Wait for the user to answer in chat.`;
    },
  }),

  generate_content_block: tool({
    description:
      'Record ContentBlock props for the marketing copy overlay. The client places a full-bleed ContentBlock component on the tldraw frame. Props: position (top/middle/bottom), alignment (left/center), maxWidth (%), contextText, headlineText, bodyText, primaryCtaText, secondaryCtaText, showContext, showBody, showButtons, showSecondaryButton, headlineToken (auto or Display/Headline S/M/L), platform (auto or S/M/L), density (default/compact/open), buttonSize (s/m/l), buttonAppearance.',
    inputSchema: z.object({
      layout: z.any().describe('ContentBlock props object. canvasWidth/canvasHeight are set automatically from the asset dimension.'),
    }),
    execute: async () => {
      return 'Content Block data recorded for the asset pipeline.';
    },
  }),

  generate_ribbon: tool({
    description: 'Record Ribbon JSON for secondary strip (offer, legal line, etc.).',
    inputSchema: z.object({
      ribbon: z.any().describe('Ribbon JSON (versioned schema).'),
    }),
    execute: async () => {
      return 'Ribbon data recorded for the asset pipeline.';
    },
  }),

  generate_asset_layout: tool({
    description:
      'Generate a marketing asset as a OneUI Component AST. For marketing layouts, use ContentBlock (full-bleed copy overlay) + JioRibbon (Jio brands). ContentBlock handles context/headline/body/CTAs with token-driven typography. Set canvasWidth/canvasHeight to match the dimension. For non-marketing UI layouts, use individual components (Button, Image, etc.).',
    inputSchema: z.object({
      assetName: z.string().describe('Exact dimension name from the list (e.g. IG Post Square).'),
      ast: astSchema.describe('Component AST: { version: 1, name, root: element or component tree }'),
    }),
    execute: async ({ assetName }) => {
      return `Asset "${assetName}" layout queued for the canvas. Continue with remaining sizes if any.`;
    },
  }),

  modify_asset_layout: tool({
    description: 'Replace the component AST for an existing asset (by Convex asset id).',
    inputSchema: z.object({
      assetId: z.string(),
      ast: astSchema,
    }),
    execute: async ({ assetId }) => {
      return `Asset "${assetId}" layout updated.`;
    },
  }),

  adapt_to_formats: tool({
    description: 'User wants all sizes — then call adapt_design_layout for each missing dimension.',
    inputSchema: z.object({
      masterAssetId: z.string(),
    }),
    execute: async ({ masterAssetId }) => {
      return `Adapt master "${masterAssetId}" to all remaining sizes via adapt_design_layout.`;
    },
  }),

  search_design_system: tool({
    description:
      'Search OneUI design system documentation for rules, patterns, tokens, component guidance, architecture details, composition recipes, or any topic beyond the core rules already in your system prompt. Use whenever you need deeper guidance on surfaces, typography, color scales, spacing, motion, elevation, brand cascade, or platform responsive behavior. Returns top-5 relevant chunks from docs/*, CLAUDE.md, and .claude/skills/*.',
    inputSchema: z.object({
      query: z.string().describe('Natural-language question; be specific.'),
      tags: z
        .array(z.string())
        .optional()
        .describe('Optional tag filter: surfaces, typography, color, spacing, shape, motion, elevation, architecture, components, brand, accessibility.'),
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
        const sections = results.map((r: { source: string; heading: string; headingPath: string[]; content: string }) => {
          const path = r.headingPath.length > 0 ? r.headingPath.join(' > ') : r.heading;
          const body = r.content.length > RAG_CHUNK_CHAR_CAP ? `${r.content.slice(0, RAG_CHUNK_CHAR_CAP)}…` : r.content;
          return `### ${path} (${r.source})\n${body}`;
        });
        return sections.join('\n\n---\n\n');
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        return `search_design_system failed: ${message}. Proceed with the core rules already in your system prompt.`;
      }
    },
  }),

  adapt_design_layout: tool({
    description:
      'Create a new asset for another dimension with a new component AST adapted to that aspect ratio.',
    inputSchema: z.object({
      masterAssetId: z.string(),
      targetDimensionName: z.string(),
      ast: astSchema,
    }),
    execute: async ({ targetDimensionName, masterAssetId }) => {
      return `Adapted from "${masterAssetId}" to "${targetDimensionName}".`;
    },
  }),
};

export type CreateToolName = keyof typeof createTools;
