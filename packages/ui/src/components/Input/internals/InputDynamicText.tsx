/**
 * InputDynamicText.tsx
 *
 * Figma: .DNA/DynamicText (S / M / L) — helper row with optional leading copy and
 * optional trailing action (4343:14293–4343:14295). Trailing action uses `Button`
 * (`attention="low"`, `condensed`, size aligned to this row).
 */

'use client';

import React from 'react';
import clsx from 'clsx';
import styles from './InputDynamicText.module.css';
import type { InputDynamicTextProps, InputLabelSize } from '../Input.shared';
import { Button } from '../../Button/Button';
import type { ButtonSize } from '../../Button/Button.shared';

function isNonEmptyString(value: string | undefined): value is string {
  return value != null && value.trim() !== '';
}

const LABEL_TO_BUTTON_SIZE: Record<InputLabelSize, ButtonSize> = {
  s: 's',
  m: 'm',
  l: 'l',
};

export const InputDynamicText = React.forwardRef<HTMLDivElement, InputDynamicTextProps>(
  function InputDynamicText(
    {
      content,
      end,
      size = 'm',
      disabled,
      className,
      style,
      id,
      'aria-live': ariaLive,
      onEndClick,
      endAriaLabel,
      'data-testid': dataTestId,
    },
    ref,
  ) {
    const hasContent = isNonEmptyString(content);
    const hasEnd = isNonEmptyString(end);

    if (!hasContent && !hasEnd) {
      return null;
    }

    const hasLeft = hasContent;
    const hasRight = hasEnd;
    const buttonSize = LABEL_TO_BUTTON_SIZE[size];

    return (
      <div
        ref={ref}
        className={clsx(styles.root, !hasLeft && hasRight && styles.rootTrailingOnly, className)}
        style={style}
        data-size={size}
        data-disabled={disabled || undefined}
        {...(dataTestId ? { 'data-testid': dataTestId } : {})}
      >
        {hasContent ? (
          <p id={id} className={styles.content} aria-live={ariaLive}>
            {content}
          </p>
        ) : null}
        {hasEnd ? (
          <div className={styles.end}>
            <Button
              type="button"
              attention="low"
              condensed
              size={buttonSize}
              disabled={disabled}
              onClick={onEndClick}
              aria-label={endAriaLabel}
            >
              {end}
            </Button>
          </div>
        ) : null}
      </div>
    );
  },
);

InputDynamicText.displayName = 'InputDynamicText';
