/**
 * Text.meta.ts
 * Unified metadata for the design-system Text component.
 */

import type { ComponentMeta } from '@oneui/shared';
import { INDIA_CORE_SCRIPT_DEFINITIONS, TYPOGRAPHY_ROLES, TYPOGRAPHY_SIZES } from '@oneui/shared';
import { TEXT_TOKEN_MANIFEST } from './Text.tokens';
import { TEXT_APPEARANCES } from './Text.shared';

const appearanceOptions = ['auto', ...TEXT_APPEARANCES] as const;

const TEXT_SIZE_BY_VARIANT = {
  display: [...TYPOGRAPHY_SIZES.display],
  headline: [...TYPOGRAPHY_SIZES.headline],
  title: [...TYPOGRAPHY_SIZES.title],
  body: [...TYPOGRAPHY_SIZES.body],
  label: [...TYPOGRAPHY_SIZES.label],
  code: [...TYPOGRAPHY_SIZES.code],
} as const;

export const TEXT_META: ComponentMeta = {
  name: 'Text',
  slug: 'text',
  displayName: 'Text',
  description:
    'Inline / block text. Six typography roles with role-specific size scales, canonical multi-accent appearance, attention levels, italic / underline / strikethrough, latin / multi-script font fallback, and line-clamp truncation. Defaults to `span`; set `as` for headings or anchors. When using the `text` prop with the `link` slot, avoid `aria-hidden` on the root unless the link is decorative — the slot remains focusable.',
  category: 'display',

  props: [
    {
      name: 'variant',
      type: 'enum',
      description: 'Typography role',
      defaultValue: 'body',
      options: [...TYPOGRAPHY_ROLES],
    },
    {
      name: 'size',
      type: 'enum',
      description:
        'Size step — valid values depend on `variant` (matches foundation `TYPOGRAPHY_SIZES`).',
      defaultValue: 'M',
      optionsByDiscriminator: {
        discriminator: 'variant',
        options: TEXT_SIZE_BY_VARIANT,
      },
    },
    {
      name: 'weight',
      type: 'enum',
      description: 'Emphasis weight (body / label / code only)',
      defaultValue: 'high',
      options: ['high', 'medium', 'low'] as const,
    },
    {
      name: 'attention',
      type: 'enum',
      description: 'Colour prominence',
      defaultValue: 'none',
      options: ['none', 'high', 'medium', 'low', 'tintedA11y'] as const,
    },
    {
      name: 'appearance',
      type: 'enum',
      description: 'Colour role (multi-accent)',
      defaultValue: 'auto',
      options: appearanceOptions,
    },
    {
      name: 'italic',
      type: 'boolean',
      description: 'Render in italic',
      defaultValue: false,
    },
    {
      name: 'underline',
      type: 'boolean',
      description: 'Underline text',
      defaultValue: false,
    },
    {
      name: 'strikethrough',
      type: 'boolean',
      description: 'Strike-through text',
      defaultValue: false,
    },
    {
      name: 'language',
      type: 'enum',
      description: 'Deprecated compatibility switch — prefer `lang` or `script`',
      defaultValue: 'latin',
      options: ['latin', 'others'] as const,
    },
    {
      name: 'lang',
      type: 'string',
      description: 'BCP 47 language tag; enables matching script typography context',
    },
    {
      name: 'script',
      type: 'enum',
      description: 'Explicit script typography profile',
      options: INDIA_CORE_SCRIPT_DEFINITIONS.map((script) => script.id),
    },
    {
      name: 'scriptMode',
      type: 'enum',
      description: 'Script font profile: compact UI or roomier reading',
      defaultValue: 'ui',
      options: ['ui', 'reading'] as const,
    },
    {
      name: 'textAlign',
      type: 'enum',
      description: 'Block text alignment',
      options: ['left', 'center', 'right'] as const,
    },
    {
      name: 'maxLines',
      type: 'number',
      description: 'Truncate to N visual lines (1 = single-line ellipsis)',
    },
    {
      name: 'as',
      type: 'string',
      description:
        'Polymorphic element (default `span`). Use `h1`–`h6` for headings, `a` with `href` for links, `code` for monospace semantics.',
    },
    {
      name: 'href',
      type: 'string',
      description: 'When `as="a"`, anchor destination',
    },
    {
      name: 'text',
      type: 'string',
      description: 'Text content (alias for children)',
      defaultValue: '',
    },
  ],

  slots: [
    {
      name: 'link',
      description: 'Optional link rendered inline after the text content',
    },
  ],

  previewMatrix: {
    variants: [...TYPOGRAPHY_ROLES],
    variantLabels: {
      display: 'Display',
      headline: 'Headline',
      title: 'Title',
      body: 'Body',
      label: 'Label',
      code: 'Code',
    },
    sizesByVariant: TEXT_SIZE_BY_VARIANT,
    sizeLabels: {
      L: 'L',
      M: 'M',
      S: 'S',
      XS: 'XS',
      '2XS': '2XS',
      '3XS': '3XS',
    },
  },

  surfaceAware: true,
  multiAccent: true,

  tokenManifest: TEXT_TOKEN_MANIFEST,
};
