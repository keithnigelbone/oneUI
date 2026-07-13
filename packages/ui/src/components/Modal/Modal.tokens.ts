/**
 * Modal.tokens.ts
 *
 * Token manifest for the Modal component.
 * Defines all design tokens used and their customization options.
 *
 * Used by the Component Token Editor to:
 * - Display available tokens for customization
 * - Show which tokens are locked (cannot be changed)
 * - Generate CSS overrides for brand customization
 */

import type { ComponentTokenManifest, TokenDefinition } from '@oneui/shared';

export const MODAL_TOKENS: Record<string, TokenDefinition> = {
  // ============================================
  // COLOR TOKENS
  // ============================================

  backgroundColor: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Surface-Elevated',
    description: 'Modal background surface color',
    cssProperty: 'background-color',
  },

  titleColor: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Text-High',
    description: 'Title text color',
    cssProperty: 'color',
  },

  descriptionColor: {
    category: 'color',
    subcategory: 'text',
    defaultToken: 'Text-Medium',
    description: 'Description text color',
    cssProperty: 'color',
  },

  scrimColor: {
    category: 'color',
    subcategory: 'surface',
    defaultToken: 'Scrim',
    description: 'Backdrop overlay color',
    cssProperty: 'background-color',
    locked: true,
    lockReason: 'Scrim is a global system token controlled by foundations',
  },

  // ============================================
  // SHAPE TOKENS
  // ============================================

  borderRadius: {
    category: 'shape',
    defaultToken: 'Shape-4',
    availableTokens: [
      { token: 'Shape-0', label: 'None' },
      { token: 'Shape-3', label: 'Extra Small' },
      { token: 'Shape-3-5', label: 'Small' },
      { token: 'Shape-4', label: 'Medium' },
      { token: 'Shape-4-5', label: 'Large' },
      { token: 'Shape-5', label: 'Extra Large' },
    ],
    description: 'Modal container corner radius (matches Figma .Modal: Shape-4 / 16px)',
    cssProperty: 'border-radius',
  },

  // ============================================
  // SPACING TOKENS
  // ============================================

  padding: {
    category: 'spacing',
    defaultToken: 'Spacing-4',
    availableTokens: [
      { token: 'Spacing-3-5', label: 'Small' },
      { token: 'Spacing-4', label: 'Medium' },
      { token: 'Spacing-4-5', label: 'Large' },
      { token: 'Spacing-5', label: 'Extra Large' },
    ],
    description: 'Internal padding of header / footer (Figma: Spacing-4 / 16px)',
    cssProperty: 'padding',
  },

  bodyPaddingY: {
    category: 'spacing',
    defaultToken: 'Spacing-3-5',
    description: 'Vertical padding inside the body (Figma: Spacing-3-5 / 12px)',
    cssProperty: 'padding-block',
  },

  headerGap: {
    category: 'spacing',
    defaultToken: 'Spacing-3',
    description: 'Gap between header content and close button (Figma: 8px / Spacing-3)',
    cssProperty: 'gap',
  },

  footerGap: {
    category: 'spacing',
    defaultToken: 'Spacing-3',
    description: 'Gap between footer action buttons (Figma: 8px / Spacing-3)',
    cssProperty: 'gap',
  },

  // ============================================
  // ELEVATION TOKENS
  // ============================================

  elevation: {
    category: 'elevation',
    defaultToken: 'Elevation-4',
    availableTokens: [
      { token: 'Elevation-2', label: 'Level 2' },
      { token: 'Elevation-3', label: 'Level 3' },
      { token: 'Elevation-4', label: 'Level 4' },
      { token: 'Elevation-5', label: 'Level 5' },
    ],
    description: 'Shadow elevation level',
    cssProperty: 'box-shadow',
  },

  // ============================================
  // TYPOGRAPHY TOKENS (locked — controlled by foundations)
  // ============================================

  titleFontSize: {
    category: 'typography',
    defaultToken: 'Title-M-FontSize',
    description: 'Title font size (Figma: Title-M, 16/18/800)',
    cssProperty: 'font-size',
    locked: true,
    lockReason: 'Typography is controlled by the global type scale',
  },

  descriptionFontSize: {
    category: 'typography',
    defaultToken: 'Body-S-FontSize',
    description: 'Description font size',
    cssProperty: 'font-size',
    locked: true,
    lockReason: 'Typography is controlled by the global type scale',
  },
};

export const MODAL_TOKEN_MANIFEST: ComponentTokenManifest = {
  componentName: 'Modal',
  version: '4.0.0',
  description:
    'Focused overlay with structured header/body/footer layout and scroll management. Non-interactive shape (Shape-4).',
  tokens: MODAL_TOKENS,
  totalTokens: Object.keys(MODAL_TOKENS).length,
  categories: {
    color: 4,
    shape: 1,
    spacing: 4,
    elevation: 1,
    typography: 2,
  },
};

/** Helper — filter tokens by category */
export function getModalTokensByCategory(category: string): Record<string, TokenDefinition> {
  return Object.fromEntries(
    Object.entries(MODAL_TOKENS).filter(([, def]) => def.category === category)
  );
}

/** Helper — get a token's default value */
export function getModalTokenDefault(tokenName: string): string | undefined {
  return MODAL_TOKENS[tokenName]?.defaultToken;
}

/** Helper — check if a token is locked */
export function isModalTokenLocked(tokenName: string): boolean {
  return MODAL_TOKENS[tokenName]?.locked === true;
}

/** Helper — get lock reason */
export function getModalTokenLockReason(tokenName: string): string | undefined {
  return MODAL_TOKENS[tokenName]?.lockReason;
}
