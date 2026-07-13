/**
 * ChatComposer.shared.ts
 *
 * Shared types for the reusable chat composer — the prompt-first input the
 * home landing, the voice playground, and any future agent surface share.
 *
 * Composition over configuration: the composer owns the textarea + action
 * row layout, and consumers pass slots for the attach/mic/send buttons and
 * a flat list of suggestion chips rendered below the input.
 */

import type { ReactNode } from 'react';

export interface SuggestionChip {
  /** Stable key for React. */
  id: string;
  /** Display label (e.g. "Build an app"). */
  label: string;
  /** Optional leading icon. */
  icon?: ReactNode;
  /** Click handler — caller decides whether to prefill, navigate, or both. */
  onClick: () => void;
}

export interface ChatComposerProps {
  /** Controlled textarea value. */
  value: string;
  /** Fired on every keystroke. */
  onChange: (next: string) => void;
  /** Fired when the user submits (Enter without Shift, or send button). */
  onSubmit: (value: string) => void;
  /** Placeholder for the textarea. */
  placeholder?: string;
  /** Disables the textarea and the send button. Use for streaming states. */
  disabled?: boolean;
  /** Autofocus on mount. */
  autoFocus?: boolean;
  /** Minimum rows — start compact, grow on input. Default 1. */
  minRows?: number;
  /** Max rows before the textarea starts scrolling internally. Default 6. */
  maxRows?: number;
  /**
   * Leading slot — rendered left-most in the action bar below the textarea.
   * Typical content: a "+" attach button.
   */
  leading?: ReactNode;
  /**
   * Inline leading content — rendered immediately left of the model chip.
   * Typical content: a mode picker or attachment chip.
   */
  leadingInline?: ReactNode;
  /**
   * Optional model chip text (display-only). Example: "Opus 4.6".
   * When omitted, nothing is rendered — consumers that don't want a model
   * picker simply pass nothing.
   */
  modelLabel?: string;
  /**
   * Trailing slot — rendered right-most in the action bar (after the model
   * chip). Typical content: mic + send buttons.
   */
  trailing?: ReactNode;
  /**
   * Optional suggestion chips rendered as a horizontal list below the input.
   * When empty or undefined, nothing is rendered.
   */
  suggestions?: SuggestionChip[];
  /** Additional className for the outer wrapper. */
  className?: string;
  /** Test id for the outer wrapper. */
  'data-testid'?: string;
}
