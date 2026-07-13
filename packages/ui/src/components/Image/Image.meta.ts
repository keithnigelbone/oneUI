/**
 * Image.meta.ts
 * Unified metadata for the Image component.
 */

import type { ComponentMeta } from '@oneui/shared';
import { IMAGE_TOKEN_MANIFEST } from './Image.tokens';
import { IMAGE_RECIPE_DEFINITION } from './Image.recipe';

const OBJECT_FIT_OPTIONS = [
  'cover',
  'contain',
  'fill',
  'none',
  'scale-down',
  'inherit',
  'initial',
  'revert',
  'revert-layer',
  'unset',
] as const;

const ASPECT_RATIO_OPTIONS = [
  'auto',
  '1:1',
  '1:2',
  '2:1',
  '2:3',
  '3:2',
  '3:4',
  '4:3',
  '9:16',
  '16:9',
  '9:21',
  '21:9',
] as const;

export const IMAGE_META: ComponentMeta = {
  name: 'Image',
  slug: 'image',
  displayName: 'Image',
  description: 'Responsive image with aspect ratio presets, object-fit controls, and optional interactive state.',
  category: 'display',

  props: [
    {
      name: 'src',
      type: 'string',
      description: 'Image source URL',
      required: true,
    },
    {
      name: 'alt',
      type: 'string',
      description: 'Alt text for accessibility',
      required: true,
    },
    {
      name: 'aspectRatio',
      type: 'enum',
      description: 'Aspect ratio preset',
      defaultValue: 'auto',
      options: ASPECT_RATIO_OPTIONS,
    },
    {
      name: 'fit',
      type: 'enum',
      description: 'Figma alias for object-fit; wins over `objectFit` when both are set',
      options: OBJECT_FIT_OPTIONS,
    },
    {
      name: 'objectFit',
      type: 'enum',
      description: 'CSS object-fit for the inner image',
      defaultValue: 'cover',
      options: OBJECT_FIT_OPTIONS,
    },
    {
      name: 'objectPosition',
      type: 'string',
      description: 'CSS object-position (web); applied via token pipeline',
      defaultValue: 'center',
    },
    {
      name: 'loading',
      type: 'enum',
      description: 'Native lazy loading hint (web). `auto` omits the HTML attribute.',
      defaultValue: 'lazy',
      options: ['auto', 'lazy', 'eager'] as const,
    },
    {
      name: 'srcSet',
      type: 'string',
      description: 'Responsive `srcSet` string (web `<img>` only)',
    },
    {
      name: 'sizes',
      type: 'string',
      description: '`sizes` hint for `srcSet` selection (web only)',
    },
    {
      name: 'crossOrigin',
      type: 'enum',
      description: 'CORS mode for the image request (web only)',
      options: ['anonymous', 'use-credentials'] as const,
    },
    {
      name: 'decoding',
      type: 'enum',
      description: 'Decode hint for the browser (web only)',
      options: ['auto', 'sync', 'async'] as const,
    },
    {
      name: 'draggable',
      type: 'boolean',
      description: 'Native drag behaviour (web only)',
    },
    {
      name: 'lottieAttributes',
      type: 'object',
      description: 'Optional Lottie/host payload — serialized to `data-oneui-lottie` on the root',
    },
    {
      name: 'interactive',
      type: 'boolean',
      description: 'Enable state layer + focus ring',
      defaultValue: false,
    },
    {
      name: 'disabled',
      type: 'boolean',
      defaultValue: false,
    },
    {
      name: 'width',
      type: 'string',
      description: 'Container width (px number or CSS length)',
    },
    {
      name: 'height',
      type: 'string',
      description: 'Container height (px number or CSS length)',
    },
    {
      name: 'fallback',
      type: 'ReactNode',
      description: 'Custom React node shown on load error (wins over `fallbackSrc`)',
    },
    {
      name: 'fallbackSrc',
      type: 'string',
      description: 'Fallback image URL when `src` fails and `fallback` is not set',
    },
    {
      name: 'onPress',
      type: 'function',
      description: 'Click handler when `interactive`',
    },
    {
      name: 'onClick',
      type: 'function',
      description: 'Web alias for `onPress` when `interactive`',
    },
    {
      name: 'onLoad',
      type: 'function',
      description: 'Fires when the image has loaded',
    },
    {
      name: 'onError',
      type: 'function',
      description: 'Fires when the image fails to load',
    },
    {
      name: 'className',
      type: 'string',
      description: 'Additional class name (web only)',
    },
    {
      name: 'style',
      type: 'object',
      description: 'Inline styles (`CSSProperties` on the web root)',
    },
    {
      name: 'aria-label',
      type: 'string',
      description: 'Accessible label when `interactive` (defaults to `alt`)',
    },
    {
      name: 'testID',
      type: 'string',
      description: 'Forwarded as `data-testid` on the root element',
    },
  ],

  slots: [],

  previewMatrix: {
    variants: ['auto'],
    variantLabels: {
      auto: 'Default',
    },
    sizes: ['1:1', '3:2', '4:3', '16:9', '9:21', '21:9'],
    sizeLabels: {
      '1:1': '1:1',
      '3:2': '3:2',
      '4:3': '4:3',
      '16:9': '16:9',
      '9:21': '9:21',
      '21:9': '21:9',
    },
  },

  surfaceAware: false,
  multiAccent: false,

  tokenManifest: IMAGE_TOKEN_MANIFEST,
  recipeDefinition: IMAGE_RECIPE_DEFINITION,
};
