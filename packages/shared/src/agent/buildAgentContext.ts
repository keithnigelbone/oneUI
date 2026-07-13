/**
 * buildAgentContext.ts
 *
 * Composes a system prompt for the global One UI Studio agent out of:
 *   1. Core invariants (static, always-on design system rules)
 *   2. Component registry (generated from ComponentMeta[])
 *   3. Brand foundations summary (brand name, theme, fonts, active roles)
 *   4. Optional tone-of-voice section (from the voice compiler)
 *   5. Mode-specific "when to reach for search_design_system" guidance
 *
 * This is the single place where knowledge sources are stitched together —
 * the home chat route, the create/ chat route, and any future agent all
 * call this function. Pure, no side effects, unit-testable in Node.
 */

import {
  CORE_INVARIANTS,
  renderBrandSummary,
  renderComponentContext,
  renderCompositionSection,
  renderCoreInvariants,
  renderModeGuidance,
  renderVoiceSection,
} from './knowledgeSources';
import type { BuildAgentContextInput, BuildAgentContextResult } from './types';

const DEFAULT_MAX_CHARS = 24_000;
const TRUNCATION_NOTICE = '\n\n[truncated — call search_design_system for details]';

export function buildAgentContext(input: BuildAgentContextInput): BuildAgentContextResult {
  const maxChars = input.maxChars ?? DEFAULT_MAX_CHARS;
  const parts: string[] = [];

  parts.push(renderCoreInvariants());
  parts.push(renderComponentContext(input.componentMetas, input.brand.brandName));
  parts.push(renderBrandSummary(input.brand));
  if (input.voicePrompt && input.voicePrompt.trim().length > 0) {
    parts.push(renderVoiceSection(input.voicePrompt));
  }
  if (input.compositionPrompt && input.compositionPrompt.trim().length > 0) {
    parts.push(renderCompositionSection(input.compositionPrompt));
  }
  parts.push(renderModeGuidance(input.mode));

  const joined = parts.join('\n\n');

  if (joined.length > maxChars) {
    const budget = Math.max(0, maxChars - TRUNCATION_NOTICE.length);
    const truncatedBody = joined.slice(0, budget) + TRUNCATION_NOTICE;
    return {
      system: truncatedBody,
      chars: truncatedBody.length,
      truncated: true,
    };
  }

  return {
    system: joined,
    chars: joined.length,
    truncated: false,
  };
}

export { CORE_INVARIANTS };
