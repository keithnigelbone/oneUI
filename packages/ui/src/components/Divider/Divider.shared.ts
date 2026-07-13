/**
 * Divider.shared.ts
 * Shared types and hooks for Divider component
 * Used by both web and React Native implementations
 */

import { isValidElement, type CSSProperties, type ReactElement, type ReactNode } from 'react';
import type { IconSize } from '../Icon/Icon.shared';

export type DividerOrientation = 'horizontal' | 'vertical';
export type DividerSize = 's' | 'm' | 'l';
export type DividerContentAlign = 'center' | 'start' | 'end';
export type DividerContent = 'none' | 'icon' | 'text';
export type DividerAppearance =
  | 'auto'
  | 'primary'
  | 'secondary'
  | 'neutral'
  | 'sparkle'
  | 'positive'
  | 'negative'
  | 'warning'
  | 'informative';
export type DividerAttention = 'high' | 'medium' | 'low';

/** Figma `Slot/size4/Icon*` — centre icon is always 16px (`Icon` size `4`). */
export const DIVIDER_ICON_SIZE: IconSize = '4';

/** Figma label slot — Label XS Medium. */
export const DIVIDER_TEXT_VARIANT = 'label' as const;
export const DIVIDER_TEXT_SIZE = 'XS' as const;
export const DIVIDER_TEXT_WEIGHT = 'medium' as const;

function elementTypeName(node: ReactElement): string | undefined {
  const t = node.type as { displayName?: string; name?: string };
  return t.displayName ?? t.name;
}

/** True when `children` should render the line + centre layout (vs Base UI separator only). */
export function dividerHasChildren(children: ReactNode): boolean {
  if (children == null || children === false) return false;
  if (typeof children === 'string') return children.trim().length > 0;
  if (typeof children === 'number') return Number.isFinite(children);
  if (Array.isArray(children)) return children.some(dividerHasChildren);
  return true;
}

/** @deprecated Use {@link dividerHasChildren} */
export const dividerHasRenderableContent = dividerHasChildren;

/**
 * Infer centre slot kind from `children` — mirrors native `contentType` resolution.
 * Only plain strings/numbers, `<Icon />`, and `<Text />` are allowed.
 */
export function resolveDividerContentType(children: ReactNode): DividerContent {
  if (!dividerHasChildren(children)) return 'none';
  if (typeof children === 'string' || typeof children === 'number') return 'text';
  if (isValidElement(children)) {
    const name = elementTypeName(children);
    if (name === 'Icon') return 'icon';
    if (name === 'Text') return 'text';
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        'Divider: children must be a plain string, <Icon />, or <Text />. Rendering bare separator.',
      );
    }
    return 'none';
  }
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      'Divider: children must be a plain string, <Icon />, or <Text />. Rendering bare separator.',
    );
  }
  return 'none';
}

export interface DividerProps {
  /** Component orientation. Default: 'horizontal' */
  orientation?: DividerOrientation;
  /** Stroke width of the divider. Default: 'm' */
  size?: DividerSize;
  /**
   * Centre content — plain string/number (auto-wrapped in Label XS Medium `<Text />`),
   * `<Icon />`, or `<Text />`. Divider merges `appearance` / `attention` onto
   * `Icon` / `Text` when those props are unset on the child. Omit for a bare separator.
   */
  children?: ReactNode;
  /** Position of the centre content. Default: 'center' */
  contentAlign?: DividerContentAlign;
  /** Multi-accent appearance role. 'auto' resolves to 'neutral'. Default: 'auto' */
  appearance?: DividerAppearance;
  /** Prominence level — drives stroke tier and centre Icon/Text emphasis. Default: 'low' */
  attention?: DividerAttention;
  /** Rounded stroke ends. Default: false */
  roundCaps?: boolean;
  /** Test automation id — forwarded to the root separator element only. */
  'data-testid'?: string;
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

export function useDividerState(props: DividerProps) {
  const {
    orientation = 'horizontal',
    size = 'm',
    children,
    contentAlign = 'center',
    appearance = 'auto',
    attention = 'low',
    roundCaps = false,
  } = props;

  const resolvedAppearance = appearance === 'auto' ? 'neutral' : appearance;
  const content = resolveDividerContentType(children);
  const hasContent = content !== 'none';

  const dataAttrs: Record<string, string> = {
    'data-orientation': orientation,
    'data-size': size,
    'data-attention': attention,
    'data-content': content,
  };

  return {
    orientation,
    size,
    content,
    children,
    contentAlign,
    resolvedAppearance,
    attention,
    roundCaps,
    hasContent,
    dataAttrs,
  };
}
