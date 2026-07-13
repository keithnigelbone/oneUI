/**
 * agent/types.ts
 *
 * Shared types for the global agent context builder. All types are serializable
 * and framework-agnostic — no React, no Convex, no AI SDK imports.
 */

import type { ComponentMeta } from '../types/componentMeta';

/**
 * A flattened, terse summary of the currently active brand's foundations.
 * Callers build this from Convex (`getBrandOverviewData`) or platform context
 * and pass it in — the agent module never touches Convex directly.
 */
export interface BrandFoundationSummary {
  brandName: string;
  theme: 'light' | 'dark';
  primaryFont?: string;
  secondaryFont?: string;
  codeFont?: string;
  /** Multi-accent roles wired on this brand, e.g. ['primary', 'secondary', 'neutral']. */
  activeRoles?: string[];
  density?: 'compact' | 'default' | 'open';
  /** Display hint like 'L'. Purely informational. */
  platform?: string;
}

/**
 * Which surface is asking for a system prompt. Controls mode-specific
 * guidance blocks (e.g., home vs create vs agents). Open string type so
 * future modes can be added without widening this union.
 */
export type AgentMode = 'home' | 'create' | 'agents' | (string & {});

export interface BuildAgentContextInput {
  /**
   * Full component registry as serializable metas. The caller flattens
   * `COMPONENT_REGISTRY` from `@oneui/ui` and hands the metas in so the
   * shared package stays free of UI dependencies.
   */
  componentMetas: ComponentMeta[];
  brand: BrandFoundationSummary;
  mode: AgentMode;
  /**
   * Optional compiled voice system prompt (from the tone-of-voice compiler).
   * When present, an extra section is appended so the agent's replies follow
   * the brand's tone rules.
   */
  voicePrompt?: string;
  /**
   * Optional compiled composition system prompt (from the composition compiler).
   * When present, an extra section is appended so the agent's layout/surface/
   * component suggestions follow the brand's composition rules.
   */
  compositionPrompt?: string;
  /** Hard character budget. Default 24_000 — mirrors the legacy create/ limit. */
  maxChars?: number;
}

export interface BuildAgentContextResult {
  system: string;
  /** Final character count after any truncation. */
  chars: number;
  /** True when the output was sliced to fit `maxChars`. */
  truncated: boolean;
}

export type { ComponentMeta };
