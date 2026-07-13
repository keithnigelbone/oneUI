/**
 * JDSButton (web) — maps to `@oneui/ui/components/Button` on dev.
 *
 * Reuses the platform-neutral fragments from @jds/kb-core/schemas. Web-only
 * surface area lives in this file: `type` (HTML form semantics), `href`
 * (renders as <a>), `target`, `rel`, `onClick`, `className`.
 */

import {
  BUTTON_REQUIRED_ONE_OF,
  BUTTON_SHARED_PROPS,
  FORBIDDEN_COLOR_LITERAL,
} from '@jds/kb-core/schemas';
import { defineComponent } from '../defineComponent';

export const JDSButton = defineComponent({
  schemaVersion: '5.0.0',
  name: 'Button',
  importPath: '@oneui/ui/components/Button',
  status: 'stable',
  description: 'Web Button — three variants × 11 appearances × t-shirt sizes. Renders as <button> or <a> when href is set.',

  propsSchema: {
    $id: 'jds.kb.web.Button',
    type: 'object',
    properties: {
      ...BUTTON_SHARED_PROPS,
      // Web-specific size enum (t-shirt aliases match the existing @oneui/ui contract).
      size: { enum: ['s', 'm', 'l', 6, 8, 10, 12], default: 'm' },
      type: { enum: ['button', 'submit', 'reset'], default: 'button' },
      href: { type: 'string', description: 'When set, the Button renders as <a>.' },
      target: { enum: ['_self', '_blank', '_parent', '_top'] },
      rel: { type: 'string' },
      onClick: { description: 'Click handler.' },
      className: { type: 'string' },
      leftIcon: { description: 'Icon ReactNode (or SemanticIconName string).' },
      rightIcon: { description: 'Icon ReactNode (or SemanticIconName string).' },
      backgroundColor: FORBIDDEN_COLOR_LITERAL,
      style: {
        description: 'Inline style allowed only for layout. Painting via style.background is rejected.',
        'x-jds-suggestion': 'Use the appearance + surface system instead of inline paint.',
        'x-jds-severity': 'warn',
      },
    },
    required: ['children'],
    oneOf: [...BUTTON_REQUIRED_ONE_OF],
  },

  tokens: {
    color: ['primary', 'secondary', 'tertiary', 'quaternary', 'neutral', 'sparkle', 'positive', 'negative', 'warning', 'informative'],
    surface: ['bold', 'subtle', 'ghost'],
    typography: ['label.XS', 'label.S', 'label.M', 'label.L'],
    spacing: ['6XS', '5XS', '4XS', '3XS', '2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL'],
    shape: ['pill', '3XS', '2XS', 'XS', 'S', 'M'],
    motion: ['motion.duration.discreet.short', 'motion.easing.transition'],
  },

  composition: { childKind: 'leaf' },

  a11y: {
    role: 'button',
    accessibleNameSource: 'children',
    states: ['aria-disabled', 'aria-busy'],
    keyboardActivation: ['Enter', 'Space'],
    contrastRequirement: 'AA',
  },

  figma: {
    componentKey: 'jds-button-v4',
    keyHistory: [],
    variantProperties: { Component: 'Button' },
  },

  renderHints: {
    baseElement: 'button',
    baseUiPrimitive: '@base-ui/react/button',
    hasCssModule: true,
    emitsDataSurface: false,
    classNameStrategy: 'css-modules',
    ssrSafe: true,
  },

  tags: ['cta', 'action', 'interactive'],
} as const);
