/**
 * ContentBlock.meta.ts
 *
 * Canvas / PropPanel metadata for the Jio-style marketing content block.
 */

import type { ComponentMeta } from '@oneui/shared';
import { CONTENT_BLOCK_TOKEN_MANIFEST } from './ContentBlock.tokens';
import {
  CONTENT_BLOCK_BODY_TOKEN_OPTIONS,
  CONTENT_BLOCK_CONTEXT_TOKEN_OPTIONS,
  CONTENT_BLOCK_DENSITY_OPTIONS,
  CONTENT_BLOCK_F_STEP_OPTIONS,
  CONTENT_BLOCK_HEADLINE_TOKEN_OPTIONS,
  CONTENT_BLOCK_PLATFORM_OPTIONS,
  DEFAULT_CONTENT_BLOCK_PROPS,
} from './ContentBlock.shared';

const GAP_PADDING_OPTIONS = ['auto', ...CONTENT_BLOCK_F_STEP_OPTIONS] as const;

const HEADLINE_TOKEN_OPTIONS = ['auto', ...CONTENT_BLOCK_HEADLINE_TOKEN_OPTIONS] as const;

export const CONTENT_BLOCK_META: ComponentMeta = {
  name: 'ContentBlock',
  slug: 'content-block',
  displayName: 'Content Block',
  description:
    'Jio-style marketing stack: context label, headline, body, and OneUI Button CTAs. Responsive to frame size via dimension and typography tokens.',
  category: 'display',

  props: [
    {
      name: 'position',
      type: 'enum',
      description: 'Vertical placement within the canvas',
      defaultValue: DEFAULT_CONTENT_BLOCK_PROPS.position,
      options: ['top', 'middle', 'bottom'] as const,
    },
    {
      name: 'alignment',
      type: 'enum',
      description: 'Horizontal alignment of the block',
      defaultValue: DEFAULT_CONTENT_BLOCK_PROPS.alignment,
      options: ['left', 'center'] as const,
    },
    {
      name: 'maxWidth',
      type: 'number',
      description: 'Max content width as percent of canvas width',
      defaultValue: DEFAULT_CONTENT_BLOCK_PROPS.maxWidth,
    },
    {
      name: 'canvasWidth',
      type: 'number',
      description: 'Canvas width in pixels (synced with frame)',
      defaultValue: DEFAULT_CONTENT_BLOCK_PROPS.canvasWidth,
    },
    {
      name: 'canvasHeight',
      type: 'number',
      description: 'Canvas height in pixels (synced with frame)',
      defaultValue: DEFAULT_CONTENT_BLOCK_PROPS.canvasHeight,
    },
    {
      name: 'paddingTop',
      type: 'enum',
      description: 'Top padding f-step, or auto from canvas size category',
      defaultValue: 'auto',
      options: GAP_PADDING_OPTIONS,
    },
    {
      name: 'paddingRight',
      type: 'enum',
      description: 'Right padding f-step, or auto',
      defaultValue: 'auto',
      options: GAP_PADDING_OPTIONS,
    },
    {
      name: 'paddingBottom',
      type: 'enum',
      description: 'Bottom padding f-step, or auto',
      defaultValue: 'auto',
      options: GAP_PADDING_OPTIONS,
    },
    {
      name: 'paddingLeft',
      type: 'enum',
      description: 'Left padding f-step, or auto',
      defaultValue: 'auto',
      options: GAP_PADDING_OPTIONS,
    },
    {
      name: 'contextText',
      type: 'string',
      description: 'Small context / label line',
      defaultValue: DEFAULT_CONTENT_BLOCK_PROPS.contextText,
    },
    {
      name: 'headlineText',
      type: 'string',
      description: 'Main headline',
      defaultValue: DEFAULT_CONTENT_BLOCK_PROPS.headlineText,
    },
    {
      name: 'bodyText',
      type: 'string',
      description: 'Supporting body copy',
      defaultValue: DEFAULT_CONTENT_BLOCK_PROPS.bodyText,
    },
    {
      name: 'primaryCtaText',
      type: 'string',
      description: 'Primary button label',
      defaultValue: DEFAULT_CONTENT_BLOCK_PROPS.primaryCtaText,
    },
    {
      name: 'secondaryCtaText',
      type: 'string',
      description: 'Secondary button label',
      defaultValue: DEFAULT_CONTENT_BLOCK_PROPS.secondaryCtaText,
    },
    {
      name: 'showContext',
      type: 'boolean',
      description: 'Show context label',
      defaultValue: DEFAULT_CONTENT_BLOCK_PROPS.showContext,
    },
    {
      name: 'showBody',
      type: 'boolean',
      description: 'Show body text',
      defaultValue: DEFAULT_CONTENT_BLOCK_PROPS.showBody,
    },
    {
      name: 'showButtons',
      type: 'boolean',
      description: 'Show CTA buttons',
      defaultValue: DEFAULT_CONTENT_BLOCK_PROPS.showButtons,
    },
    {
      name: 'showSecondaryButton',
      type: 'boolean',
      description: 'Show secondary CTA',
      defaultValue: DEFAULT_CONTENT_BLOCK_PROPS.showSecondaryButton,
    },
    {
      name: 'headlineToken',
      type: 'enum',
      description:
        'Headline typography token (Display/Headline S/M/L). Auto picks from canvas size category; platform/density on the block resolve f-scale.',
      defaultValue: DEFAULT_CONTENT_BLOCK_PROPS.headlineToken,
      options: HEADLINE_TOKEN_OPTIONS,
    },
    {
      name: 'contextToken',
      type: 'enum',
      description:
        'Context line typography token (Label-XS/S/M/L). Auto defaults to Label-M.',
      defaultValue: DEFAULT_CONTENT_BLOCK_PROPS.contextToken,
      options: ['auto', ...CONTENT_BLOCK_CONTEXT_TOKEN_OPTIONS] as const,
    },
    {
      name: 'bodyToken',
      type: 'enum',
      description:
        'Body text typography token (Body-XS/S/M/L/XL). Auto defaults to Body-M.',
      defaultValue: DEFAULT_CONTENT_BLOCK_PROPS.bodyToken,
      options: ['auto', ...CONTENT_BLOCK_BODY_TOKEN_OPTIONS] as const,
    },
    {
      name: 'platform',
      type: 'enum',
      description:
        'Target breakpoint for dimension scale inside this block (data-Breakpoint). Auto derives from artboard width.',
      defaultValue: DEFAULT_CONTENT_BLOCK_PROPS.platform,
      options: CONTENT_BLOCK_PLATFORM_OPTIONS,
    },
    {
      name: 'density',
      type: 'enum',
      description: 'Density for dimension scale (data-6-Density), paired with platform on this block.',
      defaultValue: DEFAULT_CONTENT_BLOCK_PROPS.density,
      options: CONTENT_BLOCK_DENSITY_OPTIONS,
    },
    {
      name: 'foundationPlatformId',
      type: 'string',
      description:
        'Optional Density & Platforms foundation entry id (e.g. outdoor, web). When set, dimension tokens follow that platform; leave empty to use V2 viewport ladder only.',
      defaultValue: '',
    },
    {
      name: 'foundationBreakpointId',
      type: 'string',
      description:
        'Optional breakpoint id within the selected foundation platform. When set, dimension tokens use that breakpoint\'s viewport width instead of the artboard width.',
      defaultValue: '',
    },
    {
      name: 'foundationDimensionOverrides',
      type: 'object',
      description:
        'Pre-computed CSS custom properties for dimensions/spacing/typography (from computeDimensionOverrides). Usually set by the canvas editor, not by hand.',
    },
    {
      name: 'textGap',
      type: 'enum',
      description: 'Gap between context, headline, and body (f-step or auto)',
      defaultValue: 'auto',
      options: GAP_PADDING_OPTIONS,
    },
    {
      name: 'buttonGap',
      type: 'enum',
      description: 'Space before the button row (f-step or auto)',
      defaultValue: 'auto',
      options: GAP_PADDING_OPTIONS,
    },
    {
      name: 'buttonRowGap',
      type: 'enum',
      description: 'Gap between primary and secondary buttons (f-step or auto)',
      defaultValue: 'auto',
      options: GAP_PADDING_OPTIONS,
    },
    {
      name: 'buttonSize',
      type: 'enum',
      description: 'OneUI Button size',
      defaultValue: DEFAULT_CONTENT_BLOCK_PROPS.buttonSize,
      options: ['s', 'm', 'l'] as const,
    },
    {
      name: 'buttonAppearance',
      type: 'enum',
      description:
        'Multi-accent appearance shared by both CTAs; primary uses high emphasis, secondary uses medium (subtle) — same accent, not the Secondary role.',
      defaultValue: DEFAULT_CONTENT_BLOCK_PROPS.buttonAppearance,
      options: [
        'auto',
        'primary',
        'secondary',
        'neutral',
        'sparkle',
        'brand-bg',
        'positive',
        'negative',
        'warning',
        'informative',
      ] as const,
    },
    {
      name: 'textColor',
      type: 'string',
      description: 'Optional CSS colour for all text, e.g. var(--Text-OnBold-High)',
    },
  ],

  slots: [],

  previewMatrix: {
    variants: ['top', 'middle', 'bottom'],
    variantLabels: {
      top: 'Top',
      middle: 'Middle',
      bottom: 'Bottom',
    },
    sizes: ['left', 'center'],
    sizeLabels: {
      left: 'Left',
      center: 'Center',
    },
  },

  surfaceAware: true,
  multiAccent: true,

  tokenManifest: CONTENT_BLOCK_TOKEN_MANIFEST,
};
