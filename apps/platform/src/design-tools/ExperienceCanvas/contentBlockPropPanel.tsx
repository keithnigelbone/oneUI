/**
 * ContentBlock — PropPanel section config and labels (human-readable inspector UX).
 */

/** Props edited elsewhere or synced from the frame / server — hide from the main list */
export const CONTENT_BLOCK_PANEL_SKIP = new Set([
  'position',
  'alignment',
  'foundationPlatformId',
  'foundationBreakpointId',
  'foundationDimensionOverrides',
  'canvasWidth',
  'canvasHeight',
  'platform',
  'density',
  'maxWidth',
]);

export const CONTENT_BLOCK_LABELS: Record<string, string> = {
  contextText: 'Context label',
  headlineText: 'Headline',
  bodyText: 'Body',
  primaryCtaText: 'Primary CTA',
  secondaryCtaText: 'Secondary CTA',
  showContext: 'Context',
  showBody: 'Body',
  showButtons: 'CTAs',
  showSecondaryButton: '2nd CTA',
  maxWidth: 'Width %',
  headlineToken: 'Headline',
  contextToken: 'Context',
  bodyToken: 'Body',
  buttonSize: 'Size',
  buttonAppearance: 'Accent',
  paddingTop: 'Top',
  paddingRight: 'Right',
  paddingBottom: 'Bottom',
  paddingLeft: 'Left',
  textGap: 'Text gap',
  buttonGap: 'CTA gap',
  buttonRowGap: 'CTA row gap',
  platform: 'Scale',
  density: 'Density',
  textColor: 'Text colour',
};

export type ContentBlockSectionLayout = 'fields' | 'visibility' | 'padding' | 'details';

export type ContentBlockSectionDef = {
  id: string;
  title: string;
  /** Shown under the section title */
  hint?: string;
  propNames: readonly string[];
  layout?: ContentBlockSectionLayout;
};

export const CONTENT_BLOCK_SECTIONS: readonly ContentBlockSectionDef[] = [
  {
    id: 'copy',
    title: 'Content',
    propNames: ['contextText', 'headlineText', 'bodyText', 'primaryCtaText', 'secondaryCtaText'],
  },
  {
    id: 'visibility',
    title: 'Visibility',
    propNames: ['showContext', 'showBody', 'showButtons', 'showSecondaryButton'],
    layout: 'visibility',
  },
  {
    id: 'typography',
    title: 'Typography',
    propNames: ['headlineToken', 'contextToken', 'bodyToken'],
  },
  {
    id: 'buttons',
    title: 'Buttons',
    propNames: ['buttonSize', 'buttonAppearance'],
  },
  {
    id: 'spacing',
    title: 'Spacing',
    propNames: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'textGap', 'buttonGap', 'buttonRowGap'],
    layout: 'details',
    hint: 'Padding and gaps between elements. Auto derives from banner size.',
  },
  {
    id: 'advanced',
    title: 'Advanced',
    propNames: ['textColor'],
    layout: 'details',
    hint: 'CSS colour override, e.g. var(--Text-OnBold-High).',
  },
] as const;
