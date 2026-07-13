/**
 * InputFeedback.tsx
 *
 * Contextual feedback/validation message for inputs.
 * 3 attention levels: low (text only), medium (soft tint + border), high (strong fill)
 * 4 semantic variants: negative, positive, warning, informative
 *
 * Figma: InputFeedback / `.DNA/InputFeedback` (node 3450:1388)
 */

import React from 'react';
import clsx from 'clsx';
import { Field } from '@base-ui/react/field';
import type { SemanticIconName } from '@oneui/shared';
import styles from './InputFeedback.module.css';
import { Icon } from '../../Icon/Icon';
import type { IconAppearance, IconEmphasis, IconSize } from '../../Icon/Icon.shared';
import { InputFeedbackProps, resolveFeedbackSize, type InputFeedbackVariant } from '../Input.shared';

const DEFAULT_ICONS: Record<InputFeedbackVariant, SemanticIconName> = {
  negative: 'error',
  positive: 'checkCircle',
  warning: 'warning',
  informative: 'info',
};

const VARIANT_TO_ICON_APPEARANCE: Record<InputFeedbackVariant, IconAppearance> = {
  negative: 'negative',
  positive: 'positive',
  warning: 'warning',
  informative: 'informative',
};

const FEEDBACK_TO_ICON_SIZE: Record<number, IconSize> = {
  8: '3',
  10: '4',
  12: '5',
};

const attentionClassMap: Record<string, string> = {
  low: styles.attentionLow,
  medium: styles.attentionMedium,
  high: styles.attentionHigh,
};

const variantClassMap: Record<string, string> = {
  negative: styles.variantNegative,
  positive: styles.variantPositive,
  warning: styles.variantWarning,
  informative: styles.variantInformative,
};

function resolveMessage(feedback_message: string | undefined, children: React.ReactNode): React.ReactNode {
  if (feedback_message != null && feedback_message.trim() !== '') {
    return feedback_message.trim();
  }
  return children;
}

function hasRenderableMessage(message: React.ReactNode): boolean {
  if (message == null) return false;
  if (typeof message === 'string' || typeof message === 'number') {
    return String(message).trim() !== '';
  }
  if (typeof message === 'boolean') return false;
  return true;
}

export const InputFeedback = React.forwardRef<HTMLDivElement, InputFeedbackProps>(function InputFeedback(
  {
    variant = 'negative',
    attention = 'low',
    size = 10,
    feedback_message,
    customIcon,
    children,
    className,
    style,
    role: roleProp,
    fieldErrorSlot,
    ...rest
  },
  ref,
) {
  const numericSize = resolveFeedbackSize(size);
  const role = roleProp ?? (variant === 'negative' ? 'alert' : 'status');
  const ariaLive: 'assertive' | 'polite' = role === 'alert' ? 'assertive' : 'polite';
  const message = resolveMessage(feedback_message, children);

  if (process.env.NODE_ENV !== 'production' && fieldErrorSlot && variant !== 'negative') {
    console.warn('InputFeedback: `fieldErrorSlot` only applies when variant="negative"; ignoring.');
  }
  const showFieldErrorSlot = Boolean(fieldErrorSlot && variant === 'negative');

  if (!hasRenderableMessage(message) && !showFieldErrorSlot) {
    return null;
  }

  // Native `Field.Error` only (InputField when there is no string `error` / custom `feedback`):
  // use `Field.Error` as the root so the row is omitted entirely when the field is valid.
  if (showFieldErrorSlot && !hasRenderableMessage(message)) {
    return (
      <Field.Error
        ref={ref}
        className={clsx(styles.feedback, attentionClassMap[attention], variantClassMap[variant], className)}
        style={style}
        data-oneui-input-feedback=""
        data-size={String(numericSize)}
        role={role}
        aria-live={ariaLive}
        {...rest}
      />
    );
  }

  const iconName: SemanticIconName = customIcon ?? DEFAULT_ICONS[variant];
  const iconAppearance = VARIANT_TO_ICON_APPEARANCE[variant];
  const iconEmphasis: IconEmphasis = attention === 'high' ? 'high' : 'tintedA11y';
  const iconSize = FEEDBACK_TO_ICON_SIZE[numericSize] ?? '4';

  return (
    <div
      ref={ref}
      className={clsx(
        styles.feedback,
        attentionClassMap[attention],
        variantClassMap[variant],
        className,
      )}
      style={style}
      data-oneui-input-feedback=""
      data-size={String(numericSize)}
      role={role}
      aria-live={ariaLive}
      {...rest}
    >
      <span className={styles.icon} aria-hidden="true">
        <Icon
          icon={iconName}
          size={iconSize}
          appearance={iconAppearance}
          emphasis={iconEmphasis}
          aria-hidden
        />
      </span>
      {showFieldErrorSlot ? <Field.Error className={styles.fieldErrorRoot} /> : null}
      <span className={styles.message}>{message}</span>
    </div>
  );
});

InputFeedback.displayName = 'InputFeedback';
