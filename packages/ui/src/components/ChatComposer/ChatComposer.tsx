/**
 * Reusable prompt-first input shared by the home landing, voice
 * playground, and future agent surfaces. Controlled — caller owns
 * `value` and handles submit. Enter submits; Shift+Enter inserts newline.
 */

'use client';

import React, { memo, useCallback, useEffect, useRef } from 'react';
import { Button } from '../Button/Button';
import styles from './ChatComposer.module.css';
import type { ChatComposerProps } from './ChatComposer.shared';

export const ChatComposer = memo(function ChatComposer({
  value,
  onChange,
  onSubmit,
  placeholder = 'How can I help you today?',
  disabled = false,
  autoFocus = false,
  leading,
  leadingInline,
  modelLabel,
  trailing,
  suggestions,
  className,
  'data-testid': dataTestId,
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Grow the textarea to fit its content up to the CSS max-height. We let
  // CSS enforce the ceiling so the scroll-after-max behaviour lives in one
  // place and works identically across consumers.
  const autoSize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    autoSize();
  }, [value, autoSize]);

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (trimmed.length === 0 || disabled) return;
    onSubmit(trimmed);
  }, [value, disabled, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  const rootClassName = className ? `${styles.root} ${className}` : styles.root;

  return (
    <div className={rootClassName} data-testid={dataTestId}>
      <div
        className={styles.inputWrap}
        data-disabled={disabled ? 'true' : undefined}
      >
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          aria-label="Chat message"
          data-testid={dataTestId ? `${dataTestId}-textarea` : undefined}
        />
        {(leading || leadingInline || modelLabel || trailing) && (
          <div className={styles.actionBar}>
            <div className={styles.leftActions}>
              {leading}
              {leadingInline}
            </div>
            <div className={styles.rightActions}>
              {modelLabel && <span className={styles.modelChip}>{modelLabel}</span>}
              {trailing}
            </div>
          </div>
        )}
      </div>

      {suggestions && suggestions.length > 0 && (
        <ul className={styles.suggestions} aria-label="Suggested prompts">
          {suggestions.map((chip) => (
            <li key={chip.id}>
              {/*
                Suggestion chips are one-shot click actions — we use the
                real <Button> with attention="low" (ghost variant) which
                is the right primitive for a fire-and-forget click. Chip
                would have been visually closer but is semantically a
                toggle, and the selected-state hack was a smell.
              */}
              <Button
                attention="low"
                size="s"
                appearance="neutral"
                start={chip.icon}
                onPress={() => {
                  if (!disabled) chip.onClick();
                }}
                disabled={disabled}
                aria-label={chip.label}
              >
                {chip.label}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});

export type { ChatComposerProps, SuggestionChip } from './ChatComposer.shared';
