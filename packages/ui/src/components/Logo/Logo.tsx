/**
 * Logo.tsx
 * React (web) implementation
 *
 * Key features:
 * - Token-only styling in CSS Module
 * - Circular shape = Shape-Pill (mark variant, default)
 * - Rectangular = Shape-None (full variant, for wordmarks)
 * - Three content sources: children > svgContent > src
 * - Surface-context-aware: automatically adapts when inside <Surface mode="bold">
 * - Non-interactive (brand identity display)
 */

'use client';

import React, { useState, useCallback, useId, useMemo } from 'react';
import clsx from 'clsx';
import styles from './Logo.module.css';
import { applyLogoSvgMaterial, type LogoProps, useLogoState } from './Logo.shared';
import { useBrandLogo } from '../../contexts/BrandLogoContext';

export function Logo(props: LogoProps & { ref?: React.Ref<HTMLSpanElement> }) {
  const { ref } = props;
  const {
    children,
    svgContent,
    src,
    alt,
    onLoad,
    onError,
    fallback,
    className,
    style,
    customSize,
    material,
    materialTarget,
    materialGradientType,
    materialGradientAngle,
  } = props;

  // Brand fallback: when no explicit content (children / svgContent / src) is
  // provided, use the current brand's logo supplied by BrandProvider via
  // BrandLogoContext. This makes `<Logo alt="…" />` render the active brand mark
  // automatically — consumers don't need their own context→svgContent wrapper.
  // Content priority stays: children > svgContent > src > brand context > empty.
  const { logoSvg: brandLogoSvg } = useBrandLogo();
  const effectiveSvgContent = svgContent
    ? svgContent
    : (!children && !src ? brandLogoSvg : undefined);

  const { contentMode, dataAttrs } = useLogoState({ ...props, svgContent: effectiveSvgContent });

  const [imageError, setImageError] = useState(false);
  const reactId = useId();
  const materialGradientId = `oneui-logo-metal-${reactId.replace(/:/g, '')}`;
  const renderedSvgContent = useMemo(
    () => effectiveSvgContent
      ? applyLogoSvgMaterial(
        effectiveSvgContent,
        material,
        materialGradientId,
        materialTarget,
        materialGradientType,
        materialGradientAngle,
      )
      : effectiveSvgContent,
    [effectiveSvgContent, material, materialGradientId, materialTarget, materialGradientType, materialGradientAngle],
  );

  const handleImageError = useCallback(() => {
    setImageError(true);
    onError?.();
  }, [onError]);

  const rootClassName = clsx(styles.root, className);

  const rootStyle = customSize
    ? { ...style, '--Logo-customSize': `${customSize}px` } as React.CSSProperties
    : style;

  const renderContent = () => {
    switch (contentMode) {
      case 'children':
        return <span className={styles.mark}>{children}</span>;

      case 'svg':
        return (
          <span
            className={styles.mark}
            aria-hidden="true"
            dangerouslySetInnerHTML={{ __html: renderedSvgContent! }}
          />
        );

      case 'image':
        if (imageError && fallback) {
          return <span className={styles.fallback}>{fallback}</span>;
        }
        return (
          <img
            className={styles.image}
            src={src}
            alt=""
            role="presentation"
            onLoad={onLoad}
            onError={handleImageError}
          />
        );

      case 'empty':
        return fallback ? <span className={styles.fallback}>{fallback}</span> : null;
    }
  };

  return (
    <span
      ref={ref}
      className={rootClassName}
      style={rootStyle}
      role="img"
      aria-label={alt}
      data-mode="light"
      {...dataAttrs}
    >
      {renderContent()}
    </span>
  );
}
