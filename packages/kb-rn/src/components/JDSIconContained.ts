/**
 * JDSIconContained — RN knowledge entry for the IconContained.
 *
 * Mirrors the native prop contract at
 * `packages/ui-native/src/components/IconContained/interface.ts`
 * (semantic source `IconContained.shared.ts`).
 *
 * NON-INTERACTIVE-MEDIA CONTRACT (the reason this meta exists):
 * IconContained is a NON-interactive icon-in-a-tinted-box (role="image"), NOT
 * a button — use IconButton for a tappable affordance, or bare <Icon> for an
 * unboxed glyph. `attention="high"` paints a solid bold fill, `attention="medium"`
 * a subtle tinted fill, resolved against the parent <Surface>. The `icon` prop
 * takes a JDS <Icon> / glyph component (semantic name strings are not yet
 * resolved on native — pass the component). `appearance="auto"` → primary. Only
 * exposed to assistive tech when `aria-label` is set.
 */

import { defineComponent } from '../defineComponent';

export const JDSIconContained = defineComponent({
  schemaVersion: '5.0.0',
  name: 'IconContained',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description:
    'Non-interactive icon in a tinted container (role="image"). attention high = bold fill, medium = subtle tint, resolved against the parent <Surface>. Five sizes (xs…xl), 9 appearances. Pass a JDS <Icon> / glyph component for `icon`. Use IconButton for an interactive version.',

  propsSchema: {
    $id: 'jds.kb.rn.IconContained',
    type: 'object',
    properties: {
      icon: {
        description: 'JDS <Icon> / glyph component (or ReactElement). Semantic name strings are not resolved on native — pass the component.',
        'x-jds-suggestion': 'Pass a JDS <Icon> or glyph component; a bare <Svg> with its own fill ignores the surface-resolved colour.',
        'x-jds-severity': 'warn',
      },
      size: { enum: ['xs', 's', 'm', 'l', 'xl'], default: 'm' },
      attention: {
        enum: ['high', 'medium'],
        default: 'high',
        description: 'high = solid bold fill, medium = subtle tinted fill (resolved against the parent <Surface>).',
      },
      appearance: {
        enum: ['auto', 'primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
        default: 'auto',
        description: "Multi-accent role for the fill. 'auto' → primary.",
      },
      disabled: { type: 'boolean', default: false },
      'aria-label': { type: 'string', description: 'Recommended for non-decorative use; node is only exposed to assistive tech when set.' },
      'aria-hidden': { type: 'boolean', description: 'Collapses the node from assistive tech.' },
    },
    required: ['icon'],
  },

  tokens: {
    color: ['primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
    shape: ['pill'],
  },

  composition: { childKind: 'leaf' },

  a11y: {
    accessibilityRole: 'image',
    accessibilityState: ['disabled'],
    accessibleNameSource: 'aria-label',
    minTouchTarget: 44,
    honorsBoldText: false,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-icon-contained-v4',
    keyHistory: [],
    variantProperties: { Component: 'IconContained' },
  },

  renderHints: {
    baseElement: 'View',
    animatedOn: [],
    honorsReduceMotion: false,
    readsFromSurfaceContext: true,
  },

  tags: ['display', 'icon', 'media', 'surface-aware'],
} as const);
