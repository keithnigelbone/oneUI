/**
 * JDSIcon — semantic icon primitive. Implementation lives in
 * `@oneui/ui-native/components/Icon/Icon.native.tsx` (barrel: `@oneui/ui-native`
 * exports `Icon` from `./components/Icon` — there is no separate
 * `icons/Icon.native.tsx`).
 *
 * The glyph prop is `icon` (NOT `name`), and it is required. It accepts a
 * semantic name, a pre-built ReactElement, or (RN-only) a JDS/custom SVG
 * component reference directly (e.g. `icon={IcStar}`):
 *   - <JDSIcon icon="check" />
 *   - <JDSIcon icon={<CustomSvg />} />
 *   - <JDSIcon icon={IcStar} />
 */

import { defineComponent } from '../defineComponent';

export const JDSIcon = defineComponent({
  schemaVersion: '5.0.0',
  name: 'Icon',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description:
    'Semantic icon. Resolves the `icon` glyph (semantic name, ReactElement, or JDS icon component reference) and inherits colour from the parent text/content token via `appearance` + `emphasis`. Never accept raw hex colours.',

  propsSchema: {
    $id: 'jds.kb.rn.Icon',
    type: 'object',
    required: ['icon'],
    properties: {
      icon: {
        description:
          'The glyph — a semantic icon name, a pre-built ReactElement, or (RN-only) a JDS/custom icon component reference (e.g. `icon={IcStar}`).',
      },
      // Spacing-index size tokens (DesignIconSize) preferred; a plain pixel
      // number is also accepted as an escape hatch for component-internal
      // layouts (Button slot, IconButton container, etc.). Default '5'.
      size: {
        description: 'A DesignIconSize token ("2".."40") OR a raw pixel number (escape hatch only).',
        default: '5',
      },
      appearance: {
        enum: ['primary', 'secondary', 'tertiary', 'quaternary', 'neutral', 'sparkle', 'positive', 'negative', 'warning', 'informative'],
        default: 'neutral',
      },
      emphasis: {
        enum: ['high', 'medium', 'low', 'tinted', 'tintedA11y'],
        default: 'high',
      },
      'aria-label': {
        type: 'string',
        description: 'Required when the icon conveys meaning standalone (no adjacent text).',
      },
      'aria-hidden': {
        type: 'boolean',
        description: 'Set when the icon is purely decorative alongside adjacent text.',
      },
    },
  },

  tokens: {
    color: ['primary', 'secondary', 'tertiary', 'quaternary', 'neutral', 'sparkle', 'positive', 'negative', 'warning', 'informative'],
    spacing: ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL'],
  },

  composition: { childKind: 'leaf' },

  a11y: {
    accessibilityRole: 'image',
    accessibleNameSource: 'aria-label',
    minTouchTarget: 44,
    honorsBoldText: false,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-icon-v4',
    keyHistory: [],
  },

  renderHints: {
    baseElement: 'View',
    animatedOn: [],
    honorsReduceMotion: false,
    readsFromSurfaceContext: true,
  },

  tags: ['icon', 'chassis'],
} as const);
