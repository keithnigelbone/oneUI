/**
 * Text.tsx
 * Design-system Text component (React web).
 *
 * Resolves through OneUI's V2 role-explicit typography tokens.
 *
 * Polymorphic via `as` — **defaults to `span`** for every variant so heading
 * hierarchy stays under author control. Pass `as="h1"`, `as="h2"`, etc. for
 * page and section titles. Pass `as="code"` for inline monospace semantics.
 *
 * Surface-context-aware: appearance classes remap intermediate colour vars
 * to `--{Role}-High` etc., which the brand CSS engine remaps inside
 * `[data-surface]` blocks.
 */

'use client';

import React, { useMemo } from 'react';
import clsx from 'clsx';
import styles from './Text.module.css';
import { type TextProps, type TextAppearance, resolveTextState } from './Text.shared';

/** Map appearance to CSS module class. Neutral is default (no class). */
const appearanceClassMap: Record<Exclude<TextAppearance, 'auto' | 'neutral'>, string> = {
  primary: styles.appearancePrimary,
  secondary: styles.appearanceSecondary,
  sparkle: styles.appearanceSparkle,
  'brand-bg': styles.appearanceBrandBg,
  informative: styles.appearanceInformative,
  positive: styles.appearancePositive,
  negative: styles.appearanceNegative,
  warning: styles.appearanceWarning,
};

export const Text = React.forwardRef<HTMLElement, TextProps>(function Text(props, ref) {
  const {
    as,
    href,
    target,
    rel,
    text,
    children,
    link,
    maxLines,
    className,
    style,
    lang,
    id,
    tabIndex,
    'aria-label': ariaLabel,
    'aria-hidden': ariaHidden,
  } = props;

  const { resolvedAppearance, dataAttrs } = resolveTextState(props);

  const Component = (as ?? 'span') as React.ElementType;

  const appearanceClass =
    resolvedAppearance === 'neutral' ? undefined : appearanceClassMap[resolvedAppearance];

  const rootClassName = clsx(styles.root, appearanceClass, className);

  const mergedStyle: React.CSSProperties | undefined = useMemo(() => {
    if (maxLines === undefined && !style) return undefined;
    const out: React.CSSProperties & Record<string, string | number> = { ...(style ?? {}) };
    if (maxLines !== undefined && maxLines > 0) {
      out['--_text-max-lines'] = String(Math.floor(maxLines));
    }
    return out;
  }, [maxLines, style]);

  const setRefs = (node: HTMLElement | null) => {
    if (typeof ref === 'function') ref(node);
    else if (ref && typeof ref === 'object') {
      (ref as React.MutableRefObject<HTMLElement | null>).current = node;
    }
  };

  const content = children ?? text ?? null;

  const maxLinesAttr =
    maxLines !== undefined && maxLines > 0 ? { 'data-max-lines': String(maxLines) } : {};

  const anchorProps =
    as === 'a' && href !== undefined
      ? { href, ...(target !== undefined ? { target } : {}), ...(rel !== undefined ? { rel } : {}) }
      : {};

  return (
    <Component
      ref={setRefs}
      className={rootClassName}
      style={mergedStyle}
      lang={lang}
      id={id}
      tabIndex={tabIndex}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
      {...dataAttrs}
      {...maxLinesAttr}
      {...anchorProps}
    >
      {content}
      {link != null && <span className={styles.linkSlot}>{link}</span>}
    </Component>
  );
});

Text.displayName = 'Text';
