/**
 * JDSAvatar — RN knowledge entry for the Avatar.
 *
 * Mirrors the shared prop contract at
 * `packages/ui/src/components/Avatar/Avatar.shared.ts` (imported verbatim by
 * `@oneui/ui-native`'s `Avatar.native.tsx`).
 *
 * ICON-SLOT CONTRACT (the reason this meta exists):
 * The `icon` / `fallback` slot is wrapped in `ComponentSlotIconContext` —
 * the RN peer of web `currentColor`. The slot provides `{ sizePx, color }`;
 * a JDS `<Icon>` reads it (Icon.native.tsx → `resolveIconPixelSize(size, slot.sizePx)`,
 * `color ?? slot.color`) and paints with the resolved content token. A raw
 * `<Svg>` with a hardcoded `fill` (or no fill) IGNORES the slot and renders
 * blank / mis-sized. Codegen MUST emit a JDS `<Icon>` here, not a bare SVG.
 */

import { FORBIDDEN_COLOR_LITERAL } from '@jds/kb-core/schemas';
import { defineComponent } from '../defineComponent';

export const JDSAvatar = defineComponent({
  schemaVersion: '5.0.0',
  name: 'Avatar',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description:
    'User representation — image, icon, or initials. Attention drives the fill (high → bold surface, medium → subtle tint, low → transparent), with t-shirt sizing and multi-accent appearance. The icon/fallback slot supplies colour + size via ComponentSlotIconContext — pass a JDS <Icon>, never a raw SVG with its own fill.',

  propsSchema: {
    $id: 'jds.kb.rn.Avatar',
    type: 'object',
    properties: {
      content: {
        enum: ['image', 'icon', 'text'],
        default: 'image',
        description: 'image (src) → icon/text fallback on load error; icon → icon slot; text → initials from `alt`.',
      },
      size: {
        enum: ['2xs', 'xs', 's', 'm', 'l', 'xl', '2xl', 'custom'],
        default: 'm',
      },
      attention: {
        enum: ['high', 'medium', 'low'],
        default: 'high',
        description: 'high = bold-surface fill, medium = subtle tint, low = transparent. Maps to the surface-resolved paint.',
      },
      appearance: {
        enum: ['auto', 'primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
        default: 'auto',
        description: "Multi-accent role resolved against the parent <Surface>. Explicit prop wins; 'auto' inherits the nearest <Surface appearance>; root fallback is primary.",
      },
      src: { type: 'string', description: 'Image URL (content="image"). Falls back to icon/text on load error.' },
      alt: { type: 'string', description: 'Accessible name + source for the initials in text variant.' },
      icon: {
        description:
          'ReactNode for the icon variant. MUST be a JDS <Icon> (or any component that reads ComponentSlotIconContext) so it inherits the slot colour + size. A raw <Svg> with a hardcoded fill ignores the slot and renders blank.',
        'x-jds-suggestion':
          'Use <Icon name="…" /> from @oneui/ui-native/icons. The Avatar icon slot provides { sizePx, color } via ComponentSlotIconContext; a bare SVG with its own fill/size will not pick up brand paint and appears invisible.',
        'x-jds-severity': 'warn',
      },
      fallback: {
        description:
          'Custom node shown when the image fails or for icon/text variants. Same slot-context contract as `icon` — prefer a JDS <Icon> or string initials.',
      },
      customSize: { type: 'number', description: 'Pixel size — only honoured when size="custom".' },
      disabled: { type: 'boolean', default: false },
      backgroundColor: FORBIDDEN_COLOR_LITERAL,
      style: {
        description: 'Layout style only. backgroundColor / borderColor are forbidden — attention + appearance drive the fill.',
        'x-jds-suggestion': "Don't paint the Avatar via style. Use `attention` + `appearance`; the surface cascade resolves the fill.",
        'x-jds-severity': 'warn',
      },
    },
  },

  tokens: {
    color: ['primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
    surface: ['bold', 'subtle'],
    typography: ['label.3XS', 'label.2XS', 'label.XS', 'label.S', 'label.M', 'label.L'],
    shape: ['pill'],
  },

  composition: {
    childKind: 'fixed-slots',
    slots: {
      icon: {
        accepts: ['Icon'],
        cardinality: 'optional',
        description: 'Icon-variant content. Must read ComponentSlotIconContext — emit a JDS <Icon>, not a raw SVG.',
      },
      fallback: {
        accepts: ['Icon', 'Text', '#string', '#node'],
        cardinality: 'optional',
        description: 'Image-failure / icon / text fallback content.',
      },
    },
  },

  a11y: {
    accessibilityRole: 'image',
    accessibleNameSource: 'aria-label', // `alt` → accessibilityLabel (defaults to 'avatar')
    minTouchTarget: 44,
    honorsBoldText: true,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-avatar-v4',
    keyHistory: [],
    variantProperties: { Component: 'Avatar' },
  },

  renderHints: {
    baseElement: 'View',
    animatedOn: [],
    honorsReduceMotion: false,
    readsFromSurfaceContext: true,
  },

  tags: ['display', 'avatar', 'media', 'inherits-appearance'],
} as const);
