/**
 * Image.shared.ts
 * Types and hooks for the web `Image` component (`Image.tsx`).
 * React Native keeps a separate, narrower `ImageProps` in `@oneui/ui-native`.
 */

import type { CSSProperties, ReactNode } from 'react';

/** Aspect ratio presets from Figma spec */
export type ImageAspectRatio =
  | 'auto'
  | '1:1'
  | '1:2'
  | '2:1'
  | '2:3'
  | '3:2'
  | '3:4'
  | '4:3'
  | '9:16'
  | '16:9'
  | '9:21'
  | '21:9';

/** CSS object-fit values supported by the internal `<img>` (via `--Image-objectFit`) */
export type ImageObjectFit =
  | 'cover'
  | 'contain'
  | 'fill'
  | 'none'
  | 'scale-down'
  | 'inherit'
  | 'initial'
  | 'revert'
  | 'revert-layer'
  | 'unset';

/**
 * HTML `loading` attribute. `auto` means omit the attribute (browser default).
 * (Figma tables sometimes list non-standard values; only these are wired to `<img>`.)
 */
export type ImageLoadingStrategy = 'auto' | 'lazy' | 'eager';

export type ImageCrossOrigin = 'anonymous' | 'use-credentials';

export type ImageDecoding = 'auto' | 'sync' | 'async';

/** Bag for Lottie / host bridges — on web, JSON-serialized to `data-oneui-lottie` on the root. */
export type ImageLottieAttributes = Readonly<Record<string, unknown>>;

export interface ImageProps {
  /** Image source URL (required) */
  src: string;
  /** Accessible alt text (required) */
  alt: string;
  /** Aspect ratio preset. Default: 'auto' */
  aspectRatio?: ImageAspectRatio;
  /** When true: state layer overlay + focus ring + clickable. Default: false */
  interactive?: boolean;
  /** Reduces opacity. Default: false */
  disabled?: boolean;
  /**
   * Figma-aligned alias for `objectFit`. If both `fit` and `objectFit` are set,
   * `fit` wins.
   */
  fit?: ImageObjectFit;
  /** CSS object-fit for the image. Default: 'cover' */
  objectFit?: ImageObjectFit;
  /** CSS object-position. Default: 'center' */
  objectPosition?: string;
  /** Browser native loading strategy. Default: 'lazy' */
  loading?: ImageLoadingStrategy;
  /** Responsive image sources (HTML `srcSet`) */
  srcSet?: string;
  /** Hint for `srcSet` selection (HTML `sizes`) */
  sizes?: string;
  /** CORS mode for the image request */
  crossOrigin?: ImageCrossOrigin;
  /** Decode hint for the browser */
  decoding?: ImageDecoding;
  /** Native drag behavior */
  draggable?: boolean;
  /** Optional Lottie/host payload — web: `data-oneui-lottie` JSON on root */
  lottieAttributes?: ImageLottieAttributes;
  /** Container width */
  width?: string | number;
  /** Container height */
  height?: string | number;
  /** Click handler (interactive only) */
  onPress?: () => void;
  /** Web alias for onPress */
  onClick?: () => void;
  /** Image loaded callback */
  onLoad?: () => void;
  /** Image error callback */
  onError?: () => void;
  /** Custom error fallback content (wins over `fallbackSrc`) */
  fallback?: ReactNode;
  /** Fallback image URL when `src` fails and `fallback` is not set */
  fallbackSrc?: string;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Accessible label for interactive images */
  'aria-label'?: string;
  /** Test id — forwarded as `data-testid` on the web root element. */
  testID?: string;
}

/** Map aspect ratio string to CSS aspect-ratio value */
const ASPECT_RATIO_MAP: Record<string, string> = {
  '1:1': '1 / 1',
  '1:2': '1 / 2',
  '2:1': '2 / 1',
  '2:3': '2 / 3',
  '3:2': '3 / 2',
  '3:4': '3 / 4',
  '4:3': '4 / 3',
  '9:16': '9 / 16',
  '16:9': '16 / 9',
  '9:21': '9 / 21',
  '21:9': '21 / 9',
};

/**
 * Parse aspect ratio string to CSS value.
 * "16:9" → "16 / 9", "auto" → undefined
 */
export function parseAspectRatio(ratio: ImageAspectRatio): string | undefined {
  if (ratio === 'auto') return undefined;
  return ASPECT_RATIO_MAP[ratio];
}

/**
 * Resolve Image state from props.
 * `isInteractive` drives element choice (`<button>` vs `<div role="img">`).
 * `disabled` is passed to the button separately so AT still exposes a disabled control.
 */
export function useImageState(props: ImageProps) {
  const {
    aspectRatio = 'auto',
    interactive = false,
    disabled = false,
  } = props;

  const isInteractive = interactive;
  const isDisabled = disabled;

  const dataAttrs: Record<string, string | undefined> = {
    'data-aspect-ratio': aspectRatio !== 'auto' ? aspectRatio : undefined,
  };

  return {
    isInteractive,
    isDisabled,
    dataAttrs,
    aspectRatioCSS: parseAspectRatio(aspectRatio),
  };
}
