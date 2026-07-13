/**
 * agentRoutes.ts
 *
 * Single source of truth for the agent route mode — the discriminator
 * used by the `/api/agent` dispatcher and the `useAgentChat` hook.
 *
 * Distinct from `@oneui/shared/agent`'s `AgentMode` (which governs
 * mode-specific guidance inside the compiled system prompt). These
 * two modes are semantically different concerns, so they intentionally
 * live in different layers.
 */

export type AgentRouteMode = 'home' | 'build' | 'design' | 'voice';

export const AGENT_ROUTE_MODES: readonly AgentRouteMode[] = [
  'home',
  'build',
  'design',
  'voice',
] as const;

export function isAgentRouteMode(value: unknown): value is AgentRouteMode {
  return (
    typeof value === 'string' &&
    (AGENT_ROUTE_MODES as readonly string[]).includes(value)
  );
}

/** Unified agent dispatcher path. All modes post here. */
export const AGENT_ROUTE = '/api/agent';
