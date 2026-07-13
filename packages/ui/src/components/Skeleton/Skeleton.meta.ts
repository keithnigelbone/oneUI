/**
 * Skeleton.meta.ts
 */

import type { ComponentMeta } from '@oneui/shared';
import { SKELETON_TOKEN_MANIFEST } from './Skeleton.tokens';

export const SKELETON_META: ComponentMeta = {
  name: 'Skeleton',
  slug: 'skeleton',
  displayName: 'Skeleton',
  description:
    'Loading placeholder primitives. Compose SkeletonItem blocks inside SkeletonGroup for automatic shimmer stagger.',
  category: 'feedback',
  tags: ['loading', 'skeleton', 'placeholder', 'shimmer', 'busy'],

  props: [
    {
      name: 'width',
      type: 'string',
      description: 'SkeletonItem explicit width (CSS length).',
    },
    {
      name: 'height',
      type: 'string',
      description: 'SkeletonItem explicit height (CSS length).',
    },
    {
      name: 'children',
      type: 'ReactNode',
      description: 'SkeletonItem content for size inference, or SkeletonGroup SkeletonItem list.',
    },
  ],

  slots: [],

  previewMatrix: {
    variants: ['default'],
    variantLabels: { default: 'Default' },
    sizes: [],
    sizeLabels: {},
  },

  surfaceAware: true,
  multiAccent: false,

  tokenManifest: SKELETON_TOKEN_MANIFEST,
};
