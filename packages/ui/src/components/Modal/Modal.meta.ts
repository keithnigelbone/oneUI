/**
 * Modal.meta.ts
 *
 * Unified metadata for the Modal component.
 * Wires together token manifest, recipe definition, and component props.
 */

import type { ComponentMeta } from '@oneui/shared';
import { MODAL_TOKEN_MANIFEST } from './Modal.tokens';
import { MODAL_RECIPE_DEFINITION } from './Modal.recipe';

export const MODAL_META: ComponentMeta = {
  name: 'Modal',
  slug: 'modal',
  displayName: 'Modal',
  description:
    'Focused overlay with structured header/body/footer layout and scroll management. The modal popup is role-neutral; per-role styling is applied to the slot children (footer buttons, headerStart, body content).',
  category: 'overlays',
  tags: ['overlay', 'dialog', 'modal', 'popup', 'sheet', 'confirmation'],

  props: [],

  // Slot names match the actual React prop names exactly so `pnpm check:metadata`
  // can verify the mapping (RFC 0001 Phase D enforcement).
  // `acceptedTypes` is informational metadata for the editor, AI context, and
  // generated docs — it is NOT runtime-enforced. Consumers can place any
  // ReactNode in a slot; the listed types are guidance for what's idiomatic.
  slots: [
    {
      name: 'headerStart',
      description: 'Content rendered before the title in the header (icon or badge)',
      acceptedTypes: ['Icon', 'Badge'],
    },
    {
      name: 'children',
      description:
        'Main content area (the React children prop) — scrollable when it exceeds the size-specific max-height (S=50vh, M=70vh, L=85vh, FullWidth=100vh−margin; mobile collapses S/M/L to 85vh)',
      acceptedTypes: ['any'],
    },
    {
      name: 'footerStart',
      description: 'Content rendered at the start of the footer (e.g., a link or checkbox)',
      acceptedTypes: ['any'],
    },
    {
      name: 'footerEnd',
      description: 'Action buttons in the footer (typically Cancel + Primary action)',
      acceptedTypes: ['Button'],
    },
  ],

  previewMatrix: {
    variants: ['S', 'M', 'L', 'FullWidth'],
    variantLabels: {
      S: 'Small',
      M: 'Medium',
      L: 'Large',
      FullWidth: 'Full Width',
    },
  },

  surfaceAware: false,
  multiAccent: false,

  tokenManifest: MODAL_TOKEN_MANIFEST,
  recipeDefinition: MODAL_RECIPE_DEFINITION,
};
