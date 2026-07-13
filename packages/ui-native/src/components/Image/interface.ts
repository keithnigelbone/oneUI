/**
 * Image interface (native)
 *
 * Mirrors `packages/ui/src/components/Image/Image.shared.ts` for the
 * portable subset. Web-only props (`srcSet`, `sizes`, `crossOrigin`,
 * `decoding`, `draggable`, `lottieAttributes`, `className`) are
 * intentionally not surfaced — see `docs/parity/image-web-native-parity.md`.
 */

import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';

/**
 * Aspect ratio presets. Mirrors the full web union — including the wide /
 * tall extremes (`9:21` / `21:9`) the Storybook `AspectRatios` story
 * exercises.
 */
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

/**
 * `objectFit` keywords supported on RN. The four canonical modes map onto
 * `RNImage.resizeMode`. Web's extended CSS keywords (`scale-down`,
 * `inherit`, `initial`, `revert`, `revert-layer`, `unset`) have no native
 * equivalent — passing one of them is treated as `cover` and a parity-doc
 * note explains the gap.
 */
export type ImageObjectFit = 'cover' | 'contain' | 'fill' | 'none';

/**
 * Figma `fit` vocabulary. Includes `container` — Figma's name for CSS
 * `object-fit: contain` — which normalises to `contain` before resize-mode
 * lookup.
 */
export type ImageFit = ImageObjectFit | 'container';

export type ImageLoadingStrategy = 'auto' | 'lazy' | 'eager';

export interface ImageProps {
  /** Image source URL (required). */
  src: string;
  /** Accessible alt text (required — used as `accessibilityLabel`). */
  alt: string;
  /** Aspect ratio preset. Default: `'auto'`. */
  aspectRatio?: ImageAspectRatio;
  /** When true: state-layer overlay + tappable wrapper. Default: `false`. */
  interactive?: boolean;
  /** Reduces opacity. Default: `false`. */
  disabled?: boolean;

  /**
   * Figma-aligned alias for `objectFit`. When both are set, `fit` wins
   * (matches `Image.tsx` precedence rule). Accepts Figma's `container`
   * value, which maps to `contain`.
   */
  fit?: ImageFit;
  /** Resize mode for the inner image. Default: `'cover'`. */
  objectFit?: ImageObjectFit;
  /**
   * RN does not expose a separate `objectPosition`; accepted for API
   * symmetry with web but currently a no-op until we wire alignment-aware
   * resize.
   */
  objectPosition?: string;
  /** Browser native loading strategy. No-op on native (RN images are eager). */
  loading?: ImageLoadingStrategy;

  /** Container width — number = px, string = percentage / dim. */
  width?: string | number;
  /** Container height. */
  height?: string | number;

  /** Press handler (interactive only). */
  onPress?: () => void;
  /** Web alias for `onPress` — accepted for API symmetry. */
  onClick?: () => void;
  /** Image-loaded callback. */
  onLoad?: () => void;
  /** Image-error callback. */
  onError?: () => void;

  /** Custom error fallback content (wins over `fallbackSrc`). */
  fallback?: ReactNode;
  /** Fallback image URL when `src` fails and no `fallback` is provided. */
  fallbackSrc?: string;

  /** Inline native styles (forwarded to the outer `<View>` / `<Pressable>`). */
  style?: ViewStyle;

  /** Override the accessible name (defaults to `alt`). */
  'aria-label'?: string;
  /** Test hook (forwarded as `testID`). */
  testID?: string;
}

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

/** "16:9" → "16 / 9", "auto" → undefined. */
export function parseAspectRatio(ratio: ImageAspectRatio): string | undefined {
  if (ratio === 'auto') return undefined;
  return ASPECT_RATIO_MAP[ratio];
}

const FIGMA_FIT_ALIASES: Record<string, ImageObjectFit> = {
  container: 'contain',
};

/** Normalise a fit / object-fit value to a canonical RN resize mode. */
export function normalizeObjectFit(
  value: ImageFit | ImageObjectFit | undefined,
  fallback: ImageObjectFit = 'cover',
): ImageObjectFit {
  if (value == null) return fallback;
  return FIGMA_FIT_ALIASES[value] ?? (value as ImageObjectFit);
}

/** Resolve the canonical resize-mode following the `fit` > `objectFit` web rule. */
export function resolveObjectFit(props: Pick<ImageProps, 'fit' | 'objectFit'>): ImageObjectFit {
  return normalizeObjectFit(props.fit ?? props.objectFit);
}

/**
 * `onPress` and `onClick` are aliases for the same interaction. When both are
 * provided, both run (onPress first, then onClick).
 */
export function resolveImagePressHandler(
  handlers?: Pick<ImageProps, 'onPress' | 'onClick'>,
): (() => void) | undefined {
  const { onPress, onClick } = handlers ?? {};
  if (onPress && onClick) {
    return () => {
      onPress();
      onClick();
    };
  }
  return onPress ?? onClick;
}

export function useImageState(props: ImageProps): {
  /** `interactive` flag without a disabled gate — used for visual affordances only. */
  isInteractive: boolean;
  /** Actionable: interactive, not disabled, and has `onPress` / `onClick`. */
  isActionable: boolean;
  isDisabled: boolean;
  resolvedObjectFit: ImageObjectFit;
  aspectRatioCSS: string | undefined;
  dataAttrs: Record<string, string | undefined>;
} {
  const { aspectRatio = 'auto', interactive = false, disabled = false } = props;

  const isInteractive = interactive && !disabled;
  const isActionable = isInteractive && resolveImagePressHandler(props) != null;
  const isDisabled = disabled;

  const dataAttrs: Record<string, string | undefined> = {
    'data-aspect-ratio': aspectRatio !== 'auto' ? aspectRatio : undefined,
  };

  return {
    isInteractive,
    isActionable,
    isDisabled,
    resolvedObjectFit: resolveObjectFit(props),
    dataAttrs,
    aspectRatioCSS: parseAspectRatio(aspectRatio),
  };
}

export function resolveImageAccessibilityLabel(
  props: Pick<ImageProps, 'aria-label' | 'alt'>,
): string {
  return props['aria-label'] ?? props.alt;
}

export function getImageAccessibilityProps(
  props: Pick<ImageProps, 'aria-label' | 'alt' | 'interactive' | 'disabled'>,
  state: Pick<ReturnType<typeof useImageState>, 'isActionable'>,
): {
  accessible: true;
  accessibilityLabel: string;
  accessibilityRole: 'button' | 'image';
} {
  return {
    accessible: true,
    accessibilityLabel: resolveImageAccessibilityLabel(props),
    accessibilityRole: state.isActionable ? 'button' : 'image',
  };
}
