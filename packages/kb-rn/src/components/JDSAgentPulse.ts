/**
 * JDSAgentPulse — animated AI-agent presence indicator. A looping Lottie orb
 * that reflects the agent's conversational state (idle / listening / thinking /
 * speaking) and recolours to the active multi-accent appearance.
 *
 * Mirrors the native prop contract at
 * `packages/ui-native/src/components/AgentPulse/interface.ts`.
 */

import { FORBIDDEN_COLOR_LITERAL } from '@jds/kb-core/schemas';
import { defineComponent } from '../defineComponent';

export const JDSAgentPulse = defineComponent({
  schemaVersion: '5.0.0',
  name: 'AgentPulse',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description:
    'Animated AI-agent presence indicator. Plays a looping animation per state (idle / listening / thinking / speaking) and auto-runs a bridge animation between states. Recolours to the active appearance role. Honours reduce-motion via a configurable fallback. Announces state changes through a live region.',

  propsSchema: {
    $id: 'jds.kb.rn.AgentPulse',
    type: 'object',
    properties: {
      state: {
        enum: ['idle', 'listening', 'thinking', 'speaking'],
        default: 'idle',
        description: 'Visual state; plays the matching loop and bridges between states.',
      },
      appearance: {
        enum: [
          'primary', 'secondary', 'tertiary', 'quaternary', 'neutral',
          'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative', 'auto',
        ],
        default: 'auto',
        description: 'Multi-accent role; recolours the animation at runtime (auto → primary).',
      },
      size: {
        description: 'Size preset (sm / md / lg / xl, mapped to dimension f-steps) or a pixel number.',
      },
      autoTransition: {
        type: 'boolean',
        description: 'Skip the bridge animation between states when false.',
      },
      paused: { type: 'boolean', default: false, description: 'Pause animation playback.' },
      speed: { type: 'number', default: 1, description: 'Playback rate (1 = normal, 2 = double, 0.5 = half).' },
      reducedMotionFallback: {
        enum: ['static', 'pulse', 'none'],
        description: 'Behaviour when the user prefers reduced motion.',
      },
      label: { type: 'string', description: 'Overrides the auto-derived a11y label (e.g. "Agent is thinking").' },
      'aria-live': {
        enum: ['off', 'polite', 'assertive'],
        description: 'Live-region politeness for screen readers.',
      },
      backgroundColor: FORBIDDEN_COLOR_LITERAL,
      style: {
        description: 'Layout style only. Colour is driven by appearance, not inline paint.',
        'x-jds-suggestion': "Don't paint directly. Use `appearance`; the animation recolours from the role tokens.",
        'x-jds-severity': 'warn',
      },
    },
  },

  tokens: {
    color: [
      'primary', 'secondary', 'tertiary', 'quaternary', 'neutral',
      'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative',
    ],
    motion: ['motion.duration.expressive.long', 'motion.easing.transition'],
  },

  composition: {
    childKind: 'leaf',
  },

  a11y: {
    accessibilityRole: 'image',
    accessibleNameSource: 'aria-label', // derived from `label` (falls back to a per-state default)
    minTouchTarget: 44,
    honorsBoldText: false,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-agent-pulse-v4',
    keyHistory: [],
    variantProperties: { Component: 'AgentPulse' },
  },

  renderHints: {
    baseElement: 'View',
    animatedOn: ['mount'],
    honorsReduceMotion: true,
    readsFromSurfaceContext: true,
  },

  tags: ['ai', 'agent', 'animation', 'presence', 'status'],
} as const);
