/**
 * AgentPulse.shared.ts
 *
 * Shared types for the AgentPulse component — an animated brand-coloured
 * indicator that visualises the four canonical agent states (idle,
 * listening, thinking, speaking) using the OneUI/Jio logo geometry.
 *
 * Colours are recoloured at runtime from the active brand's appearance
 * role (default `secondary`, tinted emphasis), so the component adapts
 * automatically across brands and surface contexts.
 */

import type { CSSProperties, Ref } from 'react';
import type { ComponentAppearance } from '@oneui/shared';

/** The four canonical agent states. Each state plays a looping animation. */
export type AgentPulseState = 'idle' | 'listening' | 'thinking' | 'speaking';

/** Figma colour roles for Agent Pulse. */
export type AgentPulseAppearance = 'primary' | 'secondary' | 'sparkle';

/** Figma emphasis — Agent pulse is always tinted. */
export type AgentPulseEmphasis = 'tinted' | 'tintedA11y';

export const AGENT_PULSE_APPEARANCES: readonly AgentPulseAppearance[] = [
  'primary',
  'secondary',
  'sparkle',
] as const;

export const AGENT_PULSE_EMPHASIS_LEVELS: readonly AgentPulseEmphasis[] = [
  'tinted',
  'tintedA11y',
] as const;

/**
 * Figma dimension-token sizes (spacing scale indices).
 * Each maps to `--Spacing-{n}` (e.g. size `'8'` → `--Spacing-8`).
 */
export type AgentPulseDimensionSize =
  | '2' | '2.5' | '3' | '3.5' | '4' | '4.5' | '5'
  | '6' | '7' | '8' | '9' | '10'
  | '12' | '14' | '16' | '18' | '20'
  | '24' | '32' | '40';

/** @deprecated Use dimension tokens (`'5'`, `'7'`, `'9'`, `'12'`). */
export type AgentPulseLegacySize = 'sm' | 'md' | 'lg' | 'xl';

/** Resolved size passed to `data-size` on the root element. */
export type AgentPulseSize = AgentPulseDimensionSize;

/** Reduced-motion fallback strategy when the user prefers reduced motion. */
export type AgentPulseReducedMotionFallback = 'static' | 'pulse' | 'none';

export interface AgentPulseProps {
  /** Visual state. Component plays the matching loop and auto-runs a bridge
   *  animation between states when one exists. */
  state?: AgentPulseState;

  /** Multi-accent appearance role. Default: `secondary`. */
  appearance?: AgentPulseAppearance | ComponentAppearance;

  /**
   * Tinted colour emphasis (Figma: Agent pulse is always tinted).
   * @default 'tinted'
   */
  emphasis?: AgentPulseEmphasis;

  /** Figma dimension-token size, legacy preset, or pixel override. */
  size?: AgentPulseDimensionSize | AgentPulseLegacySize | number;

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

  className?: string;
  style?: CSSProperties;
  ref?: Ref<AgentPulseHandle>;
}

export interface AgentPulseHandle {
  play(): void;
  pause(): void;
  /** Imperatively change state (optionally skipping the bridge animation). */
  setState(next: AgentPulseState, opts?: { transition?: boolean }): void;
}

/** Default a11y label per state. */
export const AGENT_PULSE_DEFAULT_LABEL: Record<AgentPulseState, string> = {
  idle: 'Agent is idle',
  listening: 'Agent is listening',
  thinking: 'Agent is thinking',
  speaking: 'Agent is speaking',
};

/** All states, useful for iteration in stories/tests. */
export const AGENT_PULSE_STATES: readonly AgentPulseState[] = [
  'idle',
  'listening',
  'thinking',
  'speaking',
] as const;

/** Figma dimension sizes in order. */
export const AGENT_PULSE_SIZES: readonly AgentPulseDimensionSize[] = [
  '2', '2.5', '3', '3.5', '4', '4.5', '5',
  '6', '7', '8', '9', '10',
  '12', '14', '16', '18', '20',
  '24', '32', '40',
] as const;

const LEGACY_SIZE_MAP: Record<AgentPulseLegacySize, AgentPulseDimensionSize> = {
  sm: '5',
  md: '7',
  lg: '9',
  xl: '12',
};

/** Map Figma / legacy size props to `data-size` + optional inline override. */
export function resolveAgentPulseSize(
  size?: AgentPulseDimensionSize | AgentPulseLegacySize | number,
): { dataSize: AgentPulseDimensionSize; inlineSize?: string } {
  if (typeof size === 'number') {
    return { dataSize: '8', inlineSize: `${size}px` };
  }
  if (!size) {
    return { dataSize: '7' };
  }
  if (size in LEGACY_SIZE_MAP) {
    return { dataSize: LEGACY_SIZE_MAP[size as AgentPulseLegacySize] };
  }
  return { dataSize: size as AgentPulseDimensionSize };
}

const FIGMA_APPEARANCE_SET = new Set<string>(AGENT_PULSE_APPEARANCES);

/** Resolve appearance — default `secondary`; `auto` → `secondary`. */
export function resolveAgentPulseAppearance(
  appearance?: AgentPulseAppearance | ComponentAppearance,
): AgentPulseAppearance | Exclude<ComponentAppearance, 'auto'> {
  if (!appearance || appearance === 'auto') {
    return 'secondary';
  }
  if (FIGMA_APPEARANCE_SET.has(appearance)) {
    return appearance as AgentPulseAppearance;
  }
  return appearance;
}

/** CSS `var()` for tinted fill from appearance role + emphasis. */
export function agentPulseColorVar(
  appearance: AgentPulseAppearance | Exclude<ComponentAppearance, 'auto'>,
  emphasis: AgentPulseEmphasis,
): string {
  const suffix = emphasis === 'tintedA11y' ? 'TintedA11y' : 'Tinted';
  const roleMap: Record<string, string> = {
    primary: 'Primary',
    secondary: 'Secondary',
    sparkle: 'Sparkle',
    neutral: 'Neutral',
    positive: 'Positive',
    negative: 'Negative',
    warning: 'Warning',
    informative: 'Informative',
    'brand-bg': 'Brand-Bg',
  };
  const prefix = roleMap[appearance] ?? 'Secondary';
  return `var(--${prefix}-${suffix}, var(--Text-High))`;
}
