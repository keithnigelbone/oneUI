/**
 * Input.shared.ts
 * Shared types and hooks for the Input component family
 *
 * Component hierarchy (mirrors Figma):
 * - InputField — `Field.Root` + label stack (Field.Label / Field.Description) + **Input** (bordered control + slots) + feedback + DynamicText
 * - Input — bordered 4-slot shell + `Field.Control` (field mode) or `@base-ui/react/input` (native); standalone uses `aria-label` for a11y
 * - InputFeedback — validation/contextual message (`internals/InputFeedback.tsx`)
 * - InputDynamicText — Figma DynamicText row (`internals/InputDynamicText.tsx`)
 *
 * Architecture mirrors Button.shared.ts:
 * - F-step sizes (6/8/10/12 → XS/S/M/L)
 * - Multi-accent appearance roles (9 V4 roles + auto)
 * - 4-slot system (start/start2/end/end2)
 */

import type { AriaRole, ComponentPropsWithoutRef, CSSProperties, ReactNode, KeyboardEvent, FocusEvent } from 'react';
import type { SemanticIconName, ComponentAppearance } from '@oneui/shared';

// ============================================
// SHARED TYPES
// ============================================

/**
 * Input appearance — intentionally narrower than ComponentAppearance.
 * Brand-bg role has no CSS class wired in Input.module.css. To expand,
 * add an `.appearanceBrandBg` rule to the CSS module first, then switch
 * to `ComponentAppearance` from `@oneui/shared`.
 */
export type InputAppearance =
  | 'auto'
  | 'primary'
  | 'secondary'
  | 'neutral'
  | 'sparkle'
  | 'positive'
  | 'negative'
  | 'warning'
  | 'informative';

/**
 * Input sizes aligned with Figma spec: XS (f6), S (f8), M (f10), L (f12).
 * Uses Body role typography.
 * Legacy string aliases are still accepted but deprecated.
 */
export type InputSize =
  | 6 | 8 | 10 | 12
  | 'xs' | 's' | 'm' | 'l'
  // Legacy backward compat
  | 'small' | 'medium' | 'large';

/** Shape options */
export type InputShape = 'default' | 'pill';

/**
 * Input attention — controls fill treatment.
 * - 'medium' (default): outlined (transparent fill + stroke)
 * - 'high': filled (role-specific Subtle background, no visible stroke until focus)
 *
 * Matches Figma property `attention` on the Input component.
 */
export type InputAttention = 'medium' | 'high';

// ============================================
// INPUT FEEDBACK TYPES
// ============================================

/** Feedback semantic variants */
export type InputFeedbackVariant = 'negative' | 'positive' | 'warning' | 'informative';

/** Feedback attention levels — low (text), medium (outlined), high (filled) */
export type InputFeedbackAttention = 'low' | 'medium' | 'high';

/** Feedback sizes (S/M/L only — no XS) */
export type InputFeedbackSize = 8 | 10 | 12 | 's' | 'm' | 'l';

export type InputFeedbackProps = {
  /** Semantic variant — drives default icon and role colours (maps to `Icon` `appearance`). */
  variant?: InputFeedbackVariant;
  /** Visual attention — low (text only), medium (tint + stroke), high (filled). */
  attention?: InputFeedbackAttention;
  /** Feedback size — S/M/L (f8 / f10 / f12). */
  size?: InputFeedbackSize;
  /**
   * Figma `feedback_message` — primary string copy for the feedback row.
   * When omitted, `children` is used (backward compatible).
   */
  feedback_message?: string;
  /**
   * Optional semantic icon name — replaces the default icon for the current `variant`.
   * Uses the same vocabulary as `Icon` / `SemanticIconName`.
   */
  customIcon?: SemanticIconName;
  /** Fallback / rich content when `feedback_message` is not set. */
  children?: ReactNode;
  /**
   * Defaults: `alert` for `negative`, otherwise `status`.
   * Live region: assertive for `alert`, polite for `status` (overridable via `aria-live` on the div).
   */
  role?: AriaRole;
  /**
   * Renders Base UI `Field.Error` inside the feedback chrome for native validation messages.
   * **Only** supported with `variant="negative"` and **must** be used under `Field.Root` (e.g. `InputField`).
   */
  fieldErrorSlot?: boolean;
} & Omit<ComponentPropsWithoutRef<'div'>, 'children' | 'role'>;

