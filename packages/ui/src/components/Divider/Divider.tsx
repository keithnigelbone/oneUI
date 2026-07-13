/**
 * Divider.tsx
 * React (web) implementation using Base UI Separator
 *
 * Key features:
 * - Uses @base-ui/react Separator primitive for simple dividers (never fork; renders a div)
 * - Token-only styling in CSS Module
 * - 3 sizes (S/M/L) for stroke width
 * - Multi-accent appearance roles
 * - Centre children: pass `<Icon />` / `<Text />`; divider merges `appearance` + `attention` when omitted on the child
 * - Round caps option
 * - Surface-context-aware: inherits from [data-surface] token remapping
 * - WCAG AA accessible
 */

import React, { cloneElement, isValidElement, type ReactElement } from 'react';
import { Separator as BaseSeparator } from '@base-ui/react/separator';
import clsx from 'clsx';
import styles from './Divider.module.css';
import {
  DividerProps,
  DividerAppearance,
  DIVIDER_ICON_SIZE,
  DIVIDER_TEXT_SIZE,
  DIVIDER_TEXT_VARIANT,
  DIVIDER_TEXT_WEIGHT,
  useDividerState,
  type DividerAttention,
} from './Divider.shared';
import { Icon } from '../Icon/Icon';
import type { IconEmphasis } from '../Icon/Icon.shared';
import { Text } from '../Text/Text';
import type { TextAttention } from '../Text/Text.shared';
import { SlotParentAppearanceProvider } from '../../contexts/SlotParentAppearanceContext';

function attentionToIconEmphasis(attention: DividerAttention): IconEmphasis {
  return attention;
}

function attentionToTextAttention(attention: DividerAttention): TextAttention {
  return attention;
}

/** Merge divider appearance + attention onto centre `<Icon />` / `<Text />` when props are omitted. */
function enrichDividerChild(
  node: React.ReactNode,
  ctx: {
    resolvedAppearance: Exclude<DividerAppearance, 'auto'>;
    appearanceProp: DividerAppearance | undefined;
    attention: DividerAttention;
  },
): React.ReactNode {
  // Plain string / number → wrap in a Text component using the divider's
  // fixed text styling (Label XS Medium). Lets consumers write
  // `<Divider>Section</Divider>` and get the same look as
  // `<Divider><Text variant="label" size="XS" weight="medium" text="Section" /></Divider>`.
  if (typeof node === 'string' || typeof node === 'number') {
    return (
      <Text
        variant={DIVIDER_TEXT_VARIANT}
        size={DIVIDER_TEXT_SIZE}
        weight={DIVIDER_TEXT_WEIGHT}
        appearance={ctx.appearanceProp ?? 'auto'}
        attention={attentionToTextAttention(ctx.attention)}
        text={String(node)}
      />
    );
  }
  if (!isValidElement(node)) {
    return node;
  }
  if (node.type === Icon) {
    const p = node.props as Record<string, unknown>;
    const patch: Record<string, unknown> = {};
    if (p.appearance === undefined) patch.appearance = ctx.resolvedAppearance;
    if (p.emphasis === undefined) patch.emphasis = attentionToIconEmphasis(ctx.attention);
    if (p.size === undefined) patch.size = DIVIDER_ICON_SIZE;
    return (
      <span className={styles.slotIconWrap} data-testid="divider-child-icon">
        {cloneElement(node as ReactElement<Record<string, unknown>>, patch)}
      </span>
    );
  }
  if (node.type === Text) {
    const p = node.props as Record<string, unknown>;
    const patch: Record<string, unknown> = {};
    if (p.variant === undefined) patch.variant = DIVIDER_TEXT_VARIANT;
    if (p.size === undefined) patch.size = DIVIDER_TEXT_SIZE;
    if (p.weight === undefined) patch.weight = DIVIDER_TEXT_WEIGHT;
    if (p.appearance === undefined) patch.appearance = ctx.appearanceProp ?? 'auto';
    if (p.attention === undefined) patch.attention = attentionToTextAttention(ctx.attention);
    return cloneElement(node as ReactElement<Record<string, unknown>>, patch);
  }
  return node;
}

// Map resolved appearance to CSS module class
const appearanceClassMap: Record<Exclude<DividerAppearance, 'auto'>, string | undefined> = {
  neutral: undefined, // neutral is the default — no extra class needed
  primary: styles.appearancePrimary,
  secondary: styles.appearanceSecondary,
  sparkle: styles.appearanceSparkle,
  positive: styles.appearancePositive,
  negative: styles.appearanceNegative,
  warning: styles.appearanceWarning,
  informative: styles.appearanceInformative,
};

export function Divider({ ref, ...props }: DividerProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    orientation,
    resolvedAppearance,
    hasContent,
    children,
    contentAlign,
    roundCaps,
    dataAttrs,
    attention,
  } = useDividerState(props);

  const { className: classNameProp, style, 'data-testid': dataTestId, appearance: appearanceProp } = props;

  const appearanceClass = appearanceClassMap[resolvedAppearance];

  const childBody = (
    <SlotParentAppearanceProvider value={resolvedAppearance}>
      {enrichDividerChild(children, {
        resolvedAppearance,
        appearanceProp,
        attention,
      })}
    </SlotParentAppearanceProvider>
  );

  // Simple divider — no children, use Base UI Separator
  if (!hasContent) {
    const className = clsx(
      styles.divider,
      styles.simple,
      appearanceClass,
      { [styles.roundCaps]: roundCaps },
      classNameProp,
    );

    return (
      <BaseSeparator
        ref={ref as React.Ref<HTMLDivElement>}
        orientation={orientation}
        className={className}
        style={style}
        data-divider=""
        data-testid={dataTestId}
        {...dataAttrs}
      />
    );
  }

  // Content divider — line + children + line pattern
  const className = clsx(
    styles.divider,
    styles.withContent,
    appearanceClass,
    { [styles.roundCaps]: roundCaps },
    classNameProp,
  );

  return (
    <div
      ref={ref}
      role="separator"
      aria-orientation={orientation}
      className={className}
      style={style}
      data-divider=""
      data-testid={dataTestId}
      {...dataAttrs}
    >
      {contentAlign !== 'start' && <span className={styles.line} aria-hidden="true" />}
      <span className={styles.content}>{childBody}</span>
      {contentAlign !== 'end' && <span className={styles.line} aria-hidden="true" />}
    </div>
  );
}
