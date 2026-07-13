/**
 * AgentPulse.meta.ts
 *
 * Unified metadata for the AgentPulse component.
 */

import type { ComponentMeta } from '@oneui/shared';
import { AGENT_PULSE_TOKEN_MANIFEST } from './AgentPulse.tokens';

export const AGENT_PULSE_META: ComponentMeta = {
  name: 'AgentPulse',
  slug: 'agent-pulse',
  displayName: 'Agent Pulse',
  description:
    'Animated brand-coloured indicator that visualises the four canonical agent states (idle, listening, thinking, speaking) using the OneUI logo geometry. Recolours per brand and adapts on coloured surfaces.',
  category: 'feedback',
  tags: ['ai', 'agent', 'thinking', 'listening', 'speaking', 'lottie', 'animated', 'status', 'voice'],

  props: [
    {
      name: 'state',
      type: 'enum',
      description: 'Agent state — drives which animation loop plays.',
      defaultValue: 'idle',
      options: ['idle', 'listening', 'thinking', 'speaking'] as const,
    },
    {
      name: 'appearance',
      type: 'enum',
      description: 'Multi-accent role — recolours the animation at runtime.',
      defaultValue: 'secondary',
      options: [
        'auto',
        'primary',
        'secondary',
        'neutral',
        'sparkle',
        'brand-bg',
        'positive',
        'negative',
        'warning',
        'informative',
      ] as const,
    },
    {
      name: 'emphasis',
      type: 'enum',
      description: 'Tinted colour emphasis (Agent pulse is always tinted).',
      defaultValue: 'tinted',
      options: ['tinted', 'tintedA11y'] as const,
    },
    {
      name: 'size',
      type: 'enum',
      description:
        'Figma dimension-token diameter (`--Spacing-*`). Legacy sm/md/lg/xl map to 5/7/9/12.',
      defaultValue: '7',
      options: [
        '2', '2.5', '3', '3.5', '4', '4.5', '5', '6', '7', '8', '9', '10',
        '12', '14', '16', '18', '20', '24', '32', '40',
      ] as const,
    },
    {
      name: 'autoTransition',
      type: 'boolean',
      description: 'Play a bridge animation between states when one exists.',
      defaultValue: true,
    },
    {
      name: 'paused',
      type: 'boolean',
      description: 'Pause animation playback.',
      defaultValue: false,
    },
    {
      name: 'speed',
      type: 'number',
      description: 'Playback rate (1 = normal, 2 = double, 0.5 = half).',
      defaultValue: 1,
    },
    {
      name: 'reducedMotionFallback',
      type: 'enum',
      description: 'Fallback when the user prefers reduced motion.',
      defaultValue: 'static',
      options: ['static', 'pulse', 'none'] as const,
    },
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label override (defaults to "Agent is <state>").',
    },
  ],

  slots: [],

  previewMatrix: {
    variants: ['idle', 'listening', 'thinking', 'speaking'],
    variantLabels: {
      idle: 'Idle',
      listening: 'Listening',
      thinking: 'Thinking',
      speaking: 'Speaking',
    },
    sizes: ['5', '7', '9', '12', '16', '24'],
    sizeLabels: {
      '5': '5 (sm)',
      '7': '7 (md)',
      '9': '9 (lg)',
      '12': '12 (xl)',
      '16': '16',
      '24': '24',
    },
  },

  surfaceAware: true,
  multiAccent: true,

  tokenManifest: AGENT_PULSE_TOKEN_MANIFEST,
};