// ============================================
// INPUT DYNAMIC TEXT (Figma .DNA/DynamicText S/M/L)
// ============================================

export interface InputDynamicTextProps {
  /** Leading copy (Body / Text-Medium). Shown when non-empty after trim. */
  content?: string;
  /**
   * Trailing action label — rendered with `Button` (`attention="low"`, `condensed`, size follows `size`).
   * Shown when non-empty after trim.
   */
  end?: string;
  /** Figma size: S, M, or L only (matches field label stack header tier). */
  size?: InputLabelSize;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Applied to the `content` paragraph when present. */
  id?: string;
  /** Live region for the leading copy (e.g. character count updates). */
  'aria-live'?: 'off' | 'polite' | 'assertive';
  /** Handler for the trailing `Button` (matches `Button` `onClick` — no event arg). */
  onEndClick?: () => void;
  /** Optional override for the trailing control accessible name. */
  endAriaLabel?: string;
  /** QA / e2e anchor on the root row (`data-testid`). */
  'data-testid'?: string;
}

// ============================================
// INPUT (CONTAINER) TYPES
// ============================================

export interface InputProps {
  /**
   * Render the `<input>` as `Field.Control` instead of plain `@base-ui/react/input`.
   * Set to `'field'` only when `Input` is composed inside a `Field.Root` (e.g. via `InputField`).
   * @default 'native'
   * @internal Used by InputField — standalone callers should not set this.
   */
  labelAssociation?: 'native' | 'field';

  /**
   * Accessible label for standalone usage (no visible label).
   * Maps directly to `aria-label` on the underlying `<input>`.
   * When using `InputField`, the visible `Field.Label` provides association
   * automatically — prefer that over `aria-label`.
   */
  'aria-label'?: string;

  /**
   * Error-state chrome on the bordered container (from `InputField` when invalid).
   * Standalone `Input` does not use `invalid`; use `InputField` for validation UX.
   */
  errorHighlight?: boolean;

  // --- Appearance ---
  /** Input size — f-step number or t-shirt alias (`xs` / `s` / `m` / `l`). Default: 10 (M). */
  size?: InputSize;
  /** Multi-accent appearance role. 'auto' resolves to 'primary'. */
  appearance?: InputAppearance;
  /** Shape of the input field */
  shape?: InputShape;
  /** Visual attention — 'medium' (outlined, default) or 'high' (filled neutral background). */
  attention?: InputAttention;

  // --- 4-slot system ---
  /** Leading content slot — Icon, IconButton, Avatar, Image, ChipGroup, or Text */
  start?: ReactNode;
  /** Second leading content slot — Text (prefix, currency symbol) */
  start2?: ReactNode;
  /** Trailing content slot — IconButton, Icon, Button, or Text */
  end?: ReactNode;
  /** Second trailing content slot — Text, Icon, or IconButton */
  end2?: ReactNode;

  // --- Value ---
  /** Placeholder text */
  placeholder?: string;
  /** Current value (controlled) */
  value?: string;
  /** Default value (uncontrolled) */
  defaultValue?: string;
  /** Change handler — receives the new value string */
  onChange?: (value: string) => void;

  // --- State ---
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Whether the input is read-only */
  readOnly?: boolean;
  /** Whether the control is required (native `required` on the `<input>`). */
  required?: boolean;
  /** Field name for form submission */
  name?: string;
  /** Input type (text, email, password, number, tel, url, search) */
  type?: string;

  // --- Events ---
  /** Keydown event handler */
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  /** Blur event handler */
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  /** Focus event handler */
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;

