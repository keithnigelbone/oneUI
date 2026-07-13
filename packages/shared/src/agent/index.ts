/**
 * Agent module — composes system prompts for the global One UI Studio agent.
 *
 * Pure functions over serializable inputs (ComponentMeta[], BrandFoundationSummary).
 * No React, no Convex, no AI SDK imports. Consumed by Next.js routes that want
 * to assemble a system prompt before calling the Anthropic API.
 */

export { buildAgentContext, CORE_INVARIANTS } from './buildAgentContext';
export {
  renderCoreInvariants,
  renderComponentContext,
  renderBrandSummary,
  renderVoiceSection,
  renderModeGuidance,
} from './knowledgeSources';
export type {
  AgentMode,
  BrandFoundationSummary,
  BuildAgentContextInput,
  BuildAgentContextResult,
} from './types';
export { CLAUDE_MODEL, CLAUDE_VISION_MODEL } from './models';
export type { ClaudeModelId } from './models';

// Structured invariants (B4) — the per-SDK overload of renderCoreInvariants
// reads from this source-of-truth. Re-exported so non-platform consumers can
// render directly.
export {
  CORE_INVARIANTS_STRUCT,
  renderCoreInvariantsStructured,
  type InvariantSdk,
  type CoreInvariantsStruct,
} from '../types/coreInvariants';
