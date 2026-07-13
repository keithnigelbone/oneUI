/**
 * Badge.shared.ts
 * Shared types and hooks for Badge component
 * Used by both web and React Native implementations
 */

import type { CSSProperties, ReactNode } from 'react';
import type { ComponentAppearance } from '@oneui/shared';
import type { SurfaceToken } from '@oneui/shared/engine';
import { useSurfaceAppearance, useSurfaceMode } from '../Surface/Surface';

/** Multi-accent appearance roles — alias for the shared canonical type. */
export type BadgeAppearance = ComponentAppearance;

/** Figma-aligned attention alias (maps to variant) */
export type BadgeAttention = 'high' | 'medium' | 'low';

export type BadgeVariant = 'bold' | 'subtle' | 'ghost';

export type BadgeSize = 'xs' | 's' | 'm' | 'l' | 'xl';

/** Map Figma attention values to code variant values */
const ATTENTION_TO_VARIANT: Record<BadgeAttention, BadgeVariant> = {
  high: 'bold',
  medium: 'subtle',
  low: 'ghost',
};

export interface BadgeProps {
  /** Text content displayed inside the badge */
  children?: ReactNode;
  /** Badge size. Default: 'm'. */
  size?: BadgeSize;
  /** Figma attention level — high (bold fill), medium (tinted fill), low (transparent). Default: 'high'. */
  attention?: BadgeAttention;
  /** Multi-accent appearance role. `'auto'` or omit: inherit nearest `<Surface>` effective role, else `sparkle`. */
  appearance?: BadgeAppearance;
  /** Content to render before the label (icon, avatar, counter badge, indicator badge) */
  start?: ReactNode;
  /** Content to render after the label (icon, avatar, counter badge, indicator badge) */
  end?: ReactNode;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
  /** Accessible label for screen readers */
  'aria-label'?: string;
  /** Test selector passthrough */
  'data-testid'?: string;
}

/**
 * Low-attention (ghost) badge borders use `auto(neutral)`:
 * parent surface appearance when the parent is a tinted surface, else neutral.
 * `default` (page) surfaces stay neutral — a coloured stroke on white reads wrong.
 */
export function resolveBadgeGhostBorderAppearance(
  surfaceAppearance: Exclude<ComponentAppearance, 'auto'> | null,
  surfaceMode: SurfaceToken | null,
): Exclude<ComponentAppearance, 'auto'> {
  if (surfaceMode === null || surfaceMode === 'default') {
    return 'neutral';
  }
  return surfaceAppearance ?? 'neutral';
}

export function useBadgeState(props: BadgeProps) {
  const surfaceAppearance = useSurfaceAppearance();
  const surfaceMode = useSurfaceMode();
  const { size = 'm', attention, appearance } = props;

  const resolvedVariant: BadgeVariant = attention ? ATTENTION_TO_VARIANT[attention] : 'bold';

  // Resolve appearance: explicit role wins; else nearest Surface; else sparkle
  const resolvedAppearance: Exclude<ComponentAppearance, 'auto'> =
    appearance !== undefined && appearance !== 'auto'
      ? (appearance as Exclude<ComponentAppearance, 'auto'>)
      : (surfaceAppearance ?? 'sparkle');

  const resolvedGhostBorderAppearance = resolveBadgeGhostBorderAppearance(
    surfaceAppearance,
    surfaceMode,
  );

  const dataAttrs: Record<string, string | undefined> = {
    'data-size': size,
    'data-variant': resolvedVariant,
    'data-appearance': resolvedAppearance,
  };

  return {
    resolvedVariant,
    resolvedAppearance,
    resolvedGhostBorderAppearance,
    dataAttrs,
  };
}
