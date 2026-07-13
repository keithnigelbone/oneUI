/**
 * AgentPulse interface (native)
 * Semantic source: packages/ui/src/components/AgentPulse/AgentPulse.shared.ts
 */

import type { ViewStyle, AccessibilityRole } from 'react-native';
import type { ComponentAppearance } from '@oneui/shared';

/** The four canonical agent states. Each state plays a looping animation. */
export type AgentPulseState = 'idle' | 'listening' | 'thinking' | 'speaking';

/** T-shirt size presets — map to dimension f-step tokens. */
export type AgentPulseSize = 'sm' | 'md' | 'lg' | 'xl';

/** Reduced-motion fallback strategy when the user prefers reduced motion. */
export type AgentPulseReducedMotionFallback = 'static' | 'pulse' | 'none';

/** Internal phase machine. */
export type AgentPulsePhase =
  | 'idle'
  | 'idle-settling'
  | 'transitioning-to-listening'
  | 'listening'
  | 'transitioning-to-thinking'
  | 'thinking'
  | 'speaking';

export interface AgentPulseProps {
  /** Visual state. Component plays the matching loop and auto-runs a bridge
   *  animation between states when one exists. */
  state?: AgentPulseState;

  /** Multi-accent appearance role. Recolours the Lottie at runtime. */
  appearance?: ComponentAppearance;

  /** Size preset (maps to dimension f-step tokens) or pixel override. */
  size?: AgentPulseSize | number;

  /** Skip the bridge animation between states. */
  autoTransition?: boolean;

  /** Pause animation playback. */
  paused?: boolean;

  /** Playback rate (1 = normal, 2 = double, 0.5 = half). */
  speed?: number;

  /** Reduced-motion fallback. */
  reducedMotionFallback?: AgentPulseReducedMotionFallback;

  /** Override the auto-derived a11y label (e.g. "Agent is thinking"). */
  label?: string;

  /** Live region politeness for screen readers. */
  'aria-live'?: 'off' | 'polite' | 'assertive';

  style?: ViewStyle;
  testID?: string;
}

/** Default a11y label per state. */
export const AGENT_PULSE_DEFAULT_LABEL: Record<AgentPulseState, string> = {
  idle: 'Agent is idle',
  listening: 'Agent is listening',
  thinking: 'Agent is thinking',
  speaking: 'Agent is speaking',
};

export const LISTENING_ENTRY_MS = 1633;
export const LISTENING_EXIT_MS = 1000;
export const IDLE_SETTLE_MS = 300;
export const THINKING_LOOP_MS = 4000;
export const THINKING_SEGMENT_MS = 1000;

export function useAgentPulseState(props: AgentPulseProps) {
  const { state = 'idle', appearance = 'auto' } = props;
  
  const resolvedAppearance = appearance === 'auto' || !appearance ? 'primary' : appearance;

  return {
    resolvedAppearance,
    state,
  };
}

export function getAgentPulseAccessibilityProps(props: AgentPulseProps) {
  const { state = 'idle', label, 'aria-live': ariaLive = 'polite' } = props;
  const resolvedLabel = label ?? AGENT_PULSE_DEFAULT_LABEL[state];

  return {
    accessible: true,
    accessibilityRole: 'progressbar' as AccessibilityRole,
    accessibilityLabel: resolvedLabel,
    accessibilityLiveRegion: (ariaLive === 'off' ? 'none' : ariaLive) as 'none' | 'polite' | 'assertive',
  };
}
