/**
 * Create section — system prompt for tldraw / Component AST pipeline.
 */

import type { BrandContext } from './types';
import type { SocialPlatform } from './types';
import type { AssetType } from './types';
import { CONTENT_BLOCK_PROMPT_SECTION } from './content-block-schema';
import { RIBBON_PROMPT_SECTION } from './ribbon-schema';
import { buildCanvasCreateSystemPrompt } from './canvas-create-prompt';
import { buildKnowledgeContext } from './knowledge-context';

interface ProjectContextShape {
  name: string;
  description?: string;
  platforms: SocialPlatform[];
  audience?: string;
  tone?: string;
  brief?: string;
  assetType?: AssetType;
  projectType?: 'single' | 'campaign';
}

interface ExistingAsset {
  id: string;
  name: string;
  dimension: string;
  platform: string;
  status: string;
  hasImage: boolean;
}

/** Maps to Experience campaignContext shape for shared prompt builder. */
export function buildCreateSystemPrompt(
  brandContext: BrandContext,
  platforms: SocialPlatform[],
  tokenCSS?: string,
  projectContext?: ProjectContextShape,
  existingAssets?: ExistingAsset[]
): string {
  const projectTypeLine = projectContext?.projectType
    ? `\n## PROJECT TYPE\n- **Type**: ${projectContext.projectType === 'single' ? 'Single asset' : 'Campaign (multiple coordinated assets)'}\n`
    : '';

  const toolLine = `
## CREATE TOOLS
- Use **set_project_metadata** for project name, projectType, platforms, and assetTypes.
- Use **ask_clarification** when the request is too vague.
- Use **generate_content_block** and **generate_ribbon** for structured JSON when helpful.
- Use **generate_asset_layout** for each new asset (Component AST).
- Use **modify_asset_layout** to replace the AST of an existing asset (by Convex id).
- Use **adapt_design_layout** when adapting to another dimension; **adapt_to_formats** to fan out sizes.
- Use **search_design_system** whenever you need deeper guidance than the core rules above: typography role selection, color scale semantics, V4 surface algorithm, architecture, motion/elevation recipes, platform-specific responsive behavior, composition patterns. Prefer retrieving before guessing — the design system is precise.
`;

  const base = buildCanvasCreateSystemPrompt(
    brandContext,
    platforms,
    tokenCSS,
    projectContext,
    existingAssets
  );

  const knowledge = buildKnowledgeContext({ brandContext });

  return `${base}\n\n${knowledge}${projectTypeLine}${toolLine}\n${CONTENT_BLOCK_PROMPT_SECTION}\n${RIBBON_PROMPT_SECTION}`;
}
