/**
 * Logo.shared.ts
 * Shared types and hooks for Logo component
 * Used by both web and React Native implementations
 */

import type { CSSProperties, ReactNode } from 'react';
import type { MetallicGradientType, VisibleMetallicPresetName } from '@oneui/shared/engine';
import { applyMetallicToSvg as _applyMetallicToSvg } from '@oneui/shared/engine';

/** Logo display variant */
export type LogoVariant = 'mark' | 'full';

/** Logo size — t-shirt scale from XS to XL + custom */
export type LogoSize = 'xs' | 's' | 'm' | 'l' | 'xl' | 'custom';

/** Content rendering mode — resolved from props priority */
export type LogoContentMode = 'children' | 'svg' | 'image' | 'empty';

/** Tokenized metallic material paint for inline SVG logos */
export type LogoMaterial = VisibleMetallicPresetName;

/** Which SVG paint channels should receive the metallic material */
export type LogoMaterialTarget = 'fill' | 'stroke' | 'fill-stroke';

export interface LogoProps {
  /** Circular mark or full rectangular wordmark. Default: 'mark' */
  variant?: LogoVariant;
  /** Size preset. Default: 'm' */
  size?: LogoSize;
  /** Custom size in pixels (only when size='custom') */
  customSize?: number;
  /** Logo content as React node (SVG element, icon, etc.) — highest priority */
  children?: ReactNode;
  /** Image source URL for raster/external logos */
  src?: string;
  /** Raw SVG markup string (e.g., from Convex brand.logoSvg) */
  svgContent?: string;
  /** Metallic material paint for inline SVG content. Raster src logos are unchanged. */
  material?: LogoMaterial;
  /** SVG paint channels that receive the metallic material. Default: fill-stroke */
  materialTarget?: LogoMaterialTarget;
  /** Gradient style used by the metallic SVG paint server. Defaults to linear. */
  materialGradientType?: MetallicGradientType;
  /** Gradient direction angle used by the metallic SVG paint server. Defaults to 135. */
  materialGradientAngle?: number;
  /** Accessible alt text describing the brand (required) */
  alt: string;
  /** Image load callback (src mode only) */
  onLoad?: () => void;
  /** Image error callback (src mode only) */
  onError?: () => void;
  /** Fallback content when src fails to load */
  fallback?: ReactNode;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

/**
 * Delegate to the shared engine implementation.
 * Web path: no hexStops → CSS `var(--Material-Metallic-*)` references.
 */
export function applyLogoSvgMaterial(
  svgContent: string,
  material: LogoMaterial | undefined,
  gradientId: string,
  target: LogoMaterialTarget = 'fill-stroke',
  gradientType: MetallicGradientType = 'linear',
  gradientAngle?: number,
): string {
  return _applyMetallicToSvg(svgContent, material, gradientId, gradientType, gradientAngle, target);
}

/**
 * Resolve Logo state from props.
 * Returns content mode, resolved values, and data attributes.
 *
 * Content priority: children > svgContent > src > empty.
 * Note: the web `Logo` component additionally injects the active brand's logo
 * (from BrandLogoContext / BrandProvider) into `svgContent` before calling this,
 * so when no explicit content is passed the brand mark renders automatically.
 */
export function useLogoState(props: LogoProps) {
  const {
    variant = 'mark',
    size = 'm',
    material,
    children,
    svgContent,
    src,
  } = props;

  const contentMode: LogoContentMode =
    children ? 'children' :
    svgContent ? 'svg' :
    src ? 'image' :
    'empty';

  const dataAttrs: Record<string, string | undefined> = {
    'data-variant': variant,
    'data-size': size,
    'data-material': material,
  };

  return {
    contentMode,
    resolvedVariant: variant,
    resolvedSize: size,
    dataAttrs,
  };
}
