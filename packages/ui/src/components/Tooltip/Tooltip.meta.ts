/**
 * Tooltip.meta.ts
 *
 * Unified metadata for the Tooltip component.
 * Exposes the public TooltipProps surface (Figma position alias, Base UI
 * side/align, trigger, timing, portal, arrow).
 */

import type { ComponentMeta } from '@oneui/shared';
import { TOOLTIP_TOKEN_MANIFEST } from './Tooltip.tokens';
import { TOOLTIP_RECIPE_DEFINITION } from './Tooltip.recipe';

export const TOOLTIP_META: ComponentMeta = {
  name: 'Tooltip',
  slug: 'tooltip',
  displayName: 'Tooltip',
  description:
    'Floating hover / focus label that attaches to a trigger element. Supports the Figma position alias (top/topStart/topEnd/...), Base UI side+align, controlled/uncontrolled open state, arrow, portal, and configurable delay.',
  category: 'overlays',
  tags: ['tooltip', 'hint', 'popup', 'hover', 'overlay'],

  props: [
    {
      name: 'position',
      type: 'enum',
      description:
        'Figma position alias. Maps internally to side + align. If both `position` and `side` are provided, `side`/`align` take precedence.',
      defaultValue: 'bottom',
      options: [
        'top', 'topStart', 'topEnd',
        'bottom', 'bottomStart', 'bottomEnd',
        'left', 'leftStart', 'leftEnd',
        'right', 'rightStart', 'rightEnd',
      ] as const,
    },
    {
      name: 'side',
      type: 'enum',
      description: 'Which side of the trigger to position against.',
      options: ['top', 'bottom', 'left', 'right'] as const,
    },
    {
      name: 'align',
      type: 'enum',
      description: 'Alignment along the chosen side axis.',
      options: ['start', 'center', 'end'] as const,
    },
    {
      name: 'sideOffset',
      type: 'number',
      description: 'Distance from the trigger, in pixels.',
    },
    {
      name: 'open',
      type: 'boolean',
      description: 'Controlled open state.',
    },
    {
      name: 'defaultOpen',
      type: 'boolean',
      description: 'Uncontrolled initial open state.',
      defaultValue: false,
    },
    {
      name: 'trigger',
      type: 'enum',
      description: 'How the tooltip is triggered.',
      defaultValue: 'hover',
      options: ['hover', 'click', 'focus', 'manual'] as const,
    },
    {
      name: 'delay',
      type: 'number',
      description: 'Delay before showing, in ms.',
    },
    {
      name: 'closeDelay',
      type: 'number',
      description: 'Delay before hiding, in ms.',
    },
    {
      name: 'arrow',
      type: 'boolean',
      description: 'Whether to render the pointing arrow (Figma `tip`).',
      defaultValue: true,
    },
    {
      name: 'maxWidth',
      type: 'string',
      description: 'Maximum width of the tooltip bubble (CSS length or number).',
    },
    {
      name: 'hoverable',
      type: 'boolean',
      description: 'Allow hovering over the tooltip body without closing.',
      defaultValue: true,
    },
    {
      name: 'disabled',
      type: 'boolean',
      description: 'Prevent the tooltip from opening.',
      defaultValue: false,
    },
    {
      name: 'portal',
      type: 'boolean',
      description:
        'Reserved for API compatibility. Popup always uses Base UI default portal (document.body).',
      defaultValue: true,
    },
  ],

  slots: [
    {
      name: 'children',
      description: 'The trigger element the tooltip attaches to.',
      cardinality: 'single',
      required: true,
    },
    {
      name: 'content',
      description: 'Text or content displayed inside the tooltip bubble.',
      acceptedTypes: ['Text', 'Icon'],
      required: true,
    },
  ],

  previewMatrix: {
    variants: ['default'],
    variantLabels: { default: 'Default' },
  },

  surfaceAware: true,
  multiAccent: false,

  tokenManifest: TOOLTIP_TOKEN_MANIFEST,
  recipeDefinition: TOOLTIP_RECIPE_DEFINITION,
};
