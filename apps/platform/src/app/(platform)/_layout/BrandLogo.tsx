'use client';

import React from 'react';
import { Logo } from '@oneui/ui/components/Logo';
import type { VisibleMetallicPresetName } from '@oneui/shared/engine';
import { tintSvgToCurrentColor } from './lib/tintSvgToCurrentColor';

interface BrandLogoProps {
  logoSvg?: string;
  /** Optional inline override — usually the editing brand's `--Primary-Bold`. */
  primaryColor?: string;
  /** Optional metallic material assignment from Appearance > Logo. */
  material?: VisibleMetallicPresetName;
}

/**
 * Sidebar brand-mark — tints the supplied SVG to `currentColor` so it always
 * reflects the active brand/sub-brand's primary appearance colour. The
 * `primaryColor` prop provides an inline override from `useSurfaceTokenVars`
 * so the logo updates even in Default Theme mode (where global CSS injection
 * uses the platform brand, not the editing brand).
 */
export function BrandLogo({ logoSvg, primaryColor, material }: BrandLogoProps): React.ReactElement {
  const tintedSvg = logoSvg ? tintSvgToCurrentColor(logoSvg) : undefined;

  return (
    <Logo
      svgContent={tintedSvg}
      alt="Brand"
      size="xl"
      variant="mark"
      material={material}
      materialTarget="fill-stroke"
      style={!material && primaryColor ? { color: primaryColor } : undefined}
      fallback={
        <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--Text-OnBold-High)' }}>O</span>
      }
    />
  );
}
