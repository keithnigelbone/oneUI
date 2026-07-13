/**
 * Scrim.shared.ts
 * Shared types and hooks for Scrim component
 * Figma: node 4078:17919 — position, size, attention, variant
 */

import type { CSSProperties } from 'react';

/** Edge placement of a directional gradient scrim. */
export type ScrimPosition = 'bottom' | 'left' | 'top' | 'right';

/** Fade extent along the anchored axis. */
export type ScrimSize = 'xs' | 's' | 'm' | 'l' | 'xl' | 'full';

/** Prominence of the scrim fill. */
export type ScrimAttention = 'high' | 'medium' | 'low';

/** `gradient` = directional edge fade; `overlay` = uniform full-container fill. */
export type ScrimVariant = 'gradient' | 'overlay';

/** Shared base props (attention, className, style, testid). */
interface ScrimBaseProps {
  attention?: ScrimAttention;
  className?: string;
  style?: CSSProperties;
  'data-testid'?: string;
}

/**
 * Gradient props — directional fade anchored to an edge.
 * `position` and `size` only apply here; they are not accepted on overlay.
 */
export interface ScrimGradientProps extends ScrimBaseProps {
  variant?: 'gradient';
  /** Which edge to anchor the fade to. @default "bottom" */
  position?: ScrimPosition;
  /** How far the fade extends from the edge. @default "s" */
  size?: ScrimSize;
}

/**
 * Overlay props — uniform full-container tint (modal backdrop pattern).
 * `position` and `size` are not applicable and not accepted.
 */
export interface ScrimOverlayProps extends ScrimBaseProps {
  variant: 'overlay';
  position?: never;
  size?: never;
}

/** Discriminated union — position/size are only valid for gradient variant. */
export type ScrimProps = ScrimGradientProps | ScrimOverlayProps;

export function useScrimState(props: ScrimProps) {
  const { attention = 'medium', className, style } = props;

  let position: ScrimPosition | 'center';
  let size: ScrimSize;
  let variant: ScrimVariant;

  if (props.variant === 'overlay') {
    variant = 'overlay';
    position = 'center';
    size = 'full';
  } else {
    variant = 'gradient';
    position = props.position ?? 'bottom';
    size = props.size ?? 's';
  }

  const dataAttrs: Record<string, string> = {
    'data-oneui-component': 'Scrim',
    'data-position': position,
    'data-size': size,
    'data-attention': attention,
    'data-variant': variant,
  };

  return {
    position,
    size,
    attention,
    variant,
    className,
    style,
    dataAttrs,
  };
}
