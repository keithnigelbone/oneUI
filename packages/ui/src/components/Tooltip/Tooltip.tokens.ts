/**
 * Tooltip.tokens.ts
 *
 * Token manifest for the Tooltip component.
 * Tooltip renders on a bold surface by default, so it uses --Surface-Bold and
 * Text-OnBold-* for its internal content tokens. Descendants inherit via the
 * [data-surface="bold"] cascade when the Tooltip is wrapped in a Surface.
 */

import type {
  ComponentTokenManifest,
  TokenDefinition,
} from '@oneui/shared';

export const TOOLTIP_TOKENS: Record<string, TokenDefinition> = {
  // ============================================
  // COLOR
  // ============================================

  backgroundColor: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Surface-Bold',
    description:
      'Background fill of the tooltip bubble. Defaults to the page-level bold surface so the tooltip reads as a floating chip over any surface context.',
    cssProperty: 'background-color',
  },

  textColor: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Text-OnBold-High',
    description:
      'Foreground text colour inside the tooltip. Paired with Surface-Bold via the on-bold content family.',
    cssProperty: 'color',
  },

  // ============================================
  // SHAPE
  // ============================================

  borderRadius: {
    category: 'shape',
    defaultToken: 'Shape-1-5',
    description: 'Corner radius of the tooltip bubble.',
    cssProperty: 'border-radius',
  },

  // ============================================
  // SPACING
  // ============================================

  paddingVertical: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-1-5',
    description: 'Vertical padding inside the tooltip bubble.',
    cssProperty: 'padding-block',
  },

  paddingHorizontal: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-3',
    description: 'Horizontal padding inside the tooltip bubble.',
    cssProperty: 'padding-inline',
  },

  maxWidth: {
    category: 'spacing',
    defaultToken: '20rem',
    description: 'Default max-width cap for wrapping tooltip copy. Overridable via the `maxWidth` prop.',
    cssProperty: 'max-width',
  },

  // ============================================
  // TYPOGRAPHY
  // ============================================

  fontSize: {
    category: 'typography',
    subcategory: 'size',
    defaultToken: 'Body-S-FontSize',
    description: 'Tooltip copy font size (Body role, Small).',
    cssProperty: 'font-size',
  },

  lineHeight: {
    category: 'typography',
    subcategory: 'lineHeight',
    defaultToken: 'Body-S-LineHeight',
    description: 'Tooltip copy line height (Body role, Small).',
    cssProperty: 'line-height',
  },

  fontWeight: {
    category: 'typography',
    subcategory: 'weight',
    defaultToken: 'Body-FontWeight-Medium',
    description: 'Tooltip copy font weight (Body role, Medium emphasis).',
    cssProperty: 'font-weight',
  },

  // ============================================
  // MOTION
  // ============================================

  transitionDuration: {
    category: 'motion',
    subcategory: 'duration',
    defaultToken: 'Motion-Duration-Discreet-Short',
    description: 'Fade/scale duration when the tooltip opens or closes.',
    cssProperty: 'transition-duration',
  },

  transitionEasing: {
    category: 'motion',
    subcategory: 'easing',
    defaultToken: 'Motion-Easing-Standard',
    description: 'Easing curve for the open/close animation.',
    cssProperty: 'transition-timing-function',
  },

  // ============================================
  // ELEVATION
  // ============================================

  elevation: {
    category: 'elevation',
    defaultToken: 'Elevation-2',
    description: 'Drop shadow for the floating tooltip bubble.',
    cssProperty: 'box-shadow',
  },
};

export const TOOLTIP_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'Tooltip',
  version: '1.0.0',
  description:
    'Floating hover/focus tooltip. Renders in a portal on a bold surface by default; content adapts via Surface context when wrapped in a <Surface>.',
  tokens: TOOLTIP_TOKENS,
  totalTokens: Object.keys(TOOLTIP_TOKENS).length,
  categories: {
    color: 2,
    shape: 1,
    spacing: 3,
    typography: 3,
    motion: 2,
    elevation: 1,
  },
};
