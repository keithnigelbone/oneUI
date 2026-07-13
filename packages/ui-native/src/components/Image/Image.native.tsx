/**
 * Image.native.tsx
 *
 * RN peer of `packages/ui/src/components/Image/Image.tsx`. Static layout
 * lives in `./Image.styles.native.ts`; dynamic values (aspect ratio,
 * width/height props, neutral fallback paint, disabled opacity) merge
 * inline. Pressable wrapper covers `data-interactive` + `aria-label`.
 *
 * Web parity:
 *   - `fit` overrides `objectFit` (Figma rule, mirrored via
 *     `resolveObjectFit`).
 *   - `fallbackSrc` swaps in when the primary `src` errors and no
 *     `fallback` ReactNode is supplied (cascade matches web's
 *     `fallback > fallbackSrc > default icon` order).
 *   - The container paints `Neutral.surfaces.minimal` only after an
 *     error, mirroring the web `--Image-fallbackBackground`.
 */

import React, { useEffect, useState } from 'react';
import {
  Image as RNImage,
  Pressable,
  View,
  type ImageResizeMode,
  type ImageStyle,
  type ViewStyle,
} from 'react-native';
import {
  getImageAccessibilityProps,
  resolveImagePressHandler,
  useImageState,
  type ImageObjectFit,
  type ImageProps,
} from './interface';
import { useSurfaceTokens } from '../../theme';
import { styles, DISABLED_OPACITY } from './Image.styles.native';

const RESIZE_MODE: Record<ImageObjectFit, ImageResizeMode> = {
  cover: 'cover',
  contain: 'contain',
  fill: 'stretch',
  none: 'center',
};

function aspectRatioNumeric(css: string | undefined): number | undefined {
  if (!css) return undefined;
  const [w, h] = css.split('/').map((s) => parseFloat(s.trim()));
  if (!Number.isFinite(w) || !Number.isFinite(h) || h === 0) return undefined;
  return w / h;
}

export function Image(props: ImageProps): React.ReactElement {
  const {
    src,
    alt,
    onPress,
    onClick,
    onLoad,
    onError,
    fallback,
    fallbackSrc,
    width,
    height,
    style: styleProp,
  } = props;
  const { isActionable, isDisabled, aspectRatioCSS, resolvedObjectFit } = useImageState(props);
  const imageA11y = getImageAccessibilityProps(props, { isActionable });
  const role = useSurfaceTokens('neutral');

  // Cascade: try `src` → on error try `fallbackSrc` → on error render
  // `fallback` ReactNode (or just the neutral fallback paint).
  const [hasError, setHasError] = useState(false);
  const [usingFallbackSrc, setUsingFallbackSrc] = useState(false);
  useEffect(() => {
    setHasError(false);
    setUsingFallbackSrc(false);
  }, [src, fallbackSrc]);

  const ratio = aspectRatioNumeric(aspectRatioCSS);
  const fallbackBg =
    hasError || !src ? role.surfaces.minimal : 'transparent';
  const containerExtras: ViewStyle = {
    backgroundColor: fallbackBg,
    ...(typeof width === 'number' ? { width } : null),
    ...(typeof width === 'string' ? { width: width as ViewStyle['width'] } : null),
    ...(typeof height === 'number' ? { height } : null),
    ...(typeof height === 'string' ? { height: height as ViewStyle['height'] } : null),
    ...(ratio != null ? { aspectRatio: ratio } : null),
    ...(isDisabled ? { opacity: DISABLED_OPACITY } : null),
  };

  const innerStyle: ImageStyle = styles.inner;

  const handlePress = resolveImagePressHandler({ onPress, onClick });

  const handleError = (): void => {
    if (!usingFallbackSrc && fallbackSrc && fallbackSrc !== src) {
      setUsingFallbackSrc(true);
      return;
    }
    setHasError(true);
    onError?.();
  };

  const renderImage = (): React.ReactElement | null => {
    if (hasError && fallback != null) {
      return (
        <View accessible={false} style={innerStyle}>
          {fallback}
        </View>
      );
    }
    if (hasError) {
      return null;
    }
    const activeUri = usingFallbackSrc && fallbackSrc ? fallbackSrc : src;
    return (
      <RNImage
        source={{ uri: activeUri }}
        accessible={false}
        resizeMode={RESIZE_MODE[resolvedObjectFit]}
        onLoad={onLoad}
        onError={handleError}
        style={innerStyle}
      />
    );
  };

  if (isActionable && handlePress) {
    return (
      <Pressable
        {...imageA11y}
        role='button'
        aria-label={imageA11y.accessibilityLabel}
        onPress={handlePress}
        style={({ pressed }) => [
          styles.container,
          containerExtras,
          pressed ? styles.pressed : null,
          styleProp as ViewStyle,
        ]}
        testID={props.testID}
      >
        {renderImage()}
      </Pressable>
    );
  }

  return (
    <View
      {...imageA11y}
      role='img'
      aria-label={imageA11y.accessibilityLabel}
      style={[styles.container, containerExtras, styleProp as ViewStyle]}
      testID={props.testID}
    >
      {renderImage()}
    </View>
  );
}

export type { ImageProps } from './interface';
