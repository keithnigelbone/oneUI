/**
 * JDSImage — RN knowledge entry for the Image.
 *
 * Mirrors the native prop contract at
 * `packages/ui-native/src/components/Image/interface.ts`
 * (portable subset of `Image.shared.ts`).
 *
 * REQUIRED-ALT + FIT-PRECEDENCE + INTERACTIVE CONTRACT (the reason this meta exists):
 *   - `src` AND `alt` are REQUIRED; `alt` is the accessible name.
 *   - `fit` (Figma alias) wins over `objectFit`; both map to RNImage.resizeMode
 *     ('cover' | 'contain' | 'fill' | 'none'). Web-only CSS keywords coerce to
 *     'cover'.
 *   - `interactive` adds a state-layer overlay (resolved from
 *     `role.surfaces.minimal` against the parent <Surface>) and makes the
 *     wrapper tappable; an actionable image flips role from `image` → `button`.
 * Web-only props (srcSet/sizes/crossOrigin/decoding/draggable) are not surfaced.
 */

import { defineComponent } from '../defineComponent';

export const JDSImage = defineComponent({
  schemaVersion: '5.0.0',
  name: 'Image',
  importPath: '@oneui/ui-native',
  status: 'stable',
  description:
    'Responsive image with aspect-ratio presets, fit modes, and an optional interactive (tappable, state-layer) mode. `src` + `alt` required; alt is the accessible name. `fit` wins over `objectFit`. Falls back to `fallback` node or `fallbackSrc` on error.',

  propsSchema: {
    $id: 'jds.kb.rn.Image',
    type: 'object',
    properties: {
      src: { type: 'string', description: 'Image source URL (required).' },
      alt: { type: 'string', description: 'Accessible alt text (required) — used as accessibilityLabel.' },
      aspectRatio: {
        enum: ['auto', '1:1', '1:2', '2:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '9:21', '21:9'],
        default: 'auto',
      },
      interactive: { type: 'boolean', default: false, description: 'State-layer overlay + tappable wrapper; actionable → role="button".' },
      disabled: { type: 'boolean', default: false },
      fit: { enum: ['cover', 'contain', 'fill', 'none'], description: 'Figma alias for objectFit — wins when both are set.' },
      objectFit: { enum: ['cover', 'contain', 'fill', 'none'], default: 'cover' },
      objectPosition: { type: 'string', description: 'Accepted for web parity; currently a no-op on native.' },
      loading: { enum: ['auto', 'lazy', 'eager'], description: 'No-op on native (RN images are eager).' },
      width: { description: 'Container width — number (px) or string (%/dim).' },
      height: { description: 'Container height — number (px) or string (%/dim).' },
      onPress: { description: 'Press handler (interactive only).' },
      onLoad: { description: 'Image-loaded callback.' },
      onError: { description: 'Image-error callback.' },
      fallback: { description: 'Custom error fallback node (wins over fallbackSrc).' },
      fallbackSrc: { type: 'string', description: 'Fallback image URL when src fails and no `fallback` is set.' },
      'aria-label': { type: 'string', description: 'Overrides the accessible name (defaults to `alt`).' },
    },
    required: ['src', 'alt'],
  },

  tokens: {
    color: ['neutral'],
    surface: ['minimal'],
  },

  composition: { childKind: 'leaf' },

  a11y: {
    accessibilityRole: 'image', // → 'button' when actionable (interactive + handler)
    accessibilityState: ['disabled'],
    accessibleNameSource: 'aria-label', // aria-label ?? alt
    minTouchTarget: 44,
    honorsBoldText: false,
    honorsScreenReader: true,
  },

  figma: {
    componentKey: 'jds-image-v4',
    keyHistory: [],
    variantProperties: { Component: 'Image' },
  },

  renderHints: {
    baseElement: 'Image', // wrapped in Pressable when interactive
    animatedOn: [],
    honorsReduceMotion: false,
    readsFromSurfaceContext: true,
  },

  tags: ['display', 'media', 'image', 'surface-aware'],
} as const);
