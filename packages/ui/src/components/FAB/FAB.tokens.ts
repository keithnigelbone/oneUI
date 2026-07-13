/**
 * FAB.tokens.ts
 *
 * Token manifest for the Floating Action Button component.
 */

import type {
  ComponentTokenManifest,
  TokenDefinition,
} from '@oneui/shared';

export const FAB_TOKENS: Record<string, TokenDefinition> = {
  // ============================================
  // COLOR
  // ============================================

  backgroundColor: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Primary-Bold',
    variants: {
      primary: 'Primary-Bold',
      secondary: 'Secondary-Bold',
      surface: 'Surface-Elevated',
    },
    description: 'FAB background fill per variant.',
    cssProperty: 'background-color',
  },

  textColor: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Primary-Bold-High',
    variants: {
      primary: 'Primary-Bold-High',
      secondary: 'Secondary-Bold-High',
      surface: 'Text-High',
    },
    description: 'FAB label and icon colour per variant.',
    cssProperty: 'color',
  },

  // ============================================
  // SHAPE
  // ============================================

  borderRadius: {
    category: 'shape',
    defaultToken: 'Shape-4',
    variants: {
      circular: 'Shape-Pill',
      rounded: 'Shape-4',
    },
    description:
      'Corner radius. Circular when no label is present, rounded otherwise.',
    cssProperty: 'border-radius',
  },

  // ============================================
  // SPACING — per size
  // ============================================

  size: {
    category: 'spacing',
    subcategory: 'size',
    defaultToken: 'Spacing-9',
    variants: {
      small: 'Spacing-8',
      medium: 'Spacing-9',
      large: 'Spacing-9',
    },
    description: 'Minimum width/height per size.',
    cssProperty: 'min-height',
  },

  paddingHorizontal: {
    category: 'spacing',
    subcategory: 'padding',
    defaultToken: 'Spacing-4-5',
    variants: {
      small: 'Spacing-4',
      medium: 'Spacing-4-5',
      large: 'Spacing-5',
    },
    description: 'Horizontal padding when extended (label present).',
    cssProperty: 'padding-inline',
  },

  iconGap: {
    category: 'spacing',
    subcategory: 'gap',
    defaultToken: 'Spacing-3',
    description: 'Gap between icon and label when extended.',
    cssProperty: 'gap',
  },

  // ============================================
  // TYPOGRAPHY
  // ============================================

  fontWeight: {
    category: 'typography',
    subcategory: 'weight',
    defaultToken: 'Body-FontWeight-Medium',
    description: 'FAB label font weight.',
    cssProperty: 'font-weight',
  },

  // ============================================
  // ELEVATION
  // ============================================

  elevation: {
    category: 'elevation',
    defaultToken: 'Elevation-3',
    states: {
      hover: 'Elevation-4',
    },
    description: 'Shadow depth. Lifts on hover.',
    cssProperty: 'box-shadow',
  },

  // ============================================
  // MOTION
  // ============================================

  transitionDuration: {
    category: 'motion',
    subcategory: 'duration',
    defaultToken: 'Motion-Duration-Discreet-Short',
    description: 'Shorter duration used for hover/press colour transitions.',
    cssProperty: 'transition-duration',
  },

  expandDuration: {
    category: 'motion',
    subcategory: 'duration',
    defaultToken: 'Motion-Duration-Expressive-Long',
    description: 'Longer duration used when the extended label expands/collapses.',
    cssProperty: 'transition-duration',
  },

  // ============================================
  // ACCESSIBILITY
  // ============================================

  disabledOpacity: {
    category: 'accessibility',
    defaultToken: 'Disabled-Opacity',
    description: 'Opacity applied when disabled.',
    cssProperty: 'opacity',
  },

  focusOutlineColor: {
    category: 'accessibility',
    defaultToken: 'Focus-Outline',
    description: 'Focus ring colour.',
    cssProperty: 'outline-color',
  },

  focusOutlineWidth: {
    category: 'accessibility',
    defaultToken: 'Focus-Outline-Width',
    description: 'Focus ring width.',
    cssProperty: 'outline-width',
  },
};

export const FAB_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'FAB',
  version: '1.0.0',
  description:
    'Floating Action Button — elevated circular (or pill-extended) action button. Three sizes, three variants, optional label, optional on-screen fixed positioning.',
  tokens: FAB_TOKENS,
  totalTokens: Object.keys(FAB_TOKENS).length,
  categories: {
    color: 2,
    shape: 1,
    spacing: 3,
    typography: 1,
    elevation: 1,
    motion: 2,
    accessibility: 3,
  },
};
