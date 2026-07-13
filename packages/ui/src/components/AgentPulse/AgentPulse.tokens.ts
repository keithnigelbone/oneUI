/**
 * AgentPulse.tokens.ts
 *
 * Token manifest for the AgentPulse component. The brand colour is resolved
 * at runtime from `--{Appearance}-Bold` (or `--AgentPulse-color` if a brand
 * wants to override the role for this component specifically). Sizes and
 * the reduced-motion pulse duration are exposed as overridable knobs.
 */

import type { ComponentTokenManifest, TokenDefinition } from '@oneui/shared';

export const AGENT_PULSE_TOKENS: Record<string, TokenDefinition> = {
  color: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Secondary-Tinted',
    description:
      'Brand colour applied to every fill / stroke in the animation. Resolved at runtime from the active appearance role and emphasis.',
    cssProperty: 'fill',
  },
  size: {
    category: 'spacing',
    subcategory: 'layout',
    defaultToken: 'Spacing-7',
    description:
      'Component diameter — Figma dimension token (2–40). Legacy sm/md/lg/xl map to Spacing-5/7/9/12.',
    cssProperty: 'width',
  },
  pulseDuration: {
    category: 'motion',
    subcategory: 'duration',
    defaultToken: 'Motion-Duration-3XL',
    description:
      'Duration of the reduced-motion opacity pulse fallback (when reducedMotionFallback="pulse").',
    cssProperty: 'animation-duration',
  },
};

export const AGENT_PULSE_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'AgentPulse',
  version: '1.0.0',
  description:
    'Animated brand-coloured indicator visualising agent state (idle, listening, thinking, speaking) with the OneUI logo geometry.',
  tokens: AGENT_PULSE_TOKENS,
  totalTokens: Object.keys(AGENT_PULSE_TOKENS).length,
  categories: {
    color: 1,
    spacing: 1,
    motion: 1,
  },
};