  // --- HTML ---
  /** HTML id attribute for the input element */
  id?: string;
  /** Forwarded to the native `<input>` (QA / tests). */
  'data-testid'?: string;
  /** Autocomplete attribute */
  autoComplete?: string;
  /** Autofocus attribute */
  autoFocus?: boolean;
  /** Maximum character length (native `maxLength` parity). */
  maxLength?: number;

  /**
   * Marks the native `<input>` as decorative (e.g. select trigger display).
   * Sets `aria-hidden` and `tabIndex={-1}` so the parent combobox owns a11y.
   */
  decorative?: boolean;

  // --- Styling ---
  /** Additional class name */
  className?: string;
  /** Inline styles */
  style?: CSSProperties;
}

// Keep these for backward compat — removed types
/** @deprecated No underlined variant exists. Input is always outlined. */
export type InputVariant = 'outlined';

// ============================================
// SIZE RESOLUTION
// ============================================

/** Map t-shirt aliases (and legacy names) to numeric f-step sizes */
const SIZE_ALIASES: Record<string, number> = {
  xs: 6,
  s: 8,
  m: 10,
  l: 12,
  // Legacy backward compat
  small: 8,
  medium: 10,
  large: 12,
};

/** Valid Figma-aligned numeric sizes */
const VALID_SIZES = new Set([6, 8, 10, 12]);

/**
 * Field label stack header (Figma S / M / L). Maps from Input `size` (f8 / f10 / f12).
 */
export type InputLabelSize = 's' | 'm' | 'l';

/** Resolve any InputSize value to a numeric f-step */
export function resolveSize(size: InputSize): number {
  if (typeof size === 'number') {
    if (VALID_SIZES.has(size)) return size;
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Input: size={${size}} is not valid. Using 10 (m) instead.`);
    }
    return 10;
  }
  if (typeof size === 'string') {
    const resolved = SIZE_ALIASES[size];
    if (resolved !== undefined) {
      if (process.env.NODE_ENV !== 'production' && (size === 'small' || size === 'medium' || size === 'large')) {
        const label = resolved === 8 ? 's' : resolved === 10 ? 'm' : 'l';
        console.warn(`Input: size="${size}" is deprecated. Use size="${label}" (${resolved}) instead.`);
      }
      return resolved;
    }
  }
  return 10;
}

/** Map full `InputSize` to field label stack S/M/L tier. */
export function inputSizeToLabelSize(size: InputSize): InputLabelSize {
  const n = resolveSize(size);
  if (n <= 8) return 's';
  if (n <= 10) return 'm';
  return 'l';
}

/** Resolve feedback size (no XS row) — maps container size to feedback S/M/L tier */
export function resolveFeedbackSize(size: InputFeedbackSize): 8 | 10 | 12 {
  const n = resolveSize(size as InputSize);
  if (n <= 8) return 8;
  if (n <= 10) return 10;
  return 12;
}

// ============================================
// STATE HOOK — Input (container)
// ============================================

export function useInputState(
  props: Pick<InputProps, 'size' | 'appearance' | 'disabled' | 'start' | 'end'>,
  parentAppearance: Exclude<ComponentAppearance, 'auto'> | null = null,
) {
  const isDisabled = props.disabled;

  // Resolve appearance: 'auto' or unset → 'secondary'.
  // Figma default for Input accents (focus border, focus ring, trailing
  // slot icons) is the Secondary role — see node 4918:51844. The idle
  // border + leading slot icons stay neutral via explicit CSS rules in
  // Input.module.css; focus accent and content tints follow appearance.
  const resolvedAppearance =
    props.appearance && props.appearance !== 'auto'
      ? props.appearance
      // brand-bg surfaces don't expose input-affordance tokens; fall back to
      // secondary so the field stays usable.
      : (parentAppearance && parentAppearance !== 'brand-bg' ? parentAppearance : 'secondary');

  // Resolve numeric size
  const numericSize = resolveSize(props.size ?? 10);

  const dataAttrs: Record<string, string | undefined> = {
    'data-size': String(numericSize),
  };

  return {
    isDisabled,
    resolvedAppearance,
    numericSize,
    dataAttrs,
  };
}
