// @generated — do not edit by hand.
// Source: packages/ui/src/components/Text/Text.shared.ts
// Regenerate with: pnpm docs:machine

import { z } from 'zod';
import type { PropDescriptor } from '../../types/componentMeta';

export const TEXT_GENERATED_PROPS: PropDescriptor[] = [
  { name: 'children', type: 'ReactNode' },
  {
    name: 'variant',
    type: 'enum',
    options: ['body', 'label', 'title', 'headline', 'display', 'code'] as const,
    description: 'Typography role',
  },
  {
    name: 'size',
    type: 'enum',
    options: ['3XS', '2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL'] as const,
    description: 'Typography size step',
  },
  {
    name: 'weight',
    type: 'enum',
    options: ['high', 'medium', 'low'] as const,
    description: 'Emphasis weight',
  },
  {
    name: 'attention',
    type: 'enum',
    options: ['none', 'high', 'medium', 'low', 'tintedA11y'] as const,
    description: 'Colour prominence',
  },
  {
    name: 'appearance',
    type: 'enum',
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
    description: 'Colour role',
  },
  { name: 'text', type: 'string', description: 'Text content' },
  { name: 'as', type: 'string', description: 'Polymorphic element' },
  { name: 'href', type: 'string', description: 'Anchor destination' },
  { name: 'textAlign', type: 'enum', options: ['left', 'center', 'right'] as const },
  { name: 'maxLines', type: 'number' },
  { name: 'aria-label', type: 'string' },
  { name: 'aria-hidden', type: 'boolean' },
];

export const TEXT_PROPS_SCHEMA = z
  .object({
    children: z.string().optional(),
    variant: z.enum(['body', 'label', 'title', 'headline', 'display', 'code']).optional(),
    size: z.enum(['3XS', '2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL']).optional(),
    weight: z.enum(['high', 'medium', 'low']).optional(),
    attention: z.enum(['none', 'high', 'medium', 'low', 'tintedA11y']).optional(),
    appearance: z
      .enum([
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
      ])
      .optional(),
    text: z.string().optional(),
    as: z.string().optional(),
    href: z.string().optional(),
    textAlign: z.enum(['left', 'center', 'right']).optional(),
    maxLines: z.number().optional(),
    'aria-label': z.string().optional(),
    'aria-hidden': z.boolean().optional(),
  })
  .strict();
