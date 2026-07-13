/**
 * Image.tsx
 * React (web) implementation
 *
 * Key features:
 * - Token-only styling in CSS Module
 * - Aspect ratio presets (Figma-defined ratios)
 * - Interactive mode with state layer + focus ring
 * - Graceful fallback when image fails to load
 * - Shape default: Shape-None (0px), overridable per brand via --Image-borderRadius
 */

'use client';

import React, { useMemo, useState } from 'react';
import clsx from 'clsx';
import styles from './Image.module.css';
import { type ImageProps, useImageState } from './Image.shared';

/** Default landscape/image icon for fallback */
const DefaultImageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Zm16 0H5v9.586l3.293-3.293a1 1 0 0 1 1.414 0L13 14.586l2.293-2.293a1 1 0 0 1 1.414 0L19 14.586V5ZM5 19h14v-1.586l-3-3-2.293 2.293a1 1 0 0 1-1.414 0L9 13.414l-4 4V19Zm11-9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
      clipRule="evenodd"
    />
  </svg>
);

function serializeLottieAttributes(attrs: Readonly<Record<string, unknown>>): string | undefined {
  try {
    const s = JSON.stringify(attrs);
    return s === '{}' ? undefined : s;
  } catch {
    return undefined;
  }
}

export const Image = React.forwardRef<HTMLElement, ImageProps>(function Image(props, ref) {
  const {
    src,
    alt,
    fit,
    objectFit: objectFitProp,
    objectPosition = 'center',
    loading = 'lazy',
    srcSet,
    sizes,
    crossOrigin,
    decoding,
    draggable,
    lottieAttributes,
    width,
    height,
    onPress,
    onClick,
    onLoad,
    onError,
    fallback,
    fallbackSrc,
    className,
    style,
    'aria-label': ariaLabel,
    testID,
  } = props;

  const objectFit = fit ?? objectFitProp ?? 'cover';

  const { isInteractive, isDisabled, dataAttrs } = useImageState(props);

  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const handleClick = () => {
    if (!isInteractive || isDisabled) return;
    (onPress ?? onClick)?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isInteractive || isDisabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      (onPress ?? onClick)?.();
    }
  };

  const rootClassName = clsx(
    styles.root,
    { [styles.interactive]: isInteractive },
    { [styles.disabled]: isDisabled },
    className,
  );

  const rootStyle: React.CSSProperties = {
    ...style,
    width: width != null ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height != null ? (typeof height === 'number' ? `${height}px` : height) : undefined,
    '--Image-objectFit': objectFit,
    '--Image-objectPosition': objectPosition,
  } as React.CSSProperties;

  const lottieDataProps = useMemo(() => {
    if (!lottieAttributes || Object.keys(lottieAttributes).length === 0) return {};
    const encoded = serializeLottieAttributes(lottieAttributes);
    return encoded ? { 'data-oneui-lottie': encoded } : {};
  }, [lottieAttributes]);

  const imgLoading = loading === 'auto' ? undefined : loading;

  const imgContent = hasError ? (
    <div className={styles.fallback}>
      {fallback != null ? (
        fallback
      ) : fallbackSrc ? (
        <img
          src={fallbackSrc}
          alt=""
          role="presentation"
          className={styles.fallbackImg}
          decoding="async"
        />
      ) : (
        <DefaultImageIcon />
      )}
    </div>
  ) : (
    <img
      src={src}
      alt=""
      role="presentation"
      loading={imgLoading}
      srcSet={srcSet}
      sizes={sizes}
      crossOrigin={crossOrigin}
      decoding={decoding}
      draggable={draggable}
      className={styles.image}
      onLoad={onLoad}
      onError={handleError}
    />
  );

  if (isInteractive) {
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={rootClassName}
        style={rootStyle}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={isDisabled}
        aria-label={ariaLabel || alt}
        data-testid={testID}
        {...dataAttrs}
        {...lottieDataProps}
      >
        {imgContent}
      </button>
    );
  }

  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      className={rootClassName}
      style={rootStyle}
      role="img"
      aria-label={alt}
      data-testid={testID}
      {...dataAttrs}
      {...lottieDataProps}
    >
      {imgContent}
    </div>
  );
});

Image.displayName = 'Image';
