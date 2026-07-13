/**
 * JDSLogo — RN knowledge entry for the Logo.
 *
 * Mirrors the native prop contract at
 * `packages/ui-native/src/components/Logo/interface.ts`.
 *
 * CONTENT-MODE + DECORATIVE-ALT CONTRACT (the reason this meta exists):
 * Logo resolves a content mode from props: `children` → svg-node, `svgContent`
 * → raw SVG string, `src` → image, else empty. `alt` is REQUIRED: a meaningful
 * value exposes an `image` (or `button`, when `interactive`) role; an empty /
 * whitespace `alt` marks the logo DECORATIVE and hides it from assistive tech.
 * `interactive` needs both a handler (`onPress`/`onClick`) AND a meaningful
 * `alt`, else it renders static. The brand mark fills from `role.surfaces.bold`
 * against the parent <Surface>.
 */

import { defineComponent } from '../defineComponent';

export const JDSLogo = defineComponent({
  schemaVersion: '5.0.0',
  name: 'Logo',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description:
    'Brand mark / full logo. Content from children (svg node) / svgContent (string) / src (image). `alt` required — meaningful = image|button role, empty = decorative (hidden). Optional interactive (tappable) mode. Five sizes + custom.',

  propsSchema: {
    $id: 'jds.kb.rn.Logo',
    type: 'object',
    properties: {
      variant: { enum: ['mark', 'full'], default: 'mark' },
      size: { enum: ['xs', 's', 'm', 'l', 'xl', 'custom'], default: 'm', description: 'Figma XS–XL aliases accepted; canonicalised to lowercase.' },
      customSize: { type: 'number', description: 'Pixel box size — required when size="custom".' },
      alt: {
        type: 'string',
        description: 'REQUIRED. Meaningful text → image/button role; empty/whitespace → decorative (hidden from assistive tech).',
      },
      src: { type: 'string', description: 'Image URL (image content mode).' },
      svgContent: { type: 'string', description: 'Raw SVG markup string (svg content mode).' },
      children: { description: 'SVG node content mode (wins over svgContent / src).' },
      fallback: { description: 'Shown when the image/svg fails to load.' },
      interactive: { type: 'boolean', default: false, description: 'Tappable — requires a handler AND a meaningful alt, else renders static.' },
      disabled: { type: 'boolean', default: false },
      onPress: { description: 'Press handler when interactive.' },
    },
    required: ['alt'],
  },

  tokens: {
    color: ['brand-bg', 'neutral'],
    surface: ['bold'],
  },

  composition: { childKind: 'leaf' },

  a11y: {
    accessibilityRole: 'image', // → 'button' when interactive + meaningful alt
    accessibilityState: ['disabled'],
    accessibleNameSource: 'aria-label', // `alt`
    minTouchTarget: 44,
    honorsBoldText: false,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-logo-v4',
    keyHistory: [],
    variantProperties: { Component: 'Logo' },
  },

  renderHints: {
    baseElement: 'View', // Pressable when interactive
    animatedOn: [],
    honorsReduceMotion: false,
    readsFromSurfaceContext: true,
  },

  tags: ['display', 'brand', 'media', 'surface-aware'],
} as const);
